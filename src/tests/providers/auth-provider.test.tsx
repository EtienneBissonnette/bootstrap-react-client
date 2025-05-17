import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { http, HttpResponse } from "msw";

import { AuthProvider, useAuth } from "@/providers/auth-provider";
import { AUTH_API_ENDPOINTS } from "@/api/auth/endpoints";
import { server } from "@/tests/mocks/server";
import { MOCK_USER } from "@/tests/mocks/auth-handlers";

// Helper to construct full URLs based on your setup
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api/v1";
const fullUrl = (endpoint: string) => {
  if (endpoint.startsWith("http://") || endpoint.startsWith("https://"))
    return endpoint;
  return `${API_BASE_URL.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}`;
};

// --- Test Component ---
// A simple component to consume the context and trigger actions
const TestAuthComponent = () => {
  const {
    currentUser,
    loadingCurrentUser,
    error,
    clearError,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithMicrosoft,
    signInWithFacebook,
    resetPassword,
    confirmReset,
  } = useAuth();

  if (loadingCurrentUser) return <div>Loading...</div>;

  return (
    <div>
      <h1>Auth State</h1>
      {error && <div data-testid="error-message">{error}</div>}
      {currentUser ? (
        <div>
          <span data-testid="user-email">{currentUser.email}</span>
          <button onClick={() => signOut()}>Logout</button>
        </div>
      ) : (
        <div>
          <span data-testid="no-user">Not Logged In</span>
          {/* Add forms or buttons to trigger actions */}
          <button
            onClick={() =>
              signIn({ email: "test@example.com", password: "password" })
            }
          >
            Login Success
          </button>
          <button
            onClick={async () => {
              try {
                await signIn({ email: "wrong@test.com", password: "bad" });
              } catch (error) {
                console.log(
                  "Expected error to be caught in component's onClick:",
                  error
                );
              }
            }}
          >
            Login Fail
          </button>
          <button
            onClick={() =>
              signUp({
                email: "new@example.com",
                password: "newpassword",
                name: "New Guy",
              })
            }
          >
            Sign Up
          </button>
          <button onClick={signInWithGoogle}>Login Google</button>
          <button onClick={signInWithMicrosoft}>Login Microsoft</button>
          <button onClick={signInWithFacebook}>Login Facebook</button>
          <button onClick={() => resetPassword("test@example.com")}>
            Request Reset
          </button>
          <button
            onClick={async () => {
              try {
                await confirmReset("valid-token", "newSecurePass");
              } catch (error) {
                console.log(
                  "Expected error to be caught in component's onClick:",
                  error
                );
              }
            }}
          >
            Confirm Reset
          </button>
          <button onClick={clearError}>Clear Error</button>
        </div>
      )}
    </div>
  );
};

// --- Test Suite ---
describe("AuthProvider", () => {
  // Reset mocks and spies before each test
  beforeEach(() => {
    server.resetHandlers();
    vi.clearAllMocks();
  });

  // -- Initial State Tests --
  it("should show loading initially", () => {
    // Use a handler that never resolves to test loading state reliably
    server.use(
      http.get(fullUrl(AUTH_API_ENDPOINTS.ME), () => {
        return new Promise(() => {}); // Pending promise
      })
    );
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should fetch and set currentUser if session exists", async () => {
    // Default MSW handler already mocks successful /api/me
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );
    // Wait for loading to disappear and user email to be present
    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("user-email")).toHaveTextContent(MOCK_USER.email);
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("should show not logged in if no session (401 error)", async () => {
    // Override /api/me to return 401 for this test
    server.use(
      http.get(fullUrl(AUTH_API_ENDPOINTS.ME), () => {
        return new HttpResponse(null, { status: 401 });
      })
    );
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("no-user")).toBeInTheDocument();
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument(); // 401 shouldn't set error state
  });

  it("should set error state if fetching user fails with non-auth error", async () => {
    server.use(
      http.get(fullUrl(AUTH_API_ENDPOINTS.ME), () => {
        return HttpResponse.json(
          { message: "Internal Server Error" },
          { status: 500 }
        );
      })
    );
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByText("Loading...")).not.toBeInTheDocument();
    });
    expect(screen.getByTestId("no-user")).toBeInTheDocument(); // Still not logged in

    //expecting default error message when failing to fetch user data
    expect(screen.getByTestId("error-message")).toHaveTextContent(
      "Failed to fetch user data."
    );
  });

  // -- Action Tests --

  it("should sign in successfully and update currentUser", async () => {
    const user = userEvent.setup();
    // Start unauthenticated
    server.use(
      http.get(
        fullUrl(AUTH_API_ENDPOINTS.ME),
        () => new HttpResponse(null, { status: 401 })
      )
    );
    // Default login mock is successful for MOCK_USER credentials
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("no-user")).toBeInTheDocument()
    ); // Wait for initial load

    const loginButton = screen.getByRole("button", { name: /Login Success/i });
    await user.click(loginButton);

    // Wait for the user email to appear
    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        MOCK_USER.email
      );
    });
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("should handle sign in failure and set error state", async () => {
    const user = userEvent.setup();
    // Start unauthenticated
    server.use(
      http.get(
        fullUrl(AUTH_API_ENDPOINTS.ME),
        () => new HttpResponse(null, { status: 401 })
      )
    );

    // Default login mock fails for wrong credentials
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("no-user")).toBeInTheDocument()
    );

    const loginFailButton = screen.getByRole("button", { name: /Login Fail/i });

    await user.click(loginFailButton);

    // Wait for error default message for failed login
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Failed to sign in. Please try again."
      );
    });

    expect(screen.getByTestId("no-user")).toBeInTheDocument(); // Should still be logged out
  });

  it("should sign up successfully and update currentUser", async () => {
    const user = userEvent.setup();
    // Start unauthenticated
    server.use(
      http.get(
        fullUrl(AUTH_API_ENDPOINTS.ME),
        () => new HttpResponse(null, { status: 401 })
      )
    );

    // MSW handler for register should return a new user
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("no-user")).toBeInTheDocument()
    );

    const signUpButton = screen.getByRole("button", { name: /Sign Up/i });
    await user.click(signUpButton);

    // Wait for the new user's email
    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent(
        "new@example.com"
      );
    });
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("should sign out successfully and clear currentUser", async () => {
    const user = userEvent.setup();

    // Start authenticated (default /api/me handler)
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("user-email")).toBeInTheDocument()
    );

    const logoutButton = screen.getByRole("button", { name: /Logout/i });
    await user.click(logoutButton);

    await waitFor(() => {
      expect(screen.getByTestId("no-user")).toBeInTheDocument();
    });
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("should handle sign out failure and set error state", async () => {
    const user = userEvent.setup();

    // Start authenticated
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("user-email")).toBeInTheDocument()
    );

    // Override logout to fail
    server.use(
      http.post(fullUrl(AUTH_API_ENDPOINTS.LOGOUT), () => {
        return HttpResponse.json(
          { message: "Logout failed on server" },
          { status: 500 }
        );
      })
    );

    const logoutButton = screen.getByRole("button", { name: /Logout/i });
    await user.click(logoutButton);

    // Wait for error default message for failed logout
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Failed to sign out user."
      );
    });

    // Check if user state remains logged in or gets cleared despite API error
    expect(screen.queryByTestId("user-email")).not.toBeInTheDocument();
  });

  // -- OAuth Redirect Tests --
  it("signInWithGoogle should redirect to the correct backend URL", async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        fullUrl(AUTH_API_ENDPOINTS.ME),
        () => new HttpResponse(null, { status: 401 })
      )
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("no-user")).toBeInTheDocument()
    );

    const googleButton = screen.getByRole("button", { name: /Login Google/i });
    await user.click(googleButton);

    // Check if window.location.href was set (or assign was called)
    expect(window.location.href).toBe(AUTH_API_ENDPOINTS.GOOGLE_LOGIN);
  });

  it("signInWithMicrosoft should redirect to the correct backend URL", async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        fullUrl(AUTH_API_ENDPOINTS.ME),
        () => new HttpResponse(null, { status: 401 })
      )
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("no-user")).toBeInTheDocument()
    );

    const msButton = screen.getByRole("button", { name: /Login Microsoft/i });
    await user.click(msButton);

    expect(window.location.href).toBe(AUTH_API_ENDPOINTS.MICROSOFT_LOGIN);
  });

  it("signInWithFacebook should redirect to the correct backend URL", async () => {
    const user = userEvent.setup();
    server.use(
      http.get(
        fullUrl(AUTH_API_ENDPOINTS.ME),
        () => new HttpResponse(null, { status: 401 })
      )
    );
    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("no-user")).toBeInTheDocument()
    );

    const igButton = screen.getByRole("button", { name: /Login Facebook/i });
    await user.click(igButton);

    expect(window.location.href).toBe(AUTH_API_ENDPOINTS.FACEBOOK_LOGIN);
  });

  // -- Password Reset Tests --
  it("requestPasswordReset should call the API endpoint", async () => {
    const user = userEvent.setup();
    const requestSpy = vi.fn();
    // Intercept the specific call to verify
    server.use(
      http.post(
        fullUrl(AUTH_API_ENDPOINTS.REQUEST_RESET),
        async ({ request }) => {
          requestSpy(await request.json()); // Check body
          return new HttpResponse(null, { status: 204 });
        }
      )
    );

    // Override /api/me to return 401 for this test
    server.use(
      http.get(fullUrl(AUTH_API_ENDPOINTS.ME), () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("no-user")).toBeInTheDocument()
    );

    const resetButton = screen.getByRole("button", { name: /Request Reset/i });
    await user.click(resetButton);

    await waitFor(() => {
      expect(requestSpy).toHaveBeenCalledWith({ email: "test@example.com" });
    });
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("confirmPasswordReset should call the API endpoint", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.fn();

    server.use(
      http.post(
        fullUrl(AUTH_API_ENDPOINTS.CONFIRM_RESET),
        async ({ request }) => {
          confirmSpy(await request.json());
          return new HttpResponse(null, { status: 204 });
        }
      )
    );

    // Override /api/me to return 401 for this test
    server.use(
      http.get(fullUrl(AUTH_API_ENDPOINTS.ME), () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("no-user")).toBeInTheDocument()
    );

    const confirmButton = screen.getByRole("button", {
      name: /Confirm Reset/i,
    });

    await user.click(confirmButton);

    await waitFor(() => {
      expect(confirmSpy).toHaveBeenCalledWith({
        token: "valid-token",
        newPassword: "newSecurePass",
      });
    });
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });

  it("confirmPasswordReset should set error on failure", async () => {
    const user = userEvent.setup();
    const errorMessage = "Invalid or expired token";

    server.use(
      http.post(fullUrl(AUTH_API_ENDPOINTS.CONFIRM_RESET), () => {
        return HttpResponse.json({ message: errorMessage }, { status: 400 });
      })
    );

    // Override /api/me to return 401 for this test
    server.use(
      http.get(fullUrl(AUTH_API_ENDPOINTS.ME), () => {
        return new HttpResponse(null, { status: 401 });
      })
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("no-user")).toBeInTheDocument()
    );

    const confirmButton = screen.getByRole("button", {
      name: /Confirm Reset/i,
    });

    await user.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        errorMessage
      );
    });
  });

  // -- Error Clearing Test --
  it("clearError should remove the error message", async () => {
    const user = userEvent.setup();
    // Trigger an error first
    server.use(
      http.get(fullUrl(AUTH_API_ENDPOINTS.ME), () => HttpResponse.error())
    );

    render(
      <AuthProvider>
        <TestAuthComponent />
      </AuthProvider>
    );

    await waitFor(() =>
      expect(screen.getByTestId("error-message")).toBeInTheDocument()
    );

    // Click the clear error button
    const clearButton = screen.getByRole("button", { name: /Clear Error/i });
    await user.click(clearButton);

    // Assert error message is gone
    expect(screen.queryByTestId("error-message")).not.toBeInTheDocument();
  });
});
