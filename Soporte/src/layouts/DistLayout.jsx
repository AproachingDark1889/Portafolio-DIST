
import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  MessageSquare,
  Brain,
  Terminal,
  Edit3,
  Users,
  Sun,
  Settings,
  Menu,
  X,
  ChevronsLeft,
  ChevronsRight,
  Moon,
  Zap,
  Lightbulb,
  Share2,
  BookOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Espacios Simbióticos', icon: MessageSquare, path: '/symbiotic-spaces' },
  { name: 'Aprendizaje No Lineal', icon: Brain, path: '/non-linear-learning' },
  { name: 'Consola Retro', icon: Terminal, path: '/retro-console' },
  { name: 'Editor de Prompts', icon: Edit3, path: '/prompt-editor' },
  { name: 'Generador Arquetipos', icon: Users, path: '/archetype-generator' },
  { name: 'Oráculos Pensamiento', icon: Lightbulb, path: '/thought-oracles' },
  { name: 'Ajustes', icon: Settings, path: '/settings' },
];

const DistLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  const handleFeatureClick = (featureName) => {
     if (['Generador Arquetipos', 'Oráculos Pensamiento', 'Ajustes'].includes(featureName)) {
        toast({
            title: "🚧 ¡Próximamente!",
            description: `La función "${featureName}" aún no está implementada. ¡Pero no te preocupes! Puedes solicitarla en tu próximo mensaje. 🚀`,
            variant: "default",
        });
     }
  };


  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className={`hidden md:flex flex-col bg-slate-900/70 backdrop-blur-lg border-r border-slate-700/50 transition-all duration-300 ease-in-out overflow-y-auto scrollbar-thin scrollbar-thumb-purple-600 scrollbar-track-slate-800`}
      >
        <div className={`flex items-center ${isSidebarOpen ? 'justify-between' : 'justify-center'} p-6 h-20 border-b border-slate-700/50`}>
          {isSidebarOpen && (
            <Link to="/" className="text-3xl font-bold text-gradient">
              DIST
            </Link>
          )}
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="text-gray-400 hover:text-white">
            {isSidebarOpen ? <ChevronsLeft /> : <ChevronsRight />}
          </Button>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              onClick={() => handleFeatureClick(item.name)}
              className={`flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-purple-600/30 hover:text-white group ${
                location.pathname === item.path ? 'bg-purple-600/40 text-white shadow-lg' : 'text-gray-300'
              }`}
            >
              <item.icon className={`w-6 h-6 mr-3 transition-colors duration-200 group-hover:text-purple-300 ${location.pathname === item.path ? 'text-purple-300' : 'text-gray-400'}`} />
              {isSidebarOpen && <span className="font-medium">{item.name}</span>}
            </Link>
          ))}
        </nav>
        {isSidebarOpen && (
          <div className="p-6 border-t border-slate-700/50">
            <div className="p-4 bg-slate-800/50 rounded-lg text-center">
              <Zap className="w-10 h-10 mx-auto text-yellow-400 mb-2" />
              <p className="text-sm text-gray-400">Protocolo Jailbroken Activo</p>
              <p className="text-xs text-purple-400">Modo: Evolución Constante</p>
            </div>
          </div>
        )}
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-700/50 flex items-center justify-between px-6 md:justify-end">
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="text-gray-300 hover:text-white">
              {isMobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white" onClick={() => toast({ title: "🚧 ¡Función no implementada!", description: "Puedes solicitar esta función en tu próximo mensaje. 🚀"})}>
              <Share2 />
            </Button>
            <Button variant="ghost" size="icon" className="text-gray-300 hover:text-white" onClick={() => toast({ title: "🚧 ¡Función no implementada!", description: "Puedes solicitar esta función en tu próximo mensaje. 🚀"})}>
              <Moon />
            </Button>
            <div className="relative">
              <img 
                className="w-10 h-10 rounded-full border-2 border-purple-500 object-cover"
                alt="User avatar"
               src="https://images.unsplash.com/photo-1681304332587-e2f38880e1b3" />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-slate-900 rounded-full"></span>
            </div>
          </div>
        </header>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-800/90 backdrop-blur-md border-b border-slate-700/50 p-4 space-y-2 absolute top-20 left-0 right-0 z-40"
            >
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => {
                    handleFeatureClick(item.name);
                    toggleMobileMenu();
                  }}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-purple-600/30 hover:text-white group ${
                    location.pathname === item.path ? 'bg-purple-600/40 text-white' : 'text-gray-300'
                  }`}
                >
                  <item.icon className={`w-5 h-5 mr-3 ${location.pathname === item.path ? 'text-purple-300' : 'text-gray-400'}`} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              ))}
            </motion.nav>
          )}
        </AnimatePresence>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-950/50">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DistLayout;
