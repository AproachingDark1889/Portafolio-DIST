import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import { 
  TrendingUp, TrendingDown, Activity, Volume2, Zap, Target, Bell, 
  Settings, Maximize2, Minimize2, BarChart3, LineChart, PieChart,
  AlertTriangle, Radio, Wifi, WifiOff, Play, Pause, RotateCcw,
  Eye, EyeOff, Layers, Globe, Newspaper, MessageSquare, Brain, VolumeX
} from 'lucide-react';

import AdvancedChartPanel from '../components/trading/AdvancedChartPanel';
import SimpleChart from '../components/trading/SimpleChart';
import RealTimeHeatMap from '../components/trading/RealTimeHeatMap';
import AdvancedTechnicalAnalysis from '../components/trading/AdvancedTechnicalAnalysis';
import SmartAlertPanel from '../components/SmartAlertPanel';
import { 
  useRealTimeMarketData, 
  useMarketSentiment, 
  useHistoricalData 
} from '../hooks/useAdvancedMarketData';
import { useMarketStore } from '../stores/marketStore';

// Advanced 2D Market Visualization Component (sin Three.js)
const AdvancedMarketVisualization = ({ marketData, sentiment }) => {
  const canvasRef = useRef();
  const animationFrameRef = useRef();

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 800;
    const height = canvas.height = 400;

    // Crear partículas para cada símbolo
    const particles = Object.entries(marketData).map(([symbol, data], index) => ({
      symbol,
      x: (index % 4) * (width / 4) + width / 8,
      y: height / 2,
      targetY: height / 2 + (data.changePercent || 0) * 8,
      radius: 15 + Math.abs(data.changePercent || 0) * 2,
      color: data.changePercent >= 0 ? '#22C55E' : '#EF4444',
      pulse: 0,
      data
    }));

    const animate = () => {
      // Clear canvas con efecto de trail
      ctx.fillStyle = 'rgba(17, 24, 39, 0.1)';
      ctx.fillRect(0, 0, width, height);

      // Dibujar grid de fondo
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      particles.forEach((particle, index) => {
        // Animar posición hacia target
        particle.y += (particle.targetY - particle.y) * 0.1;
        particle.pulse += 0.1;

        // Dibujar círculo principal
        const glowRadius = particle.radius + Math.sin(particle.pulse) * 5;
        
        // Glow effect
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, glowRadius
        );
        gradient.addColorStop(0, particle.color + '80');
        gradient.addColorStop(0.7, particle.color + '20');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, glowRadius, 0, Math.PI * 2);
        ctx.fill();

        // Círculo sólido
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fill();

        // Texto del símbolo
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 12px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(particle.symbol, particle.x, particle.y + 4);

        // Precio debajo
        ctx.fillStyle = particle.color;
        ctx.font = '10px Inter';
        ctx.fillText(
          `$${particle.data.price?.toFixed(2) || '0.00'}`, 
          particle.x, 
          particle.y + particle.radius + 15
        );

        // Líneas de conexión entre partículas
        if (index < particles.length - 1) {
          const nextParticle = particles[index + 1];
          ctx.strokeStyle = 'rgba(99, 102, 241, 0.3)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(nextParticle.x, nextParticle.y);
          ctx.stroke();
        }
      });

      // Efecto de ondas en el centro
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.5)';
      ctx.lineWidth = 2;
      const waveRadius = 50 + Math.sin(Date.now() * 0.005) * 20;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, waveRadius, 0, Math.PI * 2);
      ctx.stroke();

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [marketData]);

  return (
    <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 to-indigo-900 border border-indigo-500/30">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        width={800}
        height={400}
      />
      <div className="absolute top-4 left-4 text-white">
        <div className="text-lg font-bold">Real-Time Market Flow</div>
        <div className="text-sm text-gray-300">Advanced 2D Visualization</div>
      </div>
    </div>
  );
};

// Sentiment Analysis Panel
const SentimentPanel = ({ sentimentData, newsFlow, onNewsClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-xl p-4 backdrop-blur-sm border border-purple-500/30"
    >
      <div className="flex items-center space-x-2 mb-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-bold text-white">Market Sentiment</h3>
        <div className="flex-1"></div>
        <div className="text-xs text-purple-300">AI-Powered</div>
      </div>
      
      {/* Sentiment indicators */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        {Object.entries(sentimentData).map(([symbol, data]) => (
          <div key={symbol} className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">{symbol}</span>
              <div className={`w-2 h-2 rounded-full ${
                data.sentiment === 'bullish' ? 'bg-green-400' :
                data.sentiment === 'bearish' ? 'bg-red-400' : 'bg-yellow-400'
              }`} />
            </div>
            <div className="text-xs text-gray-300">
              <div className="flex justify-between">
                <span>Score:</span>
                <span className={data.score > 0 ? 'text-green-400' : 'text-red-400'}>
                  {data.score.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Mentions:</span>
                <span>{data.mentions}</span>
              </div>
              <div className="flex justify-between">
                <span>Confidence:</span>
                <span>{(data.confidence * 100).toFixed(0)}%</span>
              </div>
            </div>
            {data.trending && (
              <div className="mt-2 text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">
                🔥 Trending
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* News flow */}
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Newspaper className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-white">Live News Feed</span>
        </div>
        <div className="max-h-32 overflow-y-auto space-y-1">
          {newsFlow.slice(0, 5).map((news, index) => (
            <motion.div
              key={`news-${index}-${news.timestamp || Date.now()}-${news.symbol || 'unknown'}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => onNewsClick && onNewsClick(news)}
              className="text-xs p-2 bg-gray-800/30 rounded cursor-pointer hover:bg-gray-700/50 transition-colors"
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`font-medium ${
                  news.impact === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {news.symbol}
                </span>
                <span className="text-gray-500">
                  {new Date(news.timestamp || Date.now()).toLocaleTimeString()}
                </span>
              </div>
              <div className="text-gray-300">{news.title}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// Main HyperRealistic Trading Dashboard
const HyperRealisticTradingDashboard = () => {
  const [activeSymbols, setActiveSymbols] = useState(['AAPL', 'TSLA', 'BTCUSD', 'ETHUSD']);
  const [activeCharts, setActiveCharts] = useState([
    { 
      id: 'chart_initial_btc_001', 
      symbol: 'BTCUSDT', 
      size: 'normal', 
      position: { x: 0, y: 0 } 
    },
    { 
      id: 'chart_initial_eth_002', 
      symbol: 'ETHUSDT', 
      size: 'normal', 
      position: { x: 400, y: 0 } 
    },
    { 
      id: 'chart_initial_sol_003', 
      symbol: 'SOLUSDT', 
      size: 'small', 
      position: { x: 0, y: 300 } 
    }
  ]);
  const [dashboardMode, setDashboardMode] = useState('immersive'); // normal, immersive, minimal, advanced
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const [showAdvancedViz, setShowAdvancedViz] = useState(true);
  const [showSentiment, setShowSentiment] = useState(true);
  const [isStreaming, setIsStreaming] = useState(true);

  // Real-time hooks
  const { marketData, connectionStatus: wsStatus, lastUpdate } = useRealTimeMarketData(activeSymbols);
  const { sentimentData, newsFlow } = useMarketSentiment(activeSymbols);
  
  // Zustand store (reemplaza el hook de alertas anterior)
  const { alerts, audioEnabled, setAudioEnabled, getMarketOverview, playSmartAlert } = useMarketStore();
  const marketOverview = getMarketOverview();

  const dashboardRef = useRef();
  const chartsContainerRef = useRef();

  // Auto-arrange charts
  const arrangeCharts = useCallback(() => {
    if (!chartsContainerRef.current) return;

    const charts = Array.from(chartsContainerRef.current.children);
    const containerWidth = chartsContainerRef.current.clientWidth;
    const containerHeight = chartsContainerRef.current.clientHeight;
    
    const cols = Math.ceil(Math.sqrt(charts.length));
    const rows = Math.ceil(charts.length / cols);
    
    const chartWidth = containerWidth / cols;
    const chartHeight = containerHeight / rows;

    charts.forEach((chart, index) => {
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      gsap.to(chart, {
        duration: 0.5,
        x: col * chartWidth,
        y: row * chartHeight,
        ease: "power2.out"
      });
    });
  }, []);

  // Add chart
  const addChart = useCallback((symbol) => {
    if (!activeCharts.find(chart => chart.symbol === symbol)) {
      const newChart = {
        id: `chart_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        symbol,
        position: { x: Math.random() * 200, y: Math.random() * 100 },
        size: 'normal'
      };
      setActiveCharts(prev => [...prev, newChart]);
    }
  }, [activeCharts]);

  // Remove chart
  const removeChart = useCallback((chartId) => {
    setActiveCharts(prev => prev.filter(chart => chart.id !== chartId));
  }, []);

  // Handle news click
  const handleNewsClick = useCallback((news) => {
    // Reproducir alert específico para noticias
    playSmartAlert('news_impact', news.impact === 'positive' ? 'medium' : 'high');
    
    // Abrir chart del símbolo si no está abierto
    if (!activeCharts.find(chart => chart.symbol === news.symbol)) {
      addChart(news.symbol);
    }
  }, [activeCharts, addChart, playSmartAlert]);

  // Dashboard animation effects
  useEffect(() => {
    if (dashboardRef.current) {
      gsap.fromTo(dashboardRef.current.children,
        { opacity: 0, y: 30, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1, 
          duration: 0.8, 
          stagger: 0.1, 
          ease: "power3.out" 
        }
      );
    }
  }, [dashboardMode]);

  // Auto-add charts for active symbols
  useEffect(() => {
    activeSymbols.forEach(symbol => {
      if (!activeCharts.find(chart => chart.symbol === symbol)) {
        setTimeout(() => addChart(symbol), Math.random() * 1000);
      }
    });
  }, [activeSymbols, activeCharts, addChart]);

  const dashboardVariants = {
    normal: "grid grid-cols-1 lg:grid-cols-3 gap-6",
    immersive: "flex flex-col space-y-4",
    minimal: "grid grid-cols-1 xl:grid-cols-2 gap-4",
    advanced: "grid grid-cols-1 lg:grid-cols-2 gap-6"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 p-4">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <BarChart3 className="w-8 h-8 text-indigo-400" />
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                TradingVision Pro
              </h1>
              <div className="text-xs bg-gradient-to-r from-purple-500 to-pink-500 px-2 py-1 rounded text-white">
                HYPERREALISTIC
              </div>
            </div>
            
            {/* Connection status */}
            <div className="flex items-center space-x-2">
              {wsStatus === 'connected' ? (
                <div className="flex items-center space-x-1 text-green-400">
                  <Wifi className="w-4 h-4" />
                  <span className="text-xs">LIVE</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1 text-red-400">
                  <WifiOff className="w-4 h-4" />
                  <span className="text-xs">OFFLINE</span>
                </div>
              )}
              
              {lastUpdate && (
                <div className="text-xs text-gray-400">
                  Last update: {new Date(lastUpdate).toLocaleTimeString()}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-2">
            {/* Mode selector */}
            <div className="flex bg-gray-800/50 rounded-lg p-1">
              {['normal', 'immersive', 'minimal', 'advanced'].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setDashboardMode(mode)}
                  className={`px-3 py-1 text-xs rounded transition-all ${
                    dashboardMode === mode
                      ? 'bg-indigo-500 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {mode.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Toggle controls */}
            <button
              onClick={() => setShowAdvancedViz(!showAdvancedViz)}
              className={`p-2 rounded-lg transition-colors ${
                showAdvancedViz ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => setShowSentiment(!showSentiment)}
              className={`p-2 rounded-lg transition-colors ${
                showSentiment ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
              }`}
            >
              <Brain className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`p-2 rounded-lg transition-colors ${
                isStreaming ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}
            >
              {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Dashboard */}
      <div ref={dashboardRef} className={dashboardVariants[dashboardMode]}>
        {/* Advanced Visualization */}
        {(showAdvancedViz && dashboardMode === 'advanced') && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-96 overflow-hidden"
          >
            <AdvancedMarketVisualization marketData={marketData} sentiment={sentimentData} />
          </motion.div>
        )}

        {/* Charts Container */}
        <div 
          ref={chartsContainerRef}
          className={`relative ${
            dashboardMode === 'immersive' ? 'h-screen' : 'min-h-96'
          } ${
            dashboardMode === 'advanced' ? 'col-span-1' : 'col-span-2'
          }`}
        >
          <AnimatePresence>
            {activeCharts.map((chart) => (
              <motion.div
                key={`chart-${chart.id}-${chart.symbol}`}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800/50 rounded-lg p-4 border border-gray-700"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white">{chart.symbol}</h3>
                  <button
                    onClick={() => removeChart(chart.id)}
                    className="text-gray-400 hover:text-white"
                  >
                    ×
                  </button>
                </div>
                <SimpleChart 
                  symbol={chart.symbol} 
                  width={chart.size === 'large' ? 800 : chart.size === 'small' ? 400 : 600}
                  height={chart.size === 'large' ? 500 : chart.size === 'small' ? 250 : 350}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Sentiment Panel */}
        {showSentiment && (
          <SentimentPanel
            sentimentData={sentimentData}
            newsFlow={newsFlow}
            onNewsClick={handleNewsClick}
          />
        )}

        {/* Real-Time HeatMap */}
        <RealTimeHeatMap 
          marketData={marketData}
          className="col-span-1 lg:col-span-2"
        />

        {/* Advanced Technical Analysis */}
        <AdvancedTechnicalAnalysis 
          marketData={marketData}
          className="col-span-1 lg:col-span-3"
        />

        {/* Smart Alert Panel */}
        <SmartAlertPanel />
      </div>

      {/* Market Overview Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-gradient-to-r from-gray-800/50 to-indigo-800/50 rounded-xl p-4 backdrop-blur-sm border border-gray-700/50"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(marketData).map(([symbol, data]) => (
            <div key={symbol} className="text-center">
              <div className="text-sm font-medium text-white">{symbol}</div>
              <div className="text-lg font-bold text-white">${data.price?.toFixed(2)}</div>
              <div className={`text-sm ${data.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {data.changePercent >= 0 ? '+' : ''}{data.changePercent?.toFixed(2)}%
              </div>
            </div>
          ))}
        </div>
      </motion.footer>
    </div>
  );
};

export default HyperRealisticTradingDashboard;
