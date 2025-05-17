import {
  render,
  screen,
  act,
  waitForElementToBeRemoved,
  waitFor,
} from "@testing-library/react";
import { getRoles } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import { ToastProvider, useToast } from "@/providers/toast-provider";
import ToastContainer from "@/components/toasts/toast-container";

// Component to trigger toasts within the provider for testing the container
const ToastTrigger = () => {
  const { addToast } = useToast();
  return (
    <>
      <button
        onClick={() => {
          addToast("Visible Toast", "info");
        }}
      >
        Add Toast
      </button>
      <button
        onClick={() => addToast("Auto Dismiss", "success", { duration: 1000 })}
      >
        Add Auto Dismiss Toast
      </button>
    </>
  );
};

describe("ToastContainer", () => {
  vi.useRealTimers();

  it("should not render if there are no toasts", () => {
    render(
      <ToastProvider>
        <ToastContainer />
      </ToastProvider>
    );
    expect(
      screen.queryByRole("region", { name: /Notifications/i })
    ).not.toBeInTheDocument();
  });

  it("should render a toast when added via context", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger />
        <ToastContainer />
      </ToastProvider>
    );

    const addButton = screen.getByRole("button", {
      name: (content) => content === "Add Toast",
    });

    await act(async () => {
      await user.click(addButton);
    });

    const toastElement = await screen.findByRole("status");
    expect(toastElement).toBeInTheDocument();
    expect(toastElement).toHaveTextContent("Visible Toast");
    expect(toastElement).toHaveClass("toast info");
  });

  it("should render multiple toasts", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger />
        <ToastContainer />
      </ToastProvider>
    );
    const addButton = screen.getByRole("button", { name: /Add Toast/i });
    const addAutoButton = screen.getByRole("button", {
      name: /Add Auto Dismiss Toast/i,
    });

    await act(async () => {
      user.click(addButton);
    });
    await act(async () => {
      user.click(addAutoButton);
    });

    // Wait for *something* to appear to ensure rendering is likely don
    await screen.findByText("Visible Toast");

    // Get all roles within the container
    const toastContainer = await screen.findByRole("region", {
      name: /Notifications/i,
    });

    let toastElements: HTMLElement[] = [];

    await waitFor(() => {
      const roles = getRoles(toastContainer);
      toastElements = [...(roles.alert || []), ...(roles.status || [])];
      expect(toastElements.length).toBeGreaterThan(0);
    });

    expect(toastElements).toHaveLength(2);
    expect(toastElements[0]).toHaveTextContent("Visible Toast");
    expect(toastElements[1]).toHaveTextContent("Auto Dismiss");
  });

  it("should remove a toast when its close button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <ToastProvider>
        <ToastTrigger />
        <ToastContainer />
      </ToastProvider>
    );

    const addButton = screen.getByRole("button", { name: /Add Toast/i });
    await act(async () => {
      user.click(addButton);
    });

    expect(await screen.findByText("Visible Toast")).toBeInTheDocument();

    // Find the close button *within* the toast element
    const closeButton = screen.getByRole("button", {
      name: /Dismiss notification/i,
    });

    await act(async () => {
      user.click(closeButton);
    });

    await waitForElementToBeRemoved(() => screen.queryByText("Visible Toast"));
  });

  it("should remove a toast automatically after its duration", async () => {
    const user = userEvent.setup();

    render(
      <ToastProvider>
        <ToastTrigger />
        <ToastContainer />
      </ToastProvider>
    );
    const addAutoButton = screen.getByRole("button", {
      name: /Add Auto Dismiss Toast/i,
    });
    await act(async () => {
      user.click(addAutoButton);
    });

    // Check it's initially there
    expect(await screen.findByText("Auto Dismiss")).toBeInTheDocument();

    // Give enough time for waitForElementToBeRemoved to allow dismissal of toast in test ~(duration + animation_time)=1400ms
    await waitForElementToBeRemoved(() => screen.queryByText("Auto Dismiss"), {
      timeout: 2000,
    });
  });
});
