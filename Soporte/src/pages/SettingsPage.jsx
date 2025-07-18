
import React from 'react';
import { motion } from 'framer-motion';
import { Settings, Construction } from 'lucide-react';

const SettingsPage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-[calc(100vh-10rem)] text-center glass-effect rounded-xl p-8 border border-gray-500/30"
    >
      <Settings className="w-24 h-24 text-gray-400 mb-8 animate-spin" style={{animationDuration: '5s'}}/>
      <h1 className="text-4xl font-bold text-gradient bg-gradient-to-r from-gray-400 via-slate-500 to-neutral-500 mb-4">
        Ajustes y Configuración
      </h1>
      <p className="text-xl text-gray-300 mb-2">
        Esta área está <span className="text-gray-400">configurándose</span> para tu experiencia óptima.
      </p>
      <p className="text-lg text-gray-400 mb-8 max-w-2xl">
        Aquí podrás personalizar tu interfaz DIST, gestionar tus datos, configurar las interacciones con la IA y mucho más.
      </p>
      <div className="flex items-center text-gray-400 bg-gray-900/30 px-6 py-3 rounded-lg">
        <Construction className="w-8 h-8 mr-3 animate-pulse" />
        <span className="font-semibold text-lg">Los ajustes finos estarán disponibles pronto.</span>
      </div>
       <p className="text-sm text-gray-500 mt-8">
        Puedes solicitar la priorización de esta función en tu próximo mensaje. 🚀
      </p>
    </motion.div>
  );
};

export default SettingsPage;
