import { renderHook, act } from '@testing-library/react';
import { useMarketStore } from '@/stores/marketStore';
import type { MarketCandle } from '@/types';

describe('MarketStore', () => {
  beforeEach(() => {
    // Reset store state
    useMarketStore.getState().clearAlerts();
  });

  describe('Candle Management', () => {
    it('should add candles and maintain limit', () => {
      const { result } = renderHook(() => useMarketStore());
      
      const mockCandle: MarketCandle = {
        timestamp: Date.now(),
        open: 100,
        high: 105,
        low: 95,
        close: 102,
        volume: 1000000,
        symbol: 'BTCUSDT'
      };

      act(() => {
        result.current.addCandle('BTCUSDT', mockCandle);
      });

      const candles = result.current.candles['BTCUSDT'];
      expect(candles).toHaveLength(1);
      expect(candles[0]).toEqual(mockCandle);
    });

    it('should calculate technical indicators when candles are added', () => {
      const { result } = renderHook(() => useMarketStore());
      
      // Add enough candles for RSI calculation
      const candles: MarketCandle[] = [];
      for (let i = 0; i < 20; i++) {
        candles.push({
          timestamp: Date.now() + i * 60000,
          open: 100 + i,
          high: 105 + i,
          low: 95 + i,
          close: 102 + i,
          volume: 1000000,
          symbol: 'BTCUSDT'
        });
      }

      act(() => {
        candles.forEach(candle => {
          result.current.addCandle('BTCUSDT', candle);
        });
      });

      const indicators = result.current.indicators['BTCUSDT'];
      expect(indicators).toBeDefined();
      expect(indicators.rsi).toBeDefined();
      expect(indicators.rsi!.length).toBeGreaterThan(0);
    });
  });

  describe('Alert System', () => {
    it('should add alerts correctly', () => {
      const { result } = renderHook(() => useMarketStore());

      act(() => {
        result.current.addAlert({
          type: 'breakout',
          symbol: 'BTCUSDT',
          message: 'Test breakout alert',
          severity: 'high',
          price: 45000,
          dismissed: false
        });
      });

      const alerts = result.current.getActiveAlerts();
      expect(alerts).toHaveLength(1);
      expect(alerts[0].type).toBe('breakout');
      expect(alerts[0].symbol).toBe('BTCUSDT');
    });

    it('should dismiss alerts correctly', () => {
      const { result } = renderHook(() => useMarketStore());

      act(() => {
        result.current.addAlert({
          type: 'volume_spike',
          symbol: 'ETHUSDT',
          message: 'Volume spike detected',
          severity: 'medium',
          price: 2500,
          dismissed: false
        });
      });

      const alerts = result.current.alerts;
      const alertId = alerts[0].id;

      act(() => {
        result.current.dismissAlert(alertId);
      });

      const activeAlerts = result.current.getActiveAlerts();
      expect(activeAlerts).toHaveLength(0);
    });

    it('should filter alerts by symbol', () => {
      const { result } = renderHook(() => useMarketStore());

      act(() => {
        result.current.addAlert({
          type: 'rsi_oversold',
          symbol: 'BTCUSDT',
          message: 'BTC oversold',
          severity: 'medium',
          price: 43000,
          dismissed: false
        });

        result.current.addAlert({
          type: 'rsi_oversold',
          symbol: 'ETHUSDT',
          message: 'ETH oversold',
          severity: 'medium',
          price: 2400,
          dismissed: false
        });
      });

      const btcAlerts = result.current.getAlertsBySymbol('BTCUSDT');
      const ethAlerts = result.current.getAlertsBySymbol('ETHUSDT');

      expect(btcAlerts).toHaveLength(1);
      expect(ethAlerts).toHaveLength(1);
      expect(btcAlerts[0].symbol).toBe('BTCUSDT');
      expect(ethAlerts[0].symbol).toBe('ETHUSDT');
    });
  });

  describe('Technical Analysis', () => {
    it('should calculate technical summary correctly', () => {
      const { result } = renderHook(() => useMarketStore());

      // Mock indicators data
      act(() => {
        result.current.updateIndicators('BTCUSDT', {
          rsi: [65, 70, 75], // Overbought trend
          ema20: [45000, 45100, 45200],
          ema50: [44000, 44100, 44200], // Bullish trend (EMA20 > EMA50)
          macd: {
            MACD: [-10, 5, 15],
            signal: [0, 0, 5],
            histogram: [-10, 5, 10]
          }
        });
      });

      const summary = result.current.getTechnicalSummary('BTCUSDT');
      
      expect(summary.trend).toBe('bullish');
      expect(summary.signals).toContain('RSI Overbought');
      expect(summary.signals).toContain('Short-term Uptrend');
      expect(summary.signals).toContain('MACD Bullish Cross');
      expect(summary.strength).toBeGreaterThan(0);
    });

    it('should handle missing indicators gracefully', () => {
      const { result } = renderHook(() => useMarketStore());

      const summary = result.current.getTechnicalSummary('NONEXISTENT');
      
      expect(summary.trend).toBe('neutral');
      expect(summary.strength).toBe(0);
      expect(summary.signals).toHaveLength(0);
    });
  });

  describe('UI State Management', () => {
    it('should toggle audio correctly', () => {
      const { result } = renderHook(() => useMarketStore());

      const initialAudio = result.current.audioEnabled;

      act(() => {
        result.current.toggleAudio();
      });

      expect(result.current.audioEnabled).toBe(!initialAudio);
    });

    it('should set selected symbol', () => {
      const { result } = renderHook(() => useMarketStore());

      act(() => {
        result.current.setSelectedSymbol('ETHUSDT');
      });

      expect(result.current.selectedSymbol).toBe('ETHUSDT');
    });

    it('should set timeframe', () => {
      const { result } = renderHook(() => useMarketStore());

      act(() => {
        result.current.setTimeframe('1h');
      });

      expect(result.current.timeframe).toBe('1h');
    });
  });
});

// Integration test for alert rules
describe('Alert Rules Integration', () => {
  it('should trigger volume spike alerts correctly', () => {
    const { result } = renderHook(() => useMarketStore());

    // Setup indicators
    act(() => {
      result.current.updateIndicators('BTCUSDT', {
        volumeMA: [1000000], // Normal volume
        atr: [1000] // ATR for volatility
      });
    });

    // Create high volume candle
    const highVolumeCandle: MarketCandle = {
      timestamp: Date.now(),
      open: 45000,
      high: 45500,
      low: 44500,
      close: 45400, // Significant price movement
      volume: 4000000, // 4x normal volume
      symbol: 'BTCUSDT'
    };

    act(() => {
      result.current.addCandle('BTCUSDT', highVolumeCandle);
    });

    // Check if volume spike alert was triggered
    const alerts = result.current.getActiveAlerts();
    const volumeAlert = alerts.find(alert => alert.type === 'volume_spike');
    
    expect(volumeAlert).toBeDefined();
    expect(volumeAlert?.symbol).toBe('BTCUSDT');
    expect(volumeAlert?.severity).toBe('high');
  });
});
