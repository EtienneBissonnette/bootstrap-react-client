import { render, screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import Toast from "@/components/toasts/toast";
import { ToastMessage } from "@/types/toast";

// Mock data and functions
const mockOnDismiss = vi.fn();
const mockToast: ToastMessage = {
  id: 123,
  message: "Single Toast Message",
  type: "success",
  duration: 2000,
};
const mockToastNoError: ToastMessage = {
  id: 456,
  message: "Info Toast",
  type: "info",
  duration: 5000,
};
const mockToastNoDuration: ToastMessage = {
  id: 789,
  message: "No Duration Toast",
  type: "warning",
};

const ANIMATION_DURATION_MS = 400;

describe("Toast Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockOnDismiss.mockClear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should render the message and apply type class", () => {
    render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);
    expect(screen.getByText("Single Toast Message")).toBeInTheDocument();
    const toastDiv = screen.getByRole("status"); // Role for 'success' type
    expect(toastDiv).toHaveClass("toast success");
    expect(toastDiv).not.toHaveClass("toast-exit-active");
  });

  it("should set the correct role based on type", () => {
    const { rerender } = render(
      <Toast toast={mockToastNoError} onDismiss={mockOnDismiss} />
    );
    expect(screen.getByRole("status")).toBeInTheDocument(); // info -> status

    rerender(
      <Toast
        toast={{ ...mockToastNoError, type: "error" }}
        onDismiss={mockOnDismiss}
      />
    );
    expect(screen.getByRole("alert")).toBeInTheDocument(); // error -> alert

    rerender(
      <Toast
        toast={{ ...mockToastNoError, type: "warning" }}
        onDismiss={mockOnDismiss}
      />
    );
    expect(screen.getByRole("alert")).toBeInTheDocument(); // warning -> alert
  });

  it("should call onDismiss after duration + animation time", async () => {
    render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);

    // Should not be called immediately
    expect(mockOnDismiss).not.toHaveBeenCalled();

    // Advance timer just before duration ends
    await act(async () => {
      vi.advanceTimersByTime(1999);
    });
    expect(mockOnDismiss).not.toHaveBeenCalled();

    // Advance past duration - animation starts
    await act(async () => {
      vi.advanceTimersByTime(1);
    });
    const toastDiv = screen.getByRole("status");
    expect(toastDiv).toHaveClass("toast-exit-active");
    expect(mockOnDismiss).not.toHaveBeenCalled();

    // Advance past animation duration
    await act(async () => {
      vi.advanceTimersByTime(ANIMATION_DURATION_MS);
    });
    expect(mockOnDismiss).toHaveBeenCalledWith(mockToast.id);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it("should call onDismiss when close button is clicked after animation", async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(<Toast toast={mockToast} onDismiss={mockOnDismiss} />);

    const closeButton = screen.getByRole("button", {
      name: /Dismiss notification/i,
    });

    await act(async () => {
      user.click(closeButton);
    });

    // Should add exit class immediately, but not call onDismiss
    const toastDiv = screen.getByRole("status");
    expect(toastDiv).toHaveClass("toast-exit-active");
    expect(mockOnDismiss).not.toHaveBeenCalled();

    // Advance timer by animation duration
    await act(async () => {
      vi.advanceTimersByTime(ANIMATION_DURATION_MS);
    });

    // Now onDismiss should be called
    expect(mockOnDismiss).toHaveBeenCalledWith(mockToast.id);
    expect(mockOnDismiss).toHaveBeenCalledTimes(1);
  });

  it("should not call onDismiss automatically if no duration is provided", async () => {
    render(<Toast toast={mockToastNoDuration} onDismiss={mockOnDismiss} />);

    // Advance time significantly
    await act(async () => {
      vi.advanceTimersByTime(10000);
    });

    expect(mockOnDismiss).not.toHaveBeenCalled();
  });

  it("should clear timer on unmount", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const { unmount } = render(
      <Toast toast={mockToast} onDismiss={mockOnDismiss} />
    );

    unmount();

    // Expect clearTimeout to have been called (via the useEffect cleanup)
    expect(clearTimeoutSpy).toHaveBeenCalled();
    clearTimeoutSpy.mockRestore();
  });
});
