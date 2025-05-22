import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PageHeader } from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import styles from './Playbook.module.css';

interface Trade {
  id: string;
  date: string;
  symbol: string;
  type: 'long' | 'short';
  entry: number;
  exit: number;
  pnl: number;
  r: number;
  notes: string;
  tags: string[];
}

interface PlaybookSetup {
  id: string;
  title: string;
  description: string;
  type: string;
  tags: string[];
  notes: string;
  checklist: string[];
  trades: Trade[];
  performance: {
    totalTrades: number;
    winRate: number;
    averageR: number;
    profitFactor: number;
    expectancy: number;
    largestWin: number;
    largestLoss: number;
    averageWin: number;
    averageLoss: number;
    netPL: number;
  };
}

interface AssetPlaybook {
  id: string;
  asset: string;
  description: string;
  strategies: PlaybookSetup[];
  performance: {
    totalTrades: number;
    winRate: number;
    averageR: number;
    profitFactor: number;
    expectancy: number;
    netPL: number;
  };
}

const mockAssets: AssetPlaybook[] = [
  {
    id: '1',
    asset: 'GER40',
    description: 'German DAX Index trading strategies',
    strategies: [
      {
        id: '1',
        title: 'Morning Breakout',
        description: 'A breakout strategy for GER40 during the morning session.',
        type: 'Breakout',
        tags: ['gap-up', 'morning session'],
        notes: 'Focus on high volume breakouts after 9:00am.',
        checklist: ['Wait for opening range', 'Confirm volume', 'Enter on breakout'],
        trades: [],
        performance: {
          totalTrades: 4,
          winRate: 50,
          averageR: 1.15,
          profitFactor: 5.93,
          expectancy: 21999.24,
          largestWin: 77471.72,
          largestLoss: -17122.44,
          averageWin: 52915.59,
          averageLoss: -8917.10,
          netPL: 87996.97,
        },
      },
      {
        id: '2',
        title: 'Range Trading',
        description: 'Range trading strategy for GER40 during low volatility periods.',
        type: 'Range',
        tags: ['range', 'mean reversion'],
        notes: 'Best used during low volatility market conditions.',
        checklist: ['Identify range boundaries', 'Wait for pullback', 'Enter at support/resistance'],
        trades: [],
        performance: {
          totalTrades: 3,
          winRate: 66,
          averageR: 0.85,
          profitFactor: 2.5,
          expectancy: 15000,
          largestWin: 45000,
          largestLoss: -18000,
          averageWin: 30000,
          averageLoss: -12000,
          netPL: 45000,
        },
      }
    ],
    performance: {
      totalTrades: 7,
      winRate: 57,
      averageR: 1.0,
      profitFactor: 4.22,
      expectancy: 18500,
      netPL: 132996.97,
    }
  },
  {
    id: '2',
    asset: 'GOLD',
    description: 'Gold trading strategies',
    strategies: [
      {
        id: '3',
        title: 'Trend Following',
        description: 'Trend following strategy for Gold.',
        type: 'Trend',
        tags: ['trend', 'momentum'],
        notes: 'Follow the major trend with multiple entries.',
        checklist: ['Identify trend direction', 'Wait for pullback', 'Enter on continuation'],
        trades: [],
        performance: {
          totalTrades: 5,
          winRate: 60,
          averageR: 1.2,
          profitFactor: 3.0,
          expectancy: 18000,
          largestWin: 60000,
          largestLoss: -20000,
          averageWin: 36000,
          averageLoss: -12000,
          netPL: 90000,
        },
      }
    ],
    performance: {
      totalTrades: 5,
      winRate: 60,
      averageR: 1.2,
      profitFactor: 3.0,
      expectancy: 18000,
      netPL: 90000,
    }
  }
];

const fetchStrategiesForPlaybook = async (playbookId: string) => {
  try {
    const { data: strategies, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('asset_name', playbookId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return strategies.map(strategy => ({
      id: strategy.id,
      title: strategy.name,
      description: strategy.description || '',
      type: strategy.type || '',
      tags: strategy.rules || [],
      notes: '',
      checklist: [],
      trades: [],
      performance: {
        totalTrades: strategy.performance_total_trades || 0,
        winRate: strategy.performance_win_rate || 0,
        averageR: strategy.performance_average_r || 0,
        profitFactor: strategy.performance_profit_factor || 0,
        expectancy: strategy.performance_expectancy || 0,
        largestWin: strategy.performance_largest_win || 0,
        largestLoss: strategy.performance_largest_loss || 0,
        averageWin: strategy.performance_average_win || 0,
        averageLoss: strategy.performance_average_loss || 0,
        netPL: strategy.performance_net_pl || 0,
      },
    }));
  } catch (error) {
    console.error('Error fetching strategies:', error);
    return [];
  }
};

export const PlayBook: React.FC = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState<AssetPlaybook[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetPlaybook | null>(null);
  const [selectedSetup, setSelectedSetup] = useState<PlaybookSetup | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateStrategyModal, setShowCreateStrategyModal] = useState(false);
  const [newPlaybook, setNewPlaybook] = useState({
    asset: '',
    title: '',
    type: '',
    tags: '',
    description: '',
  });
  const [newStrategy, setNewStrategy] = useState({
    title: '',
    type: '',
    tags: '',
    description: '',
  });
  const [newRuleInput, setNewRuleInput] = useState('');

  // Fetch assets and their strategies when component mounts
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        // Get unique asset names from strategies
        const { data: strategies, error } = await supabase
          .from('strategies')
          .select('asset_name')
          .not('asset_name', 'is', null)
          .order('asset_name');

        if (error) throw error;

        // Get unique asset names
        const uniqueAssets = [...new Set(strategies.map(s => s.asset_name))];

        // Create asset objects with their strategies
        const assetsData = await Promise.all(
          uniqueAssets.map(async (assetName) => {
            const strategies = await fetchStrategiesForPlaybook(assetName);
            return {
              id: assetName, // Using asset name as ID
              asset: assetName,
              description: `${assetName} trading strategies`,
              strategies,
              performance: {
                totalTrades: strategies.reduce((sum, s) => sum + s.performance.totalTrades, 0),
                winRate: strategies.reduce((sum, s) => sum + s.performance.winRate, 0) / strategies.length || 0,
                averageR: strategies.reduce((sum, s) => sum + s.performance.averageR, 0) / strategies.length || 0,
                profitFactor: strategies.reduce((sum, s) => sum + s.performance.profitFactor, 0) / strategies.length || 0,
                expectancy: strategies.reduce((sum, s) => sum + s.performance.expectancy, 0) / strategies.length || 0,
                netPL: strategies.reduce((sum, s) => sum + s.performance.netPL, 0),
              },
            };
          })
        );

        setAssets(assetsData);
      } catch (error) {
        console.error('Error fetching assets:', error);
      }
    };

    fetchAssets();
  }, []); // Empty dependency array means this runs once when component mounts

  const handleCreatePlaybook = async () => {
    try {
      if (!user) {
        throw new Error('User not authenticated');
      }
      console.log('Current user ID:', user.id);
      console.log('Inserting playbook with data:', {
        user_id: user.id,
        name: newPlaybook.title,
        description: newPlaybook.description,
        type: newPlaybook.type,
        asset_name: newPlaybook.asset,
        rules: newPlaybook.tags.split(',').map(t => t.trim()).filter(Boolean),
        is_playbook: false
      });

      const { data, error } = await supabase
        .from('strategies')
        .insert({
          user_id: user.id,
          name: newPlaybook.title,
          description: newPlaybook.description,
          type: newPlaybook.type,
          asset_name: newPlaybook.asset,
          rules: newPlaybook.tags.split(',').map(t => t.trim()).filter(Boolean),
          market_conditions: [],
          timeframes: [],
          risk_percentage: null,
          reward_ratio: null,
          is_playbook: false,
          performance_total_trades: 0,
          performance_win_rate: 0,
          performance_average_r: 0,
          performance_profit_factor: 0,
          performance_expectancy: 0,
          performance_largest_win: 0,
          performance_largest_loss: 0,
          performance_average_win: 0,
          performance_average_loss: 0,
          performance_net_pl: 0
        })
        .select()
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Playbook created successfully:', data);

      // Refresh the assets list
      const { data: strategies } = await supabase
        .from('strategies')
        .select('asset_name')
        .not('asset_name', 'is', null)
        .order('asset_name');

      if (strategies) {
        const uniqueAssets = [...new Set(strategies.map(s => s.asset_name))];
        const assetsData = await Promise.all(
          uniqueAssets.map(async (assetName) => {
            const strategies = await fetchStrategiesForPlaybook(assetName);
            return {
              id: assetName,
              asset: assetName,
              description: `${assetName} trading strategies`,
              strategies,
              performance: {
                totalTrades: strategies.reduce((sum, s) => sum + s.performance.totalTrades, 0),
                winRate: strategies.reduce((sum, s) => sum + s.performance.winRate, 0) / strategies.length || 0,
                averageR: strategies.reduce((sum, s) => sum + s.performance.averageR, 0) / strategies.length || 0,
                profitFactor: strategies.reduce((sum, s) => sum + s.performance.profitFactor, 0) / strategies.length || 0,
                expectancy: strategies.reduce((sum, s) => sum + s.performance.expectancy, 0) / strategies.length || 0,
                netPL: strategies.reduce((sum, s) => sum + s.performance.netPL, 0),
              },
            };
          })
        );
        setAssets(assetsData);
      }

      setShowCreateModal(false);
      setNewPlaybook({ asset: '', title: '', type: '', tags: '', description: '' });
    } catch (error) {
      console.error('Error creating playbook:', error);
    }
  };

  const handleDeletePlaybook = (id: string) => {
    setAssets(assets.map(asset => ({
      ...asset,
      strategies: asset.strategies.filter(s => s.id !== id),
    })));
  };

  const handleCreateStrategy = async () => {
    if (!selectedAsset) return;
    
    try {
      // Get the current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError) throw userError;
      if (!user) throw new Error('No user found');

      // First, create the strategy without parent_id
      const { data: strategy, error } = await supabase
        .from('strategies')
        .insert({
          user_id: user.id,
          name: newStrategy.title,
          description: newStrategy.description,
          type: newStrategy.type,
          asset_name: selectedAsset.asset,
          rules: newStrategy.tags.split(',').map(t => t.trim()).filter(Boolean),
          market_conditions: [],
          timeframes: [],
          risk_percentage: null,
          reward_ratio: null,
          is_playbook: false,
          performance_total_trades: 0,
          performance_win_rate: 0,
          performance_average_r: 0,
          performance_profit_factor: 0,
          performance_expectancy: 0,
          performance_largest_win: 0,
          performance_largest_loss: 0,
          performance_average_win: 0,
          performance_average_loss: 0,
          performance_net_pl: 0
        })
        .select()
        .single();

      if (error) throw error;

      // Fetch the updated strategies for this playbook
      const strategies = await fetchStrategiesForPlaybook(selectedAsset.asset);
      
      // Update the selected asset with the new strategies
      const updatedSelectedAsset = {
        ...selectedAsset,
        strategies
      };
      
      // Update the assets list with the new strategy
      const updatedAssets = assets.map(asset => 
        asset.id === selectedAsset.id ? updatedSelectedAsset : asset
      );

      setAssets(updatedAssets);
      setSelectedAsset(updatedSelectedAsset);
      setShowCreateStrategyModal(false);
      setNewStrategy({ title: '', type: '', tags: '', description: '' });
    } catch (error) {
      console.error('Error creating strategy:', error);
      // You might want to show an error toast here
    }
  };

  return (
    <div className={styles.container}>
      <PageHeader 
        title="PlayBook"
        subtitle="Manage and track your trading strategies"
        actions={
          !selectedAsset && (
            <button
              className={styles.primaryButton}
              onClick={() => setShowCreateModal(true)}
            >
              + New Playbook
            </button>
          )
        }
      />
      
      <div className={styles.content}>
        {/* Asset View */}
        {!selectedAsset && (
          <div className={styles.assetsGrid}>
            {assets.map(asset => (
              <div
                key={asset.id}
                className={styles.card}
                onClick={() => setSelectedAsset(asset)}
              >
                <div className={styles.cardContent}>
                  <h3 className={styles.cardTitle}>{asset.asset}</h3>
                  <p className={styles.cardDescription}>{asset.description}</p>
                  <div className={styles.tagsContainer}>
                    {asset.strategies.map(strategy => (
                      <span
                        key={strategy.id}
                        className={styles.assetTag}
                      >
                        {strategy.title}
                      </span>
                    ))}
                  </div>
                  <div className={styles.performanceGrid}>
                    <div className={styles.performanceItem}>
                      <span className={styles.performanceLabel}>Win Rate</span>
                      <div className={styles.performanceValueGreen}>{asset.performance.winRate}%</div>
                    </div>
                    <div className={styles.performanceItem}>
                      <span className={styles.performanceLabel}>Total Trades</span>
                      <div className={styles.performanceValue}>{asset.performance.totalTrades}</div>
                    </div>
                    <div className={styles.performanceItem}>
                      <span className={styles.performanceLabel}>Avg R</span>
                      <div className={styles.performanceValueBlue}>{asset.performance.averageR.toFixed(2)}R</div>
                    </div>
                    <div className={styles.performanceItem}>
                      <span className={styles.performanceLabel}>Net P&L</span>
                      <div className={styles.performanceValueGreen}>${asset.performance.netPL.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Strategy View */}
        {selectedAsset && !selectedSetup && (
          <div>
            <div className={styles.strategyHeader}>
              <button
                className={styles.primaryButton}
                onClick={() => setShowCreateStrategyModal(true)}
              >
                + New Strategy
              </button>
              <button
                onClick={() => setSelectedAsset(null)}
                className={styles.secondaryButton}
              >
                ← Back to Assets
              </button>
            </div>
            <div className={styles.strategiesGrid}>
              {selectedAsset.strategies.map(strategy => (
                <div
                  key={strategy.id}
                  className={styles.card}
                  onClick={() => setSelectedSetup(strategy)}
                >
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitle}>{strategy.title}</h3>
                    <p className={styles.cardDescription}>{strategy.description}</p>
                    <div className={styles.tagsContainer}>
                      {strategy.tags.map(tag => (
                        <span
                          key={tag}
                          className={styles.strategyTag}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <div className={styles.performanceGrid}>
                      <div className={styles.performanceItem}>
                        <span className={styles.performanceLabel}>Win Rate</span>
                        <div className={styles.performanceValueGreen}>{strategy.performance.winRate}%</div>
                      </div>
                      <div className={styles.performanceItem}>
                        <span className={styles.performanceLabel}>Trades</span>
                        <div className={styles.performanceValue}>{strategy.performance.totalTrades}</div>
                      </div>
                      <div className={styles.performanceItem}>
                        <span className={styles.performanceLabel}>Avg R</span>
                        <div className={styles.performanceValueBlue}>{strategy.performance.averageR.toFixed(2)}R</div>
                      </div>
                      <div className={styles.performanceItem}>
                        <span className={styles.performanceLabel}>Net P&L</span>
                        <div className={styles.performanceValueGreen}>${strategy.performance.netPL.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create Playbook Modal */}
        {showCreateModal && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>New Playbook</h2>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Asset</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newPlaybook.asset}
                  onChange={e => setNewPlaybook({ ...newPlaybook, asset: e.target.value })}
                  placeholder="e.g., GER40, GOLD, etc."
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Strategy Title</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newPlaybook.title}
                  onChange={e => setNewPlaybook({ ...newPlaybook, title: e.target.value })}
                  placeholder="e.g., Morning Breakout, Range Trading"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Type</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newPlaybook.type}
                  onChange={e => setNewPlaybook({ ...newPlaybook, type: e.target.value })}
                  placeholder="e.g., Breakout, Range, Trend"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tags (comma separated)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newPlaybook.tags}
                  onChange={e => setNewPlaybook({ ...newPlaybook, tags: e.target.value })}
                  placeholder="e.g., morning session, gap-up, range"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formTextarea}
                  rows={3}
                  value={newPlaybook.description}
                  onChange={e => setNewPlaybook({ ...newPlaybook, description: e.target.value })}
                  placeholder="Describe your strategy..."
                />
              </div>
              <div className={styles.formActions}>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreatePlaybook}
                  className={styles.primaryButton}
                  disabled={!newPlaybook.asset.trim() || !newPlaybook.title.trim()}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create Strategy Modal */}
        {showCreateStrategyModal && selectedAsset && (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <h2 className={styles.modalTitle}>New Strategy for {selectedAsset.asset}</h2>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Strategy Title</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newStrategy.title}
                  onChange={e => setNewStrategy({ ...newStrategy, title: e.target.value })}
                  placeholder="e.g., Morning Breakout, Range Trading"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Type</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newStrategy.type}
                  onChange={e => setNewStrategy({ ...newStrategy, type: e.target.value })}
                  placeholder="e.g., Breakout, Range, Trend"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Tags (comma separated)</label>
                <input
                  type="text"
                  className={styles.formInput}
                  value={newStrategy.tags}
                  onChange={e => setNewStrategy({ ...newStrategy, tags: e.target.value })}
                  placeholder="e.g., morning session, gap-up, range"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formTextarea}
                  rows={3}
                  value={newStrategy.description}
                  onChange={e => setNewStrategy({ ...newStrategy, description: e.target.value })}
                  placeholder="Describe your strategy..."
                />
              </div>
              <div className={styles.formActions}>
                <button
                  onClick={() => setShowCreateStrategyModal(false)}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateStrategy}
                  className={styles.primaryButton}
                  disabled={!newStrategy.title.trim()}
                >
                  Create Strategy
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Playbook Detail Modal */}
        {selectedSetup && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalLarge}>
              <div className={styles.modalHeader}>
                <div>
                  <h2 className={styles.modalLargeTitle}>{selectedSetup.title}</h2>
                  <p className={styles.modalSubtitle}>{selectedSetup.type}</p>
                </div>
                <button
                  onClick={() => setSelectedSetup(null)}
                  className={styles.closeButton}
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>
              {/* Tabs */}
              <div className={styles.tabsContainer}>
                {['Overview', 'Playbook Rules', 'Executed Trades', 'Missed Trades', 'Notes'].map(tab => (
                  <button
                    key={tab}
                    className={`${styles.tab} ${
                      activeTab === tab
                        ? styles.tabActive
                        : styles.tabInactive
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                ))}
              </div>
              {/* Tab Content */}
              <div className={styles.tabContent}>
                {activeTab === 'Overview' && (
                  <div>
                    {/* Stats Grid */}
                    <div className={styles.statsGrid}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Net P&L</span>
                        <span className={styles.statValueGreen}>
                          ${selectedSetup.performance.netPL.toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Trades</span>
                        <span className={styles.statValue}>{selectedSetup.performance.totalTrades}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Win Rate %</span>
                        <span className={styles.statValue}>{selectedSetup.performance.winRate}%</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Profit Factor</span>
                        <span className={styles.statValue}>{selectedSetup.performance.profitFactor.toFixed(2)}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Expectancy</span>
                        <span className={styles.statValue}>{selectedSetup.performance.expectancy.toFixed(2)}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Average Winner</span>
                        <span className={styles.statValueGreen}>
                          ${selectedSetup.performance.averageWin.toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Average Loser</span>
                        <span className={styles.statValueRed}>
                          -${Math.abs(selectedSetup.performance.averageLoss).toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Largest Profit</span>
                        <span className={styles.statValueGreen}>
                          ${selectedSetup.performance.largestWin.toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Largest Loss</span>
                        <span className={styles.statValueRed}>
                          -${Math.abs(selectedSetup.performance.largestLoss).toLocaleString()}
                        </span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>Total R Multiple</span>
                        <span className={styles.statValue}>{selectedSetup.performance.averageR.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Description</h3>
                      <p className={styles.sectionContent}>{selectedSetup.description}</p>
                    </div>
                    
                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Rules Followed</h3>
                      <div className={styles.rulesContainer}>
                        <div className={styles.rulesHeader}>
                          <span className={styles.rulesHeaderText}>Rules Compliance</span>
                          <span className={styles.rulesHeaderValue}>85%</span>
                        </div>
                        <div className={styles.progressBar}>
                          <div className={styles.progressBarFill}></div>
                        </div>
                        <p className={styles.rulesFooter}>
                          {selectedSetup.checklist.length} rules in total
                        </p>
                      </div>
                    </div>

                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Missed Trades</h3>
                      <div className={styles.missedTradesContainer}>
                        <div className={styles.missedTradesHeader}>
                          <span className={styles.missedTradesCount}>3</span>
                          <span className={styles.missedTradesLabel}>missed opportunities</span>
                        </div>
                        <p className={styles.missedTradesFooter}>
                          Last missed trade: 2 days ago
                        </p>
                      </div>
                    </div>

                    <div className={styles.section}>
                      <h3 className={styles.sectionTitle}>Tags</h3>
                      <div className={styles.tagsContainer}>
                        {selectedSetup.tags.map((tag, index) => (
                          <span
                            key={index}
                            className={styles.assetTag}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                {activeTab === 'Playbook Rules' && (
                  <div className={styles.section}>
                    <ul className={styles.rulesList}>
                      {selectedSetup.checklist.map((rule, idx) => (
                        <li key={idx} className={styles.ruleItem}>
                          <input
                            type="text"
                            className={styles.ruleInput}
                            value={rule}
                            onChange={e => {
                              const updated = [...selectedSetup.checklist];
                              updated[idx] = e.target.value;
                              setSelectedSetup({ ...selectedSetup, checklist: updated });
                            }}
                          />
                          <button
                            className={styles.deleteButton}
                            onClick={() => {
                              const updated = selectedSetup.checklist.filter((_, i) => i !== idx);
                              setSelectedSetup({ ...selectedSetup, checklist: updated });
                            }}
                            title="Delete rule"
                          >
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className={styles.addRuleContainer}>
                      <input
                        type="text"
                        className={styles.addRuleInput}
                        placeholder="Add new rule..."
                        value={newRuleInput}
                        onChange={e => setNewRuleInput(e.target.value)}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newRuleInput.trim()) {
                            setSelectedSetup({
                              ...selectedSetup,
                              checklist: [...selectedSetup.checklist, newRuleInput.trim()],
                            });
                            setNewRuleInput('');
                          }
                        }}
                      />
                      <button
                        className={styles.addButton}
                        onClick={() => {
                          if (newRuleInput.trim()) {
                            setSelectedSetup({
                              ...selectedSetup,
                              checklist: [...selectedSetup.checklist, newRuleInput.trim()],
                            });
                            setNewRuleInput('');
                          }
                        }}
                        disabled={!newRuleInput.trim()}
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}
                {activeTab === 'Executed Trades' && (
                  <div className={styles.placeholderContent}>
                    [Executed Trades Table]
                  </div>
                )}
                {activeTab === 'Missed Trades' && (
                  <div className={styles.placeholderContent}>
                    [Missed Trades Table]
                  </div>
                )}
                {activeTab === 'Notes' && (
                  <div className={styles.notesContent}>
                    {selectedSetup.notes}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayBook; 