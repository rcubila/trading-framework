import React, { useState } from 'react';

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

const mockSetups: PlaybookSetup[] = [
  {
    id: '1',
    title: 'GER40 Morning Breakout',
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
  // Add more setups as needed
];

export const PlayBook: React.FC = () => {
  const [setups, setSetups] = useState<PlaybookSetup[]>(mockSetups);
  const [selectedSetup, setSelectedSetup] = useState<PlaybookSetup | null>(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPlaybook, setNewPlaybook] = useState({
    title: '',
    type: '',
    tags: '',
    description: '',
  });

  const handleCreatePlaybook = () => {
    setSetups([
      ...setups,
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
    ]);
    setShowCreateModal(false);
    setNewPlaybook({ title: '', type: '', tags: '', description: '' });
  };

  const handleDeletePlaybook = (id: string) => {
    setSetups(setups.filter(s => s.id !== id));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Playbook</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          onClick={() => setShowCreateModal(true)}
        >
          + New Playbook
        </button>
      </div>
      {/* Gallery/List of Playbooks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {setups.map(setup => (
          <div
            key={setup.id}
            className="bg-white dark:bg-slate-800 rounded-xl shadow border border-slate-200 dark:border-slate-700 cursor-pointer hover:shadow-lg transition relative"
            onClick={() => setSelectedSetup(setup)}
          >
            <button
              className="absolute top-2 right-2 text-red-400 hover:text-red-600 z-10"
              onClick={e => { e.stopPropagation(); handleDeletePlaybook(setup.id); }}
              title="Delete Playbook"
            >
              &times;
            </button>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-1">{setup.title}</h3>
              <p className="text-sm text-slate-500 mb-2">{setup.type}</p>
              <div className="flex gap-2 mb-2">
                {setup.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 text-xs bg-slate-100 dark:bg-slate-700 rounded-full text-slate-600 dark:text-slate-300">{tag}</span>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                <div>Win Rate: <span className="text-green-600 dark:text-green-400 font-medium">{setup.performance.winRate}%</span></div>
                <div>Avg R: <span className="text-blue-600 dark:text-blue-400 font-medium">{setup.performance.averageR.toFixed(2)}R</span></div>
                <div>Trades: {setup.performance.totalTrades}</div>
                <div>Expectancy: {setup.performance.expectancy.toFixed(2)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create Playbook Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-md p-8">
            <h2 className="text-xl font-bold mb-4">New Playbook</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  value={newPlaybook.title}
                  onChange={e => setNewPlaybook({ ...newPlaybook, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  value={newPlaybook.type}
                  onChange={e => setNewPlaybook({ ...newPlaybook, type: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Tags (comma separated)</label>
                <input
                  type="text"
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  value={newPlaybook.tags}
                  onChange={e => setNewPlaybook({ ...newPlaybook, tags: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 bg-slate-50 dark:bg-slate-700"
                  rows={3}
                  value={newPlaybook.description}
                  onChange={e => setNewPlaybook({ ...newPlaybook, description: e.target.value })}
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
                disabled={!newPlaybook.title.trim()}
              >
                Create
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
                <>
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
                  {/* Chart Placeholder */}
                  <div className="h-64 w-full bg-gradient-to-t from-blue-100 to-blue-300 dark:from-slate-700 dark:to-slate-800 rounded-lg flex items-center justify-center mb-8">
                    <span className="text-slate-400">[Chart Placeholder]</span>
                  </div>
                </>
              )}
              {activeTab === 'Playbook Rules' && (
                <div className="text-slate-600 dark:text-slate-300 whitespace-pre-line">{selectedSetup.checklist.join('\n')}</div>
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