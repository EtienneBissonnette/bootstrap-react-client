import { render, screen, act } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { ToastProvider, useToast } from "@/providers/toast-provider";

// A simple component to consume the context for testing its state
const TestConsumer = () => {
  const { toasts, addToast, removeToast } = useToast();

  return (
    <div>
      <button
        onClick={() => addToast("Test Success", "success", { duration: 1000 })}
      >
        Add Success Toast
      </button>
      <button onClick={() => addToast("Test Error", "error")}>
        Add Error Toast (Default Duration)
      </button>
      {toasts.length > 0 && (
        <button onClick={() => removeToast(toasts[0].id)}>
          Remove First Toast
        </button>
      )}
      <div data-testid="toast-count">{toasts.length}</div>
      <ul>
        {toasts.map((toast) => (
          <li key={toast.id} data-testid={`toast-${toast.id}`}>
            {toast.message} - {toast.type} - {toast.duration}ms
          </li>
        ))}
      </ul>
    </div>
  );
};

describe("ToastProvider", () => {
  it("should initialize with an empty toasts array", () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });

  it("should add a toast when addToast is called", async () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );

    const addButton = screen.getByRole("button", {
      name: /Add Success Toast/i,
    });

    await act(async () => {
      addButton.click();
    });

    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");

    const toastItem = await screen.findByRole("listitem"); 
    expect(toastItem).toBeInTheDocument();
    expect(toastItem).toHaveTextContent("Test Success - success - 1000ms");
  });

  it("should add multiple toasts", async () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    
    const addSuccessButton = screen.getByRole("button", {
      name: /Add Success Toast/i,
    });
    const addErrorButton = screen.getByRole("button", {
      name: /Add Error Toast/i,
    });

    await act(async () => {
      addSuccessButton.click();
    });
    await act(async () => {
      addErrorButton.click();
    });

    expect(screen.getByTestId("toast-count")).toHaveTextContent("2");
    const toastItems = await screen.findAllByRole("listitem");
    expect(toastItems).toHaveLength(2);
    expect(toastItems[0]).toHaveTextContent("Test Success - success - 1000ms");
    expect(toastItems[1]).toHaveTextContent("Test Error - error - 3000ms");
  });

  it("should remove a toast when removeToast is called", async () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    const addSuccessButton = screen.getByRole("button", {
      name: /Add Success Toast/i,
    });

    // Add a toast first
    await act(async () => {
      addSuccessButton.click();
    });
    const initialToastItem = await screen.findByRole("listitem");
    expect(initialToastItem).toBeInTheDocument();
    expect(screen.getByTestId("toast-count")).toHaveTextContent("1");

    // Get the remove button (it appears after adding a toast)
    const removeButton = await screen.findByRole("button", {
      name: /Remove First Toast/i,
    });

    // Remove the toast
    await act(async () => {
      removeButton.click();
    });

    // Verify it's removed
    expect(screen.getByTestId("toast-count")).toHaveTextContent("0");
    expect(screen.queryByRole("listitem")).not.toBeInTheDocument();
  });
});
