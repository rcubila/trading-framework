import React from 'react';
import { LineChart, BarChart2 } from 'lucide-react';
import { Chart, Line, Bar } from 'react-chartjs-2';
import styles from './Dashboard.module.css';
// import { ChartType } from './types';

interface ChartType {
  id: string;
  icon: React.ElementType;
  label: string;
}

interface PerformanceOverviewChartProps {
  chartTypes: ChartType[];
  selectedChartType: string;
  setSelectedChartType: (type: string) => void;
  renderChart: () => React.ReactNode;
}

const PerformanceOverviewChart: React.FC<PerformanceOverviewChartProps> = ({
  chartTypes,
  selectedChartType,
  setSelectedChartType,
  renderChart
}) => {
  return (
    <div className={styles.chartSection}>
      <div className={styles.chartHeader}>
        <div>
          <h3 className={styles.chartTitle}>
            Performance Overview
          </h3>
          <p className={styles.chartSubtitle}>
            Account balance over time
          </p>
        </div>
        <div className={styles.chartControls}>
          {chartTypes.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              className={`${styles.chartTypeButton} ${selectedChartType === id ? styles.active : ''}`}
              onClick={() => setSelectedChartType(id)}
              title={label}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>
      </div>
      <div className={styles.chartContainer}>
        {renderChart()}
      </div>
    </div>
  );
};

export default PerformanceOverviewChart; 