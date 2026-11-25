"use client";

import type { ApiResponse } from "@/types";

// Browser calls stay on this site's own domain: next.config.ts proxies /api/* to the backend.
// That keeps the session cookie first-party, so browsers that block third-party cookies still work.
const API_URL = "";

export type ClientResult<T> =
  | { ok: true; data: T; meta?: ApiResponse["meta"] }
  | { ok: false; status: number; error: string; fieldErrors: Record<string, string> };

// Browser-side calls to the backend that carry the signed-in user's session cookie
export async function clientApi<T>(path: string, init: { method?: string; body?: unknown; signal?: AbortSignal } = {}): Promise<ClientResult<T>> {
  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: init.method ?? "GET",
      credentials: "include",
      headers: init.body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
      signal: init.signal,
      cache: "no-store",
    });
    const json = (await res.json().catch(() => null)) as ApiResponse<T> | null;
    if (res.ok && json?.success) return { ok: true, data: json.data as T, meta: json.meta };
    return {
      ok: false,
      status: res.status,
      error: json?.error ?? (res.status === 401 ? "Please sign in again." : "Something went wrong. Please try again."),
      fieldErrors: json?.fieldErrors ?? {},
    };
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") throw err;
    return { ok: false, status: 0, error: "We can't reach the server. Check your connection and try again.", fieldErrors: {} };
  }
}
