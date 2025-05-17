import { ApiError } from "@/types/api";
import { isApiError } from "@/types/guards/api";
import authAPI from "../authAPI";
import { AUTH_API_ENDPOINTS } from "../endpoints";

/**
 * Initiates the user sign-out process by calling the backend API's logout endpoint.
 * This typically invalidates the user's session or token on the server.
 *
 * It uses the generic `authAPI` wrapper to perform the fetch request.
 * On a successful API response (2xx status, typically 204 No Content or 200 OK),
 * the promise resolves to `void` as no response body is expected or needed.
 *
 * On a failed API response (non-2xx status) or network error, it catches
 * the error thrown by `authAPI`, transforms it into a standardized `ApiError`
 * object with a specific user-facing message for sign-out failures, and re-throws
 * this standardized error.
 *
 *
 * @returns A Promise that resolves to `void` on successful sign-out.
 * @throws {ApiError} Throws a standardized `ApiError` object on failure.
 *                    This includes cases where the API returns a non-2xx status
 *                    or a network error occurs.
 *                    The `message` property is a fixed user-facing string for sign-out.
 *                    The `statusCode` property will be included if available from the original error.
 */

const signOutService = async (): Promise<void> => {
  try {
    await authAPI<void>(AUTH_API_ENDPOINTS.LOGOUT, {
      method: "POST",
    });
  } catch (err: unknown) {
    let status: number | undefined = undefined;
    if (isApiError(err)) {
      status = err.statusCode;
    }

    const apiErrorResponse: ApiError = {
      message: "Failed to sign out user.",
      statusCode: status,
    };

    throw apiErrorResponse;
  }
};

export default signOutService;
