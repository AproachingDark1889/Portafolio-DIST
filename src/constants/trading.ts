// 🔥 TRADING CONSTANTS - PROFESSIONAL GRADE

export const TRADING_CONSTANTS = {
  // Límites de seguridad
  MAX_SYMBOLS: 10,
  MAX_CANDLES: 1000,
  MAX_ALERTS: 50,
  
  // Intervalos de actualización
  REALTIME_INTERVAL: 1000, // 1 segundo
  CHART_UPDATE_INTERVAL: 5000, // 5 segundos
  HEARTBEAT_INTERVAL: 10000, // 10 segundos
  
  // Umbrales de alertas
  DEFAULT_ATR_MULTIPLIER: 2,
  MIN_ALERT_THRESHOLD: 0.1, // 0.1%
  MAX_ALERT_THRESHOLD: 50, // 50%
  
  // Reconexión
  RECONNECT_INTERVALS: [1000, 2000, 4000, 8000, 16000, 30000] as const,
  MAX_RECONNECT_ATTEMPTS: 6,
  
  // Performance
  CANVAS_FPS: 30,
  ANIMATION_THROTTLE: 16, // ~60fps
  
  // Validación
  SYMBOL_REGEX: /^[A-Z0-9]{1,10}$/,
  PRICE_PRECISION: 8,
  VOLUME_PRECISION: 2
} as const;

export const SUPPORTED_SYMBOLS = [
  'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT',
  'AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN'
] as const;

export type SupportedSymbol = typeof SUPPORTED_SYMBOLS[number];

// Configuración de niveles de efectos visuales
export const EFFECT_LEVELS = {
  LOW: {
    animations: false,
    particles: false,
    glowEffects: false,
    transitionDuration: 0
  },
  MEDIUM: {
    animations: true,
    particles: false,
    glowEffects: true,
    transitionDuration: 150
  },
  HIGH: {
    animations: true,
    particles: true,
    glowEffects: true,
    transitionDuration: 300
  }
} as const;

export type EffectLevel = keyof typeof EFFECT_LEVELS;

// Tema minimalista para traders profesionales
export const PLAIN_THEME = {
  colors: {
    background: '#1a1a1a',
    foreground: '#ffffff',
    positive: '#00ff00',
    negative: '#ff0000',
    neutral: '#666666',
    border: '#333333',
    accent: '#0066cc'
  },
  animations: {
    duration: 0, // Sin animaciones
    easing: 'linear'
  },
  typography: {
    fontFamily: 'monospace',
    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem'
    }
  }
} as const;

// Configuración de seguridad
export const SECURITY_CONFIG = {
  SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutos
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutos
  CSRF_TOKEN_LENGTH: 32,
  API_RATE_LIMIT: 100, // requests per minute
  WEBSOCKET_HEARTBEAT: 30000, // 30 segundos
  ENCRYPTION_KEY_LENGTH: 256
} as const;

// Disclaimers legales
export const LEGAL_DISCLAIMERS = {
  TRADING_RISK: '⚠️ Trading involves substantial risk of loss and is not suitable for all investors.',
  DATA_ACCURACY: 'Market data is provided for informational purposes only and may be delayed.',
  NO_ADVICE: 'This platform does not provide investment advice. Please consult with a financial advisor.',
  DEMO_MODE: 'Demo mode uses simulated data and does not reflect actual market conditions.',
  REAL_MONEY: 'Real money trading involves risk of substantial losses. Trade responsibly.'
} as const;
