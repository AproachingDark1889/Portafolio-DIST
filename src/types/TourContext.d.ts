export interface TourStep {
  id: string;
  title: string;
  content: string;
  target?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  action?: string;
}

export interface TourContextValue {
  steps: TourStep[];
  current: number;
  currentStep: number;
  tourMode: boolean;
  completed: any[];
  next: () => void;
  prev: () => void;
  startTour: () => void;
  endTour: () => void;
  togglePanel: () => void;
  runCommand: (cmd: string) => void;
  completeStep: (id: any, badge: any) => void;
  setTourMode: (mode: boolean) => void;
  setCurrentStep: (step: number) => void;
  setCompleted: (completed: any[]) => void;
  actions: any;
  script: any;
}

export interface TourProviderProps {
  children: React.ReactNode;
}
