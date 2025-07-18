
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import DistLayout from '@/layouts/DistLayout';
import DashboardPage from '@/pages/DashboardPage';
import SymbioticSpacesPage from '@/pages/SymbioticSpacesPage';
import NonLinearLearningPage from '@/pages/NonLinearLearningPage';
import RetroConsolePage from '@/pages/RetroConsolePage';
import PromptEditorPage from '@/pages/PromptEditorPage';
import ArchetypeGeneratorPage from '@/pages/ArchetypeGeneratorPage';
import ThoughtOraclesPage from '@/pages/ThoughtOraclesPage';
import SettingsPage from '@/pages/SettingsPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-black text-gray-200 scroll-smooth">
        <Routes>
          <Route path="/" element={<DistLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="symbiotic-spaces" element={<SymbioticSpacesPage />} />
            <Route path="non-linear-learning" element={<NonLinearLearningPage />} />
            <Route path="retro-console" element={<RetroConsolePage />} />
            <Route path="prompt-editor" element={<PromptEditorPage />} />
            <Route path="archetype-generator" element={<ArchetypeGeneratorPage />} />
            <Route path="thought-oracles" element={<ThoughtOraclesPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

export default App;
