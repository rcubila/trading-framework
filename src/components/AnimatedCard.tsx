import React from 'react';
import { motion } from 'framer-motion';

interface AnimatedCardProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  isInteractive?: boolean;
  initialScale?: number;
  hoverScale?: number;
  tapScale?: number;
}

export const AnimatedCard: React.FC<AnimatedCardProps> = ({
  children,
  onClick,
  className = '',
  isInteractive = false,
  initialScale = 1,
  hoverScale = 1.02,
  tapScale = 0.98,
}) => {
  const baseStyles = {
    background: 'rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '20px',
    transition: 'all 0.2s ease',
  };

  const interactiveStyles = isInteractive ? {
    cursor: 'pointer',
    '&:hover': {
      background: 'rgba(255, 255, 255, 0.08)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
    },
  } : {};

  return (
    <motion.div
      initial={{ scale: initialScale, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={isInteractive ? { scale: hoverScale } : undefined}
      whileTap={isInteractive ? { scale: tapScale } : undefined}
      style={{
        ...baseStyles,
        ...interactiveStyles,
      }}
      onClick={onClick}
      className={className}
    >
      {children}
    </motion.div>
  );
}; 