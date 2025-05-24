import React from 'react';
import { useState, useEffect } from 'react';
import { marketData } from '../../services/marketData';
import type { OHLCV } from '../../services/marketData';
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
import styles from './MarketDataViewer.module.css';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface MarketDataViewerProps {
  symbol: string;
  timeframe: '5' | '15' | '60' | 'D';
}

export const MarketDataViewer = ({ symbol, timeframe }: MarketDataViewerProps) => {
  const [candleData, setCandleData] = useState<OHLCV[]>([]);
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError('');
        const data = await marketData.getCandles(symbol, timeframe);
        setCandleData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch market data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();

    // Connect to WebSocket for real-time updates
    marketData.connectWebSocket();
    marketData.subscribeToSymbol(symbol);

    return () => {
      marketData.unsubscribeFromSymbol(symbol);
    };
  }, [symbol, timeframe]);

  const chartData = {
    labels: candleData.map(candle => 
      new Date(candle.timestamp).toLocaleString()
    ),
    datasets: [
      {
        label: `${symbol} Price`,
        data: candleData.map(candle => candle.close),
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `${symbol} - ${timeframe} Timeframe`,
        color: 'white'
      }
    },
    scales: {
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white'
        }
      },
      x: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        },
        ticks: {
          color: 'white',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-text-primary">Loading market data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-error">{error}</div>
      </div>
    );
  }

  return (
    <div className="card p-4">
      <Line data={chartData} options={chartOptions} />
    </div>
  );
}; 