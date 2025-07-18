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
      <button
        className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 size-12 sm:size-14 rounded-full bg-primary text-background flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 text-xl sm:text-2xl"
        onClick={togglePanel}
      >
        🤖
      </button>
      <AnimatePresence>
        {tourMode && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40"
              onClick={togglePanel}
            />
            <motion.aside
              initial={{ x: 100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 100, opacity: 0 }}
              transition={{ type: 'tween' }}
              className="fixed bottom-2 sm:bottom-6 right-16 sm:right-20 w-[calc(100vw-5rem)] sm:w-80 max-w-[95vw] h-[calc(100vh-1rem)] sm:h-[652px] max-h-[90vh] bg-background z-50 border border-primary rounded-xl shadow-xl flex flex-col"
            >
              <div className="p-2 sm:p-3 border-b border-primary flex items-center space-x-2">
                <span className="text-xl sm:text-2xl">🤖</span>
                <h2 className="text-base sm:text-lg font-semibold">Asistente Robot</h2>
                <button
                  className="ml-auto text-primary hover:text-destructive p-1"
                  onClick={togglePanel}
                  title="Cerrar"
                >
                  ✕
                </button>
              </div>
              <div className="p-1.5 sm:p-2 text-xs text-muted-foreground border-b border-primary bg-background/80">
                <p className="mb-2">
                  ¡Hola! Usa los <b>comandos rápidos</b> para navegar:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1">
                  {[
                    { cmd: 'bienvenida', label: 'bienvenida', desc: 'Página de bienvenida' },
                    { cmd: 'arquetipos', label: 'arquetipos', desc: 'Generador de arquetipos' },
                    { cmd: 'consola', label: 'consola', desc: 'Consola de comandos' },
                    { cmd: 'aprendizaje', label: 'aprendizaje', desc: 'Módulo de aprendizaje' },
                    { cmd: 'notas', label: 'Notas', desc: 'Editor de notas' },
                    { cmd: 'configuracion', label: 'configuracion', desc: 'Configuración' },
                    { cmd: 'dialogos', label: 'dialogos', desc: 'Espacios de diálogo' },
                    { cmd: 'trading', label: 'trading', desc: 'TradingVision Pro Dashboard' }
                  ].map((button) => (
                    <button
                      key={button.cmd}
                      onClick={() => {
                        executeCommand(button.cmd);
                      }}
                      className="px-1 py-1 text-[9px] sm:text-[10px] bg-primary/10 hover:bg-primary/20 border border-primary/30 hover:border-primary/50 rounded transition-colors text-primary font-mono truncate"
                      title={button.desc}
                    >
                      {button.label}
                    </button>
                  ))}
                </div>
                <p className="text-[9px] sm:text-[10px] mt-1 opacity-70">
                  O escribe comandos en la consola.
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
