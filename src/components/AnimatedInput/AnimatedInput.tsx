import React from 'react';
import styles from './AnimatedInput.module.css';

interface AnimatedInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const AnimatedInput: React.FC<AnimatedInputProps> = ({ 
  label, 
  error, 
  ...props 
}) => {
  return (
    <div>
      <label className={styles.label}>
        {label}
      </label>
      <div className={styles.inputContainer}>
        <input
          {...props}
          className={styles.input}
        />
      </div>
      {error && (
        <p className={`${styles.error} ${styles.errorMessage}`}>
          {error}
        </p>
      )}
    </div>
  );
}; 