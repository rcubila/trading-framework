import React, { useEffect } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose: () => void;
  className?: string;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  className = '',
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeClasses = {
    success: 'bg-success-main text-white',
    error: 'bg-error-main text-white',
    warning: 'bg-warning-main text-white',
    info: 'bg-primary-main text-white',
  };

  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
  };

  return (
    <AnimatedElement
      animation="slideInRight"
      className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${typeClasses[type]} ${className}`}
    >
      <div className="flex items-center space-x-2">
        <span className="text-lg">{icons[type]}</span>
        <span>{message}</span>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          ✕
        </button>
      </div>
    </AnimatedElement>
  );
}; 