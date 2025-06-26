import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Zap, HelpCircle, RotateCcw } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const oracleTypes = [
  { name: "Oráculo de I Ching Simbiótico", promptPrefix: "Desde la perspectiva del I Ching y la sincronicidad, interpreta la siguiente situación o pregunta: " },
  { name: "Oráculo de Tarot Cuántico", promptPrefix: "Utilizando los arquetipos del Tarot y los principios cuánticos, ofrece una lectura sobre: " },
  { name: "Oráculo de Runas Nórdicas Algorítmicas", promptPrefix: "Basado en el simbolismo de las Runas Nórdicas y un análisis algorítmico, provee una guía para: " },
  { name: "Oráculo de Sueños Lúcidos Asistido por IA", promptPrefix: "Interpreta el siguiente sueño o pregunta sobre sueños lúcidos, asistido por IA: " },
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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const fullPrompt = selectedOracle.promptPrefix + query;
    // Simulated AI response
    const simulatedResponse = `Respuesta simulada del ${selectedOracle.name} para la consulta: "${query}".\n\nEl flujo de energía cósmica sugiere que las corrientes actuales te invitan a la introspección profunda. Considera los patrones recurrentes en tu vida como reflejos de una lección fundamental que busca ser integrada. La clave reside en la observación desapegada y la aceptación radical del presente. Las sincronicidades se intensificarán a medida que te alinees con tu verdad interior. Confía en el proceso.`;
    
    setOracleResponse(simulatedResponse);
    setIsLoading(false);
    toast({ title: "Consulta Respondida", description: `El ${selectedOracle.name} ha hablado.` });
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
        <p className="text-muted-foreground">Consulta a la IA simbiótica para obtener perspectivas e inspiración.</p>
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
                {oracle.name}
              </button>
            ))}
          </div>
          <div className="mt-auto p-3 border border-dashed border-primary/30 rounded-md bg-input text-xs text-muted-foreground">
            <HelpCircle className="w-4 h-4 inline mr-1 text-primary/70" />
            Los oráculos ofrecen perspectivas simbólicas, no predicciones literales. Úsalos para la reflexión.
          </div>
        </div>

        {/* Interacción y Respuesta */}
        <div className="lg:col-span-2 p-6 border border-primary/50 rounded-lg bg-background/30 flex flex-col">
          <h3 className="text-xl font-semibold text-primary mb-2">Tu Consulta para {selectedOracle.name}</h3>
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
              <Zap className="w-5 h-5 mr-2" /> {isLoading ? "Consultando..." : "Consultar Oráculo"}
            </button>
            <button 
              onClick={handleReset}
              title="Reiniciar Oráculo"
              className="px-4 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded-md transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-xl font-semibold text-primary mb-2">Respuesta del Oráculo</h3>
          <div className="flex-grow p-4 border border-primary/50 rounded-lg bg-input text-sm text-foreground overflow-y-auto min-h-[200px] whitespace-pre-wrap">
            {isLoading && <p className="italic text-muted-foreground">El oráculo está contemplando tu consulta...</p>}
            {oracleResponse || (!isLoading && "La sabiduría del oráculo se manifestará aquí.")}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ThoughtOracles;