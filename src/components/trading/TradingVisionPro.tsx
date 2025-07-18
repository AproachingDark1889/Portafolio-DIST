import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMarketStore } from '../../stores/marketStore';
import { CandleData, TechnicalIndicators } from '../../types/trading';

/**
 * ⚔️ TradingVision Pro - LETHAL FUNCTIONALITY
 * 
 * ZERO DECORATION. MAXIMUM ALPHA.
 * 
 * Core Edge Components:
 * - Structural Break Detection
 * - Liquidity Pool Mapping
 * - Volume Profile Analysis
 * - Market Microstructure
 * - Risk-Reward Optimization
 */

interface TradingVisionProProps {
  symbols: string[];
  onAlphaSignal: (signal: AlphaSignal) => void;
}

interface AlphaSignal {
  symbol: string;
  type: 'STRUCTURAL_BREAK' | 'LIQUIDITY_HUNT' | 'VOLUME_IMBALANCE' | 'MEAN_REVERSION';
  confidence: number; // 0-100
  entry: number;
  stop: number;
  targets: number[];
  reasoning: string;
  timestamp: number;
}

interface LiquidityLevel {
  price: number;
  volume: number;
  type: 'SUPPORT' | 'RESISTANCE' | 'PIVOT';
  strength: number;
}

interface VolumeProfile {
  price: number;
  volume: number;
  buyVolume: number;
  sellVolume: number;
  imbalance: number;
}

interface MarketStructure {
  trend: 'BULLISH' | 'BEARISH' | 'SIDEWAYS';
  support: number[];
  resistance: number[];
  breakoutLevels: number[];
  liquidityLevels: LiquidityLevel[];
  volumeProfile: VolumeProfile[];
}

const TradingVisionPro: React.FC<TradingVisionProProps> = ({ 
  symbols, 
  onAlphaSignal 
}) => {
  const { candles, indicators } = useMarketStore();
  const [marketStructure, setMarketStructure] = useState<Record<string, MarketStructure>>({});
  const [activeSignals, setActiveSignals] = useState<AlphaSignal[]>([]);
  const [structuralBreaks, setStructuralBreaks] = useState<Record<string, number[]>>({});
  const analysisRef = useRef<NodeJS.Timeout | null>(null);

  // STRUCTURAL BREAK DETECTION
  const detectStructuralBreaks = useCallback((candles: CandleData[]): number[] => {
    if (candles.length < 50) return [];
    
    const breaks: number[] = [];
    const lookback = 20;
    
    for (let i = lookback; i < candles.length - lookback; i++) {
      const currentCandle = candles[i];
      if (!currentCandle) continue;
      
      const leftHigh = Math.max(...candles.slice(i - lookback, i).map(c => c.high));
      const rightHigh = Math.max(...candles.slice(i + 1, i + lookback + 1).map(c => c.high));
      const currentHigh = currentCandle.high;
      
      const leftLow = Math.min(...candles.slice(i - lookback, i).map(c => c.low));
      const rightLow = Math.min(...candles.slice(i + 1, i + lookback + 1).map(c => c.low));
      const currentLow = currentCandle.low;
      
      // Structural High Break
      if (currentHigh > leftHigh && currentHigh > rightHigh) {
        breaks.push(currentHigh);
      }
      
      // Structural Low Break
      if (currentLow < leftLow && currentLow < rightLow) {
        breaks.push(currentLow);
      }
    }
    
    return breaks;
  }, []);

  // LIQUIDITY POOL MAPPING
  const mapLiquidityPools = useCallback((candles: CandleData[]): LiquidityLevel[] => {
    const levels: LiquidityLevel[] = [];
    const priceVolumeMap = new Map<number, number>();
    
    // Aggregate volume at price levels
    candles.forEach(candle => {
      const prices = [candle.open, candle.high, candle.low, candle.close];
      prices.forEach(price => {
        const roundedPrice = Math.round(price * 100) / 100;
        priceVolumeMap.set(roundedPrice, (priceVolumeMap.get(roundedPrice) || 0) + candle.volume);
      });
    });
    
    // Find high-volume levels (liquidity pools)
    const sortedLevels = Array.from(priceVolumeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20); // Top 20 liquidity levels
    
    sortedLevels.forEach(([price, volume]) => {
      levels.push({
        price,
        volume,
        type: 'PIVOT',
        strength: Math.min(volume / 1000000, 10) // Normalize strength
      });
    });
    
    return levels;
  }, []);

  // VOLUME PROFILE ANALYSIS
  const analyzeVolumeProfile = useCallback((candles: CandleData[]): VolumeProfile[] => {
    const profile: VolumeProfile[] = [];
    const priceRanges = new Map<number, { total: number; buy: number; sell: number }>();
    
    candles.forEach(candle => {
      const priceRange = Math.floor(candle.close / 0.5) * 0.5; // 50 cent buckets
      const isGreen = candle.close > candle.open;
      
      if (!priceRanges.has(priceRange)) {
        priceRanges.set(priceRange, { total: 0, buy: 0, sell: 0 });
      }
      
      const range = priceRanges.get(priceRange)!;
      range.total += candle.volume;
      
      if (isGreen) {
        range.buy += candle.volume;
      } else {
        range.sell += candle.volume;
      }
    });
    
    priceRanges.forEach((data, price) => {
      const imbalance = (data.buy - data.sell) / data.total;
      profile.push({
        price,
        volume: data.total,
        buyVolume: data.buy,
        sellVolume: data.sell,
        imbalance
      });
    });
    
    return profile.sort((a, b) => b.volume - a.volume);
  }, []);

  // ALPHA SIGNAL GENERATION
  const generateAlphaSignal = useCallback((
    symbol: string, 
    candles: CandleData[], 
    structure: MarketStructure,
    indicators: TechnicalIndicators
  ): AlphaSignal | null => {
    const lastCandle = candles[candles.length - 1];
    if (!lastCandle) return null;
    
    const currentPrice = lastCandle.close;
    const atr = indicators.atr;
    
    // STRUCTURAL BREAK SIGNAL
    const recentBreaks = structure.breakoutLevels.filter(level => 
      Math.abs(level - currentPrice) < atr * 0.5
    );
    
    if (recentBreaks.length > 0) {
      const breakLevel = recentBreaks[0];
      if (!breakLevel) return null;
      
      const isBreakoutUp = currentPrice > breakLevel;
      
      return {
        symbol,
        type: 'STRUCTURAL_BREAK',
        confidence: 85,
        entry: currentPrice,
        stop: isBreakoutUp ? currentPrice - atr * 1.5 : currentPrice + atr * 1.5,
        targets: isBreakoutUp ? 
          [currentPrice + atr * 2, currentPrice + atr * 4] :
          [currentPrice - atr * 2, currentPrice - atr * 4],
        reasoning: `Structural break at ${breakLevel.toFixed(2)}. ATR: ${atr.toFixed(2)}`,
        timestamp: Date.now()
      };
    }
    
    // LIQUIDITY HUNT SIGNAL
    const nearbyLiquidity = structure.liquidityLevels.find(level =>
      Math.abs(level.price - currentPrice) < atr * 0.3
    );
    
    if (nearbyLiquidity && nearbyLiquidity.strength > 5) {
      return {
        symbol,
        type: 'LIQUIDITY_HUNT',
        confidence: 75,
        entry: nearbyLiquidity.price,
        stop: nearbyLiquidity.price + (currentPrice > nearbyLiquidity.price ? -atr : atr),
        targets: [nearbyLiquidity.price + (currentPrice > nearbyLiquidity.price ? atr * 2 : -atr * 2)],
        reasoning: `Liquidity hunt at ${nearbyLiquidity.price.toFixed(2)}. Strength: ${nearbyLiquidity.strength}`,
        timestamp: Date.now()
      };
    }
    
    // VOLUME IMBALANCE SIGNAL
    const recentProfile = structure.volumeProfile.slice(0, 5);
    const avgImbalance = recentProfile.reduce((sum, p) => sum + p.imbalance, 0) / recentProfile.length;
    
    if (Math.abs(avgImbalance) > 0.3) {
      const isBullish = avgImbalance > 0;
      
      return {
        symbol,
        type: 'VOLUME_IMBALANCE',
        confidence: 70,
        entry: currentPrice,
        stop: isBullish ? currentPrice - atr * 1.2 : currentPrice + atr * 1.2,
        targets: isBullish ? 
          [currentPrice + atr * 1.5, currentPrice + atr * 3] :
          [currentPrice - atr * 1.5, currentPrice - atr * 3],
        reasoning: `Volume imbalance: ${(avgImbalance * 100).toFixed(1)}% ${isBullish ? 'bullish' : 'bearish'}`,
        timestamp: Date.now()
      };
    }
    
    return null;
  }, []);

  // CONTINUOUS ANALYSIS ENGINE
  const runAnalysis = useCallback(() => {
    const newStructure: Record<string, MarketStructure> = {};
    const newSignals: AlphaSignal[] = [];
    const newBreaks: Record<string, number[]> = {};
    
    symbols.forEach(symbol => {
      const symbolCandles = candles[symbol];
      const symbolIndicators = indicators[symbol];
      
      if (!symbolCandles || symbolCandles.length < 50 || !symbolIndicators) return;
      
      // Analyze market structure
      const breaks = detectStructuralBreaks(symbolCandles);
      const liquidityLevels = mapLiquidityPools(symbolCandles);
      const volumeProfile = analyzeVolumeProfile(symbolCandles);
      
      const structure: MarketStructure = {
        trend: symbolIndicators.ema12 > symbolIndicators.ema26 ? 'BULLISH' : 'BEARISH',
        support: [],
        resistance: [],
        breakoutLevels: breaks,
        liquidityLevels,
        volumeProfile
      };
      
      newStructure[symbol] = structure;
      newBreaks[symbol] = breaks;
      
      // Generate alpha signals
      const signal = generateAlphaSignal(symbol, symbolCandles, structure, symbolIndicators);
      if (signal) {
        newSignals.push(signal);
        onAlphaSignal(signal);
      }
    });
    
    setMarketStructure(newStructure);
    setStructuralBreaks(newBreaks);
    setActiveSignals(prev => [...prev, ...newSignals].slice(-50)); // Keep last 50 signals
  }, [symbols, candles, indicators, detectStructuralBreaks, mapLiquidityPools, analyzeVolumeProfile, generateAlphaSignal, onAlphaSignal]);

  // ANALYSIS LOOP
  useEffect(() => {
    runAnalysis();
    
    analysisRef.current = setInterval(runAnalysis, 5000); // Analyze every 5 seconds
    
    return () => {
      if (analysisRef.current) {
        clearInterval(analysisRef.current);
      }
    };
  }, [runAnalysis]);

  // LETHAL UI - ZERO DECORATION
  return (
    <div className="w-full h-full bg-black border border-green-500 font-mono text-green-400 p-2">
      <div className="text-xs mb-2 border-b border-green-500 pb-1">
        ⚔️ TradingVision Pro | STRUCTURAL EDGE ANALYSIS
      </div>
      
      {/* ACTIVE SIGNALS */}
      <div className="mb-4">
        <div className="text-xs mb-1">ACTIVE ALPHA SIGNALS:</div>
        <div className="h-32 overflow-y-auto border border-green-500 p-1 text-xs">
          {activeSignals.slice(-10).map((signal, idx) => (
            <div key={idx} className="mb-1 border-b border-green-500/30 pb-1">
              <div className="flex justify-between">
                <span>{signal.symbol}</span>
                <span className="text-red-400">{signal.confidence}%</span>
              </div>
              <div className="text-xs text-green-300">
                {signal.type} | E:{signal.entry.toFixed(2)} | S:{signal.stop.toFixed(2)} | T:{signal.targets[0]?.toFixed(2) || 'N/A'}
              </div>
              <div className="text-xs text-gray-400 truncate">{signal.reasoning}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* MARKET STRUCTURE */}
      <div className="mb-4">
        <div className="text-xs mb-1">MARKET STRUCTURE:</div>
        <div className="h-40 overflow-y-auto border border-green-500 p-1 text-xs">
          {symbols.map(symbol => {
            const structure = marketStructure[symbol];
            const breaks = structuralBreaks[symbol] || [];
            
            if (!structure) return null;
            
            return (
              <div key={symbol} className="mb-2 border-b border-green-500/30 pb-1">
                <div className="flex justify-between">
                  <span>{symbol}</span>
                  <span className={
                    structure.trend === 'BULLISH' ? 'text-green-400' : 
                    structure.trend === 'BEARISH' ? 'text-red-400' : 'text-yellow-400'
                  }>
                    {structure.trend}
                  </span>
                </div>
                <div className="text-xs">
                  Breaks: {breaks.length} | Liquidity: {structure.liquidityLevels.length} | Volume Profile: {structure.volumeProfile.length}
                </div>
                <div className="text-xs text-gray-400">
                  Top Liquidity: {structure.liquidityLevels[0]?.price.toFixed(2)} (S:{structure.liquidityLevels[0]?.strength.toFixed(1)})
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* SYSTEM STATUS */}
      <div className="text-xs border-t border-green-500 pt-1">
        <div className="flex justify-between">
          <span>EDGE STATUS: ACTIVE</span>
          <span>SYMBOLS: {symbols.length}</span>
        </div>
        <div className="flex justify-between">
          <span>SIGNALS: {activeSignals.length}</span>
          <span>LAST SCAN: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TradingVisionPro;
