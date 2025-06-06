import React from 'react';
import type { ChartType } from './types';
import { chartTypes } from './types';
import styles from './ChartTypeSelector.module.css';

interface ChartTypeSelectorProps {
  selectedType: ChartType;
  onTypeChange: (type: ChartType) => void;
}

export const ChartTypeSelector: React.FC<ChartTypeSelectorProps> = ({
  selectedType,
  onTypeChange
}) => {
  return (
    <div className={styles.chartControls}>
      {chartTypes.map(({ id, icon: Icon, label }) => (
        <button
          key={id}
          className={`${styles.chartTypeButton} ${selectedType === id ? styles.chartTypeButtonActive : ''}`}
          onClick={() => onTypeChange(id)}
        >
          <Icon size={16} />
          {label}
        </button>
      ))}
    </div>
  );
}; 