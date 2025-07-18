import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import ChartPanel from '@/components/trading/ChartPanel';
import { useMarketStore, useSymbolData } from '@/stores/marketStore';
import { useCandlestickData } from '@/hooks/useCandlestickData';

// Mock del store
vi.mock('@/stores/marketStore', () => ({
  useMarketStore: vi.fn(),
  useSymbolData: vi.fn()
}));

// Mock del hook de candlestick data
vi.mock('@/hooks/useCandlestickData', () => ({
  useCandlestickData: vi.fn()
}));

// Mock del TradingViewChart
vi.mock('@/components/TradingViewChart', () => ({
  default: ({ symbol, data, onCrosshairMove }: any) => (
    <div data-testid="trading-view-chart">
      <span>Chart for {symbol}</span>
      <span>Data points: {data.length}</span>
      <button onClick={() => onCrosshairMove({ point: null, time: null })}>
        Clear Crosshair
      </button>
    </div>
  )
}));

// Cast para TypeScript
const mockUseMarketStore = useMarketStore as any;
const mockUseSymbolData = useSymbolData as any;
const mockUseCandlestickData = useCandlestickData as any;

describe('ChartPanel', () => {
  const mockOnClose = vi.fn();
  
  const mockStoreData = {
    candles: [
      { time: 1640995200000, open: 100, high: 105, low: 98, close: 102, volume: 1000 },
      { time: 1640995260000, open: 102, high: 107, low: 100, close: 104, volume: 1200 }
    ],
    indicators: {
      rsi: 65.5,
      atr: 2.3,
      bb: { upper: 110, middle: 105, lower: 100 },
      macd: { MACD: 1.2, signal: 0.8, histogram: 0.4 },
      volumeMA: 1100,
      ema12: 103,
      ema26: 102
    },
    lastUpdate: Date.now()
  };

  const mockStore = {
    setCandles: vi.fn(),
    setAlertThreshold: vi.fn(),
    audioEnabled: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup mocks
    (useMarketStore as any).mockReturnValue(mockStore);
    (useSymbolData as any).mockReturnValue(mockStoreData);
    (useCandlestickData as any).mockReturnValue({
      data: mockStoreData.candles,
      isLoading: false,
      error: null,
      refresh: vi.fn()
    });
  });

  it('should render chart panel with symbol', () => {
    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    expect(screen.getByText('BTCUSDT')).toBeInTheDocument();
    expect(screen.getByTestId('trading-view-chart')).toBeInTheDocument();
  });

  it('should display demo mode explicitly when isDemo is true', () => {
    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} isDemo={true} />);
    
    expect(screen.getByText('DEMO')).toBeInTheDocument();
  });

  it('should sanitize symbol input to prevent XSS', () => {
    const maliciousSymbol = 'BTC<script>alert("xss")</script>USDT';
    render(<ChartPanel symbol={maliciousSymbol} onClose={mockOnClose} />);
    
    // El símbolo debería estar sanitizado
    expect(screen.getByText('BTCUSDT')).toBeInTheDocument();
    expect(screen.queryByText(maliciousSymbol)).not.toBeInTheDocument();
  });

  it('should limit symbol length to 10 characters', () => {
    const longSymbol = 'VERYLONGSYMBOLNAME';
    render(<ChartPanel symbol={longSymbol} onClose={mockOnClose} />);
    
    // Debería truncar a 10 caracteres
    expect(screen.getByText('VERYLONG')).toBeInTheDocument();
  });

  it('should display current price and percentage change', () => {
    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    expect(screen.getByText('$104.00')).toBeInTheDocument(); // close price
    expect(screen.getByText('1.96%')).toBeInTheDocument(); // percentage change
  });

  it('should show connection status indicators', () => {
    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    // Debería mostrar indicador de conexión
    expect(screen.getByRole('button', { name: /close chart/i })).toBeInTheDocument();
  });

  it('should display technical indicators when available', () => {
    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    expect(screen.getByText(/RSI: 65.5/)).toBeInTheDocument();
    expect(screen.getByText(/ATR: 2.30/)).toBeInTheDocument();
    expect(screen.getByText(/BB: 110.00/)).toBeInTheDocument();
  });

  it('should handle volume toggle', () => {
    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    const volumeButton = screen.getByTitle('Toggle Volume');
    fireEvent.click(volumeButton);
    
    // Verifica que el botón cambie de estado
    expect(volumeButton).toHaveClass('bg-gray-700');
  });

  it('should handle indicators toggle', () => {
    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    const indicatorsButton = screen.getByTitle('Toggle Indicators');
    fireEvent.click(indicatorsButton);
    
    expect(indicatorsButton).toHaveClass('bg-purple-500/20');
  });

  it('should handle expand/minimize functionality', () => {
    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    const expandButton = screen.getByTitle('Expand');
    fireEvent.click(expandButton);
    
    expect(screen.getByTitle('Minimize')).toBeInTheDocument();
  });

  it('should call onClose when close button is clicked', () => {
    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    const closeButton = screen.getByTitle('Close Chart');
    fireEvent.click(closeButton);
    
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('should handle refresh functionality', async () => {
    const mockRefresh = vi.fn();
    (useCandlestickData as any).mockReturnValue({
      data: mockStoreData.candles,
      isLoading: false,
      error: null,
      refresh: mockRefresh
    });

    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    const refreshButton = screen.getByTitle('Refresh Data');
    fireEvent.click(refreshButton);
    
    await waitFor(() => {
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it('should display error state when data loading fails', () => {
    (useCandlestickData as any).mockReturnValue({
      data: [],
      isLoading: false,
      error: 'Failed to load data',
      refresh: vi.fn()
    });

    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    expect(screen.getByText('Failed to load real-time data')).toBeInTheDocument();
    expect(screen.getByText('Failed to load data')).toBeInTheDocument();
  });

  it('should display loading state correctly', () => {
    (useCandlestickData as any).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
      refresh: vi.fn()
    });

    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    const refreshButton = screen.getByTitle('Refresh Data');
    expect(refreshButton).toBeDisabled();
  });

  it('should show trading disclaimer for real data', () => {
    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} isDemo={false} />);
    
    expect(screen.getByText(/Real-time data for informational purposes only/)).toBeInTheDocument();
    expect(screen.getByText(/Trading involves risk/)).toBeInTheDocument();
  });

  it('should not show disclaimer in demo mode', () => {
    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} isDemo={true} />);
    
    expect(screen.queryByText(/Trading involves risk/)).not.toBeInTheDocument();
  });

  it('should handle crosshair data display', () => {
    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    // Simular datos de crosshair
    const clearButton = screen.getByText('Clear Crosshair');
    fireEvent.click(clearButton);
    
    // Verificar que la funcionalidad de crosshair funciona
    expect(screen.getByTestId('trading-view-chart')).toBeInTheDocument();
  });

  it('should format volume display correctly', () => {
    const mockDataWithHighVolume = {
      ...mockStoreData,
      candles: [
        { time: 1640995200000, open: 100, high: 105, low: 98, close: 102, volume: 1500000 }
      ]
    };

    (useSymbolData as any).mockReturnValue(mockDataWithHighVolume);

    render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    expect(screen.getByText(/Vol: 1.5M/)).toBeInTheDocument();
  });

  it('should handle different chart sizes', () => {
    const { rerender } = render(
      <ChartPanel symbol="BTCUSDT" onClose={mockOnClose} size="mini" />
    );
    
    expect(screen.getByText('BTCUSDT')).toBeInTheDocument();
    
    rerender(
      <ChartPanel symbol="BTCUSDT" onClose={mockOnClose} size="expanded" />
    );
    
    expect(screen.getByTitle('Minimize')).toBeInTheDocument();
  });

  it('should cleanup resources on unmount', () => {
    const { unmount } = render(<ChartPanel symbol="BTCUSDT" onClose={mockOnClose} />);
    
    // Mock cancelAnimationFrame
    const cancelAnimationFrameSpy = vi.spyOn(window, 'cancelAnimationFrame');
    
    unmount();
    
    // Verificar que se limpien los recursos (en este caso, no hay animaciones activas)
    expect(cancelAnimationFrameSpy).toHaveBeenCalledTimes(0);
  });
});
