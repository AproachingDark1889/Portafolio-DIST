import React, { useEffect, useRef, useState } from 'react';
import { createChart, IChartApi, ColorType, CrosshairMode } from 'lightweight-charts';
import { motion } from 'framer-motion';
import { 
  TrendingUp, TrendingDown, Volume2, Maximize2, Minimize2, 
  X, BarChart3, Activity 
} from 'lucide-react';
import { useMarketStore } from '@/stores/marketStore';

interface ProfessionalChartProps {
  symbol: string;
  height?: number;
  showControls?: boolean;
  onRemove?: () => void;
  className?: string;
}

/**
 * PROFESSIONAL TRADING CHART
 * 
 * Single unified chart component
 * NO MORE DUPLICATED CODE
 * Real TradingView-level functionality
 */
export const ProfessionalChart: React.FC<ProfessionalChartProps> = ({
  symbol,
  height = 400,
  showControls = true,
  onRemove,
  className = ''
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [theme] = useState<'dark' | 'light'>('dark');
  
  // Get data from professional store
  const { 
    getSymbolData = () => ({ candles: [], indicators: null, lastUpdate: null }), 
    getTechnicalSummary = () => ({ trend: 'neutral', strength: 50, signals: [] }), 
    indicators = {}
  } = useMarketStore();
  
  const symbolData = getSymbolData(symbol);
  const symbolCandles = symbolData.candles || [];
  const technicalSummary = getTechnicalSummary(symbol);
  const symbolIndicators = indicators[symbol];

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: theme === 'dark' ? '#1a1a1a' : '#ffffff' 
        },
        textColor: theme === 'dark' ? '#d1d5db' : '#374151',
      },
      width: chartContainerRef.current.clientWidth,
      height: height,
      grid: {
        vertLines: { color: theme === 'dark' ? '#2d2d2d' : '#e5e7eb' },
        horzLines: { color: theme === 'dark' ? '#2d2d2d' : '#e5e7eb' },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: {
          width: 1,
          color: theme === 'dark' ? '#6366f1' : '#4f46e5',
          style: 1,
        },
        horzLine: {
          width: 1,
          color: theme === 'dark' ? '#6366f1' : '#4f46e5',
          style: 1,
        },
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.3 : 0.1,
        },
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#374151' : '#d1d5db',
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#10b981',
      downColor: '#ef4444',
      borderUpColor: '#10b981',
      borderDownColor: '#ef4444',
      wickUpColor: '#10b981',
      wickDownColor: '#ef4444',
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Add volume series if enabled
    if (showVolume) {
      const volumeSeries = (chart as any).addHistogramSeries({
        color: theme === 'dark' ? '#6366f1' : '#4f46e5',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
      });

      chart.priceScale('volume').applyOptions({
        scaleMargins: {
          top: 0.7,
          bottom: 0,
        },
      });

      volumeSeriesRef.current = volumeSeries;
    }

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [theme, height, showVolume]);

  // Update chart data
  useEffect(() => {
    if (!candlestickSeriesRef.current || !symbolCandles.length) return;

    // Convert candles to chart format
    const chartData = symbolCandles.map(candle => ({
      time: Math.floor(candle.time / 1000),
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candlestickSeriesRef.current.setData(chartData);

    // Update volume data
    if (volumeSeriesRef.current && showVolume) {
      const volumeData = symbolCandles.map(candle => ({
        time: Math.floor(candle.time / 1000),
        value: candle.volume,
        color: candle.close >= candle.open ? '#10b98150' : '#ef444450',
      }));

      volumeSeriesRef.current.setData(volumeData);
    }
  }, [symbolCandles, showVolume]);

  // Add technical indicators
  useEffect(() => {
    if (!chartRef.current || !symbolIndicators) return;

    // Add EMA lines
    if (symbolIndicators.ema12 && symbolIndicators.series.ema12.length > 0) {
      const ema12Series = (chartRef.current as any).addLineSeries({
        color: '#f59e0b',
        lineWidth: 2,
        title: 'EMA 12',
      });

      const ema12Data = symbolIndicators.series.ema12.map((value: number, index: number) => ({
        time: Math.floor((symbolCandles[index + (symbolCandles.length - symbolIndicators.series.ema12.length)]?.time || Date.now()) / 1000),
        value,
      }));

      ema12Series.setData(ema12Data);
    }

    if (symbolIndicators.ema26 && symbolIndicators.series.ema26.length > 0) {
      const ema26Series = (chartRef.current as any).addLineSeries({
        color: '#3b82f6',
        lineWidth: 2,
        title: 'EMA 26',
      });

      const ema26Data = symbolIndicators.series.ema26.map((value: number, index: number) => ({
        time: Math.floor((symbolCandles[index + (symbolCandles.length - symbolIndicators.series.ema26.length)]?.time || Date.now()) / 1000),
        value,
      }));

      ema26Series.setData(ema26Data);
    }

    // Add Bollinger Bands
    if (symbolIndicators.bb && typeof symbolIndicators.bb.upper === 'number' && typeof symbolIndicators.bb.lower === 'number') {
      const upperBandSeries = (chartRef.current as any).addLineSeries({
        color: '#8b5cf6',
        lineWidth: 1,
        title: 'BB Upper',
      });

      const lowerBandSeries = (chartRef.current as any).addLineSeries({
        color: '#8b5cf6',
        lineWidth: 1,
        title: 'BB Lower',
      });

      // Use the last 20 candles for band data
      const upperData = symbolCandles.slice(-20).map((candle) => ({
        time: Math.floor(candle.time / 1000),
        value: symbolIndicators.bb!.upper,
      }));

      const lowerData = symbolCandles.slice(-20).map((candle) => ({
        time: Math.floor(candle.time / 1000),
        value: symbolIndicators.bb!.lower,
      }));

      upperBandSeries.setData(upperData);
      lowerBandSeries.setData(lowerData);
    }
  }, [symbolIndicators, symbolCandles]);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const toggleVolume = () => {
    setShowVolume(!showVolume);
  };

  return (
    <motion.div
      className={`bg-gray-900 rounded-xl border border-gray-700 overflow-hidden ${
        isFullscreen ? 'fixed inset-4 z-50' : ''
      } ${className}`}
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      {showControls && (
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">{symbol}</h3>
              {symbolData && symbolCandles.length > 0 && (() => {
                const lastCandle = symbolCandles[symbolCandles.length - 1];
                if (!lastCandle) return null;
                
                const isPositive = lastCandle.close >= lastCandle.open;
                return (
                  <div className={`flex items-center space-x-1 ${
                    isPositive ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    <span className="text-sm font-medium">
                      ${lastCandle.close.toFixed(2)}
                    </span>
                  </div>
                );
              })()}
            </div>
            
            {/* Technical Summary */}
            <div className="flex items-center space-x-2">
              <div className={`px-2 py-1 rounded text-xs font-medium ${
                technicalSummary.trend === 'bullish' 
                  ? 'bg-green-500/20 text-green-400'
                  : technicalSummary.trend === 'bearish'
                  ? 'bg-red-500/20 text-red-400'
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {technicalSummary.trend.toUpperCase()}
              </div>
              <div className="text-xs text-gray-400">
                Strength: {(technicalSummary.strength * 100).toFixed(0)}%
              </div>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleVolume}
              className={`p-2 rounded-lg transition-colors ${
                showVolume ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'
              }`}
              title="Toggle Volume"
            >
              <Volume2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={toggleFullscreen}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            
            {onRemove && (
              <button
                onClick={onRemove}
                className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                title="Remove Chart"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Chart Container */}
      <div 
        ref={chartContainerRef} 
        className="relative"
        style={{ height: isFullscreen ? 'calc(100vh - 200px)' : height }}
      />
      
      {/* Technical Signals Overlay */}
      {technicalSummary.signals.length > 0 && (
        <div className="absolute top-16 left-4 bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 max-w-xs">
          <div className="text-sm font-medium text-white mb-2">Active Signals</div>
          <div className="space-y-1">
            {technicalSummary.signals.slice(0, 3).map((signal, index) => (
              <div key={index} className="text-xs text-gray-300 flex items-center space-x-2">
                <Activity className="w-3 h-3" />
                <span>{signal}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
