import React, { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { DailyEntry, Goal, DisciplineStats } from '../types/discipline';

interface DisciplineContextType {
  entries: DailyEntry[];
  goals: Goal[];
  stats: DisciplineStats | null;
  addEntry: (entry: Omit<DailyEntry, 'id'>) => void;
  addGoal: (goal: Omit<Goal, 'id' | 'progress'>) => void;
  updateGoalProgress: (goalId: string, progress: number) => void;
  updateGoalMetrics: (goalId: string, metrics: { key: string; value: number; target: number }[]) => void;
}

const DisciplineContext = createContext<DisciplineContextType | undefined>(undefined);

interface DisciplineProviderProps {
  children: ReactNode;
}

export const DisciplineProvider = ({ children }: DisciplineProviderProps) => {
  const [entries, setEntries] = useState<DailyEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [stats, setStats] = useState<DisciplineStats | null>(null);

  const calculateStats = (entries: DailyEntry[]) => {
    if (entries.length === 0) {
      setStats(null);
      return;
    }

    const totalRating = entries.reduce((sum, entry) => sum + entry.rating, 0);
    const averageRating = totalRating / entries.length;

    const allRulesFollowed = entries.flatMap(entry => entry.rulesFollowed);
    const allRulesBroken = entries.flatMap(entry => entry.rulesBroken);

    const mostFollowedRules = Object.entries(
      allRulesFollowed.reduce((acc, rule) => {
        acc[rule] = (acc[rule] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([rule, count]) => ({ rule, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const mostBrokenRules = Object.entries(
      allRulesBroken.reduce((acc, rule) => {
        acc[rule] = (acc[rule] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([rule, count]) => ({ rule, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const moodDistribution = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const weeklyTrend = entries
      .reduce((acc, entry) => {
        const week = getWeekNumber(new Date(entry.date));
        if (!acc[week]) {
          acc[week] = { sum: 0, count: 0 };
        }
        acc[week].sum += entry.rating;
        acc[week].count += 1;
        return acc;
      }, {} as Record<string, { sum: number; count: number }>);

    const weeklyTrendArray = Object.entries(weeklyTrend)
      .map(([week, { sum, count }]) => ({
        week,
        averageRating: sum / count
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8);

    const totalRulesFollowed = allRulesFollowed.length;
    const totalRulesBroken = allRulesBroken.length;
    const complianceRate = (totalRulesFollowed / (totalRulesFollowed + totalRulesBroken)) * 100;

    setStats({
      averageRating,
      totalEntries: entries.length,
      mostFollowedRules,
      mostBrokenRules,
      weeklyTrend: weeklyTrendArray,
      complianceRate,
      moodDistribution
    });
  };

  const getWeekNumber = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const weekNum = Math.ceil((date.getDate() + 6 - date.getDay()) / 7);
    return `${year}-${month + 1}-W${weekNum}`;
  };

  const addEntry = (entry: Omit<DailyEntry, 'id'>) => {
    const newEntry: DailyEntry = {
      ...entry,
      id: Date.now().toString()
    };
    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);
    calculateStats(updatedEntries);
  };

  const addGoal = (goal: Omit<Goal, 'id' | 'progress'>) => {
    const newGoal: Goal = {
      ...goal,
      id: Date.now().toString(),
      progress: 0
    };
    setGoals([newGoal, ...goals]);
  };

  const updateGoalProgress = (goalId: string, progress: number) => {
    setGoals(goals.map(goal =>
      goal.id === goalId ? { ...goal, progress } : goal
    ));
  };

  const updateGoalMetrics = (goalId: string, metrics: { key: string; value: number; target: number }[]) => {
    setGoals(goals.map(goal =>
      goal.id === goalId ? { ...goal, metrics } : goal
    ));
  };

  const value = {
    entries,
    goals,
    stats,
    addEntry,
    addGoal,
    updateGoalProgress,
    updateGoalMetrics
  };

  return (
    <DisciplineContext.Provider value={value}>
      {children}
    </DisciplineContext.Provider>
  );
};

export const useDiscipline = () => {
  const context = useContext(DisciplineContext);
  if (context === undefined) {
    throw new Error('useDiscipline must be used within a DisciplineProvider');
  }
  return context;
}; 