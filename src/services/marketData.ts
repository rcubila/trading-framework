import axios from 'axios';

export interface OHLCV {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeframeType = '5' | '15' | '60' | 'D';

export interface MarketDataConfig {
  apiKey: string;
  defaultTimeframe: TimeframeType;
}

interface TradeData {
  type: string;
  data: Array<{
    p: number;  // Price
    s: string;  // Symbol
    t: number;  // Timestamp
    v: number;  // Volume
  }>;
}

class MarketDataService {
  private baseUrl = 'https://finnhub.io/api/v1';
  private ws: WebSocket | null = null;
  private subscriptions: Set<string> = new Set();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 5000; // 5 seconds
  private isConnecting = false;
  
  constructor(private config: MarketDataConfig) {}

  // Connect to WebSocket for real-time data
  async connectWebSocket(): Promise<void> {
    if (this.isConnecting) {
      console.log('WebSocket connection attempt already in progress');
      return;
    }

    if (this.ws?.readyState === WebSocket.OPEN) {
      console.log('WebSocket already connected');
      return;
    }

    this.isConnecting = true;

    try {
      await this.closeExistingConnection();
      
      console.log('Attempting to connect to Finnhub WebSocket...');
      this.ws = new WebSocket(`wss://ws.finnhub.io?token=${this.config.apiKey}`);

      this.ws.addEventListener('open', this.handleOpen);
      this.ws.addEventListener('message', this.handleMessage);
      this.ws.addEventListener('error', this.handleError);
      this.ws.addEventListener('close', this.handleClose);
    } catch (error) {
      console.error('Error creating WebSocket connection:', error);
      this.handleReconnect();
    } finally {
      this.isConnecting = false;
    }
  }

  private async closeExistingConnection(): Promise<void> {
    if (this.ws) {
      try {
        this.ws.removeEventListener('open', this.handleOpen);
        this.ws.removeEventListener('message', this.handleMessage);
        this.ws.removeEventListener('error', this.handleError);
        this.ws.removeEventListener('close', this.handleClose);
        
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.close();
        }
      } catch (error) {
        console.error('Error closing existing connection:', error);
      }
      this.ws = null;
    }
  }

  private handleOpen = () => {
    console.log('Connected to Finnhub WebSocket');
    this.reconnectAttempts = 0; // Reset reconnect attempts on successful connection
    
    // Resubscribe to all symbols
    this.subscriptions.forEach(symbol => {
      this.subscribeToSymbol(symbol);
    });
  };

  private handleMessage = (event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data) as TradeData;
      if (data.type === 'trade') {
        this.handleTradeData(data);
      }
    } catch (error) {
      console.error('Error processing WebSocket message:', error);
    }
  };

  private handleError = (event: Event) => {
    console.error('WebSocket error:', event);
    // Don't attempt to reconnect here - let the close handler handle it
  };

  private handleClose = (event: CloseEvent) => {
    console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
    this.handleReconnect();
  };

  private handleReconnect = () => {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached. Please check your API key and connection.');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
    console.log(`Attempting to reconnect in ${delay/1000} seconds... (Attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    
    setTimeout(() => {
      this.connectWebSocket();
    }, delay);
  };

  // Subscribe to real-time updates for a symbol
  subscribeToSymbol(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'subscribe', symbol }));
      this.subscriptions.add(symbol);
    } else {
      console.log(`WebSocket not ready, adding ${symbol} to subscription queue`);
      this.subscriptions.add(symbol);
      // Attempt to connect if not already connected
      if (!this.isConnecting && (!this.ws || this.ws.readyState === WebSocket.CLOSED)) {
        this.connectWebSocket();
      }
    }
  }

  // Unsubscribe from real-time updates
  unsubscribeFromSymbol(symbol: string) {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type: 'unsubscribe', symbol }));
    }
    this.subscriptions.delete(symbol);
  }

  // Get historical candle data
  async getCandles(
    symbol: string, 
    timeframe: TimeframeType = this.config.defaultTimeframe,
    from: number = Math.floor(Date.now() / 1000) - 86400 * 30, // Last 30 days by default
    to: number = Math.floor(Date.now() / 1000)
  ): Promise<OHLCV[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/stock/candle`, {
        params: {
          symbol,
          resolution: timeframe,
          from,
          to,
          token: this.config.apiKey
        }
      });

      const data = response.data;
      
      if (data.s === 'ok' && Array.isArray(data.t)) {
        return data.t.map((timestamp: number, index: number) => ({
          timestamp: timestamp * 1000, // Convert to milliseconds
          open: data.o[index],
          high: data.h[index],
          low: data.l[index],
          close: data.c[index],
          volume: data.v[index]
        }));
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error(`Error fetching candles for ${symbol}:`, error);
      throw error;
    }
  }

  // Get real-time quote
  async getQuote(symbol: string) {
    try {
      const response = await axios.get(`${this.baseUrl}/quote`, {
        params: {
          symbol,
          token: this.config.apiKey
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      throw error;
    }
  }

  // Get technical indicators
  async getTechnicalIndicator(
    symbol: string,
    indicator: string,
    resolution: TimeframeType = this.config.defaultTimeframe
  ) {
    try {
      const to = Math.floor(Date.now() / 1000);
      const from = to - 86400 * 30; // Last 30 days
      
      const response = await axios.get(`${this.baseUrl}/stock/indicator`, {
        params: {
          symbol,
          resolution,
          from,
          to,
          token: this.config.apiKey
        }
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error fetching indicator ${indicator} for ${symbol}:`, error);
      throw error;
    }
  }

  private handleTradeData(data: TradeData) {
    // Process real-time trade data
    data.data.forEach(trade => {
      console.log(`Trade: ${trade.s} @ ${trade.p} (Volume: ${trade.v})`);
    });
  }

  // Enhanced cleanup
  disconnect() {
    this.subscriptions.clear();
    this.reconnectAttempts = this.maxReconnectAttempts; // Prevent further reconnection attempts
    this.closeExistingConnection();
  }
}

// Create and export a singleton instance
export const marketData = new MarketDataService({
  apiKey: import.meta.env.VITE_FINNHUB_API_KEY || '',
  defaultTimeframe: '15' // Default to 15-minute timeframe
});

export default marketData; 