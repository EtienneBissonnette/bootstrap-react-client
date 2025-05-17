import { useState, useRef, useEffect } from "react";
import { useToast } from "@/providers/toast-provider";
import { ButtonSpinnerIcon, SuccessIcon } from "@/assets/icons/Icons";
import "@/styles/contact.css";
import submitContact from "@/api/contact/services/submit-contact";
import { ApiError } from "@/types/api";

export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  privacy: boolean;
  address?: string; //honeypot field
}

interface ContactErrors {
  name?: string;
  email?: string;
  message?: string;
  privacy?: string;
}

const MIN_SUBMISSION_TIME = 3000;

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    phone: "",
    message: "",
    privacy: false,
    address: "",
  });

  const [errors, setErrors] = useState<ContactErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { addToast } = useToast();

  const formLoadTime = useRef<number>(Date.now());

  useEffect(() => {
    formLoadTime.current = Date.now();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ContactErrors = {};
    const { name, email, message, privacy, address: honeypot } = formData;

    // --- Honeypot Check ---
    if (honeypot) {
      return false;
    }

    // --- Field Validations ---
    if (!name.trim()) {
      newErrors.name = "Name is required";
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!message.trim()) {
      newErrors.message = "Message is required";
    } else if (message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters";
    }

    if (!privacy) {
      newErrors.privacy = "You must accept the privacy policy";
    }

    // --- Time Check ---
    const timeElapsed = Date.now() - formLoadTime.current;
    if (timeElapsed < MIN_SUBMISSION_TIME && timeElapsed > 0) {
      addToast("Submission sent to quickly, please retry.", "warning");
      return false;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === "checkbox";

    const fieldName = name as keyof ContactFormData;

    setFormData((prevData) => ({
      ...prevData,
      [fieldName]: isCheckbox ? (e.target as HTMLInputElement).checked : value,
    }));

    // Clear error when field is edited, *unless* it's the honeypot field
    const errorKey = name as keyof ContactErrors;
    if (name !== "honeypot") {
      if (errors[errorKey]) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          [errorKey]: undefined,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    setErrors({});

    try {
      await submitContact(formData);
      addToast("Message sent successfully!", "success");

      setIsSubmitted(true);

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        privacy: false,
        address: "",
      });

      window.scrollTo(0, 0);
    } catch (err: unknown) {
      addToast((err as ApiError).message, "error");
    } finally {
      setIsSubmitting(false);
      formLoadTime.current = Date.now();
    }
  };

  const resetForm = () => {
    setIsSubmitted(false);
    setErrors({});

    setFormData({
      name: "",
      email: "",
      phone: "",
      message: "",
      privacy: false,
      address: "",
    });
    formLoadTime.current = Date.now();
  };
  return (
    <div className="contact-card">
      {isSubmitted ? (
        <div className="success-message">
          <SuccessIcon />
          <h3 className="success-title">Thank You!</h3>
          <p className="success-description">
            Your message has been received. We'll get back to you as soon as
            possible.
          </p>
          <button className="button button-outline" onClick={resetForm}>
            Send another message
          </button>
        </div>
      ) : (
        <>
          <div className="card-header">
            <h2>Send us a message</h2>
            <p>Fill out the form below and we'll respond within 24-48 hours.</p>
          </div>
          <form onSubmit={handleSubmit} noValidate>
            <div className="card-content">
              {/* --- Honeypot Field --- */}
              <div
                style={{
                  position: "absolute",
                  left: "-9999px",
                  top: "-9999px",
                  width: "1px",
                  height: "1px",
                  overflow: "hidden",
                  opacity: 0,
                }}
                aria-hidden="true"
              >
                <label htmlFor="address">Street Address</label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  tabIndex={-1}
                  autoComplete="new-password" // Hint to browser not to autofill
                />
              </div>
              {/* --- End Honeypot Field --- */}

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="name">
                    Full Name <span className="required">*</span>
                  </label>
                  <input
                    id="name"
                    name="name"
                    className={`form-input ${errors.name ? "input-error" : ""}`}
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    aria-invalid={errors.name ? "true" : "false"}
                    aria-describedby={errors.name ? "name-error" : undefined}
                    maxLength={20}
                  />
                  {errors.name && (
                    <div id="name-error" className="form-error">
                      {errors.name}
                    </div>
                  )}
                </div>
                <div className="form-field">
                  <label className="form-label" htmlFor="email">
                    Email <span className="required">*</span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    className={`form-input ${
                      errors.email ? "input-error" : ""
                    }`}
                    type="email"
                    placeholder="john.doe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    aria-invalid={errors.email ? "true" : "false"}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    maxLength={100}
                  />
                  {errors.email && (
                    <div id="email-error" className="form-error">
                      {errors.email}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="form-label" htmlFor="phone">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    className="form-input"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.phone}
                    onChange={handleChange}
                    maxLength={20}
                  />
                  <div className="form-description">Optional</div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="message">
                  Message <span className="required">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  className={`form-textarea ${
                    errors.message ? "input-error" : ""
                  }`}
                  placeholder="Please describe how we can help you..."
                  value={formData.message}
                  onChange={handleChange}
                  rows={5}
                  aria-invalid={errors.message ? "true" : "false"}
                  aria-describedby={
                    errors.message ? "message-error" : undefined
                  }
                  maxLength={1000}
                ></textarea>
                {errors.message && (
                  <div id="message-error" className="form-error">
                    {errors.message}
                  </div>
                )}
              </div>

              <div className="checkbox-container">
                <input
                  id="privacy"
                  name="privacy"
                  type="checkbox"
                  className={`checkbox-input ${
                    errors.privacy ? "input-error" : ""
                  }`}
                  checked={formData.privacy}
                  onChange={handleChange}
                  aria-invalid={errors.privacy ? "true" : "false"}
                  aria-describedby={
                    errors.privacy ? "privacy-error" : undefined
                  }
                />
                <div className="checkbox-label">
                  <label className="form-label" htmlFor="privacy">
                    I agree to the privacy policy{" "}
                    <span className="required">*</span>
                  </label>
                  <div className="form-description">
                    By submitting this form, you agree to our{" "}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: "var(--primary)",
                        textDecoration: "underline",
                      }}
                    >
                      privacy policy
                    </a>
                    .
                  </div>
                  {errors.privacy && (
                    <div id="privacy-error" className="form-error">
                      {errors.privacy}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="card-footer">
              <button
                type="submit"
                className="button button-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="button-loading">
                    <ButtonSpinnerIcon />
                    Sending...
                  </div>
                ) : (
                  "Send Message"
                )}
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
