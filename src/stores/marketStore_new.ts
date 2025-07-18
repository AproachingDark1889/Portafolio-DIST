import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { ATR, EMA, RSI, MACD, BollingerBands } from 'technicalindicators';
import type { CandleData, TechnicalIndicators, AlertData } from '../types/trading';

// Tipos de alertas
export const ALERT_TYPES = {
  BREAKOUT: 'breakout',
  BREAKDOWN: 'breakdown',
  VOLUME_SPIKE: 'volume_spike',
  RSI_OVERBOUGHT: 'rsi_overbought',
  RSI_OVERSOLD: 'rsi_oversold',
  MACD_SIGNAL: 'macd_signal',
  BB_SQUEEZE: 'bollinger_squeeze'
} as const;

export type AlertType = typeof ALERT_TYPES[keyof typeof ALERT_TYPES];

// Interfaces del store
interface MarketStoreState {
  // Estado principal
  candles: Record<string, CandleData[]>;
  indicators: Record<string, TechnicalIndicators>;
  alerts: AlertData[];
  symbols: Array<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  }>;
  
  // Estado de conexión
  isConnected: boolean;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  lastUpdate: Record<string, number>;
  
  // Configuración
  audioEnabled: boolean;
  isStreaming: boolean;
  selectedSymbol: string | null;
  alertThresholds: Record<string, number>;
  updateInterval: number;
  maxCandles: number;
  maxAlerts: number;
  timeframe: string;
  
  // Actions principales
  setCandles: (symbol: string, newCandles: CandleData[]) => void;
  addCandle: (symbol: string, candle: CandleData) => void;
  updateIndicators: (symbol: string, indicators: TechnicalIndicators) => void;
  toggleAudio: () => void;
  setTimeframe: (timeframe: string) => void;
  setAlertThreshold: (symbol: string, threshold: number) => void;
  setSelectedSymbol: (symbol: string) => void;
  initializeWebSocket: () => void;
  reconnectWebSocket: () => void;
  dismissAlert: (alertId: string) => void;
  markAlertAsRead: (alertId: string) => void;
  
  // Getters
  getActiveAlerts: () => AlertData[];
  getTechnicalSummary: (symbol: string) => {
    trend: 'bullish' | 'bearish' | 'neutral';
    strength: number;
    signals: string[];
  };
  
  // Métodos auxiliares
  calculateIndicators: (symbol: string) => void;
  runAlertEngine: (symbol: string) => void;
  addAlert: (alert: Omit<AlertData, 'id' | 'timestamp'>) => void;
  clearAlerts: () => void;
  removeAlert: (alertId: string) => void;
  setAudioEnabled: (enabled: boolean) => void;
  playAlertSound: (type: AlertType, severity: AlertData['severity']) => void;
  getSymbolData: (symbol: string) => {
    candles: CandleData[];
    indicators: TechnicalIndicators | null;
    lastUpdate: number | null;
  };
  getAlertsBySymbol: (symbol: string) => AlertData[];
  getMarketOverview: () => Array<{
    symbol: string;
    price: number;
    change: number;
    volume: number;
    rsi: number | null;
    lastUpdate: number | null;
  }>;
}

// Reglas de alertas
interface AlertRule {
  type: AlertType;
  condition: (candle: CandleData, indicators: TechnicalIndicators, context: any) => boolean;
  severity: AlertData['severity'];
  message: (symbol: string, candle: CandleData, indicators: TechnicalIndicators) => string;
}

const ALERT_RULES: AlertRule[] = [
  {
    type: ALERT_TYPES.BREAKOUT,
    condition: (candle, indicators) => {
      const { bb, atr, volumeMA } = indicators;
      return candle.close > bb.upper && candle.volume > volumeMA * 1.5;
    },
    severity: 'high',
    message: (symbol, candle, indicators) => 
      `${symbol} breakout above Bollinger Band upper at ${candle.close.toFixed(2)} with high volume`
  },
  {
    type: ALERT_TYPES.BREAKDOWN,
    condition: (candle, indicators) => {
      const { bb, atr, volumeMA } = indicators;
      return candle.close < bb.lower && candle.volume > volumeMA * 1.5;
    },
    severity: 'high',
    message: (symbol, candle, indicators) => 
      `${symbol} breakdown below Bollinger Band lower at ${candle.close.toFixed(2)} with high volume`
  },
  {
    type: ALERT_TYPES.VOLUME_SPIKE,
    condition: (candle, indicators) => {
      const { volumeMA } = indicators;
      return candle.volume > volumeMA * 3;
    },
    severity: 'medium',
    message: (symbol, candle, indicators) => 
      `${symbol} volume spike: ${(candle.volume / indicators.volumeMA).toFixed(1)}x average`
  },
  {
    type: ALERT_TYPES.RSI_OVERBOUGHT,
    condition: (candle, indicators, context) => {
      const { rsi } = indicators;
      return rsi > 80 && context.previousRSI <= 80;
    },
    severity: 'medium',
    message: (symbol, candle, indicators) => 
      `${symbol} RSI overbought at ${indicators.rsi.toFixed(1)}`
  },
  {
    type: ALERT_TYPES.RSI_OVERSOLD,
    condition: (candle, indicators, context) => {
      const { rsi } = indicators;
      return rsi < 20 && context.previousRSI >= 20;
    },
    severity: 'medium',
    message: (symbol, candle, indicators) => 
      `${symbol} RSI oversold at ${indicators.rsi.toFixed(1)}`
  }
];

// Calcular indicadores técnicos
const calculateIndicators = (candles: CandleData[], period = 14): TechnicalIndicators | null => {
  if (candles.length < period + 1) return null;

  const closes = candles.map(c => c.close);
  const highs = candles.map(c => c.high);
  const lows = candles.map(c => c.low);
  const volumes = candles.map(c => c.volume);

  try {
    // ATR (Average True Range)
    const atrValues = ATR.calculate({
      high: highs,
      low: lows,
      close: closes,
      period
    });

    // RSI
    const rsiValues = RSI.calculate({
      values: closes,
      period
    });

    // EMA 12 y 26
    const ema12 = EMA.calculate({ values: closes, period: 12 });
    const ema26 = EMA.calculate({ values: closes, period: 26 });

    // MACD
    const macdValues = MACD.calculate({
      values: closes,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false
    });

    // Bollinger Bands
    const bbValues = BollingerBands.calculate({
      period: 20,
      values: closes,
      stdDev: 2
    });

    // Volume Moving Average
    const volumeMA = volumes.slice(-period).reduce((sum, v) => sum + v, 0) / period;

    // Obtener valores más recientes
    const atr = atrValues[atrValues.length - 1] || 0;
    const rsi = rsiValues[rsiValues.length - 1] || 50;
    const bb = bbValues[bbValues.length - 1] || { upper: 0, middle: 0, lower: 0 };
    const macdData = macdValues[macdValues.length - 1] || { MACD: 0, signal: 0, histogram: 0 };
    const macd = {
      MACD: macdData.MACD || 0,
      signal: macdData.signal || 0,
      histogram: macdData.histogram || 0
    };

    return {
      atr,
      rsi,
      bb,
      macd,
      ema12: ema12[ema12.length - 1] || 0,
      ema26: ema26[ema26.length - 1] || 0,
      volumeMA
    };
  } catch (error) {
    console.error('Error calculating indicators:', error);
    return null;
  }
};

// Store de Zustand
export const useMarketStore = create<MarketStoreState>()(
  subscribeWithSelector((set, get) => ({
    // Estado inicial
    candles: {},
    indicators: {},
    alerts: [],
    symbols: [],
    isConnected: false,
    connectionStatus: 'disconnected',
    lastUpdate: {},
    audioEnabled: true,
    isStreaming: true,
    selectedSymbol: null,
    alertThresholds: {},
    updateInterval: 1000,
    maxCandles: 1000,
    maxAlerts: 50,
    timeframe: '1m',
    
    // Actions
    setCandles: (symbol: string, newCandles: CandleData[]) => {
      const state = get();
      const limitedCandles = newCandles.slice(-state.maxCandles);
      
      set({
        candles: {
          ...state.candles,
          [symbol]: limitedCandles
        },
        lastUpdate: {
          ...state.lastUpdate,
          [symbol]: Date.now()
        }
      });
      
      // Recalcular indicadores
      get().calculateIndicators(symbol);
    },

    addCandle: (symbol: string, candle: CandleData) => {
      const state = get();
      const currentCandles = state.candles[symbol] || [];
      const newCandles = [...currentCandles, candle].slice(-state.maxCandles);
      
      set({
        candles: {
          ...state.candles,
          [symbol]: newCandles
        },
        lastUpdate: {
          ...state.lastUpdate,
          [symbol]: Date.now()
        }
      });
      
      // Recalcular indicadores
      get().calculateIndicators(symbol);
      
      // Ejecutar motor de alertas
      get().runAlertEngine(symbol);
    },

    updateIndicators: (symbol: string, indicators: TechnicalIndicators) => {
      const state = get();
      set({
        indicators: {
          ...state.indicators,
          [symbol]: indicators
        }
      });
    },

    toggleAudio: () => {
      const state = get();
      set({ audioEnabled: !state.audioEnabled });
    },

    setTimeframe: (timeframe: string) => {
      set({ timeframe });
    },
    
    setAlertThreshold: (symbol: string, threshold: number) => {
      const state = get();
      set({
        alertThresholds: {
          ...state.alertThresholds,
          [symbol]: threshold
        }
      });
    },
    
    setSelectedSymbol: (symbol: string) => {
      set({ selectedSymbol: symbol });
    },
    
    initializeWebSocket: () => {
      // TODO: Implementar WebSocket real
      set({ 
        isConnected: true, 
        connectionStatus: 'connected' 
      });
    },
    
    reconnectWebSocket: () => {
      set({ connectionStatus: 'reconnecting' });
      // TODO: Implementar lógica de reconexión
      setTimeout(() => {
        set({ 
          isConnected: true, 
          connectionStatus: 'connected' 
        });
      }, 2000);
    },
    
    dismissAlert: (alertId: string) => {
      const state = get();
      set({
        alerts: state.alerts.map(alert => 
          alert.id === alertId ? { ...alert, dismissed: true } : alert
        )
      });
    },
    
    markAlertAsRead: (alertId: string) => {
      const state = get();
      set({
        alerts: state.alerts.map(alert => 
          alert.id === alertId ? { ...alert, isRead: true } : alert
        )
      });
    },
    
    // Getters
    getActiveAlerts: () => {
      const state = get();
      return state.alerts.filter(alert => 
        !alert.dismissed && Date.now() - alert.timestamp < 300000 // 5 minutos
      );
    },
    
    getTechnicalSummary: (symbol: string) => {
      const state = get();
      const indicators = state.indicators[symbol];
      
      if (!indicators) {
        return { trend: 'neutral' as const, strength: 50, signals: [] };
      }
      
      const signals: string[] = [];
      let bullishSignals = 0;
      let bearishSignals = 0;
      
      // Análisis RSI
      if (indicators.rsi > 70) {
        signals.push('RSI Overbought');
        bearishSignals++;
      } else if (indicators.rsi < 30) {
        signals.push('RSI Oversold');
        bullishSignals++;
      }
      
      // Análisis MACD
      if (indicators.macd.MACD > indicators.macd.signal) {
        signals.push('MACD Bullish Cross');
        bullishSignals++;
      } else {
        signals.push('MACD Bearish Cross');
        bearishSignals++;
      }
      
      // Análisis EMAs
      if (indicators.ema12 > indicators.ema26) {
        signals.push('Short-term Uptrend');
        bullishSignals++;
      } else {
        signals.push('Short-term Downtrend');
        bearishSignals++;
      }
      
      const totalSignals = bullishSignals + bearishSignals;
      const strength = totalSignals > 0 ? (bullishSignals / totalSignals) * 100 : 50;
      
      let trend: 'bullish' | 'bearish' | 'neutral' = 'neutral';
      if (strength > 60) trend = 'bullish';
      else if (strength < 40) trend = 'bearish';
      
      return { trend, strength, signals };
    },
    
    // Métodos auxiliares
    calculateIndicators: (symbol: string) => {
      const state = get();
      const candles = state.candles[symbol];
      
      if (!candles || candles.length < 20) return;
      
      const indicators = calculateIndicators(candles);
      
      if (indicators) {
        set({
          indicators: {
            ...state.indicators,
            [symbol]: indicators
          }
        });
      }
    },
    
    runAlertEngine: (symbol: string) => {
      const state = get();
      const candles = state.candles[symbol];
      const indicators = state.indicators[symbol];
      
      if (!candles || !indicators || candles.length < 2) return;
      
      const currentCandle = candles[candles.length - 1];
      const previousCandle = candles[candles.length - 2];
      
      const context = {
        previousRSI: indicators.rsi, // En implementación real, esto vendría del estado previo
        previousPrice: previousCandle.close
      };
      
      ALERT_RULES.forEach(rule => {
        if (rule.condition(currentCandle, indicators, context)) {
          get().addAlert({
            symbol,
            type: rule.type,
            severity: rule.severity,
            message: rule.message(symbol, currentCandle, indicators),
            price: currentCandle.close,
            dismissed: false,
            indicators: {
              rsi: indicators.rsi,
              macd: indicators.macd.MACD,
              atr: indicators.atr,
              volume: currentCandle.volume
            }
          });
        }
      });
    },
    
    addAlert: (alert: Omit<AlertData, 'id' | 'timestamp'>) => {
      const state = get();
      const newAlert: AlertData = {
        ...alert,
        id: Date.now().toString(),
        timestamp: Date.now()
      };
      
      set({
        alerts: [newAlert, ...state.alerts].slice(0, state.maxAlerts)
      });
      
      // Reproducir sonido si está habilitado
      if (state.audioEnabled) {
        get().playAlertSound(alert.type as AlertType, alert.severity);
      }
    },
    
    clearAlerts: () => {
      set({ alerts: [] });
    },
    
    removeAlert: (alertId: string) => {
      const state = get();
      set({
        alerts: state.alerts.filter(alert => alert.id !== alertId)
      });
    },
    
    setAudioEnabled: (enabled: boolean) => {
      set({ audioEnabled: enabled });
    },
    
    playAlertSound: (type: AlertType, severity: AlertData['severity']) => {
      // TODO: Implementar sonidos reales
      console.log(`Alert sound: ${type} - ${severity}`);
    },
    
    getSymbolData: (symbol: string) => {
      const state = get();
      return {
        candles: state.candles[symbol] || [],
        indicators: state.indicators[symbol] || null,
        lastUpdate: state.lastUpdate[symbol] || null
      };
    },
    
    getAlertsBySymbol: (symbol: string) => {
      const state = get();
      return state.alerts.filter(alert => alert.symbol === symbol);
    },
    
    getMarketOverview: () => {
      const state = get();
      return Object.keys(state.candles).map(symbol => {
        const candles = state.candles[symbol];
        const indicators = state.indicators[symbol];
        const lastCandle = candles[candles.length - 1];
        const prevCandle = candles[candles.length - 2];
        
        return {
          symbol,
          price: lastCandle?.close || 0,
          change: prevCandle ? lastCandle.close - prevCandle.close : 0,
          volume: lastCandle?.volume || 0,
          rsi: indicators?.rsi || null,
          lastUpdate: state.lastUpdate[symbol] || null
        };
      });
    }
  }))
);

// Hook para acceder a datos de un símbolo específico
export const useSymbolData = (symbol: string) => {
  return useMarketStore((state) => state.getSymbolData(symbol));
};

export default useMarketStore;
