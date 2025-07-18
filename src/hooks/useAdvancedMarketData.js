import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { gsap } from 'gsap';

// Real-time market data hook con WebSockets
export const useRealTimeMarketData = (symbols = []) => {
  const [marketData, setMarketData] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [lastUpdate, setLastUpdate] = useState(null);
  const socketRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  // Simulated WebSocket server (en producción usarías Finnhub, Alpha Vantage WS, etc.)
  const connectToMarketDataStream = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    setConnectionStatus('connecting');

    // En este ejemplo simularemos un WebSocket
    // En producción conectarías a:
    // - ws://stream.finnhub.io
    // - wss://ws.coincap.io/prices
    // - O tu propio servidor WebSocket

    const simulateWebSocket = () => {
      const ws = {
        connected: true,
        emit: () => {},
        on: (event, callback) => {
          if (event === 'connect') {
            setConnectionStatus('connected');
            reconnectAttempts.current = 0;
            callback();
          }
        },
        disconnect: () => {
          ws.connected = false;
          setConnectionStatus('disconnected');
        }
      };

      socketRef.current = ws;

      // Simular datos en tiempo real
      const generateRealtimeData = () => {
        if (!ws.connected) return;

        symbols.forEach(symbol => {
          const basePrice = symbol.includes('BTC') ? 45000 : 
                           symbol === 'AAPL' ? 185 :
                           symbol === 'TSLA' ? 250 : 150;
          
          const volatility = 0.001 + Math.random() * 0.002;
          const change = (Math.random() - 0.5) * volatility;
          const newPrice = basePrice * (1 + change);
          
          const priceData = {
            symbol,
            price: parseFloat(newPrice.toFixed(2)),
            change: parseFloat((newPrice - basePrice).toFixed(2)),
            changePercent: parseFloat((change * 100).toFixed(3)),
            volume: Math.floor(Math.random() * 1000000),
            timestamp: Date.now(),
            bid: newPrice - 0.01,
            ask: newPrice + 0.01,
            high24h: newPrice * (1 + Math.random() * 0.05),
            low24h: newPrice * (1 - Math.random() * 0.05)
          };

          setMarketData(prev => ({
            ...prev,
            [symbol]: priceData
          }));
        });

        setLastUpdate(Date.now());
      };

      // Generar datos cada 100ms (ultra rápido como real trading)
      const interval = setInterval(generateRealtimeData, 100);

      // Simular conexión establecida
      setTimeout(() => {
        if (ws.connected) {
          ws.on('connect', () => {});
          setConnectionStatus('connected');
        }
      }, 500);

      // Cleanup
      return () => {
        clearInterval(interval);
        ws.disconnect();
      };
    };

    return simulateWebSocket();
  }, [symbols]);

  // Auto-reconnect logic
  const handleReconnect = useCallback(() => {
    if (reconnectAttempts.current < maxReconnectAttempts) {
      reconnectAttempts.current++;
      setTimeout(() => {
        connectToMarketDataStream();
      }, Math.pow(2, reconnectAttempts.current) * 1000); // Exponential backoff
    }
  }, [connectToMarketDataStream]);

  useEffect(() => {
    if (symbols.length > 0) {
      const cleanup = connectToMarketDataStream();
      return cleanup;
    }
  }, [symbols, connectToMarketDataStream]);

  useEffect(() => {
    if (connectionStatus === 'disconnected' && symbols.length > 0) {
      handleReconnect();
    }
  }, [connectionStatus, handleReconnect, symbols.length]);

  return {
    marketData,
    connectionStatus,
    lastUpdate,
    reconnect: connectToMarketDataStream
  };
};

// Hook para análisis de sentimiento en tiempo real
export const useMarketSentiment = (symbols = []) => {
  const [sentimentData, setSentimentData] = useState({});
  const [socialMentions, setSocialMentions] = useState({});
  const [newsFlow, setNewsFlow] = useState([]);

  useEffect(() => {
    const analyzeSentiment = () => {
      symbols.forEach(symbol => {
        // Simular análisis de sentimiento (en producción: NewsAPI, Twitter API, Reddit API)
        const sentiments = ['bullish', 'bearish', 'neutral'];
        const sentiment = sentiments[Math.floor(Math.random() * sentiments.length)];
        const score = Math.random() * 2 - 1; // -1 to 1
        const confidence = 0.6 + Math.random() * 0.4; // 60-100%
        
        setSentimentData(prev => ({
          ...prev,
          [symbol]: {
            sentiment,
            score,
            confidence,
            mentions: Math.floor(Math.random() * 1000),
            trending: Math.random() > 0.8,
            timestamp: Date.now()
          }
        }));

        // Simular flujo de noticias
        if (Math.random() > 0.95) { // 5% chance cada update
          const newsTypes = [
            'earnings_beat', 'analyst_upgrade', 'partnership_announced',
            'regulatory_concern', 'market_volatility', 'technical_breakout'
          ];
          
          const newsType = newsTypes[Math.floor(Math.random() * newsTypes.length)];
          const newsItem = {
            symbol,
            type: newsType,
            title: generateNewsTitle(symbol, newsType),
            impact: Math.random() > 0.5 ? 'positive' : 'negative',
            timestamp: Date.now(),
            source: 'MarketWatch'
          };

          setNewsFlow(prev => [newsItem, ...prev.slice(0, 9)]); // Keep last 10
        }
      });
    };

    const generateNewsTitle = (symbol, type) => {
      const titles = {
        earnings_beat: `${symbol} beats earnings expectations`,
        analyst_upgrade: `Analyst upgrades ${symbol} to buy`,
        partnership_announced: `${symbol} announces strategic partnership`,
        regulatory_concern: `Regulatory concerns impact ${symbol}`,
        market_volatility: `${symbol} shows high volatility amid market uncertainty`,
        technical_breakout: `${symbol} breaks key resistance level`
      };
      return titles[type] || `${symbol} market update`;
    };

    const interval = setInterval(analyzeSentiment, 5000); // Update every 5 seconds
    analyzeSentiment(); // Initial call

    return () => clearInterval(interval);
  }, [symbols]);

  return {
    sentimentData,
    socialMentions,
    newsFlow
  };
};

// Hook para alertas inteligentes avanzadas
export const useSmartAlerts = (marketData, userPreferences = {}) => {
  const [alerts, setAlerts] = useState([]);
  const [patterns, setPatterns] = useState({});
  const audioContextRef = useRef(null);
  const alertIdCounterRef = useRef(0);
  const lastAlertTimeRef = useRef({});
  const activeOscillatorsRef = useRef(new Set());

  // Función para generar IDs únicos
  const generateUniqueId = useCallback(() => {
    alertIdCounterRef.current += 1;
    return `alert-${Date.now()}-${alertIdCounterRef.current}`;
  }, []);

  // Función para limpiar oscillators activos
  const cleanupOscillators = useCallback(() => {
    activeOscillatorsRef.current.forEach(oscillator => {
      try {
        oscillator.stop();
        oscillator.disconnect();
      } catch (e) {
        // Oscillator ya fue detenido
      }
    });
    activeOscillatorsRef.current.clear();
  }, []);

  // Verificar si podemos reproducir una alerta (throttling)
  const canPlayAlert = useCallback((symbol, alertType) => {
    const key = `${symbol}-${alertType}`;
    const now = Date.now();
    const lastTime = lastAlertTimeRef.current[key] || 0;
    const minimumInterval = 10000; // 10 segundos entre alertas del mismo tipo (más conservador)
    
    if (now - lastTime > minimumInterval) {
      lastAlertTimeRef.current[key] = now;
      return true;
    }
    return false;
  }, []);

  // Inicializar Web Audio API avanzado
  useEffect(() => {
    if (typeof window !== 'undefined' && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API no disponible:', error);
      }
    }
    
    // Cleanup al desmontar
    return () => {
      cleanupOscillators();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [cleanupOscillators]);

  // Sistema de audio avanzado con ADSR envelope
  const playSmartAlert = useCallback((alertType, severity = 'medium') => {
    // Verificar si el audio está habilitado
    if (!userPreferences.audioEnabled) return;
    
    if (!audioContextRef.current || audioContextRef.current.state === 'closed') return;

    try {
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(e => console.warn('No se pudo reanudar audio context:', e));
        return; // No reproducir hasta que se resuma
      }

      // Limitar oscillators activos (máximo 5)
      if (activeOscillatorsRef.current.size >= 5) {
        console.warn('Demasiados sonidos activos, omitiendo alerta');
        return;
      }

      // Configuración de frecuencias por tipo de alerta
      const alertFrequencies = {
        price_breakout: [880, 1100],
        volume_spike: [660, 880, 1100],
        sentiment_change: [440, 554],
        pattern_detected: [523, 659, 784],
        news_impact: [392, 493]
      };

      const frequencies = alertFrequencies[alertType] || [440];
      const duration = severity === 'high' ? 0.8 : severity === 'medium' ? 0.5 : 0.3;

      frequencies.forEach((freq, index) => {
        setTimeout(() => {
          try {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            const filterNode = ctx.createBiquadFilter();

            // Registrar oscillator para cleanup
            activeOscillatorsRef.current.add(oscillator);

            // ADSR Envelope
            const now = ctx.currentTime;
            const attack = 0.01;
            const decay = 0.1;
            const sustain = 0.6;
            const release = 0.3;

            oscillator.connect(filterNode);
            filterNode.connect(gainNode);
            gainNode.connect(ctx.destination);

            // Configurar oscillator
            oscillator.frequency.setValueAtTime(freq, now);
            oscillator.type = severity === 'high' ? 'sawtooth' : 'sine';

            // Configurar filtro (low-pass para suavizar)
            filterNode.type = 'lowpass';
            filterNode.frequency.setValueAtTime(freq * 2, now);
            filterNode.Q.setValueAtTime(1, now);

            // ADSR Envelope con validación
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.2, now + attack); // Volumen reducido
            gainNode.gain.exponentialRampToValueAtTime(0.2 * sustain, now + attack + decay);
            gainNode.gain.setValueAtTime(0.2 * sustain, now + duration - release);
            gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

            // Cleanup cuando termine
            oscillator.onended = () => {
              activeOscillatorsRef.current.delete(oscillator);
              try {
                oscillator.disconnect();
                gainNode.disconnect();
                filterNode.disconnect();
              } catch (e) {
                // Ya desconectado
              }
            };

            oscillator.start(now);
            oscillator.stop(now + duration);
          } catch (error) {
            console.warn('Error al reproducir alerta de audio:', error);
          }
        }, index * 150); // Más separación entre frecuencias
      });
    } catch (error) {
      console.error('Error en playSmartAlert:', error);
    }
  }, []);

  // Detectar patrones avanzados
  const detectAdvancedPatterns = useCallback((symbol, priceHistory) => {
    if (!priceHistory || priceHistory.length < 10) return;

    const recent = priceHistory.slice(-10);
    const currentPrice = recent[recent.length - 1].price;
    const prevPrice = recent[recent.length - 2].price;

    // Pattern: Golden Cross (SMA breakout)
    const sma5 = recent.slice(-5).reduce((sum, p) => sum + p.price, 0) / 5;
    const sma10 = recent.reduce((sum, p) => sum + p.price, 0) / 10;
    
    if (sma5 > sma10 && !patterns[symbol]?.golden_cross && canPlayAlert(symbol, 'pattern_detected')) {
      setPatterns(prev => ({
        ...prev,
        [symbol]: { ...prev[symbol], golden_cross: true }
      }));
      
      const alert = {
        id: generateUniqueId(),
        symbol,
        type: 'pattern_detected',
        pattern: 'Golden Cross',
        message: `${symbol}: SMA(5) crossed above SMA(10) - Bullish signal`,
        severity: 'high',
        timestamp: Date.now()
      };
      
      setAlerts(prev => {
        // Limitar a máximo 10 alertas para evitar saturación
        const newAlerts = [alert, ...prev.slice(0, 9)];
        return newAlerts;
      });
      playSmartAlert('pattern_detected', 'high');
    }

    // Pattern: Volume spike with price movement (más sensible)
    const avgVolume = recent.slice(0, -1).reduce((sum, p) => sum + (p.volume || 0), 0) / 9;
    const currentVolume = recent[recent.length - 1].volume || 0;
    
    if (currentVolume > avgVolume * 3 && Math.abs(currentPrice - prevPrice) / prevPrice > 0.03 && canPlayAlert(symbol, 'volume_spike')) {
      const alert = {
        id: generateUniqueId(),
        symbol,
        type: 'volume_spike',
        message: `${symbol}: Unusual volume (${(currentVolume / 1000000).toFixed(1)}M) with ${((currentPrice - prevPrice) / prevPrice * 100).toFixed(1)}% move`,
        severity: 'medium',
        timestamp: Date.now()
      };
      
      setAlerts(prev => {
        // Limitar a máximo 10 alertas para evitar saturación
        const newAlerts = [alert, ...prev.slice(0, 9)];
        return newAlerts;
      });
      playSmartAlert('volume_spike', 'medium');
    }

    // Pattern: Price breakout
    const resistance = Math.max(...recent.slice(0, -1).map(p => p.price));
    const support = Math.min(...recent.slice(0, -1).map(p => p.price));
    
    if (currentPrice > resistance * 1.01 && canPlayAlert(symbol, 'price_breakout')) { // 1% breakout (más significativo)
      const alert = {
        id: generateUniqueId(),
        symbol,
        type: 'price_breakout',
        message: `${symbol}: Breakout above resistance at $${resistance.toFixed(2)}`,
        severity: 'high',
        timestamp: Date.now()
      };
      
      setAlerts(prev => {
        // Limitar a máximo 10 alertas para evitar saturación
        const newAlerts = [alert, ...prev.slice(0, 9)];
        return newAlerts;
      });
      playSmartAlert('price_breakout', 'high');
    }
  }, [patterns, playSmartAlert, generateUniqueId, canPlayAlert]);

  // Analizar datos de mercado en tiempo real
  useEffect(() => {
    Object.entries(marketData).forEach(([symbol, data]) => {
      if (!data || !data.price) return;

      // Crear historial de precios simulado para análisis
      const priceHistory = Array.from({ length: 10 }, (_, i) => ({
        price: data.price * (1 + (Math.random() - 0.5) * 0.01 * i),
        volume: data.volume * (0.8 + Math.random() * 0.4),
        timestamp: Date.now() - (10 - i) * 60000
      }));

      detectAdvancedPatterns(symbol, priceHistory);
    });
  }, [marketData, detectAdvancedPatterns]);

  // Auto-clear old alerts
  useEffect(() => {
    const cleanup = setInterval(() => {
      setAlerts(prev => prev.filter(alert => 
        Date.now() - alert.timestamp < 60000 // Keep alerts for 60 seconds (aumentado de 30)
      ));
    }, 10000); // Check every 10 seconds (aumentado de 5)

    return () => clearInterval(cleanup);
  }, []);

  return {
    alerts,
    patterns,
    clearAlerts: () => setAlerts([]),
    playSmartAlert
  };
};

// Hook para gestión de datos históricos con caché
export const useHistoricalData = (symbol, timeframe = '1D') => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const cacheRef = useRef(new Map());

  const fetchHistoricalData = useCallback(async () => {
    const cacheKey = `${symbol}_${timeframe}`;
    
    // Check cache first
    if (cacheRef.current.has(cacheKey)) {
      const cached = cacheRef.current.get(cacheKey);
      if (Date.now() - cached.timestamp < 60000) { // 1 minute cache
        setData(cached.data);
        return;
      }
    }

    setLoading(true);
    setError(null);

    try {
      // En producción: llamada real a Alpha Vantage, Finnhub, etc.
      // const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_INTRADAY&symbol=${symbol}&interval=${timeframe}&apikey=${API_KEY}`);
      
      // Simulación de datos históricos
      await new Promise(resolve => setTimeout(resolve, 500)); // Simular latencia
      
      const mockData = generateMockHistoricalData(symbol, timeframe);
      
      // Cache the result
      cacheRef.current.set(cacheKey, {
        data: mockData,
        timestamp: Date.now()
      });
      
      setData(mockData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [symbol, timeframe]);

  const generateMockHistoricalData = (symbol, timeframe) => {
    const periods = timeframe === '1H' ? 60 : timeframe === '4H' ? 240 : timeframe === '1D' ? 288 : 2016;
    const basePrice = symbol.includes('BTC') ? 45000 : symbol === 'AAPL' ? 185 : 150;
    
    return Array.from({ length: periods }, (_, i) => {
      const time = Date.now() - (periods - i) * (timeframe === '1H' ? 300000 : timeframe === '4H' ? 900000 : 300000);
      const price = basePrice * (1 + Math.sin(i / 20) * 0.1 + (Math.random() - 0.5) * 0.02);
      
      return {
        time: Math.floor(time / 1000),
        open: price * (1 + (Math.random() - 0.5) * 0.001),
        high: price * (1 + Math.random() * 0.005),
        low: price * (1 - Math.random() * 0.005),
        close: price,
        volume: Math.floor(Math.random() * 1000000)
      };
    });
  };

  useEffect(() => {
    if (symbol) {
      fetchHistoricalData();
    }
  }, [symbol, timeframe, fetchHistoricalData]);

  return {
    data,
    loading,
    error,
    refetch: fetchHistoricalData
  };
};

export default {
  useRealTimeMarketData,
  useMarketSentiment,
  useSmartAlerts,
  useHistoricalData
};
