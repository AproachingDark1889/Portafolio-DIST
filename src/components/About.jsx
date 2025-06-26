import React from 'react';
import { motion } from 'framer-motion';
import { Code, Palette, Zap } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Code,
      title: 'Desarrollo Full Stack',
      description: 'Experiencia en frontend y backend con tecnologías modernas'
    },
    {
      icon: Palette,
      title: 'Diseño UI/UX',
      description: 'Creación de interfaces atractivas y experiencias de usuario excepcionales'
    },
    {
      icon: Zap,
      title: 'Optimización',
      description: 'Aplicaciones rápidas, eficientes y optimizadas para el rendimiento'
    }
  ];

  return (
    <section id="about" className="py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
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
            <span className="text-gradient">Acerca de Mí</span>
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Soy un desarrollador apasionado con más de 5 años de experiencia creando
            soluciones digitales innovadoras. Me especializo en tecnologías web modernas
            y siempre busco nuevos desafíos para crecer profesionalmente.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <div className="glass-effect rounded-2xl p-8 hover:glow-effect transition-all duration-300">
              <img  
                className="w-full h-80 object-cover rounded-xl mb-6" 
                alt="Desarrollador trabajando en código"
               src="https://images.unsplash.com/photo-1698919585695-546e4a31fc8f" />
              <p className="text-gray-300 leading-relaxed">
                Mi pasión por la tecnología comenzó desde temprana edad, y desde entonces
                he estado constantemente aprendiendo y adaptándome a las nuevas tendencias
                del desarrollo web. Me encanta resolver problemas complejos y crear
                experiencias digitales que realmente marquen la diferencia.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
                className="glass-effect rounded-xl p-6 hover:glow-effect transition-all duration-300"
              >
                <div className="flex items-start space-x-4">
                  <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-300">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;