import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, afterEach, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SignupForm from "@/components/auth/signup-form";
import { ApiError } from "@/types/api";

// --- Mocking Hooks ---

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
const mockSignUp = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockSignInWithMicrosoft = vi.fn();
const mockSignInWithFacebook = vi.fn();

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    signUp: mockSignUp,
    signInWithGoogle: mockSignInWithGoogle,
    signInWithMicrosoft: mockSignInWithMicrosoft,
    signInWithFacebook: mockSignInWithFacebook,
  }),
}));

describe("SignupForm", () => {
  const user = userEvent.setup({
    advanceTimers: vi.advanceTimersByTime.bind(vi),
  });

  // Helper to fill the form with valid data
  const fillForm = async (
    data = {
      name: "Test User",
      email: "test@example.com",
      password: "securepassword123",
      confirmPassword: "securepassword123",
    }
  ) => {
    await user.type(screen.getByLabelText(/Full Name/i), data.name);
    await user.type(screen.getByLabelText(/Email/i), data.email);
    await user.type(screen.getByLabelText(/^Password$/i), data.password);
    await user.type(
      screen.getByLabelText(/Confirm Password/i),
      data.confirmPassword
    );
  };

  // Helper to get form elements
  const getFormElements = () => ({
    nameInput: screen.getByLabelText(/Full Name/i),
    emailInput: screen.getByLabelText(/Email/i),
    passwordInput: screen.getByLabelText(/^Password$/i),
    confirmPasswordInput: screen.getByLabelText(/Confirm Password/i),
    submitButton: screen.getByRole("button", {
      name: /Create account|Creating account.../i,
    }),
    googleButton: screen.getByRole("button", { name: /Google/i }),
    microsoftButton: screen.getByRole("button", { name: /Microsoft/i }),
    facebookButton: screen.getByRole("button", { name: /Facebook/i }),
    signinLink: screen.getByRole("link", { name: /Sign in/i }),
    passwordLengthError: screen.queryByText(
      /Password must be at least 8 characters long/i
    ),
    passwordConfirmError: screen.queryByText(/Passwords do not match/i),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    // Set default mock behaviors
    mockSignUp.mockResolvedValue(undefined);
    mockSignInWithGoogle.mockResolvedValue({});
    mockSignInWithMicrosoft.mockResolvedValue({});
    mockSignInWithFacebook.mockResolvedValue({});
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // --- Initial Rendering Tests ---
  it("renders the form with all fields, buttons, and links", () => {
    render(<SignupForm />, { wrapper: MemoryRouter });

    const {
      nameInput,
      emailInput,
      passwordInput,
      confirmPasswordInput,
      submitButton,
      googleButton,
      microsoftButton,
      facebookButton,
      signinLink,
      passwordLengthError,
      passwordConfirmError,
    } = getFormElements();

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(confirmPasswordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(googleButton).toBeInTheDocument();
    expect(microsoftButton).toBeInTheDocument();
    expect(facebookButton).toBeInTheDocument();
    expect(signinLink).toBeInTheDocument();

    // Check initial button states
    expect(submitButton).not.toBeDisabled();
    expect(googleButton).not.toBeDisabled();
    expect(microsoftButton).not.toBeDisabled();
    expect(facebookButton).not.toBeDisabled();
    expect(submitButton).toHaveTextContent("Create account");

    // Check error messages are not visible initially
    expect(passwordLengthError).not.toBeInTheDocument();
    expect(passwordConfirmError).not.toBeInTheDocument();

    // Check 'required' attribute for built-in browser validation
    expect(nameInput).toBeRequired();
    expect(emailInput).toBeRequired();
    expect(passwordInput).toBeRequired();
    expect(confirmPasswordInput).toBeRequired();
  });

  it("renders links with correct hrefs", () => {
    render(<SignupForm />, { wrapper: MemoryRouter });

    const { signinLink } = getFormElements();
    expect(signinLink).toHaveAttribute("href", "/signin");
  });

  // --- Input Handling Tests ---
  it("updates form state on input change", async () => {
    render(<SignupForm />, { wrapper: MemoryRouter });

    const { nameInput, emailInput, passwordInput, confirmPasswordInput } =
      getFormElements();

    await user.type(nameInput, "Jane Doe");
    expect(nameInput).toHaveValue("Jane Doe");

    await user.type(emailInput, "jane@test.com");
    expect(emailInput).toHaveValue("jane@test.com");

    await user.type(passwordInput, "password123");
    expect(passwordInput).toHaveValue("password123");

    await user.type(confirmPasswordInput, "password123");
    expect(confirmPasswordInput).toHaveValue("password123");
  });

  // --- Validation Tests (Client-Side) ---
  it("shows password length error if password is too short on submit", async () => {
    render(<SignupForm />, { wrapper: MemoryRouter });

    const { submitButton } = getFormElements();

    await fillForm({
      name: "Test",
      email: "test@test.com",
      password: "short", // Less than 8 chars
      confirmPassword: "short",
    });

    await user.click(submitButton);
    vi.runOnlyPendingTimers();

    // Expect error message to appear
    await waitFor(() => {
      expect(getFormElements().passwordLengthError).toBeInTheDocument();
    });
    expect(getFormElements().passwordConfirmError).not.toBeInTheDocument();
  });

  it("shows password confirm error if passwords do not match on submit", async () => {
    render(<SignupForm />, { wrapper: MemoryRouter });

    const { submitButton } = getFormElements();

    await fillForm({
      name: "Test",
      email: "test@test.com",
      password: "longenoughpassword",
      confirmPassword: "mismatchpassword", // Mismatch
    });

    await user.click(submitButton);
    vi.runOnlyPendingTimers();

    // Expect error message to appear
    await waitFor(() => {
      expect(getFormElements().passwordConfirmError).toBeInTheDocument();
    });
    expect(getFormElements().passwordLengthError).not.toBeInTheDocument();
  });

  it("shows both password errors if both conditions are met on submit", async () => {
    render(<SignupForm />, { wrapper: MemoryRouter });

    const { submitButton } = getFormElements();

    await fillForm({
      name: "Test",
      email: "test@test.com",
      password: "short", // Too short
      confirmPassword: "different", // Mismatch
    });

    await user.click(submitButton);
    vi.runOnlyPendingTimers();

    await waitFor(() => {
      expect(getFormElements().passwordLengthError).toBeInTheDocument();
      expect(getFormElements().passwordConfirmError).toBeInTheDocument();
    });
  });

  it("clears password validation errors when input is corrected", async () => {
    render(<SignupForm />, { wrapper: MemoryRouter });

    const { passwordInput, confirmPasswordInput, submitButton } =
      getFormElements();

    // Trigger errors first
    await fillForm({
      name: "Test",
      email: "test@test.com",
      password: "short", // Too short
      confirmPassword: "diff", // Mismatch
    });

    await user.click(submitButton);
    vi.runOnlyPendingTimers();

    // Wait for errors to appear
    await waitFor(() => {
      expect(getFormElements().passwordLengthError).toBeInTheDocument();
      expect(getFormElements().passwordConfirmError).toBeInTheDocument();
    });

    await user.clear(passwordInput);
    await user.clear(confirmPasswordInput);
    await user.type(passwordInput, "longenoughpassword");
    await user.type(confirmPasswordInput, "longenoughpassword");

    // Submit again to ensure it would now pass client-side validation
    await user.click(submitButton);
    vi.runOnlyPendingTimers();

    await waitFor(() => {
      expect(getFormElements().passwordLengthError).not.toBeInTheDocument();
      expect(getFormElements().passwordConfirmError).not.toBeInTheDocument();
    });

    // The mocks are set to resolve, so clicking submit again should trigger signUp
    await waitFor(() => {
      expect(mockSignUp).toHaveBeenCalledTimes(1); // Confirms client-side validation passed
    });
  });

  // --- Standard Sign-up Tests (Email/Password) ---
  it("handles successful sign-up", async () => {
    // mockSignUp.mockResolvedValue(undefined) is already set in beforeEach

    render(<SignupForm />, { wrapper: MemoryRouter });

    const { submitButton } = getFormElements();

    const formDataToSend = {
      name: "Sign Up Test",
      email: "signup@example.com",
      password: "validpassword123",
      confirmPassword: "validpassword123",
    };
    await fillForm(formDataToSend);

    await user.click(submitButton);

    // Assert button is disabled and text changes while loading
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Creating account...");

    vi.runOnlyPendingTimers();

    // Wait for the effects of successful sign-up (navigation)
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith({
      name: formDataToSend.name,
      email: formDataToSend.email,
      password: formDataToSend.password,
      confirmPassword: formDataToSend.confirmPassword,
    });

    // Assert that navigate was called to /dashboard
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");

    // Assert that the success toast was NOT called (component logic doesn't show one on sign up success)
    expect(mockAddToast).not.toHaveBeenCalled();
  });

  it("handles failed sign-up (API error)", async () => {
    const apiError: ApiError = {
      message: "Email already exists",
      statusCode: 409,
    };
    mockSignUp.mockRejectedValue(apiError);

    render(<SignupForm />, { wrapper: MemoryRouter });

    const { submitButton } = getFormElements();

    const formDataToSend = {
      name: "Sign Up Test",
      email: "existing@example.com",
      password: "validpassword123",
      confirmPassword: "validpassword123",
    };
    await fillForm(formDataToSend);

    await user.click(submitButton);

    // Assert button is disabled while loading
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Creating account...");

    vi.runOnlyPendingTimers();

    // Wait for the UI to update out of loading state after the error
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent("Create account");
    });

    // Assert that signUp was called
    expect(mockSignUp).toHaveBeenCalledTimes(1);
    expect(mockSignUp).toHaveBeenCalledWith(formDataToSend);

    // Assert that the error toast was called with the error message from the rejected promise
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(apiError.message, "error");

    // Assert that navigate was NOT called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // --- OAuth Sign-up/Sign-in Tests ---
  it("handles successful Google sign-in via OAuth", async () => {
    render(<SignupForm />, { wrapper: MemoryRouter });

    const { googleButton, submitButton, microsoftButton, facebookButton } =
      getFormElements();

    await user.click(googleButton);

    // Assert buttons are disabled while loading
    expect(googleButton).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(microsoftButton).toBeDisabled();
    expect(facebookButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Creating account...");

    vi.runOnlyPendingTimers();

    // Wait for navigation after successful OAuth
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
    });

    // Assert that signInWithGoogle was called
    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    expect(mockSignUp).not.toHaveBeenCalled();

    // Assert navigate was called to /dashboard
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");

    // Assert no toast was called on success
    expect(mockAddToast).not.toHaveBeenCalled();
  });

  it("handles failed Google sign-in via OAuth", async () => {
    mockSignInWithGoogle.mockRejectedValue(new Error("Google auth failed"));

    render(<SignupForm />, { wrapper: MemoryRouter });

    const { googleButton, submitButton } = getFormElements();

    await user.click(googleButton);

    expect(googleButton).toBeDisabled();

    vi.runOnlyPendingTimers();

    // Wait for the UI to update out of loading state after the error
    await waitFor(() => {
      expect(googleButton).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });

    // Assert that signInWithGoogle was called
    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);

    // Assert that the generic error toast was called
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(
      "Failed to sign up with google",
      "error"
    );

    // Assert navigate was NOT called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // Add similar tests for Microsoft and Facebook OAuth
  it("handles successful Microsoft sign-in via OAuth", async () => {
    render(<SignupForm />, { wrapper: MemoryRouter });
    const { microsoftButton } = getFormElements();

    await user.click(microsoftButton);

    expect(microsoftButton).toBeDisabled();

    expect(mockSignInWithMicrosoft).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");

    expect(mockAddToast).not.toHaveBeenCalled();
  });

  it("handles failed Microsoft sign-in via OAuth", async () => {
    mockSignInWithMicrosoft.mockRejectedValue(
      new Error("Microsoft auth failed")
    );
    render(<SignupForm />, { wrapper: MemoryRouter });
    const { microsoftButton } = getFormElements();

    await user.click(microsoftButton);

    expect(microsoftButton).toBeDisabled();

    vi.runOnlyPendingTimers();

    await waitFor(() => expect(microsoftButton).not.toBeDisabled());

    expect(mockSignInWithMicrosoft).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(
      "Failed to sign up with microsoft",
      "error"
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("handles successful Facebook sign-in via OAuth", async () => {
    render(<SignupForm />, { wrapper: MemoryRouter });

    const { facebookButton } = getFormElements();

    await user.click(facebookButton);

    expect(facebookButton).toBeDisabled();

    expect(mockSignInWithFacebook).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
    expect(mockAddToast).not.toHaveBeenCalled();
  });

  it("handles failed Facebook sign-in via OAuth", async () => {
    mockSignInWithFacebook.mockRejectedValue(new Error("Facebook auth failed"));
    render(<SignupForm />, { wrapper: MemoryRouter });
    const { facebookButton } = getFormElements();

    await user.click(facebookButton);

    expect(facebookButton).toBeDisabled();

    vi.runOnlyPendingTimers();

    await waitFor(() => expect(facebookButton).not.toBeDisabled());
    expect(mockSignInWithFacebook).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(
      "Failed to sign up with facebook",
      "error"
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
