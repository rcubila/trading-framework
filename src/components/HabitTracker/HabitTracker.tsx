import React, { useState, useEffect } from 'react';
import { format, startOfMonth, eachDayOfInterval, isSameDay } from 'date-fns';
import { TradingHabit, HabitVerification } from '../../types/discipline';
import { useDiscipline } from '../../context/DisciplineContext';
import { supabase } from '../../lib/supabase';
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
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Daily Trading Habits</h2>
        <div className={styles.headerControls}>
          <button
            onClick={() => setSelectedMonth(new Date())}
            className={styles.todayButton}
          >
            Today
          </button>
          <span className={styles.monthText}>
            {format(selectedMonth, 'MMMM yyyy')}
          </span>
        </div>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.tableHeader}>Habit</th>
            <th className={`${styles.tableHeader} ${styles.tableHeaderCenter}`}>Progress</th>
            <th className={`${styles.tableHeader} ${styles.tableHeaderCenter}`}>Goal</th>
            <th className={`${styles.tableHeader} ${styles.tableHeaderCenter}`}>Done</th>
            <th className={`${styles.tableHeader} ${styles.tableHeaderCenter}`}>Left</th>
            {daysInMonth.map(day => (
              <th 
                key={format(day, 'yyyy-MM-dd')} 
                className={`${styles.tableHeader} ${styles.tableHeaderCenter}`}
              >
                {format(day, 'd')}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {habits.map(habit => {
            const completionRate = calculateCompletionRate(habit.id);
            return (
              <tr key={habit.id} className={styles.tableRow}>
                <td className={styles.tableCell}>
                  <div className={styles.habitInfo}>
                    <span className={styles.habitIcon}>{habit.icon}</span>
                    <div>
                      <div className={styles.habitName}>{habit.name}</div>
                      <div className={styles.habitDescription}>{habit.description}</div>
                    </div>
                  </div>
                </td>
                <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressBarFill}
                      style={{ '--completion-rate': `${completionRate}%` } as React.CSSProperties}
                    />
                  </div>
                  <span className={styles.progressText}>{completionRate}%</span>
                </td>
                <td className={`${styles.tableCell} ${styles.tableCellCenter}`}>{habit.goal}</td>
                <td className={`${styles.tableCell} ${styles.tableCellCenter} ${styles.completedCount}`}>{habit.done}</td>
                <td className={`${styles.tableCell} ${styles.tableCellCenter} ${styles.remainingCount}`}>{habit.remaining}</td>
                {daysInMonth.map(day => {
                  const dateStr = format(day, 'yyyy-MM-dd');
                  const isCompleted = isHabitCompleted(habit.id, dateStr);
                  return (
                    <td 
                      key={dateStr}
                      className={`${styles.tableCell} ${styles.tableCellCenter}`}
                    >
                      <button
                        onClick={() => handleHabitToggle(habit.id, dateStr, !isCompleted)}
                        className={`${styles.checkboxButton} ${
                          isCompleted 
                            ? styles.checkboxButtonCompleted 
                            : styles.checkboxButtonIncomplete
                        }`}
                      >
                        {isCompleted && (
                          <svg className={styles.checkboxIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

      <div className={styles.statsGrid}>
        <div className={styles.statsCard}>
          <h3 className={styles.statsTitle}>Habit Statistics</h3>
          <div className={styles.statsList}>
            {habits.map(habit => {
              const completionRate = calculateCompletionRate(habit.id);
              return (
                <div key={habit.id} className={styles.statsItem}>
                  <span className={styles.statsLabel}>{habit.name}</span>
                  <span className={`${styles.statsValue} ${
                    completionRate >= 70 ? styles.statsValueHigh :
                    completionRate >= 40 ? styles.statsValueMedium :
                    styles.statsValueLow
                  }`}>
                    {completionRate}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className={styles.statsCard}>
          <h3 className={styles.statsTitle}>Best Performing</h3>
          <div className={styles.statsList}>
            {habits
              .map(habit => ({
                habit,
                completionRate: calculateCompletionRate(habit.id)
              }))
              .sort((a, b) => b.completionRate - a.completionRate)
              .slice(0, 5)
              .map(({ habit, completionRate }) => (
                <div key={habit.id} className={styles.statsItem}>
                  <span className={styles.statsLabel}>{habit.name}</span>
                  <span className={`${styles.statsValue} ${styles.statsValueHigh}`}>{completionRate}%</span>
                </div>
              ))}
          </div>
        </div>

        <div className={styles.statsCard}>
          <h3 className={styles.statsTitle}>Needs Improvement</h3>
          <div className={styles.statsList}>
            {habits
              .map(habit => ({
                habit,
                completionRate: calculateCompletionRate(habit.id)
              }))
              .sort((a, b) => a.completionRate - b.completionRate)
              .slice(0, 5)
              .map(({ habit, completionRate }) => (
                <div key={habit.id} className={styles.statsItem}>
                  <span className={styles.statsLabel}>{habit.name}</span>
                  <span className={`${styles.statsValue} ${styles.statsValueLow}`}>{completionRate}%</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}; 