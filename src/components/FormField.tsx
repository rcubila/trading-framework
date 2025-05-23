import React from 'react';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children, error }) => {
  return (
    <div className={styles.field}>
      <label className={styles.label}>{label}</label>
      {children}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}; 