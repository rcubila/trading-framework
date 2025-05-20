import React, { useEffect, useState } from 'react';
import { AnimatedElement } from './AnimatedElement';

type NotificationType = 'success' | 'error' | 'warning' | 'info';

interface AnimatedNotificationProps {
  message: string;
  type?: NotificationType;
  duration?: number;
  onClose?: () => void;
  className?: string;
  messageClassName?: string;
  closeButtonClassName?: string;
}

export const AnimatedNotification: React.FC<AnimatedNotificationProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose,
  className = '',
  messageClassName = '',
  closeButtonClassName = '',
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const typeStyles = {
    success: 'bg-success/10 text-success border-success/20',
    error: 'bg-error/10 text-error border-error/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    info: 'bg-info/10 text-info border-info/20',
  };

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <AnimatedElement
      show={isVisible}
      animation="slideInDown"
      className={`flex items-center p-4 mb-4 rounded-lg border
        ${typeStyles[type]} ${className}`}
    >
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className={`ml-3 ${messageClassName}`}>{message}</div>
      {onClose && (
        <button
          type="button"
          onClick={() => {
            setIsVisible(false);
            onClose();
          }}
          className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5
            hover:bg-black/5 focus:outline-none focus:ring-2
            focus:ring-offset-2 focus:ring-offset-current
            ${closeButtonClassName}`}
        >
          <span className="sr-only">Close</span>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </AnimatedElement>
  );
}; 