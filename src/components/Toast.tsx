"use client";

import { useEffect, useState } from "react";

type ToastType = "success" | "error";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
}

export function Toast({ message, type = "success", duration = 3000 }: ToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(t);
  }, [message, duration]);

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-xl px-5 py-3.5 shadow-xl text-sm font-medium text-white transition-all animate-in fade-in slide-in-from-bottom-4 ${
        type === "success" ? "bg-zinc-900" : "bg-red-600"
      }`}
    >
      {type === "success" ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
        </svg>
      )}
      {message}
    </div>
  );
}
