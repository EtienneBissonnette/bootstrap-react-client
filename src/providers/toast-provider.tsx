/* eslint-disable react-refresh/only-export-components */
import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { ToastType, ToastMessage, ToastOptions } from "@/types/toast";

interface ToastContextType {
  addToast: (message: string, type: ToastType, options?: ToastOptions) => void;
  removeToast: (id: number) => void;
  toasts: ToastMessage[];
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

const DEFAULT_DURATION = 3000;

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const removeToast = useCallback((id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType, options?: ToastOptions) => {
      const id = Date.now() + Math.random();
      const newToast: ToastMessage = {
        id,
        message,
        type,
        duration: options?.duration || DEFAULT_DURATION,
      };
      setToasts((prevToasts) => [...prevToasts, newToast]);
    },
    []
  );

  const value = useMemo(
    () => ({
      addToast,
      removeToast,
      toasts,
    }),
    [toasts, addToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>{children}</ToastContext.Provider>
  );
}

export function useToast(): ToastContextType {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
