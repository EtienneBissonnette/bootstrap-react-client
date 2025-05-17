/* eslint-disable @typescript-eslint/no-explicit-any */
import { http, HttpResponse } from "msw";
import { AUTH_API_ENDPOINTS } from "@/api/auth/endpoints";
import { User } from "@/types/user";
import { ApiError } from "@/types/api";
import { fullUrl } from "./utils";

export const MOCK_USER: User = {
  id: "user-123",
  name: "Mock User",
  email: "test@example.com",
};

export const MOCK_ERROR: ApiError = {
  message: "Invalid Credentials",
  statusCode: 401,
};

export const authHandlers = [
  // --- /api/me ---
  // Success case (default, can be overridden in tests)
  http.get(fullUrl(AUTH_API_ENDPOINTS.ME), () => {
    console.log(
      `MSW: Intercepted GET ${fullUrl(AUTH_API_ENDPOINTS.ME)} (Success)`
    );
    return HttpResponse.json(MOCK_USER);
  }),

  // --- /auth/login ---
  http.post(fullUrl(AUTH_API_ENDPOINTS.LOGIN), async ({ request }) => {
    console.log(`MSW: Intercepted POST ${fullUrl(AUTH_API_ENDPOINTS.LOGIN)}`);
    const body = (await request.json()) as any;
    if (body.email === MOCK_USER.email && body.password === "password") {
      return HttpResponse.json(MOCK_USER);
    } else {
      return HttpResponse.json(MOCK_ERROR, { status: MOCK_ERROR.statusCode });
    }
  }),

  // --- /auth/register ---
  http.post(fullUrl(AUTH_API_ENDPOINTS.REGISTER), async ({ request }) => {
    console.log(
      `MSW: Intercepted POST ${fullUrl(AUTH_API_ENDPOINTS.REGISTER)}`
    );
    const body = (await request.json()) as any;
    // Simulate successful registration
    const newUser = {
      id: "user-456",
      name: body.name || "New Mock User",
      email: body.email,
    };
    return HttpResponse.json(newUser, { status: 201 });
    // TODO: Add failure simulation (e.g., email exists -> 409 Conflict) if needed
  }),

  // --- /auth/logout ---
  http.post(fullUrl(AUTH_API_ENDPOINTS.LOGOUT), () => {
    console.log(`MSW: Intercepted POST ${fullUrl(AUTH_API_ENDPOINTS.LOGOUT)}`);
    return new HttpResponse(null, { status: 204 }); // No content success
    // TODO: Add failure simulation if needed
  }),

  // --- /auth/request-reset ---
  http.post(fullUrl(AUTH_API_ENDPOINTS.REQUEST_RESET), () => {
    console.log(
      `MSW: Intercepted POST ${fullUrl(AUTH_API_ENDPOINTS.REQUEST_RESET)}`
    );
    return new HttpResponse(null, { status: 200 }); // OK success
    // TODO: Add failure simulation (e.g., email not found -> 404) if needed
  }),

  // --- /auth/confirm-reset ---
  http.post(fullUrl(AUTH_API_ENDPOINTS.CONFIRM_RESET), async ({ request }) => {
    console.log(
      `MSW: Intercepted POST ${fullUrl(AUTH_API_ENDPOINTS.CONFIRM_RESET)}`
    );
    const body = (await request.json()) as any;
    if (body.token === "valid-token" && body.newPassword) {
      return new HttpResponse(null, { status: 200 }); // OK success
    } else {
      return HttpResponse.json(
        { message: "Invalid or expired token" },
        { status: 400 }
      );
    }
  }),
];
