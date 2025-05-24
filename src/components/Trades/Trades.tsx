import React, { useState } from 'react';
import { FiPlus, FiTrash2, FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import styles from './Trades.module.css';

interface Trade {
  id: string;
  symbol: string;
  entry: number;
  stopLoss: number;
  takeProfit: number;
  risk: number;
  reward: number;
  status: 'open' | 'closed';
}

const Trades: React.FC = () => {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    symbol: '',
    entry: '',
    stopLoss: '',
    takeProfit: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleAddTrade = () => {
    setIsModalOpen(true);
    setCurrentStep(1);
    setFormData({
      symbol: '',
      entry: '',
      stopLoss: '',
      takeProfit: '',
    });
    setErrors({});
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentStep(1);
  };

  const validateStep = () => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 1) {
      if (!formData.symbol) {
        newErrors.symbol = 'Symbol is required';
      }
      if (!formData.entry) {
        newErrors.entry = 'Entry price is required';
      } else if (isNaN(Number(formData.entry))) {
        newErrors.entry = 'Entry price must be a number';
      }
    } else if (currentStep === 2) {
      if (!formData.stopLoss) {
        newErrors.stopLoss = 'Stop loss is required';
      } else if (isNaN(Number(formData.stopLoss))) {
        newErrors.stopLoss = 'Stop loss must be a number';
      }
      if (!formData.takeProfit) {
        newErrors.takeProfit = 'Take profit is required';
      } else if (isNaN(Number(formData.takeProfit))) {
        newErrors.takeProfit = 'Take profit must be a number';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(2);
    }
  };

  const handleSubmit = () => {
    if (validateStep()) {
      const newTrade: Trade = {
        id: Date.now().toString(),
        symbol: formData.symbol,
        entry: Number(formData.entry),
        stopLoss: Number(formData.stopLoss),
        takeProfit: Number(formData.takeProfit),
        risk: Math.abs(Number(formData.entry) - Number(formData.stopLoss)),
        reward: Math.abs(Number(formData.takeProfit) - Number(formData.entry)),
        status: 'open',
      };

      setTrades([...trades, newTrade]);
      handleCloseModal();
    }
  };

  const handleDeleteTrade = (id: string) => {
    setTrades(trades.filter(trade => trade.id !== id));
  };

  const calculateProgress = () => {
    if (trades.length === 0) return 0;
    const closedTrades = trades.filter(trade => trade.status === 'closed').length;
    return (closedTrades / trades.length) * 100;
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Trades</h2>
        <div className={styles.actions}>
          <button className={styles.button} onClick={handleAddTrade}>
            <FiPlus className={styles.buttonIcon} />
            Add Trade
          </button>
        </div>
      </div>

      <div className={styles.progressBar}>
        <div
          className={styles.progressFill}
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>

      {trades.map(trade => (
        <div key={trade.id} className={styles.tradeCard}>
          <div className={styles.tradeHeader}>
            <h3>{trade.symbol}</h3>
            <button
              className={styles.button}
              onClick={() => handleDeleteTrade(trade.id)}
            >
              <FiTrash2 className={styles.buttonIcon} />
            </button>
          </div>
          <div className={styles.tradeDetails}>
            <div>
              <span>Entry:</span> ${trade.entry}
            </div>
            <div>
              <span>Stop Loss:</span> ${trade.stopLoss}
            </div>
            <div>
              <span>Take Profit:</span> ${trade.takeProfit}
            </div>
            <div>
              <span>Risk/Reward:</span> {trade.risk.toFixed(2)}/{trade.reward.toFixed(2)}
            </div>
          </div>
        </div>
      ))}

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Add New Trade</h3>
              <button className={styles.closeButton} onClick={handleCloseModal}>
                <FiX />
              </button>
            </div>

            <div className={styles.stepIndicator}>
              <div className={styles.step}>
                <div className={`${styles.stepNumber} ${currentStep === 1 ? styles.stepActive : ''}`}>
                  1
                </div>
                <span className={styles.stepLabel}>Trade Details</span>
              </div>
              <div className={styles.stepLine} />
              <div className={styles.step}>
                <div className={`${styles.stepNumber} ${currentStep === 2 ? styles.stepActive : ''}`}>
                  2
                </div>
                <span className={styles.stepLabel}>Risk Management</span>
              </div>
            </div>

            <form className={styles.form}>
              {currentStep === 1 ? (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Symbol</label>
                    <input
                      type="text"
                      className={styles.input}
                      value={formData.symbol}
                      onChange={e => setFormData({ ...formData, symbol: e.target.value })}
                      placeholder="e.g., BTC/USD"
                    />
                    {errors.symbol && <div className={styles.error}>{errors.symbol}</div>}
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Entry Price</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.entry}
                      onChange={e => setFormData({ ...formData, entry: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                    />
                    {errors.entry && <div className={styles.error}>{errors.entry}</div>}
                  </div>

                  <button
                    type="button"
                    className={styles.submitButton}
                    onClick={handleNextStep}
                  >
                    Next Step
                  </button>
                </>
              ) : (
                <>
                  <div className={styles.formGroup}>
                    <label className={styles.label}>Stop Loss</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.stopLoss}
                      onChange={e => setFormData({ ...formData, stopLoss: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                    />
                    {errors.stopLoss && <div className={styles.error}>{errors.stopLoss}</div>}
                    <div className={styles.helpText}>
                      Enter the price at which you'll exit if the trade moves against you
                    </div>
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label}>Take Profit</label>
                    <input
                      type="number"
                      className={styles.input}
                      value={formData.takeProfit}
                      onChange={e => setFormData({ ...formData, takeProfit: e.target.value })}
                      placeholder="0.00"
                      step="0.01"
                    />
                    {errors.takeProfit && <div className={styles.error}>{errors.takeProfit}</div>}
                    <div className={styles.helpText}>
                      Enter the price at which you'll take your profits
                    </div>
                  </div>

                  <div className={styles.testButtons}>
                    <button
                      type="button"
                      className={styles.testButton}
                      onClick={() => setCurrentStep(1)}
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      className={styles.submitButton}
                      onClick={handleSubmit}
                    >
                      Add Trade
                    </button>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trades; 