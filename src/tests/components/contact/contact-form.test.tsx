import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  vi,
  describe,
  afterEach,
  afterAll,
  it,
  expect,
  beforeEach,
} from "vitest";
import { ContactForm } from "@/components/contact/contact-form";
import { server } from "@/tests/mocks/server";
import { http, HttpResponse } from "msw";
import { CONTACT_API_ENDPOINT } from "@/api/contact/endpoints";
import { API_BASE_URL } from "@/api";
import { contactHandlerSpy } from "@/tests/mocks/contact-handler";

const fullContactUrl = `${API_BASE_URL}${CONTACT_API_ENDPOINT}`;

// Mock the useToast hook
const mockAddToast = vi.fn();
vi.mock("@/providers/toast-provider", () => ({
  useToast: () => ({
    addToast: mockAddToast,
  }),
}));

// Mock window.scrollTo
window.scrollTo = vi.fn();

describe("ContactForm", () => {
  const user = userEvent.setup({
    advanceTimers: vi.advanceTimersByTime.bind(vi),
  });

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  // Reset mocks after each test
  afterEach(() => {
    cleanup();
    server.resetHandlers();
    vi.runAllTimers();
  });

  afterAll(() => {
    vi.useRealTimers();
  });

  // Helper to fill the form with valid data
  const fillForm = async (honeypotValue = "") => {
    await user.type(screen.getByLabelText(/Full Name/i), "Test User");
    await user.type(screen.getByLabelText(/Email/i), "test@example.com");
    await user.type(screen.getByLabelText(/Phone Number/i), "1234567890"); // Optional field
    await user.type(
      screen.getByLabelText(/Message/i),
      "This is a test message with enough characters."
    );
    await user.click(screen.getByLabelText(/I agree to the privacy policy/i));

    // Fill honeypot if a value is provided
    if (honeypotValue) {
      await user.type(screen.getByLabelText(/Street Address/i), honeypotValue);
    }
  };

  // Helper to get required form fields and submit button
  const getFormElements = () => ({
    nameInput: screen.getByLabelText(/Full Name/i),
    emailInput: screen.getByLabelText(/Email/i),
    messageInput: screen.getByLabelText(/Message/i),
    privacyCheckbox: screen.getByLabelText(/I agree to the privacy policy/i),
    submitButton: screen.getByRole("button", { name: /Send Message/i }),
    honeypotInput: screen.getByLabelText(/Street Address/i),
  });

  // --- Initial Rendering Tests ---
  it("renders the form with required fields and submit button", () => {
    render(<ContactForm />);

    const {
      nameInput,
      emailInput,
      messageInput,
      privacyCheckbox,
      submitButton,
    } = getFormElements();

    expect(nameInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
    expect(messageInput).toBeInTheDocument();
    expect(privacyCheckbox).toBeInTheDocument();
    expect(submitButton).toBeInTheDocument();

    expect(screen.queryByText(/Thank You!/i)).not.toBeInTheDocument(); // Success message not visible initially
  });

  it("renders the honeypot field but it's visually hidden", () => {
    render(<ContactForm />);
    const { honeypotInput } = getFormElements();

    expect(honeypotInput).toBeInTheDocument();
    // Check for the CSS styles that hide it
    const styles = getComputedStyle(honeypotInput.parentElement!);
    expect(styles.position).toBe("absolute");
    expect(styles.left).toBe("-9999px");
    expect(styles.top).toBe("-9999px");
    expect(styles.overflow).toBe("hidden");
    expect(styles.opacity).toBe("0");
    expect(honeypotInput).toHaveAttribute("tabindex", "-1");
    expect(honeypotInput).toHaveAttribute("autocomplete", "new-password");
  });

  // --- Input Handling Tests ---
  it("updates form state on input change", async () => {
    render(<ContactForm />);
    const { nameInput, emailInput, messageInput, privacyCheckbox } =
      getFormElements();

    await user.type(nameInput, "Jane");
    expect(nameInput).toHaveValue("Jane");

    await user.type(emailInput, "jane@test.com");
    expect(emailInput).toHaveValue("jane@test.com");

    await user.type(messageInput, "Hello");
    expect(messageInput).toHaveValue("Hello");

    await user.click(privacyCheckbox);
    expect(privacyCheckbox).toBeChecked();

    await user.click(privacyCheckbox);
    expect(privacyCheckbox).not.toBeChecked();
  });

  // --- Validation Tests ---
  it("shows validation errors for required fields on submit if empty", async () => {
    render(<ContactForm />);

    const { submitButton } = getFormElements();

    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText("Name is required")).toBeInTheDocument();
      expect(screen.getByText("Email is required")).toBeInTheDocument();
      expect(screen.getByText("Message is required")).toBeInTheDocument();
      expect(
        screen.getByText("You must accept the privacy policy")
      ).toBeInTheDocument();

      // Check ARIA attributes are updated
      expect(screen.getByLabelText(/Full Name/i)).toHaveAttribute(
        "aria-invalid",
        "true"
      );
      expect(screen.getByLabelText(/Email/i)).toHaveAttribute(
        "aria-invalid",
        "true"
      );
      expect(screen.getByLabelText(/Message/i)).toHaveAttribute(
        "aria-invalid",
        "true"
      );
      expect(
        screen.getByLabelText(/I agree to the privacy policy/i)
      ).toHaveAttribute("aria-invalid", "true");
    });
  });

  it("shows validation error for name if too short", async () => {
    render(<ContactForm />);
    const { nameInput, submitButton } = getFormElements();

    await user.type(nameInput, "A"); // 1 character
    await user.click(submitButton);

    expect(
      screen.getByText("Name must be at least 2 characters")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("shows validation error for invalid email format", async () => {
    render(<ContactForm />);
    const { emailInput, submitButton } = getFormElements();

    await user.type(emailInput, "invalid-email");
    await user.click(submitButton);

    expect(
      screen.getByText("Please enter a valid email address")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("shows validation error for message if too short", async () => {
    render(<ContactForm />);
    const { messageInput, submitButton } = getFormElements();

    await user.type(messageInput, "Short msg"); // < 10 characters
    await user.click(submitButton);

    expect(
      screen.getByText("Message must be at least 10 characters")
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/Message/i)).toHaveAttribute(
      "aria-invalid",
      "true"
    );
  });

  it("clears validation error for a field when it is edited", async () => {
    render(<ContactForm />);
    const { nameInput, submitButton } = getFormElements();

    // Trigger initial validation error
    await user.click(submitButton);
    expect(screen.getByText("Name is required")).toBeInTheDocument();

    // Edit the field
    await user.type(nameInput, "Valid Name");

    // Error message should be gone
    expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toHaveAttribute(
      "aria-invalid",
      "false"
    );
  });

  it("prevents submission and shows warning toast if submitted too quickly", async () => {
    render(<ContactForm />);
    const { submitButton } = getFormElements();

    // Advance time just a little bit, less than MIN_SUBMISSION_TIME
    vi.advanceTimersByTime(1000);

    await fillForm(); // Fill with valid data

    // Mock the submitContactForm to throw if called, ensuring it wasn't
    const submitSpy = vi.fn();
    server.use(
      http.post(fullContactUrl, () => {
        submitSpy();
        return HttpResponse.json(
          { message: "Unexpected success" },
          { status: 200 }
        );
      })
    );

    await user.click(submitButton);
    vi.runOnlyPendingTimers();

    // Check that validation returned false due to time
    // The form doesn't explicitly show a "too quick" error message,
    // but it calls addToast and prevents the API call.
    await waitFor(() => {
      expect(mockAddToast).toHaveBeenCalledWith(
        expect.stringContaining("Submission sent to quickly, please retry."),
        "warning"
      );
    });

    // Assert that the API function was NOT called
    expect(submitSpy).not.toHaveBeenCalled();

    // Assert that no validation errors appeared (because it failed the time check first)
    expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
  });

  it("prevents submission if honeypot field is filled", async () => {
    render(<ContactForm />);
    const { submitButton } = getFormElements();

    await fillForm("Some address here");

    // Mock the submitContactForm to throw if called, ensuring it wasn't
    const submitSpy = vi.fn();
    server.use(
      http.post(fullContactUrl, () => {
        submitSpy();
        return HttpResponse.json(
          { message: "Unexpected success" },
          { status: 200 }
        );
      })
    );

    await user.click(submitButton);
    vi.runOnlyPendingTimers();

    // Assert that the API function was NOT called
    expect(submitSpy).not.toHaveBeenCalled();

    // Assert that no validation errors appeared (because it failed the honeypot check first)
    expect(screen.queryByText("Name is required")).not.toBeInTheDocument();
  });

  // --- Successful Submission Tests ---
  it("submits the form successfully and shows success message", async () => {
    render(<ContactForm />);
    const { submitButton } = getFormElements();

    // Advance time past the minimum submission time
    vi.advanceTimersByTime(4000);

    await fillForm();

    await user.click(submitButton);
    vi.runOnlyPendingTimers();
    // Assert button is disabled while submitting
    expect(submitButton).toBeDisabled();
    expect(screen.getByText("Sending...")).toBeInTheDocument();

    // Wait for the success message to appear (indicates API call resolved)
    await waitFor(() => {
      expect(screen.getByText("Thank You!")).toBeInTheDocument();
    });

    // Assert the success toast was called
    expect(mockAddToast).toHaveBeenCalledWith(
      "Message sent successfully!",
      "success"
    );

    // Assert window.scrollTo was called
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);

    // Assert the API handler was called with the correct data
    // We need to get the request body from the MSW mock handler
    await waitFor(() => expect(contactHandlerSpy).toHaveBeenCalledTimes(1));
    const { request } = contactHandlerSpy.mock.calls[0][0];
    const body = await request.json();

    expect(body).toEqual({
      name: "Test User",
      email: "test@example.com",
      phone: "1234567890",
      message: "This is a test message with enough characters.",
      privacy: true,
      address: "",
    });

    // Assert the "Send another message" button is visible
    expect(
      screen.getByRole("button", { name: /Send another message/i })
    ).toBeInTheDocument();

    // Assert form elements are no longer in the document (because success message is shown)
    expect(
      screen.queryByRole("button", { name: /Send Message/i })
    ).not.toBeInTheDocument();
  });

  // --- Failed Submission Tests (API Error) ---
  it("handles API submission error and shows error toast", async () => {
    render(<ContactForm />);
    const { submitButton } = getFormElements();

    // Advance time past the minimum submission time
    vi.advanceTimersByTime(4000);

    await fillForm();

    // Mock the API handler to return an error
    server.use(
      http.post(fullContactUrl, () => {
        return HttpResponse.json(
          { message: "Failed to send message from backend" },
          { status: 500 }
        );
      })
    );

    await user.click(submitButton);

    // Assert button is disabled while submitting
    expect(submitButton).toBeDisabled();

    // Wait for the submit button to become enabled again (indicates API call resolved)
    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    // Assert the error toast was called with default error when failing to send contact email
    expect(mockAddToast).toHaveBeenCalledWith(
      "Failed to send contact email. Please try again.",
      "error"
    );

    // Assert success message is NOT shown
    expect(screen.queryByText("Thank You!")).not.toBeInTheDocument();

    // Assert form fields are NOT cleared on error
    expect(screen.getByLabelText(/Full Name/i)).toHaveValue("Test User");
    expect(screen.getByLabelText(/Email/i)).toHaveValue("test@example.com");
    expect(screen.getByLabelText(/Phone Number/i)).toHaveValue("1234567890");
    expect(screen.getByLabelText(/Message/i)).toHaveValue(
      "This is a test message with enough characters."
    );
    expect(
      screen.getByLabelText(/I agree to the privacy policy/i)
    ).toBeChecked(); // Checkbox state remains

    // Assert window.scrollTo was NOT called
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  it("handles API submission error with non-json response", async () => {
    render(<ContactForm />);
    const { submitButton } = getFormElements();

    vi.advanceTimersByTime(4000); // Advance time

    await fillForm();

    // Mock the API handler to return a plain text error response
    server.use(
      http.post(fullContactUrl, () => {
        return new HttpResponse("Something went wrong", {
          status: 500,
          statusText: "Internal Server Error",
        });
      })
    );

    await user.click(submitButton);

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });

    // Assert the error toast was called with default error when failing to send contact email
    expect(mockAddToast).toHaveBeenCalledWith(
      "Failed to send contact email. Please try again.",
      "error"
    );

    // Assert form fields are NOT cleared
    expect(screen.getByLabelText(/Full Name/i)).toHaveValue("Test User");
    // ... check other fields remain ...
  });

  it("resets the form when 'Send another message' is clicked", async () => {
    render(<ContactForm />);
    const { submitButton } = getFormElements();

    // Advance time past the minimum submission time
    vi.advanceTimersByTime(4000);

    await fillForm();

    await user.click(submitButton);
    vi.runOnlyPendingTimers();

    // Assert button is disabled while submitting
    expect(submitButton).toBeDisabled();
    expect(screen.getByText("Sending...")).toBeInTheDocument();

    // Wait for the success message to appear (indicates API call resolved)
    await waitFor(() => {
      expect(screen.getByText("Thank You!")).toBeInTheDocument();
    });

    // Get the reset button and click it
    const resetButton = screen.getByRole("button", {
      name: /Send another message/i,
    });
    await user.click(resetButton);

    // Assert the form is visible again
    const newSubmitButton = screen.getByRole("button", {
      name: /Send Message/i,
    });
    expect(newSubmitButton).toBeInTheDocument();
    expect(screen.queryByText("Thank You!")).not.toBeInTheDocument(); // Success message hidden

    // Assert form fields are cleared
    expect(screen.getByLabelText(/Full Name/i)).toHaveValue("");
    expect(screen.getByLabelText(/Email/i)).toHaveValue("");
    expect(screen.getByLabelText(/Phone Number/i)).toHaveValue("");
    expect(screen.getByLabelText(/Message/i)).toHaveValue("");
    expect(
      screen.getByLabelText(/I agree to the privacy policy/i)
    ).not.toBeChecked();

    // Asserts the TIMEOUT is reset, this second submit shouldn't pass due to quick submit
    vi.advanceTimersByTime(200);
    await fillForm();
    await user.click(newSubmitButton);
    expect(contactHandlerSpy).toHaveBeenCalledOnce(); //second try never called too quick
  });
});
