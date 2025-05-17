import Hero from "@/components/landing/hero";
import Features from "@/components/landing/features";
import Testimonials from "@/components/landing/testimonials";
import Pricing from "@/components/landing/pricing";
import Cta from "@/components/landing/cta";
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import useScrollToTop from "@/hooks/useScrollTop";

export default function Landing() {
  useScrollToTop();

  const featuresRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const pricingRef = useRef<HTMLDivElement>(null);

  const location = useLocation();

  useEffect(() => {
    if (location.hash === "#features" && featuresRef.current) {
      featuresRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (location.hash === "#testimonials" && testimonialsRef.current) {
      testimonialsRef.current.scrollIntoView({ behavior: "smooth" });
    }
    if (location.hash === "#pricing" && pricingRef.current) {
      pricingRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [location]);

  return (
    <main>
      <Hero />
      <Features ref={featuresRef} />
      <Testimonials ref={testimonialsRef} />
      <Pricing ref={pricingRef} />
      <Cta />
    </main>
  );
}
