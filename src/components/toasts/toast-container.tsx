// src/components/toasts/ToastContainer.tsx (create this folder/file)
import { useToast } from "@/providers/toast-provider";
import Toast from "./toast";
import "@/styles/toasts.css";

function ToastContainer() {
  const { toasts, removeToast } = useToast();
  if (!toasts.length) {
    return null;
  }

  return (
    <div
      className="toast-container"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={removeToast} />
      ))}
    </div>
  );
}

export default ToastContainer;
