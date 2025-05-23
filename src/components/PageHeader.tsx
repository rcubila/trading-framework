import React from 'react';
import styles from './PageHeader.module.css';
import { Search, Filter, Plus, MoreVertical, Clock } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  filters,
}) => {
  return (
    <div className={styles.pageHeader}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <h1 className={styles.pageTitle}>{title}</h1>
          {subtitle && (
            <div className={styles.pageSubtitle}>
              {subtitle}
            </div>
          )}
        </div>
        <div className={styles.headerActions}>
          {filters && (
            <div className={styles.filterGroup}>
              {filters}
            </div>
          )}
          {actions}
        </div>
      </div>
    </div>
  );
}; 