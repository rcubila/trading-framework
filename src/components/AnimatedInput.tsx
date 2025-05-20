import React from 'react';
import { motion } from 'framer-motion';

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
      <label style={{ 
        display: 'block', 
        marginBottom: '8px', 
        color: 'rgba(255, 255, 255, 0.6)',
        fontSize: '14px' 
      }}>
        {label}
      </label>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <input
          {...props}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.05)',
            color: 'white',
            fontSize: '16px',
            transition: 'all 0.2s ease',
            ...props.style,
          }}
          onFocus={(e) => {
            e.currentTarget.style.border = '1px solid rgba(59, 130, 246, 0.5)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.border = '1px solid rgba(255, 255, 255, 0.1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </motion.div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-red-400 mt-1"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}; 