import React, { useState } from 'react';
import { 
  FiTrendingUp, 
  FiRepeat, 
  FiZap, 
  FiTarget, 
  FiBarChart2, 
  FiSearch, 
  FiTrendingDown,
  FiClock,
  FiDollarSign,
  FiPercent,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle
} from 'react-icons/fi';
import styles from './IconSelector.module.css';

interface IconSelectorProps {
  selectedIcon: string;
  onSelectIcon: (icon: string) => void;
}

const tradingIcons = [
  { name: 'trending-up', icon: FiTrendingUp, label: 'Trend Following' },
  { name: 'trending-down', icon: FiTrendingDown, label: 'Trend Following (Short)' },
  { name: 'repeat', icon: FiRepeat, label: 'Mean Reversion' },
  { name: 'zap', icon: FiZap, label: 'Breakout' },
  { name: 'target', icon: FiTarget, label: 'Precision Entry' },
  { name: 'bar-chart', icon: FiBarChart2, label: 'Range Trading' },
  { name: 'search', icon: FiSearch, label: 'Analysis' },
  { name: 'clock', icon: FiClock, label: 'Time Based' },
  { name: 'dollar', icon: FiDollarSign, label: 'Money Management' },
  { name: 'percent', icon: FiPercent, label: 'Risk Management' },
  { name: 'alert', icon: FiAlertCircle, label: 'Alert Based' },
  { name: 'check', icon: FiCheckCircle, label: 'Confirmation Based' },
  { name: 'x', icon: FiXCircle, label: 'Rejection Based' }
];

export const IconSelector: React.FC<IconSelectorProps> = ({ selectedIcon, onSelectIcon }) => {
  const [isOpen, setIsOpen] = useState(false);

  const selectedIconData = tradingIcons.find(icon => icon.name === selectedIcon) || tradingIcons[0];

  return (
    <div className={styles.iconSelector}>
      <button 
        className={styles.selectorButton}
        onClick={() => setIsOpen(!isOpen)}
      >
        <selectedIconData.icon className={styles.selectedIcon} />
        <span>{selectedIconData.label}</span>
      </button>

      {isOpen && (
        <div className={styles.iconGrid}>
          {tradingIcons.map(({ name, icon: Icon, label }) => (
            <button
              key={name}
              className={`${styles.iconButton} ${selectedIcon === name ? styles.selected : ''}`}
              onClick={() => {
                onSelectIcon(name);
                setIsOpen(false);
              }}
              title={label}
            >
              <Icon className={styles.icon} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}; 