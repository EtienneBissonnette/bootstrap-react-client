import "@testing-library/jest-dom";
import { vi, beforeAll, afterEach, afterAll } from "vitest";
import { server } from "./mocks/server";

// --- MSW Setup ---
// Establish API mocking before all tests.


// Stubs jest.advanceTimersByTime with vi.advanceTimersByTime for compatibility with libraries expecting Jest's timer API
// Provides compatibility for userEvent (and potentially other libraries) by mapping jest.advanceTimersByTime to Vitest's vi.advanceTimersByTime
// Fixes fake timer integration issues by ensuring jest.advanceTimersByTime is available and points to Vitest's implementation
vi.stubGlobal('jest', { advanceTimersByTime: vi.advanceTimersByTime.bind(vi) });

// Fail on unhandled requests to ensure all API calls are mocked.
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));


afterEach(() => server.resetHandlers());

afterAll(() => server.close());

// --- Mock window.location ---
const originalLocation = window.location;

beforeAll(() => {
  const mockLocation = {
    ...originalLocation,
    assign: vi.fn(), 
    replace: vi.fn(),
    reload: vi.fn(),
    // We need href to be writable for direct assignment tests
    href: "",
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  delete (window as any).location;
  // Redefine 'location' property on window, making it writable
  Object.defineProperty(window, "location", {
    value: mockLocation,
    writable: true,
    configurable: true, // Important to allow deletion later if needed
  });
});

afterEach(() => {
  vi.mocked(window.location.assign).mockClear();
  vi.mocked(window.location.replace).mockClear();
  window.location.href = "";
});

afterAll(() => {
  // Restore original location object after all tests
  Object.defineProperty(window, "location", {
    value: originalLocation,
    writable: false,
    configurable: true,
  });
});

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
