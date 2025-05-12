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

interface Strategy {
  id: string;
  name: string;
  type: 'algorithmic' | 'discretionary' | 'hybrid';
  status: 'active' | 'paused' | 'testing';
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

  return (
    <div style={{ padding: '24px', color: 'white' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px' 
      }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Strategy Management</h1>
          <p style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RiSettings4Line />
            <span>Hybrid Trading System</span>
          </p>
        </div>
        <button
          onClick={() => setShowStrategyModal(true)}
          style={{ 
            backgroundColor: '#2563eb',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
        >
          <RiAddLine />
          New Strategy
        </button>
      </div>

      {/* Strategy Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
        gap: '20px',
        marginBottom: '24px' 
      }}>
        {strategies.map((strategy) => (
          <div
            key={strategy.id}
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onClick={() => setSelectedStrategy(strategy)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '4px' }}>{strategy.name}</h3>
                <div style={{ 
                  display: 'flex', 
                  gap: '8px', 
                  alignItems: 'center',
                  color: '#94a3b8',
                  fontSize: '14px'
                }}>
                  {strategy.type === 'hybrid' ? (
                    <>
                      <RiRobot2Line />
                      <RiUserLine />
                      <span>Hybrid</span>
                    </>
                  ) : strategy.type === 'algorithmic' ? (
                    <>
                      <RiRobot2Line />
                      <span>Algorithmic</span>
                    </>
                  ) : (
                    <>
                      <RiUserLine />
                      <span>Discretionary</span>
                    </>
                  )}
                </div>
              </div>
              <div style={{
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                backgroundColor: strategy.status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 
                               strategy.status === 'testing' ? 'rgba(234, 179, 8, 0.1)' : 
                               'rgba(239, 68, 68, 0.1)',
                color: strategy.status === 'active' ? '#22c55e' :
                       strategy.status === 'testing' ? '#eab308' :
                       '#ef4444',
              }}>
                {strategy.status.charAt(0).toUpperCase() + strategy.status.slice(1)}
              </div>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '2px' }}>Win Rate</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{strategy.performance.winRate}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '2px' }}>Profit Factor</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{strategy.performance.profitFactor}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '2px' }}>Sharpe Ratio</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{strategy.performance.sharpeRatio}</div>
              </div>
              <div>
                <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '2px' }}>Max Drawdown</div>
                <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{strategy.performance.maxDrawdown}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button style={{
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}>
                <RiEditLine />
              </button>
              <button style={{
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}>
                {strategy.status === 'active' ? <RiPauseLine /> : <RiPlayLine />}
              </button>
              <button style={{
                padding: '8px',
                borderRadius: '6px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}>
                <RiDeleteBinLine />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '24px',
      }}>
        {[
          { icon: RiTestTubeLine, label: 'Backtest Strategy', color: '#2563eb' },
          { icon: RiFileChartLine, label: 'Performance Reports', color: '#22c55e' },
          { icon: RiHistoryLine, label: 'Trading History', color: '#eab308' },
          { icon: RiAlertLine, label: 'Risk Alerts', color: '#ef4444' },
        ].map((action, index) => (
          <button
            key={index}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${action.color}`,
              borderRadius: '8px',
              padding: '16px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              transition: 'all 0.2s ease',
            }}
          >
            <action.icon style={{ color: action.color, fontSize: '20px' }} />
            <span>{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}; 