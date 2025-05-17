import { ApiError, AuthResponse, LoginCredentials } from "@/types/api";
import { isApiError } from "@/types/guards/api";
import { User } from "@/types/user";
import authAPI from "../authAPI";
import { AUTH_API_ENDPOINTS } from "../endpoints";

/**
 * Initiates the user sign-in process by calling the backend API.
 *
 * It uses the generic `authAPI` wrapper to perform the fetch request.
 * On a successful API response (2xx status), it processes the response
 * and returns an `AuthResponse` object.
 * On a failed API response (non-2xx status) or network error, it catches
 * the error thrown by `authAPI`, transforms it into a standardized `ApiError`
 * object with a specific user-facing message for sign-in failures, and re-throws
 * this standardized error.
 *
 *
 * @param credentials - The user's login credentials (email and password).
 * @returns A Promise that resolves with the `AuthResponse` object containing the user data on successful sign-in.
 * @throws {ApiError} Throws a standardized `ApiError` object on failure.
 *                    The `message` property is a fixed user-facing string for sign-in.
 *                    The `statusCode` property will be included if available from the original error.
 */

const signInService = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  try {
    const data: User | undefined = await authAPI<User>(AUTH_API_ENDPOINTS.LOGIN, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    if (data === undefined){
      throw Error()
    }

    const response: AuthResponse = { user: data };
    return response;
  } catch (err: unknown) {
    let status: number | undefined = undefined;
    if (isApiError(err)) {
      status = err.statusCode;
    }

    const apiErrorResponse: ApiError = {
      message: "Failed to sign in. Please try again.",
      statusCode: status,
    };

    throw apiErrorResponse;
  }
};

export default signInService;
