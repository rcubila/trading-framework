import React from 'react';
import styles from './Dashboard.module.css';

interface GoalProgressSectionProps {
  pnlGoal?: number;
  pnlCurrent?: number;
  winRateGoal?: number;
  winRateCurrent?: number;
  tradesGoal?: number;
  tradesCurrent?: number;
}

export const GoalProgressSection: React.FC<GoalProgressSectionProps> = ({
  pnlGoal = 10000,
  pnlCurrent = 3500,
  winRateGoal = 60,
  winRateCurrent = 52,
  tradesGoal = 100,
  tradesCurrent = 37
}) => {
  // Helper for progress bar width
  const getProgress = (current: number, goal: number) => Math.min(100, (current / goal) * 100);

  return (
    <div className={styles.goalProgressSection}>
      <h3 className={styles.sectionTitle}>Goal Progress</h3>
      <div className={styles.goalCardsGrid}>
        {/* P&L Goal */}
        <div className={styles.goalCard}>
          <div className={styles.goalCardTitle}>P&L Goal</div>
          <div className={styles.goalCardValue}>${pnlCurrent} / ${pnlGoal}</div>
          <div className={styles.goalProgressBarBg}>
            <div
              className={styles.goalProgressBarFill}
              style={{ width: `${getProgress(pnlCurrent, pnlGoal)}%` }}
            />
          </div>
        </div>
        {/* Win Rate Goal */}
        <div className={styles.goalCard}>
          <div className={styles.goalCardTitle}>Win Rate Goal</div>
          <div className={styles.goalCardValue}>{winRateCurrent}% / {winRateGoal}%</div>
          <div className={styles.goalProgressBarBg}>
            <div
              className={styles.goalProgressBarFill}
              style={{ width: `${getProgress(winRateCurrent, winRateGoal)}%` }}
            />
          </div>
        </div>
        {/* Number of Trades Goal */}
        <div className={styles.goalCard}>
          <div className={styles.goalCardTitle}>Trades Goal</div>
          <div className={styles.goalCardValue}>{tradesCurrent} / {tradesGoal}</div>
          <div className={styles.goalProgressBarBg}>
            <div
              className={styles.goalProgressBarFill}
              style={{ width: `${getProgress(tradesCurrent, tradesGoal)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}; 