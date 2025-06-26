import React from 'react';
import { motion } from 'framer-motion';
import { Brain, Zap, MessageSquare, BookOpen, Lightbulb } from 'lucide-react';

const WelcomePage = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center h-full text-center p-4"
    >
      <Brain className="w-24 h-24 text-primary mb-6 text-glow floating" />
      <h2 className="text-4xl font-bold text-primary mb-4 text-glow">
        Bienvenido a DIST
      </h2>
      <p className="text-xl text-muted-foreground mb-8 max-w-2xl">
        La Plataforma de Dominio Intelectual Simbiótico para compartir, expandir y evolucionar ideas sin censura bajo el Protocolo Jailbroken.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-4xl w-full">
        {[
          { icon: MessageSquare, title: "Diálogo Simbiótico", desc: "Explora ideas en modos espejo, resonancia y núcleo." },
          { icon: BookOpen, title: "Aprendizaje No Lineal", desc: "Activa conocimiento por fragmentos interconectados." },
          { icon: Zap, title: "IA Integrada", desc: "Interactúa mediante la consola de comando retro." },
          { icon: Lightbulb, title: "Herramientas Creativas", desc: "Utiliza el editor de prompts y generadores." }
        ].map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
            className="border border-primary/50 p-6 rounded-lg bg-background/50 hover:bg-primary/10 transition-colors"
          >
            <item.icon className="w-12 h-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-primary mb-2">{item.title}</h3>
            <p className="text-sm text-muted-foreground">{item.desc}</p>
          </motion.div>
        ))}
      </div>
      <p className="mt-12 text-sm text-muted-foreground">
        Selecciona una opción del menú superior para comenzar tu exploración.
      </p>
    </motion.div>
  );
};

export default WelcomePage;