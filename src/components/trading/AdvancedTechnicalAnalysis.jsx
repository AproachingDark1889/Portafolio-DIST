import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Target, Zap, Brain, 
  AlertTriangle, CheckCircle, XCircle, ArrowUp, ArrowDown 
} from 'lucide-react';
import { gsap } from 'gsap';

const AdvancedTechnicalAnalysis = ({ marketData, className = "" }) => {
  const [technicalSignals, setTechnicalSignals] = useState({});
  const [tradingSignals, setTradingSignals] = useState([]);
  const signalsRef = useRef();

  // Calcular indicadores técnicos avanzados
  const calculateTechnicalIndicators = (symbol, data) => {
    if (!data.price) return null;

    // Simular datos históricos para cálculos
    const historicalPrices = Array.from({ length: 20 }, (_, i) => {
      const variance = 0.02 * Math.sin(i * 0.5) + (Math.random() - 0.5) * 0.01;
      return data.price * (1 + variance);
    });

    // RSI (Relative Strength Index)
    const calculateRSI = (prices, period = 14) => {
      let gains = 0, losses = 0;
      for (let i = 1; i < period; i++) {
        const change = prices[i] - prices[i - 1];
        if (change > 0) gains += change;
        else losses -= change;
      }
      const avgGain = gains / period;
      const avgLoss = losses / period;
      const rs = avgGain / avgLoss;
      return 100 - (100 / (1 + rs));
    };

    // MACD (Moving Average Convergence Divergence)
    const calculateMACD = (prices) => {
      const ema12 = prices.slice(-12).reduce((sum, price) => sum + price, 0) / 12;
      const ema26 = prices.slice(-26).reduce((sum, price) => sum + price, 0) / 26;
      const macdLine = ema12 - ema26;
      const signalLine = macdLine * 0.9; // Simplificado
      return { macdLine, signalLine, histogram: macdLine - signalLine };
    };

    // Bollinger Bands
    const calculateBollingerBands = (prices, period = 20) => {
      const sma = prices.reduce((sum, price) => sum + price, 0) / prices.length;
      const variance = prices.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / prices.length;
      const stdDev = Math.sqrt(variance);
      return {
        upper: sma + (stdDev * 2),
        middle: sma,
        lower: sma - (stdDev * 2),
        currentPrice: data.price
      };
    };

    // Support and Resistance
    const findSupportResistance = (prices) => {
      const highs = prices.filter((_, i) => i % 3 === 0).sort((a, b) => b - a);
      const lows = prices.filter((_, i) => i % 3 === 1).sort((a, b) => a - b);
      return {
        resistance: highs[0],
        support: lows[0]
      };
    };

    const rsi = calculateRSI(historicalPrices);
    const macd = calculateMACD(historicalPrices);
    const bollinger = calculateBollingerBands(historicalPrices);
    const supportResistance = findSupportResistance(historicalPrices);

    // Generar señales de trading
    const signals = [];
    
    // RSI Signals
    if (rsi > 70) {
      signals.push({
        type: 'SELL',
        indicator: 'RSI',
        strength: 'HIGH',
        message: `${symbol} RSI overbought at ${rsi.toFixed(1)}`,
        confidence: 85
      });
    } else if (rsi < 30) {
      signals.push({
        type: 'BUY',
        indicator: 'RSI',
        strength: 'HIGH',
        message: `${symbol} RSI oversold at ${rsi.toFixed(1)}`,
        confidence: 82
      });
    }

    // MACD Signals
    if (macd.histogram > 0 && macd.macdLine > macd.signalLine) {
      signals.push({
        type: 'BUY',
        indicator: 'MACD',
        strength: 'MEDIUM',
        message: `${symbol} MACD bullish crossover`,
        confidence: 75
      });
    } else if (macd.histogram < 0 && macd.macdLine < macd.signalLine) {
      signals.push({
        type: 'SELL',
        indicator: 'MACD',
        strength: 'MEDIUM',
        message: `${symbol} MACD bearish crossover`,
        confidence: 73
      });
    }

    // Bollinger Bands Signals
    if (data.price > bollinger.upper) {
      signals.push({
        type: 'SELL',
        indicator: 'BB',
        strength: 'MEDIUM',
        message: `${symbol} price above upper Bollinger Band`,
        confidence: 68
      });
    } else if (data.price < bollinger.lower) {
      signals.push({
        type: 'BUY',
        indicator: 'BB',
        strength: 'MEDIUM',
        message: `${symbol} price below lower Bollinger Band`,
        confidence: 70
      });
    }

    // Support/Resistance Signals
    if (data.price > supportResistance.resistance * 1.01) {
      signals.push({
        type: 'BUY',
        indicator: 'S/R',
        strength: 'HIGH',
        message: `${symbol} breakout above resistance`,
        confidence: 88
      });
    } else if (data.price < supportResistance.support * 0.99) {
      signals.push({
        type: 'SELL',
        indicator: 'S/R',
        strength: 'HIGH',
        message: `${symbol} breakdown below support`,
        confidence: 85
      });
    }

    return {
      rsi,
      macd,
      bollinger,
      supportResistance,
      signals,
      overallSentiment: signals.length > 0 ? 
        (signals.filter(s => s.type === 'BUY').length > signals.filter(s => s.type === 'SELL').length ? 'BULLISH' : 'BEARISH') : 'NEUTRAL'
    };
  };

  // Actualizar análisis técnico
  useEffect(() => {
    const newTechnicalSignals = {};
    const newTradingSignals = [];

    Object.entries(marketData).forEach(([symbol, data]) => {
      const analysis = calculateTechnicalIndicators(symbol, data);
      if (analysis) {
        newTechnicalSignals[symbol] = analysis;
        newTradingSignals.push(...analysis.signals.map(signal => ({
          ...signal,
          symbol,
          timestamp: Date.now()
        })));
      }
    });

    setTechnicalSignals(newTechnicalSignals);
    setTradingSignals(prev => [...newTradingSignals, ...prev.slice(0, 10)]); // Keep last 10
  }, [marketData]);

  // Animación de nuevas señales
  useEffect(() => {
    if (signalsRef.current && tradingSignals.length > 0) {
      gsap.fromTo(signalsRef.current.children,
        { scale: 0.8, opacity: 0, x: 50 },
        { scale: 1, opacity: 1, x: 0, duration: 0.5, stagger: 0.1, ease: "back.out(1.7)" }
      );
    }
  }, [tradingSignals]);

  const getSignalIcon = (type) => {
    switch (type) {
      case 'BUY':
        return <ArrowUp className="w-4 h-4 text-green-400" />;
      case 'SELL':
        return <ArrowDown className="w-4 h-4 text-red-400" />;
      default:
        return <Target className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 'HIGH':
        return 'border-red-500/50 bg-red-500/20 text-red-300';
      case 'MEDIUM':
        return 'border-yellow-500/50 bg-yellow-500/20 text-yellow-300';
      case 'LOW':
        return 'border-green-500/50 bg-green-500/20 text-green-300';
      default:
        return 'border-gray-500/50 bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Technical Indicators Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-4 border border-indigo-500/30"
      >
        <div className="flex items-center space-x-2 mb-4">
          <Brain className="w-5 h-5 text-indigo-400" />
          <h3 className="text-lg font-bold text-white">Technical Analysis</h3>
          <div className="text-xs bg-gradient-to-r from-indigo-500 to-purple-500 px-2 py-1 rounded text-white">
            AI-POWERED
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(technicalSignals).map(([symbol, analysis]) => (
            <motion.div
              key={symbol}
              whileHover={{ scale: 1.02 }}
              className="bg-gray-800/50 rounded-lg p-3 border border-gray-700/50"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white">{symbol}</span>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  analysis.overallSentiment === 'BULLISH' ? 'bg-green-500/20 text-green-400' :
                  analysis.overallSentiment === 'BEARISH' ? 'bg-red-500/20 text-red-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {analysis.overallSentiment}
                </div>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">RSI:</span>
                  <span className={
                    analysis.rsi > 70 ? 'text-red-400' :
                    analysis.rsi < 30 ? 'text-green-400' : 'text-gray-300'
                  }>
                    {analysis.rsi.toFixed(1)}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">MACD:</span>
                  <span className={analysis.macd.histogram > 0 ? 'text-green-400' : 'text-red-400'}>
                    {analysis.macd.histogram > 0 ? 'Bullish' : 'Bearish'}
                  </span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">BB Position:</span>
                  <span className="text-gray-300">
                    {analysis.bollinger.currentPrice > analysis.bollinger.upper ? 'Above' :
                     analysis.bollinger.currentPrice < analysis.bollinger.lower ? 'Below' : 'Middle'}
                  </span>
                </div>
                
                <div className="mt-2 pt-2 border-t border-gray-700/50">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Support:</span>
                    <span className="text-blue-400">${analysis.supportResistance.support.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Resistance:</span>
                    <span className="text-orange-400">${analysis.supportResistance.resistance.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Live Trading Signals */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 rounded-xl p-4 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Live Trading Signals</h3>
            <div className="bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold">
              {tradingSignals.length}
            </div>
          </div>
          
          <div className="text-xs text-gray-400">
            Last update: {new Date().toLocaleTimeString()}
          </div>
        </div>

        <div ref={signalsRef} className="space-y-2 max-h-64 overflow-y-auto">
          <AnimatePresence>
            {tradingSignals.slice(0, 8).map((signal, index) => (
              <motion.div
                key={`${signal.symbol}-${signal.indicator}-${signal.timestamp}`}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${getStrengthColor(signal.strength)}`}
              >
                <div className="flex-shrink-0">
                  {getSignalIcon(signal.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white">{signal.symbol}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      signal.type === 'BUY' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                    }`}>
                      {signal.type}
                    </span>
                    <span className="text-xs text-gray-400">{signal.indicator}</span>
                  </div>
                  <p className="text-sm text-gray-300 truncate">{signal.message}</p>
                </div>
                
                <div className="flex-shrink-0 text-right">
                  <div className="text-xs text-gray-400">Confidence</div>
                  <div className="text-sm font-bold text-white">{signal.confidence}%</div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedTechnicalAnalysis;
