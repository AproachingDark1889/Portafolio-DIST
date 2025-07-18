import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, BellOff, Volume2, VolumeX, Settings, 
  TrendingUp, TrendingDown, AlertTriangle, X, Check 
} from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const AlertSystem = ({ 
  priceData = {}, // { symbol: { price, change, timestamp } }
  audioEnabled = true,
  onToggleAudio 
}) => {
  const [alerts, setAlerts] = useState([]);
  const [activeAlerts, setActiveAlerts] = useState([]);
  const [showConfig, setShowConfig] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    priceChange: 5, // Percentage change threshold
    volume: 10, // Volume change threshold
    soundEnabled: true,
    visualEnabled: true,
    frequency: 528 // Default frequency for alerts
  });

  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Initialize audio context
  const initializeAudioContext = useCallback(() => {
    if (typeof window !== 'undefined' && window.AudioContext && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  // Play alert sound (enhanced version of your existing audio system)
  const playAlertSound = useCallback(async (alertType = 'default', intensity = 1) => {
    if (!audioEnabled || !alertConfig.soundEnabled || !audioContextRef.current) return;

    try {
      // Resume context if suspended
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Stop previous oscillator
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.disconnect();
        } catch (error) {
          // Already disconnected
        }
      }

      const ctx = audioContextRef.current;
      const gainNode = ctx.createGain();
      const oscillator = ctx.createOscillator();
      
      // Different frequencies and patterns for different alert types
      let frequency, duration, pattern;
      
      switch (alertType) {
        case 'priceUp':
          frequency = 660; // Higher frequency for positive alerts
          duration = 800;
          pattern = 'sine';
          break;
        case 'priceDown':
          frequency = 330; // Lower frequency for negative alerts
          duration = 1200;
          pattern = 'triangle';
          break;
        case 'volume':
          frequency = 440;
          duration = 600;
          pattern = 'square';
          break;
        default:
          frequency = alertConfig.frequency;
          duration = 1000;
          pattern = 'sine';
      }

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
      oscillator.type = pattern;
      
      // Enhanced ADSR envelope with intensity scaling
      const now = ctx.currentTime;
      const attackTime = 0.1;
      const decayTime = 0.2;
      const sustainLevel = 0.3 * intensity;
      const releaseTime = 0.3;
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.6 * intensity, now + attackTime);
      gainNode.gain.exponentialRampToValueAtTime(sustainLevel, now + attackTime + decayTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration/1000 - releaseTime);
      
      oscillator.start(now);
      oscillator.stop(now + duration/1000);
      
      oscillatorRef.current = oscillator;

      // Auto cleanup
      oscillator.onended = () => {
        oscillatorRef.current = null;
      };

    } catch (error) {
      console.warn('Alert audio failed:', error);
    }
  }, [audioEnabled, alertConfig.soundEnabled, alertConfig.frequency]);

  // Check for alert conditions
  const checkAlerts = useCallback((symbol, data) => {
    const { price, change, volume, timestamp } = data;
    const alertId = `${symbol}-${timestamp}`;
    
    // Avoid duplicate alerts
    if (activeAlerts.find(alert => alert.id === alertId)) return;

    let newAlert = null;

    // Price change alert
    if (Math.abs(change) >= alertConfig.priceChange) {
      newAlert = {
        id: alertId,
        symbol,
        type: change > 0 ? 'priceUp' : 'priceDown',
        message: `${symbol} ${change > 0 ? 'surged' : 'dropped'} ${Math.abs(change).toFixed(2)}%`,
        value: change,
        timestamp: Date.now(),
        severity: Math.abs(change) > alertConfig.priceChange * 2 ? 'high' : 'medium'
      };
    }

    if (newAlert) {
      // Add to active alerts
      setActiveAlerts(prev => [newAlert, ...prev].slice(0, 10)); // Keep last 10 alerts
      
      // Play sound
      playAlertSound(newAlert.type, Math.min(Math.abs(newAlert.value) / 10, 1));
      
      // Show toast notification
      if (alertConfig.visualEnabled) {
        toast({
          title: "🚨 Price Alert",
          description: newAlert.message,
          variant: newAlert.type === 'priceDown' ? 'destructive' : 'default'
        });
      }
    }
  }, [alertConfig, activeAlerts, playAlertSound]);

  // Monitor price data for alerts
  useEffect(() => {
    Object.entries(priceData).forEach(([symbol, data]) => {
      checkAlerts(symbol, data);
    });
  }, [priceData, checkAlerts]);

  // Initialize audio on mount
  useEffect(() => {
    initializeAudioContext();
    
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.disconnect();
        } catch (error) {
          // Already disconnected
        }
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [initializeAudioContext]);

  // Load alert config from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('tradingAlertConfig');
    if (saved) {
      try {
        const savedConfig = JSON.parse(saved);
        setAlertConfig(prev => ({ ...prev, ...savedConfig }));
      } catch (error) {
        console.warn('Failed to parse saved alert config:', error);
      }
    }
  }, []);

  // Save alert config to localStorage
  const saveAlertConfig = (config) => {
    setAlertConfig(config);
    localStorage.setItem('tradingAlertConfig', JSON.stringify(config));
  };

  // Clear alert
  const clearAlert = (alertId) => {
    setActiveAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  // Clear all alerts
  const clearAllAlerts = () => {
    setActiveAlerts([]);
  };

  // Get alert icon
  const getAlertIcon = (type) => {
    switch (type) {
      case 'priceUp': return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'priceDown': return <TrendingDown className="w-4 h-4 text-red-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    }
  };

  return (
    <>
      {/* Alert Control Button */}
      <div className="fixed top-4 right-4 z-40 flex items-center space-x-2">
        {/* Active alerts indicator */}
        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="relative"
          >
            <button
              onClick={clearAllAlerts}
              className="p-2 bg-destructive/20 hover:bg-destructive/30 text-destructive rounded-lg transition-colors"
              title={`${activeAlerts.length} active alerts`}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {activeAlerts.length}
              </span>
            </button>
          </motion.div>
        )}

        {/* Audio toggle */}
        <button
          onClick={onToggleAudio}
          className={`p-2 rounded-lg transition-colors ${
            audioEnabled && alertConfig.soundEnabled
              ? 'bg-primary/20 text-primary'
              : 'bg-background/50 text-muted-foreground'
          }`}
          title="Toggle Alert Sounds"
        >
          {audioEnabled && alertConfig.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
        </button>

        {/* Settings */}
        <button
          onClick={() => setShowConfig(!showConfig)}
          className={`p-2 rounded-lg transition-colors ${
            showConfig ? 'bg-primary/20 text-primary' : 'bg-background/50 text-muted-foreground hover:text-primary'
          }`}
          title="Alert Settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>

      {/* Active Alerts Panel */}
      <AnimatePresence>
        {activeAlerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-20 right-4 w-80 max-h-96 overflow-y-auto z-30"
          >
            <div className="bg-background/95 backdrop-blur-sm border border-primary/30 rounded-lg p-4 shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-primary">Active Alerts</h3>
                <button
                  onClick={clearAllAlerts}
                  className="text-xs text-muted-foreground hover:text-primary"
                >
                  Clear All
                </button>
              </div>

              <div className="space-y-2">
                {activeAlerts.map((alert, index) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`p-3 rounded-lg border ${
                      alert.severity === 'high' 
                        ? 'border-destructive bg-destructive/10' 
                        : 'border-border bg-background/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-2">
                        {getAlertIcon(alert.type)}
                        <div className="flex-1">
                          <div className="text-sm font-medium text-foreground">
                            {alert.message}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(alert.timestamp).toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => clearAlert(alert.id)}
                        className="p-1 text-muted-foreground hover:text-primary ml-2"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Configuration Modal */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center"
            onClick={() => setShowConfig(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background border border-primary/30 rounded-lg p-6 w-96"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-primary">Alert Settings</h3>
                <button
                  onClick={() => setShowConfig(false)}
                  className="p-1 text-muted-foreground hover:text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Price Change Threshold */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price Change Threshold (%)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={alertConfig.priceChange}
                    onChange={(e) => saveAlertConfig({ ...alertConfig, priceChange: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    Alert when price changes by ±{alertConfig.priceChange}%
                  </div>
                </div>

                {/* Audio Frequency */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Alert Frequency (Hz)
                  </label>
                  <input
                    type="range"
                    min="200"
                    max="1000"
                    value={alertConfig.frequency}
                    onChange={(e) => saveAlertConfig({ ...alertConfig, frequency: Number(e.target.value) })}
                    className="w-full"
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {alertConfig.frequency} Hz
                  </div>
                </div>

                {/* Toggle Options */}
                <div className="space-y-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertConfig.soundEnabled}
                      onChange={(e) => saveAlertConfig({ ...alertConfig, soundEnabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-foreground">Sound Alerts</span>
                  </label>

                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={alertConfig.visualEnabled}
                      onChange={(e) => saveAlertConfig({ ...alertConfig, visualEnabled: e.target.checked })}
                      className="rounded"
                    />
                    <span className="text-sm text-foreground">Visual Notifications</span>
                  </label>
                </div>

                {/* Test Alert */}
                <button
                  onClick={() => playAlertSound('default', 0.8)}
                  className="w-full px-4 py-2 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors"
                  disabled={!audioEnabled || !alertConfig.soundEnabled}
                >
                  Test Alert Sound
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AlertSystem;
