import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import script from '@/data/tourScript.json';
import useTourActions from '@/hooks/useTourActions';
import { TourContextValue } from '@/types/TourContext';

export const TourContext = createContext<TourContextValue | undefined>(undefined);

export const TourProvider = ({ children }: { children: ReactNode }) => {
  const actions = useTourActions();
  const [tourMode, setTourMode] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('tourState');
    if (stored) {
      const state = JSON.parse(stored);
      setTourMode(state.tourMode);
      setCurrentStep(state.currentStep);
      setCompleted(state.completed || []);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'tourState',
      JSON.stringify({ tourMode, currentStep, completed })
    );
  }, [tourMode, currentStep, completed]);

  const togglePanel = () => setTourMode((t) => !t);

  const completeStep = (id, badge) => {
    if (!completed.includes(badge)) {
      setCompleted((c) => [...c, badge]);
    }
    const index = script.findIndex((s) => s.id === id);
    if (index !== -1) setCurrentStep(index + 1);
  };

  // Comandos de navegación
  const NAV_COMMANDS = {
    // Comandos en español
    arquetipos: '/archetypes',
    consola: '/console',
    aprendizaje: '/learning',
    prompts: '/prompts',
    notas: '/prompts',
    configuracion: '/settings',
    dialogos: '/dialog',
    trading: '/trading',
    oraculos: '/trading', // backward compatibility
    bienvenida: '/welcome',
    // Comandos en inglés (compatibilidad)
    archetype: '/archetypes',
    console: '/console',
    nonlinear: '/learning',
    prompt: '/prompts',
    settings: '/settings',
    dialog: '/dialog',
    oracle: '/professional',
    welcome: '/welcome',
  };

  const runCommand = (cmd) => {
    const command = cmd.toLowerCase();
    
    // Navegación por comandos
    if (NAV_COMMANDS[command]) {
      const route = NAV_COMMANDS[command];
      window.location.hash = '#' + route;
      
      // Respuestas en español según el comando
      const responses = {
        arquetipos: 'Navegando al Generador de Arquetipos...',
        consola: 'Accediendo a la Consola de Comandos...',
        aprendizaje: 'Iniciando Módulo de Aprendizaje No-Lineal...',
        prompts: 'Abriendo Editor de Notas...',
        notas: 'Abriendo Editor de Notas...',
        configuracion: 'Accediendo a Configuración...',
        dialogos: 'Iniciando Espacios de Diálogo Simbiótico...',
        trading: 'Conectando con TradingVision Pro...',
        oraculos: 'Conectando con TradingVision Pro...', // backward compatibility
        bienvenida: 'Regresando a la página de bienvenida...',
        // Compatibilidad con inglés
        archetype: 'Navegando al Generador de Arquetipos...',
        console: 'Accediendo a la Consola de Comandos...',
        nonlinear: 'Iniciando Módulo de Aprendizaje No-Lineal...',
        prompt: 'Abriendo Editor de Notas...',
        settings: 'Accediendo a Configuración...',
        dialog: 'Iniciando Espacios de Diálogo Simbiótico...',
        oracle: 'Conectando con Oráculos Cuánticos Nexus...',
        welcome: 'Regresando a la página de bienvenida...',
      };
      
      return responses[command] || `Navegando a ${route}`;
    }
    
    const step = script[currentStep];
    let response = 'Comando no reconocido. Usa: bienvenida, arquetipos, consola, aprendizaje, notas, prompts, configuracion, dialogos, trading';
    if (step && step.command === cmd) {
      response = step.dialog;
      const { action, badge, id } = step;
      if (action.scrollTo) actions.scrollTo(action.scrollTo);
      if (action.loadModule) actions.loadModule(action.loadModule);
      if (action.showCertificate) actions.showCertificate();
      completeStep(id, badge);
    }
    return response;
  };

  const goTo = (idx: number) => setCurrentStep(idx);
  const finish = () => {
    setCurrentStep(-1);
    setTourMode(false);
  };

  return (
    <TourContext.Provider
      value={{ 
        tourMode, 
        currentStep, 
        completed, 
        togglePanel, 
        runCommand, 
        completeStep,
        setTourMode,
        setCurrentStep,
        setCompleted,
        actions,
        script,
        steps: script || [],
        current: currentStep,
        next: () => setCurrentStep(prev => prev + 1),
        prev: () => setCurrentStep(prev => Math.max(0, prev - 1)),
        startTour: () => {
          setTourMode(true);
          setCurrentStep(0);
        },
        endTour: () => {
          setTourMode(false);
          setCurrentStep(-1);
        },
        goTo,
        finish
      }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);
