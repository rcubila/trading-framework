import React from 'react';
import { Line, Bar } from 'react-chartjs-2';
import styles from './Dashboard.module.css';
// import { ChartType } from './types';

interface PerformanceOverviewChartProps {
  chartTypes: any[];
  selectedChartType: string;
  setSelectedChartType: (type: string) => void;
  renderChart: () => React.ReactNode;
}

export const PerformanceOverviewChart: React.FC<PerformanceOverviewChartProps> = ({
  chartTypes,
  selectedChartType,
  setSelectedChartType,
  renderChart
}) => (
  <div className={styles.chartSection}>
    <div className={styles.chartHeader}>
      <div>
        <h3 className={styles.chartTitle}>
          Performance Overview
        </h3>
        <p className={styles.chartSubtitle}>
          Account growth over time
        </p>
      </div>
      <div className={styles.chartControls}>
        {chartTypes.map((type) => (
          <button
            key={type.id}
            className={`${styles.chartTypeButton} ${selectedChartType === type.id ? styles.chartTypeButtonActive : ''}`}
            onClick={() => setSelectedChartType(type.id)}
          >
            <type.icon />
            {type.label}
          </button>
        ))}
      </div>
    </div>
    <div className={styles.chartContainer}>
      {renderChart()}
    </div>
  </div>
); 