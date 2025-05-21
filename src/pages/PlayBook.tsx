import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

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

export const PlayBook: React.FC = () => {
  const [assets, setAssets] = useState<AssetPlaybook[]>(mockAssets);
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

  const handleCreatePlaybook = () => {
    setAssets([
      ...assets,
      {
        id: Date.now().toString(),
        asset: newPlaybook.asset,
        description: newPlaybook.description,
        strategies: [
          {
            id: Date.now().toString(),
            title: newPlaybook.title,
            description: newPlaybook.description,
            type: newPlaybook.type,
            tags: newPlaybook.tags.split(',').map(t => t.trim()).filter(Boolean),
            notes: '',
            checklist: [],
            trades: [],
            performance: {
              totalTrades: 0,
              winRate: 0,
              averageR: 0,
              profitFactor: 0,
              expectancy: 0,
              largestWin: 0,
              largestLoss: 0,
              averageWin: 0,
              averageLoss: 0,
              netPL: 0,
            },
          },
        ],
        performance: {
          totalTrades: 0,
          winRate: 0,
          averageR: 0,
          profitFactor: 0,
          expectancy: 0,
          netPL: 0,
        },
      },
    ]);
    setShowCreateModal(false);
    setNewPlaybook({ asset: '', title: '', type: '', tags: '', description: '' });
  };

  const handleDeletePlaybook = (id: string) => {
    setAssets(assets.map(asset => ({
      ...asset,
      strategies: asset.strategies.filter(s => s.id !== id),
    })));
  };

  const handleCreateStrategy = () => {
    if (!selectedAsset) return;
    
    const updatedAssets = assets.map(asset => {
      if (asset.id === selectedAsset.id) {
        return {
          ...asset,
          strategies: [
            ...asset.strategies,
            {
              id: Date.now().toString(),
              title: newStrategy.title,
              description: newStrategy.description,
              type: newStrategy.type,
              tags: newStrategy.tags.split(',').map(t => t.trim()).filter(Boolean),
              notes: '',
              checklist: [],
              trades: [],
              performance: {
                totalTrades: 0,
                winRate: 0,
                averageR: 0,
                profitFactor: 0,
                expectancy: 0,
                largestWin: 0,
                largestLoss: 0,
                averageWin: 0,
                averageLoss: 0,
                netPL: 0,
              },
            },
          ],
        };
      }
      return asset;
    });

    setAssets(updatedAssets);
    const updatedSelectedAsset = updatedAssets.find(asset => asset.id === selectedAsset.id);
    if (updatedSelectedAsset) {
      setSelectedAsset(updatedSelectedAsset);
    }
    setShowCreateStrategyModal(false);
    setNewStrategy({ title: '', type: '', tags: '', description: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Playbook</h1>
        {!selectedAsset && (
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
            onClick={() => setShowCreateModal(true)}
          >
            + New Playbook
          </button>
        )}
      </div>

      {/* Asset View */}
      {!selectedAsset && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assets.map(asset => (
            <div
              key={asset.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition relative"
              onClick={() => setSelectedAsset(asset)}
            >
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">{asset.asset}</h3>
                <p className="text-sm text-slate-500 mb-4">{asset.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {asset.strategies.map(strategy => (
                    <span
                      key={strategy.id}
                      className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full"
                    >
                      {strategy.title}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Win Rate</span>
                    <div className="text-green-500 font-medium">{asset.performance.winRate}%</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Trades</span>
                    <div className="font-medium">{asset.performance.totalTrades}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Avg R</span>
                    <div className="text-blue-500 font-medium">{asset.performance.averageR.toFixed(2)}R</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Net P&L</span>
                    <div className="text-green-500 font-medium">${asset.performance.netPL.toLocaleString()}</div>
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
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSelectedAsset(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                ← Back to Assets
              </button>
              <h2 className="text-2xl font-bold">{selectedAsset.asset} Strategies</h2>
            </div>
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
              onClick={() => setShowCreateStrategyModal(true)}
            >
              + New Strategy
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {selectedAsset.strategies.map(strategy => (
              <div
                key={strategy.id}
                className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition relative"
                onClick={() => setSelectedSetup(strategy)}
              >
                <div className="p-6">
                  <h3 className="text-lg font-semibold mb-2">{strategy.title}</h3>
                  <p className="text-sm text-slate-500 mb-4">{strategy.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {strategy.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-slate-400">Win Rate</span>
                      <div className="text-green-500 font-medium">{strategy.performance.winRate}%</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Trades</span>
                      <div className="font-medium">{strategy.performance.totalTrades}</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Avg R</span>
                      <div className="text-blue-500 font-medium">{strategy.performance.averageR.toFixed(2)}R</div>
                    </div>
                    <div>
                      <span className="text-slate-400">Net P&L</span>
                      <div className="text-green-500 font-medium">${strategy.performance.netPL.toLocaleString()}</div>
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold mb-4">New Playbook</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Asset</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  value={newPlaybook.asset}
                  onChange={e => setNewPlaybook({ ...newPlaybook, asset: e.target.value })}
                  placeholder="e.g., GER40, GOLD, etc."
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Strategy Title</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  value={newPlaybook.title}
                  onChange={e => setNewPlaybook({ ...newPlaybook, title: e.target.value })}
                  placeholder="e.g., Morning Breakout, Range Trading"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  value={newPlaybook.type}
                  onChange={e => setNewPlaybook({ ...newPlaybook, type: e.target.value })}
                  placeholder="e.g., Breakout, Range, Trend"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  value={newPlaybook.tags}
                  onChange={e => setNewPlaybook({ ...newPlaybook, tags: e.target.value })}
                  placeholder="e.g., morning session, gap-up, range"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  rows={3}
                  value={newPlaybook.description}
                  onChange={e => setNewPlaybook({ ...newPlaybook, description: e.target.value })}
                  placeholder="Describe your strategy..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePlaybook}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold mb-4">New Strategy for {selectedAsset.asset}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Strategy Title</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  value={newStrategy.title}
                  onChange={e => setNewStrategy({ ...newStrategy, title: e.target.value })}
                  placeholder="e.g., Morning Breakout, Range Trading"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  value={newStrategy.type}
                  onChange={e => setNewStrategy({ ...newStrategy, type: e.target.value })}
                  placeholder="e.g., Breakout, Range, Trend"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  value={newStrategy.tags}
                  onChange={e => setNewStrategy({ ...newStrategy, tags: e.target.value })}
                  placeholder="e.g., morning session, gap-up, range"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  rows={3}
                  value={newStrategy.description}
                  onChange={e => setNewStrategy({ ...newStrategy, description: e.target.value })}
                  placeholder="Describe your strategy..."
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCreateStrategyModal(false)}
                className="px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateStrategy}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-8">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">{selectedSetup.title}</h2>
                <p className="text-slate-400">{selectedSetup.type}</p>
              </div>
              <button
                onClick={() => setSelectedSetup(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-2xl"
                aria-label="Close"
              >
                &times;
              </button>
            </div>
            {/* Tabs */}
            <div className="flex gap-2 mb-4 border-b border-slate-200 dark:border-slate-700">
              {['Overview', 'Playbook Rules', 'Executed Trades', 'Missed Trades', 'Notes'].map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2 font-medium border-b-2 transition-colors duration-200 ${activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-500 hover:text-blue-400'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            {/* Tab Content */}
            <div>
              {activeTab === 'Overview' && (
                <div className="space-y-6">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-8">
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1">Net P&L</span>
                      <span className="text-lg font-semibold text-green-500">${selectedSetup.performance.netPL.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1">Trades</span>
                      <span className="text-lg font-semibold">{selectedSetup.performance.totalTrades}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1">Win Rate %</span>
                      <span className="text-lg font-semibold">{selectedSetup.performance.winRate}%</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1">Profit Factor</span>
                      <span className="text-lg font-semibold">{selectedSetup.performance.profitFactor.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1">Expectancy</span>
                      <span className="text-lg font-semibold">{selectedSetup.performance.expectancy.toFixed(2)}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1">Average Winner</span>
                      <span className="text-lg font-semibold">${selectedSetup.performance.averageWin.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1">Average Loser</span>
                      <span className="text-lg font-semibold text-red-500">-${Math.abs(selectedSetup.performance.averageLoss).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1">Largest Profit</span>
                      <span className="text-lg font-semibold">${selectedSetup.performance.largestWin.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1">Largest Loss</span>
                      <span className="text-lg font-semibold text-red-500">-${Math.abs(selectedSetup.performance.largestLoss).toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="text-xs text-slate-400 mb-1">Total R Multiple</span>
                      <span className="text-lg font-semibold">{selectedSetup.performance.averageR.toFixed(2)}</span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-600 dark:text-gray-300">{selectedSetup.description}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-2">Rules Followed</h3>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600 dark:text-gray-400">Rules Compliance</span>
                        <span className="text-sm font-medium">85%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        {selectedSetup.checklist.length} rules in total
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Missed Trades</h3>
                    <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-red-500">3</span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">missed opportunities</span>
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        Last missed trade: 2 days ago
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedSetup.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'Playbook Rules' && (
                <div className="space-y-4">
                  <ul className="space-y-2">
                    {selectedSetup.checklist.map((rule, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          className="flex-1 bg-slate-100 dark:bg-slate-700 rounded p-2"
                          value={rule}
                          onChange={e => {
                            const updated = [...selectedSetup.checklist];
                            updated[idx] = e.target.value;
                            setSelectedSetup({ ...selectedSetup, checklist: updated });
                          }}
                        />
                        <button
                          className="text-red-500 hover:text-red-700"
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
                  <div className="flex gap-2 mt-2">
                    <input
                      type="text"
                      className="flex-1 bg-slate-100 dark:bg-slate-700 rounded p-2"
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
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
                <div className="text-slate-600 dark:text-slate-300">[Executed Trades Table]</div>
              )}
              {activeTab === 'Missed Trades' && (
                <div className="text-slate-600 dark:text-slate-300">[Missed Trades Table]</div>
              )}
              {activeTab === 'Notes' && (
                <div className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{selectedSetup.notes}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayBook; 