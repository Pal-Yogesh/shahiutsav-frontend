import type { ApiResponse } from "@/types";

// Server-side calls (Server Components) go straight to the backend
const API_URL = (process.env.API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

type FetchOptions = {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  cache?: RequestCache;
  next?: NextFetchRequestConfig;
};

export async function apiFetch<T>(
  path: string,
  options: FetchOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, ...rest } = options;

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method,
      headers: { "Content-Type": "application/json", ...headers },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });
    return (await res.json()) as ApiResponse<T>;
  } catch {
    // Backend unreachable: let sections render their empty state instead of crashing the page
    return { success: false, error: "Service unavailable" };
  }
}

export function apiGet<T>(path: string, revalidate?: number) {
  return apiFetch<T>(path, {
    next: revalidate !== undefined ? { revalidate } : undefined,
  });
}
