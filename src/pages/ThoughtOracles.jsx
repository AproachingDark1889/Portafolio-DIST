import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, HelpCircle, RotateCcw, Info } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import {
  generateIChingResponse,
  generateTarotResponse,
  generateRunesResponse,
  generateDreamsResponse,
  getOracleInfo
} from '@/utils/oracleEngine';

const oracleTypes = [
  { 
    name: "Oráculo de I Ching Simbiótico", 
    generator: generateIChingResponse,
    type: "iching",
    icon: "☯",
    description: "Sabiduría milenaria china para decisiones importantes"
  },
  { 
    name: "Oráculo de Tarot Cuántico", 
    generator: generateTarotResponse,
    type: "tarot",
    icon: "🔮",
    description: "Arquetipos universales en lectura temporal"
  },
  { 
    name: "Oráculo de Runas Nórdicas Algorítmicas", 
    generator: generateRunesResponse,
    type: "runes",
    icon: "ᚱ",
    description: "Sabiduría nórdica ancestral algorítmica"
  },
  { 
    name: "Oráculo de Sueños Lúcidos Asistido por IA", 
    generator: generateDreamsResponse,
    type: "dreams",
    icon: "💤",
    description: "Interpretación AI de símbolos oníricos"
  },
];

const ThoughtOracles = () => {
  const [selectedOracle, setSelectedOracle] = useState(oracleTypes[0]);
  const [query, setQuery] = useState("");
  const [oracleResponse, setOracleResponse] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleConsult = async () => {
    if (!query.trim()) {
      toast({ title: "Consulta Vacía", description: "Por favor, ingresa tu pregunta o situación.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setOracleResponse(""); 

    // Simulate processing time for better UX
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    try {
      // Generate response using the oracle engine
      const response = selectedOracle.generator(query);
      setOracleResponse(response);
      toast({ 
        title: "Consulta Respondida", 
        description: `${selectedOracle.icon} ${selectedOracle.name} ha revelado su sabiduría.` 
      });
    } catch (error) {
      setOracleResponse("Ha ocurrido un error al consultar el oráculo. Por favor, intenta nuevamente.");
      toast({ 
        title: "Error en la Consulta", 
        description: "No se pudo procesar tu consulta.", 
        variant: "destructive" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setQuery("");
    setOracleResponse("");
    setSelectedOracle(oracleTypes[0]);
    toast({ title: "Oráculo Reiniciado" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 h-full flex flex-col"
    >
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-primary text-glow flex items-center justify-center">
          <Zap className="w-8 h-8 mr-3" /> Oráculos de Pensamiento
        </h2>
        <p className="text-muted-foreground">Consulta sistemas de sabiduría ancestral potenciados por algoritmos modernos.</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6 flex-grow">
        {/* Configuración del Oráculo */}
        <div className="lg:col-span-1 p-6 border border-primary/50 rounded-lg bg-background/30 flex flex-col">
          <h3 className="text-xl font-semibold text-primary mb-4">Selecciona un Oráculo</h3>
          <div className="space-y-3 mb-6">
            {oracleTypes.map((oracle) => (
              <button
                key={oracle.name}
                onClick={() => setSelectedOracle(oracle)}
                className={`w-full p-3 text-left text-sm rounded-md transition-colors border
                  ${selectedOracle.name === oracle.name 
                    ? 'bg-primary/20 text-primary border-primary' 
                    : 'bg-input hover:bg-primary/10 border-primary/40 text-muted-foreground hover:text-foreground'}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{oracle.icon}</span>
                  <span className="font-medium">{oracle.name}</span>
                </div>
                <p className="text-xs opacity-75">{oracle.description}</p>
              </button>
            ))}
          </div>
          <div className="mt-auto p-3 border border-dashed border-primary/30 rounded-md bg-input text-xs text-muted-foreground">
            <HelpCircle className="w-4 h-4 inline mr-1 text-primary/70" />
            Los oráculos combinan sabiduría ancestral con algoritmos deterministas. Cada respuesta es única para tu consulta específica.
          </div>
        </div>

        {/* Interacción y Respuesta */}
        <div className="lg:col-span-2 p-6 border border-primary/50 rounded-lg bg-background/30 flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xl font-semibold text-primary">
              {selectedOracle.icon} Tu Consulta para {selectedOracle.name}
            </h3>
            <button
              onClick={() => {
                const info = getOracleInfo(selectedOracle.type);
                if (info) {
                  toast({
                    title: "Información del Oráculo",
                    description: info.description + " " + info.usage
                  });
                }
              }}
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
              title="Información sobre este oráculo"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-32 p-3 bg-input border border-primary/50 rounded-md text-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary resize-none text-sm mb-4"
            placeholder="Escribe tu pregunta o describe la situación aquí..."
          />
          <div className="flex gap-3 mb-6">
            <button 
              onClick={handleConsult}
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/80 text-sm rounded-md transition-colors flex items-center justify-center disabled:opacity-50"
            >
              <span className="mr-2">{selectedOracle.icon}</span>
              {isLoading ? "Consultando..." : `Consultar ${selectedOracle.type === 'iching' ? 'I Ching' : selectedOracle.type === 'tarot' ? 'Tarot' : selectedOracle.type === 'runes' ? 'Runas' : 'Sueños'}`}
            </button>
            <button 
              onClick={handleReset}
              title="Reiniciar Oráculo"
              className="px-4 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded-md transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-semibold text-primary mb-2">
            {selectedOracle.icon} Respuesta del {selectedOracle.name}
          </h3>
          <div className="flex-grow p-4 border border-primary/50 rounded-lg bg-input text-sm text-foreground overflow-y-auto min-h-[200px] whitespace-pre-wrap">
            {isLoading && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="text-2xl mb-2">{selectedOracle.icon}</div>
                  <p className="italic text-muted-foreground">
                    {selectedOracle.type === 'iching' && 'Las fuerzas del universo están alineándose...'}
                    {selectedOracle.type === 'tarot' && 'Las cartas cuánticas se están manifestando...'}
                    {selectedOracle.type === 'runes' && 'Los ancestros nórdicos susurran sabiduría...'}
                    {selectedOracle.type === 'dreams' && 'El inconsciente está procesando símbolos...'}
                  </p>
                </div>
              </div>
            )}
            {oracleResponse || (!isLoading && (
              <div className="text-center text-muted-foreground h-full flex items-center justify-center">
                <div>
                  <div className="text-3xl mb-3">{selectedOracle.icon}</div>
                  <p>La sabiduría del {selectedOracle.name} se manifestará aquí.</p>
                  <p className="text-xs mt-2 opacity-75">{selectedOracle.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThoughtOracles;