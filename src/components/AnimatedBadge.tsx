import React from 'react';
import { AnimatedElement } from './AnimatedElement';

interface AnimatedBadgeProps {
  content: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  show?: boolean;
  className?: string;
  contentClassName?: string;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  content,
  variant = 'primary',
  size = 'md',
  show = true,
  className = '',
  contentClassName = '',
}) => {
  const variantClasses = {
    primary: 'bg-primary text-white',
    secondary: 'bg-background-secondary text-text-primary',
    success: 'bg-success text-white',
    error: 'bg-error text-white',
    warning: 'bg-warning text-white',
    info: 'bg-info text-white',
  };

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <AnimatedElement
      show={show}
      animation="scaleIn"
      className={`inline-flex items-center justify-center rounded-full
        font-medium ${variantClasses[variant]} ${sizeClasses[size]}
        ${className}`}
    >
      <span className={contentClassName}>{content}</span>
    </AnimatedElement>
  );
}; 