import "@/styles/pricing.css";
import { forwardRef } from "react";
import { useNavigate } from "react-router-dom";

type PricingTier = {
  id: number;
  name: string;
  price: string;
  description: string;
  features: string[];
  isPopular?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface PricingProps {}

const pricingTiers: PricingTier[] = [
  {
    id: 1,
    name: "Starter",
    price: "$29",
    description: "Perfect for small teams and startups",
    features: [
      "Up to 5 team members",
      "10 projects",
      "Basic analytics",
      "24-hour support",
    ],
  },
  {
    id: 2,
    name: "Professional",
    price: "$79",
    description: "Ideal for growing businesses",
    features: [
      "Up to 20 team members",
      "Unlimited projects",
      "Advanced analytics",
      "Priority support",
      "Custom integrations",
    ],
    isPopular: true,
  },
  {
    id: 3,
    name: "Enterprise",
    price: "Custom",
    description: "For large organizations with specific needs",
    features: [
      "Unlimited team members",
      "Unlimited projects",
      "Advanced security",
      "Dedicated account manager",
      "Custom training",
      "SLA guarantees",
    ],
  },
];

const Pricing = forwardRef<HTMLElement, PricingProps>((_props, ref) => {
  const navigate = useNavigate();

  const handleClick =
    (tier: PricingTier) => (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();

      if (tier.price === "Custom") {
        navigate("/contact");
      } else {
        navigate("/signup");
      }
    };

  return (
    <section className="pricing" id="pricing" ref={ref}>
      <div className="container">
        <div className="section-header">
          <h2>Simple, transparent pricing</h2>
          <p>Choose the plan that's right for your team</p>
        </div>
        <div className="pricing-grid">
          {pricingTiers.map((tier) => (
            <div
              className={`pricing-card ${tier.isPopular ? "popular" : ""}`}
              key={tier.id}
            >
              {tier.isPopular && (
                <div className="popular-badge">Most Popular</div>
              )}
              <h3>{tier.name}</h3>
              <div className="price">
                <span className="amount">{tier.price}</span>
                {tier.price !== "Custom" && (
                  <span className="period">/month</span>
                )}
              </div>
              <p className="description">{tier.description}</p>
              <ul className="features-list">
                {tier.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              <button
                onClick={handleClick(tier)}
                className={`button ${
                  tier.isPopular ? "button-primary" : "button-outline"
                }`}
              >
                {tier.price === "Custom" ? "Contact Sales" : "Get Started"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default Pricing;
