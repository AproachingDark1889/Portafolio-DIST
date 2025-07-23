import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from '@/context/TourContext';
import CommandTerminal from '@/components/CommandTerminal';

const RobotAssistant = (): JSX.Element => {
  const { tourMode, togglePanel, runCommand } = useTour();
  const terminalRef = useRef<{ executeFromButton: (cmd: string) => void } | null>(null);

  useEffect(() => {
    document.body.style.overflow = tourMode ? 'hidden' : '';
  }, [tourMode]);

  const executeCommand = (cmd: string): void => {
    // Ejecutar comando y simular entrada en terminal
    if (terminalRef.current) {
      terminalRef.current.executeFromButton(cmd);
    }
  };

  return (
    <>
      <motion.button
        className="size-12 rounded-full bg-gradient-to-br from-primary to-primary/80 text-background flex items-center justify-center shadow-lg hover:shadow-primary/25 hover:scale-110 transition-all duration-300 z-50 text-2xl border border-primary/30 backdrop-blur-sm"
        style={{ position: 'fixed', bottom: '24px', right: '24px' }}
        onClick={togglePanel}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        title="Abrir/Cerrar panel del asistente"
      >
        🤖
      </motion.button>
      <AnimatePresence>
        {tourMode && (
          <>
            <div
              className="fixed inset-0 bg-gradient-to-br from-black/30 to-black/60 backdrop-blur-sm z-40"
              onClick={togglePanel}
            />
            <motion.aside
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              className="fixed bottom-6 right-24 w-80 max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-background/98 backdrop-blur-xl z-50 border border-primary/20 rounded-xl shadow-xl shadow-primary/5 flex flex-col overflow-hidden"
            >
              <div className="p-4 border-b border-primary/20 flex items-center space-x-3 bg-gradient-to-r from-primary/5 to-primary/10">
                <span className="text-3xl animate-pulse">🤖</span>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-primary">Asistente Robot</h2>
                  <p className="text-xs text-muted-foreground">Navegación inteligente</p>
                </div>
                <button
                  className="ml-auto text-primary hover:text-destructive p-2 rounded-full hover:bg-destructive/10 transition-all duration-200"
                  onClick={togglePanel}
                  title="Cerrar"
                >
                  <span className="text-lg">✕</span>
                </button>
              </div>
              <div className="p-4 text-sm text-muted-foreground border-b border-primary/20 bg-gradient-to-br from-background/50 to-primary/5">
                <p className="mb-3 font-medium text-foreground">
                  ⚡ <b>Comandos rápidos de navegación:</b>
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { cmd: 'bienvenida', label: 'bienvenida', desc: 'Página de bienvenida', icon: '🏠' },
                    { cmd: 'arquetipos', label: 'arquetipos', desc: 'Generador de arquetipos', icon: '👥' },
                    { cmd: 'consola', label: 'consola', desc: 'Consola de comandos', icon: '💻' },
                    { cmd: 'aprendizaje', label: 'aprendizaje', desc: 'Módulo de aprendizaje', icon: '📚' },
                    { cmd: 'notas', label: 'Notas', desc: 'Editor de notas', icon: '📝' },
                    { cmd: 'configuracion', label: 'configuracion', desc: 'Configuración', icon: '⚙️' },
                    { cmd: 'dialogos', label: 'dialogos', desc: 'Espacios de diálogo', icon: '💬' },
                    { cmd: 'trading', label: 'trading', desc: 'TradingVision Pro Dashboard', icon: '📈' }
                  ].map((button) => (
                    <button
                      key={button.cmd}
                      onClick={() => {
                        executeCommand(button.cmd);
                      }}
                      className="px-3 py-2 text-xs bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/60 rounded-lg transition-all duration-200 text-primary font-mono flex items-center gap-2 hover:scale-105 hover:shadow-md"
                      title={button.desc}
                    >
                      <span>{button.icon}</span>
                      <span className="truncate">{button.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-xs mt-3 opacity-75 text-center">
                  💡 También puedes escribir comandos en la consola
                </p>
              </div>
              <div className="flex-1 overflow-y-auto">
                <CommandTerminal ref={terminalRef} />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RobotAssistant;
