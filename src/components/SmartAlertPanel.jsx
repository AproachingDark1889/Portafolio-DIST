import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  AlertTriangle, TrendingUp, TrendingDown, Volume2, 
  Target, Activity, Zap, X, Filter, Volume, 
  Clock, Bell, BellOff
} from 'lucide-react';
import { useMarketStore, ALERT_TYPES } from '../stores/marketStore';

const SmartAlertPanel = ({ className = '' }) => {
  const { alerts, audioEnabled, setAudioEnabled, clearAlerts, removeAlert } = useMarketStore();
  const [filter, setFilter] = useState('all'); // all, high, medium, low
  const [showDetails, setShowDetails] = useState(false);

  // Filtrar alertas
  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true;
    return alert.severity === filter;
  });

  // Iconos por tipo de alerta
  const getAlertIcon = (type) => {
    switch (type) {
      case ALERT_TYPES.BREAKOUT:
        return <TrendingUp className="w-4 h-4" />;
      case ALERT_TYPES.BREAKDOWN:
        return <TrendingDown className="w-4 h-4" />;
      case ALERT_TYPES.VOLUME_SPIKE:
        return <Volume2 className="w-4 h-4" />;
      case ALERT_TYPES.RSI_OVERBOUGHT:
      case ALERT_TYPES.RSI_OVERSOLD:
        return <Target className="w-4 h-4" />;
      case ALERT_TYPES.MACD_SIGNAL:
        return <Activity className="w-4 h-4" />;
      case ALERT_TYPES.BB_SQUEEZE:
        return <Zap className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  // Colores por severidad
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high':
        return 'bg-red-500/20 border-red-500/50 text-red-200';
      case 'medium':
        return 'bg-yellow-500/20 border-yellow-500/50 text-yellow-200';
      case 'low':
        return 'bg-blue-500/20 border-blue-500/50 text-blue-200';
      default:
        return 'bg-gray-500/20 border-gray-500/50 text-gray-200';
    }
  };

  // Formatear tiempo
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  // Estadísticas rápidas
  const alertStats = {
    total: alerts.length,
    high: alerts.filter(a => a.severity === 'high').length,
    medium: alerts.filter(a => a.severity === 'medium').length,
    low: alerts.filter(a => a.severity === 'low').length,
    last5min: alerts.filter(a => Date.now() - a.timestamp < 300000).length
  };

  return (
    <div className={`bg-gray-900/95 backdrop-blur-sm border border-gray-700 rounded-xl ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <h3 className="text-lg font-bold text-white">Smart Alerts</h3>
          </div>
          
          {/* Badge con contador */}
          <div className="flex items-center space-x-2">
            <div className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm font-medium">
              {alertStats.total}
            </div>
            {alertStats.last5min > 0 && (
              <div className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                {alertStats.last5min} recent
              </div>
            )}
          </div>
        </div>

        {/* Controles */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
            title="Toggle Details"
          >
            <Filter className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-lg transition-colors ${
              audioEnabled ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'
            }`}
            title="Toggle Audio"
          >
            {audioEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
          </button>
          
          <button
            onClick={clearAlerts}
            className="p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 transition-colors"
            title="Clear All"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filtros y estadísticas */}
      {showDetails && (
        <div className="p-4 border-b border-gray-700 bg-gray-800/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              {['all', 'high', 'medium', 'low'].map(severity => (
                <button
                  key={severity}
                  onClick={() => setFilter(severity)}
                  className={`px-3 py-1 rounded text-sm transition-colors ${
                    filter === severity 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {severity.charAt(0).toUpperCase() + severity.slice(1)}
                  {severity !== 'all' && (
                    <span className="ml-1 text-xs">({alertStats[severity]})</span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="text-sm text-gray-400">
              Last 5min: <span className="text-white">{alertStats.last5min}</span>
            </div>
          </div>
        </div>
      )}

      {/* Lista de alertas */}
      <div className="max-h-80 overflow-y-auto">
        <AnimatePresence>
          {filteredAlerts.length === 0 ? (
            <div className="p-8 text-center">
              <AlertTriangle className="w-8 h-8 text-gray-500 mx-auto mb-2" />
              <p className="text-gray-500">No alerts</p>
              <p className="text-xs text-gray-600 mt-1">
                Smart alerts will appear here when conditions are met
              </p>
            </div>
          ) : (
            filteredAlerts.map((alert) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={`p-3 border-b border-gray-700/50 last:border-b-0 ${getSeverityColor(alert.severity)}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {/* Icono y severity */}
                    <div className="flex flex-col items-center space-y-1">
                      {getAlertIcon(alert.type)}
                      <div className={`w-2 h-2 rounded-full ${
                        alert.severity === 'high' ? 'bg-red-500' :
                        alert.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                      }`} />
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-medium text-white">{alert.symbol}</span>
                        <span className="text-sm text-gray-400">${alert.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-500">{formatTime(alert.timestamp)}</span>
                      </div>
                      
                      <p className="text-sm leading-relaxed">{alert.message}</p>
                      
                      {/* Indicadores técnicos */}
                      {showDetails && alert.indicators && (
                        <div className="mt-2 flex items-center space-x-3 text-xs text-gray-400">
                          {alert.indicators.rsi && (
                            <span>RSI: {alert.indicators.rsi.toFixed(1)}</span>
                          )}
                          {alert.indicators.volume && alert.indicators.volumeMA && (
                            <span>
                              Vol: {(alert.indicators.volume / alert.indicators.volumeMA).toFixed(1)}x
                            </span>
                          )}
                          {alert.indicators.atr && (
                            <span>ATR: {alert.indicators.atr.toFixed(2)}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Botón cerrar */}
                  <button
                    onClick={() => removeAlert(alert.id)}
                    className="p-1 rounded hover:bg-gray-700/50 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Footer con resumen */}
      {filteredAlerts.length > 0 && (
        <div className="p-3 border-t border-gray-700 bg-gray-800/30">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>
              Showing {filteredAlerts.length} of {alerts.length} alerts
            </span>
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>Auto-clear after 60s</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAlertPanel;
