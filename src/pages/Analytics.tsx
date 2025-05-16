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
} from 'react-icons/ri';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { PatternAnalysis } from '../components/PatternAnalysis';
import type { Database } from '../lib/supabase-types';

interface CalculatorInputs {
  accountSize: number;
  riskPercentage: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
}

type DBTrade = Database['public']['Tables']['trades']['Row'];
type TradeInsert = Database['public']['Tables']['trades']['Insert'];

// Define which fields can be undefined
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
  // Optional fields
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
  const [calculatorInputs, setCalculatorInputs] = useState<CalculatorInputs>({
    accountSize: 10000,
    riskPercentage: 1,
    entryPrice: 0,
    stopLoss: 0,
    takeProfit: 0,
  });

  const [activeTab, setActiveTab] = useState<'position' | 'risk' | 'advanced' | 'patterns'>('advanced');
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

      // Convert null to undefined for our frontend
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

    // Calculate Expectancy
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

    // Calculate MAE and MFE
    const maes: number[] = [];
    const mfes: number[] = [];

    trades.forEach(trade => {
      if (!trade.exit_price || !trade.entry_price) return;
      
      const entryPrice = trade.entry_price;
      const exitPrice = trade.exit_price;
      const direction = trade.type === 'Long' ? 1 : -1;
      
      // Simulate price movement with 100 points
      for (let i = 0; i < 100; i++) {
        const price = entryPrice + (direction * (exitPrice - entryPrice) * (i / 100));
        const unrealizedPnL = direction * (price - entryPrice);
        
        maes.push(Math.min(0, unrealizedPnL));
        mfes.push(Math.max(0, unrealizedPnL));
      }
    });

    const mae = maes.length > 0 ? Math.abs(Math.min(...maes)) : 0;
    const mfe = mfes.length > 0 ? Math.max(...mfes) : 0;

    // Calculate Profit Factor
    const totalProfit = winningTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + (t.pnl || 0), 0));
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : totalProfit > 0 ? Infinity : 0;

    // Monte Carlo Simulation
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

    const simulations = 1000;
    const simulatedReturns: number[] = [];
    
    for (let i = 0; i < simulations; i++) {
      let simulatedReturn = 1;
      for (let j = 0; j < returns.length; j++) {
        const randomIndex = Math.floor(Math.random() * returns.length);
        simulatedReturn *= (1 + returns[randomIndex]);
      }
      simulatedReturns.push(simulatedReturn - 1);
    }

    simulatedReturns.sort((a, b) => a - b);
    
    return {
      worstDrawdown: simulatedReturns[0],
      bestReturn: simulatedReturns[simulations - 1],
      averageReturn: simulatedReturns.reduce((a, b) => a + b) / simulations,
      confidenceInterval: [
        simulatedReturns[Math.floor(simulations * 0.05)],
        simulatedReturns[Math.floor(simulations * 0.95)]
      ] as [number, number],
    };
  };

  const calculatePositionSize = () => {
    const { accountSize, riskPercentage, entryPrice, stopLoss } = calculatorInputs;
    const riskAmount = (accountSize * riskPercentage) / 100;
    const stopDistance = Math.abs(entryPrice - stopLoss);
    const positionSize = stopDistance > 0 ? riskAmount / stopDistance : 0;
    const totalPositionValue = positionSize * entryPrice;

    return {
      positionSize: positionSize.toFixed(2),
      riskAmount: riskAmount.toFixed(2),
      totalPositionValue: totalPositionValue.toFixed(2),
      leverage: totalPositionValue > 0 ? (totalPositionValue / accountSize).toFixed(2) : '0',
    };
  };

  const calculateRiskMetrics = () => {
    const { entryPrice, stopLoss, takeProfit } = calculatorInputs;
    const riskPerTrade = Math.abs(entryPrice - stopLoss);
    const rewardPerTrade = Math.abs(takeProfit - entryPrice);
    const riskRewardRatio = riskPerTrade > 0 ? (rewardPerTrade / riskPerTrade).toFixed(2) : '0';
    const winRate = 50; // Default win rate for break-even
    const breakevenWinRate = riskPerTrade > 0 ? ((riskPerTrade / (riskPerTrade + rewardPerTrade)) * 100).toFixed(1) : '0';

    return {
      riskPerTrade: riskPerTrade.toFixed(2),
      rewardPerTrade: rewardPerTrade.toFixed(2),
      riskRewardRatio,
      breakevenWinRate,
      expectedValue: ((winRate / 100 * rewardPerTrade) - ((100 - winRate) / 100 * riskPerTrade)).toFixed(2),
    };
  };

  const handleInputChange = (field: keyof CalculatorInputs, value: string) => {
    setCalculatorInputs(prev => ({
      ...prev,
      [field]: parseFloat(value) || 0,
    }));
  };

  const positionMetrics = calculatePositionSize();
  const riskMetrics = calculateRiskMetrics();

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Advanced Analytics
        </h1>
      </div>

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
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'position' | 'risk' | 'advanced' | 'patterns')}
            style={{
              padding: '12px 24px',
              borderRadius: '12px',
              border: 'none',
              background: activeTab === tab.id 
                ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(139, 92, 246, 0.2))'
                : 'rgba(255, 255, 255, 0.05)',
              color: activeTab === tab.id ? 'white' : 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
      }}>
        {activeTab === 'patterns' ? (
          <div style={{ gridColumn: '1 / -1' }}>
            <PatternAnalysis trades={trades} />
          </div>
        ) : activeTab === 'advanced' ? (
          <>
            {/* Advanced Metrics Section */}
            <div style={{
              gridColumn: '1 / -1',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '24px',
            }}>
              {/* Expectancy & Profit Factor */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RiStockLine />
                  System Performance
                </h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{
                    padding: '16px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Expectancy
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      ${advancedMetrics.expectancy.toFixed(2)}
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Profit Factor
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {advancedMetrics.profitFactor.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* MAE & MFE */}
              <div style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RiPulseLine />
                  Trade Efficiency
                </h2>
                <div style={{ display: 'grid', gap: '16px' }}>
                  <div style={{
                    padding: '16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Maximum Favorable Excursion
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      ${advancedMetrics.mfe.toFixed(2)}
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Maximum Adverse Excursion
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      ${advancedMetrics.mae.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Monte Carlo Simulation */}
              <div style={{
                gridColumn: '1 / -1',
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <RiFlowChart />
                  Monte Carlo Analysis
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                  <div style={{
                    padding: '16px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Expected Return (95% CI)
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {(advancedMetrics.monteCarloResults.confidenceInterval[0] * 100).toFixed(1)}% to {(advancedMetrics.monteCarloResults.confidenceInterval[1] * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Average Return
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {(advancedMetrics.monteCarloResults.averageReturn * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Best Possible Return
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {(advancedMetrics.monteCarloResults.bestReturn * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    background: 'rgba(239, 68, 68, 0.1)',
                    borderRadius: '12px',
                    border: '1px solid rgba(239, 68, 68, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Worst Drawdown
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                      {(advancedMetrics.monteCarloResults.worstDrawdown * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Inputs Section */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Calculator Inputs</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px' 
                  }}>
                    Account Size ($)
                  </label>
                  <input
                    type="number"
                    value={calculatorInputs.accountSize}
                    onChange={(e) => handleInputChange('accountSize', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      fontSize: '16px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px' 
                  }}>
                    Risk Per Trade (%)
                  </label>
                  <input
                    type="number"
                    value={calculatorInputs.riskPercentage}
                    onChange={(e) => handleInputChange('riskPercentage', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      fontSize: '16px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px' 
                  }}>
                    Entry Price ($)
                  </label>
                  <input
                    type="number"
                    value={calculatorInputs.entryPrice}
                    onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      fontSize: '16px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px' 
                  }}>
                    Stop Loss ($)
                  </label>
                  <input
                    type="number"
                    value={calculatorInputs.stopLoss}
                    onChange={(e) => handleInputChange('stopLoss', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      fontSize: '16px',
                    }}
                  />
                </div>
                <div>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '8px', 
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: '14px' 
                  }}>
                    Take Profit ($)
                  </label>
                  <input
                    type="number"
                    value={calculatorInputs.takeProfit}
                    onChange={(e) => handleInputChange('takeProfit', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      background: 'rgba(255, 255, 255, 0.05)',
                      color: 'white',
                      fontSize: '16px',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Results Section */}
            <div style={{
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
            }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>
                {activeTab === 'position' ? 'Position Size Results' : 'Risk Analysis Results'}
              </h2>
              
              {activeTab === 'position' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Position Size
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {positionMetrics.positionSize} units
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Risk Amount
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      ${positionMetrics.riskAmount}
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Position Value
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      ${positionMetrics.totalPositionValue}
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Leverage
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {positionMetrics.leverage}x
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Risk/Reward Ratio
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      1:{riskMetrics.riskRewardRatio}
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Break-even Win Rate
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      {riskMetrics.breakevenWinRate}%
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(34, 197, 94, 0.1)',
                    border: '1px solid rgba(34, 197, 94, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Potential Reward
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      ${riskMetrics.rewardPerTrade}
                    </div>
                  </div>
                  <div style={{
                    padding: '16px',
                    borderRadius: '12px',
                    background: 'rgba(245, 158, 11, 0.1)',
                    border: '1px solid rgba(245, 158, 11, 0.2)',
                  }}>
                    <div style={{ color: 'rgba(255, 255, 255, 0.6)', marginBottom: '4px', fontSize: '14px' }}>
                      Expected Value
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                      ${riskMetrics.expectedValue}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}; 