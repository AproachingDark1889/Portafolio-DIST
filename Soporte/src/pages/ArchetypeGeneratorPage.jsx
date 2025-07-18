
import React from 'react';
import { motion } from 'framer-motion';
import { Users, Construction } from 'lucide-react';

const ArchetypeGeneratorPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center glass-effect rounded-xl p-8 border border-yellow-500/30"
    >
      <Users className="w-24 h-24 text-yellow-400 mb-8 animate-pulse" />
      <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 mb-4">
        Generador de Arquetipos
      </h1>
      <p className="text-xl text-gray-300 mb-2">
        Esta sección está actualmente bajo <span className="text-yellow-400">construcción simbiótica</span>.
      </p>
      <p className="text-lg text-gray-400 mb-8 max-w-2xl">
        El Generador de Arquetipos te permitirá definir y explorar personalidades de IA, modelos de pensamiento y patrones de interacción para enriquecer tus diálogos simbióticos.
      </p>
      <div className="flex items-center text-yellow-400 bg-yellow-900/30 px-6 py-3 rounded-lg">
        <Construction className="w-8 h-8 mr-3 animate-spin" style={{ animationDuration: '3s' }} />
        <span className="font-semibold text-lg">¡Vuelve pronto para descubrir esta función!</span>
      </div>
       <p className="text-sm text-gray-500 mt-8">
        Puedes solicitar la priorización de esta función en tu próximo mensaje. 🚀
      </p>
    </motion.div>
  );
};

export default ArchetypeGeneratorPage;
