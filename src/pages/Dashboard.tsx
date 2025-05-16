import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { useState, useEffect } from 'react';
import { 
  RiArrowUpLine, 
  RiArrowDownLine,
  RiExchangeDollarLine,
  RiPieChartLine,
  RiBarChartGroupedLine,
  RiScales3Line,
  RiCalendarCheckLine,
  RiTimeLine,
  RiFilterLine,
  RiMoreLine,
  RiLineChartLine,
  RiBarChartLine,
  RiPieChart2Line,
  RiSettings4Line,
  RiDownload2Line,
  RiRefreshLine
} from 'react-icons/ri';
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { TradingCalendar } from '../components/TradingCalendar';
import type { Trade as CalendarTrade } from '../components/TradingCalendar';
import { supabase } from '../lib/supabase';
import type { Trade as DBTrade } from '../types/trade';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const timeRanges = ['1D', '1W', '1M', '3M', '6M', '1Y', 'ALL'];

const chartTypes = [
  { id: 'line', icon: RiLineChartLine, label: 'Line' },
  { id: 'bar', icon: RiBarChartLine, label: 'Bar' }
];

const performanceData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Account Balance',
      data: [10000, 12000, 11500, 13000, 14500, 16000],
      borderColor: '#3b82f6',
      backgroundColor: 'rgba(59, 130, 246, 0.1)',
      fill: true,
      tension: 0.4,
      borderWidth: 2,
      pointBackgroundColor: '#3b82f6',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#3b82f6',
      pointRadius: 4,
      pointHoverRadius: 6,
    },
  ],
};

const profitDistributionData = {
  labels: ['Wins', 'Losses'],
  datasets: [{
    data: [65, 35],
    backgroundColor: ['rgba(34, 197, 94, 0.8)', 'rgba(239, 68, 68, 0.8)'],
    borderColor: ['#22c55e', '#ef4444'],
    borderWidth: 2,
    hoverOffset: 4,
  }]
};

const tradeTypeData = {
  labels: ['Long', 'Short'],
  datasets: [{
    label: 'Trade Types',
    data: [70, 30],
    backgroundColor: ['rgba(34, 197, 94, 0.2)', 'rgba(239, 68, 68, 0.2)'],
    borderColor: ['#22c55e', '#ef4444'],
    borderWidth: 2,
    hoverOffset: 4,
  }]
};

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  interaction: {
    intersect: false,
    mode: 'index' as const,
  },
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 12,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      displayColors: false,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      callbacks: {
        label: (context: any) => `$${context.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.6)',
        font: {
          size: 12,
        },
        padding: 8,
      },
      border: {
        display: false,
      },
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
        drawBorder: false,
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.6)',
        font: {
          size: 12,
        },
        padding: 8,
      },
      border: {
        display: false,
      },
    },
  },
};

const doughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: true,
      position: 'bottom' as const,
      labels: {
        color: 'rgba(255, 255, 255, 0.6)',
        padding: 20,
        font: {
          size: 12,
        },
        boxWidth: 12,
        boxHeight: 12,
      },
    },
    tooltip: {
      backgroundColor: 'rgba(15, 23, 42, 0.95)',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 12,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      displayColors: true,
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
  },
  cutout: '75%',
};

const keyMetrics = [
  {
    name: 'Total P&L',
    value: '+$6,450',
    change: '+12.5%',
    isPositive: true,
    icon: RiExchangeDollarLine,
    color: '#22c55e'
  },
  {
    name: 'Win Rate',
    value: '65%',
    change: '+5%',
    isPositive: true,
    icon: RiPieChartLine,
    color: '#3b82f6'
  },
  {
    name: 'Avg. Win Rate',
    value: '$0',
    change: '0%',
    isPositive: true,
    icon: RiBarChartGroupedLine,
    color: '#8b5cf6'
  },
  {
    name: 'Sharpe Ratio',
    value: '1.8',
    change: '+0.2',
    isPositive: true,
    icon: RiLineChartLine,
    color: '#f59e0b'
  }
];

const sampleTrades = [
  { id: '1', date: '2024-02-12', symbol: 'AAPL', type: 'Long' as const, result: 'Win' as const, profit: 350, volume: 100, entry: 180.50, exit: 184.00 },
  { id: '2', date: '2024-02-11', symbol: 'TSLA', type: 'Short' as const, result: 'Loss' as const, profit: -150, volume: 50, entry: 193.25, exit: 196.25 },
  { id: '3', date: '2024-02-10', symbol: 'MSFT', type: 'Long' as const, result: 'Win' as const, profit: 275, volume: 75, entry: 402.50, exit: 406.15 },
  { id: '4', date: '2024-02-09', symbol: 'AMZN', type: 'Long' as const, result: 'Win' as const, profit: 420, volume: 60, entry: 168.75, exit: 175.75 },
  { id: '5', date: '2024-02-15', symbol: 'META', type: 'Long' as const, result: 'Win' as const, profit: 550, volume: 80, entry: 468.25, exit: 475.00 },
  { id: '6', date: '2024-02-15', symbol: 'NVDA', type: 'Short' as const, result: 'Loss' as const, profit: -280, volume: 40, entry: 726.50, exit: 733.50 },
  { id: '7', date: '2024-02-08', symbol: 'AMD', type: 'Long' as const, result: 'Loss' as const, profit: -180, volume: 120, entry: 172.75, exit: 171.25 },
];

interface CircularProgressProps {
  value: number;
  max: number;
  color: string;
  size?: number;
  strokeWidth?: number;
  children?: ReactNode;
}

const CircularProgress = ({ 
  value, 
  max, 
  color, 
  size = 120, 
  strokeWidth = 8,
  children 
}: CircularProgressProps) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = (value / max) * circumference;

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(255, 255, 255, 0.1)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          fill="none"
          style={{
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}
      >
        {children}
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const [selectedRange, setSelectedRange] = useState('1M');
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [hoveredTrade, setHoveredTrade] = useState<number | null>(null);
  const [selectedChartType, setSelectedChartType] = useState('line');
  const [showMetricDetails, setShowMetricDetails] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [calendarTrades, setCalendarTrades] = useState<CalendarTrade[]>([]);
  const [isLoadingTrades, setIsLoadingTrades] = useState(true);
  const [recentTrades, setRecentTrades] = useState<DBTrade[]>([]);
  const [keyMetrics, setKeyMetrics] = useState([
    {
      name: 'Total P&L',
      value: '$0',
      change: '0%',
      isPositive: true,
      icon: RiExchangeDollarLine,
      color: '#22c55e'
    },
    {
      name: 'Win Rate',
      value: '0%',
      change: '0%',
      isPositive: true,
      icon: RiPieChartLine,
      color: '#3b82f6'
    },
    {
      name: 'Avg. Win Rate',
      value: '$0',
      change: '0%',
      isPositive: true,
      icon: RiBarChartGroupedLine,
      color: '#8b5cf6'
    },
    {
      name: 'Sharpe Ratio',
      value: '0',
      change: '0',
      isPositive: true,
      icon: RiLineChartLine,
      color: '#f59e0b'
    }
  ]);

  const calculateMetrics = (trades: DBTrade[]) => {
    if (!trades.length) return;

    // Calculate Total P&L
    const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    
    // Calculate Win Rate
    const winningTrades = trades.filter(trade => (trade.pnl || 0) > 0);
    const winRate = (winningTrades.length / trades.length) * 100;
    
    // Calculate Average Win Rate (average profit of winning trades)
    const avgWinRate = winningTrades.length > 0 
      ? winningTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0) / winningTrades.length
      : 0;
    
    // Calculate Sharpe Ratio
    const returns = trades.map(trade => trade.pnl || 0);
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
    const stdDev = Math.sqrt(
      returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length
    );
    const sharpeRatio = stdDev === 0 ? 0 : avgReturn / stdDev;

    // Update metrics
    setKeyMetrics([
      {
        name: 'Total P&L',
        value: totalPnL >= 0 ? `+$${totalPnL.toFixed(2)}` : `-$${Math.abs(totalPnL).toFixed(2)}`,
        change: '0%',
        isPositive: totalPnL >= 0,
        icon: RiExchangeDollarLine,
        color: totalPnL >= 0 ? '#22c55e' : '#ef4444'
      },
      {
        name: 'Win Rate',
        value: `${winRate.toFixed(1)}%`,
        change: '0%',
        isPositive: winRate > 50,
        icon: RiPieChartLine,
        color: '#3b82f6'
      },
      {
        name: 'Avg. Win Rate',
        value: `$${avgWinRate.toFixed(2)}`,
        change: '0%',
        isPositive: avgWinRate > 0,
        icon: RiBarChartGroupedLine,
        color: '#8b5cf6'
      },
      {
        name: 'Sharpe Ratio',
        value: sharpeRatio.toFixed(2),
        change: '0',
        isPositive: sharpeRatio > 0,
        icon: RiLineChartLine,
        color: '#f59e0b'
      }
    ]);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingTrades(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all trades for metrics calculation
        const { data: allTrades, error: allTradesError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('entry_date', { ascending: false });

        if (allTradesError) throw allTradesError;
        
        // Calculate metrics from all trades
        if (allTrades) {
          calculateMetrics(allTrades);
          setCalendarTrades(allTrades.map(trade => {
            // Convert UTC date to local date for calendar display
            const date = new Date(trade.entry_date);
            // Format as YYYY-MM-DD in local time
            const localDate = date.toLocaleDateString('en-CA'); // en-CA gives YYYY-MM-DD format
            return {
              id: trade.id,
              date: localDate,
              symbol: trade.symbol,
              type: trade.type,
              result: trade.pnl && trade.pnl > 0 ? 'Win' : 'Loss',
              profit: trade.pnl || 0,
              volume: trade.quantity,
              entry: trade.entry_price,
              exit: trade.exit_price || trade.entry_price
            };
          }));
        }

        // Fetch recent trades (last 24 hours)
        const now = new Date();
        const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        // Format dates in UTC ISO format
        const recentStartDate = twentyFourHoursAgo.toISOString();
        const recentEndDate = now.toISOString();

        const { data: recentTradesData, error: recentError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .gte('entry_date', recentStartDate)
          .lte('entry_date', recentEndDate)
          .order('entry_date', { ascending: false })
          .limit(4);

        if (recentError) throw recentError;
        setRecentTrades(recentTradesData || []);

      } catch (error) {
        console.error('Error fetching trades:', error);
      } finally {
        setIsLoadingTrades(false);
      }
    };

    fetchData();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const renderChart = () => {
    switch (selectedChartType) {
      case 'bar':
        return <Bar data={performanceData} options={chartOptions} />;
      default:
        return <Line data={performanceData} options={chartOptions} />;
    }
  };

  return (
    <div style={{ 
      padding: '5px', 
      color: 'white',
      background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 27, 75, 0.3) 100%)',
      minHeight: '100vh',
      backdropFilter: 'blur(10px)',
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '2px',
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '2px 5px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            marginBottom: '2px',
            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Trading Dashboard
          </h1>
          <p style={{ 
            color: 'rgba(255, 255, 255, 0.6)', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '5px',
            fontSize: '13px'
          }}>
            <RiCalendarCheckLine />
            <span>February 12, 2024</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleRefresh}
            style={{ 
              padding: '10px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              transform: isRefreshing ? 'rotate(180deg)' : 'rotate(0)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <RiRefreshLine />
          </button>
          <button
            style={{ 
              padding: '10px',
              borderRadius: '12px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <RiDownload2Line />
          </button>
          <button style={{ 
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '12px',
            border: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 8px rgba(37, 99, 235, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.2)';
          }}>
            <RiTimeLine />
            New Trade
          </button>
        </div>
      </div>

      {/* Key Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '5px',
        marginBottom: '5px'
      }}>
        {keyMetrics.map((metric, index) => (
          <motion.div
            key={metric.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            style={{
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
              borderRadius: '16px',
              padding: '5px',
              border: `1px solid ${metric.color}20`,
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '4px',
              height: '100%',
              background: metric.color,
              opacity: 0.5
            }} />
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              marginBottom: '5px'
            }}>
              <metric.icon style={{ color: metric.color, width: '20px', height: '20px' }} />
              <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>{metric.name}</span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>
              {metric.value}
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center',
              gap: '4px',
              color: metric.isPositive ? '#22c55e' : '#ef4444',
              fontSize: '14px'
            }}>
              {metric.isPositive ? <RiArrowUpLine /> : <RiArrowDownLine />}
              {metric.change}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '5px',
        marginBottom: '5px'
      }}>
        {/* Left Column - Chart */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          {/* Performance Chart */}
          <div style={{ 
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
            borderRadius: '16px',
            padding: '5px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '16px' 
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Performance Overview
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Account growth over time
                </p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {chartTypes.map((type) => (
                  <button
                    key={type.id}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: 'none',
                      backgroundColor: selectedChartType === type.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                      color: selectedChartType === type.id ? '#fff' : 'rgba(255, 255, 255, 0.6)',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '14px'
                    }}
                    onClick={() => setSelectedChartType(type.id)}
                  >
                    <type.icon />
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ height: '400px' }}>
              {renderChart()}
            </div>
          </div>

          {/* Trading Calendar */}
          {isLoadingTrades ? (
            <div style={{
              background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px'
            }}>
              <div style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Loading trades...</div>
            </div>
          ) : (
            <TradingCalendar trades={calendarTrades} />
          )}
        </div>

        {/* Right Column - Recent Trades & Quick Stats */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '5px'
        }}>
          {/* Recent Trades */}
          <div style={{ 
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            flex: 1
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginBottom: '20px' 
            }}>
              <div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold',
                  marginBottom: '4px',
                  background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Recent Trades
                </h3>
                <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.6)' }}>
                  Last 24 hours
                </p>
              </div>
              <button style={{
                padding: '8px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'rgba(255, 255, 255, 0.6)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}>
                <RiFilterLine />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {isLoadingTrades ? (
                // Loading skeleton
                Array(4).fill(null).map((_, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      }} />
                      <div>
                        <div style={{ 
                          width: '80px', 
                          height: '14px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '4px',
                          marginBottom: '8px'
                        }} />
                        <div style={{ 
                          width: '120px', 
                          height: '10px', 
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          borderRadius: '4px'
                        }} />
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        width: '60px', 
                        height: '14px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px',
                        marginBottom: '8px'
                      }} />
                      <div style={{ 
                        width: '80px', 
                        height: '10px', 
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        borderRadius: '4px'
                      }} />
                    </div>
                  </div>
                ))
              ) : recentTrades.length === 0 ? (
                <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  color: 'rgba(255, 255, 255, 0.6)',
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                  borderRadius: '12px',
                }}>
                  No trades in the last 24 hours
                </div>
              ) : (
                recentTrades.map((trade, index) => (
                  <motion.div
                    key={trade.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px',
                      backgroundColor: hoveredTrade === index 
                        ? 'rgba(255, 255, 255, 0.05)' 
                        : 'rgba(255, 255, 255, 0.02)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={() => setHoveredTrade(index)}
                    onMouseLeave={() => setHoveredTrade(null)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: trade.type === 'Long' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: trade.type === 'Long' ? '#22c55e' : '#ef4444'
                      }}>
                        {trade.type === 'Long' ? <RiArrowUpLine size={20} /> : <RiArrowDownLine size={20} />}
                      </div>
                      <div>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px', 
                          marginBottom: '2px' 
                        }}>
                          <span style={{ fontWeight: '600' }}>{trade.symbol}</span>
                          <span style={{ 
                            fontSize: '12px', 
                            color: 'rgba(255, 255, 255, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}>
                            <RiTimeLine size={12} />
                            {new Date(trade.entry_date).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true
                            })}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                          ${trade.entry_price} → ${trade.exit_price || 'Open'}
                        </div>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ 
                        color: (trade.pnl || 0) >= 0 ? '#22c55e' : '#ef4444',
                        fontWeight: '600',
                        marginBottom: '2px'
                      }}>
                        ${Math.abs(trade.pnl || 0)}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>
                        {trade.quantity} shares
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 