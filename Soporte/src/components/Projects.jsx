import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Projects = () => {
  const projects = [
    {
      title: 'E-Commerce Platform',
      description: 'Plataforma de comercio electrónico completa con carrito de compras, pagos y gestión de inventario.',
      image: 'Modern e-commerce website interface with shopping cart and product gallery',
      technologies: ['React', 'Node.js', 'MongoDB', 'Stripe'],
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      title: 'Task Management App',
      description: 'Aplicación de gestión de tareas con colaboración en tiempo real y notificaciones push.',
      image: 'Clean task management dashboard with kanban boards and team collaboration features',
      technologies: ['Next.js', 'TypeScript', 'PostgreSQL', 'Socket.io'],
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      title: 'Weather Dashboard',
      description: 'Dashboard meteorológico interactivo con mapas, gráficos y pronósticos detallados.',
      image: 'Beautiful weather dashboard with interactive maps and detailed forecasts',
      technologies: ['React', 'D3.js', 'OpenWeather API', 'Tailwind'],
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      title: 'Social Media Analytics',
      description: 'Herramienta de análisis de redes sociales con métricas avanzadas y reportes automáticos.',
      image: 'Social media analytics dashboard with charts and engagement metrics',
      technologies: ['Vue.js', 'Python', 'FastAPI', 'Chart.js'],
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      title: 'Learning Management System',
      description: 'Sistema de gestión de aprendizaje con cursos interactivos y seguimiento de progreso.',
      image: 'Modern learning management system with course videos and progress tracking',
      technologies: ['React', 'Express', 'MySQL', 'AWS S3'],
      liveUrl: '#',
      githubUrl: '#'
    },
    {
      title: 'Cryptocurrency Tracker',
      description: 'Aplicación para rastrear criptomonedas con alertas de precio y análisis de mercado.',
      image: 'Cryptocurrency tracking app with real-time price charts and market analysis',
      technologies: ['React Native', 'Redux', 'CoinGecko API', 'Firebase'],
      liveUrl: '#',
      githubUrl: '#'
    }
  ];

  return (
    <section id="projects" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 left-20 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl floating"></div>
        <div className="absolute bottom-10 right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl floating" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            <span className="text-gradient">Proyectos Destacados</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Una selección de mis trabajos más recientes que demuestran mis habilidades
            y pasión por el desarrollo web
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -10 }}
              className="glass-effect rounded-2xl overflow-hidden hover:glow-effect transition-all duration-300"
            >
              <div className="relative overflow-hidden">
                <img  
                  className="w-full h-48 object-cover transition-transform duration-300 hover:scale-110" 
                  alt={`${project.title} project screenshot`}
                 src="https://images.unsplash.com/photo-1595872018818-97555653a011" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                  <Button
                    size="sm"
                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm"
                    onClick={() => window.open(project.liveUrl, '_blank')}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => window.open(project.githubUrl, '_blank')}
                  >
                    <Github className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-white mb-3">
                  {project.title}
                </h3>
                <p className="text-gray-300 mb-4 text-sm leading-relaxed">
                  {project.description}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1 bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-blue-300 text-xs rounded-full border border-blue-500/30"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
                <div className="flex space-x-3">
                  <Button
                    size="sm"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    onClick={() => window.open(project.liveUrl, '_blank')}
                  >
                    Ver Proyecto
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/30 text-white hover:bg-white/10"
                    onClick={() => window.open(project.githubUrl, '_blank')}
                  >
                    <Github className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Projects;