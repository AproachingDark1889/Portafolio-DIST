import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTour } from '@/context/TourContext';
import CommandTerminal from '@/components/CommandTerminal';

const RobotAssistant = () => {
  const { tourMode, togglePanel } = useTour();

  useEffect(() => {
    document.body.style.overflow = tourMode ? 'hidden' : '';
  }, [tourMode]);

  return (
    <>
      <button
        className="fixed bottom-6 right-6 size-14 rounded-full bg-primary text-background flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50"
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
              initial={{ y: '-100%' }}
              animate={{ y: 0 }}
              exit={{ y: '-100%' }}
              transition={{ type: 'tween' }}
              className="fixed top-0 left-0 right-0 h-[80vh] bg-background z-50 border-b border-primary flex flex-col"
            >
              <div className="p-4 border-b border-primary flex items-center space-x-2">
                <span className="text-2xl">🤖</span>
                <h2 className="text-lg">Robot Assistant</h2>
              </div>
              <CommandTerminal />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default RobotAssistant;
