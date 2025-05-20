import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { AnimatedElement } from '../components/AnimatedElement';
import { AnimatedList } from '../components/AnimatedList';
import {
  RiAddLine,
  RiEditLine,
  RiDeleteBinLine,
  RiSearchLine,
  RiFilterLine,
  RiImageAddLine,
  RiVideoAddLine,
  RiLinkM,
  RiPriceTag3Line,
  RiBarChart2Line,
  RiLineChartLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiCalendarLine,
  RiStarLine,
  RiFileTextLine,
  RiImageLine,
  RiVideoLine,
  RiAttachmentLine,
  RiSortAsc,
  RiSortDesc,
} from 'react-icons/ri';

interface Trade {
  id: string;
  date: string;
  symbol: string;
  type: 'long' | 'short';
  entry: number;
  exit: number;
  pnl: number;
  r: number; // R multiple
  notes: string;
  tags: string[];
}

interface Media {
  id: string;
  type: 'image' | 'video' | 'chart';
  url: string;
  description: string;
  annotations?: {
    x: number;
    y: number;
    text: string;
  }[];
}

interface SetupPerformance {
  totalTrades: number;
  winRate: number;
  averageR: number;
  profitFactor: number;
  expectancy: number;
  largestWin: number;
  largestLoss: number;
  averageWin: number;
  averageLoss: number;
  monthlyStats: {
    month: string;
    trades: number;
    winRate: number;
    pnl: number;
  }[];
}

interface PlaybookSetup {
  id: string;
  title: string;
  description: string;
  type: string; // breakout, pullback, trend continuation, etc.
  tags: string[];
  media: Media[];
  notes: string;
  checklist: string[];
  conditions: {
    timeOfDay?: string[];
    marketCondition?: string[];
    volume?: string;
    priceAction?: string[];
  };
  trades: Trade[];
  performance: SetupPerformance;
  createdAt: string;
  updatedAt: string;
}

interface FilterState {
  search: string;
  types: string[];
  tags: string[];
  winRate: number | null;
  minTrades: number | null;
  sortBy: 'winRate' | 'totalTrades' | 'expectancy' | 'updated';
  sortOrder: 'asc' | 'desc';
}

export const PlayBook: React.FC = () => {
  const [setups, setSetups] = useState<PlaybookSetup[]>([]);
  const [selectedSetup, setSelectedSetup] = useState<PlaybookSetup | null>(null);
  const [isAddingSetup, setIsAddingSetup] = useState(false);
  const [editingSetup, setEditingSetup] = useState<PlaybookSetup | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    types: [],
    tags: [],
    winRate: null,
    minTrades: null,
    sortBy: 'updated',
    sortOrder: 'desc'
  });
  const [view, setView] = useState<'grid' | 'list'>('grid');

  const handleAddSetup = () => {
    setIsAddingSetup(true);
    setEditingSetup({
      id: Date.now().toString(),
      title: '',
      description: '',
      type: '',
      tags: [],
      media: [],
      notes: '',
      checklist: [],
      conditions: {},
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
        monthlyStats: []
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  };

  const handleMediaUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: Media['type']) => {
    if (event.target.files && event.target.files[0] && editingSetup) {
      const file = event.target.files[0];
      // Here you would typically upload to your storage service
      const mockUrl = URL.createObjectURL(file);
      
      const newMedia: Media = {
        id: Date.now().toString(),
        type,
        url: mockUrl,
        description: '',
        annotations: []
      };
      
      setEditingSetup({
        ...editingSetup,
        media: [...editingSetup.media, newMedia]
      });
    }
  };

  const handleSaveSetup = (setup: PlaybookSetup) => {
    if (editingSetup) {
      setSetups(setups.map(s => s.id === setup.id ? setup : s));
    } else {
      setSetups([...setups, setup]);
    }
    setIsAddingSetup(false);
    setEditingSetup(null);
  };

  const filteredSetups = setups.filter(setup => {
    if (filters.search && !setup.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    if (filters.types.length && !filters.types.includes(setup.type)) return false;
    if (filters.tags.length && !filters.tags.some(tag => setup.tags.includes(tag))) return false;
    if (filters.winRate && setup.performance.winRate < filters.winRate) return false;
    if (filters.minTrades && setup.performance.totalTrades < filters.minTrades) return false;
    return true;
  }).sort((a, b) => {
    const getValue = (setup: PlaybookSetup) => {
      switch (filters.sortBy) {
        case 'winRate': return setup.performance.winRate;
        case 'totalTrades': return setup.performance.totalTrades;
        case 'expectancy': return setup.performance.expectancy;
        case 'updated': return new Date(setup.updatedAt).getTime();
        default: return 0;
      }
    };
    
    const aValue = getValue(a);
    const bValue = getValue(b);
    return filters.sortOrder === 'desc' ? bValue - aValue : aValue - bValue;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <PageHeader
        title="Trading Playbook"
        subtitle="Document and analyze your trading setups"
      />

      <div className="max-w-[calc(100vw-200px)] mx-auto px-4 py-6">
        {/* Search and Filters */}
        <div className="mb-8 bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex-1 min-w-[300px]">
              <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search setups..."
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg pl-10 pr-4 py-2"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
                className="p-2 bg-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700/70"
              >
                {view === 'grid' ? <RiBarChart2Line /> : <RiLineChartLine />}
              </button>
              <button
                onClick={handleAddSetup}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
              >
                <RiAddLine />
                New Setup
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4">
            <select
              className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-1.5"
              value={filters.sortBy}
              onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as FilterState['sortBy'] })}
            >
              <option value="updated">Last Updated</option>
              <option value="winRate">Win Rate</option>
              <option value="totalTrades">Total Trades</option>
              <option value="expectancy">Expectancy</option>
            </select>
            
            <button
              onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
              className="p-2 bg-slate-700/50 rounded-lg text-slate-300 hover:bg-slate-700/70"
            >
              {filters.sortOrder === 'asc' ? <RiSortAsc /> : <RiSortDesc />}
            </button>
          </div>
        </div>

        {/* Setups Grid/List */}
        <div className={view === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredSetups.map(setup => (
            <div
              key={setup.id}
              className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden cursor-pointer hover:border-slate-600 transition-colors"
              onClick={() => setSelectedSetup(setup)}
            >
              {/* Preview Image */}
              {setup.media[0] && (
                <div className="aspect-video relative">
                  <img
                    src={setup.media[0].url}
                    alt={setup.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                </div>
              )}

              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">{setup.title}</h3>
                    <p className="text-sm text-slate-400">{setup.type}</p>
                  </div>
                  <div className="flex gap-2">
                    {setup.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs bg-slate-700/50 rounded-full text-slate-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Win Rate</span>
                    <div className="text-green-400 font-medium">
                      {setup.performance.winRate}%
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Avg R</span>
                    <div className="text-blue-400 font-medium">
                      {setup.performance.averageR.toFixed(2)}R
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-400">Total Trades</span>
                    <div>{setup.performance.totalTrades}</div>
                  </div>
                  <div>
                    <span className="text-slate-400">Expectancy</span>
                    <div>{setup.performance.expectancy.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Setup Detail Modal */}
      {selectedSetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-slate-800 border-b border-slate-700/50 p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">{selectedSetup.title}</h2>
                  <p className="text-slate-400">{selectedSetup.type}</p>
                </div>
                <button
                  onClick={() => setSelectedSetup(null)}
                  className="text-slate-400 hover:text-slate-300"
                >
                  <RiDeleteBinLine />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              {/* Media Gallery */}
              {selectedSetup.media.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Setup Examples</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedSetup.media.map(media => (
                      <div key={media.id} className="relative aspect-video rounded-lg overflow-hidden">
                        {media.type === 'video' ? (
                          <video
                            src={media.url}
                            controls
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={media.url}
                            alt={media.description}
                            className="w-full h-full object-cover"
                          />
                        )}
                        {media.description && (
                          <div className="absolute bottom-0 inset-x-0 bg-black/50 p-2">
                            <p className="text-sm">{media.description}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Description and Notes */}
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <p className="text-slate-300 whitespace-pre-wrap">{selectedSetup.description}</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Trading Rules</h3>
                  <ul className="space-y-2">
                    {selectedSetup.checklist.map((item, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <RiCheckboxCircleLine className="mt-1 text-green-400" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Performance Stats */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Performance</h3>
                <div className="grid grid-cols-4 gap-6">
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-slate-400 text-sm">Win Rate</div>
                    <div className="text-2xl font-semibold text-green-400">
                      {selectedSetup.performance.winRate}%
                    </div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-slate-400 text-sm">Average R</div>
                    <div className="text-2xl font-semibold text-blue-400">
                      {selectedSetup.performance.averageR.toFixed(2)}R
                    </div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-slate-400 text-sm">Profit Factor</div>
                    <div className="text-2xl font-semibold">
                      {selectedSetup.performance.profitFactor.toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-slate-700/30 rounded-lg p-4">
                    <div className="text-slate-400 text-sm">Expectancy</div>
                    <div className="text-2xl font-semibold">
                      {selectedSetup.performance.expectancy.toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Monthly Stats */}
                <div className="mt-6">
                  <h4 className="font-medium mb-3">Monthly Performance</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedSetup.performance.monthlyStats.map((stat, index) => (
                      <div key={index} className="bg-slate-700/30 rounded-lg p-4">
                        <div className="text-sm text-slate-400">{stat.month}</div>
                        <div className="mt-1">
                          <div className="flex justify-between text-sm">
                            <span>Win Rate:</span>
                            <span className="text-green-400">{stat.winRate}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Trades:</span>
                            <span>{stat.trades}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>P&L:</span>
                            <span className={stat.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {stat.pnl > 0 ? '+' : ''}{stat.pnl}R
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Trades */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Recent Trades</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-slate-400">
                        <th className="pb-3">Date</th>
                        <th className="pb-3">Symbol</th>
                        <th className="pb-3">Type</th>
                        <th className="pb-3">Entry</th>
                        <th className="pb-3">Exit</th>
                        <th className="pb-3">R</th>
                        <th className="pb-3">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedSetup.trades.slice(0, 5).map(trade => (
                        <tr key={trade.id} className="border-t border-slate-700/50">
                          <td className="py-3">{new Date(trade.date).toLocaleDateString()}</td>
                          <td className="py-3">{trade.symbol}</td>
                          <td className="py-3">
                            <span className={trade.type === 'long' ? 'text-green-400' : 'text-red-400'}>
                              {trade.type}
                            </span>
                          </td>
                          <td className="py-3">{trade.entry}</td>
                          <td className="py-3">{trade.exit}</td>
                          <td className="py-3">
                            <span className={trade.r >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {trade.r > 0 ? '+' : ''}{trade.r.toFixed(2)}R
                            </span>
                          </td>
                          <td className="py-3 text-slate-400">{trade.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Setup Editor Modal */}
      {isAddingSetup && editingSetup && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editingSetup.id ? 'Edit Setup' : 'New Setup'}
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input
                  type="text"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2"
                  value={editingSetup.title}
                  onChange={(e) => setEditingSetup({...editingSetup, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Setup Type</label>
                <select
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2"
                  value={editingSetup.type}
                  onChange={(e) => setEditingSetup({...editingSetup, type: e.target.value})}
                >
                  <option value="">Select type...</option>
                  <option value="breakout">Breakout</option>
                  <option value="pullback">Pullback</option>
                  <option value="trend-continuation">Trend Continuation</option>
                  <option value="reversal">Reversal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2"
                  rows={4}
                  value={editingSetup.description}
                  onChange={(e) => setEditingSetup({...editingSetup, description: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Tags</label>
                <input
                  type="text"
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2"
                  placeholder="Add tags separated by commas"
                  value={editingSetup.tags.join(', ')}
                  onChange={(e) => setEditingSetup({
                    ...editingSetup,
                    tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                  })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Media</label>
                <div className="space-y-2">
                  {editingSetup.media.map(media => (
                    <div key={media.id} className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center gap-2">
                        {media.type === 'video' ? <RiVideoLine /> : <RiImageLine />}
                        <span className="text-sm">{media.description || 'Untitled'}</span>
                      </div>
                      <button
                        onClick={() => setEditingSetup({
                          ...editingSetup,
                          media: editingSetup.media.filter(m => m.id !== media.id)
                        })}
                        className="text-slate-400 hover:text-red-400"
                      >
                        <RiDeleteBinLine />
                      </button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50">
                      <RiImageAddLine />
                      <span>Add Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleMediaUpload(e, 'image')}
                      />
                    </label>
                    <label className="flex-1 flex items-center gap-2 px-3 py-2 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50">
                      <RiVideoAddLine />
                      <span>Add Video</span>
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={(e) => handleMediaUpload(e, 'video')}
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Trading Rules</label>
                <textarea
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-2"
                  rows={4}
                  placeholder="Add trading rules, one per line"
                  value={editingSetup.checklist.join('\n')}
                  onChange={(e) => setEditingSetup({
                    ...editingSetup,
                    checklist: e.target.value.split('\n').filter(rule => rule.trim())
                  })}
                />
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => {
                    setIsAddingSetup(false);
                    setEditingSetup(null);
                  }}
                  className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700/70"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveSetup(editingSetup)}
                  className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30"
                >
                  Save Setup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlayBook; 