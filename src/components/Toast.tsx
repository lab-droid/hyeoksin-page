import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'error';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColors = {
    success: 'bg-[#0052FF]',
    info: 'bg-zinc-800',
    error: 'bg-red-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className={`fixed bottom-6 right-6 z-50 text-white px-6 py-4 rounded-xl shadow-2xl font-medium tracking-tight ${bgColors[type]}`}
    >
      {message}
    </motion.div>
  );
}
