import { ApiError } from "@/types/api";
import { isApiError } from "@/types/guards/api";
import authAPI from "../authAPI";
import { AUTH_API_ENDPOINTS } from "../endpoints";

/**
 * Requests a password reset email to be sent to the provided email address.
 * This is the first step in a typical two-step password reset flow.
 *
 * It uses the generic `authAPI` wrapper to perform a POST request
 * to the request reset endpoint with the user's email in the body.
 *
 * On a successful API response (2xx status, typically 204 No Content or 200 OK),
 * indicating the email has been successfully queued or sent, the promise resolves to `void`.
 *
 * On a failed API response (non-2xx status) or network error, it catches
 * the error thrown by `authAPI`, transforms it into a standardized `ApiError`
 * object with a specific user-facing message for reset password request failures,
 * and re-throws this standardized error.
 *
 * @param email - The email address for which the password reset is requested.
 * @returns A Promise that resolves to `void` on successful request.
 * @throws {ApiError} Throws a standardized `ApiError` object on failure.
 *                    This includes cases where the API returns a non-2xx status
 *                    (e.g., 404 if email not found) or a network error occurs.
 *                    The `message` property is a fixed user-facing string for request failures.
 *                    The `statusCode` property will be included if available from the original error.
 */

const resetPasswordService = async (email: string): Promise<void> => {
  try {
    await authAPI<void>(AUTH_API_ENDPOINTS.REQUEST_RESET, {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  } catch (err: unknown) {
    let status: number | undefined = undefined;
    if (isApiError(err)) {
      status = err.statusCode;
    }

    const apiErrorResponse: ApiError = {
      message: "Failed to send email for reset password.",
      statusCode: status,
    };

    throw apiErrorResponse;
  }
};

export default resetPasswordService;
