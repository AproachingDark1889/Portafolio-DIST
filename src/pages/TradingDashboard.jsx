import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, TrendingUp, Settings, Monitor, 
  Grid3x3, Maximize, Eye, Volume2, VolumeX,
  RefreshCw, Download, Share2, Clock
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

// Import your new trading components
import ChartPanel from '@/components/trading/ChartPanel';
import WatchlistSidebar from '@/components/trading/WatchlistSidebar';
import AlertSystem from '@/components/trading/AlertSystem';

const TradingDashboard = () => {
  // Core state management
  const [activeCharts, setActiveCharts] = useState([]);
  const [chartPositions, setChartPositions] = useState({});
  const [priceData, setPriceData] = useState({});
  const [dashboardMode, setDashboardMode] = useState('normal'); // normal, immersive, minimal
  const [showSidebar, setShowSidebar] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  // Layout management
  const [gridLayout, setGridLayout] = useState('auto'); // auto, grid-2x2, grid-3x3
  const dashboardRef = useRef(null);

  // Chart management functions
  const addChart = useCallback((symbol) => {
    if (activeCharts.includes(symbol)) {
      toast({
        title: "Chart Already Active",
        description: `${symbol} is already being displayed`,
        variant: "destructive"
      });
      return;
    }

    if (activeCharts.length >= 6) {
      toast({
        title: "Maximum Charts Reached",
        description: "You can display up to 6 charts simultaneously",
        variant: "destructive"
      });
      return;
    }

    setActiveCharts(prev => [...prev, symbol]);
    
    // Calculate position for new chart
    const newPosition = calculateChartPosition(activeCharts.length);
    setChartPositions(prev => ({
      ...prev,
      [symbol]: newPosition
    }));

    toast({
      title: "📊 Chart Added",
      description: `${symbol} chart is now active`,
    });
  }, [activeCharts]);

  const removeChart = useCallback((symbol) => {
    setActiveCharts(prev => prev.filter(s => s !== symbol));
    setChartPositions(prev => {
      const { [symbol]: removed, ...rest } = prev;
      return rest;
    });
    setPriceData(prev => {
      const { [symbol]: removed, ...rest } = prev;
      return rest;
    });

    toast({
      title: "Chart Removed",
      description: `${symbol} chart has been closed`,
    });
  }, []);

  // Calculate smart positioning for charts
  const calculateChartPosition = (index) => {
    const containerWidth = dashboardRef.current?.clientWidth || 1200;
    const containerHeight = dashboardRef.current?.clientHeight || 800;
    
    const chartWidth = 400;
    const chartHeight = 300;
    const padding = 20;
    
    const cols = Math.floor((containerWidth - 320) / (chartWidth + padding)); // Account for sidebar
    const row = Math.floor(index / cols);
    const col = index % cols;
    
    return {
      x: 320 + col * (chartWidth + padding) + padding, // Offset for sidebar
      y: row * (chartHeight + padding) + 80 + padding // Offset for header
    };
  };

  // Handle alerts from charts
  const handleAlert = useCallback((alertData) => {
    // Update price data for alert system
    setPriceData(prev => ({
      ...prev,
      [alertData.symbol]: {
        price: alertData.price,
        change: alertData.change,
        timestamp: Date.now()
      }
    }));
  }, []);

  // Auto-arrange charts
  const autoArrangeCharts = () => {
    const newPositions = {};
    activeCharts.forEach((symbol, index) => {
      newPositions[symbol] = calculateChartPosition(index);
    });
    setChartPositions(newPositions);
    
    toast({
      title: "📐 Charts Rearranged",
      description: "Chart positions have been optimized",
    });
  };

  // Export dashboard state
  const exportDashboard = () => {
    const dashboardState = {
      activeCharts,
      chartPositions,
      dashboardMode,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(dashboardState, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trading-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "💾 Dashboard Exported",
      description: "Your dashboard configuration has been saved",
    });
  };

  // Dashboard modes
  const dashboardModes = {
    normal: 'bg-background',
    immersive: 'bg-gradient-to-br from-slate-900/50 to-blue-900/30',
    minimal: 'bg-background/95'
  };

  // Auto-refresh mechanism
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Initialize with default charts
  useEffect(() => {
    // Add some default charts on first load
    const defaultCharts = ['AAPL', 'BTCUSD'];
    defaultCharts.forEach((symbol, index) => {
      setTimeout(() => addChart(symbol), index * 500);
    });
  }, []); // Empty dependency array for one-time initialization

  return (
    <motion.div
      ref={dashboardRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`h-screen w-full flex ${dashboardModes[dashboardMode]} relative overflow-hidden`}
    >
      {/* Header */}
      <motion.header 
        className="absolute top-0 left-0 right-0 z-20 p-4 bg-background/95 backdrop-blur-sm border-b border-primary/30"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <motion.h1 
              className="text-2xl font-bold text-primary flex items-center"
              whileHover={{ scale: 1.05 }}
            >
              <BarChart3 className="w-6 h-6 mr-2" />
              TradingVision Pro
            </motion.h1>
            
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>Last update: {lastUpdate.toLocaleTimeString()}</span>
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className={`p-2 rounded-lg transition-colors ${
                showSidebar ? 'bg-primary/20 text-primary' : 'bg-background/50 text-muted-foreground'
              }`}
              title="Toggle Watchlist"
            >
              <Grid3x3 className="w-4 h-4" />
            </button>

            <button
              onClick={autoArrangeCharts}
              className="p-2 bg-background/50 hover:bg-primary/20 text-muted-foreground hover:text-primary rounded-lg transition-colors"
              title="Auto Arrange Charts"
            >
              <Monitor className="w-4 h-4" />
            </button>

            <button
              onClick={() => setDashboardMode(
                dashboardMode === 'normal' ? 'immersive' : 
                dashboardMode === 'immersive' ? 'minimal' : 'normal'
              )}
              className="p-2 bg-background/50 hover:bg-primary/20 text-muted-foreground hover:text-primary rounded-lg transition-colors"
              title="Dashboard Mode"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`p-2 rounded-lg transition-colors ${
                audioEnabled ? 'bg-primary/20 text-primary' : 'bg-background/50 text-muted-foreground'
              }`}
              title="Toggle Audio"
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            <button
              onClick={exportDashboard}
              className="p-2 bg-background/50 hover:bg-primary/20 text-muted-foreground hover:text-primary rounded-lg transition-colors"
              title="Export Dashboard"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.header>

      {/* Main Content Area */}
      <div className="flex w-full h-full pt-20">
        {/* Watchlist Sidebar */}
        <AnimatePresence>
          {showSidebar && (
            <WatchlistSidebar
              onAddChart={addChart}
              activeCharts={activeCharts}
              onRemoveChart={removeChart}
            />
          )}
        </AnimatePresence>

        {/* Chart Area */}
        <div className="flex-1 relative overflow-hidden">
          {/* Chart Panels */}
          <AnimatePresence>
            {activeCharts.map((symbol) => (
              <ChartPanel
                key={symbol}
                symbol={symbol}
                position={chartPositions[symbol] || { x: 0, y: 0 }}
                onClose={() => removeChart(symbol)}
                onAlert={handleAlert}
                audioEnabled={audioEnabled}
                size={dashboardMode === 'minimal' ? 'mini' : 'normal'}
              />
            ))}
          </AnimatePresence>

          {/* Empty State */}
          {activeCharts.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-center h-full"
            >
              <div className="text-center">
                <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Welcome to TradingVision Pro
                </h3>
                <p className="text-muted-foreground mb-4">
                  Select assets from the watchlist to start analyzing market data
                </p>
                <button
                  onClick={() => addChart('AAPL')}
                  className="px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
                >
                  Add Apple Stock Chart
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Alert System */}
      <AlertSystem
        priceData={priceData}
        audioEnabled={audioEnabled}
        onToggleAudio={() => setAudioEnabled(!audioEnabled)}
      />

      {/* Status Footer */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-2 bg-background/80 backdrop-blur-sm border-t border-primary/20 text-xs text-muted-foreground"
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>Active Charts: {activeCharts.length}/6</span>
            <span>Mode: {dashboardMode}</span>
            <span>Audio: {audioEnabled ? 'ON' : 'OFF'}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Market Data Connected</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TradingDashboard;
