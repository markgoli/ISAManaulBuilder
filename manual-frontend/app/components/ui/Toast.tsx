'use client';

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faExclamationTriangle, faInfoCircle, faTimes } from '@fortawesome/free-solid-svg-icons';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (toast: Omit<Toast, 'id'>) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const showToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration (default 5 seconds)
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  };

  const showSuccess = (title: string, message?: string) => {
    showToast({ type: 'success', title, message });
  };

  const showError = (title: string, message?: string) => {
    showToast({ type: 'error', title, message, duration: 7000 }); // Longer for errors
  };

  const showWarning = (title: string, message?: string) => {
    showToast({ type: 'warning', title, message });
  };

  const showInfo = (title: string, message?: string) => {
    showToast({ type: 'info', title, message });
  };

  const getToastStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: 'text-green-600',
          iconComponent: faCheckCircle
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-600',
          iconComponent: faExclamationTriangle
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-600',
          iconComponent: faExclamationTriangle
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: 'text-blue-600',
          iconComponent: faInfoCircle
        };
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showWarning, showInfo }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
        {toasts.map((toast) => {
          const styles = getToastStyles(toast.type);
          return (
            <div
              key={toast.id}
              className={`
                ${styles.container}
                border rounded-lg shadow-lg p-4 
                transform transition-all duration-300 ease-in-out
                animate-slide-in-right
              `}
            >
              <div className="flex items-start">
                <div className={`flex-shrink-0 ${styles.icon}`}>
                  <FontAwesomeIcon icon={styles.iconComponent} className="w-5 h-5" />
                </div>
                <div className="ml-3 flex-1">
                  <div className="font-medium text-sm">
                    {toast.title}
                  </div>
                  {toast.message && (
                    <div className="text-sm mt-1 opacity-90">
                      {toast.message}
                    </div>
                  )}
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className={`
                    flex-shrink-0 ml-4 ${styles.icon} hover:opacity-70 
                    transition-opacity duration-200
                  `}
                >
                  <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

// CSS for animations (add to globals.css)
export const toastAnimations = `
@keyframes slide-in-right {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.animate-slide-in-right {
  animation: slide-in-right 0.3s ease-out;
}
`;

export default ToastProvider;
