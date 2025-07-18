import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType } from 'lightweight-charts';
import type { CandleData } from '../types/trading';

interface TradingViewChartProps {
  symbol: string;
  data?: CandleData[];
  height?: number;
  showVolume?: boolean;
  onCrosshairMove?: (param: any) => void;
  theme?: 'dark' | 'light';
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  data = [], 
  height = 400, 
  showVolume = true,
  onCrosshairMove,
  theme = 'dark'
}) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<any>(null);
  const volumeSeriesRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Configuración del tema
    const themeConfig = {
      layout: {
        background: { 
          type: ColorType.Solid, 
          color: theme === 'dark' ? '#0a0a0a' : '#ffffff' 
        },
        textColor: theme === 'dark' ? '#ffffff' : '#000000',
      },
      grid: {
        vertLines: { 
          color: theme === 'dark' ? '#1a1a1a' : '#e1e1e1',
        },
        horzLines: { 
          color: theme === 'dark' ? '#1a1a1a' : '#e1e1e1',
        },
      },
      crosshair: {
        vertLine: {
          color: '#758695',
        },
        horzLine: {
          color: '#758695',
        },
      },
      timeScale: {
        borderColor: theme === 'dark' ? '#2B2B43' : '#cccccc',
        timeVisible: true,
        secondsVisible: false,
      },
      rightPriceScale: {
        borderColor: theme === 'dark' ? '#2B2B43' : '#cccccc',
        scaleMargins: {
          top: 0.1,
          bottom: showVolume ? 0.4 : 0.1,
        },
      },
    };

    // Crear el gráfico
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: height,
      ...themeConfig,
    });

    chartRef.current = chart;

    // Serie de velas japonesas
    const candlestickSeries = (chart as any).addCandlestickSeries({
      upColor: '#00ff88',
      downColor: '#ff4444',
      borderDownColor: '#ff4444',
      borderUpColor: '#00ff88',
      wickDownColor: '#ff4444',
      wickUpColor: '#00ff88',
      priceFormat: {
        type: 'price',
        precision: 2,
        minMove: 0.01,
      },
    });

    candlestickSeriesRef.current = candlestickSeries;

    // Serie de volumen (si está habilitada)
    if (showVolume) {
      const volumeSeries = (chart as any).addHistogramSeries({
        color: '#26a69a',
        priceFormat: {
          type: 'volume',
        },
        priceScaleId: 'volume',
        scaleMargins: {
          top: 0.8,
          bottom: 0,
        },
      });

      volumeSeriesRef.current = volumeSeries;
    }

    // Evento de crosshair
    if (onCrosshairMove) {
      chart.subscribeCrosshairMove(onCrosshairMove);
    }

    // Manejar redimensionamiento
    const handleResize = () => {
      if (chartContainerRef.current && chart) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (chart) {
        chart.remove();
      }
    };
  }, [height, showVolume, theme, onCrosshairMove]);

  // Actualizar datos cuando cambien
  useEffect(() => {
    if (!candlestickSeriesRef.current || !data.length) return;

    try {
      // Transformar datos al formato de TradingView
      const candlestickData = data.map(item => ({
        time: Math.floor(item.time / 1000), // Convertir a timestamp en segundos
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
      })).sort((a, b) => a.time - b.time);

      const volumeData = data.map(item => ({
        time: Math.floor(item.time / 1000),
        value: item.volume,
        color: item.close >= item.open ? '#00ff8840' : '#ff444440',
      })).sort((a, b) => a.time - b.time);

      // Establecer datos
      candlestickSeriesRef.current.setData(candlestickData);
      
      if (volumeSeriesRef.current && showVolume) {
        volumeSeriesRef.current.setData(volumeData);
      }

      // Ajustar vista a los datos
      if (chartRef.current && candlestickData.length > 0) {
        chartRef.current.timeScale().fitContent();
      }

      setIsLoading(false);
    } catch (error) {
      console.error('Error updating chart data:', error);
      setIsLoading(false);
    }
  }, [data, showVolume]);

  const lastCandle = data[data.length - 1];
  const isPositive = lastCandle ? lastCandle.close >= lastCandle.open : false;

  return (
    <div className="relative w-full">
      {/* Header del gráfico */}
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex items-center space-x-4">
          <h3 className="text-lg font-bold text-white">{symbol}</h3>
          {lastCandle && (
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400">O:</span>
              <span className="text-white">{lastCandle.open.toFixed(2)}</span>
              <span className="text-gray-400">H:</span>
              <span className="text-green-400">{lastCandle.high.toFixed(2)}</span>
              <span className="text-gray-400">L:</span>
              <span className="text-red-400">{lastCandle.low.toFixed(2)}</span>
              <span className="text-gray-400">C:</span>
              <span className={`font-medium ${
                isPositive ? 'text-green-400' : 'text-red-400'
              }`}>
                {lastCandle.close.toFixed(2)}
              </span>
            </div>
          )}
        </div>
        
        {/* Indicadores de estado */}
        <div className="flex items-center space-x-2">
          {isLoading && (
            <div className="flex items-center space-x-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-yellow-400">Loading...</span>
            </div>
          )}
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
            <span className="text-xs text-green-400">Live</span>
          </div>
        </div>
      </div>

      {/* Contenedor del gráfico */}
      <div 
        ref={chartContainerRef}
        className="w-full border border-gray-700 rounded-lg overflow-hidden bg-black"
        style={{ height: `${height}px` }}
      />

      {/* Overlay de carga */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
            <p className="text-white text-sm">Loading {symbol} data...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default TradingViewChart;
