import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { PageHeader } from '../../components/PageHeader/PageHeader';
import { useAuth } from '../../context/AuthContext';
import styles from './Playbook.module.css';
import { AnimatedButton } from '../../components/AnimatedButton';
import { IconSelector } from '../../components/IconSelector';
import { MoreVertical, Plus, Search, Edit, Trash2 } from 'lucide-react';
import { SkeletonLoader } from '../../components/SkeletonLoader';
import { toast } from 'react-hot-toast';
import { usePlaybookData } from '../../hooks/usePlaybookData';
import type { PlaybookAsset, PlaybookStrategy } from '../../hooks/usePlaybookData';
import { ErrorBoundary } from '../../components/ErrorBoundary';
import { CreatePlaybookModal } from './components/CreatePlaybookModal/CreatePlaybookModal';

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
  icon?: string;
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
  icon?: string;
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

interface PlaybookRule {
  content: string;
  order_index: number;
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
      .select(`
        *,
        playbook_rules (
          content,
          order_index
        )
      `)
      .eq('asset_name', playbookId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return strategies.map(strategy => ({
      id: strategy.id,
      title: strategy.name,
      description: strategy.description || '',
      type: strategy.type || '',
      tags: strategy.rules || [], // Keep for backward compatibility
      notes: '',
      checklist: (strategy.playbook_rules as PlaybookRule[] || [])
        .sort((a: PlaybookRule, b: PlaybookRule) => a.order_index - b.order_index)
        .map((rule: PlaybookRule) => rule.content),
      trades: [],
      icon: strategy.icon || undefined,
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
  const {
    assets,
    isLoading,
    error,
    createAsset,
    deleteAsset,
    createStrategy,
    deleteStrategy,
    updateStrategyIcon,
    updateStrategyRules,
    refreshData,
    refreshAssetData,
  } = usePlaybookData();

  const [selectedAsset, setSelectedAsset] = useState<PlaybookAsset | null>(null);
  const [selectedSetup, setSelectedSetup] = useState<PlaybookStrategy | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCreateStrategyModal, setShowCreateStrategyModal] = useState(false);
  const [newPlaybook, setNewPlaybook] = useState({
    asset: '',
    title: '',
    type: '',
    tags: '',
    description: '',
    icon: '',
  });
  const [newStrategy, setNewStrategy] = useState({
    title: '',
    type: '',
    tags: '',
    description: '',
  });
  const [newRuleInput, setNewRuleInput] = useState('');
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<{ id: string; name: string } | null>(null);
  const [strategyToDelete, setStrategyToDelete] = useState<PlaybookStrategy | null>(null);
  const [showDeleteStrategyModal, setShowDeleteStrategyModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState<string | null>(null);
  const [rulesDirty, setRulesDirty] = useState(false);

  const handleCreatePlaybook = async (playbook: {
    asset: string;
    title: string;
    type: string;
    tags: string;
    description: string;
    icon: string;
  }) => {
    try {
      if (!playbook.asset.trim()) {
        toast.error('Please enter an asset name');
        return;
      }

      await createAsset({
        asset: playbook.asset.trim(),
        description: playbook.description.trim(),
        icon: playbook.icon,
      });
      
      setShowCreateModal(false);
      toast.success('Playbook created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create playbook');
    }
  };

  const handleDeletePlaybook = async (id: string) => {
    try {
      await deleteAsset(id);
      setShowDeleteConfirmModal(false);
      setAssetToDelete(null);
    } catch (error) {
      console.error('Error deleting playbook:', error);
    }
  };

  const handleCreateStrategy = async () => {
    if (!selectedAsset) {
      toast.error('No asset selected');
      return;
    }
    
    try {
      // Validate required fields
      if (!newStrategy.title.trim()) {
        toast.error('Please enter a strategy title');
        return;
      }

      // Create the strategy
      await createStrategy(selectedAsset.id, {
        title: newStrategy.title.trim(),
        description: newStrategy.description.trim(),
        type: newStrategy.type.trim(),
        tags: newStrategy.tags.split(',').map(t => t.trim()).filter(Boolean),
        notes: '',
        checklist: [],
        trades: [],
      });

      // Refresh the selected asset's data
      const updatedStrategies = await refreshAssetData(selectedAsset.id);
      setSelectedAsset(prev => prev ? { ...prev, strategies: updatedStrategies } : null);

      // Close modal and reset form
      setShowCreateStrategyModal(false);
      setNewStrategy({ title: '', type: '', tags: '', description: '' });
      toast.success('Strategy created successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create strategy');
    }
  };

  const handleDeleteStrategy = async () => {
    if (!selectedAsset || !strategyToDelete) {
      toast.error('Missing required data for deletion');
      return;
    }

    try {
      await deleteStrategy(selectedAsset.id, strategyToDelete.id);
      
      // Refresh the selected asset's data
      const updatedStrategies = await refreshAssetData(selectedAsset.id);
      setSelectedAsset(prev => prev ? { ...prev, strategies: updatedStrategies } : null);
      
      setShowDeleteStrategyModal(false);
      setStrategyToDelete(null);
      setSelectedSetup(null);
      setShowMenu(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete strategy');
    }
  };

  const handleStrategyIconChange = async (strategyId: string, icon: string) => {
    try {
      await updateStrategyIcon(strategyId, icon);
    } catch (error) {
      console.error('Error changing strategy icon:', error);
    }
  };

  const handleUpdateRules = async (strategyId: string, rules: string[]) => {
    try {
      // Call the API to update rules
      await updateStrategyRules(strategyId, rules);
      
      // Update the selectedSetup state with the new rules
      setSelectedSetup(prev => prev ? {
        ...prev,
        checklist: rules
      } : null);
      
      // Update the selectedAsset state to reflect the changes
      setSelectedAsset(prev => prev ? {
        ...prev,
        strategies: prev.strategies.map(strategy => 
          strategy.id === strategyId 
            ? { ...strategy, checklist: rules }
            : strategy
        )
      } : null);
      
      // Refresh the data to ensure we have the latest state
      await refreshData();
      
      // Reset dirty state
      setRulesDirty(false);

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = styles.successMessage;
      successMessage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>Strategy rules saved successfully!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 2000);
    } catch (error) {
      console.error('Error updating rules:', error);
      throw error; // Re-throw the error to be handled by the caller
    }
  };

  const headerActions = (
    <div className={styles.headerActions}>
      <div className={styles.filterGroup}>
        <input
          type="text"
          placeholder="Search playbooks..."
          className={styles.filterInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button className={styles.actionButtonIcon}>
          <Search size={18} />
        </button>
      </div>
      <button 
        className={styles.actionButtonGradient}
        onClick={() => setShowCreateModal(true)}
      >
        <Plus size={18} />
        New Playbook
      </button>
      <button className={styles.actionButtonIcon}>
        <MoreVertical size={18} />
      </button>
    </div>
  );

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Error loading playbooks</h2>
        <p>{error.message}</p>
        <button onClick={() => refreshData()}>Retry</button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={styles.container}>
        <PageHeader
          title={selectedAsset ? "Strategies" : "Playbooks"}
          subtitle={selectedAsset ? `Manage strategies for ${selectedAsset.asset}` : "Manage your trading playbooks and strategies"}
          actions={headerActions}
        />
        
        <div className={styles.content}>
          {/* Asset View */}
          {!selectedAsset && (
            <div className={styles.assetsGrid}>
              {isLoading ? (
                // Loading skeletons - match the number of actual items
                Array(assets.length || 2).fill(null).map((_, index) => (
                  <SkeletonLoader key={`asset-skeleton-${index}`} type="card" />
                ))
              ) : (
                assets.map(asset => (
                  <div
                    key={asset.id}
                    className={styles.card}
                    onClick={() => setSelectedAsset(asset)}
                  >
                    <div className={styles.cardActions}>
                      <div className={styles.relative}>
                        <button 
                          className={styles.menuButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(showMenu === asset.id ? null : asset.id);
                          }}
                        >
                          <MoreVertical size={16} />
                        </button>
                        {showMenu === asset.id && (
                          <div className={styles.menuDropdown}>
                            <button 
                              className={styles.menuItem}
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMenu(null);
                              }}
                            >
                              <Edit size={14} />
                              Edit
                            </button>
                            <button 
                              className={styles.menuItemDelete}
                              onClick={(e) => {
                                e.stopPropagation();
                                setAssetToDelete({ id: asset.id, name: asset.asset });
                                setShowDeleteConfirmModal(true);
                              }}
                            >
                              <Trash2 size={14} />
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className={styles.cardContent}>
                      <div className={styles.cardHeader}>
                        {asset.icon && (
                          <img 
                            src={asset.icon} 
                            alt={`${asset.asset} icon`} 
                            className={styles.cardIcon}
                          />
                        )}
                        <h3 className={styles.cardTitle}>{asset.asset}</h3>
                      </div>
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
                ))
              )}
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
                {isLoading ? (
                  Array(selectedAsset.strategies.length || 2).fill(null).map((_, index) => (
                    <SkeletonLoader key={`strategy-skeleton-${index}`} type="card" />
                  ))
                ) : (
                  selectedAsset.strategies.map(strategy => (
                    <div
                      key={strategy.id}
                      className={styles.card}
                      onClick={() => setSelectedSetup(strategy)}
                    >
                      <div className={styles.cardActions}>
                        <div className={styles.relative}>
                          <button 
                            className={styles.menuButton}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowMenu(showMenu === strategy.id ? null : strategy.id);
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>
                          {showMenu === strategy.id && (
                            <div className={styles.menuDropdown}>
                              <button 
                                className={styles.menuItem}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowMenu(null);
                                }}
                              >
                                <Edit size={14} />
                                Edit
                              </button>
                              <button 
                                className={styles.menuItemDelete}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const strategyToDelete = selectedAsset.strategies.find(s => s.id === strategy.id);
                                  if (strategyToDelete) {
                                    setStrategyToDelete(strategyToDelete);
                                    setShowDeleteStrategyModal(true);
                                    setShowMenu(null);
                                  }
                                }}
                              >
                                <Trash2 size={14} />
                                Delete
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={styles.cardContent}>
                        <div className={styles.cardHeader}>
                          <div className={styles.strategyIcon}>
                            <IconSelector
                              selectedIcon={strategy.icon || 'trending-up'}
                              onSelectIcon={(icon) => handleStrategyIconChange(strategy.id, icon)}
                            />
                          </div>
                          <h3 className={styles.cardTitle}>{strategy.title}</h3>
                        </div>
                        <p className={styles.cardDescription}>{strategy.description}</p>
                        <div className={styles.tagsContainer}>
                          {strategy.tags.map((tag, index) => (
                            <span key={index} className={styles.tag}>
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
                            <span className={styles.performanceLabel}>Total Trades</span>
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
                  ))
                )}
              </div>
            </div>
          )}

          {/* Create Playbook Modal */}
          <CreatePlaybookModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onCreate={handleCreatePlaybook}
          />

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
                  {['Overview', 'Strategy Rules', 'Executed Trades', 'Missed Trades', 'Notes'].map(tab => (
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
                  {activeTab === 'Strategy Rules' && (
                    <div className={styles.section} style={{ position: 'relative', minHeight: '300px' }}>
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
                                setRulesDirty(true);
                              }}
                            />
                            <button
                              className={styles.deleteButton}
                              onClick={() => {
                                const updated = selectedSetup.checklist.filter((_, i) => i !== idx);
                                setSelectedSetup({ ...selectedSetup, checklist: updated });
                                setRulesDirty(true);
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
                              const updated = [...selectedSetup.checklist, newRuleInput.trim()];
                              setSelectedSetup({
                                ...selectedSetup,
                                checklist: updated,
                              });
                              setNewRuleInput('');
                              setRulesDirty(true);
                            }
                          }}
                        />
                        <button
                          className={styles.addButton}
                          onClick={() => {
                            if (newRuleInput.trim()) {
                              const updated = [...selectedSetup.checklist, newRuleInput.trim()];
                              setSelectedSetup({
                                ...selectedSetup,
                                checklist: updated,
                              });
                              setNewRuleInput('');
                              setRulesDirty(true);
                            }
                          }}
                          disabled={!newRuleInput.trim()}
                        >
                          Add
                        </button>
                      </div>
                      {/* Save Rules Button */}
                      <button
                        className={styles.saveRulesButton}
                        style={{ position: 'fixed', bottom: '32px', right: '32px', zIndex: 1001 }}
                        disabled={!rulesDirty}
                        onClick={async () => {
                          if (selectedSetup) {
                            try {
                              await handleUpdateRules(selectedSetup.id, selectedSetup.checklist);
                              setRulesDirty(false);
                            } catch (error) {
                              // Show error message
                              const errorMessage = document.createElement('div');
                              errorMessage.className = styles.errorMessage;
                              errorMessage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>Failed to save rules. Please try again.';
                              document.body.appendChild(errorMessage);
                              setTimeout(() => {
                                document.body.removeChild(errorMessage);
                              }, 3000);
                            }
                          }
                        }}
                      >
                        Save Rules
                      </button>
                    </div>
                  )}
                  {activeTab === 'Playbook Rules' && (
                    <div className={styles.section}>
                      <p className={styles.placeholderContent}>No rules available for this playbook.</p>
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

          {/* Delete Confirmation Modal */}
          {showDeleteConfirmModal && assetToDelete && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <h2 className={styles.modalTitle}>Delete Playbook</h2>
                <p className={styles.modalText}>
                  Are you sure you want to delete {assetToDelete.name} and all its strategies? This action cannot be undone.
                </p>
                <div className={styles.formActions}>
                  <button
                    onClick={() => {
                      setShowDeleteConfirmModal(false);
                      setAssetToDelete(null);
                    }}
                    className={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleDeletePlaybook(assetToDelete.id);
                    }}
                    className={styles.deleteButton}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Delete Strategy Confirmation Modal */}
          {showDeleteStrategyModal && strategyToDelete && (
            <div className={styles.modalOverlay}>
              <div className={styles.modal}>
                <h2 className={styles.modalTitle}>Delete Strategy</h2>
                <p className={styles.modalText}>
                  Are you sure you want to delete the strategy "{strategyToDelete.title}"? This action cannot be undone.
                </p>
                <div className={styles.modalActions}>
                  <button
                    className={styles.secondaryButton}
                    onClick={() => {
                      setShowDeleteStrategyModal(false);
                      setStrategyToDelete(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={styles.dangerButton}
                    onClick={() => handleDeleteStrategy()}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default PlayBook; 