import React from 'react';
import type { IconType } from 'react-icons';
import styles from '../styles/ActionButton.module.css';

interface ActionButtonProps {
  icon: IconType;
  label: string;
  onClick: () => void;
}

export const ActionButton = ({ icon: Icon, label, onClick }: ActionButtonProps) => {
  return (
    <button className={styles.button} onClick={onClick}>
      <Icon className={styles.icon} />
      {label}
    </button>
  );
}; 