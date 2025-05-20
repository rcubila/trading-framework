import React, { useEffect } from 'react';
import { AnimatedElement } from './AnimatedElement';

interface AnimatedModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  titleClassName?: string;
  closeButtonClassName?: string;
}

export const AnimatedModal: React.FC<AnimatedModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  className = '',
  contentClassName = '',
  titleClassName = '',
  closeButtonClassName = '',
}) => {
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <AnimatedElement
        animation="fadeIn"
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <AnimatedElement
        animation="scaleIn"
        className={`relative bg-background-primary rounded-lg shadow-xl max-w-lg w-full mx-4
          ${className}`}
      >
        <div className={`p-6 ${contentClassName}`}>
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h2 className={`text-xl font-semibold ${titleClassName}`}>{title}</h2>
              <button
                onClick={onClose}
                className={`text-text-secondary hover:text-text-primary transition-colors
                  ${closeButtonClassName}`}
              >
                ✕
              </button>
            </div>
          )}
          {children}
        </div>
      </AnimatedElement>
    </div>
  );
}; 