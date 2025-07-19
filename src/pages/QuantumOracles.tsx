import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, HelpCircle, RotateCcw, Info, Eye, Headphones, 
  TrendingUp, User, Settings, Download, Share2,
  Play, Pause, Volume2, VolumeX, BarChart3,
  Clock, Moon, Sun, Star, Waves, Activity, Sparkles, Cpu
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import {
  generateAdvancedIChingResponse,
  generateAdvancedTarotResponse,
  generateAdvancedRunesResponse,
  generateAdvancedDreamsResponse,
  getUserProfile,
  getEvolutionData,
  resetUserProfile
} from '@/utils/quantumOracleEngine';

const oracleTypes = [
  { 
    name: "Oráculo de I Ching Cuántico", 
    generator: generateAdvancedIChingResponse,
    type: "iching",
    icon: "☯",
    description: "Sabiduría milenaria china con análisis temporal",
    color: "#FFD700",
    element: "fire"
  },
  { 
    name: "Oráculo de Tarot Multidimensional", 
    generator: generateAdvancedTarotResponse,
    type: "tarot",
    icon: "🔮",
    description: "Arquetipos universales en síntesis cuántica",
    color: "#9932CC",
    element: "water"
  },
  { 
    name: "Oráculo de Runas Algorítmicas", 
    generator: generateAdvancedRunesResponse,
    type: "runes",
    icon: "ᚱ",
    description: "Sabiduría nórdica con resonancia ancestral",
    color: "#4682B4",
    element: "earth"
  },
  { 
    name: "Oráculo de Sueños Conscientes", 
    generator: generateAdvancedDreamsResponse,
    type: "dreams",
    icon: "💤",
    description: "Interpretación IA de símbolos oníricos",
    color: "#20B2AA",
    element: "air"
  },
];

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Activity, TrendingUp, Clock, Sparkles, Cpu } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';

const QuantumOracles: React.FC = () => {
  const [selectedOracle, setSelectedOracle] = useState(oracleTypes[0]);
  const [query, setQuery] = useState("");
  const [oracleResponse, setOracleResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [evolutionData, setEvolutionData] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [ritualMode, setRitualMode] = useState(false);
  const [visualMode, setVisualMode] = useState('normal'); // normal, immersive, minimal
  
  const audioContextRef = useRef(null);
  const oscillatorRef = useRef(null);

  // Funciones memoizadas definidas antes del useEffect
  const loadUserData = useCallback(() => {
    const profile = getUserProfile();
    const evolution = getEvolutionData();
    setUserProfile(profile);
    setEvolutionData(evolution);
  }, []);

  const initializeAudioContext = useCallback(() => {
    if (typeof window !== 'undefined' && window.AudioContext) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  useEffect(() => {
    loadUserData();
    initializeAudioContext();
    
    return () => {
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.disconnect();
        } catch (error) {
          // Oscillator ya fue desconectado
        }
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [loadUserData, initializeAudioContext]);

  const playResonanceAudio = async (frequency, duration = 3000) => {
    if (!audioEnabled || !audioContextRef.current) return;

    try {
      // Reanudar el contexto si está suspendido
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }

      // Detener audio anterior
      if (oscillatorRef.current) {
        try {
          oscillatorRef.current.disconnect();
        } catch (error) {
          // Oscillator ya fue desconectado
        }
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);
      
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current.currentTime);
      oscillator.type = 'sine';
      
      // Envelope ADSR mejorado
      const now = audioContextRef.current.currentTime;
      const attackTime = 0.1;
      const releaseTime = 0.1;
      const sustainLevel = 0.05;
      
      gainNode.gain.setValueAtTime(0, now);
      gainNode.gain.linearRampToValueAtTime(0.1, now + attackTime);
      gainNode.gain.exponentialRampToValueAtTime(sustainLevel, now + duration/1000 - releaseTime);
      gainNode.gain.linearRampToValueAtTime(0.001, now + duration/1000);
      
      oscillator.start(now);
      oscillator.stop(now + duration/1000);
      
      oscillatorRef.current = oscillator;
      setIsPlaying(true);
      
      // Cleanup automático
      oscillator.onended = () => {
        setIsPlaying(false);
        oscillatorRef.current = null;
      };
      
    } catch (error) {
      console.warn('Audio playback failed:', error);
      setIsPlaying(false);
    }
  };

  const handleConsult = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      toast({ 
        title: "Consulta Vacía", 
        description: "Por favor, ingresa tu pregunta o situación.", 
        variant: "destructive" 
      });
      return;
    }

    setIsLoading(true);
    setOracleResponse(null);

    try {
      // Modo ritual: tiempo extendido de preparación
      const loadingTime = ritualMode ? 3000 : 1500;
      await new Promise(resolve => setTimeout(resolve, loadingTime));
      
      const response = await selectedOracle.generator(trimmedQuery);
      
      if (!response) {
        throw new Error('No se pudo generar respuesta del oráculo');
      }
      
      setOracleResponse(response);
      
      // Reproducir audio de resonancia (solo si está habilitado y hay datos de audio)
      if (response.audio?.frequency && audioEnabled) {
        await playResonanceAudio(response.audio.frequency, response.audio.duration || 3000);
      }
      
      // Actualizar datos del usuario
      loadUserData();
      
      toast({ 
        title: "🌟 Consulta Respondida", 
        description: `${selectedOracle.icon} La sabiduría cuántica se ha manifestado`,
      });
      
    } catch (error) {
      console.error('Error en consulta:', error);
      setOracleResponse(null);
      toast({ 
        title: "Error Cuántico", 
        description: "Las frecuencias cósmicas están perturbadas. Intenta nuevamente.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Detener audio si está reproduciéndose
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      } catch (error) {
        // Audio ya desconectado
      }
    }
    setIsPlaying(false);
    
    // Reset del estado
    setQuery("");
    setOracleResponse(null);
    setSelectedOracle(oracleTypes[0]);
    setRitualMode(false);
    setVisualMode('normal');
    
    toast({ 
      title: "🔄 Oráculos Reiniciados", 
      description: "Las energías han sido purificadas" 
    });
  };

  const handleResetProfile = () => {
    resetUserProfile();
    loadUserData();
    toast({ 
      title: "👤 Perfil Reiniciado", 
      description: "Tu evolución espiritual comienza de nuevo" 
    });
  };

  const formatResponse = (response) => {
    if (!response) return "";
    
    if (typeof response === 'string') {
      return response;
    }

    // Respuesta avanzada estructurada
    let formatted = "";
    
    if (response.type === 'iching') {
      formatted += `${response.present.hexagram.trigram} **${response.present.hexagram.name}**\n\n`;
      formatted += `**Interpretación Contextual:**\n${response.present.interpretation}\n\n`;
      
      if (response.future) {
        formatted += `**Transformación Futura:**\n`;
        formatted += `${response.future.hexagram.name}\n`;
        formatted += `${response.future.transformation}\n\n`;
      }
      
      formatted += `**Sincronicidad:** ${(response.synchronicity.intensity * 100).toFixed(0)}%\n`;
      formatted += `**Guía Personal:** ${response.personalInsight.personalRecommendation}\n\n`;
      formatted += `**Evolución:** ${response.evolutionGuidance.practiceRecommendation}`;
      
    } else if (response.type === 'tarot') {
      formatted += `🔮 **${response.spread} - Lectura Cuántica**\n\n`;
      
      response.cards.forEach((card, index) => {
        const position = ['🌅 PASADO', '☀️ PRESENTE', '🌙 FUTURO'][index] || `📍 ${card.position}`;
        formatted += `**${position} - ${card.name}**\n`;
        formatted += `${card.contextualMeaning}\n\n`;
      });
      
      formatted += `**Síntesis Narrativa:**\n${response.synthesis.narrativeFlow}\n\n`;
      formatted += `**Guía Personal:** ${response.personalInsight.personalRecommendation}`;
      
    } else if (response.type === 'runes') {
      formatted += `ᚱ **${response.castMethod} - Sabiduría Ancestral**\n\n`;
      
      response.runes.forEach((rune, index) => {
        formatted += `**${rune.name}** - *${rune.position}*\n`;
        formatted += `${rune.message}\n`;
        formatted += `*Influencia Energética: ${rune.energeticInfluence}*\n\n`;
      });
      
      formatted += `**Fórmula Rúnica:** ${response.synthesis.runicFormula}\n`;
      formatted += `**Palabra de Poder:** ${response.synthesis.powerWord}\n\n`;
      formatted += `**Guía de Acción:** ${response.synthesis.actionGuidance}`;
      
    } else if (response.type === 'dreams') {
      formatted += `💤 **Análisis Onírico Cuántico**\n\n`;
      formatted += `**${response.primarySymbol.symbol} Símbolo Principal:** ${response.primarySymbol.keyword.toUpperCase()}\n`;
      formatted += `${response.primarySymbol.message}\n`;
      formatted += `*Resonancia Personal: ${(response.primarySymbol.personalResonance * 100).toFixed(0)}%*\n\n`;
      
      if (response.secondarySymbols.length > 0) {
        formatted += `**Símbolos Complementarios:**\n`;
        response.secondarySymbols.forEach(symbol => {
          formatted += `${symbol.symbol} ${symbol.keyword}: ${symbol.connectionToQuery}\n`;
        });
        formatted += `\n`;
      }
      
      formatted += `**Patrones Inconscientes:** ${response.synthesis.unconsciousPatterns}\n\n`;
      formatted += `**Práctica de Integración:** ${response.synthesis.integrationPractice}`;
    }
    
    return formatted;
  };

  const renderVisualization = () => {
    if (!oracleResponse?.visualization || visualMode === 'minimal') return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mt-4 p-4 border border-primary/30 rounded-lg bg-gradient-to-br from-primary/5 to-secondary/5"
      >
        <h4 className="text-sm font-semibold text-primary mb-2 flex items-center">
          <Eye className="w-4 h-4 mr-2" />
          Visualización Cuántica
        </h4>
        
        {oracleResponse.type === 'iching' && (
          <div className="flex items-center justify-center space-x-4">
            <div className="text-center">
              <div className="text-2xl mb-2">{oracleResponse.present.hexagram.trigram}</div>
              <div className="text-xs text-muted-foreground">Presente</div>
            </div>
            {oracleResponse.future && (
              <>
                <div className="text-primary">→</div>
                <div className="text-center">
                  <div className="text-2xl mb-2">{oracleResponse.future.hexagram.trigram}</div>
                  <div className="text-xs text-muted-foreground">Futuro</div>
                </div>
              </>
            )}
          </div>
        )}
        
        {oracleResponse.type === 'tarot' && (
          <div className="grid grid-cols-3 gap-2">
            {oracleResponse.cards.map((card, index) => (
              <div key={index} className="text-center p-2 bg-background/50 rounded">
                <div className="text-lg mb-1">{['🌅', '☀️', '🌙'][index]}</div>
                <div className="text-xs font-medium">{card.name}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {card.keywords?.join(', ')}
                </div>
              </div>
            ))}
          </div>
        )}
        
        {oracleResponse.type === 'runes' && (
          <div className="flex justify-center space-x-4">
            {oracleResponse.runes.map((rune, index) => (
              <div key={index} className="text-center">
                <div className="text-xl mb-1">{rune.name.split(' ')[0]}</div>
                <div className="text-xs text-muted-foreground">{rune.element}</div>
              </div>
            ))}
          </div>
        )}
        
        {oracleResponse.type === 'dreams' && (
          <div className="text-center">
            <div className="text-3xl mb-2">{oracleResponse.primarySymbol.symbol}</div>
            <div className="text-sm font-medium">{oracleResponse.primarySymbol.keyword}</div>
            <div className="flex justify-center space-x-2 mt-2">
              {oracleResponse.secondarySymbols.map((symbol, index) => (
                <span key={index} className="text-lg">{symbol.symbol}</span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  const renderSynchronicityMeter = () => {
    if (!oracleResponse?.synchronicity) return null;
    
    const intensity = oracleResponse.synchronicity.intensity;
    const level = intensity < 0.3 ? 'Baja' : intensity < 0.7 ? 'Media' : 'Alta';
    const color = intensity < 0.3 ? '#FFA500' : intensity < 0.7 ? '#32CD32' : '#FFD700';
    
    return (
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mt-4 p-3 border border-primary/30 rounded-lg bg-background/30"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary">Sincronicidad Cuántica</span>
          <span className="text-xs text-muted-foreground">{level}</span>
        </div>
        <div className="w-full bg-background/50 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${intensity * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="h-2 rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          Temporal: {(oracleResponse.synchronicity.temporal * 100).toFixed(0)}% | 
          Personal: {(oracleResponse.synchronicity.personal * 100).toFixed(0)}% | 
          Cósmico: {(oracleResponse.synchronicity.cosmic * 100).toFixed(0)}%
        </div>
      </motion.div>
    );
  };

  const renderUserStats = () => {
    if (!userProfile || !showAdvanced) return null;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 p-4 border border-primary/30 rounded-lg bg-background/20"
      >
        <h4 className="text-sm font-semibold text-primary mb-3 flex items-center">
          <User className="w-4 h-4 mr-2" />
          Perfil Evolutivo
        </h4>
        
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <div className="text-muted-foreground">Consultas Totales</div>
            <div className="font-semibold">{userProfile.consultations}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Nivel Sincronicidad</div>
            <div className="font-semibold">{(userProfile.synchronicityLevel * 100).toFixed(0)}%</div>
          </div>
          <div>
            <div className="text-muted-foreground">Oráculo Favorito</div>
            <div className="font-semibold">
              {Object.entries(userProfile.favoriteOracles).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Elemento Dominante</div>
            <div className="font-semibold">
              {Object.entries(userProfile.dominantElements).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </div>
          </div>
        </div>
        
        {evolutionData?.patterns && (
          <div className="mt-3 pt-3 border-t border-primary/20">
            <div className="text-xs text-muted-foreground">Tendencia Evolutiva</div>
            <div className="text-sm font-medium text-primary">
              {evolutionData.patterns.synchronicity === 'ascending' ? '📈 Creciente' :
               evolutionData.patterns.synchronicity === 'descending' ? '📉 Decreciente' : '📊 Estable'}
            </div>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`p-4 h-full flex flex-col ${ritualMode ? 'bg-gradient-to-br from-purple-900/20 to-blue-900/20' : ''}`}
    >
      <header className="mb-8 text-center">
        <motion.h2 
          className="text-3xl font-bold text-primary text-glow flex items-center justify-center"
          animate={{ scale: ritualMode ? [1, 1.05, 1] : 1 }}
          transition={{ duration: 2, repeat: ritualMode ? Infinity : 0 }}
        >
          <Zap className="w-8 h-8 mr-3" /> Oráculos Nexus Cuántico
        </motion.h2>
        <p className="text-muted-foreground">
          Sabiduría ancestral potenciada por inteligencia cuántica y sincronicidad cósmica
        </p>
        
        {/* Controles avanzados */}
        <div className="flex justify-center space-x-2 mt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="p-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
            title="Modo Avanzado"
          >
            <Settings className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2 rounded-md transition-colors ${audioEnabled ? 'bg-primary/20 text-primary' : 'bg-background/50'}`}
            title="Audio Resonante"
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          <button
            onClick={() => setRitualMode(!ritualMode)}
            className={`p-2 rounded-md transition-colors ${ritualMode ? 'bg-purple-500/20 text-purple-400' : 'bg-background/50'}`}
            title="Modo Ritual"
          >
            <Moon className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => setVisualMode(visualMode === 'normal' ? 'immersive' : visualMode === 'immersive' ? 'minimal' : 'normal')}
            className="p-2 rounded-md bg-primary/10 hover:bg-primary/20 transition-colors"
            title="Modo Visual"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 flex-grow">
        {/* Panel de Configuración */}
        <div className="lg:col-span-1 p-6 border border-primary/50 rounded-lg bg-background/30 flex flex-col">
          <h3 className="text-xl font-semibold text-primary mb-4">Selecciona un Oráculo</h3>
          
          <div className="space-y-3 mb-6">
            {oracleTypes.map((oracle) => (
              <motion.button
                key={oracle.name}
                onClick={() => setSelectedOracle(oracle)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full p-3 text-left text-sm rounded-md transition-all border
                  ${selectedOracle.name === oracle.name 
                    ? 'bg-primary/20 text-primary border-primary shadow-lg' 
                    : 'bg-input hover:bg-primary/10 border-primary/40 text-muted-foreground hover:text-foreground'}`}
                style={selectedOracle.name === oracle.name ? {
                  boxShadow: `0 0 20px ${oracle.color}40`
                } : {}}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{oracle.icon}</span>
                  <span className="font-medium">{oracle.name}</span>
                </div>
                <p className="text-xs opacity-75">{oracle.description}</p>
                
                {selectedOracle.name === oracle.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-2 pt-2 border-t border-primary/30"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span>Elemento: {oracle.element}</span>
                      {isPlaying && (
                        <div className="flex items-center text-primary">
                          <Waves className="w-3 h-3 mr-1" />
                          Resonando...
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
          
          <div className="mt-auto space-y-3">
            <div className="p-3 border border-dashed border-primary/30 rounded-md bg-input text-xs text-muted-foreground">
              <HelpCircle className="w-4 h-4 inline mr-1 text-primary/70" />
              Los oráculos combinan sabiduría ancestral con algoritmos cuánticos. 
              Cada respuesta es única y personalizada.
            </div>
            
            {showAdvanced && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                onClick={handleResetProfile}
                className="w-full p-2 text-xs bg-destructive/10 text-destructive hover:bg-destructive/20 rounded-md transition-colors"
              >
                Reiniciar Perfil Evolutivo
              </motion.button>
            )}
          </div>
        </div>

        {/* Panel Principal */}
        <div className="lg:col-span-2 p-6 border border-primary/50 rounded-lg bg-background/30 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-primary flex items-center">
              <span className="mr-2">{selectedOracle.icon}</span>
              Consulta Cuántica - {selectedOracle.name}
            </h3>
            
            <div className="flex space-x-2">
              <button
                onClick={() => {
                  const info = `Tipo: ${selectedOracle.type}\nElemento: ${selectedOracle.element}\nDescripción: ${selectedOracle.description}`;
                  toast({
                    title: "Información del Oráculo",
                    description: info
                  });
                }}
                className="p-2 text-muted-foreground hover:text-primary transition-colors"
                title="Información detallada"
              >
                <Info className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-32 p-3 bg-input border border-primary/50 rounded-md text-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary resize-none text-sm mb-4"
            placeholder={`Consulta al ${selectedOracle.name}...\n\n${ritualMode ? 'En modo ritual, centra tu energía y formula tu pregunta con intención clara...' : 'Escribe tu pregunta o describe la situación que deseas explorar...'}`}
          />
          
          <div className="flex gap-3 mb-6">
            <motion.button 
              onClick={handleConsult}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/80 text-sm rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
              style={{ backgroundColor: selectedOracle.color }}
            >
              <span className="mr-2">{selectedOracle.icon}</span>
              {isLoading ? (ritualMode ? "Canalizando energías..." : "Procesando consulta...") : `Consultar ${selectedOracle.type === 'iching' ? 'I Ching' : selectedOracle.type === 'tarot' ? 'Tarot' : selectedOracle.type === 'runes' ? 'Runas' : 'Sueños'}`}
            </motion.button>
            
            <button 
              onClick={handleReset}
              title="Reiniciar consulta"
              className="px-4 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded-md transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-semibold text-primary mb-2 flex items-center">
            <span className="mr-2">{selectedOracle.icon}</span>
            Revelación Cuántica
          </h3>
          
          <div className="flex-grow border border-primary/50 rounded-lg bg-input text-sm text-foreground overflow-y-auto min-h-[300px]">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center h-full"
                >
                  <div className="text-center">
                    <motion.div 
                      className="text-4xl mb-4"
                      animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      {selectedOracle.icon}
                    </motion.div>
                    <motion.p 
                      className="italic text-muted-foreground"
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      {selectedOracle.type === 'iching' && 'Las fuerzas del universo están alineándose...'}
                      {selectedOracle.type === 'tarot' && 'Las cartas cuánticas se están manifestando...'}
                      {selectedOracle.type === 'runes' && 'Los ancestros nórdicos susurran sabiduría...'}
                      {selectedOracle.type === 'dreams' && 'El inconsciente está procesando símbolos...'}
                    </motion.p>
                    
                    {ritualMode && (
                      <div className="mt-4 space-y-2">
                        <div className="flex justify-center space-x-2">
                          {[...Array(5)].map((_, i) => (
                            <motion.div
                              key={i}
                              className="w-2 h-2 bg-primary rounded-full"
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-purple-400">Sincronizando con las frecuencias cósmicas...</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="content"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="p-4"
                >
                  {oracleResponse ? (
                    <div className="space-y-4">
                      <div className="whitespace-pre-wrap">
                        {formatResponse(oracleResponse)}
                      </div>
                      
                      {renderVisualization()}
                      {renderSynchronicityMeter()}
                      {renderUserStats()}
                      
                      {showAdvanced && oracleResponse.evolutionGuidance && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="mt-4 p-3 border border-primary/30 rounded-lg bg-gradient-to-r from-primary/5 to-secondary/5"
                        >
                          <h4 className="text-sm font-semibold text-primary mb-2 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Guía Evolutiva
                          </h4>
                          <div className="text-xs space-y-1">
                            <div><strong>Etapa Actual:</strong> {oracleResponse.evolutionGuidance.currentStage}</div>
                            <div><strong>Dirección:</strong> {oracleResponse.evolutionGuidance.growthDirection}</div>
                            <div><strong>Práctica Recomendada:</strong> {oracleResponse.evolutionGuidance.practiceRecommendation}</div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                      <div>
                        <motion.div 
                          className="text-4xl mb-3"
                          animate={{ opacity: [0.7, 1, 0.7] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          {selectedOracle.icon}
                        </motion.div>
                        <p>La sabiduría cuántica del {selectedOracle.name} aguarda tu consulta.</p>
                        <p className="text-xs mt-2 opacity-75">{selectedOracle.description}</p>
                        
                        {userProfile && userProfile.consultations > 0 && (
                          <div className="mt-4 text-xs">
                            <p>Consultas realizadas: <strong>{userProfile.consultations}</strong></p>
                            <p>Nivel de sincronicidad: <strong>{(userProfile.synchronicityLevel * 100).toFixed(0)}%</strong></p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default QuantumOracles;
