import{r as u,j as s,m as y,Z as j,H as v,t as d}from"./index-5e49871b.js";import{d as p,i as N,t as C,r as $,I,R}from"./dreams-b627a236.js";function g(e){let r=0;for(let a=0;a<e.length;a++)r=e.charCodeAt(a)+((r<<5)-r);return Math.abs(r)}function m(e,r){const a=g(r)%e.length;return e[a]}function f(e,r,a=3){const t=[];for(let o=0;o<a;o++){const i=r+o.toString(),c=m(e,i);if(!t.find(l=>l.id===c.id))t.push(c);else{const l=(g(i)+1)%e.length;t.push(e[l])}}return t}function w(e){const r=m(N,e);return`☯ **${r.name}**
${r.trigram}

**Mensaje del I Ching:**
${r.message}

**Elemento:** ${r.element}

*La sincronicidad ha elegido este hexagrama específicamente para tu situación. Medita sobre su significado y cómo se relaciona con tu pregunta.*`}function L(e){const r=f(C,e,3),[a,t,o]=r;return`🔮 **Lectura de Tarot Cuántico - Pasado, Presente y Futuro**

**🌅 PASADO - ${a.name}**
${a.message}
*Palabras clave: ${a.keywords.join(", ")}*

**☀️ PRESENTE - ${t.name}**
${t.message}
*Palabras clave: ${t.keywords.join(", ")}*

**🌙 FUTURO - ${o.name}**
${o.message}
*Palabras clave: ${o.keywords.join(", ")}*

*Las cartas revelan el flujo energético de tu situación a través del tiempo. Cada carta ofrece una perspectiva cuántica sobre las posibilidades que se despliegan.*`}function O(e){const r=f($,e,2),[a,t]=r;return`ᚱ **Consulta de Runas Nórdicas Algorítmicas**

**🔮 RUNA PRINCIPAL - ${a.name}**
${a.message}

*Significado: ${a.meaning}*
*Elemento: ${a.element}*
*Palabras clave: ${a.keywords.join(", ")}*

**⚡ RUNA COMPLEMENTARIA - ${t.name}**
${t.message}

*Significado: ${t.meaning}*
*Elemento: ${t.element}*
*Palabras clave: ${t.keywords.join(", ")}*

*Las runas ancestrales hablan a través del algoritmo cósmico. La combinación de estas dos runas ofrece una guía completa para tu situación.*`}function A(e){const r=e.toLowerCase();let a=p.find(o=>r.includes(o.keyword.toLowerCase()));a||(a=m(p,e));const t=m(p,e+"secondary");return`💤 **Interpretación de Sueños Lúcidos Asistido por IA**

**${a.symbol} SÍMBOLO PRINCIPAL: ${a.keyword.toUpperCase()}**
${a.message}

*Interpretación: ${a.interpretation}*

**${t.symbol} SÍMBOLO COMPLEMENTARIO: ${t.keyword.toUpperCase()}**
${t.message}

*Interpretación: ${t.interpretation}*

**🧠 Análisis IA:**
La combinación de estos símbolos en tu consulta sugiere un patrón de significado profundo. Los sueños son el lenguaje del inconsciente, y estos símbolos emergen para ofrecerte perspectivas sobre aspectos de tu vida que requieren atención consciente.

*Consejo para el sueño lúcido: Antes de dormir, repite la intención de reconocer estos símbolos si aparecen en tus sueños.*`}function S(e){return{iching:{description:"El I Ching es un sistema milenario de sabiduría china que revela patrones de cambio y armonía universal.",usage:"Ideal para decisiones importantes y comprensión de ciclos vitales."},tarot:{description:"El Tarot Cuántico combina arquetipos universales con principios de sincronicidad.",usage:"Perfecto para explorar pasado, presente y futuro de una situación."},runes:{description:"Las Runas Nórdicas canalizan la sabiduría ancestral a través de algoritmos modernos.",usage:"Excelente para obtener guía práctica y fuerza interior."},dreams:{description:"La interpretación de sueños asistida por IA descifra el lenguaje del inconsciente.",usage:"Útil para comprender símbolos oníricos y mensajes del subconsciente."}}[e]||null}const x=[{name:"Oráculo de I Ching Simbiótico",generator:w,type:"iching",icon:"☯",description:"Sabiduría milenaria china para decisiones importantes"},{name:"Oráculo de Tarot Cuántico",generator:L,type:"tarot",icon:"🔮",description:"Arquetipos universales en lectura temporal"},{name:"Oráculo de Runas Nórdicas Algorítmicas",generator:O,type:"runes",icon:"ᚱ",description:"Sabiduría nórdica ancestral algorítmica"},{name:"Oráculo de Sueños Lúcidos Asistido por IA",generator:A,type:"dreams",icon:"💤",description:"Interpretación AI de símbolos oníricos"}],k=()=>{const[e,r]=u.useState(x[0]),[a,t]=u.useState(""),[o,i]=u.useState(""),[c,l]=u.useState(!1),b=async()=>{if(!a.trim()){d({title:"Consulta Vacía",description:"Por favor, ingresa tu pregunta o situación.",variant:"destructive"});return}l(!0),i(""),await new Promise(n=>setTimeout(n,1200));try{const n=e.generator(a);i(n),d({title:"Consulta Respondida",description:`${e.icon} ${e.name} ha revelado su sabiduría.`})}catch{i("Ha ocurrido un error al consultar el oráculo. Por favor, intenta nuevamente."),d({title:"Error en la Consulta",description:"No se pudo procesar tu consulta.",variant:"destructive"})}finally{l(!1)}},h=()=>{t(""),i(""),r(x[0]),d({title:"Oráculo Reiniciado"})};return s.jsxs(y.div,{initial:{opacity:0},animate:{opacity:1},transition:{duration:.5},className:"p-4 h-full flex flex-col",children:[s.jsxs("header",{className:"mb-8 text-center",children:[s.jsxs("h2",{className:"text-3xl font-bold text-primary text-glow flex items-center justify-center",children:[s.jsx(j,{className:"w-8 h-8 mr-3"})," Oráculos de Pensamiento"]}),s.jsx("p",{className:"text-muted-foreground",children:"Consulta sistemas de sabiduría ancestral potenciados por algoritmos modernos."})]}),s.jsxs("div",{className:"grid lg:grid-cols-3 gap-6 flex-grow",children:[s.jsxs("div",{className:"lg:col-span-1 p-6 border border-primary/50 rounded-lg bg-background/30 flex flex-col",children:[s.jsx("h3",{className:"text-xl font-semibold text-primary mb-4",children:"Selecciona un Oráculo"}),s.jsx("div",{className:"space-y-3 mb-6",children:x.map(n=>s.jsxs("button",{onClick:()=>r(n),className:`w-full p-3 text-left text-sm rounded-md transition-colors border
                  ${e.name===n.name?"bg-primary/20 text-primary border-primary":"bg-input hover:bg-primary/10 border-primary/40 text-muted-foreground hover:text-foreground"}`,children:[s.jsxs("div",{className:"flex items-center gap-2 mb-1",children:[s.jsx("span",{className:"text-lg",children:n.icon}),s.jsx("span",{className:"font-medium",children:n.name})]}),s.jsx("p",{className:"text-xs opacity-75",children:n.description})]},n.name))}),s.jsxs("div",{className:"mt-auto p-3 border border-dashed border-primary/30 rounded-md bg-input text-xs text-muted-foreground",children:[s.jsx(v,{className:"w-4 h-4 inline mr-1 text-primary/70"}),"Los oráculos combinan sabiduría ancestral con algoritmos deterministas. Cada respuesta es única para tu consulta específica."]})]}),s.jsxs("div",{className:"lg:col-span-2 p-6 border border-primary/50 rounded-lg bg-background/30 flex flex-col",children:[s.jsxs("div",{className:"flex items-center justify-between mb-2",children:[s.jsxs("h3",{className:"text-xl font-semibold text-primary",children:[e.icon," Tu Consulta para ",e.name]}),s.jsx("button",{onClick:()=>{const n=S(e.type);n&&d({title:"Información del Oráculo",description:n.description+" "+n.usage})},className:"p-2 text-muted-foreground hover:text-primary transition-colors",title:"Información sobre este oráculo",children:s.jsx(I,{className:"w-4 h-4"})})]}),s.jsx("textarea",{value:a,onChange:n=>t(n.target.value),className:"w-full h-32 p-3 bg-input border border-primary/50 rounded-md text-foreground placeholder-muted-foreground focus:ring-primary focus:border-primary resize-none text-sm mb-4",placeholder:"Escribe tu pregunta o describe la situación aquí..."}),s.jsxs("div",{className:"flex gap-3 mb-6",children:[s.jsxs("button",{onClick:b,disabled:c,className:"flex-1 px-6 py-3 bg-primary text-primary-foreground hover:bg-primary/80 text-sm rounded-md transition-colors flex items-center justify-center disabled:opacity-50",children:[s.jsx("span",{className:"mr-2",children:e.icon}),c?"Consultando...":`Consultar ${e.type==="iching"?"I Ching":e.type==="tarot"?"Tarot":e.type==="runes"?"Runas":"Sueños"}`]}),s.jsx("button",{onClick:h,title:"Reiniciar Oráculo",className:"px-4 py-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm rounded-md transition-colors flex items-center justify-center",children:s.jsx(R,{className:"w-5 h-5"})})]}),s.jsxs("h3",{className:"text-xl font-semibold text-primary mb-2",children:[e.icon," Respuesta del ",e.name]}),s.jsxs("div",{className:"flex-grow p-4 border border-primary/50 rounded-lg bg-input text-sm text-foreground overflow-y-auto min-h-[200px] whitespace-pre-wrap",children:[c&&s.jsx("div",{className:"flex items-center justify-center h-full",children:s.jsxs("div",{className:"text-center",children:[s.jsx("div",{className:"text-2xl mb-2",children:e.icon}),s.jsxs("p",{className:"italic text-muted-foreground",children:[e.type==="iching"&&"Las fuerzas del universo están alineándose...",e.type==="tarot"&&"Las cartas cuánticas se están manifestando...",e.type==="runes"&&"Los ancestros nórdicos susurran sabiduría...",e.type==="dreams"&&"El inconsciente está procesando símbolos..."]})]})}),o||!c&&s.jsx("div",{className:"text-center text-muted-foreground h-full flex items-center justify-center",children:s.jsxs("div",{children:[s.jsx("div",{className:"text-3xl mb-3",children:e.icon}),s.jsxs("p",{children:["La sabiduría del ",e.name," se manifestará aquí."]}),s.jsx("p",{className:"text-xs mt-2 opacity-75",children:e.description})]})})]})]})]})]})};export{k as default};
