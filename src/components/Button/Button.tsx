import React from 'react';
import styles from './Button.module.css';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'gradient' | 'gray' | 'blue';
  icon?: LucideIcon;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'gray',
  icon: Icon,
  children,
  className,
  ...props
}) => {
  const buttonClass = `${styles[`actionButton${variant.charAt(0).toUpperCase() + variant.slice(1)}`]} ${className || ''}`;

  return (
    <button className={buttonClass} {...props}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}; 