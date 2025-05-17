import { SignUpCredentials, AuthResponse, ApiError } from "@/types/api";
import { isApiError } from "@/types/guards/api";
import { User } from "@/types/user";
import authAPI from "../authAPI";
import { AUTH_API_ENDPOINTS } from "../endpoints";

/**
 * Initiates the user sign-up process by calling the backend API.
 *
 * It uses the generic `authAPI` wrapper to perform the fetch request.
 * On a successful API response (2xx status), it processes the response
 * and returns an `AuthResponse` object.
 * On a failed API response (non-2xx status) or network error, it catches
 * the error thrown by `authAPI`, transforms it into a standardized `ApiError`
 * object with a specific user-facing message for sign-up failures, and re-throws
 * this standardized error.
 *
 *
 * @param credentials - The user's sign-up credentials (email, password, and optional name).
 * @returns A Promise that resolves with the `AuthResponse` object containing the newly created user data on successful sign-up.
 * @throws {ApiError} Throws a standardized `ApiError` object on failure.
 *                    The `message` property is a fixed user-facing string for sign-up.
 *                    The `statusCode` property will be included if available from the original error.
 */

const signUpService = async (
  credentials: SignUpCredentials
): Promise<AuthResponse> => {
  try {
    const data: User | undefined = await authAPI<User>(
      AUTH_API_ENDPOINTS.REGISTER,
      {
        method: "POST",
        body: JSON.stringify(credentials),
      }
    );

    if (data === undefined) {
      throw Error();
    }

    const response: AuthResponse = { user: data };
    return response;
  } catch (err: unknown) {
    let status: number | undefined = undefined;
    if (isApiError(err)) {
      status = err.statusCode;
    }

    const apiError: ApiError = {
      message: "Failed to sign up. Please try again.",
      statusCode: status,
    };

    throw apiError;
  }
};

export default signUpService;
