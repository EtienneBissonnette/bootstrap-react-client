import { ApiError } from "@/types/api";
import { isApiError } from "@/types/guards/api";
import authAPI from "../authAPI";
import { AUTH_API_ENDPOINTS } from "../endpoints";

/**
 * Confirms the password reset using a valid token and sets the new password.
 * This is the second and final step in a typical two-step password reset flow.
 *
 * It uses the generic `authAPI` wrapper to perform a POST request
 * to the confirm reset endpoint with the token and new password in the body.
 *
 * On a successful API response (2xx status, typically 204 No Content or 200 OK),
 * indicating the password has been successfully updated and the token invalidated,
 * the promise resolves to `void` as no response body is expected or needed.
 *
 * On a failed API response (non-2xx status) or network error, it catches
 * the error thrown by `authAPI`, transforms it into a standardized `ApiError`
 * object with a specific user-facing message for confirm reset failures,
 * and re-throws this standardized error.
 *
 * This function does NOT handle UI-specific state updates or global error state.
 * That responsibility belongs to the caller (e.g., a UI component). The caller
 * is responsible for extracting the token from the URL and providing the new password.
 * Specific backend validation errors (e.g., invalid token, expired token, weak password)
 * should be included in the error response from the API and potentially processed
 * by the caller based on the `ApiError` structure.
 *
 * @param token - The unique, time-limited token received from the password reset email link.
 * @param newPassword - The user's new password.
 * @returns A Promise that resolves to `void` on successful password reset confirmation.
 * @throws {ApiError} Throws a standardized `ApiError` object on failure.
 *                    This includes cases where the API returns a non-2xx status
 *                    (e.g., 400 for invalid token/password, 404 if token not found)
 *                    or a network error occurs.
 *                    The `message` property is a fixed user-facing string for confirm failures.
 *                    The `statusCode` property will be included if available from the original error.
 */
const confirmResetPasswordService = async (
  token: string,
  newPassword: string
): Promise<void> => {
  try {
    await authAPI<void>(AUTH_API_ENDPOINTS.CONFIRM_RESET, {
      method: "POST",
      body: JSON.stringify({ token, newPassword }),
    });
  } catch (err: unknown) {
    let status: number | undefined = undefined;
    let msg: string | undefined = undefined;
    if (isApiError(err)) {
      status = err.statusCode;
      msg = err.message;
    }

    const apiErrorResponse: ApiError = {
      message: msg || "Failed to reset user password.",
      statusCode: status,
    };

    throw apiErrorResponse;
  }
};

export default confirmResetPasswordService;
