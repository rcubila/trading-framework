import React from 'react';
import { Filter } from 'lucide-react';
import styles from './FilterControls.module.css';

interface Strategy {
  id: string;
  name: string;
  asset: string;
}

interface FilterControlsProps {
  selectedStrategy: string;
  onStrategyChange: (strategy: string) => void;
  groupedStrategies: Record<string, Strategy[]>;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  selectedStrategy,
  onStrategyChange,
  groupedStrategies
}) => {
  return (
    <div className={styles.filterControls}>
      <div className={styles.filterControlsInner}>
        {/* Date Range Filter */}
        <div className={styles.filterGroup}>
          <select className={styles.filterSelect}>
            <option value="1D">Today</option>
            <option value="1W">This Week</option>
            <option value="1M">This Month</option>
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
            <option value="1Y">This Year</option>
            <option value="ALL">All Time</option>
          </select>
        </div>

        {/* Strategy Filter */}
        <div className={styles.filterGroup}>
          <div>
            <select 
              className={styles.filterSelectWide}
              value={selectedStrategy}
              onChange={(e) => onStrategyChange(e.target.value)}
            >
              <option value="ALL">All Strategies</option>
              {Object.entries(groupedStrategies).map(([asset, strategies]) => (
                <optgroup 
                  key={asset} 
                  label={asset}
                  className={styles.filterOptionGroup}
                >
                  {strategies.map(strategy => (
                    <option 
                      key={strategy.id} 
                      value={strategy.id}
                      className={styles.filterOption}
                    >
                      {strategy.name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
        </div>

        {/* Symbol Filter */}
        <div className={styles.filterGroup}>
          <input
            type="text"
            placeholder="Filter by symbol..."
            className={styles.filterInput}
          />
        </div>

        {/* Trade Direction Filter */}
        <div className={styles.filterGroup}>
          <select className={styles.filterSelect}>
            <option value="ALL">All Trades</option>
            <option value="LONG">Long</option>
            <option value="SHORT">Short</option>
          </select>
        </div>
      </div>
    </div>
  );
}; 