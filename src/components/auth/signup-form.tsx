import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import {
  GoogleIcon,
  FacebookIcon,
  MicrosoftIcon,
  ButtonSpinnerIcon,
} from "@/assets/icons/Icons";
import "@/styles/auth.css";
import { ApiError } from "@/types/api";

export interface SignupFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface SignupErrors {
  passwordLength?: string;
  passwordConfirm?: string;
}

export default function SignupForm() {
  const navigate = useNavigate();
  const { signUp, signInWithGoogle, signInWithMicrosoft, signInWithFacebook } =
    useAuth();
  const { addToast } = useToast();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errors, setErrors] = useState<SignupErrors>({});
  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const newErrors: SignupErrors = {};

    if (formData.password !== formData.confirmPassword) {
      newErrors.passwordConfirm = "Passwords do not match";
      setIsLoading(false);
    }
    if (formData.password.length < 8) {
      newErrors.passwordLength = "Password must be at least 8 characters long";
      setIsLoading(false);
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await signUp(formData);
        navigate("/dashboard");
      } catch (err: unknown) {
        addToast((err as ApiError).message, "error");
        setIsLoading(false);
      }
    }
  };

  const handleOAuthSignIn = async (
    provider: "google" | "microsoft" | "facebook"
  ) => {
    setIsLoading(true);
    setErrors({});
    try {
      console.log(`Simulating sign in with ${provider}`); // Placeholder
      if (provider === "google") {
        await signInWithGoogle();
      } else if (provider === "microsoft") {
        await signInWithMicrosoft();
      } else if (provider === "facebook") {
        await signInWithFacebook();
      }
      navigate("/dashboard");
    } catch {
      addToast(`Failed to sign up with ${provider}`, "error");
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container signup-container">
      <div className="auth-header">
        <h1>Create an account</h1>
        <p>Sign up to get started with our platform</p>
      </div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Full Name</label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter your full name"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter your email"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Create a password"
            required
          />
          {errors.passwordLength && (
            <p className="form-error">{errors.passwordLength}</p>
          )}
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <input
            id="confirmPassword"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            required
          />
          {errors.passwordConfirm && (
            <p className="form-error">{errors.passwordConfirm}</p>
          )}
        </div>
        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? (
            <div className="button-loading">
              <ButtonSpinnerIcon />
              Creating account...
            </div>
          ) : (
            "Create account"
          )}
        </button>
      </form>
      <div className="auth-oauth-column">
        <div className="auth-divider">
          <span>or continue with</span>
        </div>
        <div className="oauth-buttons">
          <button
            type="button"
            className="oauth-button google"
            onClick={() => handleOAuthSignIn("google")}
            disabled={isLoading}
          >
            <GoogleIcon /> <span>Google</span>
          </button>
          <button
            type="button"
            className="oauth-button microsoft"
            onClick={() => handleOAuthSignIn("microsoft")}
            disabled={isLoading}
          >
            <MicrosoftIcon /> <span>Microsoft</span>
          </button>
          <button
            type="button"
            className="oauth-button facebook"
            onClick={() => handleOAuthSignIn("facebook")}
            disabled={isLoading}
          >
            <FacebookIcon /> <span>Facebook</span>
          </button>
        </div>
      </div>
      <div className="auth-footer">
        <p>
          Already have an account?{" "}
          <Link to="/signin" className="auth-link">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
