import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown, Volume2, Activity, Target, Zap, AlertTriangle, X } from 'lucide-react';
import { gsap } from 'gsap';

const AdvancedChartPanel = ({ 
  symbol, 
  onClose, 
  onAlert, 
  audioEnabled = true, 
  size = 'normal',
  position = { x: 0, y: 0 }
}) => {
  const chartContainerRef = useRef();
  const chartRef = useRef();
  const candlestickSeriesRef = useRef();
  const volumeSeriesRef = useRef();
  const smaSeriesRef = useRef();
  const rsiSeriesRef = useRef();
  const alertPanelRef = useRef();

  const [chartData, setChartData] = useState([]);
  const [volumeData, setVolumeData] = useState([]);
  const [indicators, setIndicators] = useState({
    sma: [],
    rsi: [],
    macd: { line: [], signal: [], histogram: [] }
  });
  
  const [marketData, setMarketData] = useState({
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    high24h: 0,
    low24h: 0
  });

  const [timeframe, setTimeframe] = useState('1D');
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [patterns, setPatterns] = useState([]);

  // Configuración avanzada del chart
  const chartOptions = {
    layout: {
      background: { type: 'solid', color: 'transparent' },
      textColor: '#E5E7EB',
      fontSize: 11,
      fontFamily: 'Inter, system-ui, sans-serif'
    },
    grid: {
      vertLines: { color: 'rgba(42, 46, 57, 0.3)' },
      horzLines: { color: 'rgba(42, 46, 57, 0.3)' }
    },
    crosshair: {
      mode: 0,
      vertLine: {
        color: '#758CAA',
        width: 1,
        labelBackgroundColor: '#4338CA'
      },
      horzLine: {
        color: '#758CAA',
        width: 1,
        labelBackgroundColor: '#4338CA'
      }
    },
    rightPriceScale: {
      borderColor: 'rgba(197, 203, 206, 0.4)',
      scaleMargins: { top: 0.1, bottom: 0.1 }
    },
    timeScale: {
      borderColor: 'rgba(197, 203, 206, 0.4)',
      timeVisible: true,
      secondsVisible: false
    },
    watermark: {
      visible: true,
      fontSize: 18,
      horzAlign: 'center',
      vertAlign: 'center',
      color: 'rgba(171, 71, 188, 0.1)',
      text: symbol
    }
  };

  // Generar datos OHLC realistas
  const generateOHLCData = useCallback((basePrice, days = 100) => {
    const data = [];
    const volumeData = [];
    let currentPrice = basePrice;
    const startTime = Date.now() - (days * 24 * 60 * 60 * 1000);
    
    for (let i = 0; i < days; i++) {
      const time = startTime + (i * 24 * 60 * 60 * 1000);
      
      // Movimiento precio con tendencias realistas
      const volatility = 0.02 + Math.random() * 0.03;
      const trend = Math.sin(i / 20) * 0.001;
      const randomWalk = (Math.random() - 0.5) * volatility;
      
      const open = currentPrice;
      const change = currentPrice * (trend + randomWalk);
      currentPrice += change;
      
      // Generar high/low realistas
      const dayRange = Math.abs(change) + (currentPrice * (Math.random() * 0.01));
      const high = Math.max(open, currentPrice) + (dayRange * Math.random());
      const low = Math.min(open, currentPrice) - (dayRange * Math.random());
      
      data.push({
        time: Math.floor(time / 1000),
        open: parseFloat(open.toFixed(2)),
        high: parseFloat(high.toFixed(2)),
        low: parseFloat(low.toFixed(2)),
        close: parseFloat(currentPrice.toFixed(2))
      });
      
      // Volumen correlacionado con volatilidad
      const baseVolume = 1000000;
      const volumeMultiplier = 1 + (Math.abs(randomWalk) * 10);
      volumeData.push({
        time: Math.floor(time / 1000),
        value: Math.floor(baseVolume * volumeMultiplier),
        color: currentPrice > open ? 'rgba(34, 197, 94, 0.5)' : 'rgba(239, 68, 68, 0.5)'
      });
    }
    
    return { ohlc: data, volume: volumeData };
  }, []);

  // Calcular SMA (Simple Moving Average)
  const calculateSMA = useCallback((data, period = 20) => {
    const sma = [];
    for (let i = period - 1; i < data.length; i++) {
      const sum = data.slice(i - period + 1, i + 1).reduce((acc, item) => acc + item.close, 0);
      sma.push({
        time: data[i].time,
        value: parseFloat((sum / period).toFixed(2))
      });
    }
    return sma;
  }, []);

  // Calcular RSI (Relative Strength Index)
  const calculateRSI = useCallback((data, period = 14) => {
    const rsi = [];
    let gains = 0;
    let losses = 0;
    
    // Calcular primer promedio
    for (let i = 1; i <= period; i++) {
      const change = data[i].close - data[i - 1].close;
      if (change > 0) gains += change;
      else losses -= change;
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    for (let i = period; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close;
      const currentGain = change > 0 ? change : 0;
      const currentLoss = change < 0 ? -change : 0;
      
      avgGain = (avgGain * (period - 1) + currentGain) / period;
      avgLoss = (avgLoss * (period - 1) + currentLoss) / period;
      
      const rs = avgGain / avgLoss;
      const rsiValue = 100 - (100 / (1 + rs));
      
      rsi.push({
        time: data[i].time,
        value: parseFloat(rsiValue.toFixed(2))
      });
    }
    
    return rsi;
  }, []);

  // Detectar patrones técnicos
  const detectPatterns = useCallback((data) => {
    const patterns = [];
    const recentData = data.slice(-20); // Últimos 20 períodos
    
    recentData.forEach((candle, index) => {
      if (index < 3) return;
      
      const prev3 = recentData[index - 3];
      const prev2 = recentData[index - 2];
      const prev1 = recentData[index - 1];
      const current = candle;
      
      // Detectar Doji
      const bodySize = Math.abs(current.close - current.open);
      const shadowSize = current.high - current.low;
      if (bodySize < shadowSize * 0.1) {
        patterns.push({
          type: 'Doji',
          time: current.time,
          signal: 'neutral',
          strength: 0.7
        });
      }
      
      // Detectar Hammer/Hanging Man
      const lowerShadow = Math.min(current.open, current.close) - current.low;
      const upperShadow = current.high - Math.max(current.open, current.close);
      if (lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5) {
        patterns.push({
          type: prev1.close < current.close ? 'Hammer' : 'Hanging Man',
          time: current.time,
          signal: prev1.close < current.close ? 'bullish' : 'bearish',
          strength: 0.8
        });
      }
    });
    
    return patterns;
  }, []);

  // Sistema de alertas inteligentes
  const checkAlerts = useCallback((currentPrice, data) => {
    const newAlerts = [];
    
    if (data.length < 20) return newAlerts;
    
    const sma20 = indicators.sma[indicators.sma.length - 1]?.value;
    const rsi = indicators.rsi[indicators.rsi.length - 1]?.value;
    
    // Alert: Precio cruza SMA
    if (sma20 && Math.abs(currentPrice - sma20) / sma20 < 0.001) {
      newAlerts.push({
        type: 'SMA_CROSS',
        message: `${symbol} crossing SMA(20) at $${currentPrice}`,
        severity: 'medium',
        time: Date.now()
      });
    }
    
    // Alert: RSI extremos
    if (rsi && (rsi > 80 || rsi < 20)) {
      newAlerts.push({
        type: 'RSI_EXTREME',
        message: `${symbol} RSI at ${rsi.toFixed(1)} - ${rsi > 80 ? 'Overbought' : 'Oversold'}`,
        severity: 'high',
        time: Date.now()
      });
    }
    
    // Alert: Breakout de precio
    const recent = data.slice(-10);
    const resistance = Math.max(...recent.map(d => d.high));
    const support = Math.min(...recent.map(d => d.low));
    
    if (currentPrice > resistance * 1.01) {
      newAlerts.push({
        type: 'BREAKOUT_UP',
        message: `${symbol} breaking resistance at $${resistance.toFixed(2)}`,
        severity: 'high',
        time: Date.now()
      });
    }
    
    return newAlerts;
  }, [symbol, indicators]);

  // Inicializar chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      ...chartOptions,
      width: chartContainerRef.current.clientWidth,
      height: size === 'large' ? 600 : size === 'small' ? 300 : 450
    });

    chartRef.current = chart;

    // Crear series - API correcta para lightweight-charts v5
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22C55E',
      downColor: '#EF4444',
      borderVisible: false,
      wickUpColor: '#22C55E',
      wickDownColor: '#EF4444'
    });

    const volumeSeries = chart.addHistogramSeries({
      color: '#26A69A',
      priceFormat: { type: 'volume' },
      priceScaleId: 'volume'
    });

    const smaSeries = chart.addLineSeries({
      color: '#F59E0B',
      lineWidth: 2,
      title: 'SMA(20)'
    });

    candlestickSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;
    smaSeriesRef.current = smaSeries;

    // Configurar escala de volumen
    chart.priceScale('volume').applyOptions({
      scaleMargins: { top: 0.7, bottom: 0 }
    });

    return () => {
      chart.remove();
    };
  }, [size, chartOptions]);

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      
      try {
        // Simular carga de datos (en producción: Alpha Vantage/Finnhub)
        const basePrice = symbol.includes('BTC') ? 45000 : 
                         symbol === 'AAPL' ? 185 :
                         symbol === 'TSLA' ? 250 : 150;
        
        const { ohlc, volume } = generateOHLCData(basePrice, 100);
        
        // Calcular indicadores
        const smaData = calculateSMA(ohlc, 20);
        const rsiData = calculateRSI(ohlc, 14);
        const detectedPatterns = detectPatterns(ohlc);
        
        // Configurar datos en el chart
        if (candlestickSeriesRef.current) {
          candlestickSeriesRef.current.setData(ohlc);
        }
        if (volumeSeriesRef.current) {
          volumeSeriesRef.current.setData(volume);
        }
        if (smaSeriesRef.current) {
          smaSeriesRef.current.setData(smaData);
        }
        
        setChartData(ohlc);
        setVolumeData(volume);
        setIndicators(prev => ({ ...prev, sma: smaData, rsi: rsiData }));
        setPatterns(detectedPatterns);
        
        // Configurar datos de mercado actuales
        const lastCandle = ohlc[ohlc.length - 1];
        const prevCandle = ohlc[ohlc.length - 2];
        const change = lastCandle.close - prevCandle.close;
        const changePercent = (change / prevCandle.close) * 100;
        
        setMarketData({
          price: lastCandle.close,
          change,
          changePercent,
          volume: volume[volume.length - 1]?.value || 0,
          high24h: Math.max(...ohlc.slice(-24).map(d => d.high)),
          low24h: Math.min(...ohlc.slice(-24).map(d => d.low))
        });
        
        // Verificar alertas
        const newAlerts = checkAlerts(lastCandle.close, ohlc);
        if (newAlerts.length > 0) {
          setAlerts(prev => [...prev, ...newAlerts]);
          onAlert && onAlert(newAlerts);
        }
        
      } catch (error) {
        console.error('Error loading chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [symbol, generateOHLCData, calculateSMA, calculateRSI, detectPatterns, checkAlerts, onAlert]);

  // Animaciones de entrada
  useEffect(() => {
    if (alertPanelRef.current && alerts.length > 0) {
      gsap.fromTo(alertPanelRef.current, 
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.5, ease: "back.out(1.7)" }
      );
    }
  }, [alerts]);

  // Resize handler
  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && chartContainerRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: size === 'large' ? 600 : size === 'small' ? 300 : 450
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [size]);

  const panelVariants = {
    initial: { scale: 0.9, opacity: 0, y: 20 },
    animate: { scale: 1, opacity: 1, y: 0 },
    exit: { scale: 0.9, opacity: 0, y: -20 }
  };

  return (
    <motion.div
      variants={panelVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-700/50 backdrop-blur-sm ${
        size === 'large' ? 'w-full h-[700px]' : 
        size === 'small' ? 'w-96 h-80' : 
        'w-[600px] h-[520px]'
      }`}
      style={{ 
        position: 'absolute',
        left: position.x,
        top: position.y,
        zIndex: 10
      }}
    >
      {/* Header con datos de mercado */}
      <div className="p-4 border-b border-gray-700/50 bg-gradient-to-r from-indigo-900/50 to-purple-900/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-indigo-400" />
              <h3 className="text-lg font-bold text-white">{symbol}</h3>
              <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
                marketData.changePercent >= 0 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {marketData.changePercent >= 0 ? '+' : ''}{marketData.changePercent.toFixed(2)}%
              </div>
            </div>
            
            <div className="flex items-center space-x-4 text-sm text-gray-300">
              <div className="flex items-center space-x-1">
                <span className="text-xs text-gray-500">Price:</span>
                <span className="font-mono">${marketData.price.toFixed(2)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Volume2 className="w-3 h-3" />
                <span className="font-mono">{(marketData.volume / 1000000).toFixed(1)}M</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Timeframe selector */}
            <div className="flex bg-gray-800/50 rounded-lg p-1">
              {['1H', '4H', '1D', '1W'].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 text-xs rounded transition-all ${
                    timeframe === tf
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
            
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart container */}
      <div className="relative flex-1">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-20">
            <div className="flex flex-col items-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
              <span className="text-sm text-gray-400">Loading market data...</span>
            </div>
          </div>
        )}
        
        <div 
          ref={chartContainerRef} 
          className="w-full h-full"
        />
        
        {/* Alertas overlay */}
        <AnimatePresence>
          {alerts.length > 0 && (
            <motion.div
              ref={alertPanelRef}
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute top-4 right-4 space-y-2 max-w-xs"
            >
              {alerts.slice(-3).map((alert, index) => (
                <motion.div
                  key={`${alert.type}-${alert.time}`}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg backdrop-blur-sm border ${
                    alert.severity === 'high' 
                      ? 'bg-red-500/20 border-red-500/50 text-red-300'
                      : 'bg-yellow-500/20 border-yellow-500/50 text-yellow-300'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {alert.severity === 'high' ? (
                      <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    ) : (
                      <Target className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    )}
                    <span className="text-xs leading-tight">{alert.message}</span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Patterns overlay */}
        {patterns.length > 0 && (
          <div className="absolute bottom-4 left-4">
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-lg p-3 max-w-xs">
              <div className="flex items-center space-x-2 mb-2">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-medium text-white">Patterns Detected</span>
              </div>
              <div className="space-y-1">
                {patterns.slice(-2).map((pattern, index) => (
                  <div key={index} className="text-xs text-gray-300">
                    <span className={`font-medium ${
                      pattern.signal === 'bullish' ? 'text-green-400' :
                      pattern.signal === 'bearish' ? 'text-red-400' :
                      'text-yellow-400'
                    }`}>
                      {pattern.type}
                    </span>
                    <span className="text-gray-500 ml-2">
                      {(pattern.strength * 100).toFixed(0)}% confidence
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default AdvancedChartPanel;
