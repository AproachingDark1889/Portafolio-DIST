import React, { useEffect, useRef, useState } from 'react';

const SimpleChart = ({ symbol = 'BTCUSDT', width = 800, height = 400 }) => {
  const canvasRef = useRef();
  const animationRef = useRef();
  const [isAnimating, setIsAnimating] = useState(true);

  // Generar datos realistas para diferentes símbolos
  const generateData = (symbol) => {
    const basePrice = {
      'BTCUSDT': 45000,
      'ETHUSDT': 2800,
      'ADAUSDT': 0.45,
      'SOLUSDT': 95,
      'DOGEUSDT': 0.08
    }[symbol] || 100;

    const data = [];
    let currentPrice = basePrice;
    
    for (let i = 100; i >= 0; i--) {
      // Añadir algo de volatilidad realista
      const change = (Math.random() - 0.5) * 0.04; // ±2% max change per point
      currentPrice *= (1 + change);
      
      data.push({
        x: i,
        y: parseFloat(currentPrice.toFixed(symbol.includes('USD') ? 2 : 8))
      });
    }
    
    return data.reverse();
  };

  const drawChart = (data, animationProgress = 1) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find min/max for scaling
    const prices = data.map(d => d.y);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = maxPrice - minPrice;

    // Chart colors by symbol
    const colors = {
      'BTCUSDT': '#F7931A',
      'ETHUSDT': '#627EEA', 
      'ADAUSDT': '#0033AD',
      'SOLUSDT': '#9945FF',
      'DOGEUSDT': '#C2A633'
    };
    const color = colors[symbol] || '#2563EB';

    // Draw grid
    ctx.strokeStyle = 'rgba(75, 85, 99, 0.3)';
    ctx.lineWidth = 1;
    
    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    
    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = (height / 5) * i;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Calculate how much data to show based on animation progress
    const dataToShow = Math.floor(data.length * animationProgress);
    const animatedData = data.slice(0, dataToShow);

    if (animatedData.length < 2) return;

    // Draw price line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    animatedData.forEach((point, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((point.y - minPrice) / priceRange) * height;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw area fill
    if (animatedData.length > 1) {
      ctx.beginPath();
      animatedData.forEach((point, index) => {
        const x = (index / (data.length - 1)) * width;
        const y = height - ((point.y - minPrice) / priceRange) * height;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      const lastX = ((animatedData.length - 1) / (data.length - 1)) * width;
      ctx.lineTo(lastX, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, `${color}40`);
      gradient.addColorStop(1, `${color}10`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw price labels
    ctx.fillStyle = '#E5E7EB';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'right';
    
    // Current price (top right)
    const currentPrice = prices[prices.length - 1];
    ctx.fillText(`$${currentPrice.toLocaleString()}`, width - 10, 20);
    
    // Min/Max prices
    ctx.fillText(`$${maxPrice.toLocaleString()}`, width - 10, 35);
    ctx.fillText(`$${minPrice.toLocaleString()}`, width - 10, height - 10);

    // Add subtle glow effect for current price point
    if (animationProgress === 1 && animatedData.length > 0) {
      const lastPoint = animatedData[animatedData.length - 1];
      const x = ((animatedData.length - 1) / (data.length - 1)) * width;
      const y = height - ((lastPoint.y - minPrice) / priceRange) * height;
      
      ctx.shadowColor = color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  };

  useEffect(() => {
    const data = generateData(symbol);
    
    if (isAnimating) {
      let progress = 0;
      const animate = () => {
        progress += 0.02; // 2% progress per frame
        
        if (progress >= 1) {
          progress = 1;
          setIsAnimating(false);
        }
        
        drawChart(data, progress);
        
        if (progress < 1) {
          animationRef.current = requestAnimationFrame(animate);
        }
      };
      
      animate();
    } else {
      drawChart(data, 1);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [symbol, width, height]);

  // Calculate price change percentage
  const data = generateData(symbol);
  const priceChange = ((data[data.length - 1].y - data[0].y) / data[0].y) * 100;
  const isPositive = priceChange >= 0;

  return (
    <div className="w-full h-full relative">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ maxWidth: width, maxHeight: height }}
      />
      <div className="absolute top-2 left-2">
        <div className="text-white font-semibold text-lg">{symbol}</div>
        <div className={`text-sm flex items-center gap-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
          {isPositive ? '↗' : '↘'} {Math.abs(priceChange).toFixed(2)}%
        </div>
      </div>
      <div className="absolute top-2 right-2">
        <div className="text-xs text-gray-400">Live</div>
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
      </div>
    </div>
  );
};

export default SimpleChart;
