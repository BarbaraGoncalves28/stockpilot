export const API_URL = "http://127.0.0.1:8000";

type ApiOptions = RequestInit & {
  accessToken?: string | null;
};

export async function apiFetch(
  path: string,
  options: ApiOptions = {},
) {
  const {
    accessToken,
    headers,
    ...fetchOptions
  } = options;

  const requestHeaders = new Headers(headers);

  requestHeaders.set("Content-Type", "application/json");

  if (accessToken) {
    requestHeaders.set(
      "Authorization",
      `Bearer ${accessToken}`,
    );
  }

  return fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers: requestHeaders,
  });
}