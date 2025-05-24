import React from 'react';
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
    <div
      className={baseClasses}
      onClick={onClick}
    >
      {children}
    </div>
  );
}; 