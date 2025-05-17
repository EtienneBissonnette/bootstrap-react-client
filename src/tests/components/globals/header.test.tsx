import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { ThemeProvider } from "@/providers/theme-provider";
import Header from "@/components/globals/header";

describe("Header", () => {
  it("renders the logo and navigation links", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Company")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Testimonials")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
  });

  it("renders login and signup buttons", () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("toggles mobile menu when button is clicked", () => {
    const { container } = render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>
    );

    const mobileMenuButton = screen.getByLabelText("Toggle menu");

    const nav = container.querySelector(".nav");

    expect(nav).not.toHaveClass("open");

    fireEvent.click(mobileMenuButton);

    expect(nav).toHaveClass("open");

    fireEvent.click(mobileMenuButton);

    expect(nav).not.toHaveClass("open");
  });

  it("attempts to navigate when a link/button is clicked (example)", () => {
    const LocationDisplay = () => {
      const location = useLocation();
      return <div data-testid="location-display">{location.pathname}</div>;
    };

    render(
      <MemoryRouter initialEntries={["/home"]}>
        <ThemeProvider>
          <Header />
          <LocationDisplay />
        </ThemeProvider>
      </MemoryRouter>
    );

    const loginLink = screen.getByText("Login");
    fireEvent.click(loginLink);

    expect(screen.getByTestId("location-display")).toHaveTextContent("/signin");
  });
});
