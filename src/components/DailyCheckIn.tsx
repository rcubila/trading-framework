import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DailyCheckInData } from '../pages/discipline/DailyLog';
import { DailyLog } from '../pages/discipline/DailyLog';
import { ProgressInsights } from '../pages/discipline/ProgressInsights';

// Mock data for recent check-ins
const mockRecentCheckIns: DailyCheckInData[] = [
  {
    date: '2024-03-20',
    followedPlan: true,
    tradeCount: 5,
    planAdherencePercent: 80,
    profitLoss: 350.25,
    emotionalStates: ['Calm'],
    isProfitLossPercentage: false,
    notes: ''
  },
  {
    date: '2024-03-19',
    followedPlan: true,
    tradeCount: 3,
    planAdherencePercent: 100,
    profitLoss: 125.50,
    emotionalStates: ['Focused'],
    isProfitLossPercentage: false,
    notes: ''
  },
  {
    date: '2024-03-18',
    followedPlan: false,
    tradeCount: 8,
    planAdherencePercent: 40,
    profitLoss: -275.75,
    emotionalStates: ['Overconfident'],
    isProfitLossPercentage: false,
    notes: ''
  }
];

// Mock quick stats
const mockQuickStats = {
  planAdherence: 73,
  winRate: 65,
  currentStreak: 2,
  bestStreak: 5,
  totalCheckIns: 3
};

const containerAnimation = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      when: "beforeChildren",
      staggerChildren: 0.2
    }
  }
};

const childAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 20,
      stiffness: 100
    }
  }
};

export const DailyCheckIn: React.FC = () => {
  const [checkIns, setCheckIns] = useState<DailyCheckInData[]>(mockRecentCheckIns);

  const handleSubmit = (data: DailyCheckInData) => {
    // In a real implementation, this would be a database call
    setCheckIns([data, ...checkIns]);
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-8"
      initial="hidden"
      animate="visible"
      variants={containerAnimation}
    >
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        variants={childAnimation}
      >
        <AnimatePresence mode="wait">
          <DailyLog onSubmit={handleSubmit} />
        </AnimatePresence>
        <AnimatePresence mode="wait">
          <ProgressInsights 
            recentCheckIns={checkIns} 
            quickStats={mockQuickStats}
          />
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}; 