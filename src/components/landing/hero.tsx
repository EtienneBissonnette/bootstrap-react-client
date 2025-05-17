import { useNavigate } from "react-router-dom";
import "@/styles/hero.css";

export default function Hero() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <h1>Build beautiful products, faster.</h1>
          <p>
            Our platform helps teams design, develop, and ship better products
            with collaborative tools that bring everyone together.
          </p>
          <div className="hero-buttons">
            <button
              onClick={() => navigate("/signup")}
              className="button button-primary"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/demo")}
              className="button button-outline"
            >
              Request Demo
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="image-placeholder">
            <span>Product Dashboard Preview</span>
          </div>
        </div>
      </div>
    </section>
  );
}
