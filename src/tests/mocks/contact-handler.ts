import { http, HttpResponse } from "msw";
import { CONTACT_API_ENDPOINT } from "@/api/contact/endpoints";
import { fullUrl } from "./utils";
import { vi } from "vitest";

// --- Contact Form Handler ---

// Include a spy to access request bodies from default handler
export const contactHandlerSpy = vi.fn();

// Default: Success case (200 OK, no body expected by submitContactForm)
export const contactHandlers = [
  http.post(fullUrl(CONTACT_API_ENDPOINT), async (context) => {
    contactHandlerSpy(context);
    // Simulate a slight delay to make the loading state visible in tests
    await new Promise((resolve) => setTimeout(resolve, 100));
    return new HttpResponse(null, {
      status: 200,
      headers: {
        "Content-Length": "0",
      },
    });
  }),
];
