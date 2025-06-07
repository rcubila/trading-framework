import React from 'react';
import { BarChart2, LineChart } from 'lucide-react';
import { Chart, Bar, Line } from 'react-chartjs-2';
import styles from './Dashboard.module.css';

interface Trade {
  id: string;
  symbol: string;
  type: string;
  pnl: number;
  entry_price: number;
  exit_price: number | null;
  quantity: number;
  market: string;
  strategy: string;
}

interface TradeBreakdownSectionProps {
  allTrades: Trade[];
}

const TradeBreakdownSection: React.FC<TradeBreakdownSectionProps> = ({ allTrades }) => {
  // Strategy performance data
  const strategyPerformanceData = {
    labels: allTrades.reduce((acc: string[], trade: Trade) => {
      const strategy = trade.strategy || 'Unknown';
      if (!acc.includes(strategy)) {
        acc.push(strategy);
      }
      return acc;
    }, []),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Win Rate %',
        data: allTrades.reduce((acc: { strategy: string; wins: number; total: number }[], trade: Trade) => {
          const strategy = trade.strategy || 'Unknown';
          const index = acc.findIndex(item => item.strategy === strategy);
          if (index === -1) {
            acc.push({ 
              strategy, 
              wins: (trade.pnl || 0) > 0 ? 1 : 0, 
              total: 1 
            });
          } else {
            acc[index].wins += (trade.pnl || 0) > 0 ? 1 : 0;
            acc[index].total += 1;
          }
          return acc;
        }, []).map(item => (item.wins / item.total) * 100),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 2,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'Total P&L',
        data: allTrades.reduce((acc: { strategy: string; pnl: number }[], trade: Trade) => {
          const strategy = trade.strategy || 'Unknown';
          const index = acc.findIndex(item => item.strategy === strategy);
          if (index === -1) {
            acc.push({ strategy, pnl: trade.pnl || 0 });
          } else {
            acc[index].pnl += trade.pnl || 0;
          }
          return acc;
        }, []).map(item => item.pnl),
        borderColor: '#f59e0b',
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
        yAxisID: 'y1',
      }
    ]
  };

  // Market performance data
  const marketPerformanceData = {
    labels: allTrades.reduce((acc: string[], trade: Trade) => {
      const market = trade.market || 'Unknown';
      if (!acc.includes(market)) {
        acc.push(market);
      }
      return acc;
    }, []),
    datasets: [
      {
        type: 'bar' as const,
        label: 'Number of Trades',
        data: allTrades.reduce((acc: { market: string; count: number }[], trade: Trade) => {
          const market = trade.market || 'Unknown';
          const index = acc.findIndex(item => item.market === market);
          if (index === -1) {
            acc.push({ market, count: 1 });
          } else {
            acc[index].count++;
          }
          return acc;
        }, []).map(item => item.count),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: '#3b82f6',
        borderWidth: 2,
      },
      {
        type: 'line' as const,
        label: 'Average P&L',
        data: allTrades.reduce((acc: { market: string; pnl: number; count: number }[], trade: Trade) => {
          const market = trade.market || 'Unknown';
          const index = acc.findIndex(item => item.market === market);
          if (index === -1) {
            acc.push({ market, pnl: trade.pnl || 0, count: 1 });
          } else {
            acc[index].pnl += trade.pnl || 0;
            acc[index].count++;
          }
          return acc;
        }, []).map(item => item.pnl / item.count),
        borderColor: '#f59e0b',
        borderWidth: 2,
        pointBackgroundColor: '#f59e0b',
        yAxisID: 'y1',
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
        labels: {
          color: 'rgba(255, 255, 255, 0.8)',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: 'rgba(255, 255, 255, 0.9)',
        bodyColor: 'rgba(255, 255, 255, 0.7)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context: any) {
            const value = context.raw;
            const datasetLabel = context.dataset.label;
            if (datasetLabel === 'Win Rate %') {
              return ` ${value.toFixed(1)}%`;
            }
            return ` ${value >= 0 ? '+' : ''}$${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        grid: {
          color: 'rgba(255,255,255,0.07)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        type: 'linear',
        position: 'left',
        grid: {
          color: 'rgba(255,255,255,0.07)',
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          callback: function(value: number | string) {
            return `${Number(value).toFixed(1)}%`;
          }
        }
      },
      y1: {
        type: 'linear',
        position: 'right',
        grid: {
          drawOnChartArea: false
        },
        ticks: {
          color: 'rgba(255, 255, 255, 0.6)',
          callback: function(value: number | string) {
            return `$${Number(value).toFixed(0)}`;
          }
        }
      }
    }
  } as const;

  return (
    <div className={styles.strategyBreakdown}>
      <div className={styles.strategyGrid}>
        <div className={styles.strategyCard}>
          <h3 className={styles.strategyCardTitle}>Strategy Performance</h3>
          <div className={styles.strategyChartContainer}>
            <Chart type="bar" data={strategyPerformanceData} options={chartOptions} />
          </div>
        </div>
        <div className={styles.strategyCard}>
          <h3 className={styles.strategyCardTitle}>Market Performance</h3>
          <div className={styles.strategyChartContainer}>
            <Chart type="bar" data={marketPerformanceData} options={chartOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradeBreakdownSection; 