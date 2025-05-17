import "@/styles/testimonials.css";
import { forwardRef } from "react";

type Testimonial = {
  id: number;
  quote: string;
  author: string;
  role: string;
  company: string;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface TestimonialsProps {}

const testimonials: Testimonial[] = [
  {
    id: 1,
    quote:
      "This platform has transformed how our team collaborates. We've seen a 40% increase in productivity since implementing it.",
    author: "Sarah Johnson",
    role: "Product Manager",
    company: "TechCorp",
  },
  {
    id: 2,
    quote:
      "The intuitive interface and powerful features have made our workflow smoother than ever. Highly recommended!",
    author: "Michael Chen",
    role: "CTO",
    company: "Innovate Inc",
  },
  {
    id: 3,
    quote:
      "We've tried many solutions, but this one stands out for its simplicity and effectiveness. Our team loves it.",
    author: "Emily Rodriguez",
    role: "Design Lead",
    company: "Creative Studios",
  },
];

const Testimonials = forwardRef<HTMLElement, TestimonialsProps>(
  (_props, ref) => {
    return (
      <section className="testimonials" id="testimonials" ref={ref}>
        <div className="container">
          <div className="section-header">
            <h2>What our customers say</h2>
            <p>
              Don't just take our word for it - hear from some of our satisfied
              customers
            </p>
          </div>
          <div className="testimonials-grid">
            {testimonials.map((testimonial) => (
              <div className="testimonial-card" key={testimonial.id}>
                <blockquote>"{testimonial.quote}"</blockquote>
                <div className="testimonial-author">
                  <div className="author-avatar">
                    <div className="avatar-placeholder"></div>
                  </div>
                  <div className="author-info">
                    <h4>{testimonial.author}</h4>
                    <p>
                      {testimonial.role}, {testimonial.company}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }
);

export default Testimonials;
