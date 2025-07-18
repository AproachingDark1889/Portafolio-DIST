import iching from '../data/iching.json';
import tarot from '../data/tarot.json';
import runes from '../data/runes.json';
import dreams from '../data/dreams.json';

// Función de hash simple para generar un número a partir de una cadena
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// Función para seleccionar un elemento del array basado en el hash
function selectItem(array, query) {
  const index = hashString(query) % array.length;
  return array[index];
}

// Función para seleccionar múltiples elementos únicos
function selectMultipleItems(array, query, count = 3) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const modifiedQuery = query + i.toString();
    const item = selectItem(array, modifiedQuery);
    if (!items.find(existing => existing.id === item.id)) {
      items.push(item);
    } else {
      // Si hay duplicado, tomar el siguiente
      const nextIndex = (hashString(modifiedQuery) + 1) % array.length;
      items.push(array[nextIndex]);
    }
  }
  return items;
}

// Generadores de respuestas para cada oráculo
export function generateIChingResponse(query) {
  const hexagram = selectItem(iching, query);
  
  return `☯ **${hexagram.name}**
${hexagram.trigram}

**Mensaje del I Ching:**
${hexagram.message}

**Elemento:** ${hexagram.element}

*La sincronicidad ha elegido este hexagrama específicamente para tu situación. Medita sobre su significado y cómo se relaciona con tu pregunta.*`;
}

export function generateTarotResponse(query) {
  const cards = selectMultipleItems(tarot, query, 3);
  const [past, present, future] = cards;
  
  return `🔮 **Lectura de Tarot Cuántico - Pasado, Presente y Futuro**

**🌅 PASADO - ${past.name}**
${past.message}
*Palabras clave: ${past.keywords.join(', ')}*

**☀️ PRESENTE - ${present.name}**
${present.message}
*Palabras clave: ${present.keywords.join(', ')}*

**🌙 FUTURO - ${future.name}**
${future.message}
*Palabras clave: ${future.keywords.join(', ')}*

*Las cartas revelan el flujo energético de tu situación a través del tiempo. Cada carta ofrece una perspectiva cuántica sobre las posibilidades que se despliegan.*`;
}

export function generateRunesResponse(query) {
  const selectedRunes = selectMultipleItems(runes, query, 2);
  const [primary, secondary] = selectedRunes;
  
  return `ᚱ **Consulta de Runas Nórdicas Algorítmicas**

**🔮 RUNA PRINCIPAL - ${primary.name}**
${primary.message}

*Significado: ${primary.meaning}*
*Elemento: ${primary.element}*
*Palabras clave: ${primary.keywords.join(', ')}*

**⚡ RUNA COMPLEMENTARIA - ${secondary.name}**
${secondary.message}

*Significado: ${secondary.meaning}*
*Elemento: ${secondary.element}*
*Palabras clave: ${secondary.keywords.join(', ')}*

*Las runas ancestrales hablan a través del algoritmo cósmico. La combinación de estas dos runas ofrece una guía completa para tu situación.*`;
}

export function generateDreamsResponse(query) {
  // Buscar por palabras clave en la consulta
  const queryLower = query.toLowerCase();
  let dreamSymbol = dreams.find(d => queryLower.includes(d.keyword.toLowerCase()));
  
  // Si no se encuentra una palabra clave específica, usar hash
  if (!dreamSymbol) {
    dreamSymbol = selectItem(dreams, query);
  }
  
  // Seleccionar un símbolo adicional para contexto
  const additionalSymbol = selectItem(dreams, query + 'secondary');
  
  return `💤 **Interpretación de Sueños Lúcidos Asistido por IA**

**${dreamSymbol.symbol} SÍMBOLO PRINCIPAL: ${dreamSymbol.keyword.toUpperCase()}**
${dreamSymbol.message}

*Interpretación: ${dreamSymbol.interpretation}*

**${additionalSymbol.symbol} SÍMBOLO COMPLEMENTARIO: ${additionalSymbol.keyword.toUpperCase()}**
${additionalSymbol.message}

*Interpretación: ${additionalSymbol.interpretation}*

**🧠 Análisis IA:**
La combinación de estos símbolos en tu consulta sugiere un patrón de significado profundo. Los sueños son el lenguaje del inconsciente, y estos símbolos emergen para ofrecerte perspectivas sobre aspectos de tu vida que requieren atención consciente.

*Consejo para el sueño lúcido: Antes de dormir, repite la intención de reconocer estos símbolos si aparecen en tus sueños.*`;
}

// Función auxiliar para obtener información adicional sobre un oráculo
export function getOracleInfo(oracleType) {
  const oracleInfo = {
    'iching': {
      description: 'El I Ching es un sistema milenario de sabiduría china que revela patrones de cambio y armonía universal.',
      usage: 'Ideal para decisiones importantes y comprensión de ciclos vitales.'
    },
    'tarot': {
      description: 'El Tarot Cuántico combina arquetipos universales con principios de sincronicidad.',
      usage: 'Perfecto para explorar pasado, presente y futuro de una situación.'
    },
    'runes': {
      description: 'Las Runas Nórdicas canalizan la sabiduría ancestral a través de algoritmos modernos.',
      usage: 'Excelente para obtener guía práctica y fuerza interior.'
    },
    'dreams': {
      description: 'La interpretación de sueños asistida por IA descifra el lenguaje del inconsciente.',
      usage: 'Útil para comprender símbolos oníricos y mensajes del subconsciente.'
    }
  };
  
  return oracleInfo[oracleType] || null;
}
