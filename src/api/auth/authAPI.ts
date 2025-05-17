import { API_BASE_URL } from "@/api";
import { ApiError } from "@/types/api";
import { isApiError } from "@/types/guards/api";

/**
 * A wrapper around the standard `fetch` API specifically for making requests
 * to authentication-related backend endpoints. It automatically handles
 * setting common headers, including credentials, parsing JSON responses,
 * and standardizing error handling.
 *
 * @template T - The expected type of the successful JSON response body.
 *                 If the endpoint returns 204 No Content or an empty body
 *                 on success, the promise will resolve to `void`.
 *
 * @param {string} endpoint - The specific authentication API endpoint path
 *                          (e.g., '/login', '/me', '/logout'). This path
 *                          is appended to the base API URL (`API_BASE_URL`).
 *
 * @param {RequestInit} [options={}] - Optional standard `RequestInit` options
 *                                   to configure the fetch request.
 *                                   - `method`: Defaults to GET, can be overridden (e.g., POST, DELETE).
 *                                   - `body`: Should be a string (JSON.stringify) for POST/PUT requests.
 *                                   - `headers`: Default headers (`Content-Type: application/json`,
 *                                     `Accept: application/json`) are applied but can be overridden
 *                                     by providing `headers` in this options object.
 *                                   - `credentials`: Always set to `'include'`. This ensures
 *                                     cookies (like session cookies) are sent with cross-origin requests.
 *                                   - Other `RequestInit` properties like `signal`, `mode`, etc.,
 *                                     can be included.
 *
 * @returns {Promise<T | undefined>} A Promise that resolves with the parsed JSON
 *                              response body of type `T` on successful requests
 *                              with a non-empty body (status 2xx, not 204),
 *                              or resolves with `undefined` on successful requests
 *                              with no body (status 204 or empty 2xx).
 *                              The promise rejects with an `ApiError` on failure.
 *
 * @throws {ApiError} Throws a structured `ApiError` object if the fetch request fails.
 *                     This includes:
 *                     - Non-2xx HTTP responses from the API (e.g., 400, 401, 403, 404, 500).
 *                       The `ApiError` will contain parsed JSON error details from the
 *                       backend response body if available, otherwise a generic message.
 *                       The `statusCode` property will match the HTTP status code.
 *
 * @remarks
 * - Automatically sets `Content-Type: application/json` and `Accept: application/json` headers.
 * - Explicitly sets `credentials: 'include'` to handle cookie-based authentication.
 * - Automatically parses the response body as JSON unless the status is 204 No Content
 *   or the body is explicitly empty (`Content-Length: 0`).
 * - Provides consistent `ApiError` structure for all error conditions.
 */

async function authAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | undefined> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    credentials: "include",
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    // Handle case when response has an error
    if (!response.ok) {
      let errorData: ApiError;
      try {
        // Try to parse error response from backend
        errorData = await response.json();
        if (!errorData.message) {
          errorData.message =
            response.statusText || "An unknown error occurred";
        }
      } catch {
        // If parsing fails, create a generic error
        errorData = {
          message: response.statusText || "An unknown error occurred",
          statusCode: response.status,
        };
      }
      throw errorData;
    }

    // Handle cases where the response might be empty
    if (
      response.status === 204 ||
      response.headers.get("Content-Length") === "0"
    ) {
      return undefined;
    }

    const data: T = await response.json();
    return data;
  } catch (error: unknown) {
    if (isApiError(error)) {
      throw error;
    } else {
      throw { message: "Network error or unexpected issue", error } as ApiError;
    }
  }
}

export default authAPI;
