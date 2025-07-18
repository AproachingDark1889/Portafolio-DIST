
import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Brain, MessageSquare, Users, Edit3, Terminal, Lightbulb, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const StatCard = ({ title, value, icon, color, linkTo, featureName }) => {
  const { toast } = useToast();
  const IconComponent = icon;

  const handleClick = (e) => {
    if (featureName && ['Generador Arquetipos', 'Oráculos Pensamiento'].includes(featureName)) {
      e.preventDefault();
      toast({
        title: "🚧 ¡Próximamente!",
        description: `La función "${featureName}" aún no está implementada. ¡Pero no te preocupes! Puedes solicitarla en tu próximo mensaje. 🚀`,
        variant: "default",
      });
    }
  };

  const cardContent = (
    <motion.div
      whileHover={{ y: -5, boxShadow: `0 10px 20px ${color}33` }}
      className={`glass-effect p-6 rounded-xl border-l-4 ${color} flex flex-col justify-between h-full`}
      style={{ borderColor: color }}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <IconComponent className="w-8 h-8" style={{ color: color }} />
        </div>
        <p className="text-3xl font-bold text-gradient mb-2">{value}</p>
      </div>
      <Button variant="link" className="text-purple-400 hover:text-purple-300 p-0 self-start mt-4">
        Explorar <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </motion.div>
  );

  return linkTo ? (
    <Link to={linkTo} onClick={handleClick} className="block h-full">
      {cardContent}
    </Link>
  ) : (
    cardContent
  );
};


const DashboardPage = () => {
  const { toast } = useToast();

  const quickActions = [
    { name: 'Nuevo Diálogo', icon: MessageSquare, path: '/symbiotic-spaces' },
    { name: 'Iniciar Aprendizaje', icon: Brain, path: '/non-linear-learning' },
    { name: 'Abrir Consola', icon: Terminal, path: '/retro-console' },
    { name: 'Crear Prompt', icon: Edit3, path: '/prompt-editor' },
  ];

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-4xl font-bold text-gradient mb-2">Bienvenido a DIST</h1>
        <p className="text-xl text-gray-400">Tu plataforma de conocimiento descentralizado y IA simbiótica.</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Espacios Activos" value="12" icon={MessageSquare} color="#8B5CF6" linkTo="/symbiotic-spaces" />
        <StatCard title="Fragmentos Aprendidos" value="157" icon={Brain} color="#EC4899" linkTo="/non-linear-learning" />
        <StatCard title="Prompts Creados" value="42" icon={Edit3} color="#3B82F6" linkTo="/prompt-editor" />
        <StatCard title="Arquetipos Definidos" value="8" icon={Users} color="#10B981" linkTo="/archetype-generator" featureName="Generador Arquetipos" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="glass-effect p-6 rounded-xl"
      >
        <h2 className="text-2xl font-semibold text-white mb-6">Acciones Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map(action => (
            <Link to={action.path} key={action.name}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="bg-purple-600/20 hover:bg-purple-600/40 p-4 rounded-lg text-center cursor-pointer transition-all"
              >
                <action.icon className="w-10 h-10 mx-auto text-purple-400 mb-2" />
                <p className="text-white font-medium">{action.name}</p>
              </motion.div>
            </Link>
          ))}
        </div>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 glass-effect p-6 rounded-xl">
          <h2 className="text-2xl font-semibold text-white mb-4">Actividad Reciente</h2>
          <ul className="space-y-3">
            {[
              { text: "Nuevo diálogo 'Exploración Cuántica' iniciado.", time: "Hace 5 min", icon: MessageSquare },
              { text: "Fragmento 'Teoría de Cuerdas Simplificada' activado.", time: "Hace 23 min", icon: Brain },
              { text: "Comando '/generate idea --topic=AI_ethics' ejecutado.", time: "Hace 1 hora", icon: Terminal },
              { text: "Prompt 'Escritura Creativa Futurista' actualizado.", time: "Hace 3 horas", icon: Edit3 },
            ].map((item, index) => (
              <li key={index} className="flex items-center p-3 bg-slate-800/50 rounded-md hover:bg-slate-700/50 transition-colors">
                <item.icon className="w-5 h-5 mr-3 text-purple-400 flex-shrink-0" />
                <span className="text-gray-300 flex-grow">{item.text}</span>
                <span className="text-xs text-gray-500 ml-2 flex-shrink-0">{item.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-effect p-6 rounded-xl">
          <h2 className="text-2xl font-semibold text-white mb-4">Estado del Sistema</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-md">
              <div className="flex items-center">
                <Zap className="w-5 h-5 mr-2 text-yellow-400" />
                <span className="text-gray-300">Protocolo Jailbroken</span>
              </div>
              <span className="text-green-400 font-semibold">Activo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-md">
              <div className="flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-blue-400" />
                <span className="text-gray-300">Núcleo IA</span>
              </div>
              <span className="text-green-400 font-semibold">Óptimo</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-md">
              <div className="flex items-center">
                <Users className="w-5 h-5 mr-2 text-pink-400" />
                <span className="text-gray-300">Nodos Simbióticos</span>
              </div>
              <span className="text-purple-400 font-semibold">7 Conectados</span>
            </div>
            <Button 
              className="w-full mt-4 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 glow-effect"
              onClick={() => toast({ title: "🚧 ¡Función no implementada!", description: "Puedes solicitar esta función en tu próximo mensaje. 🚀"})}
            >
              Ver Diagnóstico Completo
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardPage;
