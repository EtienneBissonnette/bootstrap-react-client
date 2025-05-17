import type React from "react";

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useScrollToTop from "@/hooks/useScrollTop";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { ApiError } from "@/types/api";
import { ButtonSpinnerIcon, SuccessIcon } from "@/assets/icons/Icons";
import "@/styles/auth.css";

export default function ResetPasswordForm() {
  useScrollToTop();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");

  const { resetPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: unknown) {
      addToast((err as ApiError).message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      {success ? (
        <div className="auth-success">
          <SuccessIcon />
          <h2>Check your email</h2>
          <p>
            We&apos;ve sent a password reset link to <strong>{email}</strong>.
            Please check your inbox and follow the instructions to reset your
            password.
          </p>
          <p className="email-note">
            If you don&apos;t see the email, check your spam folder or{" "}
            <button
              type="button"
              className="resend-link"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              click here to resend
            </button>
            .
          </p>
          <button
            onClick={() => navigate("/signin")}
            style={{ width: "150px" }}
            className="auth-button"
          >
            Return to login
          </button>
        </div>
      ) : (
        <>
          <div className="auth-header">
            <h1>Reset Password</h1>
            <p>Enter your email to reset your password</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? (
                <div className="button-loading">
                  <ButtonSpinnerIcon />
                  Sending...
                </div>
              ) : (
                "Send reset link"
              )}
            </button>

            <div className="auth-footer">
              <p>
                Remember your password?{" "}
                <Link to="/signin" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
