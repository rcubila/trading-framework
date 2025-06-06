import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, tradesApi } from '../lib/supabase';
import { importTradesFromCSV } from '../lib/csv-import';
import { fixGER40Trades } from '../utils/fixTrades';
import type { Database } from '../lib/supabase-types';
import {
  RiAddLine,
  RiFilterLine,
  RiSearchLine,
  RiCalendarLine,
  RiDownloadLine,
  RiUploadLine,
  RiMoreLine,
  RiExchangeDollarLine,
  RiTimeLine,
  RiPieChartLine,
  RiArrowUpLine,
  RiArrowDownLine,
  RiCheckLine,
  RiCloseLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiDeleteBinLine,
  RiUpload2Line,
  RiEdit2Line,
  RiRestartLine,
  RiDeleteBin2Line,
  RiRefreshLine,
  RiDownload2Line,
} from 'react-icons/ri';
import { TradesList } from '../components/TradesList';
import { TradeDetails } from '../components/TradeDetails/TradeDetails';
import type { Trade } from '../types/trade';
import { PageTitle } from '../components/PageTitle/PageTitle';
import { PageHeader } from '../components/PageHeader/PageHeader';
import styles from '../components/Trades/Trades.module.css';

interface MarketConfigType {
  symbolPattern: string;
  symbolPlaceholder: string;
  exchanges: string[];
  requiresLeverage: boolean;
  supportsOptions?: boolean;
  requiresExpiry?: boolean;
  category: string;
}

// Market configuration for validation and field requirements
const marketConfig: Record<string, MarketConfigType> = {
  'Stocks': {
    symbolPattern: '^[A-Z]{1,5}$',
    symbolPlaceholder: 'e.g., AAPL, MSFT, GOOGL',
    exchanges: ['NYSE', 'NASDAQ', 'AMEX'],
    requiresLeverage: false,
    supportsOptions: true,
    category: 'Equities'
  },
  'ETFs': {
    symbolPattern: '^[A-Z]{1,5}$',
    symbolPlaceholder: 'e.g., SPY, QQQ, IWM',
    exchanges: ['NYSE', 'NASDAQ', 'AMEX'],
    requiresLeverage: false,
    supportsOptions: true,
    category: 'Equities'
  },
  'Options': {
    symbolPattern: '^[A-Z]{1,5}\\d{6}[CP]\\d+$',
    symbolPlaceholder: 'e.g., AAPL240119C150',
    exchanges: ['CBOE', 'OCC'],
    requiresLeverage: false,
    requiresExpiry: true,
    category: 'Equities'
  },
  'Futures': {
    symbolPattern: '^[A-Z0-9]{2,10}$',
    symbolPlaceholder: 'e.g., NQ, ES, GER40, .USTEC',
    exchanges: ['CME', 'ICE', 'EUREX'],
    requiresLeverage: true,
    requiresExpiry: true,
    category: 'Futures'
  },
  'Spot Crypto': {
    symbolPattern: '^[A-Z]{2,10}$',
    symbolPlaceholder: 'e.g., BTCUSDT, ETHUSDT',
    exchanges: ['Binance', 'Coinbase', 'Kraken'],
    requiresLeverage: false,
    category: 'Crypto'
  },
  'Crypto Futures': {
    symbolPattern: '^[A-Z]{2,10}$',
    symbolPlaceholder: 'e.g., BTCUSDT, ETHUSDT',
    exchanges: ['Binance Futures', 'FTX', 'Bybit'],
    requiresLeverage: true,
    requiresExpiry: true,
    category: 'Crypto'
  },
  'Spot Forex': {
    symbolPattern: '^[A-Z]{6}$',
    symbolPlaceholder: 'e.g., EURUSD, GBPJPY',
    exchanges: ['FXCM', 'OANDA', 'IG'],
    requiresLeverage: true,
    category: 'Forex'
  },
};

const mockTrades: Trade[] = [
  {
    id: '1',
    market: 'Stocks',
    market_category: 'Equities',
    symbol: 'AAPL',
    type: 'Long',
    status: 'Closed',
    entry_price: 175.50,
    exit_price: 178.25,
    quantity: 100,
    entry_date: '2024-02-15T10:30:00',
    exit_date: '2024-02-15T14:45:00',
    pnl: 275,
    pnl_percentage: 1.57,
    risk: 200,
    reward: 275,
    strategy: 'Breakout',
    tags: ['Tech', 'Momentum'],
    notes: 'Strong market momentum, clear breakout pattern.',
    stop_loss: 173.50,
    take_profit: 180.00,
    commission: 5.00,
    fees: 0.50,
    exchange: 'NASDAQ',
    timeframe: '1h',
    setup_type: 'Bull Flag'
  },
  {
    id: '2',
    market: 'Stocks',
    market_category: 'Equities',
    symbol: 'TSLA',
    type: 'Short',
    status: 'Closed',
    entry_price: 193.25,
    exit_price: 190.50,
    quantity: 50,
    entry_date: '2024-02-14T11:15:00',
    exit_date: '2024-02-14T15:30:00',
    pnl: 137.50,
    pnl_percentage: 1.42,
    risk: 150,
    reward: 137.50,
    strategy: 'Mean Reversion',
    tags: ['Tech', 'Overbought'],
    notes: 'RSI indicated overbought conditions.',
    stop_loss: 191.50,
    take_profit: 195.00,
    commission: 2.50,
    fees: 0.50,
    exchange: 'NASDAQ',
    timeframe: '1d',
    setup_type: 'Bearish Reversal'
  },
  // Add more mock trades as needed
];

// Add helper text for common futures symbols
const getFuturesHelperText = (symbol: string): string | null => {
  const commonFutures: Record<string, string> = {
    'ES': 'E-mini S&P 500',
    'NQ': 'E-mini NASDAQ-100',
    'YM': 'E-mini Dow',
    'RTY': 'E-mini Russell 2000',
    'NAS100': 'NASDAQ-100',
    'GER40': 'German DAX Index',
    'DE40': 'German DAX Index',
    'DAX': 'German DAX Index',
    '.USTEC': 'Nasdaq-100 Index',
    'CL': 'Crude Oil',
    'GC': 'Gold',
    'SI': 'Silver',
    '6E': 'Euro FX',
    'ZB': '30-Year U.S. Treasury Bond',
    'ZN': '10-Year U.S. Treasury Note'
  };
  
  return commonFutures[symbol] || null;
};

// Add this function to automatically detect market type from symbol
const detectMarketFromSymbol = (symbol: string): string => {
  // Check for futures first (including GER40, .USTEC)
  if (getFuturesHelperText(symbol) || 
      symbol === 'GER40' || 
      symbol === '.USTEC' || 
      symbol === 'DAX' || 
      symbol === 'DE40') {
    return 'Futures';
  }
  
  // Check for forex
  if (/^[A-Z]{6}$/.test(symbol)) {
    return 'Spot Forex';
  }
  
  // Check for crypto
  if (/^(BTC|ETH|SOL|DOGE|XRP)/i.test(symbol)) {
    return 'Spot Crypto';
  }
  
  // Check for options
  if (/^[A-Z]{1,5}\d{6}[CP]\d+$/.test(symbol)) {
    return 'Options';
  }
  
  // Default to stocks
  return 'Stocks';
};

const AddTradeModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [tradeData, setTradeData] = useState({
    market: '',
    market_category: '',
    symbol: '',
    type: 'Long',
    entryPrice: '',
    quantity: '',
    entryDate: '',
    strategy: '',
    tags: [],
    notes: '',
    risk: '',
    reward: '',
    leverage: '',
    stopLoss: '',
    takeProfit: '',
    exchange: '',
    timeframe: '',
    setupType: '',
  });

  const handleInputChange = (field: string, value: string | string[]) => {
    if (field === 'symbol' && typeof value === 'string') {
      const detectedMarket = detectMarketFromSymbol(value);
      setTradeData(prev => ({ 
        ...prev, 
        [field]: value,
        market: detectedMarket,
        market_category: marketConfig[detectedMarket]?.category || 'Equities'
      }));
    } else {
      setTradeData(prev => ({ ...prev, [field]: value }));
    }
    validateField(field, value);
  };

  const validateField = (field: string, value: string | string[]) => {
    const newErrors = { ...errors };
    
    switch (field) {
      case 'market':
        if (!value) {
          newErrors.market = 'Market is required';
        } else {
          delete newErrors.market;
        }
        break;
      case 'symbol':
        if (!value) {
          newErrors.symbol = 'Symbol is required';
        } else if (tradeData.market && marketConfig[tradeData.market as keyof typeof marketConfig]) {
          const config = marketConfig[tradeData.market as keyof typeof marketConfig];
          const pattern = new RegExp(config.symbolPattern);
          if (!pattern.test(value as string)) {
            newErrors.symbol = 'Invalid symbol format';
          } else {
            delete newErrors.symbol;
          }
        }
        break;
      case 'entryPrice':
        if (!value || isNaN(Number(value)) || Number(value) <= 0) {
          newErrors.entryPrice = 'Enter a valid price';
        } else {
          delete newErrors.entryPrice;
        }
        break;
      // Add more validation cases as needed
    }

    setErrors(newErrors);
  };

  const getMarketSpecificFields = () => {
    if (!tradeData.market || !marketConfig[tradeData.market as keyof typeof marketConfig]) {
      return null;
    }

    const config = marketConfig[tradeData.market as keyof typeof marketConfig];
    return (
      <>
        {config.requiresLeverage && (
          <div>
            <label className={styles.formLabel}>
              Leverage
            </label>
            <input
              type="number"
              value={tradeData.leverage}
              onChange={(e) => handleInputChange('leverage', e.target.value)}
              placeholder="Enter leverage (e.g., 5x)"
              className={styles.formInput}
            />
          </div>
        )}
        <div>
          <label className={styles.formLabel}>
            Exchange
          </label>
          <select
            value={tradeData.exchange}
            onChange={(e) => handleInputChange('exchange', e.target.value)}
            className={styles.formInput}
          >
            <option value="">Select Exchange</option>
            {config.exchanges.map((exchange) => (
              <option key={exchange} value={exchange}>{exchange}</option>
            ))}
          </select>
        </div>
      </>
    );
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  };

  const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  };

  const getSymbolPlaceholder = () => {
    if (!tradeData.market || !marketConfig[tradeData.market as keyof typeof marketConfig]) {
      return 'Enter symbol';
    }
    return marketConfig[tradeData.market as keyof typeof marketConfig].symbolPlaceholder;
  };

  const getSymbolHelp = () => {
    if (!tradeData.market) return null;
    
    if (tradeData.market === 'Futures' && tradeData.symbol) {
      const helperText = getFuturesHelperText(tradeData.symbol);
      if (helperText) {
        return (
          <div className={styles.helperText}>
            <RiInformationLine />
            {helperText}
          </div>
        );
      }
    }
    return null;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      // Prepare trade data
      const trade: Database['public']['Tables']['trades']['Insert'] = {
        user_id: user.id,
        market: tradeData.market,
        market_category: tradeData.market_category as any,
        symbol: tradeData.symbol,
        type: tradeData.type as 'Long' | 'Short',
        status: 'Open',
        entry_price: parseFloat(tradeData.entryPrice),
        quantity: parseFloat(tradeData.quantity),
        entry_date: tradeData.entryDate || new Date().toISOString(),
        strategy: tradeData.strategy || null,
        tags: tradeData.tags.length > 0 ? tradeData.tags : null,
        notes: tradeData.notes || null,
        risk: tradeData.risk ? parseFloat(tradeData.risk) : null,
        reward: tradeData.reward ? parseFloat(tradeData.reward) : null,
        leverage: tradeData.leverage ? parseFloat(tradeData.leverage) : null,
        stop_loss: tradeData.stopLoss ? parseFloat(tradeData.stopLoss) : null,
        take_profit: tradeData.takeProfit ? parseFloat(tradeData.takeProfit) : null,
        exchange: tradeData.exchange || null,
        timeframe: tradeData.timeframe || null,
        setup_type: tradeData.setupType || null
      };

      // Create the trade
      await tradesApi.createTrade(trade);
      
      // Close modal and reset form
      onClose();
      setTradeData({
        market: '',
        market_category: '',
        symbol: '',
        type: 'Long',
        entryPrice: '',
        quantity: '',
        entryDate: '',
        strategy: '',
        tags: [],
        notes: '',
        risk: '',
        reward: '',
        leverage: '',
        stopLoss: '',
        takeProfit: '',
        exchange: '',
        timeframe: '',
        setupType: '',
      });
      setStep(1);
    } catch (error) {
      console.error('Error creating trade:', error);
      // You might want to show an error message to the user here
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            className={styles.overlay}
          >
            <motion.div
              variants={modalVariants}
              className={styles.modal}
            >
              <div className={styles.flexBetween}>
                <h2 className={styles.stepTitle}>
                  {step === 1 ? 'Trade Details' : step === 2 ? 'Entry Information' : 'Additional Info'}
                </h2>
                <div className={styles.actionButtons}>
                  <button
                    onClick={onClose}
                    className={styles.closeButton}
                  >
                    <RiCloseLine />
                  </button>
                </div>
              </div>

              <div className={styles.mb24}>
                <div className={styles.progressBar}>
                  {[1, 2, 3].map((stepNumber) => (
                    <div
                      key={stepNumber}
                      className={`${styles.progressBarFill} ${stepNumber <= step ? styles.active : ''}`}
                      style={{ width: stepNumber <= step ? '100%' : '0%' }}
                    />
                  ))}
                </div>

                {step === 1 && (
                  <div className={styles.grid}>
                    <div>
                      <label className={styles.formLabel}>Market</label>
                      <select
                        value={tradeData.market}
                        onChange={(e) => {
                          const selected = e.target.value;
                          const category = Object.entries(marketConfig).find(([key]) => key === selected)?.[1]?.category || '';
                          handleInputChange('market', selected);
                          handleInputChange('market_category', category);
                        }}
                        className={`${styles.formSelect} ${errors.market ? styles.error : ''}`}
                      >
                        <option value="">Select Market</option>
                        <optgroup label="Equities">
                          <option value="Stocks">Stocks</option>
                          <option value="ETFs">ETFs</option>
                          <option value="Options">Options</option>
                          <option value="Futures">Futures</option>
                        </optgroup>
                        <optgroup label="Crypto">
                          <option value="Spot Crypto">Spot Crypto</option>
                          <option value="Crypto Futures">Crypto Futures</option>
                          <option value="Crypto Options">Crypto Options</option>
                        </optgroup>
                        <optgroup label="Forex">
                          <option value="Spot Forex">Spot Forex</option>
                          <option value="Forex Futures">Forex Futures</option>
                          <option value="Forex Options">Forex Options</option>
                        </optgroup>
                        <optgroup label="Other">
                          <option value="Commodities">Commodities</option>
                          <option value="Bonds">Bonds</option>
                          <option value="CFDs">CFDs</option>
                        </optgroup>
                      </select>
                      {errors.market && (
                        <div className={styles.errorMessage}>
                          <RiErrorWarningLine />
                          {errors.market}
                        </div>
                      )}
                    </div>

                    {tradeData.market && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <div>
                          <label className={styles.formLabel}>Symbol</label>
                          <div className={styles.relative}>
                            <input
                              type="text"
                              value={tradeData.symbol}
                              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                              placeholder={getSymbolPlaceholder()}
                              className={`${styles.formInput} ${errors.symbol ? styles.error : ''}`}
                            />
                            {marketConfig[tradeData.market as keyof typeof marketConfig] && (
                              <div 
                                className={styles.helperText}
                                title={`Format: ${marketConfig[tradeData.market as keyof typeof marketConfig].symbolPattern}`}
                              >
                                <RiInformationLine />
                              </div>
                            )}
                          </div>
                          {errors.symbol && (
                            <div className={styles.errorMessage}>
                              <RiErrorWarningLine />
                              {errors.symbol}
                            </div>
                          )}
                          {getSymbolHelp()}
                        </div>
                      </motion.div>
                    )}

                    {getMarketSpecificFields()}

                    <div>
                      <label className={styles.formLabel}>Trade Type</label>
                      <div className={styles.marketTypeButtons}>
                        {['Long', 'Short'].map((type) => (
                          <button
                            key={type}
                            onClick={() => handleInputChange('type', type)}
                            className={`${styles.marketTypeButton} ${
                              tradeData.type === type ? styles.marketTypeButtonActive : styles.marketTypeButtonInactive
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div className={styles.grid}>
                    <div>
                      <label className={styles.formLabel}>Entry Price</label>
                      <input
                        type="number"
                        value={tradeData.entryPrice}
                        onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                        placeholder="Enter entry price"
                        className={styles.formInput}
                      />
                    </div>
                    <div>
                      <label className={styles.formLabel}>Quantity</label>
                      <input
                        type="number"
                        value={tradeData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        placeholder="Enter quantity"
                        className={styles.formInput}
                      />
                    </div>
                    <div>
                      <label className={styles.formLabel}>Entry Date & Time</label>
                      <input
                        type="datetime-local"
                        value={tradeData.entryDate}
                        onChange={(e) => handleInputChange('entryDate', e.target.value)}
                        className={styles.formInput}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div className={styles.grid}>
                    <div>
                      <label className={styles.formLabel}>Strategy</label>
                      <select
                        value={tradeData.strategy}
                        onChange={(e) => handleInputChange('strategy', e.target.value)}
                        className={styles.formSelect}
                      >
                        <option value="">Select Strategy</option>
                        <option value="Breakout">Breakout</option>
                        <option value="Mean Reversion">Mean Reversion</option>
                        <option value="Trend Following">Trend Following</option>
                        <option value="Momentum">Momentum</option>
                      </select>
                    </div>
                    <div>
                      <label className={styles.formLabel}>Risk/Reward</label>
                      <div className={styles.grid2Col}>
                        <input
                          type="number"
                          value={tradeData.risk}
                          onChange={(e) => handleInputChange('risk', e.target.value)}
                          placeholder="Risk ($)"
                          className={styles.formInput}
                        />
                        <input
                          type="number"
                          value={tradeData.reward}
                          onChange={(e) => handleInputChange('reward', e.target.value)}
                          placeholder="Reward ($)"
                          className={styles.formInput}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={styles.formLabel}>Notes</label>
                      <textarea
                        value={tradeData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Add any notes about the trade..."
                        className={styles.formTextarea}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.stepNavigation}>
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className={`${styles.button} ${styles.buttonSecondary}`}
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (step < 3) {
                      setStep(step + 1);
                    } else {
                      handleSubmit();
                    }
                  }}
                  disabled={loading}
                  className={`${styles.button} ${styles.buttonPrimary} ${loading ? styles.buttonDisabled : ''}`}
                >
                  {step === 3 ? (loading ? 'Adding...' : 'Add Trade') : 'Next'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const fetchTradesFromAPI = async (page: number, pageSize: number) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // Calculate the range for pagination
    const start = (page - 1) * pageSize;
    const end = start + pageSize - 1;

    // First, get the total count
    const { count } = await supabase
      .from('trades')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    // Then get the page of trades
    const { data: trades, error } = await supabase
      .from('trades')
      .select('*')
      .eq('user_id', user.id)
      .order('entry_date', { ascending: false })
      .range(start, end);

    if (error) throw error;
    
    return trades || [];
  } catch (error) {
    console.error('Error fetching trades:', error);
    throw error;
  }
};

// Add this function to create a test losing trade
const createTestLosingTrade = async () => {
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('No user logged in');

    // Create a losing trade with negative PnL
    const losingTrade: Database['public']['Tables']['trades']['Insert'] = {
      user_id: user.id,
      market: 'Stocks',
      market_category: 'Equities',
      symbol: 'TSLA',
      type: 'Long',
      status: 'Closed',
      entry_price: 200,
      exit_price: 180,
      quantity: 10,
      entry_date: new Date().toISOString(),
      exit_date: new Date().toISOString(),
      pnl: -200, // Negative PnL
      pnl_percentage: -10,
      strategy: 'Test Losing Trade',
      tags: ['test', 'losing']
    };

    // Insert the losing trade
    await tradesApi.createTrade(losingTrade);
    console.log('Created test losing trade with negative PnL');
    return true;
  } catch (error) {
    console.error('Error creating test losing trade:', error);
    return false;
  }
};

export const Trades = () => {
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [showFilters, setFiltersOpen] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [showTradeDetails, setShowTradeDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [importing, setImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [selectedTrades, setSelectedTrades] = useState<Set<string>>(new Set());
  const [showDeleteSelectedConfirm, setShowDeleteSelectedConfirm] = useState(false);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setRefreshTrigger(prev => prev + 1);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleFetchTrades = async (page: number, pageSize: number) => {
    try {
      const trades = await fetchTradesFromAPI(page, pageSize);
      return trades;
    } catch (error) {
      console.error('Error fetching trades:', error);
      throw error;
    }
  };

  const handleDeleteTrade = async (trade: Trade) => {
    setTradeToDelete(trade);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!tradeToDelete) return;

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeToDelete.id);

      if (error) throw error;

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = styles.successMessage;
      successMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>Trade ${tradeToDelete.symbol} deleted successfully!`;
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 2000);

      // Update local state and trigger immediate refresh
      setSelectedTrade(null);
      setShowDeleteConfirm(false);
      setTradeToDelete(null);
      setShowTradeDetails(false);
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
    } catch (error) {
      console.error('Error deleting trade:', error);
      alert('Failed to delete trade');
    }
  };

  const handleDeleteAllTrades = async () => {
    try {
      setIsDeletingAll(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = styles.successMessage;
      successMessage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>All trades deleted successfully!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 2000);

      // Update local state and trigger immediate refresh
      setSelectedTrade(null);
      setShowDeleteAllConfirm(false);
      setShowTradeDetails(false);
      setRefreshTrigger(prev => prev + 1); // Trigger refresh
    } catch (error) {
      console.error('Error deleting all trades:', error);
      alert('Failed to delete trades');
    } finally {
      setIsDeletingAll(false);
    }
  };

  const handleTradeClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setShowTradeDetails(true);
  };

  const handleSelectTrade = (tradeId: string) => {
    setSelectedTrades(prev => {
      const newSelected = new Set(prev);
      if (newSelected.has(tradeId)) {
        newSelected.delete(tradeId);
      } else {
        newSelected.add(tradeId);
      }
      return newSelected;
    });
  };

  const handleSelectAllTrades = (trades: Trade[]) => {
    if (selectedTrades.size === trades.length) {
      setSelectedTrades(new Set());
    } else {
      setSelectedTrades(new Set(trades.map(trade => trade.id)));
    }
  };

  const handleDeleteSelectedTrades = async () => {
    if (selectedTrades.size === 0) return;

    try {
      setIsDeletingSelected(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error } = await supabase
        .from('trades')
        .delete()
        .in('id', Array.from(selectedTrades));

      if (error) throw error;

      // Show success message
      const successMessage = document.createElement('div');
      successMessage.className = styles.successMessage;
      successMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>${selectedTrades.size} trades deleted successfully!`;
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 2000);

      // Update local state and trigger immediate refresh
      setSelectedTrades(new Set());
      setShowDeleteSelectedConfirm(false);
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      console.error('Error deleting selected trades:', error);
      alert('Failed to delete selected trades');
    } finally {
      setIsDeletingSelected(false);
    }
  };

  const handleFixGER40Trades = async () => {
    try {
      const updatedTrades = await fixGER40Trades(15800);
      if (updatedTrades.length > 0) {
        alert(`Fixed ${updatedTrades.length} GER40/DE40/DAX trades in the database.`);
      } else {
        alert('No GER40/DE40/DAX trades needed fixing.');
      }
      setRefreshTrigger(prev => prev + 1);
      return true;
    } catch (error) {
      console.error('Error fixing GER40 trades:', error);
      alert('Error fixing GER40 trades. Check console for details.');
      return false;
    }
  };

  // Add this function to render test and admin buttons
  const renderTestButtons = () => (
    <div style={{ display: 'flex', gap: '12px' }}>
      <button
        onClick={createTestLosingTrade}
        style={{
          padding: '8px 16px',
          backgroundColor: '#ef4444',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <RiAddLine size={16} />
        Add Test Losing Trade
      </button>
      <button
        onClick={handleFixGER40Trades}
        style={{
          padding: '8px 16px',
          backgroundColor: '#0ea5e9',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '14px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <RiExchangeDollarLine size={16} />
        Fix GER40 Trades
      </button>
    </div>
  );

  return (
    <div className={styles.container}>
      <PageHeader
        title="Trades"
        subtitle="Manage and analyze your trading history"
        actions={
          <div className={styles.headerActions}>
            <button
              className={`${styles.button} ${styles.buttonPrimary}`}
              onClick={() => setShowAddTrade(true)}
            >
              <RiAddLine /> Add Trade
            </button>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => setFiltersOpen(true)}
            >
              <RiFilterLine /> Filters
            </button>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={handleRefresh}
            >
              <RiRefreshLine /> Refresh
            </button>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => setShowImportModal(true)}
            >
              <RiUploadLine /> Import
            </button>
            <button
              className={`${styles.button} ${styles.buttonSecondary}`}
              onClick={() => setShowExportModal(true)}
            >
              <RiDownloadLine /> Export
            </button>
          </div>
        }
      />
      <div className="trades-container">
        <TradesList
          fetchTrades={handleFetchTrades}
          initialPageSize={10}
          onTradeClick={handleTradeClick}
          onDeleteClick={handleDeleteTrade}
          selectedTrades={selectedTrades}
          onSelectTrade={handleSelectTrade}
          onSelectAll={handleSelectAllTrades}
          refreshTrigger={refreshTrigger}
        />

        {/* Add Trade Modal */}
        <AddTradeModal isOpen={showAddTrade} onClose={() => setShowAddTrade(false)} />
        
        {/* Trade Details Slide Over */}
        <TradeDetails 
          trade={selectedTrade}
          isOpen={showTradeDetails}
          onClose={() => {
            setShowTradeDetails(false);
            setSelectedTrade(null);
          }}
        />
        
        {/* Admin Buttons */}
        <div style={{
          padding: '16px 24px', 
          display: 'flex', 
          justifyContent: 'flex-end',
          gap: '12px'
        }}>
          {renderTestButtons()}
        </div>
        
        {/* Delete Confirmation Modals */}
        {showDeleteConfirm && tradeToDelete && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3 className={styles.modalTitle}>Delete Trade</h3>
              <div className={styles.mb24}>
                <p className={styles.modalText}>Are you sure you want to delete this trade?</p>
                <div className={`${styles.modalInfoBox} ${styles.mt12}`}>
                  <div className={styles.tradeDetailRow}>
                    <span className={styles.tradeDetailLabel}>Symbol:</span>
                    <span className={styles.tradeDetailValue}>{tradeToDelete?.symbol}</span>
                  </div>
                  <div className={styles.tradeDetailRow}>
                    <span className={styles.tradeDetailLabel}>Type:</span>
                    <span className={tradeToDelete?.type === 'Long' ? styles.tradeDetailValueLong : styles.tradeDetailValueShort}>
                      {tradeToDelete?.type === 'Long' ? <RiArrowUpLine /> : <RiArrowDownLine />}
                      {tradeToDelete?.type}
                    </span>
                  </div>
                  <div className={styles.tradeDetailRow}>
                    <span className={styles.tradeDetailLabel}>P&L:</span>
                    <span className={(tradeToDelete?.pnl || 0) >= 0 ? styles.tradeDetailValueProfit : styles.tradeDetailValueLoss}>
                      ${Math.abs(tradeToDelete?.pnl || 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setTradeToDelete(null);
                  }}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className={`${styles.button} ${styles.buttonDanger}`}
                >
                  <RiDeleteBinLine />
                  Delete Trade
                </button>
              </div>
            </div>
          </div>
        )}

        {showDeleteAllConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3 className={styles.modalTitle}>Delete All Trades</h3>
              <p className={styles.modalText}>
                Are you sure you want to delete all trades? This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowDeleteAllConfirm(false)}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAllTrades}
                  disabled={isDeletingAll}
                  className={`${styles.button} ${styles.buttonDanger} ${isDeletingAll ? styles.buttonDisabled : ''}`}
                >
                  {isDeletingAll ? (
                    <>
                      <div className={styles.spinner} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <RiDeleteBinLine />
                      Delete All Trades
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Selected Confirmation Modal */}
        {showDeleteSelectedConfirm && (
          <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
              <h3 className={styles.modalTitle}>Delete Selected Trades</h3>
              <p className={styles.modalText}>
                Are you sure you want to delete {selectedTrades.size} selected trades? This action cannot be undone.
              </p>
              <div className={styles.modalActions}>
                <button
                  onClick={() => setShowDeleteSelectedConfirm(false)}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteSelectedTrades}
                  disabled={isDeletingSelected}
                  className={`${styles.button} ${styles.buttonDanger} ${isDeletingSelected ? styles.buttonDisabled : ''}`}
                >
                  {isDeletingSelected ? (
                    <>
                      <div className={styles.spinner} />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <RiDeleteBinLine />
                      Delete Selected Trades
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 