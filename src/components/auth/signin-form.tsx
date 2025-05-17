import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  GoogleIcon,
  FacebookIcon,
  MicrosoftIcon,
  ButtonSpinnerIcon,
} from "@/assets/icons/Icons";
import { useAuth } from "@/providers/auth-provider";
import { useToast } from "@/providers/toast-provider";
import { ApiError } from "@/types/api";

export interface SigninFormData {
  email: string;
  password: string;
  url?: string; // honeypot field
}

export default function SigninForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { signIn, signInWithGoogle, signInWithMicrosoft, signInWithFacebook } =
    useAuth();
  const { addToast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [formData, setFormData] = useState<SigninFormData>({
    email: "",
    password: "",
    url: "",
  });

  // Get the redirect path from location state or default to dashboard
  const from = location.state?.from?.pathname || "/dashboard";

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

    // --- Honeypot Check ---
    if (formData.url) {
      setIsLoading(false);
      return;
    }

    try {
      const user = await signIn(formData);
      if (user) {
        addToast(`Welcome back, ${user.name || user.email}!`, "success");
        navigate(from, { replace: true });
      } else {
        addToast("Sign in failed. Please check your credentials.", "error");
      }
    } catch (err: unknown) {
      addToast((err as ApiError).message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOAuthSignIn = async (
    provider: "google" | "microsoft" | "facebook"
  ) => {
    setIsLoading(true);

    try {
      if (provider === "google") {
        await signInWithGoogle();
      } else if (provider === "microsoft") {
        await signInWithMicrosoft();
      } else if (provider === "facebook") {
        await signInWithFacebook();
      }
      navigate(from, { replace: true });
    } catch {
      addToast(`Failed to sign in with ${provider}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-form-container login-container">
      <div className="auth-header">
        <h1>Welcome back</h1>
        <p>Sign in to your account to continue</p>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
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
          <label htmlFor="url">Your Website URL</label>
          <input
            id="url"
            name="url"
            type="text"
            value={formData.url}
            onChange={handleChange}
            tabIndex={-1}
            autoComplete="new-password" // Hint to browser not to autofill
          />
        </div>
        {/* --- End Honeypot Field --- */}
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
          <div className="password-label-row">
            <label htmlFor="password">Password</label>
            <Link to="/reset-password" className="forgot-password">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter your password"
            required
          />
        </div>

        <button type="submit" className="auth-button" disabled={isLoading}>
          {isLoading ? (
            <div className="button-loading">
              <ButtonSpinnerIcon />
              Signing in...
            </div>
          ) : (
            "Sign in"
          )}
        </button>
      </form>

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
          <GoogleIcon />

          <span>Google</span>
        </button>

        <button
          type="button"
          className="oauth-button microsoft"
          onClick={() => handleOAuthSignIn("microsoft")}
          disabled={isLoading}
        >
          <MicrosoftIcon />
          <span>Microsoft</span>
        </button>

        <button
          type="button"
          className="oauth-button facebook"
          onClick={() => handleOAuthSignIn("facebook")}
          disabled={isLoading}
        >
          <FacebookIcon />
          <span>Facebook</span>
        </button>
      </div>

      <div className="auth-footer">
        <p>
          Don&apos;t have an account?{" "}
          <Link to="/signup" className="auth-link">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
