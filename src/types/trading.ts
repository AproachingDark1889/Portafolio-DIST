// 🔥 TRADING TYPES - NO FAKE DATA ALLOWED

export interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TechnicalIndicators {
  rsi: number;
  atr: number;
  bb: {
    upper: number;
    middle: number;
    lower: number;
  };
  macd: {
    MACD: number;
    signal: number;
    histogram: number;
  };
  volumeMA: number;
  ema12: number;
  ema26: number;
  series: {
    rsi: number[];
    bb: Array<{upper: number; middle: number; lower: number}>;
    macd: Array<{MACD: number; signal: number; histogram: number}>;
    ema12: number[];
    ema26: number[];
  };
}

export interface AlertData {
  id: string;
  symbol: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  price: number;
  timestamp: number;
  isRead?: boolean;
  dismissed?: boolean;
  currentValue?: number;
  threshold?: number;
  indicators: {
    rsi: number;
    atr: number;
    volume: number;
    volumeMA: number;
  };
}

// Alias para compatibilidad
export type Alert = AlertData;

export interface MarketData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  lastUpdate: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  status: 'connected' | 'disconnected' | 'reconnecting';
  lastHeartbeat: number;
  reconnectAttempts: number;
}

export interface SanitizedSymbol {
  original: string;
  sanitized: string;
  isValid: boolean;
}

export interface TradingSession {
  userId: string;
  sessionId: string;
  startTime: number;
  isDemo: boolean;
  permissions: string[];
}

// Utilidades de tipos para trading seguro
export type NonEmptyArray<T> = [T, ...T[]];
export type Timestamp = number;
export type Price = number;

export interface Branded<T, Brand> {
  readonly _brand: Brand;
  readonly value: T;
}

export type SafePrice = Branded<number, 'SafePrice'>;
export type SafeVolume = Branded<number, 'SafeVolume'>;
export type SafeSymbol = Branded<string, 'SafeSymbol'>;

// Validadores de tipos
export const createSafePrice = (value: number): SafePrice | null => {
  if (isNaN(value) || value < 0 || !isFinite(value)) {
    return null;
  }
  return { _brand: 'SafePrice' as const, value };
};

export const createSafeSymbol = (value: string): SafeSymbol | null => {
  const sanitized = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (sanitized.length === 0 || sanitized.length > 10) {
    return null;
  }
  return { _brand: 'SafeSymbol' as const, value: sanitized };
};
