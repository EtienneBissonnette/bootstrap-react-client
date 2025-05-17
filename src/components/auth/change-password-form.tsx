import type React from "react";

import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import useScrollToTop from "@/hooks/useScrollTop";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { ApiError } from "@/types/api";
import { ButtonSpinnerIcon, SuccessIcon } from "@/assets/icons/Icons";
import "@/styles/auth.css";

interface ResetErrors {
  passwordLength?: string;
  passwordConfirm?: string;
}

export default function ChangePasswordForm() {
  useScrollToTop();

  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<ResetErrors>({});

  const { confirmReset } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token || !email) {
      addToast("Invalid or expired reset link. Please try again.", "error");
      navigate("/reset-password");
    }
  }, [token, email, addToast, navigate]);

  const validatePasswords = (): boolean => {
    if (password.length < 8) {
      setPasswordError({
        passwordLength: "Password must be at least 8 characters long",
      });
      return false;
    }

    if (password !== confirmPassword) {
      setPasswordError({ passwordConfirm: "Passwords do not match" });
      return false;
    }

    setPasswordError({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validatePasswords()) {
      return;
    }

    setIsLoading(true);
    try {
      if (token && password) {
        await confirmReset(token, password);
        setSuccess(true);
      }
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
          <h2>Password Reset Successful</h2>
          <p>
            Your password has been successfully reset. You can now sign in with
            your new password.
          </p>
          <button
            onClick={() => navigate("/signin")}
            style={{ width: "200px" }}
            className="auth-button"
          >
            Sign in
          </button>
        </div>
      ) : (
        <>
          <div className="auth-header">
            <h1>Reset Password</h1>
            <p>Create a new password for your account</p>
          </div>
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                required
              />
              {passwordError.passwordLength && (
                <div className="form-error">{passwordError.passwordLength}</div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
              />
              {passwordError.passwordConfirm && (
                <div className="form-error">
                  {passwordError.passwordConfirm}
                </div>
              )}
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? (
                <div className="button-loading">
                  <ButtonSpinnerIcon />
                  Resetting...
                </div>
              ) : (
                "Reset Password"
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
