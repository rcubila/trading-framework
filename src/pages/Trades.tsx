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
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (error) throw error;
    
    return {
      trades: trades || [],
      totalCount: count || 0
    };
  } catch (error) {
    console.error('Error fetching trades:', error);
    throw error;
  }
};

export const Trades = () => {
  const fetchTrades = async (page: number, pageSize: number) => {
    const { trades } = await fetchTradesFromAPI(page, pageSize);
    return trades;
  };

  return (
    <div style={{ 
      padding: '24px',
      color: 'white',
      background: 'linear-gradient(160deg, rgba(15, 23, 42, 0.3) 0%, rgba(30, 27, 75, 0.3) 100%)',
      minHeight: '100vh',
      backdropFilter: 'blur(10px)'
    }}>
      <div style={{ 
        marginBottom: '24px',
        background: 'rgba(15, 23, 42, 0.4)',
        padding: '20px',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ 
          fontSize: '28px', 
          fontWeight: 'bold',
          background: 'linear-gradient(to right, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent'
        }}>
          Trade History
        </h1>
        <p style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
          View and analyze your trading history
        </p>
      </div>

      <TradesList fetchTrades={fetchTrades} initialPageSize={20} />
    </div>
  );
}; 