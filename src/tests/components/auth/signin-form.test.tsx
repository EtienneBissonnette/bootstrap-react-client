import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, afterEach, it, expect, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";
import SigninForm from "@/components/auth/signin-form";
import { MOCK_USER, MOCK_ERROR } from "@/tests/mocks/auth-handlers";

// --- Mocking Hooks ---
const mockAddToast = vi.fn();
vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

const mockNavigate = vi.fn();
const mockUseLocation = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockUseLocation(),
  };
});

const mockSignIn = vi.fn();
const mockSignInWithGoogle = vi.fn();
const mockSignInWithMicrosoft = vi.fn();
const mockSignInWithFacebook = vi.fn();

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({
    signIn: mockSignIn,
    signInWithGoogle: mockSignInWithGoogle,
    signInWithMicrosoft: mockSignInWithMicrosoft,
    signInWithFacebook: mockSignInWithFacebook,
  }),
}));

describe("SigninForm", () => {
  const user = userEvent.setup({
    advanceTimers: vi.advanceTimersByTime.bind(vi),
  });

  // Helper to fill the email and password fields
  const fillForm = async (email = MOCK_USER.email, password = "password") => {
    await user.type(screen.getByLabelText(/Email/i), email);
    await user.type(screen.getByLabelText(/Password/i), password);
  };

  // Helper to get form elements
  const getFormElements = () => ({
    emailInput: screen.getByLabelText(/Email/i),
    passwordInput: screen.getByLabelText(/Password/i),
    urlHoneypotInput: screen.getByLabelText(/Your Website URL/i),
    submitButton: screen.getByRole("button", {
      name: /Sign in|Signing in.../i,
    }),
    googleButton: screen.getByRole("button", { name: /Google/i }),
    microsoftButton: screen.getByRole("button", { name: /Microsoft/i }),
    facebookButton: screen.getByRole("button", { name: /Facebook/i }),
    forgotPasswordLink: screen.getByRole("link", { name: /Forgot password?/i }),
    signupLink: screen.getByRole("link", { name: /Sign up/i }),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    mockSignIn.mockResolvedValue(MOCK_USER);
    mockSignInWithGoogle.mockResolvedValue({});
    mockSignInWithMicrosoft.mockResolvedValue({});
    mockSignInWithFacebook.mockResolvedValue({});
    mockUseLocation.mockReturnValue({
      pathname: "/",
      search: "",
      hash: "",
      state: {},
    });
  });

  afterEach(() => {
    cleanup();
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  // --- Initial Rendering Tests ---
  it("renders the form with email, password fields, submit button, and OAuth buttons", () => {
    render(<SigninForm />, { wrapper: MemoryRouter });

    const {
      emailInput,
      passwordInput,
      submitButton,
      googleButton,
      microsoftButton,
      facebookButton,
      forgotPasswordLink,
      signupLink,
    } = getFormElements();

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();
    expect(googleButton).toBeInTheDocument();
    expect(microsoftButton).toBeInTheDocument();
    expect(facebookButton).toBeInTheDocument();
    expect(forgotPasswordLink).toBeInTheDocument();
    expect(signupLink).toBeInTheDocument();

    // Check initial button states
    expect(submitButton).not.toBeDisabled();
    expect(googleButton).not.toBeDisabled();
    expect(microsoftButton).not.toBeDisabled();
    expect(facebookButton).not.toBeDisabled();
    expect(submitButton).toHaveTextContent("Sign in");
  });

  it("renders the honeypot field but it's visually hidden", () => {
    render(<SigninForm />, { wrapper: MemoryRouter });
    const { urlHoneypotInput } = getFormElements();

    expect(urlHoneypotInput).toBeInTheDocument();
    // Check for the CSS styles that hide it
    const parentStyles = urlHoneypotInput.parentElement
      ? getComputedStyle(urlHoneypotInput.parentElement)
      : null;
    expect(parentStyles?.position).toBe("absolute");
    expect(parentStyles?.left).toBe("-9999px");
    expect(parentStyles?.top).toBe("-9999px");
    expect(parentStyles?.overflow).toBe("hidden");
    expect(parentStyles?.opacity).toBe("0");
    expect(urlHoneypotInput).toHaveAttribute("tabindex", "-1");
    expect(urlHoneypotInput).toHaveAttribute("autocomplete", "new-password");
  });

  it("renders links with correct hrefs", () => {
    render(<SigninForm />, { wrapper: MemoryRouter });
    const { forgotPasswordLink, signupLink } = getFormElements();

    expect(forgotPasswordLink).toHaveAttribute("href", "/reset-password");
    expect(signupLink).toHaveAttribute("href", "/signup");
  });

  // --- Input Handling Tests ---
  it("updates form state on input change", async () => {
    render(<SigninForm />, { wrapper: MemoryRouter });
    const { emailInput, passwordInput } = getFormElements();

    await user.type(emailInput, "test@test.com");
    expect(emailInput).toHaveValue("test@test.com");

    await user.type(passwordInput, "secure123");
    expect(passwordInput).toHaveValue("secure123");
  });

  it("updates honeypot field value on change", async () => {
    render(<SigninForm />, { wrapper: MemoryRouter });
    const { urlHoneypotInput } = getFormElements();

    await user.type(urlHoneypotInput, "http://spam.com");
    expect(urlHoneypotInput).toHaveValue("http://spam.com");
  });

  // --- Honeypot Test ---
  it("prevents submission if honeypot field is filled", async () => {
    render(<SigninForm />, { wrapper: MemoryRouter });
    const { emailInput, passwordInput, urlHoneypotInput, submitButton } =
      getFormElements();

    await user.type(emailInput, MOCK_USER.email);
    await user.type(passwordInput, "password");
    await user.type(urlHoneypotInput, "some-value"); // Fill honeypot

    // Ensure signIn is not called if honeypot is filled
    mockSignIn.mockImplementation(() => {
      throw new Error("signIn should not be called when honeypot is filled");
    });

    await user.click(submitButton);

    // Wait for potential state updates (like isLoading changing)
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent("Sign in");
    });

    // Assert that the signIn function was NOT called
    expect(mockSignIn).not.toHaveBeenCalled();
    expect(mockAddToast).not.toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // --- Standard Sign-in Tests (Email/Password) ---
  it("handles successful sign-in", async () => {
    render(<SigninForm />, { wrapper: MemoryRouter });

    const { submitButton } = getFormElements();

    await fillForm(MOCK_USER.email, "password");

    await user.click(submitButton);

    // Assert button is disabled and text changes while loading
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Signing in...");
    vi.runOnlyPendingTimers();

    // Wait for the signIn promise to resolve and state to update
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent("Sign in");
    });

    // Assert that signIn was called with the correct form data
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith({
      email: MOCK_USER.email,
      password: "password",
      url: "",
    });

    // Assert that the success toast was called
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(
      `Welcome back, ${MOCK_USER.name}!`,
      "success"
    );

    // Assert that navigate was called with the correct redirect path
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
  });

  it("handles failed sign-in", async () => {
    // The default mockSignIn success needs to be overridden for this test with an error
    mockSignIn.mockRejectedValue(MOCK_ERROR);

    render(<SigninForm />, { wrapper: MemoryRouter });

    const { submitButton } = getFormElements();

    // Fill the form using invalid credentials (won't match MSW mock login)
    await fillForm("wrong@example.com", "wrongpassword");

    await user.click(submitButton);

    // Assert button is disabled while loading
    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Signing in...");
    vi.runOnlyPendingTimers();

    // Wait for the signIn promise to reject and state to update
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled(); // Button should be enabled again
      expect(submitButton).toHaveTextContent("Sign in"); // Text should revert
    });

    // Assert that signIn was called
    expect(mockSignIn).toHaveBeenCalledTimes(1);
    expect(mockSignIn).toHaveBeenCalledWith({
      email: "wrong@example.com",
      password: "wrongpassword",
      url: "",
    });

    // Assert that the error toast was called with the error message from the rejected promise
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(MOCK_ERROR.message, "error");

    // Assert that navigate was NOT called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  // --- OAuth Sign-in Tests ---
  it("handles successful Google sign-in", async () => {
    render(<SigninForm />, { wrapper: MemoryRouter });

    const { googleButton, submitButton, microsoftButton, facebookButton } =
      getFormElements();

    await user.click(googleButton);

    // Assert buttons are disabled while loading
    expect(googleButton).toBeDisabled();
    expect(submitButton).toBeDisabled();
    expect(microsoftButton).toBeDisabled();
    expect(facebookButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Signing in...");

    vi.runOnlyPendingTimers();

    // Wait for the promise to resolve and state to update
    await waitFor(() => {
      expect(googleButton).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
      expect(microsoftButton).not.toBeDisabled();
      expect(facebookButton).not.toBeDisabled();
      expect(submitButton).toHaveTextContent("Sign in");
    });

    // Assert that signInWithGoogle was called
    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);
    expect(mockSignIn).not.toHaveBeenCalled();

    // Assert navigate was called
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });

    // Assert no toast was called on success
    expect(mockAddToast).not.toHaveBeenCalled();
  });

  it("handles failed Google sign-in", async () => {
    mockSignInWithGoogle.mockRejectedValue(new Error("Google auth failed"));

    render(<SigninForm />, { wrapper: MemoryRouter });
    const { googleButton, submitButton } = getFormElements();

    await user.click(googleButton);

    // Assert buttons are disabled while loading
    expect(googleButton).toBeDisabled();

    vi.runOnlyPendingTimers();

    // Wait for the promise to reject
    await waitFor(() => {
      expect(googleButton).not.toBeDisabled();
      expect(submitButton).not.toBeDisabled();
    });

    // Assert that signInWithGoogle was called
    expect(mockSignInWithGoogle).toHaveBeenCalledTimes(1);

    // Assert that the generic error toast was called
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(
      "Failed to sign in with google",
      "error"
    );

    // Assert navigate was NOT called
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("handles successful Microsoft sign-in", async () => {
    render(<SigninForm />, { wrapper: MemoryRouter });

    const { microsoftButton } = getFormElements();
    await user.click(microsoftButton);

    expect(microsoftButton).toBeDisabled();

    vi.runOnlyPendingTimers();

    await waitFor(() => expect(microsoftButton).not.toBeDisabled());

    expect(mockSignInWithMicrosoft).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    expect(mockAddToast).not.toHaveBeenCalled();
  });

  it("handles failed Microsoft sign-in", async () => {
    mockSignInWithMicrosoft.mockRejectedValue(
      new Error("Microsoft auth failed")
    );
    render(<SigninForm />, { wrapper: MemoryRouter });
    const { microsoftButton } = getFormElements();

    await user.click(microsoftButton);

    expect(microsoftButton).toBeDisabled();

    vi.runOnlyPendingTimers();

    await waitFor(() => expect(microsoftButton).not.toBeDisabled());

    expect(mockSignInWithMicrosoft).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(
      "Failed to sign in with microsoft",
      "error"
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it("handles successful Facebook sign-in", async () => {
    render(<SigninForm />, { wrapper: MemoryRouter });

    const { facebookButton } = getFormElements();
    await user.click(facebookButton);

    expect(facebookButton).toBeDisabled();

    vi.runOnlyPendingTimers();

    await waitFor(() => expect(facebookButton).not.toBeDisabled());

    expect(mockSignInWithFacebook).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith("/dashboard", { replace: true });
    expect(mockAddToast).not.toHaveBeenCalled();
  });

  it("handles failed Facebook sign-in", async () => {
    mockSignInWithFacebook.mockRejectedValue(new Error("Facebook auth failed"));
    render(<SigninForm />, { wrapper: MemoryRouter });
    const { facebookButton } = getFormElements();

    await user.click(facebookButton);

    expect(facebookButton).toBeDisabled();

    vi.runOnlyPendingTimers();

    await waitFor(() => expect(facebookButton).not.toBeDisabled());

    expect(mockSignInWithFacebook).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledTimes(1);
    expect(mockAddToast).toHaveBeenCalledWith(
      "Failed to sign in with facebook",
      "error"
    );
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
