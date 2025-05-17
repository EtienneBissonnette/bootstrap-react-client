import SigninForm from "@/components/auth/signin-form";
import SignupForm from "@/components/auth/signup-form";
import useScrollToTop from "@/hooks/useScrollTop";
import { useLocation } from "react-router-dom";
import ChangePasswordForm from "@/components/auth/change-password-form";
import ResetPasswordForm from "@/components/auth/reset-password-form";
import "@/styles/auth.css";

export default function Auth() {
  useScrollToTop();
  const location = useLocation();

  let authComponent: React.ReactNode;

  switch (location.pathname) {
    case "/signin":
      authComponent = <SigninForm />;
      break;
    case "/signup":
      authComponent = <SignupForm />;
      break;
    case "/reset-password":
      authComponent = <ResetPasswordForm />;
      break;
    case "/change-password":
      authComponent = <ChangePasswordForm />;
      break;
    default:
      authComponent = <p>Error: Invalid Authentication Path.</p>;
  }
  return (
    <main className="auth-page">
      <div className="auth-container">{authComponent}</div>
    </main>
  );
}
