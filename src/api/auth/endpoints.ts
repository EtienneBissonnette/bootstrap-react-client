import { API_BASE_URL } from "@/api";

export const AUTH_API_ENDPOINTS = {
  // OAuth Initiation (Frontend just navigates, so full URL needed)
  GOOGLE_LOGIN: `${API_BASE_URL}/auth/google/login`,
  MICROSOFT_LOGIN: `${API_BASE_URL}/auth/microsoft/login`,
  FACEBOOK_LOGIN: `${API_BASE_URL}/auth/facebook/login`,

  // API calls (relative paths for authAPI)
  ME: "/me",
  REGISTER: "/auth/register",
  LOGIN: "/auth/login",
  LOGOUT: "/auth/logout",
  REQUEST_RESET: "/auth/request-reset",
  CONFIRM_RESET: "/auth/confirm-reset",
};
