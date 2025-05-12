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
import { useState } from 'react';
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
  { id: 'bar', icon: RiBarChartLine, label: 'Bar' },
  { id: 'distribution', icon: RiPieChart2Line, label: 'Distribution' }
];

const performanceData = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [
    {
      label: 'Account Balance',
      data: [10000, 12000, 11500, 13000, 14500, 16000],
      borderColor: '#2563eb',
      backgroundColor: 'rgba(37, 99, 235, 0.1)',
      fill: true,
      tension: 0.4,
    },
  ],
};

const profitDistributionData = {
  labels: ['Wins', 'Losses'],
  datasets: [{
    data: [65, 35],
    backgroundColor: ['#22c55e', '#ef4444'],
    borderWidth: 0,
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
      backgroundColor: 'rgba(17, 24, 39, 0.9)',
      titleColor: '#fff',
      bodyColor: '#fff',
      padding: 12,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      displayColors: false,
      callbacks: {
        label: (context: any) => `$${context.parsed.y.toLocaleString()}`,
      },
    },
  },
  scales: {
    y: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
      },
      ticks: {
        color: '#94a3b8',
      },
    },
    x: {
      grid: {
        color: 'rgba(255, 255, 255, 0.05)',
      },
      ticks: {
        color: '#94a3b8',
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
        color: '#94a3b8',
        padding: 20,
        font: {
          size: 12,
        },
      },
    },
  },
  cutout: '70%',
};

const metrics = [
  {
    name: 'Win Rate',
    value: '65%',
    change: '+5%',
    isPositive: true,
    icon: RiPieChartLine,
    description: 'Last 30 days',
    details: {
      'Total Trades': '125',
      'Winning Trades': '81',
      'Losing Trades': '44',
      'Break Even': '0',
      'Win Streak': '7 trades',
      'Longest Win Streak': '12 trades'
    }
  },
  {
    name: 'Profit Factor',
    value: '2.1',
    change: '+0.3',
    isPositive: true,
    icon: RiScales3Line,
    description: 'Risk/Reward ratio',
    details: {
      'Gross Profit': '$12,500',
      'Gross Loss': '$5,950',
      'Average RRR': '1.8',
      'Best Trade': '$1,200',
      'Expected Value': '$145/trade',
      'Risk-Adjusted Return': '18.5%'
    }
  },
  {
    name: 'Average Win',
    value: '$450',
    change: '-$50',
    isPositive: false,
    icon: RiBarChartGroupedLine,
    description: 'Per trade',
    details: {
      'Largest Win': '$1,200',
      'Average Win': '$450',
      'Win Consistency': '72%',
      'Best Day': '$2,100',
      'Profit Distribution': 'Normal',
      'Standard Deviation': '$180'
    }
  },
  {
    name: 'Average Loss',
    value: '$200',
    change: '-$25',
    isPositive: true,
    icon: RiExchangeDollarLine,
    description: 'Per trade',
    details: {
      'Largest Loss': '-$800',
      'Average Loss': '-$200',
      'Loss Recovery': '85%',
      'Worst Day': '-$1,500',
      'Max Drawdown': '-12%',
      'Recovery Factor': '2.3'
    }
  },
  {
    name: 'Sharpe Ratio',
    value: '1.8',
    change: '+0.2',
    isPositive: true,
    icon: RiLineChartLine,
    description: 'Risk-adjusted return',
    details: {
      'Risk-free Rate': '4.5%',
      'Portfolio Return': '22%',
      'Volatility': '15%',
      'Information Ratio': '1.2',
      'Sortino Ratio': '2.1',
      'Beta': '0.85'
    }
  },
  {
    name: 'Max Drawdown',
    value: '-12%',
    change: '+3%',
    isPositive: true,
    icon: RiArrowDownLine,
    description: 'Peak to trough',
    details: {
      'Duration': '15 days',
      'Recovery Time': '28 days',
      'Peak Value': '$18,500',
      'Trough Value': '$16,280',
      'Recovery High': '$19,200',
      'Drawdown Frequency': '3/month'
    }
  },
  {
    name: 'Trading Volume',
    value: '$125K',
    change: '+15K',
    isPositive: true,
    icon: RiBarChartLine,
    description: 'Monthly volume',
    details: {
      'Average Position': '$2,500',
      'Largest Position': '$5,000',
      'Total Trades Value': '$125,000',
      'Average Daily Volume': '$4,167',
      'Volume Trend': 'Increasing',
      'Risk per Trade': '1.5%'
    }
  },
  {
    name: 'Time Analysis',
    value: '68%',
    change: '+8%',
    isPositive: true,
    icon: RiTimeLine,
    description: 'Time in market',
    details: {
      'Average Hold Time': '2.5 days',
      'Best Trading Hour': '10:00 AM',
      'Market Correlation': '0.65',
      'Time Efficiency': '72%',
      'Overnight Holds': '35%',
      'Weekend Exposure': '15%'
    }
  }
];

const recentTrades = [
  { symbol: 'AAPL', type: 'Long', result: 'Win', profit: '+$350', date: '2024-02-12', volume: '100', entry: '$180.50', exit: '$184.00' },
  { symbol: 'TSLA', type: 'Short', result: 'Loss', profit: '-$150', date: '2024-02-11', volume: '50', entry: '$193.25', exit: '$196.25' },
  { symbol: 'MSFT', type: 'Long', result: 'Win', profit: '+$275', date: '2024-02-10', volume: '75', entry: '$402.50', exit: '$406.15' },
  { symbol: 'AMZN', type: 'Long', result: 'Win', profit: '+$420', date: '2024-02-09', volume: '60', entry: '$168.75', exit: '$175.75' },
];

export const Dashboard = () => {
  const [selectedRange, setSelectedRange] = useState('1M');
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);
  const [hoveredTrade, setHoveredTrade] = useState<number | null>(null);
  const [selectedChartType, setSelectedChartType] = useState('line');
  const [showMetricDetails, setShowMetricDetails] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const renderChart = () => {
    switch (selectedChartType) {
      case 'bar':
        return <Bar data={performanceData} options={chartOptions} />;
      case 'distribution':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px', textAlign: 'center' }}>
                Win/Loss Distribution
              </h4>
              <Doughnut data={profitDistributionData} options={doughnutOptions} />
            </div>
            <div>
              <h4 style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '12px', textAlign: 'center' }}>
                Trade Types
              </h4>
              <Doughnut data={tradeTypeData} options={doughnutOptions} />
            </div>
          </div>
        );
      default:
        return <Line data={performanceData} options={chartOptions} />;
    }
  };

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
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>Trading Dashboard</h1>
          <p style={{ color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <RiCalendarCheckLine />
            <span>February 12, 2024</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={handleRefresh}
            style={{ 
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.2s ease',
              transform: isRefreshing ? 'rotate(180deg)' : 'rotate(0)',
            }}
          >
            <RiRefreshLine />
          </button>
          <button
            style={{ 
              padding: '10px',
              borderRadius: '8px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <RiDownload2Line />
          </button>
          <button style={{ 
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
            boxShadow: '0 2px 4px rgba(37, 99, 235, 0.1)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(37, 99, 235, 0.1)';
          }}>
            <RiTimeLine />
            New Trade
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '24px' 
      }}>
        {metrics.map((metric) => (
          <div
            key={metric.name}
            style={{
              backgroundColor: '#1e293b',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid rgba(255, 255, 255, 0.05)',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
              transform: hoveredMetric === metric.name ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: hoveredMetric === metric.name 
                ? '0 8px 16px rgba(0, 0, 0, 0.2)' 
                : '0 2px 4px rgba(0, 0, 0, 0.1)',
              position: 'relative',
            }}
            onClick={() => setShowMetricDetails(showMetricDetails === metric.name ? null : metric.name)}
            onMouseEnter={() => setHoveredMetric(metric.name)}
            onMouseLeave={() => setHoveredMetric(null)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                  <metric.icon style={{ 
                    width: '20px', 
                    height: '20px', 
                    color: hoveredMetric === metric.name ? '#2563eb' : '#64748b',
                    transition: 'color 0.2s ease'
                  }} />
                  <span style={{ color: '#94a3b8' }}>{metric.name}</span>
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
              </div>
              <span style={{ fontSize: '12px', color: '#64748b' }}>{metric.description}</span>
            </div>

            {/* Metric Details Popup */}
            {showMetricDetails === metric.name && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '0',
                right: '0',
                backgroundColor: '#1e293b',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '8px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
                zIndex: 10,
              }}>
                {Object.entries(metric.details).map(([key, value]) => (
                  <div 
                    key={key}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '8px 0',
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    }}
                  >
                    <span style={{ color: '#94a3b8' }}>{key}</span>
                    <span style={{ color: '#fff', fontWeight: 'bold' }}>{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: '2fr 1fr',
        gap: '16px',
        marginBottom: '24px'
      }}>
        {/* Balance Chart */}
        <div style={{ 
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <h3 style={{ fontSize: '16px', color: '#94a3b8' }}>Account Balance</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              {chartTypes.map((type) => (
                <button
                  key={type.id}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: selectedChartType === type.id ? '#2563eb' : 'transparent',
                    color: selectedChartType === type.id ? 'white' : '#94a3b8',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onClick={() => setSelectedChartType(type.id)}
                >
                  <type.icon />
                  <span style={{ fontSize: '14px' }}>{type.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginBottom: '16px',
            justifyContent: 'center' 
          }}>
            {timeRanges.map((range) => (
              <button
                key={range}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: selectedRange === range ? '#2563eb' : 'transparent',
                  color: selectedRange === range ? 'white' : '#94a3b8',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  fontSize: '14px',
                }}
                onClick={() => setSelectedRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          <div style={{ height: '300px' }}>
            {renderChart()}
          </div>
        </div>

        {/* Recent Trades */}
        <div style={{ 
          backgroundColor: '#1e293b',
          borderRadius: '12px',
          padding: '20px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: '16px' 
          }}>
            <h3 style={{ fontSize: '16px', color: '#94a3b8' }}>Recent Trades</h3>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button style={{
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}>
                <RiFilterLine />
              </button>
              <button style={{
                padding: '6px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: 'transparent',
                color: '#94a3b8',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                transition: 'all 0.2s ease',
              }}>
                <RiMoreLine />
              </button>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentTrades.map((trade, index) => (
              <div
                key={index}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px',
                  backgroundColor: hoveredTrade === index 
                    ? 'rgba(255, 255, 255, 0.05)' 
                    : 'rgba(255, 255, 255, 0.03)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: hoveredTrade === index ? 'translateX(4px)' : 'translateX(0)',
                }}
                onMouseEnter={() => setHoveredTrade(index)}
                onMouseLeave={() => setHoveredTrade(null)}
              >
                <div>
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{trade.symbol}</div>
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#94a3b8',
                    backgroundColor: trade.type === 'Long' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    {trade.type}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ 
                    color: trade.result === 'Win' ? '#22c55e' : '#ef4444',
                    marginBottom: '4px',
                    fontWeight: 'bold'
                  }}>
                    {trade.profit}
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>{trade.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 