import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Zap, Share2 } from 'lucide-react';

const NonLinearLearning = () => {
  const learningFragments = [
    { id: 1, title: "Concepto A: Origen de la Conciencia", connections: [2, 3] },
    { id: 2, title: "Teoría B: Redes Neuronales Simbióticas", connections: [1, 4] },
    { id: 3, title: "Principio C: Evolución Memética", connections: [1, 5] },
    { id: 4, title: "Aplicación D: IA Co-creativa", connections: [2] },
    { id: 5, title: "Paradoja E: Singularidad Distribuida", connections: [3] },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 h-full"
    >
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-primary text-glow">Módulo de Aprendizaje No Lineal</h2>
        <p className="text-muted-foreground">Activa y explora fragmentos de conocimiento interconectados.</p>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningFragments.map((fragment, index) => (
          <motion.div
            key={fragment.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="border border-primary/50 p-5 rounded-lg bg-background/30 hover:shadow-lg hover:shadow-primary/20 transition-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-primary">{fragment.title}</h3>
              <Zap className="w-5 h-5 text-primary/70 cursor-pointer hover:text-primary" title="Activar Fragmento" />
            </div>
            <p className="text-xs text-muted-foreground mb-3">Conexiones: {fragment.connections.length}</p>
            <button className="w-full px-3 py-1.5 bg-primary/20 text-primary hover:bg-primary/30 text-xs rounded transition-colors flex items-center justify-center">
              <Share2 className="w-3 h-3 mr-1.5" /> Explorar Conexiones
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-10 p-6 border border-dashed border-primary/30 rounded-lg bg-background/20">
        <h4 className="text-lg font-semibold text-primary mb-2">Visualizador de Red de Conocimiento (Placeholder)</h4>
        <p className="text-sm text-muted-foreground">
          Aquí se mostrará una representación gráfica de los fragmentos y sus interconexiones.
          Imagina un mapa conceptual dinámico e interactivo.
        </p>
        <div className="mt-4 h-48 bg-input border border-primary/50 rounded flex items-center justify-center text-muted-foreground">
          [ Espacio para visualización gráfica ]
        </div>
      </div>
    </motion.div>
  );
};

export default NonLinearLearning;