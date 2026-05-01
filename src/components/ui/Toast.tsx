"use client";
import { createContext, useContext, useState, useCallback, useRef } from "react";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = "info") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    setTimeout(() => remove(id), 4000);
  }, [remove]);

  const success = useCallback((msg: string) => toast(msg, "success"), [toast]);
  const error   = useCallback((msg: string) => toast(msg, "error"),   [toast]);
  const info    = useCallback((msg: string) => toast(msg, "info"),    [toast]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-500" />,
    error:   <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />,
    info:    <Info        className="w-5 h-5 flex-shrink-0 text-blue-500" />,
  };

  const bars = {
    success: "bg-green-500",
    error:   "bg-red-500",
    info:    "bg-blue-500",
  };

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-[calc(100vw-2rem)] max-w-sm pointer-events-none"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="alert"
            className="pointer-events-auto bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex items-start gap-3 p-4 animate-slide-up"
          >
            {icons[t.type]}
            <p className="text-sm text-gray-800 flex-1 leading-snug">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
              className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors -mt-0.5"
            >
              <X className="w-4 h-4" />
            </button>
            <div className={`absolute bottom-0 left-0 h-0.5 ${bars[t.type]} animate-shrink`} />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside ToastProvider");
  return ctx;
}
