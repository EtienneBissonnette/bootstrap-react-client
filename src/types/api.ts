import { User } from "./user";

export interface ApiError {
  message: string;
  statusCode?: number;
}

// Auth API types
export interface LoginCredentials {
  email: string;
  password: string;
}
export interface SignUpCredentials extends LoginCredentials {
  name?: string;
}
export interface AuthResponse {
  user: User;
}
