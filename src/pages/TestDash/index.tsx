// Add this at the top of your project or in a types file if you see TS errors for react-date-range:
// declare module 'react-date-range';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  BarChart2, 
  LineChart, 
  PieChart, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  Calendar,
  DollarSign,
  Percent,
  Settings,
  ChevronDown,
  Table,
  Activity,
  Target,
  Shield,
  Zap,
  Plus,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { Line, Bar, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';
import Select from 'react-select';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

// Remove or stub Trade type if not used
// interface Trade { /* stubbed for now */ }

const styles = {
  dashboardContainer: 'min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6',
  header: 'flex justify-between items-center mb-8',
  title: 'text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500',
  date: 'text-slate-400',
  metricsGrid: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8',
  metricCard: 'backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105',
  metricHeader: 'flex items-center gap-3 text-slate-300 mb-3',
  metricValue: 'text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300',
  metricTrend: 'text-sm text-green-400 flex items-center gap-1 ml-2',
  metricLabel: 'text-sm text-slate-400 ml-1',
  chartsSection: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8',
  chartContainer: 'backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl',
  recentTrades: 'backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl mb-8',
  tradesList: 'space-y-3',
  tradeItem: 'backdrop-blur-lg bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300',
  tradeHeader: 'flex justify-between items-center mb-2',
  symbol: 'font-medium text-lg',
  pnl: 'text-green-400 font-semibold',
  tradeStats: 'flex gap-4 text-sm text-slate-400',
  strategyBreakdown: 'backdrop-blur-lg bg-white/10 rounded-2xl p-6 border border-white/20 shadow-xl',
  strategyGrid: 'grid grid-cols-1 md:grid-cols-3 gap-6',
  strategyCard: 'backdrop-blur-lg bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-300',
  strategyHeader: 'flex justify-between items-center mb-3',
  winRate: 'text-green-400 text-sm font-semibold',
  strategyStats: 'flex flex-col gap-2 text-sm text-slate-400',
  actionButton: 'px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 flex items-center gap-2',
  searchBar: 'w-full max-w-md px-4 py-2 rounded-lg bg-white/5 border border-white/20 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500',
  filterButton: 'px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300 flex items-center gap-2',
  badge: 'px-2 py-1 rounded-full text-xs font-medium',
  badgeSuccess: 'bg-green-500/20 text-green-400',
  badgeWarning: 'bg-yellow-500/20 text-yellow-400',
  badgeDanger: 'bg-red-500/20 text-red-400'
};

interface Account {
  id: string;
  name: string;
}

const accounts: Account[] = [
  { id: '1', name: 'Main Trading Account' },
  { id: '2', name: 'Paper Trading Account' },
  { id: '3', name: 'Futures Account' }
];

const defaultAccount = accounts[0];

const TestDash = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  const handleAccountChange = (selected: any) => {
    console.log('Account changed:', selected);
  };

  return (
    <motion.div 
      className={styles.dashboardContainer}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header Section */}
      <motion.div className={styles.header} variants={itemVariants}>
        <div>
          <h1 className={styles.title}>Trading Dashboard</h1>
          <p className={styles.date}>Last updated: {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-4">
          <button className={styles.actionButton}>
            <Plus size={20} />
            New Trade
          </button>
          <button className={styles.filterButton}>
            <Filter size={20} />
            Filter
          </button>
        </div>
      </motion.div>

      {/* Account Selector */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex gap-4 items-center">
          <Select
            value={defaultAccount}
            options={accounts}
            onChange={handleAccountChange}
            className="min-w-[200px]"
            classNames={{
              control: () => "bg-slate-800 border-slate-700 hover:border-slate-600",
              menu: () => "bg-slate-800 border border-slate-700",
              option: () => "hover:bg-slate-700 text-white",
              singleValue: () => "text-white",
              input: () => "text-white",
              placeholder: () => "text-slate-400"
            }}
            getOptionLabel={(option) => option.name}
            getOptionValue={(option) => option.id}
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-300">
          <Settings size={20} />
          Edit Widgets
        </button>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <motion.div className={styles.metricCard} variants={itemVariants}>
          <div className="mb-2">
            <DollarSign className="text-green-500" size={24} />
          </div>
          <div className="flex flex-col items-start">
            <span className={styles.metricValue}>$12,450</span>
            <span className={styles.metricLabel}>Net P&L</span>
          </div>
        </motion.div>

        <motion.div className={styles.metricCard} variants={itemVariants}>
          <div className="mb-2">
            <Target className="text-blue-500" size={24} />
          </div>
          <div className="flex flex-col items-start">
            <span className={styles.metricValue}>68.5%</span>
            <span className={styles.metricLabel}>Trade Win %</span>
          </div>
        </motion.div>

        <motion.div className={styles.metricCard} variants={itemVariants}>
          <div className="mb-2">
            <TrendingUp className="text-purple-500" size={24} />
          </div>
          <div className="flex flex-col items-start">
            <span className={styles.metricValue}>2.4</span>
            <span className={styles.metricLabel}>Profit Factor</span>
          </div>
        </motion.div>

        <motion.div className={styles.metricCard} variants={itemVariants}>
          <div className="mb-2">
            <Calendar className="text-indigo-500" size={24} />
          </div>
          <div className="flex flex-col items-start">
            <span className={styles.metricValue}>72%</span>
            <span className={styles.metricLabel}>Day Win %</span>
          </div>
        </motion.div>

        <motion.div className={styles.metricCard} variants={itemVariants}>
          <div className="mb-2">
            <BarChart2 className="text-orange-500" size={24} />
          </div>
          <div className="flex flex-col items-start">
            <span className={styles.metricValue}>1.8</span>
            <span className={styles.metricLabel}>Avg Win/Loss</span>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" variants={itemVariants}>
        <div className={styles.chartContainer}>
          <h3 className="text-xl font-semibold mb-4">Performance Overview</h3>
          <div className="h-[300px]">
            <Line
              id="performance-overview"
              data={{
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                  label: 'P&L',
                  data: [12000, 19000, 15000, 25000, 22000, 24500],
                  borderColor: 'rgb(99, 102, 241)',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  fill: true,
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className={styles.chartContainer}>
          <h3 className="text-xl font-semibold mb-4">Strategy Distribution</h3>
          <div className="h-[300px]">
            <Bar
              id="strategy-distribution"
              data={{
                labels: ['Swing', 'Day', 'Scalp', 'Position'],
                datasets: [{
                  label: 'Trades',
                  data: [45, 30, 15, 10],
                  backgroundColor: [
                    'rgba(99, 102, 241, 0.8)',
                    'rgba(139, 92, 246, 0.8)',
                    'rgba(236, 72, 153, 0.8)',
                    'rgba(59, 130, 246, 0.8)'
                  ]
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    display: false
                  }
                },
                scales: {
                  y: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Performance Metrics */}
      <motion.div className={styles.chartContainer} variants={itemVariants}>
        <h3 className="text-xl font-semibold mb-6">Performance Metrics</h3>
        <div className="flex flex-col items-center">
          <div className="w-full h-[300px] mb-6">
            <Radar
              id="performance-radar"
              data={{
                labels: ['Win Rate', 'Profit Factor', 'Avg Win/Loss', 'Trade Frequency', 'Risk Management'],
                datasets: [{
                  label: 'Your Performance',
                  data: [85, 75, 90, 70, 80],
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  borderColor: 'rgba(99, 102, 241, 1)',
                  pointBackgroundColor: 'rgba(99, 102, 241, 1)',
                  pointBorderColor: '#fff',
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  r: {
                    angleLines: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)',
                      backdropColor: 'transparent'
                    }
                  }
                }
              }}
            />
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-500">
              Zella Score: 92.5
            </div>
            <div className="text-slate-400 mt-2">Excellent Performance</div>
          </div>
        </div>
      </motion.div>

      {/* Daily P&L Charts */}
      <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8" variants={itemVariants}>
        <div className={styles.chartContainer}>
          <h3 className="text-xl font-semibold mb-6">Cumulative P&L</h3>
          <div className="h-[300px]">
            <Line
              id="cumulative-pnl"
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon', 'Tue'],
                datasets: [{
                  label: 'Net P&L',
                  data: [0, 2500, 3800, 5200, 4800, 6500, 8200],
                  fill: true,
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  borderColor: 'rgba(99, 102, 241, 1)',
                  tension: 0.4
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }
                },
                scales: {
                  y: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>

        <div className={styles.chartContainer}>
          <h3 className="text-xl font-semibold mb-6">Daily P&L</h3>
          <div className="h-[300px]">
            <Bar
              id="daily-pnl"
              data={{
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Mon', 'Tue'],
                datasets: [{
                  label: 'Daily P&L',
                  data: [2500, 1300, 1400, -800, -400, 1700, 1800],
                  backgroundColor: (context) => {
                    const value = context.raw as number;
                    return value >= 0 ? 'rgba(34, 197, 94, 0.6)' : 'rgba(239, 68, 68, 0.6)';
                  },
                  borderColor: (context) => {
                    const value = context.raw as number;
                    return value >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
                  },
                  borderWidth: 1
                }]
              }}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: {
                    labels: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }
                },
                scales: {
                  y: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  },
                  x: {
                    grid: {
                      color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                      color: 'rgba(255, 255, 255, 0.7)'
                    }
                  }
                }
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Trading Calendar */}
      <motion.div className={styles.chartContainer} variants={itemVariants}>
        <h3 className="text-xl font-semibold mb-6">Trading Calendar</h3>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 31 }, (_, i) => (
            <div 
              key={i}
              className={`
                p-3 rounded-lg backdrop-blur-lg border border-white/10
                ${i % 2 === 0 ? 'bg-green-500/10' : 'bg-red-500/10'}
              `}
            >
              <div className="text-sm font-medium">{i + 1}</div>
              <div className={`text-lg font-bold ${i % 2 === 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${((Math.random() * 2000) - 1000).toFixed(0)}
              </div>
              <div className="text-xs text-slate-400">{Math.floor(Math.random() * 10)} trades</div>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TestDash; 