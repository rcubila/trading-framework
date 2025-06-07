import React from 'react';
import styles from './Dashboard.module.css';

interface GoalProgressSectionProps {
  totalPnL: number;
  winRate: number;
  avgRiskReward: number;
  maxDrawdown: number;
  isLoading: boolean;
}

export const GoalProgressSection: React.FC<GoalProgressSectionProps> = ({
  totalPnL,
  winRate,
  avgRiskReward,
  maxDrawdown,
  isLoading
}) => {
  // Helper for progress bar width
  const getProgress = (current: number, goal: number) => Math.min(100, (current / goal) * 100);

  if (isLoading) {
    return (
      <div className={styles.goalProgressSection}>
        <h3 className={styles.sectionTitle}>Goal Progress</h3>
        <div className={styles.goalCardsGrid}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.goalCard}>
              <div className={styles.goalCardTitle}>Loading...</div>
              <div className={styles.goalCardValue}>Loading...</div>
              <div className={styles.goalProgressBarBg}>
                <div className={styles.goalProgressBarFill} style={{ width: '0%' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.goalProgressSection}>
      <h3 className={styles.sectionTitle}>Goal Progress</h3>
      <div className={styles.goalCardsGrid}>
        {/* P&L Goal */}
        <div className={styles.goalCard}>
          <div className={styles.goalCardTitle}>P&L Goal</div>
          <div className={styles.goalCardValue}>${totalPnL.toFixed(2)} / $10,000</div>
          <div className={styles.goalProgressBarBg}>
            <div
              className={styles.goalProgressBarFill}
              style={{ width: `${getProgress(totalPnL, 10000)}%` }}
            />
          </div>
        </div>
        {/* Win Rate Goal */}
        <div className={styles.goalCard}>
          <div className={styles.goalCardTitle}>Win Rate Goal</div>
          <div className={styles.goalCardValue}>{winRate.toFixed(1)}% / 60%</div>
          <div className={styles.goalProgressBarBg}>
            <div
              className={styles.goalProgressBarFill}
              style={{ width: `${getProgress(winRate, 60)}%` }}
            />
          </div>
        </div>
        {/* Risk-Reward Goal */}
        <div className={styles.goalCard}>
          <div className={styles.goalCardTitle}>Risk-Reward Goal</div>
          <div className={styles.goalCardValue}>{avgRiskReward.toFixed(2)}R / 2R</div>
          <div className={styles.goalProgressBarBg}>
            <div
              className={styles.goalProgressBarFill}
              style={{ width: `${getProgress(avgRiskReward, 2) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 