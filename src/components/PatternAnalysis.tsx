import { useState, useEffect } from 'react';
import {
  RiLineChartLine,
  RiTimeLine,
  RiCalendarLine,
  RiStockLine,
  RiSunLine,
  RiMoonLine,
  RiArrowUpLine,
  RiArrowDownLine,
} from 'react-icons/ri';

interface Trade {
  id: string;
  symbol: string;
  type: 'Long' | 'Short';
  entry_price: number;
  exit_price?: number;
  entry_date: string;
  exit_date?: string;
  pnl?: number;
  setup_type?: string;
  market_conditions?: string;
  timeframe?: string;
}

interface PatternMetrics {
  setupPerformance: {
    setup: string;
    winRate: number;
    avgReturn: number;
    count: number;
  }[];
  timeBasedPatterns: {
    timeOfDay: string;
    winRate: number;
    avgReturn: number;
    count: number;
  }[];
  marketConditions: {
    condition: string;
    winRate: number;
    avgReturn: number;
    count: number;
  }[];
}

export const PatternAnalysis = ({ trades }: { trades: Trade[] }) => {
  const [metrics, setMetrics] = useState<PatternMetrics>({
    setupPerformance: [],
    timeBasedPatterns: [],
    marketConditions: [],
  });

  useEffect(() => {
    analyzePatterns();
  }, [trades]);

  const analyzePatterns = () => {
    // Analyze setup performance
    const setupMap = new Map<string, { wins: number; total: number; returns: number[] }>();
    const timeMap = new Map<string, { wins: number; total: number; returns: number[] }>();
    const conditionMap = new Map<string, { wins: number; total: number; returns: number[] }>();

    trades.forEach(trade => {
      const pnl = trade.pnl || 0;
      const isWin = pnl > 0;
      const returnPct = trade.exit_price && trade.entry_price 
        ? ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100
        : 0;

      // Setup analysis
      if (trade.setup_type) {
        const setup = setupMap.get(trade.setup_type) || { wins: 0, total: 0, returns: [] };
        setup.total++;
        if (isWin) setup.wins++;
        setup.returns.push(returnPct);
        setupMap.set(trade.setup_type, setup);
      }

      // Time-based analysis
      const hour = new Date(trade.entry_date).getHours();
      let timeOfDay = '';
      if (hour < 10) timeOfDay = 'Pre-Market (4-9:30)';
      else if (hour < 12) timeOfDay = 'Morning (9:30-11:30)';
      else if (hour < 14) timeOfDay = 'Mid-Day (11:30-13:30)';
      else if (hour < 16) timeOfDay = 'Afternoon (13:30-16:00)';
      else timeOfDay = 'After-Hours (16:00+)';

      const time = timeMap.get(timeOfDay) || { wins: 0, total: 0, returns: [] };
      time.total++;
      if (isWin) time.wins++;
      time.returns.push(returnPct);
      timeMap.set(timeOfDay, time);

      // Market conditions analysis
      if (trade.market_conditions) {
        const condition = conditionMap.get(trade.market_conditions) || { wins: 0, total: 0, returns: [] };
        condition.total++;
        if (isWin) condition.wins++;
        condition.returns.push(returnPct);
        conditionMap.set(trade.market_conditions, condition);
      }
    });

    // Convert maps to sorted arrays
    const setupPerformance = Array.from(setupMap.entries())
      .map(([setup, stats]) => ({
        setup,
        winRate: (stats.wins / stats.total) * 100,
        avgReturn: stats.returns.reduce((a, b) => a + b, 0) / stats.returns.length,
        count: stats.total,
      }))
      .sort((a, b) => b.avgReturn - a.avgReturn);

    const timeBasedPatterns = Array.from(timeMap.entries())
      .map(([timeOfDay, stats]) => ({
        timeOfDay,
        winRate: (stats.wins / stats.total) * 100,
        avgReturn: stats.returns.reduce((a, b) => a + b, 0) / stats.returns.length,
        count: stats.total,
      }))
      .sort((a, b) => b.avgReturn - a.avgReturn);

    const marketConditions = Array.from(conditionMap.entries())
      .map(([condition, stats]) => ({
        condition,
        winRate: (stats.wins / stats.total) * 100,
        avgReturn: stats.returns.reduce((a, b) => a + b, 0) / stats.returns.length,
        count: stats.total,
      }))
      .sort((a, b) => b.avgReturn - a.avgReturn);

    setMetrics({
      setupPerformance,
      timeBasedPatterns,
      marketConditions,
    });
  };

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Setup Performance */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <RiStockLine />
          Setup Performance
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {metrics.setupPerformance.map((setup) => (
            <div
              key={setup.setup}
              style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr auto auto auto',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: '500' }}>{setup.setup}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {setup.count} trades
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: setup.winRate >= 50 ? '#22c55e' : '#ef4444' }}>
                  {setup.winRate.toFixed(1)}%
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Win Rate
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: setup.avgReturn >= 0 ? '#22c55e' : '#ef4444' }}>
                  {setup.avgReturn >= 0 ? '+' : ''}{setup.avgReturn.toFixed(2)}%
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Avg Return
                </div>
              </div>
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: setup.avgReturn >= 0 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: setup.avgReturn >= 0 ? '#22c55e' : '#ef4444',
              }}>
                {setup.avgReturn >= 0 ? <RiArrowUpLine /> : <RiArrowDownLine />}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time-Based Patterns */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <RiTimeLine />
          Time-Based Patterns
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {metrics.timeBasedPatterns.map((time) => (
            <div
              key={time.timeOfDay}
              style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: '500' }}>{time.timeOfDay}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {time.count} trades
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: time.winRate >= 50 ? '#22c55e' : '#ef4444' }}>
                  {time.winRate.toFixed(1)}%
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Win Rate
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: time.avgReturn >= 0 ? '#22c55e' : '#ef4444' }}>
                  {time.avgReturn >= 0 ? '+' : ''}{time.avgReturn.toFixed(2)}%
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Avg Return
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Market Conditions */}
      <div style={{
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
      }}>
        <h2 style={{ 
          fontSize: '18px', 
          fontWeight: 'bold', 
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <RiSunLine />
          Market Conditions
        </h2>
        <div style={{ display: 'grid', gap: '12px' }}>
          {metrics.marketConditions.map((condition) => (
            <div
              key={condition.condition}
              style={{
                padding: '16px',
                background: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '12px',
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: '16px',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: '500' }}>{condition.condition}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  {condition.count} trades
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: condition.winRate >= 50 ? '#22c55e' : '#ef4444' }}>
                  {condition.winRate.toFixed(1)}%
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Win Rate
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: condition.avgReturn >= 0 ? '#22c55e' : '#ef4444' }}>
                  {condition.avgReturn >= 0 ? '+' : ''}{condition.avgReturn.toFixed(2)}%
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Avg Return
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 