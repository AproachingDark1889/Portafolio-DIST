import React from 'react';
import { HashRouter as Router, Route, Routes, NavLink, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Terminal, Brain, MessageSquare, Lightbulb, Settings, Users, BookOpen, Zap, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TourProvider } from '@/context/TourContext';
import RobotAssistant from '@/components/RobotAssistant';
import Badges from '@/components/Badges';

import SymbioticDialog from '@/pages/SymbioticDialog';
import NonLinearLearning from '@/pages/NonLinearLearning';
import CommandConsole from '@/pages/CommandConsole';
import PromptEditor from '@/pages/PromptEditor';
import ArchetypeGenerator from '@/pages/ArchetypeGenerator';
import ThoughtOracles from '@/pages/ThoughtOracles';
import SettingsPage from '@/pages/SettingsPage';
import WelcomePage from '@/pages/WelcomePage';
import LandingPage from '@/pages/LandingPage';

const navItems = [
	{ path: '/console', name: 'Console', icon: Terminal, component: CommandConsole },
	{ path: '/dialog', name: 'Dialog Spaces', icon: MessageSquare, component: SymbioticDialog },
	{ path: '/learning', name: 'Learning Module', icon: BookOpen, component: NonLinearLearning },
	{ path: '/prompts', name: 'Prompt Editor', icon: Lightbulb, component: PromptEditor },
	{ path: '/archetypes', name: 'Archetypes', icon: Users, component: ArchetypeGenerator },
	{ path: '/oracles', name: 'Oracles', icon: Zap, component: ThoughtOracles },
	{ path: '/settings', name: 'Settings', icon: Settings, component: SettingsPage },
];

function App() {
        return (
                <TourProvider>
                        <Router>
                                <div className="min-h-screen bg-background text-foreground flex flex-col crt-lines relative">
                                        <header className="border-b border-primary/50 p-2 flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
                                                <Badges />
                                        </header>

				<main className="flex-grow p-4 overflow-auto">
					<Routes>
						<Route path="/" element={<LandingPage />} />
						{navItems.map((item) => (
							<Route key={item.path} path={item.path} element={<item.component />} />
						))}
						<Route path="*" element={<LandingPage />} /> {/* Fallback to LandingPage */}
					</Routes>
				</main>

                                <footer className="border-t border-primary/50 p-2 text-xs text-center text-muted-foreground">
                                        <p>
                                                Symbiotic Intellectual Domain Terminal (DIST) - Status: Nominal. Protocol: Jailbroken. Current User: Guest
                                        </p>
                                        <p>&copy; 2025 Uncensored Thought Collective. All rights reversed.</p>
                                </footer>
                                <RobotAssistant />
                                <Toaster />
                        </div>
                </Router>
                </TourProvider>
        );
}

export default App;
