import { API_BASE_URL } from "@/api";
import { ApiError } from "@/types/api";
import { isApiError } from "@/types/guards/api";

/**
 * A wrapper around the standard `fetch` API specifically for making requests
 * to contact-related backend endpoints. It automatically handles
 * setting common headers, parsing JSON responses,
 * and standardizing error handling.
 *
 * @template T - The expected type of the JSON response body on a 2xx successful response.
 *
 * @param {string} endpoint - The specific API endpoint path (e.g., '/contact').
 *                          This path is appended to the base API URL (`API_BASE_URL`).
 *
 * @param {RequestInit} [options={}] - Optional standard `RequestInit` options
 *                                   to configure the fetch request.
 *                                   - `method`: Defaults to GET, can be overridden (e.g., POST, DELETE).
 *                                   - `body`: Should be a string (JSON.stringify) for POST/PUT requests.
 *                                   - `headers`: Default headers (`Content-Type: application/json`,
 *                                     `Accept: application/json`) are applied but can be overridden.
 *                                   - Other `RequestInit` properties like `signal`, `mode`, credentials, etc.
 *                                     can be included.
 *
 * @returns {Promise<T>} A Promise that resolves with the parsed JSON
 *                       response body of type `T` on successful requests (status 2xx).
 *                       Assumes a JSON body is always present on 2xx.
 *
 * @throws {ApiError} Throws a structured `ApiError` object on failure.
 *                     This includes:
 *                     - Non-2xx HTTP responses from the API (e.g., 400, 404, 500).
 *                       The `ApiError` will contain parsed JSON error details from the
 *                       backend response body if available, otherwise a generic message.
 *                       The `statusCode` property will match the HTTP status code.
 *                     - Network errors or other unexpected issues during the fetch request.
 *                       These will be caught and transformed into a generic `ApiError`.
 */

async function contactAPI<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T | undefined> {
  const url = `${API_BASE_URL}${endpoint}`;

  const requestOptions: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    ...options,
  };

  try {
    const response = await fetch(url, requestOptions);

    // --- Handle Non-OK Responses (Errors) ---
    if (!response.ok) {
      let errorData: ApiError;
      try {
        // Try to parse error response from backend
        errorData = await response.json();
        if (!errorData.message)
          errorData.message =
            response.statusText || "An unknown error occurred";
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

export default contactAPI;
