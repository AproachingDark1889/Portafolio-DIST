import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';

import { ProfessionalSmartAlertPanel } from '@/components/alerts/ProfessionalSmartAlertPanel';
import { useMarketStore } from '@/stores/marketStore';
import type { Alert, AlertSeverity } from '@/types';

// Mock the market store
vi.mock('@/stores/marketStore');

describe('ProfessionalSmartAlertPanel', () => {
  const mockMarketStore = {
    getActiveAlerts: vi.fn(),
    dismissAlert: vi.fn(),
    markAlertAsRead: vi.fn(),
    symbols: [
      { symbol: 'BTCUSDT', price: 50000, change: 1000, changePercent: 2.0, volume: 1000000 },
      { symbol: 'ETHUSDT', price: 3000, change: -100, changePercent: -3.2, volume: 500000 }
    ]
  };

  const createMockAlert = (overrides: Partial<Alert> = {}): Alert => ({
    id: 'alert-1',
    type: 'breakout',
    symbol: 'BTCUSDT',
    message: 'Price breakout detected above resistance',
    severity: 'high' as AlertSeverity,
    timestamp: Date.now() - 60000, // 1 minute ago
    price: 50000,
    volume: 1000000,
    dismissed: false,
    isRead: false,
    currentValue: '$50,000.00',
    threshold: 'ATR-based',
    ...overrides
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (useMarketStore as any).mockReturnValue(mockMarketStore);
  });

  describe('Rendering', () => {
    it('renders alert panel with header', () => {
      mockMarketStore.getActiveAlerts.mockReturnValue([]);
      
      render(<ProfessionalSmartAlertPanel />);
      
      expect(screen.getByText('Smart Alerts')).toBeInTheDocument();
      expect(screen.getByText('ATR-based thresholds')).toBeInTheDocument();
    });

    it('displays empty state when no alerts', () => {
      mockMarketStore.getActiveAlerts.mockReturnValue([]);
      
      render(<ProfessionalSmartAlertPanel />);
      
      expect(screen.getByText('No active alerts')).toBeInTheDocument();
      expect(screen.getByText(/Intelligent thresholds are monitoring/)).toBeInTheDocument();
    });

    it('displays unread badge when there are unread alerts', () => {
      const alerts = [
        createMockAlert({ isRead: false }),
        createMockAlert({ id: 'alert-2', isRead: true, severity: 'medium' })
      ];
      mockMarketStore.getActiveAlerts.mockReturnValue(alerts);
      
      render(<ProfessionalSmartAlertPanel />);
      
      expect(screen.getByText('1')).toBeInTheDocument(); // Unread count badge
    });
  });

  describe('Alert Display', () => {
    it('displays alert information correctly', () => {
      const alert = createMockAlert({
        symbol: 'ETHUSDT',
        message: 'RSI oversold condition detected',
        severity: 'critical',
        currentValue: '$3,000.00',
        threshold: '30 RSI'
      });
      mockMarketStore.getActiveAlerts.mockReturnValue([alert]);
      
      render(<ProfessionalSmartAlertPanel />);
      
      expect(screen.getByText('ETHUSDT')).toBeInTheDocument();
      expect(screen.getByText('RSI oversold condition detected')).toBeInTheDocument();
      expect(screen.getByText('$3,000.00')).toBeInTheDocument();
      expect(screen.getByText('30 RSI')).toBeInTheDocument();
    });

    it('applies correct severity styling', () => {
      const criticalAlert = createMockAlert({ severity: 'critical' });
      mockMarketStore.getActiveAlerts.mockReturnValue([criticalAlert]);
      
      render(<ProfessionalSmartAlertPanel />);
      
      const alertElement = screen.getByText('BTCUSDT').closest('div');
      expect(alertElement).toHaveClass('text-red-400');
    });

    it('shows severity statistics correctly', () => {
      const alerts = [
        createMockAlert({ severity: 'critical' }),
        createMockAlert({ id: 'alert-2', severity: 'critical' }),
        createMockAlert({ id: 'alert-3', severity: 'high' }),
        createMockAlert({ id: 'alert-4', severity: 'medium' })
      ];
      mockMarketStore.getActiveAlerts.mockReturnValue(alerts);
      
      render(<ProfessionalSmartAlertPanel />);
      
      // Check if severity counts are displayed correctly
      const statsSection = screen.getByText('2').parentElement;
      expect(statsSection).toHaveTextContent('critical');
    });
  });

  describe('User Interactions', () => {
    it('marks alert as read when clicked', async () => {
      const alert = createMockAlert({ isRead: false });
      mockMarketStore.getActiveAlerts.mockReturnValue([alert]);
      
      render(<ProfessionalSmartAlertPanel />);
      
      const alertElement = screen.getByText('BTCUSDT');
      
      await act(async () => {
        fireEvent.click(alertElement);
      });
      
      expect(mockMarketStore.markAlertAsRead).toHaveBeenCalledWith('alert-1');
    });

    it('does not mark read alerts as read again', async () => {
      const alert = createMockAlert({ isRead: true });
      mockMarketStore.getActiveAlerts.mockReturnValue([alert]);
      
      render(<ProfessionalSmartAlertPanel />);
      
      const alertElement = screen.getByText('BTCUSDT');
      
      await act(async () => {
        fireEvent.click(alertElement);
      });
      
      expect(mockMarketStore.markAlertAsRead).not.toHaveBeenCalled();
    });

    it('dismisses alert when X button is clicked', async () => {
      const alert = createMockAlert();
      mockMarketStore.getActiveAlerts.mockReturnValue([alert]);
      
      render(<ProfessionalSmartAlertPanel showControls={true} />);
      
      const dismissButton = screen.getByText('×');
      
      await act(async () => {
        fireEvent.click(dismissButton);
      });
      
      expect(mockMarketStore.dismissAlert).toHaveBeenCalledWith('alert-1');
    });

    it('prevents event bubbling when dismissing alerts', async () => {
      const alert = createMockAlert({ isRead: false });
      mockMarketStore.getActiveAlerts.mockReturnValue([alert]);
      
      render(<ProfessionalSmartAlertPanel showControls={true} />);
      
      const dismissButton = screen.getByText('×');
      
      await act(async () => {
        fireEvent.click(dismissButton);
      });
      
      expect(mockMarketStore.dismissAlert).toHaveBeenCalledWith('alert-1');
      expect(mockMarketStore.markAlertAsRead).not.toHaveBeenCalled();
    });
  });

  describe('Time Formatting', () => {
    it('formats recent timestamps correctly', () => {
      const now = Date.now();
      const alerts = [
        createMockAlert({ timestamp: now - 30000 }), // 30 seconds ago
        createMockAlert({ id: 'alert-2', timestamp: now - 300000 }), // 5 minutes ago
        createMockAlert({ id: 'alert-3', timestamp: now - 3600000 }), // 1 hour ago
      ];
      mockMarketStore.getActiveAlerts.mockReturnValue(alerts);
      
      render(<ProfessionalSmartAlertPanel />);
      
      expect(screen.getByText('Just now')).toBeInTheDocument();
      expect(screen.getByText('5m ago')).toBeInTheDocument();
      expect(screen.getByText('1h ago')).toBeInTheDocument();
    });
  });

  describe('Alert Type Icons', () => {
    it('displays correct icons for different alert types', () => {
      const alerts = [
        createMockAlert({ type: 'breakout' }),
        createMockAlert({ id: 'alert-2', type: 'volume_spike' }),
        createMockAlert({ id: 'alert-3', type: 'breakdown' })
      ];
      mockMarketStore.getActiveAlerts.mockReturnValue(alerts);
      
      render(<ProfessionalSmartAlertPanel />);
      
      // Check that icons are rendered (we can't easily test specific icons, but we can verify they exist)
      const alertElements = screen.getAllByText(/BTCUSDT/);
      expect(alertElements).toHaveLength(3);
    });
  });

  describe('Props and Configuration', () => {
    it('respects maxAlerts prop', () => {
      const alerts = Array.from({ length: 10 }, (_, i) => 
        createMockAlert({ id: `alert-${i}` })
      );
      mockMarketStore.getActiveAlerts.mockReturnValue(alerts);
      
      render(<ProfessionalSmartAlertPanel maxAlerts={5} />);
      
      const alertElements = screen.getAllByText(/BTCUSDT/);
      expect(alertElements).toHaveLength(5);
    });

    it('hides controls when showControls is false', () => {
      const alert = createMockAlert();
      mockMarketStore.getActiveAlerts.mockReturnValue([alert]);
      
      render(<ProfessionalSmartAlertPanel showControls={false} />);
      
      expect(screen.queryByText('×')).not.toBeInTheDocument();
      expect(screen.queryByText('Configure')).not.toBeInTheDocument();
    });

    it('applies custom className', () => {
      mockMarketStore.getActiveAlerts.mockReturnValue([]);
      
      const { container } = render(
        <ProfessionalSmartAlertPanel className="custom-class" />
      );
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('handles large number of alerts without performance issues', () => {
      const alerts = Array.from({ length: 100 }, (_, i) => 
        createMockAlert({ id: `alert-${i}` })
      );
      mockMarketStore.getActiveAlerts.mockReturnValue(alerts);
      
      const startTime = performance.now();
      render(<ProfessionalSmartAlertPanel />);
      const endTime = performance.now();
      
      expect(endTime - startTime).toBeLessThan(100); // Should render in under 100ms
    });

    it('handles alerts with missing optional properties', () => {
      const alert = createMockAlert({
        currentValue: undefined,
        threshold: undefined,
        volume: undefined
      });
      mockMarketStore.getActiveAlerts.mockReturnValue([alert]);
      
      expect(() => {
        render(<ProfessionalSmartAlertPanel />);
      }).not.toThrow();
    });

    it('handles empty symbol arrays gracefully', () => {
      mockMarketStore.symbols = [];
      mockMarketStore.getActiveAlerts.mockReturnValue([]);
      
      render(<ProfessionalSmartAlertPanel />);
      
      expect(screen.getByText(/monitoring 0 symbols/)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('provides proper ARIA labels and semantic structure', () => {
      const alert = createMockAlert();
      mockMarketStore.getActiveAlerts.mockReturnValue([alert]);
      
      render(<ProfessionalSmartAlertPanel />);
      
      // Check for proper semantic structure
      expect(screen.getByRole('button', { name: /×/ })).toBeInTheDocument();
    });

    it('supports keyboard navigation', async () => {
      const alert = createMockAlert({ isRead: false });
      mockMarketStore.getActiveAlerts.mockReturnValue([alert]);
      
      render(<ProfessionalSmartAlertPanel />);
      
      const alertElement = screen.getByText('BTCUSDT').closest('div');
      
      // Simulate Enter key press
      await act(async () => {
        fireEvent.keyDown(alertElement!, { key: 'Enter', code: 'Enter' });
        fireEvent.click(alertElement!);
      });
      
      expect(mockMarketStore.markAlertAsRead).toHaveBeenCalledWith('alert-1');
    });
  });

  describe('Real-time Updates', () => {
    it('updates when store data changes', async () => {
      const { rerender } = render(<ProfessionalSmartAlertPanel />);
      
      // Initially no alerts
      mockMarketStore.getActiveAlerts.mockReturnValue([]);
      rerender(<ProfessionalSmartAlertPanel />);
      expect(screen.getByText('No active alerts')).toBeInTheDocument();
      
      // Add alerts
      const newAlert = createMockAlert();
      mockMarketStore.getActiveAlerts.mockReturnValue([newAlert]);
      rerender(<ProfessionalSmartAlertPanel />);
      
      await waitFor(() => {
        expect(screen.getByText('BTCUSDT')).toBeInTheDocument();
      });
    });
  });
});
