import React from 'react';
import styles from './Button.module.css';
import classNames from 'classnames';

export type ButtonVariant = 'primary' | 'secondary' | 'outlined' | 'text';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  isFullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  isFullWidth = false,
  leftIcon,
  rightIcon,
  className,
  disabled,
  ...props
}) => {
  const buttonClasses = classNames(
    styles.button,
    {
      [styles.button_primary]: variant === 'primary',
      [styles.button_secondary]: variant === 'secondary',
      [styles.button_outlined]: variant === 'outlined',
      [styles.button_text]: variant === 'text',
      [styles.button_small]: size === 'small',
      [styles.button_large]: size === 'large',
      [styles.button_disabled]: disabled,
      [styles.button_loading]: isLoading,
      [styles.button_fullWidth]: isFullWidth,
      [styles.button_icon]: !children && (leftIcon || rightIcon),
    },
    className
  );

  return (
    <button
      className={buttonClasses}
      disabled={disabled || isLoading}
      {...props}
    >
      {leftIcon && <span className={styles.button__icon}>{leftIcon}</span>}
      {children}
      {rightIcon && <span className={styles.button__icon}>{rightIcon}</span>}
    </button>
  );
}; 