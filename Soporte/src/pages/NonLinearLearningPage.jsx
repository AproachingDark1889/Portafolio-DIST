import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Zap, Filter, Search, ChevronDown, ChevronRight, CheckCircle, Lock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '../../components/ui/input';
import { toast } from '@/components/ui/use-toast';

const initialFragments = [
  { id: 'frag1', title: 'Introducción a la Teoría de Cuerdas', category: 'Física Cuántica', activated: true, complexity: 3, prerequisites: [], related: ['frag2', 'frag5'], summary: 'Conceptos básicos de la teoría de supercuerdas y sus dimensiones.' },
  { id: 'frag2', title: 'Dimensiones Extra en Cosmología', category: 'Física Cuántica', activated: false, complexity: 4, prerequisites: ['frag1'], related: ['frag5'], summary: 'Exploración de cómo las dimensiones adicionales podrían afectar el universo.' },
  { id: 'frag3', title: 'Conciencia y Realidad Virtual', category: 'Filosofía de la Mente', activated: true, complexity: 2, prerequisites: [], related: ['frag4'], summary: 'Paralelismos entre la experiencia consciente y las simulaciones.' },
  { id: 'frag4', title: 'El Argumento de la Simulación de Bostrom', category: 'Filosofía de la Mente', activated: false, complexity: 5, prerequisites: ['frag3'], related: [], summary: 'Análisis profundo de la hipótesis de que vivimos en una simulación.' },
  { id: 'frag5', title: 'Gravedad Cuántica de Bucles', category: 'Física Cuántica', activated: false, complexity: 5, prerequisites: ['frag1'], related: ['frag2'], summary: 'Una teoría alternativa para unificar la relatividad general y la mecánica cuántica.' },
  { id: 'frag6', title: 'Ética en Inteligencia Artificial Avanzada', category: 'Ética Tecnológica', activated: true, complexity: 4, prerequisites: [], related: [], summary: 'Dilemas morales y consideraciones para el desarrollo de IA superinteligente.' },
];

const FragmentCard = ({ fragment, onActivate, onSelect, isSelected }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleActivate = (e) => {
    e.stopPropagation();
    if (!fragment.activated) {
      onActivate(fragment.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      onClick={() => onSelect(fragment)}
      className={`p-4 rounded-lg cursor-pointer transition-all duration-200 glass-effect hover:shadow-purple-500/30 hover:border-purple-500/50 ${isSelected ? 'border-2 border-purple-500 shadow-lg shadow-purple-500/20' : 'border border-slate-700/50'}`}
    >
      <div className="flex justify-between items-center">
        <h3 className={`text-lg font-semibold ${fragment.activated ? 'text-purple-400' : 'text-gray-400'}`}>{fragment.title}</h3>
        <Button variant="ghost" size="icon" onClick={() => setIsExpanded(!isExpanded)} className="text-gray-400 hover:text-white">
          {isExpanded ? <ChevronDown /> : <ChevronRight />}
        </Button>
      </div>
      <p className="text-xs text-gray-500 mb-2">{fragment.category} - Complejidad: {fragment.complexity}/5</p>
      {isExpanded && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-2 space-y-2">
          <p className="text-sm text-gray-300">{fragment.summary}</p>
          {fragment.prerequisites.length > 0 && (
            <p className="text-xs text-yellow-400">Prerrequisitos: {fragment.prerequisites.join(', ')}</p>
          )}
          <Button
            onClick={handleActivate}
            disabled={fragment.activated}
            className={`w-full mt-2 ${fragment.activated ? 'bg-green-600/70 hover:bg-green-500/70 cursor-not-allowed' : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700'}`}
          >
            {fragment.activated ? <CheckCircle className="w-4 h-4 mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
            {fragment.activated ? 'Activado' : 'Activar Fragmento'}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
};


const NonLinearLearningPage = () => {
  const [fragments, setFragments] = useState([]);
  const [selectedFragment, setSelectedFragment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('Todos');

  useEffect(() => {
    const storedFragments = localStorage.getItem('learningFragments');
    if (storedFragments) {
      setFragments(JSON.parse(storedFragments));
    } else {
      setFragments(initialFragments);
      localStorage.setItem('learningFragments', JSON.stringify(initialFragments));
    }
  }, []);

  const handleActivateFragment = (fragmentId) => {
    const fragmentToActivate = fragments.find(f => f.id === fragmentId);
    const canActivate = fragmentToActivate.prerequisites.every(prereqId => {
      const prereqFragment = fragments.find(f => f.id === prereqId);
      return prereqFragment && prereqFragment.activated;
    });

    if (canActivate) {
      const updatedFragments = fragments.map(f =>
        f.id === fragmentId ? { ...f, activated: true } : f
      );
      setFragments(updatedFragments);
      localStorage.setItem('learningFragments', JSON.stringify(updatedFragments));
      toast({
        title: "¡Fragmento Activado!",
        description: `"${fragmentToActivate.title}" ahora forma parte de tu conocimiento simbiótico.`,
        variant: "default",
      });
    } else {
      toast({
        title: "Prerrequisitos Incompletos",
        description: `No se pueden activar "${fragmentToActivate.title}". Completa los fragmentos requeridos primero.`,
        variant: "destructive",
      });
    }
  };
  
  const handleSelectFragment = (fragment) => {
    setSelectedFragment(fragment);
  };

  const categories = ['Todos', ...new Set(fragments.map(f => f.category))];

  const filteredFragments = fragments.filter(fragment => {
    const matchesSearch = fragment.title.toLowerCase().includes(searchTerm.toLowerCase()) || fragment.summary.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'Todos' || fragment.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-10rem)]">
      <header className="mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-gradient mb-2 md:mb-0">Aprendizaje No Lineal</h1>
          <Button className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 glow-effect" onClick={() => toast({title: "🚧 ¡Función no implementada!"})}>
            <Zap className="w-5 h-5 mr-2" />
            Sugerir Nuevo Fragmento
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Input
              type="text"
              placeholder="Buscar fragmentos..."
              className="bg-slate-800/70 border-slate-700 placeholder-gray-500 text-white pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
          </div>
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full md:w-auto appearance-none bg-slate-800/70 border border-slate-700 text-white py-2.5 px-4 pr-8 rounded-lg focus:outline-none focus:border-purple-500"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
          </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
        {/* Fragment List */}
        <motion.div 
          layout 
          className="md:col-span-1 overflow-y-auto space-y-4 p-1 scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-800"
        >
          <AnimatePresence>
            {filteredFragments.map(fragment => (
              <FragmentCard
                key={fragment.id}
                fragment={fragment}
                onActivate={handleActivateFragment}
                onSelect={handleSelectFragment}
                isSelected={selectedFragment?.id === fragment.id}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Selected Fragment Details */}
        <div className="md:col-span-2 glass-effect rounded-xl p-6 overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-800">
          {selectedFragment ? (
            <motion.div
              key={selectedFragment.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className={`text-2xl font-bold ${selectedFragment.activated ? 'text-purple-300' : 'text-gray-300'}`}>{selectedFragment.title}</h2>
                  <p className="text-sm text-gray-400">{selectedFragment.category} - Complejidad: {selectedFragment.complexity}/5</p>
                </div>
                {selectedFragment.activated ? 
                  <span className="flex items-center text-green-400 bg-green-900/50 px-3 py-1 rounded-full text-sm"><CheckCircle className="w-4 h-4 mr-2"/>Activado</span> :
                  <span className="flex items-center text-yellow-400 bg-yellow-900/50 px-3 py-1 rounded-full text-sm"><Lock className="w-4 h-4 mr-2"/>Bloqueado</span>
                }
              </div>
              <p className="text-gray-200 leading-relaxed mb-6">{selectedFragment.summary}</p>
              
              <div className="mb-6">
                <h4 className="text-md font-semibold text-white mb-2">Contenido Detallado del Fragmento:</h4>
                <div className="p-4 bg-slate-800/50 rounded-lg text-gray-300 text-sm min-h-[150px] border border-slate-700/50">
                  <p>Este es un placeholder para el contenido detallado del fragmento "{selectedFragment.title}". En una implementación completa, aquí se mostraría información más extensa, recursos, visualizaciones interactivas o incluso mini-módulos de aprendizaje.</p>
                  <p className="mt-2">Por ejemplo, podría incluir:</p>
                  <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Explicaciones profundas.</li>
                    <li>Ejemplos y casos de estudio.</li>
                    <li>Enlaces a fuentes externas.</li>
                    <li>Preguntas de autoevaluación.</li>
                  </ul>
                </div>
              </div>

              {selectedFragment.prerequisites.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-white mb-2">Prerrequisitos:</h4>
                  <ul className="space-y-1">
                    {selectedFragment.prerequisites.map(prereqId => {
                      const prereqFrag = fragments.find(f => f.id === prereqId);
                      return (
                        <li key={prereqId} className={`text-sm p-2 rounded-md flex items-center ${prereqFrag?.activated ? 'text-green-400 bg-green-900/30' : 'text-yellow-400 bg-yellow-900/30'}`}>
                          {prereqFrag?.activated ? <CheckCircle className="w-4 h-4 mr-2"/> : <Lock className="w-4 h-4 mr-2"/>}
                          {prereqFrag ? prereqFrag.title : prereqId}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {selectedFragment.related.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-md font-semibold text-white mb-2">Fragmentos Relacionados:</h4>
                   <ul className="space-y-1">
                    {selectedFragment.related.map(relId => {
                      const relFrag = fragments.find(f => f.id === relId);
                      return (
                        <li key={relId} className="text-sm text-blue-400 p-2 rounded-md bg-blue-900/30 hover:bg-blue-800/40 cursor-pointer" onClick={() => relFrag && handleSelectFragment(relFrag)}>
                          {relFrag ? relFrag.title : relId}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
              {!selectedFragment.activated && (
                <Button
                  onClick={() => handleActivateFragment(selectedFragment.id)}
                  className="w-full mt-6 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Activar "{selectedFragment.title}"
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <BookOpen className="w-24 h-24 mx-auto text-gray-600 mb-4" />
              <p className="text-xl text-gray-500">Selecciona un fragmento para ver detalles</p>
              <p className="text-sm text-gray-600">Explora y activa fragmentos para expandir tu conocimiento.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NonLinearLearningPage;
