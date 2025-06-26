import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Zap, Shuffle, Download } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const archetypes = [
  "El Sabio Iluminado", "El Guerrero Rebelde", "El Mago Transformador", "El Explorador Intrépido",
  "El Amante Universal", "El Bufón Sagrado", "El Creador Visionario", "El Inocente Puro",
  "El Soberano Justo", "El Cuidador Compasivo", "El Huérfano Resiliente", "El Destructor Kármico"
];

const ArchetypeGenerator = () => {
  const [currentArchetype, setCurrentArchetype] = useState("El Sabio Iluminado");
  const [description, setDescription] = useState("Un ser de profunda sabiduría y comprensión, que guía a otros hacia la iluminación a través del conocimiento y la introspección. Su sombra es el dogmatismo y el aislamiento intelectual.");
  const [keywords, setKeywords] = useState(["Conocimiento", "Verdad", "Meditación", "Guía Espiritual", "No-dualidad"]);

  const generateArchetype = () => {
    const randomIndex = Math.floor(Math.random() * archetypes.length);
    const newArchetype = archetypes[randomIndex];
    setCurrentArchetype(newArchetype);
    
    // Placeholder descriptions and keywords - In a real app, this would come from a more complex system or IA
    setDescription(`Descripción simulada para ${newArchetype}. Este arquetipo representa [cualidades principales]. Su desafío es [desafío principal].`);
    const newKeywords = ["Simulado", newArchetype.split(" ")[1], "IA Generada", "Concepto Clave"];
    setKeywords(newKeywords);
    toast({ title: "Arquetipo Generado", description: `Nuevo arquetipo: ${newArchetype}` });
  };

  const handleDownload = () => {
    const data = `Arquetipo: ${currentArchetype}\nDescripción: ${description}\nPalabras Clave: ${keywords.join(', ')}`;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentArchetype.replace(/\s+/g, '_')}_archetype.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({ title: "Arquetipo Descargado" });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 h-full flex flex-col items-center"
    >
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-primary text-glow flex items-center justify-center">
          <Users className="w-8 h-8 mr-3" /> Generador de Arquetipos
        </h2>
        <p className="text-muted-foreground">Explora y define patrones de pensamiento y comportamiento.</p>
      </header>

      <motion.div 
        key={currentArchetype}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-2xl p-8 border border-primary/50 rounded-xl bg-background/40 shadow-xl shadow-primary/10"
      >
        <h3 className="text-2xl font-bold text-primary mb-3 text-center text-glow">{currentArchetype}</h3>
        <p className="text-muted-foreground mb-5 text-center italic leading-relaxed">{description}</p>
        
        <div className="mb-6">
          <h4 className="text-md font-semibold text-primary mb-2">Palabras Clave Asociadas:</h4>
          <div className="flex flex-wrap gap-2">
            {keywords.map((keyword, index) => (
              <span key={index} className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30">
                {keyword}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4">
          <button 
            onClick={generateArchetype}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/80 text-sm rounded-md transition-colors flex items-center justify-center"
          >
            <Shuffle className="w-5 h-5 mr-2" /> Generar Nuevo Arquetipo
          </button>
          <button 
            onClick={handleDownload}
            className="flex-1 px-6 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded-md transition-colors flex items-center justify-center"
          >
            <Download className="w-5 h-5 mr-2" /> Descargar Arquetipo
          </button>
        </div>
      </motion.div>

      <p className="mt-10 text-sm text-muted-foreground text-center max-w-lg">
        Los arquetipos son patrones universales e innatos. Utiliza este generador para inspirar personajes,
        comprender dinámicas psicológicas o explorar nuevas facetas de tu propia conciencia.
      </p>
    </motion.div>
  );
};

export default ArchetypeGenerator;