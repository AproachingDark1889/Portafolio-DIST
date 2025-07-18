import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import { useTour } from '@/context/TourContext';

const CommandTerminal = forwardRef((props, ref) => {
  const { runCommand } = useTour();
  const [history, setHistory] = useState(() => {
    // Cargar historial desde localStorage al inicializar
    const saved = localStorage.getItem('robotAssistant_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  // Guardar historial en localStorage cada vez que cambie
  useEffect(() => {
    localStorage.setItem('robotAssistant_history', JSON.stringify(history));
  }, [history]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setHistory((h) => [...h, { type: 'user', text: input }]);
    const res = runCommand(input.trim());
    setHistory((h) => [...h, { type: 'bot', text: res }]);
    setInput('');
  };

  // Función para ejecutar comandos desde botones
  const executeFromButton = (cmd) => {
    setHistory((h) => [...h, { type: 'user', text: cmd }]);
    const res = runCommand(cmd);
    setHistory((h) => [...h, { type: 'bot', text: res }]);
  };

  // Función para limpiar historial
  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('robotAssistant_history');
  };

  // Exponer funciones al componente padre
  useImperativeHandle(ref, () => ({
    executeFromButton,
    clearHistory
  }));

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="h-full flex flex-col">
      {/* Header con botón de limpiar */}
      {history.length > 0 && (
        <div className="flex justify-end p-1 border-b border-primary/30">
          <button
            onClick={clearHistory}
            className="px-2 py-1 text-[10px] bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 hover:border-destructive/50 rounded transition-colors text-destructive"
            title="Limpiar historial"
          >
            🗑️ Limpiar
          </button>
        </div>
      )}
      <ul ref={listRef} className="flex-1 overflow-y-auto text-sm space-y-1 mb-2 px-2">
        {history.map((msg, i) => (
          <li key={i} className={msg.type === 'user' ? 'text-primary' : ''}>
            {msg.type === 'user' ? `> ${msg.text}` : msg.text}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit} className="w-full flex items-center p-2 border-t border-primary bg-background sticky bottom-0">
        <span className="text-primary mr-2">&gt;</span>
        <input
          className="flex-1 bg-background border border-primary rounded px-3 py-2 outline-none focus:ring-2 focus:ring-primary text-foreground placeholder-muted-foreground text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          placeholder="Escribe un comando y presiona Enter..."
        />
        <button type="submit" className="ml-2 px-3 py-2 bg-primary text-background rounded hover:bg-primary/80 transition-colors text-xs">Enviar</button>
      </form>
    </div>
  );
});

export default CommandTerminal;
