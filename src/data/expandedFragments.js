// Base de conocimiento expandida con fragmentos avanzados
export const expandedFragmentDatabase = {
  // Física Cuántica y Cosmología
  quantumPhysics: {
    'quantum-001': {
      id: 'quantum-001',
      title: 'Mecánica Cuántica Fundamental',
      category: 'Física Cuántica',
      complexity: 4,
      prerequisites: [],
      related: ['quantum-002', 'quantum-005'],
      summary: 'Principios fundamentales de la mecánica cuántica: superposición, entrelazamiento y colapso de la función de onda.',
      content: {
        theory: `
          La mecánica cuántica describe el comportamiento de la materia y la energía en escalas atómicas y subatómicas.
          Los principios fundamentales incluyen:
          
          1. **Superposición**: Las partículas pueden existir en múltiples estados simultáneamente
          2. **Entrelazamiento**: Correlaciones no locales entre partículas
          3. **Principio de Incertidumbre**: Limitaciones fundamentales en la medición
          4. **Colapso de la función de onda**: Transición de múltiples estados a uno definido
        `,
        applications: [
          'Computación cuántica',
          'Criptografía cuántica',
          'Sensores cuánticos',
          'Física de materiales'
        ],
        visualizations: [
          'double-slit-experiment',
          'quantum-state-visualization',
          'entanglement-demo'
        ]
      },
      interactiveElements: [
        'quantum-simulator',
        'wave-function-collapse-demo',
        'uncertainty-principle-calculator'
      ],
      masteryLevel: 0,
      timeToComplete: 45, // minutos
      tags: ['fundamental', 'quantum', 'physics', 'theory']
    },
    
    'quantum-002': {
      id: 'quantum-002',
      title: 'Interpretaciones de la Mecánica Cuántica',
      category: 'Física Cuántica',
      complexity: 5,
      prerequisites: ['quantum-001'],
      related: ['philosophy-001', 'quantum-003'],
      summary: 'Diferentes interpretaciones filosóficas de la mecánica cuántica: Copenhague, Mundos Múltiples, Variables Ocultas.',
      content: {
        theory: `
          Las interpretaciones de la mecánica cuántica abordan el significado fundamental de la teoría:
          
          1. **Interpretación de Copenhague**: Realidad emerge con la medición
          2. **Teoría de Mundos Múltiples**: Todos los resultados posibles ocurren en universos paralelos
          3. **Variables Ocultas**: Determinismo subyacente no observable
          4. **Interpretación Transaccional**: Intercambio de ondas entre emisor y receptor
        `,
        experiments: [
          'Experimento de Aspect',
          'Experimento de elección retrasada',
          'Borrador cuántico'
        ],
        implications: [
          'Naturaleza de la realidad',
          'Papel del observador',
          'Causalidad y localidad'
        ]
      },
      masteryLevel: 0,
      timeToComplete: 60,
      tags: ['interpretation', 'philosophy', 'quantum', 'advanced']
    }
  },

  // Filosofía de la Mente y Conciencia
  consciousness: {
    'consciousness-001': {
      id: 'consciousness-001',
      title: 'El Problema Difícil de la Conciencia',
      category: 'Filosofía de la Mente',
      complexity: 5,
      prerequisites: ['philosophy-001'],
      related: ['ai-ethics-001', 'quantum-002'],
      summary: 'David Chalmers y el problema de explicar la experiencia subjetiva y los qualia.',
      content: {
        theory: `
          El "problema difícil" de la conciencia, acuñado por David Chalmers, se refiere al desafío de explicar:
          
          1. **Experiencia Subjetiva**: Por qué hay algo que se siente como estar consciente
          2. **Qualia**: Las propiedades fenomenológicas de las experiencias
          3. **Binding Problem**: Cómo se unifica la experiencia consciente
          4. **Emergencia**: Cómo surge la conciencia de procesos físicos
        `,
        approaches: [
          'Materialismo eliminativo',
          'Funcionalismo',
          'Panpsiquismo',
          'Teoría de la Información Integrada'
        ],
        implications: [
          'Inteligencia artificial consciente',
          'Ética de la IA',
          'Naturaleza de la identidad personal'
        ]
      },
      interactiveElements: [
        'consciousness-meter',
        'qualia-explorer',
        'binding-problem-simulator'
      ],
      masteryLevel: 0,
      timeToComplete: 75,
      tags: ['consciousness', 'philosophy', 'chalmers', 'hard-problem']
    }
  },

  // Inteligencia Artificial y Ética
  aiEthics: {
    'ai-ethics-001': {
      id: 'ai-ethics-001',
      title: 'Superinteligencia y Riesgos Existenciales',
      category: 'Ética Tecnológica',
      complexity: 4,
      prerequisites: ['consciousness-001'],
      related: ['quantum-002', 'simulation-001'],
      summary: 'Nick Bostrom y los riesgos de la superinteligencia artificial para la humanidad.',
      content: {
        theory: `
          La superinteligencia representa una transformación radical en el desarrollo tecnológico:
          
          1. **Explosión de Inteligencia**: Mejora recursiva de sistemas de IA
          2. **Problema de Control**: Mantener sistemas superinteligentes alineados
          3. **Riesgos Existenciales**: Amenazas a la supervivencia humana
          4. **Transición Crítica**: Ventana de oportunidad para la seguridad
        `,
        scenarios: [
          'Despegue lento vs. rápido',
          'Multipolaridad vs. unipolaridad',
          'Escenarios de falla de control'
        ],
        solutions: [
          'Aprendizaje de valores',
          'Sistemas de recompensa robustos',
          'Verificación formal',
          'Cooperación internacional'
        ]
      },
      masteryLevel: 0,
      timeToComplete: 90,
      tags: ['ai-safety', 'bostrom', 'superintelligence', 'existential-risk']
    }
  },

  // Simulación y Realidad Virtual
  simulation: {
    'simulation-001': {
      id: 'simulation-001',
      title: 'Hipótesis de la Simulación',
      category: 'Filosofía de la Mente',
      complexity: 3,
      prerequisites: ['consciousness-001'],
      related: ['quantum-002', 'ai-ethics-001'],
      summary: 'El argumento de Nick Bostrom sobre la probabilidad de que vivamos en una simulación computacional.',
      content: {
        theory: `
          La Hipótesis de la Simulación plantea que una de estas proposiciones debe ser verdadera:
          
          1. **Filtro de Civilización**: Pocas civilizaciones alcanzan madurez tecnológica
          2. **Pérdida de Interés**: Civilizaciones maduras no ejecutan simulaciones ancestrales
          3. **Vivimos en una Simulación**: Somos parte de una simulación computacional
        `,
        evidence: [
          'Digitalización del universo',
          'Límites computacionales',
          'Anomalías físicas',
          'Paradojas cuánticas'
        ],
        implications: [
          'Naturaleza de la realidad',
          'Ética de las simulaciones',
          'Búsqueda de evidencia',
          'Comportamiento racional'
        ]
      },
      masteryLevel: 0,
      timeToComplete: 50,
      tags: ['simulation', 'bostrom', 'reality', 'computation']
    }
  }
};

// Sistema de conexiones sinápticas entre fragmentos
export const synapticConnections = {
  'quantum-001': {
    strongConnections: ['quantum-002', 'consciousness-001'],
    weakConnections: ['simulation-001'],
    emergentConnections: ['ai-ethics-001']
  },
  'consciousness-001': {
    strongConnections: ['simulation-001', 'ai-ethics-001'],
    weakConnections: ['quantum-002'],
    emergentConnections: ['quantum-001']
  },
  'ai-ethics-001': {
    strongConnections: ['consciousness-001', 'simulation-001'],
    weakConnections: ['quantum-001'],
    emergentConnections: ['quantum-002']
  }
};

// Rutas de aprendizaje predefinidas
export const learningPaths = {
  'quantum-philosopher': {
    name: 'Filósofo Cuántico',
    description: 'Explora la intersección entre física cuántica y filosofía de la mente',
    difficulty: 'Avanzado',
    estimatedTime: '8-10 horas',
    path: ['quantum-001', 'quantum-002', 'consciousness-001', 'simulation-001']
  },
  'ai-ethicist': {
    name: 'Ético de IA',
    description: 'Comprende los desafíos éticos de la inteligencia artificial avanzada',
    difficulty: 'Intermedio-Avanzado',
    estimatedTime: '6-8 horas',
    path: ['consciousness-001', 'ai-ethics-001', 'simulation-001']
  },
  'reality-investigator': {
    name: 'Investigador de la Realidad',
    description: 'Cuestiona la naturaleza fundamental de la realidad',
    difficulty: 'Avanzado',
    estimatedTime: '10-12 horas',
    path: ['quantum-001', 'consciousness-001', 'simulation-001', 'quantum-002', 'ai-ethics-001']
  }
};
