import React from 'react';
import { motion } from 'framer-motion';
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
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          {...props}
          className={styles.input}
        />
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={styles.error}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}; 