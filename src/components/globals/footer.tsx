import { useNavigate } from "react-router-dom";
import { GithubIcon, LinkedInIcon, TwitterIcon } from "@/assets/icons/Icons";
import "@/styles/footer.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="logo">
              <button onClick={() => navigate("/")}>
                <span>Company</span>
              </button>
            </div>
            <p>Building the future of collaborative work.</p>
            <div className="social-links">
              <a href="https://twitter.com" aria-label="Twitter">
                <TwitterIcon />
              </a>
              <a href="https://linkedin.com" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
              <a href="https://github.com" aria-label="GitHub">
                <GithubIcon />
              </a>
            </div>
          </div>

          <div className="footer-links">
            <h3>Product</h3>
            <ul>
              <li>
                <a href="/features">Features</a>
              </li>
              <li>
                <a href="/pricing">Pricing</a>
              </li>
              <li>
                <a href="/integrations">Integrations</a>
              </li>
              <li>
                <a href="/changelog">Changelog</a>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h3>Company</h3>
            <ul>
              <li>
                <a href="/about">About Us</a>
              </li>
              <li>
                <a href="/careers">Careers</a>
              </li>
              <li>
                <a href="/blog">Blog</a>
              </li>
              <li>
                <a href="/contact">Contact</a>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h3>Resources</h3>
            <ul>
              <li>
                <a href="/documentation">Documentation</a>
              </li>
              <li>
                <a href="/guides">Guides</a>
              </li>
              <li>
                <a href="/support">Support</a>
              </li>
              <li>
                <a href="/api">API</a>
              </li>
            </ul>
          </div>

          <div className="footer-links">
            <h3>Legal</h3>
            <ul>
              <li>
                <a href="/privacy">Privacy Policy</a>
              </li>
              <li>
                <a href="/terms">Terms of Service</a>
              </li>
              <li>
                <a href="/security">Security</a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; {currentYear} Company, Inc. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
