import "@/styles/features.css";
import { forwardRef } from "react";

type Feature = {
  id: number;
  title: string;
  description: string;
  icon: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface FeaturesProps {}

const features: Feature[] = [
  {
    id: 1,
    title: "Intuitive Interface",
    description:
      "Our clean, user-friendly interface helps teams work more efficiently.",
    icon: "💻",
  },
  {
    id: 2,
    title: "Powerful Analytics",
    description:
      "Gain insights with comprehensive analytics and reporting tools.",
    icon: "📊",
  },
  {
    id: 3,
    title: "Seamless Integration",
    description:
      "Connect with your favorite tools and services without friction.",
    icon: "🔄",
  },
  {
    id: 4,
    title: "Enterprise Security",
    description:
      "Rest easy with our enterprise-grade security and compliance features.",
    icon: "🔒",
  },
];

const Features = forwardRef<HTMLElement, FeaturesProps>((_props, ref) => {
  return (
    <section className="features" id="features" ref={ref}>
      <div className="container">
        <div className="section-header">
          <h2>Features that empower your team</h2>
          <p>
            Everything you need to manage projects, organize tasks, and build
            products.
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature) => (
            <div className="feature-card" key={feature.id}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

export default Features;
