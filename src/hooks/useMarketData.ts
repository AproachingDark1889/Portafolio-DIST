import { useEffect, useCallback, useMemo } from 'react';
import { useMarketStore } from '../stores/marketStore';
import type { CandleData } from '../types/trading';

// Hook para datos de velas con soporte para múltiples intervalos
export const useCandlestickData = (symbol: string, _interval: string = '1m') => {
  const { candles, indicators, lastUpdate } = useMarketStore(state => ({
    candles: state.candles[symbol] || [],
    indicators: state.indicators[symbol] || null,
    lastUpdate: state.lastUpdate[symbol] || null
  }));

  const setCandles = useMarketStore(state => state.setCandles);
  const calculateIndicators = useMarketStore(state => state.calculateIndicators);

  // Generar datos de muestra si no hay candles
  const generateSampleData = useCallback((): CandleData[] => {
    const now = Date.now();
    const sampleData: CandleData[] = [];
    
    let basePrice = 150.0;
    
    for (let i = 99; i >= 0; i--) {
      const timeOffset = i * 60 * 1000; // 1 minuto por vela
      const time = now - timeOffset;
      
      // Generar movimiento de precio realista
      const volatility = 0.02;
      const priceChange = (Math.random() - 0.5) * 2 * volatility * basePrice;
      const open = basePrice;
      const close = open + priceChange;
      
      // Generar high y low
      const spread = Math.abs(priceChange) * 0.5 + Math.random() * 0.01 * basePrice;
      const high = Math.max(open, close) + spread;
      const low = Math.min(open, close) - spread;
      
      // Generar volumen
      const baseVolume = 1000000;
      const volumeMultiplier = 0.5 + Math.random();
      const volume = Math.floor(baseVolume * volumeMultiplier);
      
      sampleData.push({
        time,
        open,
        high,
        low,
        close,
        volume
      });
      
      basePrice = close;
    }
    
    return sampleData;
  }, []);

  // Inicializar datos de muestra si no existen
  useEffect(() => {
    if (!candles.length) {
      const sampleData = generateSampleData();
      setCandles(symbol, sampleData);
    }
  }, [symbol, candles.length, generateSampleData, setCandles]);

  // Actualizar indicadores cuando cambien las velas
  useEffect(() => {
    if (candles.length >= 20) {
      calculateIndicators(symbol);
    }
  }, [candles.length, symbol, calculateIndicators]);

  const formattedData = useMemo(() => {
    return candles.map(candle => ({
      ...candle,
      timestamp: new Date(candle.time).toISOString()
    }));
  }, [candles]);

  const stats = useMemo(() => {
    if (!candles.length) return null;
    
    const current = candles[candles.length - 1];
    const previous = candles[candles.length - 2];
    
    if (!current || !previous) return null;
    
    const change = current.close - previous.close;
    const changePercent = (change / previous.close) * 100;
    
    return {
      current: current.close,
      change,
      changePercent,
      volume: current.volume,
      high24h: Math.max(...candles.slice(-24).map(c => c.high)),
      low24h: Math.min(...candles.slice(-24).map(c => c.low))
    };
  }, [candles]);

  return {
    candles: formattedData,
    indicators,
    stats,
    lastUpdate,
    isLoading: candles.length === 0
  };
};

// Hook para datos de mercado en tiempo real
export const useMarketData = (symbols: string[]) => {
  const marketData = useMarketStore(state => 
    symbols.map(symbol => {
      const candles = state.candles[symbol] || [];
      const indicators = state.indicators[symbol];
      const lastUpdate = state.lastUpdate[symbol];
      
      if (!candles.length) return null;
      
      const current = candles[candles.length - 1];
      const previous = candles[candles.length - 2];
      
      if (!current) return null;
      
      const change = previous ? current.close - previous.close : 0;
      const changePercent = previous ? (change / previous.close) * 100 : 0;
      
      return {
        symbol,
        price: current.close,
        change,
        changePercent,
        volume: current.volume,
        high: current.high,
        low: current.low,
        rsi: indicators?.rsi || null,
        lastUpdate,
        trend: indicators ? (
          indicators.ema12 > indicators.ema26 ? 'bullish' : 'bearish'
        ) : 'neutral'
      };
    }).filter(Boolean)
  );

  return marketData;
};

// Hook para alertas en tiempo real
export const useAlerts = (symbol?: string) => {
  const { alerts, getActiveAlerts, getAlertsBySymbol } = useMarketStore(state => ({
    alerts: state.alerts,
    getActiveAlerts: state.getActiveAlerts,
    getAlertsBySymbol: state.getAlertsBySymbol
  }));

  const activeAlerts = useMemo(() => {
    if (symbol) {
      return getAlertsBySymbol(symbol);
    }
    return getActiveAlerts();
  }, [symbol, getActiveAlerts, getAlertsBySymbol]);

  const alertsByType = useMemo(() => {
    const grouped = activeAlerts.reduce((acc, alert) => {
      if (!acc[alert.type]) {
        acc[alert.type] = [];
      }
      acc[alert.type]!.push(alert);
      return acc;
    }, {} as Record<string, typeof activeAlerts>);

    return grouped;
  }, [activeAlerts]);

  const alertStats = useMemo(() => {
    const total = activeAlerts.length;
    const high = activeAlerts.filter(a => a.severity === 'high').length;
    const medium = activeAlerts.filter(a => a.severity === 'medium').length;
    const low = activeAlerts.filter(a => a.severity === 'low').length;

    return { total, high, medium, low };
  }, [activeAlerts]);

  return {
    alerts: activeAlerts,
    alertsByType,
    alertStats,
    totalAlerts: alerts.length
  };
};

// Hook para análisis técnico
export const useTechnicalAnalysis = (symbol: string) => {
  const { indicators, getTechnicalSummary } = useMarketStore(state => ({
    indicators: state.indicators[symbol],
    getTechnicalSummary: state.getTechnicalSummary
  }));

  const analysis = useMemo(() => {
    if (!indicators) return null;
    
    const summary = getTechnicalSummary(symbol);
    
    return {
      ...summary,
      indicators: {
        rsi: {
          value: indicators.rsi,
          signal: indicators.rsi > 70 ? 'overbought' : 
                  indicators.rsi < 30 ? 'oversold' : 'neutral'
        },
        macd: {
          value: indicators.macd.MACD,
          signal: indicators.macd.signal,
          histogram: indicators.macd.histogram,
          trend: indicators.macd.MACD > indicators.macd.signal ? 'bullish' : 'bearish'
        },
        bollinger: {
          upper: indicators.bb.upper,
          middle: indicators.bb.middle,
          lower: indicators.bb.lower,
          width: indicators.bb.upper - indicators.bb.lower
        },
        ema: {
          short: indicators.ema12,
          long: indicators.ema26,
          trend: indicators.ema12 > indicators.ema26 ? 'bullish' : 'bearish'
        }
      }
    };
  }, [indicators, getTechnicalSummary, symbol]);

  return analysis;
};

// Hook para conexión WebSocket
export const useWebSocketConnection = () => {
  const { 
    isConnected, 
    connectionStatus, 
    initializeWebSocket, 
    reconnectWebSocket 
  } = useMarketStore(state => ({
    isConnected: state.isConnected,
    connectionStatus: state.connectionStatus,
    initializeWebSocket: state.initializeWebSocket,
    reconnectWebSocket: state.reconnectWebSocket
  }));

  const connect = useCallback(() => {
    if (!isConnected) {
      initializeWebSocket();
    }
  }, [isConnected, initializeWebSocket]);

  const reconnect = useCallback(() => {
    reconnectWebSocket();
  }, [reconnectWebSocket]);

  // Auto-reconexión
  useEffect(() => {
    if (!isConnected && connectionStatus === 'disconnected') {
      const reconnectTimer = setTimeout(reconnect, 5000);
      return () => clearTimeout(reconnectTimer);
    }
    return undefined;
  }, [isConnected, connectionStatus, reconnect]);

  return {
    isConnected,
    connectionStatus,
    connect,
    reconnect
  };
};

// Hook para overview del mercado
export const useMarketOverview = () => {
  const getMarketOverview = useMarketStore(state => state.getMarketOverview);
  
  const overview = useMemo(() => {
    return getMarketOverview();
  }, [getMarketOverview]);

  const marketStats = useMemo(() => {
    if (!overview.length) return null;
    
    const totalVolume = overview.reduce((sum, item) => sum + item.volume, 0);
    const gainers = overview.filter(item => item.change > 0).length;
    const losers = overview.filter(item => item.change < 0).length;
    const unchanged = overview.length - gainers - losers;
    
    const topGainer = overview.reduce((max, item) => 
      item.change > max.change ? item : max
    );
    
    const topLoser = overview.reduce((min, item) => 
      item.change < min.change ? item : min
    );

    return {
      totalSymbols: overview.length,
      totalVolume,
      gainers,
      losers,
      unchanged,
      topGainer,
      topLoser
    };
  }, [overview]);

  return {
    overview,
    marketStats
  };
};

// Hook para simulación de trading
export const useTradingSimulation = (initialBalance: number = 10000) => {
  const { candles, selectedSymbol, setSelectedSymbol } = useMarketStore(state => ({
    candles: state.candles,
    selectedSymbol: state.selectedSymbol,
    setSelectedSymbol: state.setSelectedSymbol
  }));

  // TODO: Implementar lógica de simulación completa
  const portfolio = useMemo(() => {
    return {
      balance: initialBalance,
      positions: [],
      totalValue: initialBalance,
      pnl: 0,
      pnlPercent: 0
    };
  }, [initialBalance]);

  const selectSymbol = useCallback((symbol: string) => {
    setSelectedSymbol(symbol);
  }, [setSelectedSymbol]);

  return {
    portfolio,
    selectedSymbol,
    selectSymbol,
    availableSymbols: Object.keys(candles)
  };
};
