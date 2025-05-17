import { useNavigate } from "react-router-dom";
import "@/styles/cta.css";

export default function Cta() {
  const navigate = useNavigate();
  return (
    <section className="cta">
      <div className="container">
        <div className="cta-content">
          <h2>Ready to transform how your team works?</h2>
          <p>
            Join thousands of companies that use our platform to build better
            products.
          </p>
          <div className="cta-buttons">
            <button
              onClick={() => navigate("/signin")}
              className="button button-primary"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => navigate("/demo")}
              className="button button-secondary"
            >
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
