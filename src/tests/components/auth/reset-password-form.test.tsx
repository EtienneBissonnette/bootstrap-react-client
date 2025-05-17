// src/components/auth/reset-password-form.test.tsx
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, afterEach, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import { ApiError } from "@/types/api";

// --- Mocking Hooks ---

// Mock useScrollToTop
const mockUseScrollToTop = vi.fn();
vi.mock("@/hooks/useScrollTop", () => ({
  __esModule: true,
  default: () => {
    mockUseScrollToTop();
  },
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
const mockResetPassword = vi.fn();
vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    resetPassword: mockResetPassword,
  }),
}));

describe("ResetPasswordForm", () => {
  const user = userEvent.setup({
    advanceTimers: vi.advanceTimersByTime.bind(vi),
  });

  // Helper to fill the email field
  const fillForm = async (email: string) => {
    await user.type(screen.getByPlaceholderText(/Enter your email/i), email);
  };

  // Helper to get form elements
  const getFormElements = (email: string = "dummy@gmail.com") => ({
    emailInput: screen.getByPlaceholderText(/Enter your email/i),
    submitButton: screen.getByRole("button", {
      name: /Send reset link|Sending.../i,
    }),
    signinLink: screen.getByRole("link", { name: /Sign in/i }),
    // Elements that appear ONLY on success:
    successHeading: screen.queryByText(/Check your email/i),
    successEmailDisplay: screen.queryByText(new RegExp(`to ${email}`, "i")),
    resendLinkButton: screen.queryByRole("button", {
      name: /click here to resend/i,
    }),
    returnToLoginButton: screen.queryByRole("button", {
      name: /Return to login/i,
    }),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Set default mock behaviors
    mockResetPassword.mockResolvedValue(undefined); // resetPassword resolves on success
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // --- Initial Rendering Tests ---
  it("renders the form with email input, submit button, and sign-in link", () => {
    render(<ResetPasswordForm />, { wrapper: MemoryRouter });

    const {
      emailInput,
      submitButton,
      signinLink,
      successHeading,
      resendLinkButton,
      returnToLoginButton,
    } = getFormElements();

    expect(emailInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(signinLink).toBeInTheDocument();

    // Check initial button states
    expect(submitButton).not.toBeDisabled();
    expect(submitButton).toHaveTextContent("Send reset link");

    // Check success state elements are not visible initially
    expect(successHeading).not.toBeInTheDocument();
    expect(resendLinkButton).not.toBeInTheDocument();
    expect(returnToLoginButton).not.toBeInTheDocument();

    // Check 'required' attribute
    expect(emailInput).toBeRequired();

    // Check useScrollToTop is called on render
    expect(mockUseScrollToTop).toHaveBeenCalledTimes(1);
  });

  it("renders links with correct hrefs", () => {
    render(<ResetPasswordForm />, { wrapper: MemoryRouter });

    const { signinLink } = getFormElements();
    expect(signinLink).toHaveAttribute("href", "/signin");
  });

  // --- Input Handling Tests ---
  it("updates email state on input change", async () => {
    render(<ResetPasswordForm />, { wrapper: MemoryRouter });

    const { emailInput } = getFormElements();

    await user.type(emailInput, "test@test.com");
    expect(emailInput).toHaveValue("test@test.com");
  });

  // --- Successful Request Tests ---
  it("handles successful password reset request", async () => {
    render(<ResetPasswordForm />, { wrapper: MemoryRouter });

    const testEmail = "reset.success@example.com";
    await fillForm(testEmail);

    const { submitButton } = getFormElements();
    await user.click(submitButton);

    // Assert button is disabled and text changes while loading
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Sending...");

    vi.runOnlyPendingTimers();

    // Wait for the UI to switch to the success state
    await waitFor(() => {
      // --- Assert success state elements are present (use getBy*) ---
      expect(screen.getByText(/Check your email/i)).toBeInTheDocument();
      expect(
        screen.getByText(new RegExp(`${testEmail}`, "i"))
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /click here to resend/i })
      ).toBeInTheDocument();
      expect(
        screen.getByRole("button", { name: /Return to login/i })
      ).toBeInTheDocument();

      // --- Assert FORM elements are no longer present (use queryBy*) ---
      expect(
        screen.queryByPlaceholderText(/Enter your email/i)
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /Send reset link|Sending.../i })
      ).not.toBeInTheDocument();
    });

    // Assert that resetPassword was called with the correct email
    expect(mockResetPassword).toHaveBeenCalledTimes(1);
    expect(mockResetPassword).toHaveBeenCalledWith(testEmail);

    // Assert that the success toast was NOT called
    expect(mockAddToast).not.toHaveBeenCalled();

    // Assert that navigate was NOT called immediately after successful submission
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // --- Failed Request Tests (API Error) ---
  it("handles failed password reset request (API error)", async () => {
    const apiError: ApiError = {
      message: "Email not found",
      statusCode: 404,
    };
    mockResetPassword.mockRejectedValue(apiError);

    render(<ResetPasswordForm />, { wrapper: MemoryRouter });

    const testEmail = "reset.fail@example.com";
    await fillForm(testEmail);

    const { submitButton } = getFormElements();
    await user.click(submitButton);

    // Assert button is disabled while loading
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Sending...");

    vi.runOnlyPendingTimers();

    // The UI should still be in the form state on failure
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent("Send reset link");

      // Assert form elements are still present
      expect(screen.getByPlaceholderText(/Enter your email/i)).toHaveValue(
        testEmail
      ); // Email should persist
      expect(
        screen.getByRole("link", { name: /Sign in/i })
      ).toBeInTheDocument();
    });

    // Assert that resetPassword was called
    expect(mockResetPassword).toHaveBeenCalledTimes(1);
    expect(mockResetPassword).toHaveBeenCalledWith(testEmail);

    // Assert that the error toast was called with the error message
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(apiError.message, "error");

    // Assert that navigate was NOT called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // --- Success State Interaction Tests ---
  it("navigates to signin when 'Return to login' is clicked in the success state", async () => {
    render(<ResetPasswordForm />, { wrapper: MemoryRouter });

    const testEmail = "navigate.test@example.com";
    await fillForm(testEmail);
    await user.click(screen.getByRole("button", { name: /Send reset link/i }));

    vi.runOnlyPendingTimers();

    await waitFor(() => {
      // Wait for the success state to be fully rendered
      expect(
        screen.getByRole("button", { name: /Return to login/i })
      ).toBeInTheDocument();
    });

    // Now, get and click the 'Return to login' button
    const returnButton = screen.getByRole("button", {
      name: /Return to login/i,
    });
    await user.click(returnButton);

    // Assert that navigate was called to the sign-in page
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/signin");
  });

  it("resends the reset link when 'click here to resend' is clicked in the success state", async () => {
    render(<ResetPasswordForm />, { wrapper: MemoryRouter });

    const testEmail = "resend.test@example.com";
    await fillForm(testEmail);

    const submitButton = screen.getByRole("button", {
      name: /Send reset link/i,
    });
    await user.click(submitButton);

    vi.runOnlyPendingTimers(); 

    // Wait for the success state to be fully rendered and resend button visible
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /click here to resend/i })
      ).toBeInTheDocument();
      expect(submitButton).not.toBeInTheDocument();
    });

    // At this point, mockResetPassword has been called once (from the initial submit)
    expect(mockResetPassword).toHaveBeenCalledTimes(1);

    const resendButton = screen.getByRole("button", {
      name: /click here to resend/i,
    });
    await user.click(resendButton);

    // Assert the resend button goes into loading state
    expect(resendButton).toBeDisabled();

    vi.runOnlyPendingTimers();

    // Wait for the resend button to be re-enabled
    await waitFor(() => {
      expect(resendButton).not.toBeDisabled();
    });

    // Assert that resetPassword was called a second time with the same email
    expect(mockResetPassword).toHaveBeenCalledTimes(2); 
    expect(mockResetPassword).toHaveBeenCalledWith(testEmail);

    // Assert UI is still in success state (it doesn't revert on resend success/failure)
    expect(screen.getByText(/Check your email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Return to login/i })
    ).toBeInTheDocument();

    // Check if toast was called (it would only be on resend *failure*)
    // In this test, mockResetPassword is set to resolve, so no toast expected
    expect(mockAddToast).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("shows error toast when resending fails", async () => {
    render(<ResetPasswordForm />, { wrapper: MemoryRouter });

    const testEmail = "resend.fail@example.com";
    await fillForm(testEmail);
    await user.click(screen.getByRole("button", { name: /Send reset link/i }));

    vi.runOnlyPendingTimers();

    // Wait for success state rendering
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: /click here to resend/i })
      ).toBeInTheDocument();
    });

    //Configure the *next* call to fail for the resend attempt.
    const resendError: ApiError = {
      message: "Resend rate limited",
      statusCode: 429,
    };
    mockResetPassword.mockRejectedValueOnce(resendError); 

    const resendButton = screen.getByRole("button", {
      name: /click here to resend/i,
    });
    await user.click(resendButton);

    // Assert the resent button is in loading state
    expect(resendButton).toBeDisabled();

    vi.runOnlyPendingTimers();

    // Wait for the resend button to be re-enabled after failure
    await waitFor(() => {
      expect(resendButton).not.toBeDisabled();
    });

    // Assert that resetPassword was called a second time
    expect(mockResetPassword).toHaveBeenCalledTimes(2);
    expect(mockResetPassword).toHaveBeenCalledWith(testEmail);

    // Assert that the error toast was called for the resend failure
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(resendError.message, "error");

    // Assert UI is still in success state
    expect(screen.getByText(/Check your email/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Return to login/i })
    ).toBeInTheDocument();

    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
