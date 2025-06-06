import { useState } from 'react';
import {
  RiRobot2Line,
  RiUserLine,
  RiSettings4Line,
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiPlayLine,
  RiPauseLine,
  RiFileChartLine,
  RiTestTubeLine,
  RiHistoryLine,
  RiAlertLine,
} from 'react-icons/ri';
import { StrategyModal } from "../../components/StrategyModal/StrategyModal";
import { PageHeader } from "../../components/PageHeader/PageHeader";
import styles from './Strategy.module.css';

interface Strategy {
  id: string;
  name: string;
  type: string;
  status: string;
  performance: {
    winRate: string;
    profitFactor: string;
    sharpeRatio: string;
    maxDrawdown: string;
  };
  settings: {
    timeframe: string;
    instruments: string[];
    riskPerTrade: string;
    maxPositions: number;
  };
  conditions: {
    entry: string[];
    exit: string[];
    riskManagement: string[];
  };
}

const sampleStrategies: Strategy[] = [
  {
    id: '1',
    name: 'Trend Following + Manual Override',
    type: 'hybrid',
    status: 'active',
    performance: {
      winRate: '68%',
      profitFactor: '2.3',
      sharpeRatio: '1.8',
      maxDrawdown: '-12%',
    },
    settings: {
      timeframe: '1H',
      instruments: ['EURUSD', 'GBPUSD', 'USDJPY'],
      riskPerTrade: '1%',
      maxPositions: 3,
    },
    conditions: {
      entry: [
        'EMA(20) crosses above EMA(50)',
        'RSI(14) < 70',
        'Manual confirmation required',
      ],
      exit: [
        'Take Profit at 2R',
        'Stop Loss at 1R',
        'Manual exit allowed',
      ],
      riskManagement: [
        'Max daily loss: 3%',
        'Max open positions: 3',
        'Position sizing based on ATR',
      ],
    },
  },
  {
    id: '2',
    name: 'Mean Reversion Bot',
    type: 'algorithmic',
    status: 'testing',
    performance: {
      winRate: '72%',
      profitFactor: '1.9',
      sharpeRatio: '1.5',
      maxDrawdown: '-8%',
    },
    settings: {
      timeframe: '15m',
      instruments: ['BTCUSDT', 'ETHUSDT'],
      riskPerTrade: '0.5%',
      maxPositions: 2,
    },
    conditions: {
      entry: [
        'Price deviates 2 SD from mean',
        'Volume above average',
        'RSI extreme readings',
      ],
      exit: [
        'Return to mean',
        'Time-based exit (4 hours)',
        'Stop loss at 1.5 SD',
      ],
      riskManagement: [
        'Max daily loss: 2%',
        'Position scaling',
        'Dynamic position sizing',
      ],
    },
  },
];

export const Strategy = () => {
  const [strategies, setStrategies] = useState<Strategy[]>(sampleStrategies);
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [showStrategyModal, setShowStrategyModal] = useState(false);

  const handleSaveStrategy = (strategyData: Partial<Strategy>) => {
    if (selectedStrategy) {
      // Edit existing strategy
      setStrategies(prev => prev.map(strategy => 
        strategy.id === selectedStrategy.id 
          ? { ...strategy, ...strategyData }
          : strategy
      ));
    } else {
      // Create new strategy
      const newStrategy: Strategy = {
        ...strategyData,
        id: Date.now().toString(),
        performance: {
          winRate: '0%',
          profitFactor: '0',
          sharpeRatio: '0',
          maxDrawdown: '0%',
        },
      } as Strategy;
      setStrategies(prev => [...prev, newStrategy]);
    }
    setShowStrategyModal(false);
    setSelectedStrategy(null);
  };

  const handleEditStrategy = (strategy: Strategy) => {
    setSelectedStrategy(strategy);
    setShowStrategyModal(true);
  };

  const handleDeleteStrategy = (strategyId: string) => {
    setStrategies(prev => prev.filter(strategy => strategy.id !== strategyId));
  };

  const handleToggleStatus = (strategy: Strategy) => {
    setStrategies(prev => prev.map(s => {
      if (s.id === strategy.id) {
        return {
          ...s,
          status: s.status === 'active' ? 'paused' : 'active',
        };
      }
      return s;
    }));
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'testing':
        return styles.statusTesting;
      default:
        return styles.statusInactive;
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Trading Strategies"
        subtitle="Manage and analyze your trading strategies"
        actions={
          <button
            onClick={() => {
              setSelectedStrategy(null);
              setShowStrategyModal(true);
            }}
            className={styles.newStrategyButton}
          >
            <RiAddLine />
            New Strategy
          </button>
        }
      />

      {/* Strategy Grid */}
      <div className={styles.grid}>
        {strategies.map((strategy) => (
          <div key={strategy.id} className={styles.strategyCard}>
            <div className={styles.strategyHeader}>
              <h3 className={styles.strategyTitle}>{strategy.name}</h3>
              <div className={getStatusClass(strategy.status)}>
                {strategy.status.charAt(0).toUpperCase() + strategy.status.slice(1)}
              </div>
            </div>

            <div className={styles.metricsGrid}>
              <div>
                <div className={styles.metricLabel}>Win Rate</div>
                <div className={styles.metricValue}>{strategy.performance.winRate}</div>
              </div>
              <div>
                <div className={styles.metricLabel}>Profit Factor</div>
                <div className={styles.metricValue}>{strategy.performance.profitFactor}</div>
              </div>
              <div>
                <div className={styles.metricLabel}>Sharpe Ratio</div>
                <div className={styles.metricValue}>{strategy.performance.sharpeRatio}</div>
              </div>
              <div>
                <div className={styles.metricLabel}>Max Drawdown</div>
                <div className={styles.metricValue}>{strategy.performance.maxDrawdown}</div>
              </div>
            </div>

            <div className={styles.actions}>
              <button 
                onClick={() => handleEditStrategy(strategy)}
                className={styles.editButton}
              >
                <RiEditLine />
                Edit
              </button>
              <button 
                onClick={() => handleToggleStatus(strategy)}
                className={styles.toggleButton}
              >
                {strategy.status === 'active' ? <RiPauseLine /> : <RiPlayLine />}
              </button>
              <button 
                onClick={() => handleDeleteStrategy(strategy.id)}
                className={styles.deleteButton}
              >
                <RiDeleteBinLine />
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        {[
          { icon: RiTestTubeLine, label: 'Backtest Strategy', color: '#2563eb' },
          { icon: RiFileChartLine, label: 'Performance Reports', color: '#22c55e' },
          { icon: RiHistoryLine, label: 'Trading History', color: '#eab308' },
          { icon: RiAlertLine, label: 'Risk Alerts', color: '#ef4444' },
        ].map((action, index) => (
          <button
            key={index}
            className={styles.quickActionButton}
          >
            <action.icon className={styles.quickActionIcon} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>

      {/* Strategy Modal */}
      <StrategyModal
        isOpen={showStrategyModal}
        onClose={() => {
          setShowStrategyModal(false);
          setSelectedStrategy(null);
        }}
        onSave={handleSaveStrategy}
        strategy={selectedStrategy || undefined}
      />
    </div>
  );
}; 