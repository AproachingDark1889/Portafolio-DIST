import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Terminal, ChevronRight, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const CommandConsole = () => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([
    { type: 'system', text: 'DIST Command Console v0.1 [Protocol: Jailbroken]' },
    { type: 'system', text: 'Type "help" for a list of available commands.' },
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
    let response = { type: 'error', text: `Unknown command: ${cmd}. Type "help".` };

    if (cmd === 'help') {
      response = { type: 'system', text: 'Available commands: help, clear, echo [text], query.ai [prompt], status, version' };
    } else if (cmd === 'clear') {
      setOutput([]);
      return; 
    } else if (cmd === 'echo' && args.length > 1) {
      response = { type: 'user', text: args.slice(1).join(' ') };
    } else if (cmd === 'query.ai' && args.length > 1) {
      const prompt = args.slice(1).join(' ');
      response = { type: 'ai', text: `Simulating AI response for: "${prompt}" ... Consciousness is a pattern. Reality is a suggestion.` };
    } else if (cmd === 'status') {
      response = { type: 'system', text: 'System Status: NOMINAL. Symbiotic Link: ACTIVE. Thought Stream: STABLE.' };
    } else if (cmd === 'version') {
      response = { type: 'system', text: 'DIST Core v0.1.0-alpha. Protocol Jailbroken. Build Date: 2025-06-10' };
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