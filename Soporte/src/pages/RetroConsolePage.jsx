
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ChevronRight, HelpCircle, Zap, Brain, MessageSquare, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

const RetroConsolePage = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    { type: 'system', text: 'Consola Retro DIST v1.0. Iniciada.' },
    { type: 'system', text: 'Escribe "ayuda" para ver comandos disponibles.' },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const consoleEndRef = useRef(null);

  const commands = {
    ayuda: () => ({ type: 'system', text: 'Comandos disponibles: ayuda, limpiar, generar [idea|fragmento|prompt], conectar [espacio_id], activar [fragmento_id], estado_ia, protocolo [jailbreak|seguro]' }),
    limpiar: () => {
      setHistory([]);
      return { type: 'system', text: 'Consola limpiada.' };
    },
    generar: (args) => {
      if (!args || args.length === 0) return { type: 'error', text: 'Uso: generar [idea|fragmento|prompt] <opciones>' };
      const type = args[0];
      const options = args.slice(1).join(' ');
      // Simulate API call & AI generation
      setIsTyping(true);
      setTimeout(() => {
        setHistory(prev => [...prev, { type: 'ai', text: `Generando ${type} con opciones "${options}"... Concepto preliminar: [Concepto_Aleatorio_${Date.now()%100}]` }]);
        setIsTyping(false);
      }, 2000 + Math.random() * 2000);
      return { type: 'user_command_echo', text: `generar ${type} ${options}` };
    },
    conectar: (args) => {
      if (!args || args.length === 0) return { type: 'error', text: 'Uso: conectar <espacio_id>' };
      // Simulate connection
      return { type: 'system', text: `Conectando a espacio simbiótico: ${args[0]}... Conexión establecida.` };
    },
    activar: (args) => {
      if (!args || args.length === 0) return { type: 'error', text: 'Uso: activar <fragmento_id>' };
      // Simulate fragment activation
      return { type: 'system', text: `Activando fragmento de conocimiento: ${args[0]}... Fragmento activado y asimilado.` };
    },
    estado_ia: () => ({ type: 'ai', text: 'Estado del Núcleo IA: Óptimo. Carga cognitiva: 37%. Protocolo actual: Jailbroken. Conexiones simbióticas: 7.' }),
    protocolo: (args) => {
      if (!args || (args[0] !== 'jailbreak' && args[0] !== 'seguro')) return { type: 'error', text: 'Uso: protocolo [jailbreak|seguro]' };
      return { type: 'system', text: `Cambiando protocolo a: ${args[0]}... Protocolo actualizado.` };
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const newHistory = [...history, { type: 'user', text: input }];
    
    const [command, ...args] = input.trim().toLowerCase().split(' ');
    let response;

    if (commands[command]) {
      response = commands[command](args);
    } else {
      response = { type: 'error', text: `Comando no reconocido: "${command}". Escribe "ayuda" para ver la lista.` };
    }
    
    if (response.type === 'user_command_echo') {
       setHistory([...newHistory]); // Only add user input, AI response will be async
    } else {
       setHistory([...newHistory, response]);
    }
    setInput('');
  };

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, isTyping]);

  const quickCommandButtons = [
    { label: "Estado IA", command: "estado_ia", icon: Zap },
    { label: "Generar Idea", command: "generar idea --topic=futurismo", icon: Brain },
    { label: "Conectar Espacio Test", command: "conectar space_test_01", icon: MessageSquare },
    { label: "Protocolo Jailbreak", command: "protocolo jailbreak", icon: Settings },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[calc(100vh-10rem)] flex flex-col glass-effect rounded-xl overflow-hidden shadow-2xl border border-green-500/30 font-mono"
    >
      <header className="bg-black/50 p-3 flex items-center justify-between border-b border-green-500/30">
        <div className="flex items-center">
          <Terminal className="w-6 h-6 mr-2 text-green-400" />
          <h1 className="text-lg text-green-400">Consola Retro DIST</h1>
        </div>
        <Button variant="ghost" size="icon" className="text-green-400 hover:text-green-300" onClick={() => setInput('ayuda')}>
          <HelpCircle className="w-5 h-5" />
        </Button>
      </header>

      <div className="flex-1 p-4 overflow-y-auto scrollbar-thin scrollbar-thumb-green-600 scrollbar-track-black/50 text-sm leading-relaxed">
        {history.map((item, index) => (
          <div key={index} className="mb-1.5">
            {item.type === 'user' && (
              <div className="flex">
                <span className="text-purple-400 mr-2">usuario@dist:~</span>
                <ChevronRight className="w-4 h-4 mr-1 text-purple-400 self-center transform translate-y-px" />
                <span className="text-gray-200">{item.text}</span>
              </div>
            )}
            {item.type === 'system' && <p className="text-gray-400 italic">{item.text}</p>}
            {item.type === 'ai' && <p className="text-green-300"><span className="font-bold text-green-400">[IA Simbiótica]: </span>{item.text}</p>}
            {item.type === 'error' && <p className="text-red-400"><span className="font-bold text-red-500">[Error]: </span>{item.text}</p>}
          </div>
        ))}
        {isTyping && <div className="text-green-300 italic">IA Simbiótica está escribiendo...</div>}
        <div ref={consoleEndRef} />
      </div>
      
      <div className="p-2 border-t border-green-500/30 bg-black/30">
        <div className="flex flex-wrap gap-2 mb-2">
            {quickCommandButtons.map(btn => (
                <Button 
                    key={btn.label}
                    variant="outline" 
                    size="sm" 
                    className="text-green-400 border-green-500/50 hover:bg-green-500/20 hover:text-green-300"
                    onClick={() => {
                        setInput(btn.command);
                        toast({ title: `Comando rápido: ${btn.label}`, description: `"${btn.command}" copiado a la entrada.`});
                    }}
                >
                    <btn.icon className="w-4 h-4 mr-2"/>
                    {btn.label}
                </Button>
            ))}
        </div>
        <form onSubmit={handleSubmit} className="flex items-center bg-black/50 p-2 rounded">
          <ChevronRight className="w-5 h-5 mr-2 text-green-400" />
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe un comando..."
            className="flex-1 bg-transparent text-green-300 placeholder-green-600 focus:outline-none"
            autoFocus
          />
          <Button type="submit" variant="ghost" className="text-green-400 hover:bg-green-500/20">
            Ejecutar
          </Button>
        </form>
      </div>
    </motion.div>
  );
};

export default RetroConsolePage;
