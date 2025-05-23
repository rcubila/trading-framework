import { useState, useCallback } from 'react';

declare global {
  interface Window {
    TradingView: any;
  }
}

interface WidgetOptions {
  symbol: string;
  containerId: string;
  theme: 'light' | 'dark';
  height: string;
  timeframe: string;
}

export const useTradingViewWidget = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTradingViewScript = useCallback(() => {
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
  }, []);

  const initWidget = useCallback(async (options: WidgetOptions) => {
    try {
      await loadTradingViewScript();

      const widgetOptions = {
        symbol: options.symbol,
        interval: options.timeframe,
        container_id: options.containerId,
        width: '100%',
        height: options.height,
        autosize: false,
        timezone: "Etc/UTC",
        theme: options.theme,
        style: '1',
        locale: "en",
        toolbar_bg: options.theme === 'dark' ? '#131722' : '#ffffff',
        enable_publishing: false,
        allow_symbol_change: true,
        hide_side_toolbar: false,
        hide_top_toolbar: false,
        save_image: false,
        studies: ["RSI@tv-basicstudies"],
        loading_screen: { backgroundColor: options.theme === 'dark' ? "#131722" : "#ffffff" },
      };

      new window.TradingView.widget(widgetOptions);
      setIsLoading(false);
    } catch (err) {
      console.error('Error initializing widget:', err);
      setError('Failed to initialize chart');
      setIsLoading(false);
    }
  }, [loadTradingViewScript]);

  return {
    isLoading,
    error,
    initWidget
  };
}; 