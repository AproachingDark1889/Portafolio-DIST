import React, { useEffect, useRef, useState } from 'react';
import { useTour } from '@/context/TourContext';

const CommandTerminal = () => {
  const { runCommand } = useTour();
  const [history, setHistory] = useState([]);
  const [input, setInput] = useState('');
  const listRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    setHistory((h) => [...h, { type: 'user', text: input }]);
    const res = runCommand(input.trim());
    setHistory((h) => [...h, { type: 'bot', text: res }]);
    setInput('');
  };

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="h-full flex flex-col">
      <ul ref={listRef} className="flex-1 overflow-y-auto text-sm space-y-1 mb-2">
        {history.map((msg, i) => (
          <li key={i} className={msg.type === 'user' ? 'text-primary' : ''}>
            {msg.type === 'user' ? `> ${msg.text}` : msg.text}
          </li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <input
          className="w-full bg-transparent border-b border-primary outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
      </form>
    </div>
  );
};

export default CommandTerminal;
