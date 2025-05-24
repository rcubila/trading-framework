import React, { useState, useEffect } from 'react';
import type { KeyboardEvent } from 'react';
import { RiCloseLine, RiAddLine, RiDeleteBinLine, RiCloseFill } from 'react-icons/ri';
import styles from './StrategyModal.module.css';

interface StrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (strategy: Partial<Strategy>) => void;
  strategy?: Strategy;
}

interface Strategy {
  id: string;
  name: string;
  type: string;
  status: string;
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
    name: strategy?.name || '',
    type: strategy?.type || 'algorithmic',
    status: strategy?.status || 'testing',
    performance: {
      winRate: '0%',
      profitFactor: '0',
      sharpeRatio: '0',
      maxDrawdown: '0%',
    },
    settings: {
      timeframe: strategy?.settings?.timeframe || '1H',
      instruments: strategy?.settings?.instruments || [],
      riskPerTrade: strategy?.settings?.riskPerTrade || '1%',
      maxPositions: strategy?.settings?.maxPositions || 3,
    },
    conditions: {
      entry: strategy?.conditions?.entry || [],
      exit: strategy?.conditions?.exit || [],
      riskManagement: strategy?.conditions?.riskManagement || [],
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
    <div className={styles.modal}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          {strategy ? 'Edit Strategy' : 'Create New Strategy'}
        </h2>
        <button
          onClick={onClose}
          className={styles.closeButton}
        >
          <RiCloseLine size={24} />
        </button>
      </div>

      <div className={styles.content}>
        {/* Basic Information */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Basic Information</h3>
          <div className={styles.formGrid}>
            <div>
              <label className={styles.label}>Strategy Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={styles.input}
                placeholder="Enter strategy name"
              />
            </div>
            <div className={styles.formRow}>
              <div>
                <label className={styles.label}>Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => handleInputChange('type', e.target.value)}
                  className={styles.select}
                >
                  <option value="algorithmic">Algorithmic</option>
                  <option value="discretionary">Discretionary</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className={styles.label}>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className={styles.select}
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
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Settings</h3>
          <div className={styles.formGrid}>
            <div className={styles.formRow}>
              <div>
                <label className={styles.label}>Timeframe</label>
                <select
                  value={formData.settings?.timeframe}
                  onChange={(e) => handleSettingsChange('timeframe', e.target.value)}
                  className={styles.select}
                >
                  {timeframeOptions.map((tf) => (
                    <option key={tf} value={tf}>{tf}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={styles.label}>Risk per Trade</label>
                <input
                  type="text"
                  value={formData.settings?.riskPerTrade}
                  onChange={(e) => handleSettingsChange('riskPerTrade', e.target.value)}
                  className={styles.input}
                  placeholder="e.g., 1%"
                />
              </div>
            </div>
            <div>
              <label className={styles.label}>Instruments</label>
              <div className={styles.instrumentsContainer}>
                <div className={styles.instrumentsGrid}>
                  {formData.settings?.instruments.map((instrument) => (
                    <div
                      key={instrument}
                      className={styles.instrument}
                    >
                      <span>{instrument}</span>
                      <button
                        onClick={() => handleRemoveInstrument(instrument)}
                        className={styles.removeButton}
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
                  className={styles.input}
                  placeholder="Type asset name and press Enter (e.g., DAX40, XAUUSD, SPX500)"
                />
                <div className={styles.popularSuggestions}>
                  {['DAX40', 'XAUUSD', 'SPX500', 'NAS100', 'DJI30'].map((suggestion) => (
                    <button
                      key={suggestion}
                      onClick={() => {
                        if (!formData.settings?.instruments.includes(suggestion)) {
                          handleSettingsChange('instruments', [...(formData.settings?.instruments || []), suggestion]);
                        }
                      }}
                      className={styles.suggestionButton}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
              <p className={styles.helpText}>
                Press Enter to add an instrument. You can add any trading instrument you want.
              </p>
            </div>
          </div>
        </div>

        {/* Conditions */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Conditions</h3>
          {(['entry', 'exit', 'riskManagement'] as const).map((type) => (
            <div key={type} className={styles.conditionSection}>
              <div className={styles.conditionHeader}>
                <label className={styles.conditionLabel}>
                  {type.replace(/([A-Z])/g, ' $1')}
                </label>
                <button
                  onClick={() => addCondition(type)}
                  className={styles.addButton}
                >
                  <RiAddLine /> Add
                </button>
              </div>
              {formData.conditions?.[type].map((condition, index) => (
                <div key={index} className={styles.conditionItem}>
                  <input
                    type="text"
                    value={condition}
                    onChange={(e) => handleConditionChange(type, index, e.target.value)}
                    className={styles.conditionInput}
                    placeholder={`Add ${type} condition`}
                  />
                  <button
                    onClick={() => removeCondition(type, index)}
                    className={styles.removeButton}
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
      <div className={styles.actions}>
        <button
          onClick={onClose}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <button
          onClick={() => onSave(formData)}
          className={styles.saveButton}
        >
          {strategy ? 'Save Changes' : 'Create Strategy'}
        </button>
      </div>
    </div>
  );
}; 