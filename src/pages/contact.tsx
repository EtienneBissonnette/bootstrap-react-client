import { ContactForm } from "@/components/contact/contact-form";
import useScrollToTop from "@/hooks/useScrollTop";
import "@/styles/auth.css";

export default function Contact() {
  useScrollToTop();

  return (
    <main className="contact-page">
      <div className="contact-container">
        <ContactForm />
      </div>
    </main>
  );
}
