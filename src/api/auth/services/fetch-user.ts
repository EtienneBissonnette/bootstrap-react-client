import { ApiError, AuthResponse } from "@/types/api";
import { isApiError } from "@/types/guards/api";
import { User } from "@/types/user";
import authAPI from "../authAPI";
import { AUTH_API_ENDPOINTS } from "../endpoints";

/**
 * Fetches the currently authenticated user's data from the backend API.
 *
 * It uses the generic `authAPI` wrapper to perform the fetch request to the `/me` endpoint.
 * On a successful API response (2xx status) that returns user data, it processes the response
 * and returns an `AuthResponse` object.
 *
 * It explicitly handles the case where the API call succeeds but returns no data
 * (e.g., a 204 No Content response), which is considered an unexpected scenario for
 * the `/me` endpoint and results in an error being thrown.
 *
 * On a failed API response (non-2xx status) or network error, it catches
 * the error thrown by `authAPI` (or the explicit error for no data), transforms
 * it into a standardized `ApiError` object with a specific user-facing message
 * for fetch user failures, and re-throws this standardized error.
 *
 * @returns A Promise that resolves with the `AuthResponse` object containing the user data on successful fetch.
 * @throws {ApiError} Throws a standardized `ApiError` object on failure.
 *                    This includes cases where the API returns a non-2xx status,
 *                    a network error occurs, or the successful response unexpectedly contains no user data.
 *                    The `message` property is a fixed user-facing string for fetch user failures.
 *                    The `statusCode` property will be included if available from the original error.
 */

const fetchUserService = async (): Promise<AuthResponse> => {
  try {
    const data: User | undefined = await authAPI<User>(AUTH_API_ENDPOINTS.ME);

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

    const apiErrorResponse: ApiError = {
      message: "Failed to fetch user data.",
      statusCode: status,
    };

    throw apiErrorResponse;
  }
};

export default fetchUserService;
