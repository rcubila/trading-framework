import React from 'react';
import styles from '../styles/PageContainer.module.css';

interface PageContainerProps {
  children: React.ReactNode;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children }) => {
  return (
    <div className={styles.container}>
      {children}
    </div>
  );
}; 