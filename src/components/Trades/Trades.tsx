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
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<string | null>(null);

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
    setTradeToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = () => {
    if (tradeToDelete) {
      setTrades(trades.filter(trade => trade.id !== tradeToDelete));
      setShowDeleteConfirm(false);
      setTradeToDelete(null);
    }
  };

  const calculateProgress = () => {
    if (trades.length === 0) return 0;
    const closedTrades = trades.filter(trade => trade.status === 'closed').length;
    return (closedTrades / trades.length) * 100;
  };

  return (
    <div className={styles.trades}>
      <div className={styles.trades__header}>
        <h2 className={styles.trades__title}>Trades</h2>
        <div className={styles.trades__actions}>
          <button className={styles.trades__button} onClick={handleAddTrade}>
            <FiPlus className={styles.trades__button-icon} />
            Add Trade
          </button>
        </div>
      </div>

      <div className={styles.trades__progress}>
        <div
          className={styles.trades__progress-fill}
          style={{ width: `${calculateProgress()}%` }}
        />
      </div>

      {trades.map(trade => (
        <div key={trade.id} className={styles.trades__card}>
          <div className={styles.trades__card-header}>
            <h3 className={styles.trades__card-title}>{trade.symbol}</h3>
            <button
              className={styles.trades__button}
              onClick={() => handleDeleteTrade(trade.id)}
            >
              <FiTrash2 className={styles.trades__button-icon} />
            </button>
          </div>
          <div className={styles.trades__card-details}>
            <div className={styles.trades__card-detail}>
              <span className={styles.trades__card-detail-label}>Entry:</span> ${trade.entry}
            </div>
            <div className={styles.trades__card-detail}>
              <span className={styles.trades__card-detail-label}>Stop Loss:</span> ${trade.stopLoss}
            </div>
            <div className={styles.trades__card-detail}>
              <span className={styles.trades__card-detail-label}>Take Profit:</span> ${trade.takeProfit}
            </div>
            <div className={styles.trades__card-detail}>
              <span className={styles.trades__card-detail-label}>Risk/Reward:</span> {trade.risk.toFixed(2)}/{trade.reward.toFixed(2)}
            </div>
          </div>
        </div>
      ))}

      {showDeleteConfirm && (
        <div className={styles.trades__modal}>
          <div className={styles.trades__modal-content}>
            <h3 className={styles.trades__modal-title}>Delete Trade</h3>
            <p className={styles.trades__modal-text}>
              Are you sure you want to delete this trade? This action cannot be undone.
            </p>
            <div className={styles.trades__modal-actions}>
              <button
                className={`${styles.trades__button} ${styles.trades__button--secondary}`}
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className={`${styles.trades__button} ${styles.trades__button--danger}`}
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className={styles.trades__modal}>
          <div className={styles.trades__modal-content}>
            <div className={styles.trades__modal-header}>
              <h3 className={styles.trades__modal-title}>Add New Trade</h3>
              <button 
                className={styles.trades__button} 
                onClick={handleCloseModal}
                aria-label="Close modal"
              >
                <FiX className={styles.trades__button-icon} />
              </button>
            </div>

            <div className={styles.trades__modal-body}>
              {currentStep === 1 ? (
                <div className={styles.trades__form-group}>
                  <label className={styles.trades__form-label}>
                    Symbol
                    <input
                      type="text"
                      value={formData.symbol}
                      onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
                      className={errors.symbol ? styles.trades__form-input--error : styles.trades__form-input}
                      placeholder="Enter symbol"
                    />
                    {errors.symbol && (
                      <span className={styles.trades__form-error}>{errors.symbol}</span>
                    )}
                  </label>

                  <label className={styles.trades__form-label}>
                    Entry Price
                    <input
                      type="number"
                      value={formData.entry}
                      onChange={(e) => setFormData({ ...formData, entry: e.target.value })}
                      className={errors.entry ? styles.trades__form-input--error : styles.trades__form-input}
                      placeholder="Enter entry price"
                    />
                    {errors.entry && (
                      <span className={styles.trades__form-error}>{errors.entry}</span>
                    )}
                  </label>
                </div>
              ) : (
                <div className={styles.trades__form-group}>
                  <label className={styles.trades__form-label}>
                    Stop Loss
                    <input
                      type="number"
                      value={formData.stopLoss}
                      onChange={(e) => setFormData({ ...formData, stopLoss: e.target.value })}
                      className={errors.stopLoss ? styles.trades__form-input--error : styles.trades__form-input}
                      placeholder="Enter stop loss"
                    />
                    {errors.stopLoss && (
                      <span className={styles.trades__form-error}>{errors.stopLoss}</span>
                    )}
                  </label>

                  <label className={styles.trades__form-label}>
                    Take Profit
                    <input
                      type="number"
                      value={formData.takeProfit}
                      onChange={(e) => setFormData({ ...formData, takeProfit: e.target.value })}
                      className={errors.takeProfit ? styles.trades__form-input--error : styles.trades__form-input}
                      placeholder="Enter take profit"
                    />
                    {errors.takeProfit && (
                      <span className={styles.trades__form-error}>{errors.takeProfit}</span>
                    )}
                  </label>
                </div>
              )}
            </div>

            <div className={styles.trades__modal-actions}>
              {currentStep === 1 ? (
                <button
                  className={`${styles.trades__button} ${styles.trades__button--primary}`}
                  onClick={handleNextStep}
                >
                  Next
                </button>
              ) : (
                <>
                  <button
                    className={`${styles.trades__button} ${styles.trades__button--secondary}`}
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </button>
                  <button
                    className={`${styles.trades__button} ${styles.trades__button--primary}`}
                    onClick={handleSubmit}
                  >
                    Add Trade
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trades; 