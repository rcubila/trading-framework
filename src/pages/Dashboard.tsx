import React from 'react';
import styles from './Dashboard.module.css';

// Dummy data for demonstration
const goalProgress = 0.68; // 68% to goal

function GoalProgressCard() {
  return (
    <div className={styles.goalProgressCard}>
      <span className={styles.goalProgressLabel}>Goal Progress</span>
      <div className={styles.goalProgressBar}>
        <div
          className={styles.goalProgressFill}
          style={{ width: `${goalProgress * 100}%` }}
        />
      </div>
      <span style={{ marginLeft: 24, fontWeight: 600 }}>{Math.round(goalProgress * 100)}%</span>
    </div>
  );
}

function TradeBreakdownCard() {
  return (
    <div className={styles.card}>
      <div className={styles.sectionTitle}>Trade Breakdown</div>
      {/* Replace with your breakdown chart or stats */}
      <div style={{ color: '#cbd5e1', fontSize: '1rem' }}>
        <p>Win Rate: 54%</p>
        <p>Long vs Short: 60% / 40%</p>
        <p>Avg. R:R: 1.8</p>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className={styles.dashboardContainer}>
      <GoalProgressCard />
      <div className={styles.cardsRow}>
        <TradeBreakdownCard />
        {/* You can add another card here, e.g., for streaks, stats, etc. */}
      </div>
    </div>
  );
} 