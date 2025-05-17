import { CONTACT_API_ENDPOINT } from "@/api/contact/endpoints";
import { ApiError } from "@/types/api";
import { ContactFormData } from "@/components/contact/contact-form";
import { isApiError } from "@/types/guards/api";
import contactAPI from "../contactAPI";

/**
 * Submits contact form data to the backend API.
 *
 * It uses the `contactAPI` wrapper to perform a POST request to the
 * contact submission endpoint with the form data in the body.
 *
 * On a successful API response (2xx status, typically 204 No Content or 200 OK),
 * the `contactAPI` wrapper will resolve to `undefined` since a body is not expected.
 * This service function then resolves to `void`.
 *
 * On a failed API response (non-2xx status) or network error, it catches
 * the standardized `ApiError` thrown by `contactAPI` and re-throws it directly.
 * It catches `unknown` for safety, but primarily expects `ApiError`.
 *
 * @param data - The contact form data to submit.
 * @returns A Promise that resolves to `void` on successful submission.
 * @throws {ApiError} Throws the `ApiError` object thrown by the `contactAPI` wrapper on failure.
 *                    This `ApiError` will contain details from the backend error response
 *                    or a generic message for network issues.
 */

async function submitContactService(data: ContactFormData): Promise<void> {
  const requestOptions: RequestInit = {
    method: "POST",
    body: JSON.stringify(data),
  };

  try {
    await contactAPI<void>(CONTACT_API_ENDPOINT, requestOptions);
  } catch (err: unknown) {
    let status: number | undefined = undefined;
    if (isApiError(err)) {
      status = err.statusCode;
    }

    const apiErrorResponse: ApiError = {
      message: "Failed to send contact email. Please try again.",
      statusCode: status,
    };

    throw apiErrorResponse;
  }
}

export default submitContactService;
