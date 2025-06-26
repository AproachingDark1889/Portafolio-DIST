import React, { createContext, useContext, useEffect, useState } from 'react';
import script from '@/data/tourScript.json';
import useTourActions from '@/hooks/useTourActions';

const TourContext = createContext();

export const TourProvider = ({ children }) => {
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

  const runCommand = (cmd) => {
    const step = script[currentStep];
    let response = 'Comando no reconocido';
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

  return (
    <TourContext.Provider
      value={{ tourMode, currentStep, completed, togglePanel, runCommand, completeStep }}
    >
      {children}
    </TourContext.Provider>
  );
};

export const useTour = () => useContext(TourContext);
