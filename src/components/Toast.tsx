import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

const iconMap = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
};

const colorMap = {
  success: 'text-green-400',
  error: 'text-red-400',
  info: 'text-blue-400',
  warning: 'text-yellow-400',
};

const bgMap = {
  success: 'bg-green-400/10 border-green-400/20',
  error: 'bg-red-400/10 border-red-400/20',
  info: 'bg-blue-400/10 border-blue-400/20',
  warning: 'bg-yellow-400/10 border-yellow-400/20',
};

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onClose?.(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const Icon = iconMap[type];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className={`fixed top-4 right-4 z-[1000] flex items-center gap-3 px-4 py-3 rounded-xl border shadow-xl backdrop-blur-md ${bgMap[type]} ${colorMap[type]} max-w-sm`}
        >
          <Icon size={20} />
          <p className="flex-1 text-sm font-medium text-foreground">{message}</p>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className="p-1 hover:bg-white/10 rounded-lg transition-smooth"
          >
            <X size={16} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Toast Manager for global usage
let toastListeners: ((toast: { id: string; message: string; type: ToastType }) => void)[] = [];
let toastIdCounter = 0;

export const toast = {
  show: (message: string, type: ToastType = 'info') => {
    const id = `toast-${toastIdCounter++}`;
    toastListeners.forEach(listener => listener({ id, message, type }));
  },
  success: (message: string) => toast.show(message, 'success'),
  error: (message: string) => toast.show(message, 'error'),
  info: (message: string) => toast.show(message, 'info'),
  warning: (message: string) => toast.show(message, 'warning'),
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

  useEffect(() => {
    toastListeners.push((toast) => {
      setToasts(prev => [...prev, toast]);
    });

    return () => {
      toastListeners = [];
    };
  }, []);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <>
      {children}
      <div className="fixed top-4 right-4 z-[1000] space-y-2">
        <AnimatePresence>
          {toasts.map(t => (
            <Toast
              key={t.id}
              message={t.message}
              type={t.type}
              onClose={() => removeToast(t.id)}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  );
};
