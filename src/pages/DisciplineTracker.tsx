import React, { useState, useEffect } from 'react';
import { Tab } from '@headlessui/react';
import { PlusIcon, ChartBarIcon, ClipboardDocumentCheckIcon, BookOpenIcon } from '@heroicons/react/24/outline';
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
import { AddRuleModal } from '../components/AddRuleModal';
import { AddEntryModal } from '../components/AddEntryModal';
import { AddGoalModal } from '../components/AddGoalModal';
import type { DailyEntry, Goal } from '../types/discipline';
import { useDiscipline } from '../context/DisciplineContext';

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

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Trading Discipline Tracker</h1>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setShowAddGoal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Goal
            </button>
            <button
              type="button"
              onClick={() => setShowAddEntry(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Entry
            </button>
          </div>
        </div>

        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-indigo-900/20 p-1">
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white/60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-300 hover:bg-indigo-800/[0.12] hover:text-white'
                )
              }
            >
              <div className="flex items-center justify-center">
                <BookOpenIcon className="h-5 w-5 mr-2" />
                Daily Entries
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white/60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-300 hover:bg-indigo-800/[0.12] hover:text-white'
                )
              }
            >
              <div className="flex items-center justify-center">
                <ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" />
                Goals
              </div>
            </Tab>
            <Tab
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white/60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-300 hover:bg-indigo-800/[0.12] hover:text-white'
                )
              }
            >
              <div className="flex items-center justify-center">
                <ChartBarIcon className="h-5 w-5 mr-2" />
                Statistics
              </div>
            </Tab>
          </Tab.List>
          <Tab.Panels className="mt-4">
            <Tab.Panel className="rounded-xl bg-gray-800 p-4">
              {entries.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No entries yet. Click "New Entry" to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-gray-700 rounded-lg p-4 shadow-sm hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="text-sm text-gray-300">
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div className="text-sm text-indigo-400 mt-1">{entry.mood}</div>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-300 mr-2">Rating:</span>
                          <span className="text-lg font-semibold text-indigo-400">{entry.rating}/5</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Rules Followed</h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.rulesFollowed.map((rule: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-900/30 text-green-400"
                              >
                                {rule}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Rules Broken</h4>
                          <div className="flex flex-wrap gap-2">
                            {entry.rulesBroken.map((rule: string, index: number) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-900/30 text-red-400"
                              >
                                {rule}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {entry.learnings && (
                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Key Learnings</h4>
                          <p className="text-sm text-gray-300">{entry.learnings}</p>
                        </div>
                      )}

                      {entry.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-300 mb-2">Additional Notes</h4>
                          <p className="text-sm text-gray-300">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Tab.Panel>
            <Tab.Panel className="rounded-xl bg-gray-800 p-4">
              {goals.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">No goals set. Start by setting your trading goals.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {goals.map((goal) => (
                    <div
                      key={goal.id}
                      className="bg-gray-700 rounded-lg p-4 shadow-sm hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-medium text-white">{goal.title}</h3>
                        <span
                          className={classNames(
                            'px-2 py-1 text-xs font-medium rounded-full',
                            goal.status === 'completed'
                              ? 'bg-green-900/30 text-green-400'
                              : goal.status === 'in_progress'
                              ? 'bg-yellow-900/30 text-yellow-400'
                              : 'bg-gray-900/30 text-gray-400'
                          )}
                        >
                          {goal.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300 mb-4">{goal.description}</p>
                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-300 mb-1">
                          <span>Progress</span>
                          <span>{goal.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full"
                            style={{ width: `${goal.progress}%` }}
                          />
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-300 mb-2">Metrics</h4>
                        <div className="space-y-2">
                          {goal.metrics.map((metric, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span className="text-sm text-gray-300">{metric.key}</span>
                              <span className="text-sm text-gray-300">
                                {metric.value} / {metric.target}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 text-sm text-gray-400">
                        Target Date: {new Date(goal.targetDate).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Tab.Panel>
            <Tab.Panel className="rounded-xl bg-gray-800 p-4">
              {!stats ? (
                <div className="text-center py-8">
                  <p className="text-gray-400">Statistics will appear once you have some entries.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Overview</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="text-sm text-gray-300">Average Rating</div>
                        <div className="text-2xl font-semibold text-indigo-400">
                          {stats.averageRating.toFixed(1)}/5
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-300">Compliance Rate</div>
                        <div className="text-2xl font-semibold text-green-400">
                          {stats.complianceRate.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-300">Total Entries</div>
                        <div className="text-2xl font-semibold text-indigo-400">
                          {stats.totalEntries}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Most Followed Rules</h3>
                    <div className="space-y-2">
                      {stats.mostFollowedRules.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-300">{item.rule}</span>
                          <span className="text-green-400">{item.count} times</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Most Broken Rules</h3>
                    <div className="space-y-2">
                      {stats.mostBrokenRules.map((item, index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-300">{item.rule}</span>
                          <span className="text-red-400">{item.count} times</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-gray-700 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-white mb-4">Mood Distribution</h3>
                    <div className="space-y-2">
                      {Object.entries(stats.moodDistribution).map(([mood, count], index) => (
                        <div
                          key={index}
                          className="flex justify-between items-center text-sm"
                        >
                          <span className="text-gray-300">{mood}</span>
                          <span className="text-indigo-400">{count} times</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
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