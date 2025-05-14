import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, tradesApi } from '../lib/supabase';
import { importTradesFromCSV } from '../lib/csv-import';
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
} from 'react-icons/ri';
import { TradesList } from '../components/TradesList';
import type { Trade } from '../types/trade';

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
    symbolPlaceholder: 'e.g., NQ, ES, NAS100, CL',
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
    'CL': 'Crude Oil',
    'GC': 'Gold',
    'SI': 'Silver',
    '6E': 'Euro FX',
    'ZB': '30-Year U.S. Treasury Bond',
    'ZN': '10-Year U.S. Treasury Note'
  };
  
  return commonFutures[symbol] || null;
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
    setTradeData(prev => ({ ...prev, [field]: value }));
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
            <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
              Leverage
            </label>
            <input
              type="number"
              value={tradeData.leverage}
              onChange={(e) => handleInputChange('leverage', e.target.value)}
              placeholder="Enter leverage (e.g., 5x)"
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
                fontSize: '14px',
              }}
            />
          </div>
        )}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
            Exchange
          </label>
          <select
            value={tradeData.exchange}
            onChange={(e) => handleInputChange('exchange', e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '12px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: 'white',
              fontSize: '14px',
            }}
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
          <div style={{ 
            fontSize: '12px', 
            color: 'rgba(255, 255, 255, 0.5)', 
            marginTop: '4px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px' 
          }}>
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
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(5px)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <motion.div
              variants={modalVariants}
              style={{
                background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
                borderRadius: '20px',
                padding: '32px',
                width: '90%',
                maxWidth: '600px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                maxHeight: '90vh',
                overflowY: 'auto',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 'bold',
                  background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  {step === 1 ? 'Trade Details' : step === 2 ? 'Entry Information' : 'Additional Info'}
                </h2>
                <button
                  onClick={onClose}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                  }}
                >
                  <RiCloseLine />
                </button>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px' }}>
                  {[1, 2, 3].map((stepNumber) => (
                    <div
                      key={stepNumber}
                      style={{
                        flex: 1,
                        height: '4px',
                        background: stepNumber <= step ? 'linear-gradient(to right, #60a5fa, #a78bfa)' : 'rgba(255, 255, 255, 0.1)',
                        marginRight: stepNumber < 3 ? '8px' : 0,
                        borderRadius: '2px',
                        transition: 'background 0.3s ease',
                      }}
                    />
                  ))}
                </div>

                {step === 1 && (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Market
                      </label>
                      <select
                        value={tradeData.market}
                        onChange={(e) => {
                          const selected = e.target.value;
                          const category = Object.entries(marketConfig).find(([key]) => key === selected)?.[1]?.category || '';
                          handleInputChange('market', selected);
                          handleInputChange('market_category', category);
                        }}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: `1px solid ${errors.market ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                          color: 'white',
                          fontSize: '14px',
                        }}
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
                        <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                          <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
                            Symbol
                          </label>
                          <div style={{ position: 'relative' }}>
                            <input
                              type="text"
                              value={tradeData.symbol}
                              onChange={(e) => handleInputChange('symbol', e.target.value.toUpperCase())}
                              placeholder={getSymbolPlaceholder()}
                              style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '12px',
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                border: `1px solid ${errors.symbol ? '#ef4444' : 'rgba(255, 255, 255, 0.1)'}`,
                                color: 'white',
                                fontSize: '14px',
                              }}
                            />
                            {marketConfig[tradeData.market as keyof typeof marketConfig] && (
                              <div 
                                style={{ 
                                  position: 'absolute', 
                                  right: '12px', 
                                  top: '50%', 
                                  transform: 'translateY(-50%)',
                                  color: 'rgba(255, 255, 255, 0.5)',
                                  cursor: 'help',
                                }}
                                title={`Format: ${marketConfig[tradeData.market as keyof typeof marketConfig].symbolPattern}`}
                              >
                                <RiInformationLine />
                              </div>
                            )}
                          </div>
                          {errors.symbol && (
                            <div style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
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
                      <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Trade Type
                      </label>
                      <div style={{ display: 'flex', gap: '12px' }}>
                        {['Long', 'Short'].map((type) => (
                          <button
                            key={type}
                            onClick={() => handleInputChange('type', type)}
                            style={{
                              flex: 1,
                              padding: '12px',
                              borderRadius: '12px',
                              backgroundColor: tradeData.type === type ? 'rgba(96, 165, 250, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                              border: `1px solid ${tradeData.type === type ? '#60a5fa' : 'rgba(255, 255, 255, 0.1)'}`,
                              color: tradeData.type === type ? '#60a5fa' : 'white',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Entry Price
                      </label>
                      <input
                        type="number"
                        value={tradeData.entryPrice}
                        onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                        placeholder="Enter entry price"
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={tradeData.quantity}
                        onChange={(e) => handleInputChange('quantity', e.target.value)}
                        placeholder="Enter quantity"
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Entry Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        value={tradeData.entryDate}
                        onChange={(e) => handleInputChange('entryDate', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: '14px',
                        }}
                      />
                    </div>
                  </div>
                )}

                {step === 3 && (
                  <div style={{ display: 'grid', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Strategy
                      </label>
                      <select
                        value={tradeData.strategy}
                        onChange={(e) => handleInputChange('strategy', e.target.value)}
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: '14px',
                        }}
                      >
                        <option value="">Select Strategy</option>
                        <option value="Breakout">Breakout</option>
                        <option value="Mean Reversion">Mean Reversion</option>
                        <option value="Trend Following">Trend Following</option>
                        <option value="Momentum">Momentum</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Risk/Reward
                      </label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <input
                          type="number"
                          value={tradeData.risk}
                          onChange={(e) => handleInputChange('risk', e.target.value)}
                          placeholder="Risk ($)"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: '14px',
                          }}
                        />
                        <input
                          type="number"
                          value={tradeData.reward}
                          onChange={(e) => handleInputChange('reward', e.target.value)}
                          placeholder="Reward ($)"
                          style={{
                            width: '100%',
                            padding: '12px',
                            borderRadius: '12px',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            color: 'white',
                            fontSize: '14px',
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ display: 'block', marginBottom: '8px', color: 'rgba(255, 255, 255, 0.7)' }}>
                        Notes
                      </label>
                      <textarea
                        value={tradeData.notes}
                        onChange={(e) => handleInputChange('notes', e.target.value)}
                        placeholder="Add any notes about the trade..."
                        style={{
                          width: '100%',
                          padding: '12px',
                          borderRadius: '12px',
                          backgroundColor: 'rgba(255, 255, 255, 0.05)',
                          border: '1px solid rgba(255, 255, 255, 0.1)',
                          color: 'white',
                          fontSize: '14px',
                          minHeight: '100px',
                          resize: 'vertical',
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    style={{
                      padding: '12px 24px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      border: 'none',
                      color: 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
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
                  style={{
                    padding: '12px 24px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                    border: 'none',
                    color: 'white',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    marginLeft: 'auto',
                    transition: 'all 0.2s ease',
                    opacity: loading ? 0.7 : 1,
                  }}
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

export const Trades = () => {
  const [showAddTrade, setShowAddTrade] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'open' | 'closed'>('all');
  const [importing, setImporting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [tradeToDelete, setTradeToDelete] = useState<Trade | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Remove the initial fetch since it's now handled by TradesList
  }, []);

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
      successMessage.style.position = 'fixed';
      successMessage.style.top = '20px';
      successMessage.style.right = '20px';
      successMessage.style.padding = '16px 24px';
      successMessage.style.background = 'rgba(34, 197, 94, 0.9)';
      successMessage.style.color = 'white';
      successMessage.style.borderRadius = '8px';
      successMessage.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      successMessage.style.zIndex = '9999';
      successMessage.style.display = 'flex';
      successMessage.style.alignItems = 'center';
      successMessage.style.gap = '8px';
      successMessage.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>Trade ${tradeToDelete.symbol} deleted successfully!`;
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 2000);

      // Update local state
      setSelectedTrade(null);
      setShowDeleteConfirm(false);
      setTradeToDelete(null);
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
      successMessage.style.position = 'fixed';
      successMessage.style.top = '20px';
      successMessage.style.right = '20px';
      successMessage.style.padding = '16px 24px';
      successMessage.style.background = 'rgba(34, 197, 94, 0.9)';
      successMessage.style.color = 'white';
      successMessage.style.borderRadius = '8px';
      successMessage.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
      successMessage.style.zIndex = '9999';
      successMessage.style.display = 'flex';
      successMessage.style.alignItems = 'center';
      successMessage.style.gap = '8px';
      successMessage.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>All trades deleted successfully!';
      document.body.appendChild(successMessage);

      setTimeout(() => {
        document.body.removeChild(successMessage);
      }, 2000);

      // Update local state
      setSelectedTrade(null);
      setShowDeleteAllConfirm(false);
    } catch (error) {
      console.error('Error deleting all trades:', error);
      alert('Failed to delete trades');
    } finally {
      setIsDeletingAll(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      minHeight: '100%'
    }}>
      <div style={{ 
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '2px 5px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '2px'
      }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '2px'
        }}>
          Trade History
        </h1>
        <p style={{ 
          color: 'rgba(255, 255, 255, 0.6)',
          fontSize: '13px'
        }}>
          View and analyze your trading history
        </p>
      </div>

      {/* Trades List Container */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.4) 100%)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Actions Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          background: 'rgba(15, 23, 42, 0.2)',
        }}>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => setShowAddTrade(true)}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <RiAddLine />
              Add Trade
            </button>
            <button
              onClick={() => window.location.href = '/trading-framework/import'}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              <RiUploadLine />
              Import Trades
            </button>
            {selectedTrade && (
              <button
                onClick={() => {
                  setTradeToDelete(selectedTrade);
                  setShowDeleteConfirm(true);
                }}
                style={{
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  color: '#ef4444',
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                <RiDeleteBinLine />
                Delete Trade
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <RiSearchLine style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'rgba(255, 255, 255, 0.3)'
              }} />
              <input
                type="text"
                placeholder="Search trades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '8px 12px 8px 36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  width: '200px',
                }}
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as 'all' | 'open' | 'closed')}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                color: 'white',
              }}
            >
              <option value="all">All Status</option>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Table Header */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 1fr 80px',
          padding: '16px 24px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
          gap: '16px',
          color: 'rgba(255, 255, 255, 0.6)',
          fontWeight: '500',
          fontSize: '14px',
          background: 'rgba(15, 23, 42, 0.1)',
        }}>
          <div>Market/Symbol</div>
          <div>Date/Time</div>
          <div>Type</div>
          <div>Entry/Exit</div>
          <div>P&L</div>
          <div>Status</div>
          <div></div>
        </div>

        {/* TradesList Component */}
        <div style={{ flex: 1 }}>
          <TradesList 
            fetchTrades={handleFetchTrades}
            initialPageSize={20}
          />
        </div>
      </div>
      
      {/* Add Trade Modal */}
      <AddTradeModal isOpen={showAddTrade} onClose={() => setShowAddTrade(false)} />
      
      {/* Delete Confirmation Modals */}
      {showDeleteConfirm && tradeToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderRadius: '20px',
            padding: '32px',
            width: '90%',
            maxWidth: '400px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
              Delete Trade
            </h3>
            <div style={{ marginBottom: '24px' }}>
              <p style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: '12px' }}>
                Are you sure you want to delete this trade?
              </p>
              <div style={{
                padding: '12px',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
                marginTop: '12px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Symbol:</span>
                  <span style={{ fontWeight: '600' }}>{tradeToDelete.symbol}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Type:</span>
                  <span style={{ 
                    color: tradeToDelete.type === 'Long' ? '#22c55e' : '#ef4444',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    {tradeToDelete.type === 'Long' ? <RiArrowUpLine /> : <RiArrowDownLine />}
                    {tradeToDelete.type}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>P&L:</span>
                  <span style={{ 
                    color: (tradeToDelete.pnl || 0) >= 0 ? '#22c55e' : '#ef4444',
                    fontWeight: '600'
                  }}>
                    ${Math.abs(tradeToDelete.pnl || 0)}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setTradeToDelete(null);
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                }}
              >
                <RiDeleteBinLine />
                Delete Trade
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteAllConfirm && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(5px)',
          zIndex: 50,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            background: 'linear-gradient(145deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.95) 100%)',
            borderRadius: '20px',
            padding: '32px',
            width: '90%',
            maxWidth: '400px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          }}>
            <h3 style={{ marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>
              Delete All Trades
            </h3>
            <p style={{ marginBottom: '24px', color: 'rgba(255, 255, 255, 0.8)' }}>
              Are you sure you want to delete all trades? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowDeleteAllConfirm(false)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAllTrades}
                disabled={isDeletingAll}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  color: '#ef4444',
                  cursor: isDeletingAll ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  opacity: isDeletingAll ? 0.7 : 1,
                }}
              >
                {isDeletingAll ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(239, 68, 68, 0.3)',
                      borderTop: '2px solid #ef4444',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite',
                    }} />
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
    </div>
  );
}; 