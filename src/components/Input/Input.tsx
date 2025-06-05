import React from 'react';
import classNames from 'classnames';
import styles from './Input.module.css';

export type InputVariant = 'default' | 'outlined' | 'filled';
export type InputSize = 'small' | 'medium' | 'large';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: InputVariant;
  size?: InputSize;
  label?: string;
  helperText?: string;
  error?: string;
  icon?: React.ReactNode;
  isRequired?: boolean;
  fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      variant = 'default',
      size = 'medium',
      label,
      helperText,
      error,
      icon,
      isRequired,
      fullWidth = true,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputClasses = classNames(
      styles.input,
      {
        [styles.input_outlined]: variant === 'outlined',
        [styles.input_filled]: variant === 'filled',
        [styles.input_small]: size === 'small',
        [styles.input_large]: size === 'large',
        [styles.input_disabled]: disabled,
        [styles.input_error]: !!error,
        [styles.input_withIcon]: !!icon,
      },
      className
    );

    return (
      <div className={classNames({ [styles.input_fullWidth]: fullWidth })}>
        {label && (
          <label className={styles.input__label}>
            {label}
            {isRequired && <span className={styles.input__required}>*</span>}
          </label>
        )}
        <div className={styles.input__wrapper}>
          {icon && <span className={styles.input__icon}>{icon}</span>}
          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? `${props.id}-error` : undefined}
            {...props}
          />
        </div>
        {error && (
          <div id={`${props.id}-error`} className={styles.input__error}>
            {error}
          </div>
        )}
        {helperText && !error && (
          <div className={styles.input__helper}>{helperText}</div>
        )}
      </div>
    );
  }
); 