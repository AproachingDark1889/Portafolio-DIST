import { useState, useEffect, useCallback, useRef } from 'react';
import { CandleData, TechnicalIndicators } from '../types/trading';

interface CandlestickDataHook {
  data: CandleData[];
  loading: boolean;
  error: string | null;
  indicators: TechnicalIndicators | null;
  refetch: () => void;
  updateSymbol: (symbol: string) => void;
}

// Generador de datos OHLCV realistas para demo
const generateCandlestickData = (symbol: string, days: number = 100): CandleData[] => {
  const data: CandleData[] = [];
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  
  // Precios base por símbolo
  const basePrices: { [key: string]: number } = {
    'BTC': 67000,
    'ETH': 3800,
    'AAPL': 175,
    'GOOGL': 135,
    'TSLA': 240,
    'NVDA': 880,
    'MSFT': 415,
    'AMZN': 185
  };
  
  let currentPrice = basePrices[symbol] || 100;
  const volatility = symbol.includes('BTC') || symbol.includes('ETH') ? 0.03 : 0.02;
  
  for (let i = days; i >= 0; i--) {
    const time = Math.floor((now - (i * dayMs)) / 1000);
    
    // Simulación de movimiento browniano con tendencia
    const trendFactor = Math.sin(i / 20) * 0.001; // Tendencia cíclica sutil
    const randomWalk = (Math.random() - 0.5) * volatility;
    const priceChange = (trendFactor + randomWalk) * currentPrice;
    
    currentPrice += priceChange;
    
    // Generar OHLC para el día
    const open = currentPrice;
    const variation = Math.random() * 0.02; // Variación intraday máx 2%
    
    const high = open * (1 + Math.random() * variation);
    const low = open * (1 - Math.random() * variation);
    
    // El close debe estar dentro del rango high-low
    const close = low + (high - low) * Math.random();
    
    // Volumen correlacionado con la volatilidad
    const volumeBase = symbol.includes('BTC') ? 2000000000 : 50000000;
    const volumeVariation = Math.abs(priceChange / currentPrice) * 5 + 0.5;
    const volume = volumeBase * volumeVariation * (0.5 + Math.random());
    
    data.push({
      time: time * 1000, // Convert to milliseconds
      open,
      high,
      low,
      close,
      volume: Math.floor(volume)
    });
  }
  
  return data;
};

// Calcular indicadores técnicos
const calculateIndicators = (data: CandleData[]): TechnicalIndicators => {
  const closes = data.map(d => d.close);
  const volumes = data.map(d => d.volume);
  
  if (closes.length === 0) {
    // Valores por defecto si no hay datos
    return {
      rsi: 50,
      atr: 1,
      bb: { upper: 100, middle: 99, lower: 98 },
      macd: { MACD: 0, signal: 0, histogram: 0 },
      volumeMA: 1000000,
      ema12: 100,
      ema26: 99,
      series: {
        rsi: [50],
        bb: [{ upper: 100, middle: 99, lower: 98 }],
        macd: [{ MACD: 0, signal: 0, histogram: 0 }],
        ema12: [100],
        ema26: [99]
      }
    };
  }
  
  // RSI simplificado
  const rsi = 50 + (Math.random() - 0.5) * 40;
  
  // ATR simplificado
  const atr = data.reduce((sum, d) => sum + (d.high - d.low), 0) / data.length;
  
  // EMA 12 y 26
  const lastClose = closes[closes.length - 1] || 100;
  const ema12 = lastClose;
  const ema26 = lastClose * 0.98;
  
  // Bollinger Bands
  const sma20 = closes.slice(-20).reduce((sum, price) => sum + price, 0) / Math.min(20, closes.length);
  const variance = closes.slice(-20).reduce((sum, price) => sum + Math.pow(price - sma20, 2), 0) / Math.min(20, closes.length);
  const stdDev = Math.sqrt(variance);
  
  const bb = {
    upper: sma20 + (2 * stdDev),
    middle: sma20,
    lower: sma20 - (2 * stdDev)
  };
  
  // MACD
  const macdLine = ema12 - ema26;
  const signalLine = macdLine * 0.9;
  const histogram = macdLine - signalLine;
  
  const macd = {
    MACD: macdLine,
    signal: signalLine,
    histogram: histogram
  };
  
  // Volume MA
  const volumeMA = volumes.slice(-20).reduce((sum, vol) => sum + vol, 0) / Math.min(20, volumes.length);
  
  // Series data (últimos 20 puntos)
  const seriesLength = Math.min(20, data.length);
  const series = {
    rsi: Array.from({ length: seriesLength }, () => 50 + (Math.random() - 0.5) * 40),
    bb: Array.from({ length: seriesLength }, () => bb),
    macd: Array.from({ length: seriesLength }, () => macd),
    ema12: Array.from({ length: seriesLength }, () => ema12 + (Math.random() - 0.5) * 10),
    ema26: Array.from({ length: seriesLength }, () => ema26 + (Math.random() - 0.5) * 10)
  };
  
  return {
    rsi,
    atr,
    bb,
    macd,
    volumeMA,
    ema12,
    ema26,
    series
  };
};

export const useCandlestickData = (symbol: string): CandlestickDataHook => {
  const [data, setData] = useState<CandleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [currentSymbol, setCurrentSymbol] = useState(symbol);
  
  const generateData = useCallback(() => {
    try {
      setLoading(true);
      setError(null);
      
      const newData = generateCandlestickData(currentSymbol, 100);
      const newIndicators = calculateIndicators(newData);
      
      setData(newData);
      setIndicators(newIndicators);
      setLoading(false);
    } catch (err) {
      setError('Error generating candlestick data');
      setLoading(false);
    }
  }, [currentSymbol]);
  
  const updateSymbol = useCallback((newSymbol: string) => {
    setCurrentSymbol(newSymbol);
  }, []);
  
  const refetch = useCallback(() => {
    generateData();
  }, [generateData]);
  
  useEffect(() => {
    generateData();
    
    // Actualizar datos cada 5 segundos
    intervalRef.current = setInterval(() => {
      generateData();
    }, 5000);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [generateData]);
  
  return {
    data,
    loading,
    error,
    indicators,
    refetch,
    updateSymbol
  };
};
