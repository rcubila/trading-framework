import React, { useState, useEffect } from 'react';
import { format, startOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { TradingHabit, HabitVerification } from '../types/discipline';
import { useDiscipline } from '../context/DisciplineContext';
import { supabase } from '../lib/supabaseClient';
import toast from 'react-hot-toast';
import styles from './HabitTracker.module.css';

interface HabitTrackerProps {
  onHabitToggle: (habitId: string, date: string, completed: boolean) => void;
}

export const HabitTracker: React.FC<HabitTrackerProps> = ({ onHabitToggle }) => {
  const { habits, updateHabitStatus } = useDiscipline();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [verifications, setVerifications] = useState<HabitVerification[]>([]);
  const [loading, setLoading] = useState(true);

  // Get all days in the selected month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: new Date()
  });

  useEffect(() => {
    fetchVerifications();
  }, [selectedMonth]);

  const fetchVerifications = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please sign in to view habit verifications');
        return;
      }

      const { data, error } = await supabase
        .from('habit_verifications')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', format(startOfMonth(selectedMonth), 'yyyy-MM-dd'))
        .lte('date', format(new Date(), 'yyyy-MM-dd'));

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error fetching verifications:', error);
      toast.error('Failed to load habit verifications');
    } finally {
      setLoading(false);
    }
  };

  const handleHabitToggle = async (habitId: string, date: string, completed: boolean) => {
    try {
      await updateHabitStatus(habitId, date, completed);
      await fetchVerifications(); // Refresh verifications after update
    } catch (error) {
      console.error('Error updating habit status:', error);
      toast.error('Failed to update habit status');
    }
  };

  const isHabitCompleted = (habitId: string, date: string) => {
    return verifications.some(v => 
      v.habitId === habitId && 
      v.date === date && 
      v.completed
    );
  };

  const calculateCompletionRate = (habitId: string) => {
    const habitVerifications = verifications.filter(v => v.habitId === habitId);
    if (habitVerifications.length === 0) return 0;
    
    const completedCount = habitVerifications.filter(v => v.completed).length;
    return Math.round((completedCount / habitVerifications.length) * 100);
  };

  return (
    <div className="overflow-x-auto">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white">Daily Trading Habits</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => setSelectedMonth(new Date())}
            className="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Today
          </button>
          <span className="text-gray-300">
            {format(selectedMonth, 'MMMM yyyy')}
          </span>
        </div>
      </div>

      <table className="min-w-full bg-gray-800 rounded-lg overflow-hidden">
        <thead>
          <tr>
            <th className="px-4 py-3 text-left text-sm font-medium text-gray-300">Habit</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300 w-24">Progress</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300 w-20">Goal</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300 w-20">Done</th>
            <th className="px-4 py-3 text-center text-sm font-medium text-gray-300 w-20">Left</th>
            {daysInMonth.map(day => (
              <th 
                key={format(day, 'yyyy-MM-dd')} 
                className="px-2 py-3 text-center text-xs font-medium text-gray-300"
              >
                {format(day, 'd')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-700">
          {habits.map(habit => {
            const completionRate = calculateCompletionRate(habit.id);
            return (
              <tr key={habit.id} className="hover:bg-gray-700">
                <td className="px-4 py-3 text-sm text-gray-300">
                  <div className="flex items-center">
                    <span className="mr-2">{habit.icon}</span>
                    <div>
                      <div>{habit.name}</div>
                      <div className="text-xs text-gray-400">{habit.description}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-center">
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressBarFill}
                      style={{ width: `${completionRate}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{completionRate}%</span>
                </td>
                <td className="px-4 py-3 text-center text-sm text-gray-300">{habit.goal}</td>
                <td className="px-4 py-3 text-center text-sm text-green-400">{habit.done}</td>
                <td className="px-4 py-3 text-center text-sm text-red-400">{habit.remaining}</td>
                {daysInMonth.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isCompleted = isHabitCompleted(habit.id, dateStr);
                  return (
                    <td 
                      key={dateStr}
                      className="px-2 py-3 text-center"
                    >
                      <button
                        onClick={() => handleHabitToggle(habit.id, dateStr, !isCompleted)}
                        className={`w-6 h-6 rounded-full ${
                          isCompleted 
                            ? 'bg-green-500 hover:bg-green-600' 
                            : 'bg-gray-600 hover:bg-gray-500'
                        }`}
                      >
                        {isCompleted && (
                          <svg className="w-4 h-4 mx-auto text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-3">Habit Statistics</h3>
          <div className="space-y-2">
            {habits.map(habit => {
              const completionRate = calculateCompletionRate(habit.id);
              return (
                <div key={habit.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{habit.name}</span>
                  <span className={`text-sm ${
                    completionRate >= 70 ? 'text-green-400' :
                    completionRate >= 40 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {completionRate}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-3">Best Performing</h3>
          <div className="space-y-2">
            {habits
              .map(habit => ({
                habit,
                completionRate: calculateCompletionRate(habit.id)
              }))
              .sort((a, b) => b.completionRate - a.completionRate)
              .slice(0, 5)
              .map(({ habit, completionRate }) => (
                <div key={habit.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{habit.name}</span>
                  <span className="text-sm text-green-400">{completionRate}%</span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-gray-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-white mb-3">Needs Improvement</h3>
          <div className="space-y-2">
            {habits
              .map(habit => ({
                habit,
                completionRate: calculateCompletionRate(habit.id)
              }))
              .sort((a, b) => a.completionRate - b.completionRate)
              .slice(0, 5)
              .map(({ habit, completionRate }) => (
                <div key={habit.id} className="flex justify-between items-center">
                  <span className="text-sm text-gray-300">{habit.name}</span>
                  <span className="text-sm text-red-400">{completionRate}%</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 