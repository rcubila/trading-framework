import React from 'react';
import { motion } from 'framer-motion';
import type { MetricCardProps } from '../types';
import styles from './MetricCard.module.css';

/**
 * MetricCard component displays a single metric with its title, value, and optional subtitle.
 * It supports different states (positive, negative, neutral) and can show percentage values.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  isPositive,
  isNegative,
  isNeutral,
  showPercentage,
  onTogglePercentage,
  onHover,
  onLeave,
  isHovered
}) => {
  const getValueClassName = () => {
    if (isPositive) return styles.metricValuePositive;
    if (isNegative) return styles.metricValueNegative;
    if (isNeutral) return styles.metricValueNeutral;
    return '';
  };

  return (
    <motion.div
      className={styles.metricCard}
      onHoverStart={onHover}
      onHoverEnd={onLeave}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <div className={styles.metricHeader}>
        <h3 className={styles.metricTitle}>{title}</h3>
        {onTogglePercentage && (
          <button
            className={styles.metricToggle}
            onClick={onTogglePercentage}
            aria-label={`Toggle ${showPercentage ? 'absolute' : 'percentage'} value`}
          >
            {showPercentage ? '%' : '$'}
          </button>
        )}
      </div>
      
      <div className={`${styles.metricValue} ${getValueClassName()}`}>
        {icon && <span className={styles.metricIcon}>{icon}</span>}
        {value}
      </div>
      
      {subtitle && <p className={styles.metricSubtitle}>{subtitle}</p>}
    </motion.div>
  );
}; 