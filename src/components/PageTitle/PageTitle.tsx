import React from 'react';
import styles from './PageTitle.module.css';

interface PageTitleProps {
  title: string;
}

export const PageTitle: React.FC<PageTitleProps> = ({ title }) => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {title}
      </h1>
    </div>
  );
}; 