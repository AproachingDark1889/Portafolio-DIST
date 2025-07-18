import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ChevronRight, HelpCircle, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const CommandConsole = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([
    { type: 'system', text: 'Consola de Comandos DIST v0.1 [Protocolo: Jailbroken]' },
    { type: 'system', text: 'Escribe "ayuda" para ver la lista de comandos disponibles.' },
  ]);
  const inputRef = useRef(null);
  const outputEndRef = useRef(null);

  const scrollToBottom = () => {
    outputEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [output]);
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const processCommand = (command) => {
    const args = command.toLowerCase().split(' ');
    const cmd = args[0];
    let response = { type: 'error', text: `Comando desconocido: ${cmd}. Escribe "ayuda".` };

    if (cmd === 'ayuda' || cmd === 'help') {
      response = { type: 'system', text: 'Comandos disponibles: ayuda, limpiar, eco [texto], consultar.ia [prompt], estado, version, aprendizaje, dialogos, arquetipos, trading, notas, configuracion' };
    } else if (cmd === 'limpiar' || cmd === 'clear') {
      setOutput([]);
      return; 
    } else if (cmd === 'eco' || cmd === 'echo') {
      if (args.length > 1) {
        response = { type: 'user', text: args.slice(1).join(' ') };
      } else {
        response = { type: 'error', text: 'Uso: eco [texto] - Repite el texto ingresado' };
      }
    } else if (cmd === 'consultar.ia' || cmd === 'query.ai') {
      if (args.length > 1) {
        const prompt = args.slice(1).join(' ');
        response = { type: 'ai', text: `Simulando respuesta de IA para: "${prompt}" ... La conciencia es un patrón. La realidad es una sugerencia.` };
      } else {
        response = { type: 'error', text: 'Uso: consultar.ia [prompt] - Envía una consulta a la IA simbiótica' };
      }
    } else if (cmd === 'estado' || cmd === 'status') {
      response = { type: 'system', text: 'Estado del Sistema: NOMINAL. Enlace Simbiótico: ACTIVO. Flujo de Pensamiento: ESTABLE.' };
    } else if (cmd === 'version') {
      response = { type: 'system', text: 'DIST Core v0.1.0-alpha. Protocolo Jailbroken. Fecha de construcción: 2025-06-10' };
    } else if (cmd === 'aprendizaje' || cmd === 'nonlinear') {
      response = { type: 'system', text: 'Activando Módulo de Aprendizaje No-Lineal... Redirigiendo a interfaz de aprendizaje.' };
      setTimeout(() => {
        navigate('/learning');
      }, 1500);
    } else if (cmd === 'dialogos') {
      response = { type: 'system', text: 'Iniciando Espacios de Diálogo Simbiótico... Redirigiendo.' };
      setTimeout(() => {
        navigate('/dialog');
      }, 1500);
    } else if (cmd === 'arquetipos') {
      response = { type: 'system', text: 'Accediendo al Generador de Arquetipos... Redirigiendo.' };
      setTimeout(() => {
        navigate('/archetypes');
      }, 1500);
    } else if (cmd === 'trading' || cmd === 'oraculos') {
      response = { type: 'system', text: 'Conectando con TradingVision Pro... Redirigiendo.' };
      setTimeout(() => {
        navigate('/trading');
      }, 1500);
    } else if (cmd === 'configuracion' || cmd === 'settings') {
      response = { type: 'system', text: 'Abriendo panel de configuración... Redirigiendo.' };
      setTimeout(() => {
        navigate('/settings');
      }, 1500);
    } else if (cmd === 'notas' || cmd === 'prompts') {
      response = { type: 'system', text: 'Accediendo al Editor de Notas... Redirigiendo.' };
      setTimeout(() => {
        navigate('/prompts');
      }, 1500);
    }
    
    setOutput(prev => [...prev, { type: 'input', text: command }, response]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === '') return;
    processCommand(input.trim());
    setInput('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 h-full flex flex-col"
    >
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center">
          <Terminal className="w-8 h-8 text-primary mr-3 text-glow" />
          <div>
            <h2 className="text-3xl font-bold text-primary text-glow">Consola de Comando Retro</h2>
            <p className="text-sm text-muted-foreground">Interactúa directamente con el núcleo de DIST y la IA simbiótica.</p>
          </div>
        </div>
        <button className="p-2 hover:bg-primary/20 rounded-full transition-colors" title="Ayuda de Consola">
          <HelpCircle className="w-6 h-6 text-primary/80 hover:text-primary" />
        </button>
      </header>

      {/* Botones de Comandos Rápidos */}
      <div className="mb-4 p-4 border border-primary/30 rounded-lg bg-background/20">
        <h3 className="text-sm font-semibold text-primary mb-3 flex items-center">
          <Zap className="w-4 h-4 mr-2" />
          Comandos Rápidos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {[
            { cmd: 'ayuda', label: 'Ayuda', desc: 'Ver todos los comandos' },
            { cmd: 'limpiar', label: 'Limpiar', desc: 'Limpiar consola' },
            { cmd: 'estado', label: 'Estado', desc: 'Estado del sistema' },
            { cmd: 'aprendizaje', label: 'Aprendizaje', desc: 'Módulo de aprendizaje' },
            { cmd: 'dialogos', label: 'Diálogos', desc: 'Espacios de diálogo' },
            { cmd: 'arquetipos', label: 'Arquetipos', desc: 'Generador de arquetipos' },
            { cmd: 'trading', label: 'Trading', desc: 'Dashboard de trading profesional' },
            { cmd: 'notas', label: 'Notas', desc: 'Editor de notas' },
            { cmd: 'configuracion', label: 'Config', desc: 'Configuración' }
          ].map((button) => (
            <button
              key={button.cmd}
              onClick={() => {
                setInput(button.cmd);
                processCommand(button.cmd);
                setInput('');
              }}
              className="px-3 py-2 text-xs bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 rounded-md transition-colors text-primary font-mono"
              title={button.desc}
            >
              {button.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-grow overflow-y-auto p-4 border border-primary/50 rounded-lg bg-black/50 mb-4 text-sm font-mono leading-relaxed" onClick={() => inputRef.current?.focus()}>
        {output.map((line, index) => (
          <div key={index} className="mb-1.5">
            {line.type === 'input' && <span className="text-primary/70 mr-1">&gt;</span>}
            <span
              className={cn({
                'text-primary': line.type === 'system' || line.type === 'ai',
                'text-muted-foreground': line.type === 'error',
                'text-foreground': line.type === 'user' || line.type === 'input',
                'italic': line.type === 'ai',
              })}
            >
              {line.text}
            </span>
          </div>
        ))}
        <div ref={outputEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex items-center">
        <ChevronRight className="w-5 h-5 text-primary mr-2" />
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={handleInputChange}
          className="flex-grow p-2.5 bg-input border border-primary/50 rounded-md text-foreground placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:border-primary outline-none font-mono text-sm"
          placeholder="Ingresa un comando..."
          spellCheck="false"
          autoComplete="off"
        />
        <button type="submit" className="ml-3 px-6 py-2.5 bg-primary text-primary-foreground hover:bg-primary/80 text-sm rounded-md transition-colors">
          Enviar
        </button>
      </form>
    </motion.div>
  );
};

export default CommandConsole;