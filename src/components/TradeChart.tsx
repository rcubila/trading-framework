import { useEffect, useRef, useState } from 'react';
import type { Trade } from '../types/trade';
import styles from './TradeChart.module.css';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface TradeChartProps {
  trade: Trade;
  theme?: 'light' | 'dark';
}

const getFormattedSymbol = (trade: Trade): string => {
  if (!trade || !trade.symbol) {
    console.error('Invalid trade object:', trade);
    return 'NASDAQ:AAPL'; // Default fallback symbol
  }

  // Special cases for indices and commodities
  if (trade.symbol === '.USTEC') {
    return 'NASDAQ:NDX';
  }
  if (trade.symbol === 'GER40' || trade.symbol === 'DE40') {
    return 'OANDA:DE30EUR';  // OANDA's DAX feed
  }
  if (trade.symbol === 'US30') {
    return 'DJ:DJI';  // Dow Jones Industrial Average
  }
  if (trade.symbol === 'XAUUSD' || trade.symbol === 'GOLD') {
    return 'OANDA:XAUUSD';  // OANDA's Gold feed
  }

  // Handle futures
  if (trade.market === 'Futures') {
    const futuresMap: Record<string, string> = {
      'NQ': 'CME_MINI:NQ1!',
      'ES': 'CME_MINI:ES1!',
      'YM': 'CME_MINI:YM1!',
      'RTY': 'CME_MINI:RTY1!',
      'CL': 'NYMEX:CL1!',
      'GC': 'COMEX:GC1!',
      'SI': 'COMEX:SI1!',
      '6E': 'CME:6E1!',
    };
    return futuresMap[trade.symbol] || `CME:${trade.symbol}1!`;
  }

  // Handle stocks based on exchange
  if (trade.market === 'Stocks' || trade.market === 'ETFs') {
    const exchange = trade.exchange?.toUpperCase() || 'NASDAQ';
    return `${exchange}:${trade.symbol}`;
  }

  // Handle crypto
  if (trade.market === 'Spot Crypto' || trade.market === 'Crypto Futures') {
    const symbol = trade.symbol.replace('/', '').toUpperCase();
    return `BINANCE:${symbol}USDT`;
  }

  // Handle forex
  if (trade.market === 'Spot Forex') {
    const symbol = trade.symbol.replace('/', '').toUpperCase();
    return `FX:${symbol}`;
  }

  return `NASDAQ:${trade.symbol}`;
};

export const TradeChart = ({ trade, theme = 'dark' }: TradeChartProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [containerHeight, setContainerHeight] = useState('800px');

  useEffect(() => {
    // Update container height based on window size
    const updateHeight = () => {
      const vh = window.innerHeight;
      const newHeight = Math.max(Math.floor(vh * 0.8), 800); // 80% of viewport height or minimum 800px
      setContainerHeight(`${newHeight}px`);
    };

    // Initial height calculation
    updateHeight();

    // Listen for resize events
    window.addEventListener('resize', updateHeight);
    return () => window.removeEventListener('resize', updateHeight);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const symbol = getFormattedSymbol(trade);
    const containerId = `tradingview_${trade.id}`;
    
    // Ensure container exists and is empty
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';
    containerRef.current.id = containerId;

    const loadTradingViewScript = () => {
      return new Promise<void>((resolve, reject) => {
        if (window.TradingView) {
          resolve();
          return;
        }

        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.type = 'text/javascript';
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load TradingView widget'));
        document.head.appendChild(script);
      });
    };

    const initWidget = () => {
      if (!isMounted || !containerRef.current) return;
      
      try {
        const widgetOptions = {
          symbol: symbol,
          interval: trade.timeframe || 'D',
          container_id: containerId,
          width: '100%',
          height: containerHeight,
          autosize: false, // Disable autosize to use our dimensions
          timezone: "Etc/UTC",
          theme: theme,
          style: '1',
          locale: "en",
          toolbar_bg: theme === 'dark' ? '#131722' : '#ffffff',
          enable_publishing: false,
          allow_symbol_change: true,
          hide_side_toolbar: false,
          hide_top_toolbar: false,
          save_image: false,
          studies: ["RSI@tv-basicstudies"],
          loading_screen: { backgroundColor: theme === 'dark' ? "#131722" : "#ffffff" },
        };

        console.log('Initializing widget with options:', widgetOptions);
        new window.TradingView.widget(widgetOptions);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing widget:', err);
        setError('Failed to initialize chart');
        setIsLoading(false);
      }
    };

    loadTradingViewScript()
      .then(initWidget)
      .catch((err) => {
        console.error('Error loading TradingView:', err);
        if (isMounted) {
          setError('Failed to load chart');
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [trade.id, trade.symbol, trade.timeframe, theme, containerHeight]);

  return (
    <div 
      className={styles.container}
      data-theme={theme}
      style={{ '--container-height': containerHeight } as React.CSSProperties}
    >
      <div 
        ref={containerRef}
        className={styles.chartContainer}
      />
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner} />
            <div>Loading chart...</div>
          </div>
        </div>
      )}
      {error && (
        <div className={styles.errorOverlay}>
          {error}
        </div>
      )}
    </div>
  );
}; 