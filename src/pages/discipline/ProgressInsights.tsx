import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RiBarChartLine,
  RiPieChartLine,
  RiFireLine,
  RiFilterLine,
  RiPushpinLine,
  RiSearchLine,
  RiCalendarLine,
  RiMedalLine,
} from 'react-icons/ri';
import type { DailyCheckInData } from './DailyLog';
import { Line, Bar } from 'react-chartjs-2';
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
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface ProgressInsightsProps {
  recentCheckIns: DailyCheckInData[];
  quickStats: {
    planAdherence: number;
    winRate: number;
    currentStreak: number;
    bestStreak: number;
    totalCheckIns: number;
  };
}

interface FilterOptions {
  dateRange: 'week' | 'month' | 'year' | 'all';
  emotionalStates: string[];
  profitRange: [number, number];
}

const containerAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemAnimation = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 }
  }
};

const statCardAnimation = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export const ProgressInsights: React.FC<ProgressInsightsProps> = ({ recentCheckIns, quickStats }) => {
  const [pinnedEntries, setPinnedEntries] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<FilterOptions>({
    dateRange: 'month',
    emotionalStates: [],
    profitRange: [-Infinity, Infinity]
  });

  const togglePinEntry = (date: string) => {
    setPinnedEntries(prev => 
      prev.includes(date) 
        ? prev.filter(d => d !== date)
        : [...prev, date]
    );
  };

  const chartData = {
    labels: recentCheckIns.map(entry => new Date(entry.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Plan Adherence %',
        data: recentCheckIns.map(entry => entry.planAdherencePercent),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Profit/Loss',
        data: recentCheckIns.map(entry => entry.profitLoss),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const emotionDistribution = recentCheckIns.reduce((acc, entry) => {
    entry.emotionalStates.forEach(state => {
      acc[state] = (acc[state] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <motion.div
      className="space-y-6"
      initial="hidden"
      animate="visible"
      variants={containerAnimation}
    >
      {/* Header with Stats */}
      <motion.div 
        className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
        variants={itemAnimation}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Progress & Insights</h2>
          <div className="flex items-center gap-4">
            <motion.div
              className="flex items-center gap-2 bg-indigo-600/20 px-3 py-1 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <RiFireLine className="text-indigo-400" />
              <span className="text-indigo-400 font-medium">
                {quickStats.currentStreak} Day Streak!
              </span>
            </motion.div>
            {quickStats.currentStreak === quickStats.bestStreak && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="flex items-center gap-2 bg-yellow-600/20 px-3 py-1 rounded-full"
              >
                <RiMedalLine className="text-yellow-400" />
                <span className="text-yellow-400 font-medium">New Record!</span>
              </motion.div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div 
            className="bg-gray-700/50 rounded-lg p-4"
            variants={statCardAnimation}
          >
            <div className="text-sm text-gray-400 mb-1">Plan Adherence</div>
            <div className="text-2xl font-bold text-indigo-400">{quickStats.planAdherence}%</div>
          </motion.div>
          <motion.div 
            className="bg-gray-700/50 rounded-lg p-4"
            variants={statCardAnimation}
          >
            <div className="text-sm text-gray-400 mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-green-400">{quickStats.winRate}%</div>
          </motion.div>
          <motion.div 
            className="bg-gray-700/50 rounded-lg p-4"
            variants={statCardAnimation}
          >
            <div className="text-sm text-gray-400 mb-1">Best Streak</div>
            <div className="text-2xl font-bold text-yellow-400">{quickStats.bestStreak} Days</div>
          </motion.div>
          <motion.div 
            className="bg-gray-700/50 rounded-lg p-4"
            variants={statCardAnimation}
          >
            <div className="text-sm text-gray-400 mb-1">Total Check-ins</div>
            <div className="text-2xl font-bold text-blue-400">{quickStats.totalCheckIns}</div>
          </motion.div>
        </div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div 
        className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
        variants={itemAnimation}
      >
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search in notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value as FilterOptions['dateRange'] })}
              className="bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
            <button
              onClick={() => {/* Open emotion filter modal */}}
              className="flex items-center gap-2 bg-gray-700 border border-gray-600 rounded-md px-4 py-2 text-white hover:bg-gray-600"
            >
              <RiFilterLine />
              Emotions
            </button>
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div 
        className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
        variants={itemAnimation}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Performance Trends</h3>
        <div className="h-[300px]">
          <Line
            data={chartData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                y: {
                  beginAtZero: true,
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
              },
              plugins: {
                legend: {
                  labels: {
                    color: 'rgba(255, 255, 255, 0.7)'
                  }
                }
              }
            }}
          />
        </div>
      </motion.div>

      {/* Recent Check-ins with Pinning */}
      <motion.div 
        className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg"
        variants={itemAnimation}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Recent Check-ins</h3>
        <motion.div className="space-y-4">
          <AnimatePresence>
            {[...recentCheckIns]
              .sort((a, b) => pinnedEntries.includes(a.date) ? -1 : 1)
              .map((checkin, index) => (
                <motion.div
                  key={checkin.date}
                  className="bg-gray-700/50 rounded-lg p-4 hover:bg-gray-700/70 transition-colors duration-200"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => togglePinEntry(checkin.date)}
                        className={`text-lg transition-colors duration-200 ${
                          pinnedEntries.includes(checkin.date)
                            ? 'text-yellow-400'
                            : 'text-gray-400 hover:text-gray-300'
                        }`}
                      >
                        <RiPushpinLine />
                      </button>
                      <span className="text-sm text-gray-300">
                        {new Date(checkin.date).toLocaleDateString()}
                      </span>
                    </div>
                    <span
                      className={`text-sm ${
                        checkin.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {checkin.profitLoss >= 0 ? '+' : ''}{checkin.profitLoss.toFixed(2)}
                      {checkin.isProfitLossPercentage ? '%' : ''}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        checkin.followedPlan
                          ? 'bg-green-900/30 text-green-400'
                          : 'bg-red-900/30 text-red-400'
                      }`}
                    >
                      {checkin.followedPlan ? 'Plan Followed' : 'Plan Deviated'}
                    </span>
                    <span className="text-gray-400">
                      {checkin.tradeCount} trades
                    </span>
                    <div className="flex gap-1">
                      {checkin.emotionalStates.map((state) => (
                        <span
                          key={state}
                          className="px-2 py-1 rounded-full bg-indigo-900/30 text-indigo-400 text-xs"
                        >
                          {state}
                        </span>
                      ))}
                    </div>
                  </div>
                  {checkin.notes && (
                    <p className="mt-2 text-sm text-gray-400">{checkin.notes}</p>
                  )}
                </motion.div>
              ))}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}; 