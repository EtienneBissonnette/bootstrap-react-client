import { useEffect, useRef, useState } from "react";
import { ToastMessage } from "@/types/toast";
import "@/styles/toasts.css";

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

function Toast({ toast, onDismiss }: ToastProps) {
  const { id, message, type, duration } = toast;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [isExiting, setIsExiting] = useState(false);

  const dismiss = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setIsExiting(true);
    setTimeout(() => {
      onDismiss(id);
    }, 400);
  };

  useEffect(() => {
    if (duration) {
      timerRef.current = setTimeout(dismiss, duration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, duration, onDismiss]);

  const handleDismissClick = () => {
    dismiss();
  };

  return (
    <div
      className={`toast ${type} ${isExiting ? "toast-exit-active" : ""}`}
      role={type === "error" || type === "warning" ? "alert" : "status"}
    >
      <span className="message">{message}</span>
      <button
        onClick={handleDismissClick}
        className="close-button"
        aria-label="Dismiss notification"
      >
        ×
      </button>
    </div>
  );
}

export default Toast;
