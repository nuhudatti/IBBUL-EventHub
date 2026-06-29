export type ApiResult<T> = { success: true; data: T; message?: string } | { success: false; error: { code: string; message: string; details?: unknown } };

export type ApiRequestError = Error & { code: string; status: number; details?: unknown };

async function parseApiResponse<T>(res: Response): Promise<ApiResult<T>> {
  const text = await res.text();
  if (!text.trim()) {
    throw new Error(`Server returned an empty response (${res.status}). Restart the dev server after database updates.`);
  }
  try {
    return JSON.parse(text) as ApiResult<T>;
  } catch {
    throw new Error(`Server error (${res.status}). The API did not return JSON.`);
  }
}

/**
 * Fetches a JSON response and validates the NEXUS `{ success, data }` contract.
 */
export async function requestApi<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include"
  });
  const result = await parseApiResponse<T>(res);
  if (!result.success) {
    const message = result.error.message ?? "Request failed";
    const err = new Error(message) as ApiRequestError;
    err.code = result.error.code;
    err.status = res.status;
    err.details = result.error.details;
    throw err;
  }
  return result.data;
}

/** POST/PATCH helpers that preserve API success messages (e.g. conflict warnings). */
export async function requestApiWithMessage<T>(url: string, init?: RequestInit): Promise<{ data: T; message?: string }> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    credentials: "include"
  });
  const result = await parseApiResponse<T>(res);
  if (!result.success) {
    const message = result.error.message ?? "Request failed";
    const err = new Error(message) as ApiRequestError;
    err.code = result.error.code;
    err.status = res.status;
    err.details = result.error.details;
    throw err;
  }
  if (result.message !== undefined) {
    return { data: result.data, message: result.message };
  }
  return { data: result.data };
}
