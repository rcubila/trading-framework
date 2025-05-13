declare module 'finnhub' {
  export interface CandleResponse {
    c: number[];  // Close prices
    h: number[];  // High prices
    l: number[];  // Low prices
    o: number[];  // Open prices
    s: string;    // Status ('ok' or 'no_data')
    t: number[];  // Timestamps
    v: number[];  // Volumes
  }

  export class DefaultApi {
    constructor(config: { apiKey: string; isJsonMime: (mime: string) => boolean });
    
    stockCandles(
      symbol: string,
      resolution: string,
      from: number,
      to: number
    ): Promise<CandleResponse>;

    technicalIndicator(
      symbol: string,
      resolution: string,
      from: number,
      to: number,
      indicator: string,
      params?: Record<string, any>
    ): Promise<any>;
  }
} 