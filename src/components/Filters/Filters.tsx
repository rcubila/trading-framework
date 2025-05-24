import React from 'react';
import styles from './Filters.module.css';

interface FiltersProps {
  dateRange: {
    start: string;
    end: string;
  };
  strategy: string;
  symbol: string;
  direction: string;
  session: string;
  tags: string[];
  onFilterChange: (filters: {
    dateRange: { start: string; end: string };
    strategy: string;
    symbol: string;
    direction: string;
    session: string;
    tags: string[];
  }) => void;
  onReset: () => void;
}

export const Filters = ({
  dateRange,
  strategy,
  symbol,
  direction,
  session,
  tags,
  onFilterChange,
  onReset,
}: FiltersProps) => {
  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFilterChange({
      dateRange: { ...dateRange, [field]: value },
      strategy,
      symbol,
      direction,
      session,
      tags,
    });
  };

  const handleFilterChange = (field: keyof Omit<FiltersProps, 'dateRange' | 'onFilterChange' | 'onReset'>, value: string) => {
    onFilterChange({
      dateRange,
      strategy,
      symbol,
      direction,
      session,
      tags,
      [field]: value,
    });
  };

  return (
    <div className={styles.filters}>
      <div className={styles.filterGroup}>
        <label>Date Range</label>
        <div className={styles.dateRange}>
          <input
            type="date"
            value={dateRange.start}
            onChange={(e) => handleDateRangeChange('start', e.target.value)}
          />
          <span>to</span>
          <input
            type="date"
            value={dateRange.end}
            onChange={(e) => handleDateRangeChange('end', e.target.value)}
          />
        </div>
      </div>

      <div className={styles.filterGroup}>
        <label>Strategy</label>
        <input
          type="text"
          value={strategy}
          onChange={(e) => handleFilterChange('strategy', e.target.value)}
          placeholder="Filter by strategy"
        />
      </div>

      <div className={styles.filterGroup}>
        <label>Symbol</label>
        <input
          type="text"
          value={symbol}
          onChange={(e) => handleFilterChange('symbol', e.target.value)}
          placeholder="Filter by symbol"
        />
      </div>

      <div className={styles.filterGroup}>
        <label>Direction</label>
        <select
          value={direction}
          onChange={(e) => handleFilterChange('direction', e.target.value)}
        >
          <option value="">All</option>
          <option value="Win">Wins</option>
          <option value="Loss">Losses</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label>Session</label>
        <select
          value={session}
          onChange={(e) => handleFilterChange('session', e.target.value)}
        >
          <option value="">All</option>
          <option value="Pre-Market">Pre-Market</option>
          <option value="Regular">Regular</option>
          <option value="After-Hours">After-Hours</option>
        </select>
      </div>

      <button className={styles.resetButton} onClick={onReset}>
        Reset Filters
      </button>
    </div>
  );
}; 