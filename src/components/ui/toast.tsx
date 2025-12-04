"use client";

import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info";
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = "info", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: "bg-green-500",
    error: "bg-orange-500",
    info: "bg-blue-500",
  };

  return (
    <div
      className={cn(
        "fixed bottom-20 left-4 right-4 z-50 rounded-lg p-4 text-white shadow-lg",
        typeStyles[type]
      )}
    >
      {message}
    </div>
  );
}
