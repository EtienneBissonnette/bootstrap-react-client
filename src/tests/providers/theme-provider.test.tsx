import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, useTheme } from "@/providers/theme-provider";

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});



// Test component that uses the theme context
function TestComponent() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <div data-testid="theme-value">{theme}</div>
      <button onClick={toggleTheme} data-testid="toggle-button">
        Toggle Theme
      </button>
    </div>
  );
}

describe("ThemeProvider", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.documentElement.removeAttribute("data-theme");
  });

  it("provides default light theme", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-value").textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("toggles theme when button is clicked", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId("toggle-button");
    fireEvent.click(toggleButton);

    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");

    fireEvent.click(toggleButton);

    expect(screen.getByTestId("theme-value").textContent).toBe("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("uses theme from localStorage if available", () => {
    localStorageMock.getItem.mockReturnValueOnce("dark");

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId("theme-value").textContent).toBe("dark");
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("saves theme to localStorage when changed", () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    const toggleButton = screen.getByTestId("toggle-button");
    fireEvent.click(toggleButton);

    expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "dark");
  });
});
