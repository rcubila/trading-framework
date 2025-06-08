import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import type { Trade } from '../../types/trade';
import styles from './PerformanceOverviewChart.module.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PerformanceOverviewChartProps {
  trades: Trade[];
  loading: boolean;
}

const PerformanceOverviewChart: React.FC<PerformanceOverviewChartProps> = ({ trades, loading }) => {
  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2 className={styles.title}>Performance Overview</h2>
        </div>
        <div className={styles.skeletonChart} />
      </div>
    );
  }

  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
  );

  const labels = sortedTrades.map(trade => 
    new Date(trade.entry_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const data = {
    labels,
    datasets: [
      {
        label: 'Account Balance',
        data: sortedTrades.reduce((acc, trade) => {
          const lastValue = acc.length > 0 ? acc[acc.length - 1] : 100000;
          acc.push(lastValue + (trade.pnl || 0));
          return acc;
        }, [] as number[]),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        tension: 0.4
      }
    ]
  };

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Balance: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)'
        }
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Performance Overview</h2>
        <p className={styles.subtitle}>Account balance over time</p>
      </div>
      <div className={styles.chartContainer}>
        <Line data={data} options={options} />
      </div>
    </div>
  );
};

export default PerformanceOverviewChart; 