/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-refresh/only-export-components */
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AUTH_API_ENDPOINTS } from "@/api/auth/endpoints";
import { User } from "@/types/user";
import {
  ApiError,
  AuthResponse,
  LoginCredentials,
  SignUpCredentials,
} from "@/types/api";
import { isApiError } from "@/types/guards/api";
import signInService from "@/api/auth/services/signin";
import signUpService from "@/api/auth/services/signup";
import fetchUserService from "@/api/auth/services/fetch-user";
import signOutService from "@/api/auth/services/signout";
import resetPasswordService from "@/api/auth/services/reset-password";
import confirmResetPasswordService from "@/api/auth/services/confirm-reset";

interface AuthContextType {
  currentUser: User | null;
  loadingCurrentUser: boolean;
  error: string | null;
  clearError: () => void;
  fetchCurrentUser: () => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<User | null>;
  signIn: (credentials: LoginCredentials) => Promise<User | null>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => void;
  signInWithMicrosoft: () => void;
  signInWithFacebook: () => void;
  resetPassword: (email: string) => Promise<void>;
  confirmReset: (token: string, newPassword: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loadingCurrentUser, setLoadingCurrentUser] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Auth Helper Functions ---

  const clearError = useCallback(() => setError(null), []);

  const handleAuthResponse = (data: AuthResponse | null) => {
    if (data?.user) {
      setCurrentUser(data.user);
      setError(null);
      return data.user;
    }
    setCurrentUser(null);
    return null;
  };

  // Used to set global errors if used and potentially also coud be used for logging if necessary.
  const handleAuthError = (err: unknown) => {
    const message =
      (err as ApiError)?.message || "An unexpected error occurred.";
    setError(message);
    setCurrentUser(null);
    return null;
  };

  // Check session on initial load
  const fetchCurrentUser = useCallback(async () => {
    try {
      const data = await fetchUserService();
      setCurrentUser(data?.user || null);
      setError(null);
    } catch (err: unknown) {
      setCurrentUser(null);

      if (isApiError(err)) {
        const apiError: ApiError = err;
        // Only set error state if it's not a typical 'not logged in' error
        if (apiError.statusCode !== 401 && apiError.statusCode !== 403) {
          setError(apiError.message || "Failed to fetch user data.");
        }
      }
    } finally {
      setLoadingCurrentUser(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  // --- Auth Actions ---

  const signUp = async (
    credentials: SignUpCredentials
  ): Promise<User | null> => {
    clearError();
    try {
      const data: AuthResponse = await signUpService(credentials);
      return handleAuthResponse(data);
    } catch (err: unknown) {
      handleAuthError(err);

      if (isApiError(err)) {
        throw err;
      }

      throw {
        message: "An unexpected error occurred.",
        statusCode: undefined,
      } as ApiError;
    }
  };

  const signIn = async (
    credentials: LoginCredentials
  ): Promise<User | null> => {
    clearError();
    try {
      const data: AuthResponse = await signInService(credentials);
      return handleAuthResponse(data);
    } catch (err: unknown) {
      handleAuthError(err);

      if (isApiError(err)) {
        throw err;
      }

      throw {
        message: "An unexpected error occurred.",
        statusCode: undefined,
      } as ApiError;
    }
  };

  const signOut = async (): Promise<void> => {
    clearError();
    try {
      await signOutService();
    } catch (err) {
      handleAuthError(err);
    } finally {
      setCurrentUser(null);
    }
  };

  const signInWithGoogle = () => {
    window.location.href = AUTH_API_ENDPOINTS.GOOGLE_LOGIN;
  };
  const signInWithMicrosoft = () => {
    window.location.href = AUTH_API_ENDPOINTS.MICROSOFT_LOGIN;
  };
  const signInWithFacebook = () => {
    window.location.href = AUTH_API_ENDPOINTS.FACEBOOK_LOGIN;
  };

  const resetPassword = async (email: string): Promise<void> => {
    clearError();

    try {
      await resetPasswordService(email);
    } catch (err: unknown) {
      handleAuthError(err);

      if (isApiError(err)) {
        throw err;
      }

      throw {
        message: "An unexpected error occurred.",
        statusCode: undefined,
      } as ApiError;
    }
  };

  const confirmReset = async (
    token: string,
    newPassword: string
  ): Promise<void> => {
    clearError();
    try {
      await confirmResetPasswordService(token, newPassword);
      // Optionally set a success message state here instead of error
      // Maybe automatically sign the user in here? Depends on backend logic.
    } catch (err) {
      handleAuthError(err);

      if (isApiError(err)) {
        throw err;
      }

      throw {
        message: "An unexpected error occurred.",
        statusCode: undefined,
      } as ApiError;
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      loadingCurrentUser,
      error,
      clearError,
      fetchCurrentUser,
      signUp,
      signIn,
      signOut,
      signInWithGoogle,
      signInWithMicrosoft,
      signInWithFacebook,
      resetPassword,
      confirmReset,
    }),
    [currentUser, loadingCurrentUser, error, clearError, fetchCurrentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
