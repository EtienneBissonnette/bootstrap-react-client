import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeToggle from "@/components/globals/theme-toggle";
import useMediaQuery from "@/hooks/useMediaQuery";
import "@/styles/header.css";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const isSmallScreen = useMediaQuery("(max-width:768px)");

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const navigateTo = (
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>,
    target: string
  ) => {
    e.preventDefault();
    toggleMenu();
    navigate(`/${target}`);
  };

  return (
    <>
      <div
        className={`drawer-overlay ${
          isMenuOpen && isSmallScreen ? "active" : ""
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      ></div>
      <header className="header">
        <div className="container">
          <div className="logo">
            <button onClick={() => navigate("/")}>
              <span>Company</span>
            </button>
          </div>

          <button
            className={`mobile-menu-button ${isMenuOpen ? "open" : ""}`}
            onClick={toggleMenu}
            aria-expanded={isMenuOpen}
            aria-label="Toggle menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <nav className={`nav ${isMenuOpen ? "open" : ""}`}>
            <div
              className={`toggle-container ${
                isMenuOpen && isSmallScreen ? "open" : ""
              }`}
            >
              <ThemeToggle />
            </div>
            <ul>
              <li>
                <a
                  onClick={(e) => {
                    navigateTo(e, "#features");
                  }}
                >
                  Features
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    navigateTo(e, "#testimonials");
                  }}
                >
                  Testimonials
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    navigateTo(e, "#pricing");
                  }}
                >
                  Pricing
                </a>
              </li>
              <li>
                <a
                  onClick={(e) => {
                    navigateTo(e, "contact");
                  }}
                >
                  Contact
                </a>
              </li>
            </ul>
            <div className="nav-actions">
              <button
                onClick={(e) => {
                  navigateTo(e, "signin");
                }}
                className="button button-secondary"
              >
                Login
              </button>
              <button
                onClick={(e) => {
                  navigateTo(e, "signup");
                }}
                className="button button-primary"
              >
                Sign Up
              </button>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
