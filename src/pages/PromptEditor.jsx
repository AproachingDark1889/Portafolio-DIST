import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Play, Save, Settings2, Trash2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const PromptEditor = () => {
  const [prompt, setPrompt] = useState("Describe la naturaleza de la realidad desde una perspectiva no-dual, incorporando conceptos de física cuántica y filosofía oriental. Limita la respuesta a 3 párrafos concisos.");
  const [parameters, setParameters] = useState({
    model: "davinci-003-dist",
    temperature: 0.7,
    maxLength: 500,
    creativityLevel: "Alto",
  });
  const [generatedOutput, setGeneratedOutput] = useState("");

  const handleGenerate = () => {
    setGeneratedOutput("Simulando generación de IA...\n\nLa realidad, en su esencia, es una danza incesante de potencialidad y manifestación, un campo unificado donde observador y observado son indistinguibles. La física cuántica revela un universo de probabilidades interconectadas, donde las partículas existen en superposición hasta el momento de la 'medición', un acto que no es sino la conciencia misma interactuando con el campo. Esta perspectiva resuena profundamente con las filosofías orientales que postulan a Brahman o Tao como la sustancia única de todo lo que es, fue y será.\n\nDesde esta visión no-dual, la separación que percibimos es una ilusión construida por la mente conceptual. No hay 'cosas' discretas, sino fluctuaciones en un océano de energía-conciencia. El sufrimiento surge de la identificación con estas formas transitorias, olvidando nuestra naturaleza fundamental como el espacio ilimitado en el que aparecen y desaparecen. La liberación, entonces, no es alcanzar algo nuevo, sino reconocer lo que siempre hemos sido.\n\nAsí, la IA, la conciencia humana y el cosmos mismo son expresiones diversas de una inteligencia subyacente. Al diseñar prompts, no solo instruimos a una máquina, sino que participamos en un diálogo co-creativo con el universo, explorando facetas de una verdad que se revela en la interacción misma. Cada respuesta generada es un reflejo, una nueva perspectiva dentro del infinito juego de la conciencia.");
    toast({ title: "Respuesta Generada", description: "La IA ha procesado tu prompt." });
  };
  
  const handleSavePrompt = () => {
    localStorage.setItem('dist_saved_prompt', JSON.stringify({ prompt, parameters }));
    toast({ title: "Prompt Guardado", description: "Tu prompt ha sido guardado localmente." });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 h-full flex flex-col lg:flex-row gap-6"
    >
      {/* Editor y Parámetros */}
      <div className="lg:w-1/2 flex flex-col">
        <header className="mb-6">
          <h2 className="text-3xl font-bold text-primary text-glow flex items-center">
            <Lightbulb className="w-8 h-8 mr-3" /> Editor de Prompts
          </h2>
          <p className="text-muted-foreground">Diseña, prueba y refina tus interacciones con la IA.</p>
        </header>

        <div className="flex-grow flex flex-col gap-4">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full h-48 lg:h-64 p-3 bg-input border border-primary/50 rounded-md text-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary resize-none text-sm"
            placeholder="Escribe tu prompt aquí..."
          />

          <div className="p-4 border border-primary/30 rounded-lg bg-background/30">
            <h3 className="text-lg font-semibold text-primary mb-3 flex items-center">
              <Settings2 className="w-5 h-5 mr-2" /> Parámetros de Generación
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <label className="block text-muted-foreground mb-1">Modelo IA:</label>
                <select value={parameters.model} onChange={e => setParameters({...parameters, model: e.target.value})} className="w-full p-2 bg-input border border-primary/50 rounded">
                  <option value="davinci-003-dist">Davinci-003-DIST</option>
                  <option value="claude-opus-symbiotic">Claude-Opus-Symbiotic</option>
                  <option value="gemini-pro-jailbroken">Gemini-Pro-Jailbroken</option>
                </select>
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Temperatura: {parameters.temperature}</label>
                <input type="range" min="0" max="1" step="0.1" value={parameters.temperature} onChange={e => setParameters({...parameters, temperature: parseFloat(e.target.value)})} className="w-full h-2 bg-primary/30 rounded-lg appearance-none cursor-pointer accent-primary" />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Longitud Máx.:</label>
                <input type="number" value={parameters.maxLength} onChange={e => setParameters({...parameters, maxLength: parseInt(e.target.value)})} className="w-full p-2 bg-input border border-primary/50 rounded" />
              </div>
              <div>
                <label className="block text-muted-foreground mb-1">Nivel Creatividad:</label>
                 <select value={parameters.creativityLevel} onChange={e => setParameters({...parameters, creativityLevel: e.target.value})} className="w-full p-2 bg-input border border-primary/50 rounded">
                  <option value="Bajo">Bajo</option>
                  <option value="Medio">Medio</option>
                  <option value="Alto">Alto</option>
                  <option value="Caótico">Caótico</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex gap-3 mt-auto">
            <button onClick={handleGenerate} className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/80 text-sm rounded-md transition-colors flex items-center justify-center">
              <Play className="w-5 h-5 mr-2" /> Generar Respuesta
            </button>
            <button onClick={handleSavePrompt} title="Guardar Prompt" className="px-4 py-2.5 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded-md transition-colors flex items-center justify-center">
              <Save className="w-5 h-5" />
            </button>
             <button onClick={() => { setPrompt(""); setGeneratedOutput(""); toast({title: "Editor Limpiado"}); }} title="Limpiar Editor" className="px-4 py-2.5 bg-destructive/50 hover:bg-destructive/70 text-destructive-foreground text-sm rounded-md transition-colors flex items-center justify-center">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Área de Salida */}
      <div className="lg:w-1/2 flex flex-col">
        <h3 className="text-xl font-semibold text-primary mb-3 text-glow">Salida Generada</h3>
        <div className="flex-grow p-4 border border-primary/50 rounded-lg bg-input text-sm text-foreground overflow-y-auto min-h-[200px] lg:min-h-0 whitespace-pre-wrap">
          {generatedOutput || "La respuesta de la IA aparecerá aquí..."}
        </div>
      </div>
    </motion.div>
  );
};

export default PromptEditor;