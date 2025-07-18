
import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, Construction } from 'lucide-react';

const ThoughtOraclesPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center glass-effect rounded-xl p-8 border border-teal-500/30"
    >
      <Lightbulb className="w-24 h-24 text-teal-400 mb-8 animate-pulse" />
      <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-teal-400 via-cyan-500 to-sky-500 mb-4">
        Oráculos de Pensamiento
      </h1>
      <p className="text-xl text-gray-300 mb-2">
        Esta función está siendo <span className="text-teal-400">iluminada por la IA</span> y estará disponible pronto.
      </p>
      <p className="text-lg text-gray-400 mb-8 max-w-2xl">
        Los Oráculos de Pensamiento ofrecerán perspectivas únicas, generarán hipótesis contraintuitivas y te ayudarán a explorar los límites del conocimiento a través de la interacción con modelos de IA especializados.
      </p>
      <div className="flex items-center text-teal-400 bg-teal-900/30 px-6 py-3 rounded-lg">
        <Construction className="w-8 h-8 mr-3 animate-spin" style={{ animationDuration: '3s' }} />
        <span className="font-semibold text-lg">¡Prepárate para expandir tu mente!</span>
      </div>
      <p className="text-sm text-gray-500 mt-8">
        Puedes solicitar la priorización de esta función en tu próximo mensaje. 🚀
      </p>
    </motion.div>
  );
};

export default ThoughtOraclesPage;
