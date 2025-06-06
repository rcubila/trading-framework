import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { PlusIcon, ChartBarIcon, ClipboardDocumentCheckIcon, BookOpenIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';
import {
  RiMedalLine,
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiCalendarLine,
  RiBarChartLine,
  RiFileTextLine,
  RiStarLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiInformationLine,
} from 'react-icons/ri';
import type { TradingRule, DisciplineEntry, DisciplineStats } from '../types/discipline';
import { supabase } from '../lib/supabaseClient';
import { AddRuleModal } from '../components/AddRuleModal/AddRuleModal';
import { AddEntryModal } from '../components/AddEntryModal/AddEntryModal';
import { AddGoalModal } from '../components/AddGoalModal/AddGoalModal';
import type { DailyEntry, Goal } from '../types/discipline';
import { useDiscipline } from '../context/DisciplineContext';
import { DailyLog } from './discipline/DailyLog';
import { ProgressInsights } from './discipline/ProgressInsights';
import type { DailyCheckInData } from './discipline/DailyLog';
import { PageHeader } from '../components/PageHeader/PageHeader';
import styles from '../components/DisciplineTracker/DisciplineTracker.module.css';

const ruleCategories = [
  'Entry',
  'Exit',
  'Risk Management',
  'Psychology',
  'Process'
] as const;

const importanceLevels = [
  'Critical',
  'Important',
  'Good Practice'
] as const;

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export const DisciplineTracker: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'tracker' | 'stats'>('rules');
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [stats, setStats] = useState<DisciplineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddRule, setShowAddRule] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [showAddGoal, setShowAddGoal] = useState(false);
  const [categories] = useState({
    'Daily Entries': [],
    'Goals': [],
    'Statistics': [],
  });
  const [goals, setGoals] = useState<Goal[]>([]);
  const { entries: disciplineEntries, goals: disciplineGoals, stats: disciplineStats, addEntry, addGoal } = useDiscipline();

  // Add new state for daily check-in data
  const [dailyCheckIns, setDailyCheckIns] = useState<DailyCheckInData[]>([]);
  const [quickStats, setQuickStats] = useState({
    planAdherence: 0,
    winRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalCheckIns: 0
  });

  useEffect(() => {
    fetchRules();
    fetchEntries();
  }, []);

  const fetchRules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trading_rules')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('discipline_tracker')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entries: DailyEntry[]): void => {
    if (!entries.length) {
      setStats(null);
      return;
    }

    const totalRating = entries.reduce((sum, entry) => sum + entry.rating, 0);
    const averageRating = totalRating / entries.length;

    const ruleBreakCount: Record<string, number> = {};
    const ruleFollowCount: Record<string, number> = {};

    entries.forEach(entry => {
      entry.rulesBroken.forEach((rule: string) => {
        ruleBreakCount[rule] = (ruleBreakCount[rule] || 0) + 1;
      });
      entry.rulesFollowed.forEach((rule: string) => {
        ruleFollowCount[rule] = (ruleFollowCount[rule] || 0) + 1;
      });
    });

    // Calculate weekly trend
    const weeklyTrend = calculateWeeklyTrend(entries);

    // Calculate compliance rate
    const totalRules = entries.reduce(
      (sum, entry) => sum + entry.rulesFollowed.length + entry.rulesBroken.length,
      0
    );
    const totalFollowed = entries.reduce(
      (sum, entry) => sum + entry.rulesFollowed.length,
      0
    );
    const complianceRate = (totalFollowed / totalRules) * 100;

    // Calculate mood distribution
    const moodDistribution = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    setStats({
      averageRating,
      totalEntries: entries.length,
      mostBrokenRules: Object.entries(ruleBreakCount)
        .map(([rule, count]) => ({ rule, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      mostFollowedRules: Object.entries(ruleFollowCount)
        .map(([rule, count]) => ({ rule, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      weeklyTrend,
      complianceRate,
      moodDistribution
    });
  };

  const calculateWeeklyTrend = (entries: DailyEntry[]) => {
    const weeklyData: Record<string, { sum: number; count: number }> = {};

    entries.forEach(entry => {
      const date = new Date(entry.date);
      const week = getWeekNumber(date);
      if (!weeklyData[week]) {
        weeklyData[week] = { sum: 0, count: 0 };
      }
      weeklyData[week].sum += entry.rating;
      weeklyData[week].count += 1;
    });

    return Object.entries(weeklyData)
      .map(([week, data]) => ({
        week,
        averageRating: data.sum / data.count
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Last 8 weeks
  };

  const getWeekNumber = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const weekNum = Math.ceil(date.getDate() / 7);
    return `${year}-${month + 1}-W${weekNum}`;
  };

  const handleSaveEntry = (entry: Omit<DailyEntry, 'id'>) => {
    const newEntry: DailyEntry = {
      ...entry,
      id: Date.now().toString()
    };
    setEntries([newEntry, ...entries]);
  };

  const handleSaveGoal = (goal: Omit<Goal, 'id' | 'progress'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      progress: 0
    };
    setGoals([newGoal, ...goals]);
  };

  // Add handler for daily check-in submissions
  const handleDailyCheckIn = (data: DailyCheckInData) => {
    setDailyCheckIns([data, ...dailyCheckIns]);
    
    // Update quick stats
    const totalEntries = dailyCheckIns.length + 1;
    const followedPlanCount = dailyCheckIns.filter(entry => entry.followedPlan).length + (data.followedPlan ? 1 : 0);
    const profitableCount = dailyCheckIns.filter(entry => entry.profitLoss > 0).length + (data.profitLoss > 0 ? 1 : 0);

    setQuickStats({
      planAdherence: Math.round((followedPlanCount / totalEntries) * 100),
      winRate: Math.round((profitableCount / totalEntries) * 100),
      currentStreak: 0,
      bestStreak: 0,
      totalCheckIns: totalEntries
    });
  };

  useEffect(() => {
    if (dailyCheckIns.length > 0) {
      // Calculate plan adherence
      const adherenceSum = dailyCheckIns.reduce((sum, checkin) => sum + checkin.planAdherencePercent, 0);
      const avgAdherence = Math.round(adherenceSum / dailyCheckIns.length);

      // Calculate win rate (based on positive P&L)
      const wins = dailyCheckIns.filter(checkin => checkin.profitLoss > 0).length;
      const winRate = Math.round((wins / dailyCheckIns.length) * 100);

      // Calculate streaks
      let currentStreak = 0;
      let bestStreak = 0;
      let tempStreak = 0;

      for (let i = 0; i < dailyCheckIns.length; i++) {
        if (dailyCheckIns[i].followedPlan) {
          tempStreak++;
          if (tempStreak > bestStreak) {
            bestStreak = tempStreak;
          }
        } else {
          tempStreak = 0;
        }
      }
      currentStreak = tempStreak;

      setQuickStats({
        planAdherence: avgAdherence,
        winRate,
        currentStreak,
        bestStreak,
        totalCheckIns: dailyCheckIns.length
      });
    }
  }, [dailyCheckIns]);

  return (
    <div className={styles.container}>
      <PageHeader 
        title="Discipline Tracker"
        subtitle="Track your trading discipline and progress"
        actions={
          <div className={styles.headerActions}>
            <button
              onClick={() => setShowAddRule(true)}
              className={styles.actionButton}
            >
              <RiAddLine />
              New Rule
            </button>
            <button
              onClick={() => setShowAddEntry(true)}
              className={styles.actionButton}
            >
              <RiAddLine />
              New Entry
            </button>
          </div>
        }
      />

      <div className={styles.mainContent}>
        <div className={styles.header}>
          <h1 className={styles.headerTitle}>Trading Discipline Tracker</h1>
          <div className={styles.headerActions}>
            <button
              type="button"
              onClick={() => setShowAddGoal(true)}
              className={styles.actionButton}
            >
              <PlusIcon className={styles.tabIcon} aria-hidden="true" />
              New Goal
            </button>
          </div>
        </div>

        <Tab.Group>
          <Tab.List className={styles.tabList}>
            <Tab
              className={({ selected }) =>
                classNames(
                  styles.tab,
                  selected ? styles.tabSelected : ''
                )
              }
            >
              <div className={styles.tabContent}>
                <CalendarIcon className={styles.tabIcon} />
                Daily Log
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  styles.tab,
                  selected ? styles.tabSelected : ''
                )
              }
            >
              <div className={styles.tabContent}>
                <ChartBarIcon className={styles.tabIcon} />
                History & Trends
              </div>
            </Tab>
          </Tab.List>
          <Tab.Panels className={styles.tabPanels}>
            <Tab.Panel className={styles.tabPanel}>
              <DailyLog onSubmit={handleDailyCheckIn} />
            </Tab.Panel>
            <Tab.Panel className={styles.tabPanel}>
              <ProgressInsights 
                recentCheckIns={dailyCheckIns}
                quickStats={quickStats}
              />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      <AddEntryModal
        isOpen={showAddEntry}
        onClose={() => setShowAddEntry(false)}
        onSave={addEntry}
      />

      <AddGoalModal
        isOpen={showAddGoal}
        onClose={() => setShowAddGoal(false)}
        onSave={addGoal}
      />
    </div>
  );
}; 