import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Activity, Zap } from 'lucide-react';

const RealTimeHeatMap = ({ marketData, className = "" }) => {
  const canvasRef = useRef();
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || !marketData) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 600;
    const height = canvas.height = 400;

    // Clear canvas
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, width, height);

    // Convertir datos del mercado en grid
    const symbols = Object.keys(marketData);
    const cols = Math.ceil(Math.sqrt(symbols.length));
    const rows = Math.ceil(symbols.length / cols);
    
    const cellWidth = width / cols;
    const cellHeight = height / rows;

    symbols.forEach((symbol, index) => {
      const data = marketData[symbol];
      const col = index % cols;
      const row = Math.floor(index / cols);
      
      const x = col * cellWidth;
      const y = row * cellHeight;
      
      // Calcular intensidad del color basado en el cambio porcentual
      const changePercent = data.changePercent || 0;
      const intensity = Math.min(Math.abs(changePercent) / 5, 1); // Normalizar a 0-1
      
      // Colores basados en performance
      let color;
      if (changePercent > 0) {
        // Verde para positivos
        const greenIntensity = Math.floor(intensity * 255);
        color = `rgba(34, 197, 94, ${intensity * 0.8})`;
      } else if (changePercent < 0) {
        // Rojo para negativos
        const redIntensity = Math.floor(intensity * 255);
        color = `rgba(239, 68, 68, ${intensity * 0.8})`;
      } else {
        color = 'rgba(107, 114, 128, 0.3)';
      }

      // Dibujar celda del heatmap
      ctx.fillStyle = color;
      ctx.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
      
      // Borde de la celda
      ctx.strokeStyle = 'rgba(75, 85, 99, 0.5)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
      
      // Efecto de pulso para cambios extremos
      if (Math.abs(changePercent) > 3) {
        const pulseIntensity = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255, 255, 255, ${pulseIntensity * 0.2})`;
        ctx.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
      }
      
      // Texto del símbolo
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      ctx.fillText(symbol, x + cellWidth / 2, y + cellHeight / 2 - 5);
      
      // Percentage change
      ctx.fillStyle = changePercent >= 0 ? '#22C55E' : '#EF4444';
      ctx.font = '10px Inter';
      ctx.fillText(
        `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`,
        x + cellWidth / 2,
        y + cellHeight / 2 + 10
      );
      
      // Precio
      ctx.fillStyle = '#D1D5DB';
      ctx.font = '9px Inter';
      ctx.fillText(
        `$${(data.price || 0).toFixed(2)}`,
        x + cellWidth / 2,
        y + cellHeight / 2 + 22
      );
    });

    // Grid overlay para mejor definición
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)';
    ctx.lineWidth = 1;
    
    // Líneas verticales
    for (let i = 0; i <= cols; i++) {
      ctx.beginPath();
      ctx.moveTo(i * cellWidth, 0);
      ctx.lineTo(i * cellWidth, height);
      ctx.stroke();
    }
    
    // Líneas horizontales
    for (let i = 0; i <= rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, i * cellHeight);
      ctx.lineTo(width, i * cellHeight);
      ctx.stroke();
    }

  }, [marketData]);

  // Handle mouse movement para tooltips
  const handleMouseMove = (event) => {
    if (!canvasRef.current || !marketData) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    const symbols = Object.keys(marketData);
    const cols = Math.ceil(Math.sqrt(symbols.length));
    const rows = Math.ceil(symbols.length / cols);
    
    const cellWidth = 600 / cols;
    const cellHeight = 400 / rows;
    
    const col = Math.floor(x / cellWidth);
    const row = Math.floor(y / cellHeight);
    const index = row * cols + col;
    
    if (index < symbols.length) {
      const symbol = symbols[index];
      const data = marketData[symbol];
      setHoveredCell({
        symbol,
        data,
        x: event.clientX,
        y: event.clientY
      });
    } else {
      setHoveredCell(null);
    }
  };

  const handleMouseLeave = () => {
    setHoveredCell(null);
  };

  return (
    <div className={`relative ${className}`}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-4 border border-gray-700/50"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-indigo-400" />
            <h3 className="text-lg font-bold text-white">Market Heat Map</h3>
            <div className="text-xs bg-gradient-to-r from-red-500 to-green-500 px-2 py-1 rounded text-white">
              REAL-TIME
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-gray-300">Bearish</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-gray-500 rounded"></div>
              <span className="text-gray-300">Neutral</span>
            </div>
            <div className="flex items-center space-x-1">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-gray-300">Bullish</span>
            </div>
          </div>
        </div>
        
        <canvas
          ref={canvasRef}
          className="w-full h-auto border border-gray-600/30 rounded-lg cursor-pointer"
          width={600}
          height={400}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        />
        
        {/* Tooltip */}
        {hoveredCell && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed z-50 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl pointer-events-none"
            style={{
              left: hoveredCell.x + 10,
              top: hoveredCell.y - 10
            }}
          >
            <div className="text-white font-bold">{hoveredCell.symbol}</div>
            <div className="text-gray-300 text-sm">
              Price: ${hoveredCell.data.price?.toFixed(2) || '0.00'}
            </div>
            <div className={`text-sm font-medium ${
              hoveredCell.data.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
            }`}>
              Change: {hoveredCell.data.changePercent >= 0 ? '+' : ''}{hoveredCell.data.changePercent?.toFixed(2) || '0.00'}%
            </div>
            <div className="text-gray-400 text-xs">
              Volume: {((hoveredCell.data.volume || 0) / 1000000).toFixed(1)}M
            </div>
          </motion.div>
        )}
        
        {/* Performance indicators */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
          {Object.entries(marketData).slice(0, 4).map(([symbol, data]) => (
            <div key={symbol} className="text-center">
              <div className="text-xs text-gray-400">{symbol}</div>
              <div className={`flex items-center justify-center space-x-1 ${
                data.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {data.changePercent >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                <span className="text-xs font-medium">
                  {Math.abs(data.changePercent || 0).toFixed(1)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RealTimeHeatMap;
