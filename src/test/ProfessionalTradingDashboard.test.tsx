import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';

import ProfessionalTradingDashboard from '@/pages/ProfessionalTradingDashboard';
import { useMarketStore } from '@/stores/marketStore';

// Mock the market store
vi.mock('@/stores/marketStore');

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    header: ({ children, ...props }: any) => <header {...props}>{children}</header>,
  },
  AnimatePresence: ({ children }: any) => children,
}));

// Mock the chart components
vi.mock('@/components/charts/SimplifiedProfessionalChart', () => ({
  SimplifiedProfessionalChart: ({ symbol, height }: any) => (
    <div data-testid={`chart-${symbol}`} style={{ height }}>
      Chart for {symbol}
    </div>
  ),
}));

// Mock the alert panel
vi.mock('@/components/alerts/ProfessionalSmartAlertPanel', () => ({
  ProfessionalSmartAlertPanel: ({ className }: any) => (
    <div className={className} data-testid="alert-panel">
      Smart Alert Panel
    </div>
  ),
}));

describe('ProfessionalTradingDashboard', () => {
  const mockMarketStore = {
    symbols: [
      {
        symbol: 'BTCUSDT',
        price: 50000,
        change: 1000,
        changePercent: 2.0,
        volume: 1000000,
        timestamp: Date.now()
      },
      {
        symbol: 'ETHUSDT',
        price: 3000,
        change: -100,
        changePercent: -3.2,
        volume: 500000,
        timestamp: Date.now()
      },
      {
        symbol: 'SOLUSDT',
        price: 100,
        change: 5,
        changePercent: 5.0,
        volume: 200000,
        timestamp: Date.now()
      }
    ],
    isConnected: true,
    getActiveAlerts: vi.fn(() => []),
    getTechnicalSummary: vi.fn(() => ({
      trend: 'bullish' as const,
      strength: 75,
      signals: ['RSI_OVERSOLD', 'MACD_BULLISH']
    })),
    selectedSymbol: 'BTCUSDT',
    setSelectedSymbol: vi.fn(),
    initializeWebSocket: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useMarketStore as any).mockReturnValue(mockMarketStore);
    
    // Mock document.title
    Object.defineProperty(document, 'title', {
      writable: true,
      value: 'Test'
    });
  });

  describe('Dashboard Rendering', () => {
    it('renders the main dashboard components', () => {
      render(<ProfessionalTradingDashboard />);
      
      expect(screen.getByText('TradingVision Pro')).toBeInTheDocument();
      expect(screen.getByText('PROFESSIONAL')).toBeInTheDocument();
      expect(screen.getByTestId('alert-panel')).toBeInTheDocument();
    });

    it('displays connection status correctly when connected', () => {
      render(<ProfessionalTradingDashboard />);
      
      expect(screen.getByText('REAL-TIME')).toBeInTheDocument();
      expect(screen.queryByText('DISCONNECTED')).not.toBeInTheDocument();
    });

    it('displays connection status correctly when disconnected', () => {
      (useMarketStore as any).mockReturnValue({
        ...mockMarketStore,
        isConnected: false
      });
      
      render(<ProfessionalTradingDashboard />);
      
      expect(screen.getByText('DISCONNECTED')).toBeInTheDocument();
      expect(screen.queryByText('REAL-TIME')).not.toBeInTheDocument();
    });

    it('shows connection lost overlay when disconnected', () => {
      (useMarketStore as any).mockReturnValue({
        ...mockMarketStore,
        isConnected: false
      });
      
      render(<ProfessionalTradingDashboard />);
      
      expect(screen.getByText('Connection Lost')).toBeInTheDocument();
      expect(screen.getByText(/WebSocket connection to market data has been interrupted/)).toBeInTheDocument();
    });
  });

  describe('Symbol Display', () => {
    it('renders tracked symbols correctly', () => {
      render(<ProfessionalTradingDashboard />);
      
      expect(screen.getByText('BTCUSDT')).toBeInTheDocument();
      expect(screen.getByText('ETHUSDT')).toBeInTheDocument();
      expect(screen.getByText('SOLUSDT')).toBeInTheDocument();
      expect(screen.getByText('$50,000.00')).toBeInTheDocument();
      expect(screen.getByText('$3,000.00')).toBeInTheDocument();
    });

    it('displays price changes correctly', () => {
      render(<ProfessionalTradingDashboard />);
      
      expect(screen.getByText('+2.00%')).toBeInTheDocument();
      expect(screen.getByText('-3.20%')).toBeInTheDocument();
      expect(screen.getByText('+5.00%')).toBeInTheDocument();
    });

    it('shows technical trend indicators', () => {
      render(<ProfessionalTradingDashboard />);
      
      const trendBadges = screen.getAllByText('BULLISH');
      expect(trendBadges.length).toBeGreaterThan(0);
    });

    it('displays volume information', () => {
      render(<ProfessionalTradingDashboard />);
      
      expect(screen.getByText('1.0M')).toBeInTheDocument(); // BTCUSDT volume
      expect(screen.getByText('0.5M')).toBeInTheDocument(); // ETHUSDT volume
    });
  });

  describe('Symbol Selection', () => {
    it('allows selecting different symbols', async () => {
      render(<ProfessionalTradingDashboard />);
      
      const ethSymbol = screen.getByText('ETHUSDT');
      
      await act(async () => {
        fireEvent.click(ethSymbol);
      });
      
      expect(mockMarketStore.setSelectedSymbol).toHaveBeenCalledWith('ETHUSDT');
    });

    it('highlights selected symbol', () => {
      render(<ProfessionalTradingDashboard />);
      
      const btcContainer = screen.getByText('BTCUSDT').closest('div');
      expect(btcContainer).toHaveClass('border-indigo-500/50');
    });

    it('shows different styling for non-selected symbols', () => {
      render(<ProfessionalTradingDashboard />);
      
      const ethContainer = screen.getByText('ETHUSDT').closest('div');
      expect(ethContainer).toHaveClass('border-gray-700');
    });
  });

  describe('Alert Integration', () => {
    it('displays alert counts in header', () => {
      const mockAlertsStore = {
        ...mockMarketStore,
        getActiveAlerts: vi.fn(() => [
          {
            id: '1',
            severity: 'critical',
            symbol: 'BTCUSDT',
            message: 'Critical alert',
            timestamp: Date.now(),
            dismissed: false,
            isRead: false,
            type: 'breakout',
            price: 50000
          },
          {
            id: '2',
            severity: 'high',
            symbol: 'ETHUSDT',
            message: 'High alert',
            timestamp: Date.now(),
            dismissed: false,
            isRead: false,
            type: 'volume_spike',
            price: 3000
          }
        ])
      };
      
      (useMarketStore as any).mockReturnValue(mockAlertsStore);
      
      render(<ProfessionalTradingDashboard />);
      
      expect(screen.getByText('1')).toBeInTheDocument(); // Critical alert count
      expect(screen.getByText('1')).toBeInTheDocument(); // High alert count
    });

    it('does not show alert indicators when no alerts', () => {
      render(<ProfessionalTradingDashboard />);
      
      // Should not have alert count badges
      const alertBadges = screen.queryAllByText(/^[0-9]+$/);
      expect(alertBadges).toHaveLength(0);
    });
  });

  describe('Charts Integration', () => {
    it('renders main chart for selected symbol', () => {
      render(<ProfessionalTradingDashboard />);
      
      expect(screen.getByTestId('chart-BTCUSDT')).toBeInTheDocument();
    });

    it('renders additional charts for other symbols', () => {
      render(<ProfessionalTradingDashboard />);
      
      // Should show charts for symbols other than selected
      expect(screen.getByTestId('chart-ETHUSDT')).toBeInTheDocument();
      expect(screen.getByTestId('chart-SOLUSDT')).toBeInTheDocument();
    });
  });

  describe('Market Overview', () => {
    it('displays market data in header for quick reference', () => {
      render(<ProfessionalTradingDashboard />);
      
      // Should show first 3 symbols in header
      const headerSymbols = screen.getAllByText(/BTCUSDT|ETHUSDT|SOLUSDT/);
      expect(headerSymbols.length).toBeGreaterThan(3); // Some appear in main area, some in header
    });
  });

  describe('Responsive Behavior', () => {
    it('applies responsive classes correctly', () => {
      render(<ProfessionalTradingDashboard />);
      
      const mainContainer = screen.getByRole('main');
      expect(mainContainer).toHaveClass('max-w-7xl', 'mx-auto', 'p-4');
    });

    it('renders grid layouts properly', () => {
      render(<ProfessionalTradingDashboard />);
      
      // Check for responsive grid containers
      const gridContainers = document.querySelectorAll('[class*="grid"]');
      expect(gridContainers.length).toBeGreaterThan(0);
    });
  });

  describe('WebSocket Integration', () => {
    it('initializes WebSocket connection on mount', () => {
      render(<ProfessionalTradingDashboard />);
      
      expect(mockMarketStore.initializeWebSocket).toHaveBeenCalled();
    });

    it('updates document title based on connection status', () => {
      render(<ProfessionalTradingDashboard />);
      
      expect(document.title).toBe('TradingVision Pro - LIVE');
    });

    it('updates document title when disconnected', () => {
      (useMarketStore as any).mockReturnValue({
        ...mockMarketStore,
        isConnected: false
      });
      
      render(<ProfessionalTradingDashboard />);
      
      expect(document.title).toBe('TradingVision Pro - DISCONNECTED');
    });
  });

  describe('Technical Analysis Display', () => {
    it('shows technical signals count', () => {
      render(<ProfessionalTradingDashboard />);
      
      expect(screen.getByText('Signals: 2')).toBeInTheDocument();
    });

    it('handles different technical trends', () => {
      const bearishStore = {
        ...mockMarketStore,
        getTechnicalSummary: vi.fn(() => ({
          trend: 'bearish' as const,
          strength: 25,
          signals: ['RSI_OVERBOUGHT']
        }))
      };
      
      (useMarketStore as any).mockReturnValue(bearishStore);
      
      render(<ProfessionalTradingDashboard />);
      
      expect(screen.getAllByText('BEARISH')[0]).toBeInTheDocument();
    });

    it('handles neutral trend state', () => {
      const neutralStore = {
        ...mockMarketStore,
        getTechnicalSummary: vi.fn(() => ({
          trend: 'neutral' as const,
          strength: 50,
          signals: []
        }))
      };
      
      (useMarketStore as any).mockReturnValue(neutralStore);
      
      render(<ProfessionalTradingDashboard />);
      
      expect(screen.getAllByText('NEUTRAL')[0]).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('renders without performance issues', () => {
      const startTime = performance.now();
      render(<ProfessionalTradingDashboard />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render in under 100ms
    });
  });

  describe('Error Handling', () => {
    it('handles missing symbol data gracefully', () => {
      const storeWithMissingData = {
        ...mockMarketStore,
        symbols: []
      };
      
      (useMarketStore as any).mockReturnValue(storeWithMissingData);
      
      expect(() => {
        render(<ProfessionalTradingDashboard />);
      }).not.toThrow();
    });

    it('handles undefined technical summary', () => {
      const storeWithUndefinedSummary = {
        ...mockMarketStore,
        getTechnicalSummary: vi.fn(() => undefined)
      };
      
      (useMarketStore as any).mockReturnValue(storeWithUndefinedSummary);
      
      expect(() => {
        render(<ProfessionalTradingDashboard />);
      }).not.toThrow();
    });
  });
});
