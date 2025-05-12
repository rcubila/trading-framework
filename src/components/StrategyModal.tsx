import { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { RiCloseLine, RiAddLine, RiDeleteBinLine, RiCloseFill } from 'react-icons/ri';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (strategy: Partial<Strategy>) => void;
  strategy?: Strategy;
}

interface Strategy {
  id: string;
  name: string;
  type: 'algorithmic' | 'discretionary' | 'hybrid';
  status: 'active' | 'paused' | 'testing';
  performance: {
    winRate: string;
    profitFactor: string;
    sharpeRatio: string;
    maxDrawdown: string;
  };
  settings: {
    timeframe: string;
    instruments: string[];
    riskPerTrade: string;
    maxPositions: number;
  };
  conditions: {
    entry: string[];
    exit: string[];
    riskManagement: string[];
  };
}

const timeframeOptions = ['1m', '5m', '15m', '30m', '1H', '4H', '1D', '1W'];

export const StrategyModal = ({ isOpen, onClose, onSave, strategy }: StrategyModalProps) => {
  const [formData, setFormData] = useState<Strategy>({
    id: '',
    name: '',
    type: 'hybrid',
    status: 'testing',
    performance: {
      winRate: '0%',
      profitFactor: '0',
      sharpeRatio: '0',
      maxDrawdown: '0%',
    },
    settings: {
      timeframe: '1H',
      instruments: [],
      riskPerTrade: '1%',
      maxPositions: 3,
    },
    conditions: {
      entry: [''],
      exit: [''],
      riskManagement: [''],
    },
  });
  const [newInstrument, setNewInstrument] = useState('');

  useEffect(() => {
    if (strategy) {
      setFormData(strategy);
    }
  }, [strategy]);

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSettingsChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      settings: {
        ...prev.settings,
        [field]: value,
      },
    }));
  };

  const handleConditionChange = (type: 'entry' | 'exit' | 'riskManagement', index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [type]: prev.conditions?.[type].map((item, i) => i === index ? value : item),
      },
    }));
  };

  const addCondition = (type: 'entry' | 'exit' | 'riskManagement') => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [type]: [...prev.conditions?.[type], ''],
      },
    }));
  };

  const removeCondition = (type: 'entry' | 'exit' | 'riskManagement', index: number) => {
    setFormData((prev) => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [type]: prev.conditions?.[type].filter((_, i) => i !== index),
      },
    }));
  };

  const handleAddInstrument = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newInstrument.trim()) {
      const instrument = newInstrument.trim().toUpperCase();
      if (!formData.settings?.instruments.includes(instrument)) {
        handleSettingsChange('instruments', [...(formData.settings?.instruments || []), instrument]);
      }
      setNewInstrument('');
    }
  };

  const handleRemoveInstrument = (instrumentToRemove: string) => {
    handleSettingsChange(
      'instruments',
      formData.settings?.instruments.filter(instrument => instrument !== instrumentToRemove)
    );
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 50,
    }}>
      <div style={{
        backgroundColor: '#1e293b',
        borderRadius: '12px',
        padding: '24px',
        width: '90%',
        maxWidth: '800px',
        maxHeight: '90vh',
        overflow: 'auto',
        color: 'white',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>
            {strategy ? 'Edit Strategy' : 'Create New Strategy'}
          </h2>
          <button
            onClick={onClose}
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Basic Information */}
          <div>
            <h3 style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '12px' }}>Basic Information</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#94a3b8' }}>Strategy Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    backgroundColor: '#0f172a',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '6px',
                    color: 'white',
                  }}
                  placeholder="Enter strategy name"
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#94a3b8' }}>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleInputChange('type', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: 'white',
                    }}
                  >
                    <option value="algorithmic">Algorithmic</option>
                    <option value="discretionary">Discretionary</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#94a3b8' }}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: 'white',
                    }}
                  >
                    <option value="testing">Testing</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div>
            <h3 style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '12px' }}>Settings</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#94a3b8' }}>Timeframe</label>
                  <select
                    value={formData.settings?.timeframe}
                    onChange={(e) => handleSettingsChange('timeframe', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: 'white',
                    }}
                  >
                    {timeframeOptions.map((tf) => (
                      <option key={tf} value={tf}>{tf}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', color: '#94a3b8' }}>Risk per Trade</label>
                  <input
                    type="text"
                    value={formData.settings?.riskPerTrade}
                    onChange={(e) => handleSettingsChange('riskPerTrade', e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(255, 255, 255, 0.1)',
                      borderRadius: '6px',
                      color: 'white',
                    }}
                    placeholder="e.g., 1%"
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', color: '#94a3b8' }}>Instruments</label>
                <div style={{ 
                  backgroundColor: '#0f172a',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '6px',
                  padding: '8px',
                  minHeight: '100px',
                }}>
                  <div style={{ 
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '8px',
                    marginBottom: '8px'
                  }}>
                    {formData.settings?.instruments.map((instrument) => (
                      <div
                        key={instrument}
                        style={{
                          backgroundColor: 'rgba(37, 99, 235, 0.1)',
                          border: '1px solid rgba(37, 99, 235, 0.2)',
                          borderRadius: '4px',
                          padding: '4px 8px',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '14px',
                        }}
                      >
                        <span>{instrument}</span>
                        <button
                          onClick={() => handleRemoveInstrument(instrument)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            padding: '0',
                            display: 'flex',
                            alignItems: 'center',
                            color: '#94a3b8',
                            cursor: 'pointer',
                          }}
                        >
                          <RiCloseFill size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={newInstrument}
                    onChange={(e) => setNewInstrument(e.target.value)}
                    onKeyDown={handleAddInstrument}
                    placeholder="Type asset name and press Enter (e.g., DAX40, XAUUSD, SPX500)"
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'white',
                      outline: 'none',
                    }}
                  />
                  <div style={{ 
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#64748b',
                  }}>
                    Popular: 
                    {['DAX40', 'XAUUSD', 'SPX500', 'NAS100', 'DJI30'].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => {
                          if (!formData.settings?.instruments.includes(suggestion)) {
                            handleSettingsChange('instruments', [...(formData.settings?.instruments || []), suggestion]);
                          }
                        }}
                        style={{
                          backgroundColor: 'transparent',
                          border: 'none',
                          color: '#2563eb',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          marginLeft: '4px',
                          fontSize: '12px',
                        }}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
                <p style={{ 
                  fontSize: '12px', 
                  color: '#64748b',
                  marginTop: '4px' 
                }}>
                  Press Enter to add an instrument. You can add any trading instrument you want.
                </p>
              </div>
            </div>
          </div>

          {/* Conditions */}
          <div>
            <h3 style={{ fontSize: '16px', color: '#94a3b8', marginBottom: '12px' }}>Conditions</h3>
            {(['entry', 'exit', 'riskManagement'] as const).map((type) => (
              <div key={type} style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <label style={{ color: '#94a3b8', textTransform: 'capitalize' }}>{type.replace(/([A-Z])/g, ' $1')}</label>
                  <button
                    onClick={() => addCondition(type)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#2563eb',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <RiAddLine /> Add
                  </button>
                </div>
                {formData.conditions?.[type].map((condition, index) => (
                  <div key={index} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                    <input
                      type="text"
                      value={condition}
                      onChange={(e) => handleConditionChange(type, index, e.target.value)}
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        backgroundColor: '#0f172a',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '6px',
                        color: 'white',
                      }}
                      placeholder={`Add ${type} condition`}
                    />
                    <button
                      onClick={() => removeCondition(type, index)}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: 'none',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '6px',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <RiDeleteBinLine />
                    </button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              backgroundColor: 'transparent',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(formData)}
            style={{
              padding: '10px 20px',
              borderRadius: '6px',
              backgroundColor: '#2563eb',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
            }}
          >
            {strategy ? 'Save Changes' : 'Create Strategy'}
          </button>
        </div>
      </div>
    </div>
  );
}; 