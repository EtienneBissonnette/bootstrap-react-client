import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, afterEach, it, expect, beforeEach } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom"; // Need Route/Routes for searchParams
import ChangePasswordForm from "@/components/auth/change-password-form";
import { ApiError } from "@/types/api";

// --- Mocking Hooks ---

// Mock useScrollToTop
const mockUseScrollToTop = vi.fn();
vi.mock("@/hooks/useScrollTop", () => ({
  __esModule: true,
  default: () => mockUseScrollToTop(),
}));

// Mock useToast
const mockAddToast = vi.fn();
vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useAuth
const mockConfirmReset = vi.fn();

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    confirmReset: mockConfirmReset,
  }),
}));

describe("ChangePasswordForm", () => {
  const user = userEvent.setup({
    advanceTimers: vi.advanceTimersByTime.bind(vi),
  });

  // Helper to fill the password fields
  const fillForm = async (password: string, confirmPassword: string) => {
    await user.type(screen.getByLabelText(/New Password/i), password);
    await user.type(
      screen.getByLabelText(/Confirm Password/i),
      confirmPassword
    );
  };

  // Helper to get form elements
  const getFormElements = () => ({
    newPasswordInput: screen.queryByLabelText(/New Password/i),
    confirmPasswordInput: screen.queryByLabelText(/Confirm Password/i),
    submitButton: screen.queryByRole("button", {
      name: /Reset Password|Resetting.../i,
    }),
    signinLink: screen.queryByRole("link", { name: /Sign in/i }),
    passwordError: screen.queryByText(
      /Password must be at least 8 characters long|Passwords do not match/i
    ),

    // Elements that appear ONLY on success:
    successHeading: screen.queryByText(/Password Reset Successful/i),
    successSignInButton: screen.queryByRole("button", { name: /^Sign in$/i }),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Reset mocks
    mockUseScrollToTop.mockClear();
    mockAddToast.mockClear();
    mockNavigate.mockClear();
    mockConfirmReset.mockClear();

    // Set default mock behaviors
    mockConfirmReset.mockResolvedValue(undefined); // confirmReset resolves on success
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // --- Helper to render with URL Search Params ---
  // Since ChangePasswordForm uses useSearchParams, we need to render it
  // nested within a Route and provide initialEntries to MemoryRouter
  const renderWithSearchParams = ({
    route = "/change-password",
    initialEntries = [route],
  }: {
    route?: string;
    initialEntries?: string[];
  }) => {
    render(
      <MemoryRouter initialEntries={initialEntries}>
        <Routes>
          {/* The component must be rendered on a path that matches the route in initialEntries */}
          <Route path="/change-password" element={<ChangePasswordForm />} />
          {/* Add a route for the redirect target */}
          <Route
            path="/reset-password"
            element={<div>Reset Password Page</div>}
          />
          <Route path="/signin" element={<div>Sign In Page</div>} />
        </Routes>
      </MemoryRouter>
    );
  };

  // --- Initial Render / useEffect Logic Tests ---
  it("calls useScrollToTop on initial render", () => {
    // Render with valid search params so useEffect doesn't immediately navigate
    renderWithSearchParams({
      initialEntries: [
        "/change-password?token=valid-token&email=test@example.com",
      ],
    });

    vi.runOnlyPendingTimers();

    // Check useScrollToTop spy was called on render
    expect(mockUseScrollToTop).toHaveBeenCalledTimes(1);

    // Assert that addToast and navigate were NOT called immediately (valid params)
    expect(mockAddToast).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows form and does NOT show success state initially (with valid params)", () => {
    renderWithSearchParams({
      initialEntries: [
        "/change-password?token=valid-token&email=test@example.com",
      ],
    });

    vi.runOnlyPendingTimers();

    const {
      newPasswordInput,
      confirmPasswordInput,
      submitButton,
      signinLink,
      successHeading,
      successSignInButton,
    } = getFormElements();

    // Assert form elements are present
    expect(newPasswordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(signinLink).toBeInTheDocument();

    // Assert success elements are NOT present
    expect(successHeading).not.toBeInTheDocument();
    expect(successSignInButton).not.toBeInTheDocument();

    // Check initial button states
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveTextContent("Reset Password");

    // Check error message is not visible initially
    expect(getFormElements().passwordError).not.toBeInTheDocument();
  });

  it("redirects and shows error toast if token is missing", () => {
    renderWithSearchParams({
      initialEntries: ["/change-password?email=test@example.com"],
    });

    vi.runOnlyPendingTimers();

    // Assert addToast and navigate were called due to invalid params
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(
      "Invalid or expired reset link. Please try again.",
      "error"
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/reset-password");
  });

  it("redirects and shows error toast if email is missing", () => {
    renderWithSearchParams({
      initialEntries: ["/change-password?token=valid-token"],
    });

    vi.runOnlyPendingTimers();

    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(
      "Invalid or expired reset link. Please try again.",
      "error"
    );
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/reset-password");
  });

  // --- Input Handling Tests ---
  it("updates password states on input change", async () => {
    renderWithSearchParams({
      initialEntries: ["/change-password?token=valid&email=test@ex.com"],
    });

    vi.runOnlyPendingTimers();

    const { newPasswordInput, confirmPasswordInput } = getFormElements();

    await user.type(newPasswordInput!, "newpassword");
    expect(newPasswordInput!).toHaveValue("newpassword");

    await user.type(confirmPasswordInput!, "newpassword");
    expect(confirmPasswordInput!).toHaveValue("newpassword");
  });

  // --- Validation Tests (Client-Side) ---
  it("shows password length error if password is too short on submit", async () => {
    renderWithSearchParams({
      initialEntries: ["/change-password?token=valid&email=test@ex.com"],
    });
    vi.runOnlyPendingTimers();

    const { submitButton } = getFormElements();

    await fillForm("short", "short");

    await user.click(submitButton!);

    vi.runOnlyPendingTimers();

    // Assert error message appears
    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters long/i)
      ).toBeInTheDocument();
    });
    // Assert other error is not present
    expect(
      screen.queryByText(/Passwords do not match/i)
    ).not.toBeInTheDocument();

    // Assert API was NOT called
    expect(mockConfirmReset).not.toHaveBeenCalled();

    // Assert loading state wasn't truly engaged (setIsLoading(true) might be called briefly then false)
    expect(submitButton!).not.toBeDisabled();
    expect(submitButton!).toHaveTextContent("Reset Password");
  });

  it("shows password mismatch error if passwords do not match on submit", async () => {
    renderWithSearchParams({
      initialEntries: ["/change-password?token=valid&email=test@ex.com"],
    });
    vi.runOnlyPendingTimers();

    const { submitButton } = getFormElements();

    await fillForm("longenough", "mismatch");

    await user.click(submitButton!);

    // Assert error message appears
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
    // Assert other error is not present
    expect(
      screen.queryByText(/Password must be at least 8 characters long/i)
    ).not.toBeInTheDocument();

    // Assert API was NOT called
    expect(mockConfirmReset).not.toHaveBeenCalled();
    expect(submitButton!).not.toBeDisabled();
    expect(submitButton!).toHaveTextContent("Reset Password");
  });

  it("clears password validation error when input is corrected and re-submitted", async () => {
    renderWithSearchParams({
      initialEntries: ["/change-password?token=valid&email=test@ex.com"],
    });

    vi.runOnlyPendingTimers();

    const { newPasswordInput, confirmPasswordInput, submitButton } =
      getFormElements();

    // Trigger errors first
    await fillForm("short", "diff");
    await user.click(submitButton!);

    vi.runOnlyPendingTimers();

    // Wait for errors to appear before proceeding (this case is password length shown first)
    await waitFor(() => {
      expect(
        screen.getByText(/Password must be at least 8 characters long/i)
      ).toBeInTheDocument();
      expect(
        screen.queryByText(/Passwords do not match/i)
      ).not.toBeInTheDocument();
    });

    // Now correct the inputs by clearing and typing
    await user.clear(newPasswordInput!);
    await user.type(newPasswordInput!, "longenoughpassword123");
    await user.clear(confirmPasswordInput!);
    await user.type(confirmPasswordInput!, "longenoughpassword123");

    // Re-submit the form
    await user.click(submitButton!);

    await waitFor(() => {
      expect(mockConfirmReset).toHaveBeenCalledTimes(1);
    });

    // After waiting for the successful submission, check that the error messages are NOT present
    expect(
      screen.queryByText(
        /Password must be at least 8 characters long|Passwords do not match/i
      )
    ).not.toBeInTheDocument();
  });

  // --- Successful Submission Tests (API Success) ---
  it("handles successful password reset confirmation", async () => {
    const testToken = "valid-token-123";
    const testPassword = "ValidNewPassword!456";
    renderWithSearchParams({
      initialEntries: [
        `/change-password?token=${testToken}&email=test@example.com`,
      ],
    });

    vi.runOnlyPendingTimers();

    const { submitButton } = getFormElements();

    await fillForm(testPassword, testPassword);

    await user.click(submitButton!);

    // Assert button is disabled and text changes while loading
    expect(submitButton!).toBeDisabled();
    expect(submitButton!).toHaveTextContent("Resetting...");

    vi.runOnlyPendingTimers();

    // Wait for the UI to switch to the success state
    await waitFor(() => {
      // Assert success state elements are present
      expect(
        screen.getByText(/Password Reset Successful/i)
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /^Sign in$/i })
      ).toBeInTheDocument();

      // Assert form elements are no longer present
      expect(screen.queryByLabelText(/New Password/i)).not.toBeInTheDocument();
      expect(
        screen.queryByLabelText(/Confirm Password/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Reset Password|Resetting.../i })
      ).not.toBeInTheDocument();
    });

    // Assert that confirmReset was called with the correct token and password
    expect(mockConfirmReset).toHaveBeenCalledTimes(1);
    expect(mockConfirmReset).toHaveBeenCalledWith(testToken, testPassword);

    // Assert that the success toast was NOT called
    expect(mockAddToast).not.toHaveBeenCalled();

    // Assert that navigate was NOT called immediately after successful submission
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // --- Failed Submission Tests (API Error) ---
  it("handles failed password reset confirmation (API error)", async () => {
    const apiError: ApiError = {
      message: "Token expired",
      statusCode: 400,
    };
    mockConfirmReset.mockRejectedValue(apiError);

    const testToken = "expired-token";
    renderWithSearchParams({
      initialEntries: [
        `/change-password?token=${testToken}&email=test@example.com`,
      ],
    });
    vi.runOnlyPendingTimers();

    const testPassword = "ValidNewPassword!456";
    await fillForm(testPassword, testPassword);

    const { submitButton } = getFormElements();
    await user.click(submitButton!);

    // Assert button is disabled while loading
    expect(submitButton!).toBeDisabled();
    expect(submitButton!).toHaveTextContent("Resetting...");

    vi.runOnlyPendingTimers();

    // Wait for the UI to update out of loading state (button re-enabled, text reverted)
    await waitFor(() => {
      expect(submitButton!).not.toBeDisabled();
      expect(submitButton!).toHaveTextContent("Reset Password");

      // Assert form elements are still present
      expect(screen.getByLabelText(/New Password/i)).toHaveValue(testPassword);
      expect(screen.getByLabelText(/Confirm Password/i)).toHaveValue(
        testPassword
      );
      expect(
        screen.getByRole("link", { name: /Sign in/i })
      ).toBeInTheDocument();
    });

    // Assert that confirmReset was called
    expect(mockConfirmReset).toHaveBeenCalledTimes(1);
    expect(mockConfirmReset).toHaveBeenCalledWith(testToken, testPassword);

    // Assert that the error toast was called with the error message
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(apiError.message, "error");

    // Assert that navigate was NOT called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // --- Success State Interaction Tests ---
  it("navigates to signin when 'Sign in' button is clicked in the success state", async () => {
    const testToken = "valid-token-123";
    const testPassword = "ValidNewPassword!456";
    renderWithSearchParams({
      initialEntries: [
        `/change-password?token=${testToken}&email=test@example.com`,
      ],
    });

    vi.runOnlyPendingTimers();

    const { submitButton } = getFormElements();
    await fillForm(testPassword, testPassword);
    await user.click(submitButton!);

    vi.runOnlyPendingTimers();

    // Wait for the success state to be fully rendered and sign in button visible
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /^Sign in$/i })
      ).toBeInTheDocument();
    });

    const successSignInButton = screen.getByRole("button", {
      name: /^Sign in$/i,
    });
    await user.click(successSignInButton);

    vi.runOnlyPendingTimers();

    // Assert that navigate was called to the sign-in page
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });
});
