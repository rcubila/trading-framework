import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  RiMedalLine,
  RiAddLine,
  RiCheckLine,
  RiCloseLine,
  RiCalendarLine,
  RiBarChartLine,
  RiFileTextLine,
  RiStarLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiInformationLine,
} from 'react-icons/ri';
import type { TradingRule, DisciplineEntry, DisciplineStats } from '../types/discipline';
import { supabase } from '../lib/supabaseClient';
import { AddRuleModal } from '../components/AddRuleModal';
import AddEntryModal from '../components/AddEntryModal';

const ruleCategories = [
  'Entry',
  'Exit',
  'Risk Management',
  'Psychology',
  'Process'
] as const;

const importanceLevels = [
  'Critical',
  'Important',
  'Good Practice'
] as const;

export const DisciplineTracker = () => {
  const [activeTab, setActiveTab] = useState<'rules' | 'tracker' | 'stats'>('rules');
  const [rules, setRules] = useState<TradingRule[]>([]);
  const [entries, setEntries] = useState<DisciplineEntry[]>([]);
  const [stats, setStats] = useState<DisciplineStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddRule, setShowAddRule] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);

  useEffect(() => {
    fetchRules();
    fetchEntries();
  }, []);

  const fetchRules = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('trading_rules')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setRules(data || []);
    } catch (error) {
      console.error('Error fetching rules:', error);
    }
  };

  const fetchEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('discipline_tracker')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setEntries(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (entries: DisciplineEntry[]) => {
    if (!entries.length) {
      setStats(null);
      return;
    }

    const totalRating = entries.reduce((sum, entry) => sum + entry.rating, 0);
    const averageRating = totalRating / entries.length;

    // Count rule occurrences
    const ruleBreakCount: Record<string, number> = {};
    const ruleFollowCount: Record<string, number> = {};

    entries.forEach(entry => {
      entry.rules_broken.forEach(rule => {
        ruleBreakCount[rule] = (ruleBreakCount[rule] || 0) + 1;
      });
      entry.rules_followed.forEach(rule => {
        ruleFollowCount[rule] = (ruleFollowCount[rule] || 0) + 1;
      });
    });

    // Calculate weekly trend
    const weeklyTrend = calculateWeeklyTrend(entries);

    // Calculate compliance rate
    const totalRules = entries.reduce(
      (sum, entry) => sum + entry.rules_followed.length + entry.rules_broken.length,
      0
    );
    const totalFollowed = entries.reduce(
      (sum, entry) => sum + entry.rules_followed.length,
      0
    );
    const complianceRate = (totalFollowed / totalRules) * 100;

    setStats({
      averageRating,
      totalEntries: entries.length,
      mostBrokenRules: Object.entries(ruleBreakCount)
        .map(([rule, count]) => ({ rule, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      mostFollowedRules: Object.entries(ruleFollowCount)
        .map(([rule, count]) => ({ rule, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5),
      weeklyTrend,
      complianceRate
    });
  };

  const calculateWeeklyTrend = (entries: DisciplineEntry[]) => {
    const weeklyData: Record<string, { sum: number; count: number }> = {};

    entries.forEach(entry => {
      const date = new Date(entry.date);
      const week = getWeekNumber(date);
      if (!weeklyData[week]) {
        weeklyData[week] = { sum: 0, count: 0 };
      }
      weeklyData[week].sum += entry.rating;
      weeklyData[week].count += 1;
    });

    return Object.entries(weeklyData)
      .map(([week, data]) => ({
        week,
        averageRating: data.sum / data.count
      }))
      .sort((a, b) => a.week.localeCompare(b.week))
      .slice(-8); // Last 8 weeks
  };

  const getWeekNumber = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const weekNum = Math.ceil(date.getDate() / 7);
    return `${year}-${month + 1}-W${weekNum}`;
  };

  return (
    <div style={{
      padding: '5px',
      color: 'white',
      minHeight: '100vh',
      background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 27, 75, 0.3) 100%)',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2px',
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '2px 5px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <div>
          <h1 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            marginBottom: '2px',
            background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Discipline Tracker
          </h1>
          <p style={{
            color: 'rgba(255, 255, 255, 0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '13px'
          }}>
            <RiMedalLine />
            <span>Track your trading discipline and improve consistency</span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: '5px' }}>
          <button
            onClick={() => setShowAddRule(true)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 8px rgba(37, 99, 235, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.2)';
            }}
          >
            <RiAddLine />
            Add Rule
          </button>
          <button
            onClick={() => setShowAddEntry(true)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 6px rgba(37, 99, 235, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 8px rgba(37, 99, 235, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(37, 99, 235, 0.2)';
            }}
          >
            <RiAddLine />
            New Entry
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '5px',
        marginBottom: '5px',
        padding: '5px',
        background: 'rgba(15, 23, 42, 0.4)',
        borderRadius: '12px',
        width: 'fit-content'
      }}>
        {[
          { id: 'rules', label: 'Trading Rules', icon: RiFileTextLine },
          { id: 'tracker', label: 'Daily Tracker', icon: RiCalendarLine },
          { id: 'stats', label: 'Statistics', icon: RiBarChartLine }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: 'none',
              background: activeTab === tab.id ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
              color: activeTab === tab.id ? 'white' : 'rgba(255, 255, 255, 0.6)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
          >
            <tab.icon />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div style={{
        display: 'grid',
        gap: '5px',
        gridTemplateColumns: activeTab === 'stats' ? '2fr 1fr' : '1fr'
      }}>
        {/* Main Content */}
        <div style={{
          background: 'rgba(15, 23, 42, 0.4)',
          borderRadius: '16px',
          padding: '5px',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              Loading...
            </div>
          ) : (
            <>
              {activeTab === 'rules' && (
                <div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '20px'
                  }}>
                    <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Trading Rules</h2>
                    <button
                      onClick={() => setShowAddRule(true)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        background: 'rgba(255, 255, 255, 0.05)',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        cursor: 'pointer',
                      }}
                    >
                      <RiAddLine />
                      Add Rule
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {rules.map(rule => (
                      <motion.div
                        key={rule.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          marginBottom: '8px'
                        }}>
                          <div>
                            <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '4px' }}>
                              {rule.name}
                            </h3>
                            <div style={{
                              display: 'flex',
                              gap: '8px',
                              fontSize: '12px',
                              color: 'rgba(255, 255, 255, 0.6)'
                            }}>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: 'rgba(59, 130, 246, 0.1)',
                                color: '#60a5fa'
                              }}>
                                {rule.category}
                              </span>
                              <span style={{
                                padding: '2px 8px',
                                borderRadius: '4px',
                                background: rule.importance === 'Critical' ? 'rgba(239, 68, 68, 0.1)' :
                                  rule.importance === 'Important' ? 'rgba(245, 158, 11, 0.1)' :
                                    'rgba(34, 197, 94, 0.1)',
                                color: rule.importance === 'Critical' ? '#ef4444' :
                                  rule.importance === 'Important' ? '#f59e0b' :
                                    '#22c55e'
                              }}>
                                {rule.importance}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p style={{
                          fontSize: '14px',
                          color: 'rgba(255, 255, 255, 0.8)',
                          lineHeight: '1.5'
                        }}>
                          {rule.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'tracker' && (
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                    Daily Discipline Tracker
                  </h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {entries.map(entry => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                          padding: '16px',
                          borderRadius: '12px',
                          background: 'rgba(255, 255, 255, 0.03)',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: '12px'
                        }}>
                          <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
                            {new Date(entry.date).toLocaleDateString('en-US', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </div>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#f59e0b'
                          }}>
                            {Array.from({ length: 5 }).map((_, i) => (
                              <RiStarLine
                                key={i}
                                style={{
                                  color: i < entry.rating ? '#f59e0b' : 'rgba(245, 158, 11, 0.2)'
                                }}
                              />
                            ))}
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: '#22c55e',
                              marginBottom: '8px'
                            }}>
                              <RiCheckLine />
                              <span>Rules Followed</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {entry.rules_followed.map(rule => (
                                <span
                                  key={rule}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(34, 197, 94, 0.1)',
                                    fontSize: '12px'
                                  }}
                                >
                                  {rule}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              color: '#ef4444',
                              marginBottom: '8px'
                            }}>
                              <RiCloseLine />
                              <span>Rules Broken</span>
                            </div>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                              {entry.rules_broken.map(rule => (
                                <span
                                  key={rule}
                                  style={{
                                    padding: '4px 8px',
                                    borderRadius: '6px',
                                    background: 'rgba(239, 68, 68, 0.1)',
                                    fontSize: '12px'
                                  }}
                                >
                                  {rule}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {entry.notes && (
                          <div style={{
                            marginTop: '12px',
                            padding: '12px',
                            borderRadius: '8px',
                            background: 'rgba(255, 255, 255, 0.02)',
                            fontSize: '14px',
                            color: 'rgba(255, 255, 255, 0.8)',
                            lineHeight: '1.5'
                          }}>
                            <div style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              color: 'rgba(255, 255, 255, 0.6)',
                              marginBottom: '4px'
                            }}>
                              <RiInformationLine />
                              <span>Notes</span>
                            </div>
                            {entry.notes}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'stats' && stats && (
                <div>
                  <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px' }}>
                    Performance Statistics
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}>
                      <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Most Followed Rules</h3>
                      {stats.mostFollowedRules.map(({ rule, count }) => (
                        <div
                          key={rule}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 0',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>{rule}</span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(34, 197, 94, 0.1)',
                            color: '#22c55e',
                            fontSize: '12px'
                          }}>
                            {count} times
                          </span>
                        </div>
                      ))}
                    </div>

                    <div style={{
                      padding: '20px',
                      borderRadius: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                    }}>
                      <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Most Broken Rules</h3>
                      {stats.mostBrokenRules.map(({ rule, count }) => (
                        <div
                          key={rule}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px 0',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
                          }}
                        >
                          <span style={{ fontSize: '14px' }}>{rule}</span>
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            background: 'rgba(239, 68, 68, 0.1)',
                            color: '#ef4444',
                            fontSize: '12px'
                          }}>
                            {count} times
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{
                    marginTop: '20px',
                    padding: '20px',
                    borderRadius: '12px',
                    background: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                  }}>
                    <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>Weekly Rating Trend</h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '12px',
                      height: '200px'
                    }}>
                      {stats.weeklyTrend.map(({ week, averageRating }) => (
                        <div
                          key={week}
                          style={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '8px'
                          }}
                        >
                          <div style={{
                            height: `${averageRating * 20}%`,
                            width: '100%',
                            background: 'linear-gradient(180deg, #3b82f6 0%, #8b5cf6 100%)',
                            borderRadius: '4px',
                            transition: 'height 0.3s ease'
                          }} />
                          <div style={{
                            fontSize: '12px',
                            color: 'rgba(255, 255, 255, 0.6)',
                            transform: 'rotate(-45deg)',
                            transformOrigin: 'center',
                            whiteSpace: 'nowrap'
                          }}>
                            {week}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Side Panel for Stats */}
        {activeTab === 'stats' && stats && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'rgba(15, 23, 42, 0.4)',
                border: '1px solid rgba(255, 255, 255, 0.05)',
              }}
            >
              <h3 style={{ fontSize: '18px', marginBottom: '20px' }}>Quick Stats</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '4px'
                  }}>
                    Average Rating
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: stats.averageRating >= 4 ? '#22c55e' :
                      stats.averageRating >= 3 ? '#f59e0b' : '#ef4444'
                  }}>
                    {stats.averageRating.toFixed(1)} / 5
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '4px'
                  }}>
                    Compliance Rate
                  </div>
                  <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: stats.complianceRate >= 80 ? '#22c55e' :
                      stats.complianceRate >= 60 ? '#f59e0b' : '#ef4444'
                  }}>
                    {stats.complianceRate.toFixed(1)}%
                  </div>
                </div>

                <div>
                  <div style={{
                    fontSize: '14px',
                    color: 'rgba(255, 255, 255, 0.6)',
                    marginBottom: '4px'
                  }}>
                    Total Entries
                  </div>
                  <div style={{ fontSize: '24px', fontWeight: 'bold' }}>
                    {stats.totalEntries}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* Modals */}
      <AddRuleModal
        isOpen={showAddRule}
        onClose={() => setShowAddRule(false)}
        onRuleAdded={(rule) => {
          setRules([...rules, rule]);
          setShowAddRule(false);
        }}
      />
      <AddEntryModal
        isOpen={showAddEntry}
        onClose={() => setShowAddEntry(false)}
        onEntryAdded={() => {
          fetchEntries();
          setShowAddEntry(false);
        }}
      />
    </div>
  );
}; 