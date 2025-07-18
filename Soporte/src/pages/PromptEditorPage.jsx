
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Edit3, PlusCircle, Save, Trash2, Copy, Zap, Settings, Sliders, FileText, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { toast } from '@/components/ui/use-toast';

const initialPrompts = [
  { id: 'prompt1', name: 'Escritura Creativa Futurista', content: 'Escribe una historia corta ambientada en el año 2242, donde la IA y los humanos coexisten pacíficamente. Enfócate en los dilemas éticos de la modificación genética recreativa. Tono: esperanzador pero con un toque de melancolía. Longitud: ~1500 palabras.', parameters: { temperature: 0.7, maxLength: 1500, style: 'narrativo' }, lastModified: new Date().toISOString() },
  { id: 'prompt2', name: 'Análisis de Código Complejo', content: 'Analiza el siguiente fragmento de código Python y sugiere optimizaciones. Identifica posibles cuellos de botella y vulnerabilidades de seguridad. Explica tu razonamiento de forma clara y concisa. Código: [PEGAR CÓDIGO AQUÍ]', parameters: { temperature: 0.3, maxLength: 1000, style: 'técnico' }, lastModified: new Date(Date.now() - 86400000).toISOString() },
];

const PromptEditorPage = () => {
  const [prompts, setPrompts] = useState([]);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const [currentName, setCurrentName] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [currentParams, setCurrentParams] = useState({ temperature: 0.5, maxLength: 500, style: 'neutral' });

  useEffect(() => {
    const storedPrompts = localStorage.getItem('editorPrompts');
    if (storedPrompts) {
      setPrompts(JSON.parse(storedPrompts));
    } else {
      setPrompts(initialPrompts);
      localStorage.setItem('editorPrompts', JSON.stringify(initialPrompts));
    }
  }, []);

  useEffect(() => {
    if (selectedPrompt) {
      setCurrentName(selectedPrompt.name);
      setCurrentContent(selectedPrompt.content);
      setCurrentParams(selectedPrompt.parameters);
    } else {
      setCurrentName('');
      setCurrentContent('');
      setCurrentParams({ temperature: 0.5, maxLength: 500, style: 'neutral' });
    }
  }, [selectedPrompt]);

  const handleSelectPrompt = (prompt) => {
    setSelectedPrompt(prompt);
  };

  const handleSavePrompt = () => {
    if (!currentName.trim() || !currentContent.trim()) {
      toast({ title: "Error", description: "El nombre y el contenido del prompt no pueden estar vacíos.", variant: "destructive" });
      return;
    }
    let updatedPrompts;
    if (selectedPrompt) {
      updatedPrompts = prompts.map(p =>
        p.id === selectedPrompt.id ? { ...p, name: currentName, content: currentContent, parameters: currentParams, lastModified: new Date().toISOString() } : p
      );
    } else {
      const newPrompt = {
        id: `prompt${Date.now()}`,
        name: currentName,
        content: currentContent,
        parameters: currentParams,
        lastModified: new Date().toISOString()
      };
      updatedPrompts = [...prompts, newPrompt];
      setSelectedPrompt(newPrompt);
    }
    setPrompts(updatedPrompts);
    localStorage.setItem('editorPrompts', JSON.stringify(updatedPrompts));
    toast({ title: "¡Prompt Guardado!", description: `"${currentName}" ha sido guardado exitosamente.` });
  };

  const handleNewPrompt = () => {
    setSelectedPrompt(null);
    setCurrentName('Nuevo Prompt Sin Título');
    setCurrentContent('Escribe aquí tu prompt...');
    setCurrentParams({ temperature: 0.5, maxLength: 500, style: 'neutral' });
  };

  const handleDeletePrompt = () => {
    if (!selectedPrompt) return;
    const updatedPrompts = prompts.filter(p => p.id !== selectedPrompt.id);
    setPrompts(updatedPrompts);
    localStorage.setItem('editorPrompts', JSON.stringify(updatedPrompts));
    setSelectedPrompt(null);
    toast({ title: "Prompt Eliminado", description: `"${selectedPrompt.name}" ha sido eliminado.` });
  };

  const handleCopyPrompt = () => {
    if (!selectedPrompt) return;
    navigator.clipboard.writeText(selectedPrompt.content);
    toast({ title: "Prompt Copiado", description: "El contenido del prompt ha sido copiado al portapapeles." });
  };
  
  const handleExecutePrompt = () => {
    if (!selectedPrompt && !currentContent.trim()) {
         toast({ title: "Error", description: "No hay prompt para ejecutar. Selecciona o crea uno.", variant: "destructive" });
         return;
    }
    const promptToExecute = selectedPrompt ? selectedPrompt.content : currentContent;
    toast({
      title: "🚀 Ejecutando Prompt (Simulación)",
      description: `Enviando "${(promptToExecute.substring(0,30))}..." a la IA Simbiótica con parámetros: Temp ${currentParams.temperature}, MaxLength ${currentParams.maxLength}.`,
      duration: 5000,
    });
    // In a real app, this would call an API
  };


  return (
    <div className="flex h-[calc(100vh-10rem)] gap-6">
      {/* Prompt List Sidebar */}
      <motion.div 
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="w-1/3 md:w-1/4 glass-effect rounded-xl p-4 flex flex-col border border-blue-500/30"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center"><List className="w-5 h-5 mr-2 text-blue-400"/>Prompts</h2>
          <Button variant="ghost" size="icon" onClick={handleNewPrompt} className="text-blue-400 hover:text-blue-300">
            <PlusCircle className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-800">
          {prompts.map(prompt => (
            <motion.div
              key={prompt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleSelectPrompt(prompt)}
              className={`p-3 rounded-lg cursor-pointer transition-all duration-200 hover:bg-blue-600/30 ${selectedPrompt?.id === prompt.id ? 'bg-blue-600/40 shadow-md' : 'bg-slate-800/30'}`}
            >
              <h3 className="font-medium text-white truncate">{prompt.name}</h3>
              <p className="text-xs text-gray-400">Modificado: {new Date(prompt.lastModified).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Editor Area */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 glass-effect rounded-xl p-6 flex flex-col border border-blue-500/30"
      >
        { (selectedPrompt || currentName) ? (
          <>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
              <Input
                type="text"
                placeholder="Nombre del Prompt"
                value={currentName}
                onChange={(e) => setCurrentName(e.target.value)}
                className="text-xl font-semibold bg-transparent border-0 border-b-2 border-blue-500/50 focus:ring-0 focus:border-blue-400 text-white placeholder-gray-500 flex-grow"
              />
              <div className="flex space-x-2 flex-shrink-0">
                <Button variant="outline" size="icon" onClick={handleCopyPrompt} disabled={!selectedPrompt} className="text-blue-400 border-blue-500/50 hover:bg-blue-500/20"><Copy className="w-5 h-5"/></Button>
                <Button variant="outline" size="icon" onClick={handleDeletePrompt} disabled={!selectedPrompt} className="text-red-400 border-red-500/50 hover:bg-red-500/20"><Trash2 className="w-5 h-5"/></Button>
                <Button onClick={handleSavePrompt} className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"><Save className="w-5 h-5 mr-2"/>Guardar</Button>
              </div>
            </div>
            
            <Textarea
              placeholder="Escribe o pega tu prompt aquí..."
              value={currentContent}
              onChange={(e) => setCurrentContent(e.target.value)}
              className="flex-1 w-full bg-slate-800/50 border-slate-700/70 rounded-md p-4 text-gray-200 placeholder-gray-500 focus:border-blue-400 focus:ring-blue-400 resize-none scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-slate-800 text-base"
            />

            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center"><Sliders className="w-5 h-5 mr-2 text-blue-400"/>Parámetros de IA</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Temperatura: {currentParams.temperature.toFixed(1)}</label>
                  <Slider
                    min={0} max={1} step={0.1}
                    value={[currentParams.temperature]}
                    onValueChange={(val) => setCurrentParams(p => ({ ...p, temperature: val[0] }))}
                    className="[&>span:first-child]:h-1 [&>span:first-child>span]:bg-blue-500 [&>span:last-child]:bg-blue-500 [&>span:last-child]:border-blue-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Longitud Máx.: {currentParams.maxLength}</label>
                   <Slider
                    min={50} max={4000} step={50}
                    value={[currentParams.maxLength]}
                    onValueChange={(val) => setCurrentParams(p => ({ ...p, maxLength: val[0] }))}
                    className="[&>span:first-child]:h-1 [&>span:first-child>span]:bg-purple-500 [&>span:last-child]:bg-purple-500 [&>span:last-child]:border-purple-300"
                  />
                </div>
                <div>
                  <label htmlFor="style" className="block text-sm font-medium text-gray-300 mb-1">Estilo de Respuesta</label>
                  <select 
                    id="style" 
                    value={currentParams.style} 
                    onChange={(e) => setCurrentParams(p => ({...p, style: e.target.value}))}
                    className="w-full bg-slate-700/70 border border-slate-600 text-white py-2 px-3 rounded-md focus:outline-none focus:border-blue-500"
                  >
                    <option value="neutral">Neutral</option>
                    <option value="formal">Formal</option>
                    <option value="creativo">Creativo</option>
                    <option value="técnico">Técnico</option>
                    <option value="conciso">Conciso</option>
                  </select>
                </div>
                 <Button 
                    onClick={handleExecutePrompt} 
                    className="md:col-span-1 md:self-end bg-gradient-to-r from-green-500 to-teal-600 hover:from-green-600 hover:to-teal-700 glow-effect"
                 >
                    <Zap className="w-5 h-5 mr-2"/>Ejecutar Prompt con IA
                 </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <FileText className="w-24 h-24 mx-auto text-gray-600 mb-4" />
            <p className="text-xl text-gray-500">Selecciona un prompt o crea uno nuevo</p>
            <p className="text-sm text-gray-600">El editor de prompts te permite refinar tus interacciones con la IA.</p>
            <Button onClick={handleNewPrompt} className="mt-6 bg-gradient-to-r from-blue-500 to-purple-600">
              <PlusCircle className="w-5 h-5 mr-2"/>Crear Nuevo Prompt
            </Button>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default PromptEditorPage;
