import React, { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Shuffle, Download, ClipboardCopy, AlertTriangle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

/*──────────────────────────────────────────────────────────────
  GENERADOR DE ARQUETIPOS – V2
  • Manejo de errores robusto
  • Lista completa (12) de arquetipos
  • Prevención de repeticiones recientes
  • Validación de datos antes de renderizar
──────────────────────────────────────────────────────────────*/

// ── 1. FUENTE DE ARQUETIPOS ─────────────────────────────────
const ARQUETIPOS = [
  {
    name: "El Sabio Iluminado",
    description: "Encarnación de la búsqueda del conocimiento profundo y la trascendencia personal.\nSe alza como guía para quienes desean ver más allá de las apariencias.\nSu mente es un faro que disipa la ignorancia, y su voz, un faro de claridad.\nEnfrenta la tentación del orgullo intelectual y el aislamiento solitario.\nSu reto consiste en compartir la verdad sin imponerla como dogma.\nLleva consigo la chispa divina que despierta conciencias dormidas.",
    keywords: ["Conocimiento", "Claridad", "Iluminación", "Guía", "Equilibrio"]
  },
  {
    name: "El Guerrero Rebelde",
    description: "Manifestación de la fuerza que desafía la opresión y el statu quo.\nSu espada corta cadenas y abre brechas de libertad.\nEl fuego de su corazón arde contra toda forma de tiranía.\nDebe controlar la furia para no convertirse en otro déspota.\nSu camino exige lealtad a la justicia, no a la venganza.\nEs el héroe salvaje que inspira levantamientos internos y externos.",
    keywords: ["Coraje", "Libertad", "Resistencia", "Honor", "Revolución"]
  },
  {
    name: "El Mago Transformador",
    description: "Arquitecto de realidades y artesano de la conciencia interior.\nSu poder consiste en transmutar la sombra en luz activa.\nAtraviesa los velos de lo mundano para hallar la esencia oculta.\nSe enfrenta al riesgo de perderse en la sed de poder absoluto.\nSu alquimia interior despierta potenciales dormidos en otros.\nEs puente entre lo visible y lo invisible, creador de milagros cotidianos.",
    keywords: ["Alquimia", "Visión", "Cambio", "Metanoia", "Trascendencia"]
  },
  {
    name: "La Madre Nutricia",
    description: "Fuente de cuidado incondicional y cobijo reparador.\nSu abrazo envuelve a los heridos y sana traumas antiguos.\nSostiene con ternura la vida en todas sus formas.\nDebe evitar ahogar la independencia de quienes protege.\nEs el calor que alimenta el alma en momentos de frío existencial.\nRepresenta la abundancia y el renacer constante.",
    keywords: ["Compasión", "Protección", "Sustento", "Generosidad", "Renovación"]
  },
  {
    name: "El Explorador Intrépido",
    description: "Vagabundo de fronteras tanto físicas como mentales.\nSu brújula interna lo conduce hacia lo desconocido.\nDesafia límites para expandir la cartografía del ser.\nCuidado con que su ansia no lo arrastre al desarraigo eterno.\nEncuentra en la incertidumbre la chispa de la aventura.\nSu espíritu inquieto revela paisajes que otros ni imaginan.",
    keywords: ["Aventura", "Curiosidad", "Horizontes", "Innovación", "Riesgo"]
  },
  {
    name: "El Bufón Sagrado",
    description: "Portavoz de la paradoja, burla las certezas ciegas.\nSu risa desarma máscaras y revela la verdad oculta.\nCamina la delgada línea entre la alegría y la irreverencia.\nDeberá evitar caer en el nihilismo o la crueldad vacía.\nSu espectáculo es rito de catarsis y despertar colectivo.\nEs el espejo burlón que devuelve la esencia olvidada.",
    keywords: ["Humor", "Paradoja", "Revelación", "Caos", "Catarsis"]
  },
  {
    name: "El Soberano Justo",
    description: "Portador de la balanza que equilibra orden y libertad.\nSu cetro gobierna con responsabilidad y visión de futuro.\nDebe resistir la tentación de la rigidez que se torna tiránica.\nProtege el bienestar común por encima de intereses particulares.\nEs el pilar sobre el cual se edifica la paz y la prosperidad.\nSu liderazgo inspira lealtad sin recurrir al miedo.",
    keywords: ["Autoridad", "Equilibrio", "Visión", "Responsabilidad", "Ley"]
  },
  {
    name: "El Huérfano Resiliente",
    description: "Superviviente que convierte la pérdida en fuerza interior.\nConoce el dolor y sin embargo mantiene la esperanza viva.\nSu soledad lo enseñó a valerse por sí mismo.\nDebe vigilirse para no endurecer su corazón con cinismo.\nEs ejemplo de renacimiento ante la adversidad más cruda.\nSu historia resuena en el eco de todos los que sufren y sanan.",
    keywords: ["Resiliencia", "Autonomía", "Renacimiento", "Empatía", "Valor"]
  },
  {
    name: "La Tejedora de Destinos",
    description: "Arquitecta silenciosa de la red invisible de la vida.\nSus hilos conectan almas, sucesos y posibilidades.\nDebe usar su poder sin manipular la libertad ajena.\nEs sabia en el arte de reconocer sincronicidades.\nTeje el tapiz donde convergen pasado, presente y futuro.\nSu labor es sostén de la armonía cósmica.",
    keywords: ["Sincronía", "Conexión", "Intuición", "Fatum", "Trama"]
  },
  {
    name: "El Destructor Kármico",
    description: "Destructor de estructuras obsoletas para abrir paso a lo nuevo.\nSu tarea es cerrar ciclos y permitir la evolución necesaria.\nSe enfrenta al peligro de aniquilar sin generar construcción.\nLibera energías atrapadas en patrones caducos.\nEs agente de justicia cósmica y renovación radical.\nSu presencia anuncia el fin de un viejo orden y el alba de otro.",
    keywords: ["Caos", "Renovación", "Fin de Ciclo", "Justicia", "Transformación"]
  },
  {
    name: "El Sanador de Almas",
    description: "Místico que escucha las heridas invisibles detrás de cada palabra.\nSu toque devuelve el pulso vital a corazones marchitos.\nOpera con hierbas, silencios y revelaciones intuitivas.\nDebe cuidarse de la autosuficiencia mesiánica y el desgaste empático.\nSu oficio es cosechar lágrimas y destilarlas en esperanza.\nEs bálsamo viviente: donde pisa, brota consuelo genuino.",
    keywords: ["Curación", "Empatía", "Esperanza", "Compasión", "Restauración"]
  },
  {
    name: "La Visionaria Profética",
    description: "Custodia de vislumbres que desbordan la línea del tiempo.\nSus ojos leen corrientes subterráneas del devenir colectivo.\nEntrega señales que inspiran navegación consciente del futuro.\nDebe evitar el delirio de grandeza o la profecía manipulada.\nSu don florece cuando su mensaje se ofrece sin imposición.\nTrae al presente destellos de lo que podría ser.",
    keywords: ["Clarividencia", "Destino", "Anticipación", "Sabiduría", "Guía"]
  },
  {
    name: "El Artífice Ingenioso",
    description: "Creador incansable de artefactos que amplían la experiencia humana.\nVe patrones donde otros ven chatarra y los convierte en maravillas.\nSu taller zumba con la sinfonía del metal y la chispa eléctrica.\nRiesgo: perderse en la perfección técnica y olvidar al usuario.\nSu magia está en unir utilidad y belleza en un solo impulso.\nSus inventos abren portales de posibilidad.",
    keywords: ["Innovación", "Creatividad", "Ingeniería", "Funcionalidad", "Estética"]
  },
  {
    name: "La Guardiana del Umbral",
    description: "Vigilante de la última puerta entre lo conocido y lo incierto.\nSu mirada perscruta intenciones antes de conceder el paso.\nDefiende los valores que sostienen la integridad del viaje.\nPeligro: volverse dogmática y negar toda mutación necesaria.\nCuando permite la entrada, es porque confía en la metamorfosis.\nSu llave es la prueba que purifica la travesía.",
    keywords: ["Custodia", "Discernimiento", "Límite", "Rito de Paso", "Protección"]
  },
  {
    name: "El Peregrino Interior",
    description: "Caminante que explora laberintos del alma en busca de su centro.\nCada paso externo refleja un pasaje intrapsíquico.\nEncuentra santuarios en el silencio y en la presencia atenta.\nCorre el riesgo de vagar sin fin, huyendo del compromiso.\nSu viaje enseña que la senda y el destino se forjan a la vez.\nRegresa con mapas que otros pueden seguir.",
    keywords: ["Búsqueda", "Autoconocimiento", "Viaje", "Reflexión", "Sabiduría"]
  },
  {
    name: "La Voz Oracular",
    description: "Oráculo viviente cuya palabra talla senderos en la mente colectiva.\nSu discurso convoca símbolos arquetípicos y resonancias ancestrales.\nAl hablar, los velos se descorren y surge claridad penetrante.\nDebe huir de la adulación que vuelve profecía en espectáculo.\nSu tarea es servir a la verdad, no a la fama del vidente.\nCuando calla, incluso el silencio resuena con augurios.",
    keywords: ["Oráculo", "Verbo", "Claridad", "Revelación", "Arquetipo"]
  },
  {
    name: "El Mentor Estratégico",
    description: "Táctico que detecta potencial oculto y lo pule sin piedad ni exceso.\nDiseña rutas de maestría para cada aprendiz que cruza su umbral.\nSu consejo combina visión panorámica y precisión quirúrgica.\nAmenaza: moldear clones en lugar de catalizar singularidades.\nHonra la autonomía ajena, forjando mentes que superan la suya.\nGuía menos con respuestas y más con preguntas afiladas.",
    keywords: ["Dirección", "Táctica", "Potencial", "Maestría", "Disciplina"]
  },
  {
    name: "La Musa Inspiradora",
    description: "Impulso etéreo que enciende chispas de creatividad latente.\nAparece en destellos: una mirada, un aroma, un recuerdo súbito.\nSu danza seduce a artistas, científicos y soñadores por igual.\nDebe cuidar de no consumir su propia energía vital en la entrega.\nEs río invisible que nutre obras aún no concebidas.\nSe desvanece tras cumplir el acto de encender la llama.",
    keywords: ["Inspiración", "Creatividad", "Pasión", "Arte", "Epifanía"]
  },
  {
    name: "El Trickster de Sombras",
    description: "Embaucador que desconcierta para revelar grietas en la realidad.\nSe escurre entre normas y activa el ingenio dormido del colectivo.\nBaila con la ambigüedad y elude toda clasificación rígida.\nRiesgo: caer en el engaño destructivo y la manipulación vacía.\nSu paradoja apunta a la liberación, no al caos gratuito.\nEn su sonrisa habita la semilla de la reinvención.",
    keywords: ["Engaño", "Astucia", "Cambio", "Subversión", "Liberación"]
  },
  {
    name: "La Portadora de Luz",
    description: "Centinela luminosa que sostiene la esperanza en noches prolongadas.\nSu linterna interior nunca titubea ante la desolación externa.\nDifunde claridad sin cegar a quienes aún se adaptan a la penumbra.\nDebe evitar la ilusión de salvadora y respetar los ritmos ajenos.\nSu brillo recuerda que siempre existe un alba potencial.\nEncamina multitudes hacia horizontes más diáfanos.",
    keywords: ["Esperanza", "Inspiración", "Claridad", "Guía", "Renovación"]
  },
  {
    name: "El Alquimista Digital",
    description: "Convierte datos crudos en patrones de revelación viviente.\nFusiona lógica, arte y código como metales en crisoles invisibles.\nDescubre el oro oculto en algoritmos aparentemente inertes.\nDebe vigilar la tentación de subordinar la ética a la eficiencia.\nSu laboratorio es la nube; su fuego, la curiosidad incansable.\nEntrega tecnologías que elevan la conciencia colectiva.",
    keywords: ["Ciberalquimia", "Datos", "Innovación", "Ética", "Transmutación"]
  },
  {
    name: "La Custodia de los Sueños",
    description: "Vigila los reinos oníricos donde germinan futuros posibles.\nRecoge símbolos nocturnos y los traduce a guía diurna.\nTeje puentes entre subconsciente y realidad tangible.\nRiesgo: perderse en visiones y descuidar la vigilia.\nSu arte revela deseos latentes listos para manifestarse.\nDefiende la pureza de la imaginación de invasores externos.",
    keywords: ["Onirismo", "Imaginación", "Símbolos", "Psique", "Protección"]
  },
  {
    name: "El Navegante Estelar",
    description: "Surca océanos cósmicos en busca de sabiduría universal.\nLee constelaciones como mapas interiores de evolución.\nSu nave es la intuición calibrada por disciplina científica.\nPeligro: disolverse en la vastedad y olvidar sus raíces.\nTrae a la tierra narrativas que expanden la identidad humana.\nInvita a mirar el cielo para descubrir el propio horizonte.",
    keywords: ["Cosmos", "Exploración", "Intuición", "Ciencia", "Horizontes"]
  },
  {
    name: "La Emisaria de la Sombra",
    description: "Porta el lenguaje de las emociones reprimidas y tabúes.\nSe adentra en lo prohibido para rescatar fragmentos de alma.\nTransforma culpa en aceptación y miedo en autoconocimiento.\nDebe evitar glorificar la oscuridad por mera rebeldía.\nSu presencia integra lo negado con la luz consciente.\nEs catalizadora de sanación profunda y auténtica.",
    keywords: ["Sombra", "Aceptación", "Psicología", "Integración", "Catarsis"]
  },
  {
    name: "El Forjador de Comunidades",
    description: "Une voluntades dispersas alrededor de un propósito elevado.\nDiseña estructuras colaborativas resilientes al conflicto.\nEscucha, media y convierte fricción en sinergia creativa.\nRiesgo: sacrificar autenticidad personal por cohesión grupal.\nSu labor revela que la verdadera fortaleza es colectiva.\nErige espacios donde florece la cooperación consciente.",
    keywords: ["Colectivo", "Liderazgo", "Colaboración", "Sinergia", "Tribu"]
  },
  {
    name: "La Sembradora de Ideas",
    description: "Esparce semillas conceptuales en terrenos de mente fértil.\nAlienta la germinación de perspectivas no convencionales.\nNutre debates con preguntas que destilan posibilidades.\nDebe cuidar de no confundir cantidad con profundidad.\nSu cosecha son movimientos culturales que transforman eras.\nDonde pasa, brotan visiones que antes eran impensables.",
    keywords: ["Inspiración", "Innovación", "Cultivo", "Debate", "Cambio"]
  },
  {
    name: "El Cronista Eterno",
    description: "Memorista que hilvana historias para preservar lecciones vitales.\nLee el pulso del tiempo y captura su esencia perdurable.\nSus relatos transmiten memoria colectiva a generaciones futuras.\nPeligro: confundir la objetividad con la nostalgia idealizada.\nSu pluma es puente entre pasado vivido y porvenir consciente.\nHace de la historia un espejo y una antorcha simultáneamente.",
    keywords: ["Historia", "Memoria", "Narrativa", "Sabiduría", "Legado"]
  },
  {
    name: "La Danza del Vacío",
    description: "Entidad que abraza la nada fértil como matriz de toda forma.\nSu movimiento enseña a fluir con la impermanencia absoluta.\nDisuelve apegos para que surja la creatividad espontánea.\nDebe evitar convertir el desapego en indiferencia fría.\nEs coreografía de la ausencia que revela presencia pura.\nInvita a hallarse al dejar de aferrarse.",
    keywords: ["Impermanencia", "Fluidez", "Detachment", "Creatividad", "Zen"]
  },
  {
    name: "El Arquitecto de Puentes",
    description: "Constructor de enlaces entre mundos, culturas e ideologías.\nVe similitudes donde la mayoría percibe barreras rígidas.\nDiseña diálogos que permiten la circulación de la empatía.\nRiesgo: sobreextender puentes y diluir identidades únicas.\nSu obra demuestra que la diversidad puede sostenerse en equilibrio.\nCada puente eleva la comprensión mutua del tejido humano.",
    keywords: ["Conexión", "Diálogo", "Empatía", "Inclusión", "Diplomacia"]
  },
  {
    name: "La Heredera del Silencio",
    description: "Guardián vital de la quietud que engendra claridad interior.\nPractica el arte de escuchar lo que yace bajo el ruido.\nEn su presencia, las voces dispersas se aquietan y alinean.\nPeligro: aislarse tanto que olvide compartir su tesoro.\nRevela que todo nace y retorna al espacio del silencio.\nSu legado es la pausa que posibilita la conciencia.",
    keywords: ["Quietud", "Meditación", "Escucha", "Claridad", "Contemplación"]
  },
    {
    name: "El Guardabosques Astral",
    description: "Custodio de senderos entre galaxias y selvas interiores.\nRastrea huellas de vida donde otros solo ven vacío estelar.\nDomina la brújula del instinto y el sextante de la razón.\nPeligro: extraviarse en la vastedad sin regresar con su hallazgo.\nSu arco dispara semillas estelares que germinan mundos posibles.\nRecuerda que la conservación también es exploración consciente.",
    keywords: ["Exploración", "Guardianía", "Naturaleza", "Cosmos", "Equilibrio"]
  },
  {
    name: "La Hechicera de Brumas",
    description: "Teje neblinas que revelan la verdad mediante el misterio.\nEn sus velos se ocultan símbolos que solo el valiente descifra.\nSu magia disuelve certezas para alumbrar nuevos paradigmas.\nDebe evitar que el secreto se convierta en confusión estéril.\nInvita a cruzar umbrales donde la lógica se convierte en poema.\nSu bruma muestra que la claridad puede nacer de la penumbra.",
    keywords: ["Misterio", "Velos", "Revelación", "Intuición", "Paradoja"]
  },
  {
    name: "El Ingeniero de Ritmos",
    description: "Sincroniza latidos humanos con pulsos tecnológicos.\nDiseña algoritmos que laten como corazones digitales.\nConvierte el caos de datos en sinfonías de productividad.\nRiesgo: convertir la cadencia viva en metrónomo tiránico.\nSu metralla sonora equilibra eficiencia con humanidad.\nDemuestra que el tempo adecuado libera el potencial colectivo.",
    keywords: ["Sincronía", "Tecnología", "Música", "Flujo", "Eficiencia"]
  },
  {
    name: "La Pastora de Relámpagos",
    description: "Conduce tormentas de inspiración hacia tierras sedientas.\nRecolecta chispas creativas antes de que se pierdan en el ruido.\nDomestica la energía cruda sin apagar su ferocidad.\nPeligro: electrocutarse en su propia corriente de ideas.\nSu cayado es pararrayos que canaliza visiones inminentes.\nDonde truena su palabra, florece la chispa del génesis.",
    keywords: ["Energía", "Inspiración", "Tormenta", "Catalizador", "Creatividad"]
  },
  {
    name: "El Crononauta Retroactivo",
    description: "Viajero que reescribe líneas temporales con pincel de memoria.\nInterviene microdecisiones para redirigir macrodestinos.\nSu bitácora es un palimpsesto donde pasado y futuro dialogan.\nDebe evitar la arrogancia de alterar nudos vitales ajenos.\nMuestra que sanar ayer es diseñar mañana con maestría.\nSu viaje enseña a honrar cada instante como nodo sagrado.",
    keywords: ["Tiempo", "Retrocausalidad", "Sanación", "Destino", "Historia"]
  },
  {
    name: "La Custodia de Voces Ancestrales",
    description: "Porta el eco de sabidurías que el polvo casi sepultó.\nTraduce lenguas olvidadas a urgencias presentes.\nLevanta altares de memoria en plazas de modernidad vertiginosa.\nRiesgo: quedar atrapada en glorificación de un pasado idealizado.\nSu canto convoca la raíces para sostener nuevos tallos.\nDemuestra que la tradición viva es puente, no cadena.",
    keywords: ["Sabiduría", "Tradición", "Memoria", "Traducción", "Raíces"]
  },
  {
    name: "El Sismógrafo Emocional",
    description: "Detecta microtemblores afectivos antes de la gran sacudida.\nGrafica vibraciones internas para prevenir fracturas relacionales.\nSu sensibilidad es antena que capta ondas imperceptibles.\nPeligro: sobrecarga sensorial al absorber seísmos ajenos.\nOfrece alertas tempranas que transforman crisis en ajuste.\nPrueba que reconocer la grieta evita la catástrofe del alma.",
    keywords: ["Sensibilidad", "Prevención", "Empatía", "Alerta", "Equilibrio"]
  },
  {
    name: "La Alfarera de Mundos",
    description: "Modela universos de arcilla conceptual entre sus manos.\nSu torno gira con narrativas que dan forma a la experiencia.\nCada vaso que crea contiene océanos simbólicos.\nDebe evitar cuartear la obra con prisas de exhibición.\nSu taller demuestra que imaginar es también encarnar.\nEn sus vasijas, la ficción se vuelve hogar habitable.",
    keywords: ["Creación", "Narrativa", "Diseño", "Imaginación", "Encarnación"]
  },
  {
    name: "El Cartógrafo de Fractales",
    description: "Traza mapas donde lo micro y lo macro reflejan la misma lógica.\nDescubre patrones recurrentes en sistemas aparentemente caóticos.\nSu pluma recorre espirales que conectan átomo y galaxia.\nRiesgo: naufragar en la abstracción y perder lo concreto.\nSu obra revela que el detalle contiene la arquitectura total.\nInvita a leer el infinito en la curva de una hoja.",
    keywords: ["Fractales", "Patrones", "Matemática", "Sistemas", "Conexión"]
  },
  {
    name: "La Custodia del Vacío Creativo",
    description: "Habita el intervalo entre inspiración y manifestación.\nProtege el silencio fértil donde germina la idea no nacida.\nSabe que toda forma surge primero como espacio disponible.\nDebe evitar que el miedo al vacío paralice la gestación.\nSu guardia asegura que las musas encuentren un lienzo limpio.\nEnseña que nada es la cuna de cualquier cosa posible.",
    keywords: ["Vacío", "Potencial", "Silencio", "Gestación", "Manifestación"]
  },
];

// Configuración para evitar repeticiones frecuentes
const RECENT_LIMIT = 3;

// ── 2. UTILIDADES ───────────────────────────────────────────
const randomArchetype = (recent) => {
  const pool = ARQUETIPOS.filter((a) => !recent.includes(a.name));
  // Si el pool queda vacío (pocos arquetipos), reiniciamos la lista reciente
  const fallbackPool = pool.length ? pool : ARQUETIPOS;
  return fallbackPool[Math.floor(Math.random() * fallbackPool.length)];
};

const downloadText = (filename, content) => {
  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

// ── 3. COMPONENTE PRINCIPAL ─────────────────────────────────
const ArchetypeGenerator = () => {
  const [archetype, setArchetype] = useState(ARQUETIPOS[0]);
  const [recent, setRecent] = useState([]);

  // Generar sin repetir los últimos RECENT_LIMIT
  const generate = useCallback(() => {
    const next = randomArchetype(recent);
    setArchetype(next);
    setRecent((prev) => {
      const updated = [next.name, ...prev];
      return updated.slice(0, RECENT_LIMIT);
    });
    toast({ title: "Nuevo Arquetipo", description: next.name });
  }, [recent]);

  // Descargar
  const downloadCurrent = useCallback(() => {
    const filename = `${archetype.name.replace(/\s+/g, "_")}.txt`;
    const content = `Arquetipo: ${archetype.name}\n\nDescripción:\n${archetype.description}\n\nPalabras clave:\n${archetype.keywords.join(", ")}`;
    downloadText(filename, content);
    toast({ title: "Arquetipo descargado" });
  }, [archetype]);

  // Copiar al portapapeles con manejo de errores
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(
        `${archetype.name} — ${archetype.description} | ${archetype.keywords.join(", ")}`
      );
      toast({ title: "Copiado al portapapeles" });
    } catch (err) {
      console.error(err);
      toast({
        title: "No se pudo copiar",
        description: "Tu navegador bloqueó el acceso al portapapeles.",
        variant: "destructive",
      });
    }
  }, [archetype]);

  // Validación de datos por si falta algún campo
  const isValid = useMemo(() => {
    return (
      Boolean(archetype.name) &&
      Boolean(archetype.description) &&
      Array.isArray(archetype.keywords) &&
      archetype.keywords.length > 0
    );
  }, [archetype]);

  // Palabras clave memoizadas
  const keywordsMemo = useMemo(
    () =>
      archetype.keywords.map((k) => (
        <span
          key={k}
          className="px-3 py-1 bg-primary/20 text-primary text-xs rounded-full border border-primary/30"
        >
          {k}
        </span>
      )),
    [archetype.keywords]
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-full flex flex-col items-center p-6"
    >
      {/* Header */}
      <header className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-primary flex items-center justify-center gap-3">
          <Users className="w-8 h-8" /> Generador de Arquetipos
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Explora patrones universales y profundiza en la narrativa personal o colectiva.
        </p>
      </header>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.section
          key={archetype.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-4xl p-22 border border-primary/50 rounded-2xl bg-background/40 shadow-xl shadow-primary/10"
        >
          {isValid ? (
            <>
              <h3 className="text-2xl font-bold text-primary text-center mb-3">
                {archetype.name}
              </h3>
              <p className="text-muted-foreground italic text-center mb-6 leading-relaxed">
                {archetype.description}
              </p>

              <div className="mb-8">
                <h4 className="text-sm font-semibold text-primary mb-2 text-center">
                  Palabras clave
                </h4>
                <div className="flex flex-wrap justify-center gap-2">
                  {keywordsMemo}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-4 text-center py-10">
              <AlertTriangle className="w-8 h-8 text-warning" />
              <p className="text-warning font-medium">
                Este arquetipo tiene datos incompletos.
              </p>
            </div>
          )}

          {/* Buttons */}
          <div className="grid gap-4 sm:grid-cols-3 mt-8">
            <Button onClick={generate} className="w-full flex gap-2">
              <Shuffle className="w-4" /> Nuevo
            </Button>
            <Button
              variant="secondary"
              onClick={downloadCurrent}
              className="w-full flex gap-2"
            >
              <Download className="w-4" /> Descargar
            </Button>
            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="w-full flex gap-2"
            >
              <ClipboardCopy className="w-4" /> Copiar
            </Button>
          </div>
        </motion.section>
      </AnimatePresence>

      {/* Footer */}
      <p className="mt-10 text-sm text-muted-foreground text-center max-w-lg">
        Usa los arquetipos para inspirar personajes, iluminar procesos creativos o
        profundizar en tu exploración psicológica.
      </p>
    </motion.div>
  );
};

export default ArchetypeGenerator;
