import React from 'react';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import styles from './AnimatedCard.module.css';

interface AnimatedCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  isInteractive?: boolean;
}

export const AnimatedCard = ({
  children,
  onClick,
  className = '',
  isInteractive = true,
}: AnimatedCardProps) => {
  const baseClasses = `${styles.card} ${className}`;
  
  if (!isInteractive) {
    return <div className={baseClasses}>{children}</div>;
  }

  return (
    <motion.div
      className={baseClasses}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17,
      }}
    >
      {children}
    </motion.div>
  );
}; 