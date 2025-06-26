import { Brain } from 'lucide-react';

export default function PortfolioHeader() {
  return (
    <header className="border-b border-primary/50 p-2 flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
      <div className="flex items-center">
        <Brain className="w-8 h-8 text-primary mr-3 text-glow" />
        <h1 className="text-2xl font-bold text-primary text-glow">DIST</h1>
        <span className="ml-2 text-xs text-muted-foreground">v0.0.1 Portafolio</span>
      </div>
      <nav className="flex items-center space-x-1">
        <a href="#hero" className="px-3 py-1.5 text-sm hover:bg-primary/20 hover:text-primary rounded transition-colors duration-150">Inicio</a>
        <a href="#about" className="px-3 py-1.5 text-sm hover:bg-primary/20 hover:text-primary rounded transition-colors duration-150">Acerca</a>
        <a href="#skills" className="px-3 py-1.5 text-sm hover:bg-primary/20 hover:text-primary rounded transition-colors duration-150">Habilidades</a>
        <a href="#projects" className="px-3 py-1.5 text-sm hover:bg-primary/20 hover:text-primary rounded transition-colors duration-150">Proyectos</a>
        <a href="#contact" className="px-3 py-1.5 text-sm hover:bg-primary/20 hover:text-primary rounded transition-colors duration-150">Contacto</a>
        <a href="#contact" className="px-3 py-1.5 text-sm bg-primary text-background rounded transition-colors duration-150">Contáctame</a>
      </nav>
    </header>
  );
}
