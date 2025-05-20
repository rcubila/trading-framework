import { useState, useEffect } from 'react';
import {
  RiCalculatorLine,
  RiScales3Line,
  RiPieChartLine,
  RiLineChartLine,
  RiBarChartGroupedLine,
  RiTimeLine,
  RiExchangeDollarLine,
  RiPercentLine,
  RiArrowUpDownLine,
  RiSettings4Line,
  RiStockLine,
  RiPulseLine,
  RiFlowChart,
  RiBarChartBoxLine,
  RiRefreshLine,
  RiDownload2Line,
} from 'react-icons/ri';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { PatternAnalysis } from '../components/PatternAnalysis';
import type { Database } from '../lib/supabase-types';
import { PageHeader } from '../components/PageHeader';
import { AnimatedButton } from '../components/AnimatedButton';
import { AnimatedCard } from '../components/AnimatedCard';
import { AnimatedInput } from '../components/AnimatedInput';

interface CalculatorInputs {
  accountSize: number;
  riskPercentage: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
}

type DBTrade = Database['public']['Tables']['trades']['Row'];
type TradeInsert = Database['public']['Tables']['trades']['Insert'];

type Trade = {
  id: string;
  user_id: string;
  market: string;
  market_category: 'Equities' | 'Crypto' | 'Forex' | 'Futures' | 'Other';
  symbol: string;
  type: 'Long' | 'Short';
  status: 'Open' | 'Closed';
  entry_price: number;
  quantity: number;
  entry_date: string;
  created_at: string;
  updated_at: string;
  exit_price?: number;
  exit_date?: string;
  pnl?: number;
  pnl_percentage?: number;
  risk?: number;
  reward?: number;
  strategy?: string;
  tags?: string[];
  notes?: string;
  leverage?: number;
  stop_loss?: number;
  take_profit?: number;
  commission?: number;
  fees?: number;
  slippage?: number;
  exchange?: string;
  timeframe?: string;
  setup_type?: string;
};

interface AdvancedMetrics {
  expectancy: number;
  mae: number;
  mfe: number;
  profitFactor: number;
  monteCarloResults: {
    worstDrawdown: number;
    bestReturn: number;
    averageReturn: number;
    confidenceInterval: [number, number];
  };
}

export const Analytics = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInputs>({
    accountSize: 10000,
    riskPercentage: 1,
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
  });

  const [activeTab, setActiveTab] = useState<'position' | 'risk' | 'advanced' | 'patterns'>('position');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [advancedMetrics, setAdvancedMetrics] = useState<AdvancedMetrics>({
    expectancy: 0,
    mae: 0,
    mfe: 0,
    profitFactor: 0,
    monteCarloResults: {
      worstDrawdown: 0,
      bestReturn: 0,
      averageReturn: 0,
      confidenceInterval: [0, 0],
    },
  });

  useEffect(() => {
    fetchTrades();
  }, []);

  const fetchTrades = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: trades, error } = await supabase
        .from('trades')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      const processedTrades = (trades || []).map(trade => ({
        ...trade,
        exit_price: trade.exit_price || undefined,
        exit_date: trade.exit_date || undefined,
        pnl: trade.pnl || undefined,
        pnl_percentage: trade.pnl_percentage || undefined,
        risk: trade.risk || undefined,
        reward: trade.reward || undefined,
        strategy: trade.strategy || undefined,
        tags: trade.tags || undefined,
        notes: trade.notes || undefined,
        leverage: trade.leverage || undefined,
        stop_loss: trade.stop_loss || undefined,
        take_profit: trade.take_profit || undefined,
        commission: trade.commission || undefined,
        fees: trade.fees || undefined,
        slippage: trade.slippage || undefined,
        exchange: trade.exchange || undefined,
        timeframe: trade.timeframe || undefined,
        setup_type: trade.setup_type || undefined
      })) as Trade[];

      setTrades(processedTrades);
      calculateAdvancedMetrics(processedTrades);
    } catch (error) {
      console.error('Error fetching trades:', error);
    }
  };

  const calculateAdvancedMetrics = (trades: Trade[]) => {
    if (!trades || trades.length === 0) {
      setAdvancedMetrics({
        expectancy: 0,
        mae: 0,
        mfe: 0,
        profitFactor: 0,
        monteCarloResults: {
          worstDrawdown: 0,
          bestReturn: 0,
          averageReturn: 0,
          confidenceInterval: [0, 0],
        },
      });
      return;
    }

    const winningTrades = trades.filter(t => (t.pnl || 0) > 0);
    const losingTrades = trades.filter(t => (t.pnl || 0) < 0);
    
    const winRate = trades.length > 0 ? winningTrades.length / trades.length : 0;
    const avgWin = winningTrades.length > 0 
      ? winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / winningTrades.length 
      : 0;
    const avgLoss = losingTrades.length > 0
      ? Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0) / losingTrades.length)
      : 0;
    
    const expectancy = (winRate * avgWin) - ((1 - winRate) * avgLoss);

    const maes: number[] = [];
    const mfes: number[] = [];

    trades.forEach(trade => {
      if (!trade.exit_price || !trade.entry_price) return;
      
      const entryPrice = trade.entry_price;
      const exitPrice = trade.exit_price;
      const direction = trade.type === 'Long' ? 1 : -1;
      
      for (let i = 0; i < 100; i++) {
        const price = entryPrice + (direction * (exitPrice - entryPrice) * (i / 100));
        const unrealizedPnL = direction * (price - entryPrice);
        
        maes.push(Math.min(0, unrealizedPnL));
        mfes.push(Math.max(0, unrealizedPnL));
      }
    });

    const mae = maes.length > 0 ? Math.abs(Math.min(...maes)) : 0;
    const mfe = mfes.length > 0 ? Math.max(...mfes) : 0;

    const totalProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

    const monteCarloResults = runMonteCarloSimulation(trades);

    setAdvancedMetrics({
      expectancy,
      mae,
      mfe,
      profitFactor,
      monteCarloResults,
    });
  };

  const runMonteCarloSimulation = (trades: Trade[]) => {
    if (!trades || trades.length === 0) {
      return {
        worstDrawdown: 0,
        bestReturn: 0,
        averageReturn: 0,
        confidenceInterval: [0, 0] as [number, number],
      };
    }

    const returns = trades
      .filter(t => t.entry_price && t.exit_price && t.quantity)
      .map(t => ((t.pnl || 0) / (t.entry_price * t.quantity)) || 0);

    if (returns.length === 0) {
      return {
        worstDrawdown: 0,
        bestReturn: 0,
        averageReturn: 0,
        confidenceInterval: [0, 0] as [number, number],
      };
    }

    const numSimulations = 1000;
    const results: number[] = [];

    for (let i = 0; i < numSimulations; i++) {
      let cumulativeReturn = 0;
      let maxDrawdown = 0;
      let peak = 0;

      for (let j = 0; j < returns.length; j++) {
        const randomReturn = returns[Math.floor(Math.random() * returns.length)];
        cumulativeReturn += randomReturn;
        peak = Math.max(peak, cumulativeReturn);
        maxDrawdown = Math.min(maxDrawdown, cumulativeReturn - peak);
      }

      results.push(cumulativeReturn);
    }

    results.sort((a, b) => a - b);
    const worstDrawdown = Math.min(...results);
    const bestReturn = Math.max(...results);
    const averageReturn = results.reduce((sum, r) => sum + r, 0) / results.length;
    const confidenceInterval: [number, number] = [
      results[Math.floor(results.length * 0.025)],
      results[Math.floor(results.length * 0.975)]
    ];

    return {
      worstDrawdown,
      bestReturn,
      averageReturn,
      confidenceInterval,
    };
  };

  const calculatePositionSize = () => {
    const { accountSize, riskPercentage, entryPrice, stopLoss } = calculatorInputs;
    const riskAmount = accountSize * (riskPercentage / 100);
    const positionSize = entryPrice > 0 && stopLoss > 0
      ? riskAmount / Math.abs(entryPrice - stopLoss)
      : 0;

    return {
      positionSize,
      riskAmount,
    };
  };

  const calculateRiskMetrics = () => {
    const { accountSize, riskPercentage, entryPrice, stopLoss, takeProfit } = calculatorInputs;
    const riskAmount = accountSize * (riskPercentage / 100);
    const rewardAmount = takeProfit > 0 && entryPrice > 0
      ? Math.abs(takeProfit - entryPrice) * (riskAmount / Math.abs(entryPrice - stopLoss))
      : 0;
    const riskRewardRatio = riskAmount > 0 ? rewardAmount / riskAmount : 0;
    const breakevenWinRate = riskRewardRatio > 0 ? 1 / (1 + riskRewardRatio) : 0;

    return {
      riskAmount,
      rewardAmount,
      riskRewardRatio,
      breakevenWinRate,
    };
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    setCalculatorInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetchTrades();
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleDownload = () => {
    const headers = [
      'Date',
      'Symbol',
      'Type',
      'Entry Price',
      'Exit Price',
      'Quantity',
      'P&L',
      'P&L %',
      'Strategy',
      'Notes'
    ].join(',');

    const rows = trades.map(trade => [
      trade.entry_date,
      trade.symbol,
      trade.type,
      trade.entry_price,
      trade.exit_price || '',
      trade.quantity,
      trade.pnl || '',
      trade.pnl_percentage || '',
      trade.strategy || '',
      trade.notes || ''
    ].join(','));

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `trades_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const positionMetrics = calculatePositionSize();
  const riskMetrics = calculateRiskMetrics();

  return (
    <div style={{ 
      padding: '5px',
      color: 'white',
      background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 27, 75, 0.3) 100%)',
      minHeight: '100vh',
      backdropFilter: 'blur(10px)'
    }}>
      <PageHeader 
        title="Trading Analytics"
        subtitle="Analyze your trading performance and patterns"
        actions={
          <div style={{ display: 'flex', gap: '10px' }}>
            <AnimatedButton
              icon={<RiRefreshLine />}
              onClick={handleRefresh}
              variant="secondary"
              isLoading={isRefreshing}
            >
              Refresh
            </AnimatedButton>
            <AnimatedButton
              icon={<RiDownload2Line />}
              onClick={handleDownload}
              variant="secondary"
            >
              Download
            </AnimatedButton>
          </div>
        }
      />

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
        {/* Calculator Tabs */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {[
            { id: 'position', label: 'Position Sizing', icon: RiCalculatorLine },
            { id: 'risk', label: 'Risk Analysis', icon: RiScales3Line },
            { id: 'advanced', label: 'Advanced Metrics', icon: RiBarChartBoxLine },
            { id: 'patterns', label: 'Pattern Analysis', icon: RiLineChartLine },
          ].map((tab) => (
            <AnimatedButton
              key={tab.id}
              onClick={() => setActiveTab(tab.id as 'position' | 'risk' | 'advanced' | 'patterns')}
              variant={activeTab === tab.id ? 'primary' : 'secondary'}
              icon={<tab.icon />}
            >
              {tab.label}
            </AnimatedButton>
          ))}
        </div>

        {/* Position Sizing Calculator */}
        {activeTab === 'position' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AnimatedCard>
              <div style={{ display: 'grid', gap: '16px' }}>
                <AnimatedInput
                  label="Account Size"
                  type="number"
                  value={calculatorInputs.accountSize}
                  onChange={(e) => handleInputChange('accountSize', e.target.value)}
                  placeholder="Enter account size"
                />
                <AnimatedInput
                  label="Risk Percentage"
                  type="number"
                  value={calculatorInputs.riskPercentage}
                  onChange={(e) => handleInputChange('riskPercentage', e.target.value)}
                  placeholder="Enter risk percentage"
                />
                <AnimatedInput
                  label="Entry Price"
                  type="number"
                  value={calculatorInputs.entryPrice}
                  onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                  placeholder="Enter entry price"
                />
                <AnimatedInput
                  label="Stop Loss"
                  type="number"
                  value={calculatorInputs.stopLoss}
                  onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                  placeholder="Enter stop loss"
                />
              </div>
            </AnimatedCard>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <AnimatedCard>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Position Size</h3>
                <p style={{ fontSize: '24px', color: '#60a5fa' }}>
                  {positionMetrics.positionSize.toFixed(2)} units
                </p>
              </AnimatedCard>
              <AnimatedCard>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Risk Amount</h3>
                <p style={{ fontSize: '24px', color: '#60a5fa' }}>
                  ${positionMetrics.riskAmount.toFixed(2)}
                </p>
              </AnimatedCard>
            </div>
          </div>
        )}

        {/* Risk Analysis */}
        {activeTab === 'risk' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <AnimatedCard>
              <div style={{ display: 'grid', gap: '16px' }}>
                <AnimatedInput
                  label="Take Profit"
                  type="number"
                  value={calculatorInputs.takeProfit}
                  onChange={(e) => handleInputChange('takeProfit', e.target.value)}
                  placeholder="Enter take profit"
                />
              </div>
            </AnimatedCard>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <AnimatedCard>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Risk/Reward Ratio</h3>
                <p style={{ fontSize: '24px', color: '#60a5fa' }}>
                  {riskMetrics.riskRewardRatio.toFixed(2)}
                </p>
              </AnimatedCard>
              <AnimatedCard>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Breakeven Win Rate</h3>
                <p style={{ fontSize: '24px', color: '#60a5fa' }}>
                  {(riskMetrics.breakevenWinRate * 100).toFixed(1)}%
                </p>
              </AnimatedCard>
            </div>
          </div>
        )}

        {/* Advanced Metrics */}
        {activeTab === 'advanced' && (
          <div style={{ display: 'grid', gap: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
              <AnimatedCard>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Expectancy</h3>
                <p style={{ fontSize: '24px', color: '#60a5fa' }}>
                  ${advancedMetrics.expectancy.toFixed(2)}
                </p>
              </AnimatedCard>
              <AnimatedCard>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>Profit Factor</h3>
                <p style={{ fontSize: '24px', color: '#60a5fa' }}>
                  {advancedMetrics.profitFactor.toFixed(2)}
                </p>
              </AnimatedCard>
              <AnimatedCard>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>MAE</h3>
                <p style={{ fontSize: '24px', color: '#60a5fa' }}>
                  ${advancedMetrics.mae.toFixed(2)}
                </p>
              </AnimatedCard>
              <AnimatedCard>
                <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>MFE</h3>
                <p style={{ fontSize: '24px', color: '#60a5fa' }}>
                  ${advancedMetrics.mfe.toFixed(2)}
                </p>
              </AnimatedCard>
            </div>

            <AnimatedCard>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Monte Carlo Simulation</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div>
                  <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>Worst Drawdown</p>
                  <p style={{ fontSize: '20px', color: '#ef4444' }}>
                    {(advancedMetrics.monteCarloResults.worstDrawdown * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>Best Return</p>
                  <p style={{ fontSize: '20px', color: '#22c55e' }}>
                    {(advancedMetrics.monteCarloResults.bestReturn * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>Average Return</p>
                  <p style={{ fontSize: '20px', color: '#60a5fa' }}>
                    {(advancedMetrics.monteCarloResults.averageReturn * 100).toFixed(1)}%
                  </p>
                </div>
                <div>
                  <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>95% Confidence Interval</p>
                  <p style={{ fontSize: '20px', color: '#60a5fa' }}>
                    {(advancedMetrics.monteCarloResults.confidenceInterval[0] * 100).toFixed(1)}% to{' '}
                    {(advancedMetrics.monteCarloResults.confidenceInterval[1] * 100).toFixed(1)}%
                  </p>
                </div>
              </div>
            </AnimatedCard>
          </div>
        )}

        {/* Pattern Analysis */}
        {activeTab === 'patterns' && (
          <PatternAnalysis trades={trades} />
        )}
      </div>
    </div>
  );
}; 