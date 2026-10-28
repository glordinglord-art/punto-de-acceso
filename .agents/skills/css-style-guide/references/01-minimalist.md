**GUÍA DE ESTILOS CSS**

**Estilos Minimalistas**

Familia I de XI — 5 estilos documentados

Guía de referencia para generación automática de CSS basada en identidad de marca y estilo visual. Cada estilo incluye: filosofía, paleta de color, tipografía, espaciado, animaciones, componentes, variables CSS y anti-patrones.

**Estilos incluidos:** 01 Minimalism · 02 Flat Design · 03 Swiss / International Style · 04 Functional Minimalism · 05 Whitespace-First

**01**  **Minimalism**

*«Menos es más» — La depuración como forma de comunicación*

| Familia | Estilos Minimalistas |
| :---- | :---- |
| **Índice** | 01 / 05 |
| **Filosofía** | Eliminar todo lo que no cumple función, hasta que lo que queda es exactamente suficiente |
| **Referentes** | Dieter Rams, Apple (2007-2015), Muji, Medium, Linear.app |
| **Emoción objetivo** | Claridad, confianza, foco, serenidad |

## **Filosofía y Principios Fundamentales**

El minimalismo no es ausencia de elementos, sino presencia de los elementos correctos. Cada decisión de diseño parte de la pregunta: ¿esto sirve al usuario o sirve al diseñador?

### **Los 10 principios de diseño de Dieter Rams aplicados a web**

* Bueno el diseño es innovador — no sigue tendencias, las trasciende

* Bueno el diseño hace útil un producto — cada componente debe justificar su existencia

* Bueno el diseño es estético — la belleza emerge de la función, no se impone

* Bueno el diseño hace comprensible un producto — la interfaz se explica sola

* Bueno el diseño es discreto — no compite con el contenido

* Bueno el diseño es honesto — no promete lo que no entrega

* Bueno el diseño es duradero — no envejece con las modas

* Bueno el diseño es consecuente hasta el último detalle — nada al azar

* Bueno el diseño es respetuoso con el medio ambiente — código limpio, carga rápida

* Bueno el diseño es lo menos diseño posible — simplicidad como destino final

### **Reglas de decisión de diseño**

* Si un elemento puede eliminarse sin pérdida de comprensión → eliminar

* Si dos elementos pueden fusionarse → fusionar

* Si un color puede reemplazarse por espacio → usar espacio

* Si una animación no comunica estado → quitarla

* Si el usuario tiene que buscar cómo usar algo → rediseñar

## **Paleta de Color**

### **Estructura de la paleta**

* 1 color neutro dominante (blanco \#FFFFFF o gris muy claro \#F8F8F8) — ocupa 60-70% del espacio

* 1 color oscuro principal para texto (\#0A0A0A, \#111111, o negro puro) — 25-30%

* 1 acento o ninguno — si existe, completamente saturado y usado con extrema moderación (\<5%)

* Ausencia total de gradientes en fondos y botones principales

* Transparencias solo para sombras sutiles (max-opacity 0.08)

| Token | Valor recomendado | Uso |
| :---- | :---- | :---- |
| \--color-bg | \#FFFFFF / \#FAFAFA | Fondo base de toda la página |
| \--color-surface | \#F5F5F5 | Cards, paneles secundarios |
| \--color-border | \#E8E8E8 | Separadores, bordes de inputs |
| \--color-text-primary | \#0A0A0A | Títulos, texto principal |
| \--color-text-secondary | \#666666 | Subtítulos, metadata |
| \--color-text-tertiary | \#AAAAAA | Placeholders, hints |
| \--color-accent | 1 color puro | CTAs, links activos, estados focus |

### **Reglas de color**

* NUNCA más de 3 colores en una misma vista

* El color de acento aparece máximo 2-3 veces por pantalla

* Los estados de hover se resuelven con opacidad o escala, no con nuevos colores

* El color nunca es el único diferenciador de información (accesibilidad)

* Los iconos usan el mismo color que el texto que acompañan

## **Tipografía**

### **Selección de fuentes**

* Máximo 2 familias tipográficas en todo el sistema

* Preferencia por sans-serif geométrico o humanista de alta legibilidad

* Fuentes recomendadas: Inter, DM Sans, Söhne, Graphik, GT Walsheim, Helvetica Neue

* Fuente display (títulos grandes): puede ser serif para contraste — Tiempos, Freight Display, Canela

* Monospace solo para código: JetBrains Mono, Fira Code

* NUNCA: Comic Sans, Papyrus, fuentes decorativas sin propósito claro

| Nivel | Tamaño | Peso | Line-height | Letter-spacing |
| :---- | :---- | :---- | :---- | :---- |
| Display / Hero | 56-96px | 300-400 | 1.05 | \-0.03em |
| H1 | 40-48px | 600-700 | 1.1 | \-0.02em |
| H2 | 28-34px | 600 | 1.2 | \-0.01em |
| H3 | 20-24px | 600 | 1.3 | 0 |
| Body large | 18px | 400 | 1.65 | 0 |
| Body base | 16px | 400 | 1.6 | 0 |
| Body small | 14px | 400 | 1.55 | 0.01em |
| Caption / Label | 11-12px | 500-600 | 1.4 | 0.08em |

### **Reglas tipográficas**

* Columnas de texto: max-width 65-72 caracteres (640-680px para body 16px)

* Nunca justificar texto en interfaces web (solo left-align o center para títulos cortos)

* Contraste mínimo: 4.5:1 para body, 3:1 para texto grande (WCAG AA)

* Spacing entre párrafos: 1.5x el tamaño de fuente como mínimo

* Los labels de formulario van SOBRE el campo, nunca dentro como placeholder permanente

* Versalitas (small caps) para labels y etiquetas de categoría — letter-spacing: 0.08em

## **Espaciado y Composición**

### **Sistema de espaciado (base 4px)**

* Escala: 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 / 96 / 128 / 192 / 256px

* Padding interno de componentes: múltiplo de 8 siempre

* El espaciado entre secciones narrativas: mínimo 96px

* Márgenes laterales en desktop: mínimo 64px, recomendado 80-120px

* Content max-width: 1200px para layouts anchos, 720px para contenido editorial

### **El espacio en blanco como elemento de diseño**

* El whitespace no es vacío — es el respiro que le da peso a lo que existe

* Aumentar espacio entre secciones \= aumentar importancia del contenido siguiente

* Aislar un elemento con espacio \= jerarquizarlo sin usar tamaño ni color

* Espacio asimétrico intencional crea tensión visual positiva

* Regla: si la página se siente 'llena', quitar elementos antes de reducir espacio

### **Grid y layout**

* Grid de 12 columnas con gutter de 24-32px

* Columnas de contenido: 8 cols (desktop), 6 cols (tablet), 4 cols (mobile)

* Alineación consistente: todo tiene un punto de anclaje en la grilla

* Asimetría solo cuando es intencional y controlada

* Evitar centrar todo — la alineación a la izquierda es más legible y profesional

## **Animaciones y Motion**

### **Filosofía de movimiento minimalista**

* Las animaciones comunican estado, no decoran

* Duración base: 150-200ms para micro-interacciones, 300-400ms para transiciones de estado

* Easing preferido: ease-out para elementos que aparecen, ease-in para los que desaparecen

* NUNCA: bouncing, spring exagerado, rotaciones innecesarias, partículas decorativas

* Toda animación debe poder desactivarse con prefers-reduced-motion

| Tipo de animación | Duración | CSS recomendado |
| :---- | :---- | :---- |
| Hover de botón | 150ms | opacity \+ transform scale(0.98) |
| Focus outline | 100ms | outline-offset \+ box-shadow |
| Fade in de página | 300ms | opacity 0→1, ease-out |
| Slide up de card | 350ms | translateY(16px)→0 \+ opacity |
| Transición de ruta | 250ms | opacity fade, sin slide |
| Skeleton loading | 1.5s loop | shimmer lineal, opacity 0.4-0.8 |
| Modal open | 200ms | scale(0.97)→1 \+ opacity, ease-out |
| Tooltip appear | 120ms | opacity \+ translateY(-4px) |
| Input focus border | 150ms | border-color \+ box-shadow sutil |

### **Patrones de entrance animation**

* Hero content: fade-in con delay staggered (título, subtítulo, CTA — 100ms entre cada uno)

* Listas y grids: cada item con animation-delay escalonado de 50-80ms

* Imágenes: fade-in al entrar en viewport (Intersection Observer)

* Contadores y números: count-up animation al hacer visible

* NUNCA animar scroll automático — solo responder al scroll del usuario

## **Componentes UI**

### **Botones**

* Primario: fondo color-acento, texto blanco, border-radius 6-8px, sin sombra

* Secundario: borde 1px color-acento, fondo transparente, texto color-acento

* Ghost/Terciario: solo texto con underline o sin decoración, sin fondo ni borde

* Padding: 12px 24px para medium, 10px 20px para small, 16px 32px para large

* Estado hover: oscurecer fondo 10% o reducir opacidad al 90%

* Estado disabled: opacidad 40%, cursor not-allowed, sin interacción

* NUNCA sombras exageradas, gradientes o efectos brillantes en botones minimalistas

### **Cards y contenedores**

* Fondo: blanco o gris muy claro (\#F8F8F8) sobre fondo de página ligeramente gris

* Borde: 1px solid \#E8E8E8 o sombra muy sutil (box-shadow: 0 1px 3px rgba(0,0,0,0.08))

* Border-radius: 8-12px para cards, 4-6px para chips/tags

* Padding interno: 24-32px para cards de contenido, 16-20px para cards compactas

* Hover: elevar ligeramente (translateY(-2px) \+ sombra \+1 nivel) o subrayar título

* NUNCA: sombras de colores, múltiples bordes, gradientes de fondo

### **Formularios e inputs**

* Input base: fondo blanco, borde 1px \#E8E8E8, border-radius 6px, padding 10px 14px

* Focus: borde azul/acento \+ box-shadow sutil de color accent con 20% opacidad

* Error: borde rojo \+ texto de error abajo en rojo, icono de warning opcional

* Success: borde verde o check icon — no cambiar el background del input

* Label flotante (float label): transform translateY al recibir foco

* Placeholder: color-text-tertiary (\#AAAAAA), desaparece al escribir

* Checkbox y radio: estilizados con CSS, tamaño mínimo 20x20px para accesibilidad táctil

### **Navegación**

* Navbar: blanco o gris muy claro, altura 56-64px, con o sin separador bottom

* Links activos: subrayado, color acento, o indicador lateral (border-left 2px)

* Sin efectos de hover elaborados — solo cambio de color o subrayado

* Mobile nav: slide desde lado o full-screen overlay simplificado

* Sticky header con backdrop-filter: blur(8px) y opacity del fondo — efecto glassmorphism sutil permitido

## **Imágenes y Media**

### **Fotografía**

* Imágenes de alta calidad, bien iluminadas, con paleta coherente con la marca

* Tratamiento de color: levemente desaturadas o con tono monocromático para cohesión

* Evitar imágenes de stock genéricas con personas posando artificialmente

* Fondos de imagen: siempre con overlay si hay texto encima (mínimo 40% opacidad negra)

* Aspect ratios consistentes dentro del mismo contexto: 16:9 para hero, 4:3 para cards

### **Iconografía**

* Sistema de iconos: línea (stroke) o sólido — nunca mezclar ambos en la misma interfaz

* Peso de stroke: 1.5-2px para iconos de línea (coherente con el peso tipográfico)

* Tamaños: 16px para inline, 20-24px para botones, 32-48px para feature icons

* Color: igual al texto que acompaña, nunca colores propios excepto en ilustraciones

* Packs recomendados: Feather Icons, Phosphor Icons, Heroicons, Lucide

### **Ilustraciones**

* Estilo flat o de línea — nunca 3D realista en contextos minimalistas puros

* Paleta limitada: máximo 3-4 colores de la paleta de la marca

* Solo para estados vacíos, errores, y onboarding — no como decoración general

* Si no hay ilustraciones de calidad, usar espacio vacío \+ tipografía — es mejor que ilustraciones mediocres

## **CSS — Propiedades y Variables**

### **Custom Properties base**

* \--spacing-unit: 4px — base del sistema de espaciado

* \--font-sans: 'Inter', 'DM Sans', system-ui, \-apple-system, sans-serif

* \--font-mono: 'JetBrains Mono', 'Fira Code', monospace

* \--transition-fast: 150ms ease-out

* \--transition-base: 250ms ease-out

* \--transition-slow: 400ms ease-out

* \--radius-sm: 4px — chips, badges

* \--radius-md: 8px — botones, inputs, cards

* \--radius-lg: 16px — modales, paneles grandes

* \--shadow-sm: 0 1px 2px rgba(0,0,0,0.06)

* \--shadow-md: 0 4px 12px rgba(0,0,0,0.08)

* \--shadow-lg: 0 16px 32px rgba(0,0,0,0.10)

### **Propiedades CSS modernas a utilizar**

* clamp() para tipografía fluida: font-size: clamp(1rem, 2.5vw, 1.5rem)

* CSS Grid con subgrid para alineación perfecta en layouts complejos

* container queries (@container) para componentes verdaderamente responsivos

* scroll-behavior: smooth \+ scroll-snap para secciones y carousels

* aspect-ratio para imágenes y video sin JavaScript

* :is() y :where() para selectores más limpios y mantenibles

* @layer para organización y cascada predecible del CSS

* gap en flex y grid en lugar de margin entre elementos

### **Accesibilidad CSS**

* focus-visible en lugar de focus para no molestar usuarios de mouse

* prefers-reduced-motion: reduce todas las animaciones a opacity/instant

* prefers-color-scheme: dark para dark mode automático

* Contraste mínimo verificado con herramientas antes de producción

* Tamaño mínimo de targets táctiles: 44x44px (WCAG 2.5.5)

## **Anti-patrones — Qué NUNCA hacer**

* NUNCA usar más de 2 pesos tipográficos en el mismo bloque de contenido

* NUNCA poner sombras sobre sombras (sombra en card \+ sombra en botón dentro de la card)

* NUNCA usar fondos con patrones geométricos o texturas — es el opuesto del minimalismo

* NUNCA centrar todo el contenido — la alineación izquierda es más legible

* NUNCA usar bordes redondeados extremos (border-radius: 50% en rectangulares) sin propósito

* NUNCA mezclar estilos de iconos (line \+ solid \+ outline en la misma pantalla)

* NUNCA poner texto sobre imágenes sin overlay de contraste suficiente

* NUNCA usar animaciones de entrada en más del 30% de los elementos de una vista

* NUNCA decorar con colores lo que se puede resolver con espacio y jerarquía

* NUNCA diseñar para impresionar al cliente — diseñar para que el usuario no piense

**02**  **Flat Design**

*Sin profundidad simulada — La honestidad de las superficies planas*

| Familia | Estilos Minimalistas |
| :---- | :---- |
| **Índice** | 02 / 05 |
| **Filosofía** | Rechazar el skeuomorfismo: las interfaces no deben fingir ser objetos físicos |
| **Referentes** | Windows 8 Metro UI, iOS 7, Google Material (flat fase), Mailchimp 2012-2016 |
| **Emoción objetivo** | Modernidad, claridad, dinamismo contenido, accesibilidad visual |

## **Filosofía y Principios**

### **Origen y contexto**

El Flat Design emerge como reacción directa al skeuomorfismo dominante de los 2000s. Surge de la tradición del diseño suizo y la Bauhaus, y es popularizado por Microsoft Metro UI (2010) y Apple iOS 7 (2013). Su premisa: el diseño digital no debe imitar el mundo físico — debe crear su propio lenguaje visual honesto.

### **Principios fundamentales**

* Honestidad de los materiales digitales: pantallas son planas — el diseño debe serlo

* Colores como comunicadores primarios en ausencia de profundidad

* Formas geométricas simples como vocabulario visual principal

* Tipografía con trabajo pesado en ausencia de ornamentos

* Ningún elemento visual sin función comunicativa

### **Diferencia con Minimalism puro**

* Flat Design acepta color saturado y múltiple — Minimalism prefiere neutrales

* Flat Design usa formas geométricas como elementos decorativos funcionales

* Flat Design tiene mayor densidad visual controlada

* Minimalism busca la depuración absoluta — Flat acepta elementos si son planos

## **Paleta de Color**

### **Características del color flat**

* Colores completamente sólidos — SIN gradientes, sombras de color, o reflejos

* Saturación media-alta: los colores flat son vivos pero no neón

* Paleta extendida: 5-8 colores en total (vs 2-3 del minimalism puro)

* Cada color cumple una función semántica consistente en todo el sistema

* Blanco y negro puros para texto y fondos — no grises suavizados

| Categoría | Rango de tono | Uso típico |
| :---- | :---- | :---- |
| Azul primario | \#2196F3 \- \#1565C0 | CTAs principales, links, acciones primarias |
| Verde éxito | \#4CAF50 \- \#2E7D32 | Confirmaciones, success states, progreso |
| Rojo error | \#F44336 \- \#C62828 | Errores, alertas críticas, destructive actions |
| Amarillo alerta | \#FFC107 \- \#F57F17 | Warnings, pendientes, atención |
| Gris neutro | \#9E9E9E \- \#424242 | Texto secundario, bordes, disabled |
| Fondo claro | \#FAFAFA \- \#F5F5F5 | Superficies principales |
| Fondo oscuro | \#212121 \- \#37474F | Dark mode, headers de énfasis |

### **Reglas de aplicación**

* Un color primario de marca \+ sistema semántico (verde/rojo/amarillo) \+ neutros

* Los colores de fondo de sección crean jerarquía sin necesidad de separadores

* Hover states: usar tono 10-20% más oscuro del mismo color (no opacidad)

* NUNCA mezclar estilos: si un botón es flat, TODOS los botones son flat

* Los iconos adoptan el color del contexto semántico en que aparecen

## **Tipografía**

### **Fuentes para Flat Design**

* Fuentes geométricas son las más coherentes: Futura, Circular, DM Sans, Nunito, Poppins

* Alternativas humanistas: Roboto, Source Sans, Open Sans (iconos de la era flat)

* Pesos: regular (400) y bold (700) — evitar semibold como peso principal

* NUNCA fuentes serif en Flat Design puro — rompen la estética

* Letra capital o display: puede ser extra-bold (800-900) para mayor impacto visual

### **Uso tipográfico específico**

* Títulos de sección: mayúsculas completas con letter-spacing 0.1em para claridad

* Textos sobre fondos de color: siempre blanco o negro según contraste

* Números y datos: monospace o tabular figures para alineación en tablas

* Labels de iconos: siempre presentes — el Flat Design no confía solo en iconos

## **Formas y Elementos Visuales**

### **Geometría como vocabulario**

* Círculos: avatares, indicadores de estado, iconos de acción circular

* Rectángulos: cards, botones, contenedores de contenido

* Cuadrados perfectos: thumbnails, íconos app-style, logos

* Triángulos: indicadores de dirección, tooltips, dropdowns

* Hexágonos y otras formas: solo para diferenciación especial, no aleatoriamente

### **Iconografía flat**

* Iconos completamente sólidos (filled) o de línea gruesa (2px+) — nunca delgados

* Colores de icon: monocromo o con máximo 2 colores dentro del ícono

* Tamaño: 24px base, siempre en múltiplos de 8

* Padding alrededor: siempre igual al tamaño del ícono (ícono 24px \= 24px padding total)

* Los íconos con fondo de color: usar formas geométricas planas como contenedor

### **Ilustraciones flat**

* Personajes y objetos con formas geométricas simplificadas

* Sombras: si existen, son formas planas de color más oscuro del mismo objeto

* Profundidad simulada solo con superposición de capas planas — nunca drop shadows

* Paleta de ilustración \= subconjunto de la paleta de marca

## **Animaciones**

### **Motion en Flat Design**

* Las transiciones son más vivas que en Minimalism puro — colores comunican cambio

* Color transitions: cambio de fondo de color en hover (150ms, ease)

* Ripple effect (influencia Material Design): ondas de color al click en botones

* Icon morphing: transformación de un ícono a otro al cambiar estado (ej: play→pause)

* Progress bars y loaders: animaciones lineales de color plano, sin gradientes

| Animación | Duración | Propósito |
| :---- | :---- | :---- |
| Color fill en hover | 150ms | Feedback visual inmediato |
| Slide de menú mobile | 300ms ease-out | Transición de estado de nav |
| Flip de card | 400ms | Revelar información secundaria |
| Progress de carga | variable, ease | Feedback de proceso |
| Badge count animation | 200ms bounce | Notificaciones nuevas |
| Tab indicator slide | 200ms ease-out | Orientación en navegación |

## **Componentes específicos del Flat Design**

### **Tarjetas (Cards)**

* Fondo de color sólido — pueden ser de color de marca, no solo blanco

* Sin sombras — la separación se logra con color de fondo diferente al contenedor

* Border-radius 0px (versión más purista) o máximo 4px

* Headers de card con banda de color de acento

### **Navegación y tabs**

* Tab activo: cambio de color de fondo completo — sin underline sutil

* Breadcrumbs con separador chevron o slash en color flat

* Sidebar: puede tener fondo de color de marca oscuro con texto blanco

* Hamburger menu: 3 líneas planas del mismo grosor, sin sombra

### **Badges y etiquetas**

* Formas: pill (border-radius total) o cuadrado con corners ligeramente redondeados

* Colores semánticos aplicados directamente: rojo=error, verde=éxito, azul=info

* Texto en blanco sobre fondos de color intenso

* Tamaño de fuente: 11-12px, uppercase, letter-spacing 0.05em

## **Anti-patrones del Flat Design**

* NUNCA añadir box-shadow con blur — rompe la estética plana

* NUNCA usar gradientes en elementos UI (excepto en 'Almost Flat' / Material)

* NUNCA mezclar iconos filled con iconos outline en la misma pantalla

* NUNCA usar imágenes con profundidad exagerada (fotos 3D, renders)

* NUNCA border-radius inconsistente — elegir un radio y aplicarlo sistemáticamente

* NUNCA usar más de 2 familias tipográficas

* NUNCA poner texto sobre fondos de color sin verificar ratio de contraste mínimo 4.5:1

* NUNCA crear la ilusión de botones físicos con sombras y gradientes — eso es skeuomorfismo

**03**  **Swiss / International Style**

*Orden matemático, función suprema — El sistema como belleza*

| Familia | Estilos Minimalistas |
| :---- | :---- |
| **Índice** | 03 / 05 |
| **Filosofía** | La grilla como ley, la tipografía como arquitectura, la función como única ornamentación |
| **Referentes** | Josef Müller-Brockmann, Massimo Vignelli, Neue Grafik, sitio NYC MTA, CERN, Deutsche Bahn |
| **Emoción objetivo** | Autoridad, rigor, confianza institucional, inteligencia fría |

## **Filosofía y Origen**

### **El Estilo Internacional en la web**

Desarrollado en Suiza y Alemania en los años 50-60, el Estilo Internacional (o Swiss Style) establece que el diseño es un problema de organización y comunicación, no de expresión personal. Su aplicación web significa: grillas rígidas, tipografía sans-serif neutral, jerarquía matemática, y fotografía documental. La emoción es irrelevante — la precisión es absoluta.

### **Principios inviolables**

* La grilla es sagrada — nada existe fuera de ella sin razón explícita

* Helvetica (o equivalente) como la tipografía más neutral y universal

* La fotografía documental y objetiva sobre la ilustración decorativa

* La jerarquía visual establecida por tamaño, peso y posición — nunca por color llamativo

* La información se organiza, no se decora

* Lo asimétrico dentro de un sistema simétrico (tensión matemática)

## **Sistema Tipográfico**

### **La tipografía ES el diseño**

* Una sola familia tipográfica es la norma — Helvetica Neue, Akzidenz-Grotesk, Neue Haas Grotesk, Arial (web)

* Múltiples pesos de una misma familia: Thin (100), Light (300), Regular (400), Medium (500), Bold (700)

* Tamaños en escala matemática: 10 / 12 / 14 / 18 / 24 / 36 / 48 / 72 / 96px

* Alineación: izquierda estricta para toda la composición (flush left, ragged right)

* Nunca texto justificado en web — crea ríos blancos que destruyen la legibilidad

### **Letter-spacing y tracking**

* Display (96px+): \-0.04em a \-0.06em (tracking negativo apretado)

* Títulos H1 (48-72px): \-0.02em a \-0.03em

* Texto de cuerpo (16-18px): 0 (sin ajuste)

* Labels y ALL CAPS (10-12px): 0.08em a 0.12em (tracking positivo generoso)

* Subtítulos en versalitas: letter-spacing 0.15em es marca del estilo suizo

### **Jerarquía tipográfica modular**

* Escala tipográfica basada en la proporción 1:1.414 (raíz cuadrada de 2 — proporción áurea suiza)

* Base: 16px → 22.6px → 32px → 45.25px → 64px → 90.5px

* El cuerpo de texto nunca varía de tamaño dentro de un bloque

* Solo la jerarquía de encabezados crea variación — no el estilo ni el color

## **Sistema de Grilla**

### **La grilla modular suiza**

* Grilla de módulos cuadrados como base (módulo \= medida tipográfica base × n)

* 12, 16 o 24 columnas — siempre número divisible por múltiples factores

* Gutter \= 1 módulo de ancho

* Márgenes laterales \= 2-3 módulos

* Los elementos se alinean a la grilla de línea de base (baseline grid)

### **Aplicación web de la grilla suiza**

* CSS Grid con named lines para alineación semántica

* Baseline grid en web: usar line-height consistente como módulo (24px base)

* Todos los espacios verticales son múltiplos de la unidad de línea (24px, 48px, 96px, etc.)

* Las imágenes ocupan número exacto de columnas y filas de la grilla

* Ningún elemento flota libremente — todo está anclado

### **Tensión asimétrica dentro del sistema**

* Grilla simétrica pero composición asimétrica — el contraste crea dinamismo

* Texto en 7 columnas, imagen en 5 columnas — no 6 y 6

* Número grande tipográfico en una columna, contenido denso en las otras 3

* El espacio vacío como columna activa — no como error de maquetación

## **Color**

### **Paleta suiza clásica**

* Negro puro (\#000000) y blanco puro (\#FFFFFF) como base absoluta

* Rojo suizo (\#FF0000 o \#E00000) como único acento permitido clásicamente

* Grises en escala perfecta: 20% / 40% / 60% / 80% de negro

* Color adicional solo en versiones modernas — siempre desaturado o muy puntual

### **Uso del color como información**

* El color nunca es decorativo — siempre codifica información

* Rojo \= acción crítica, énfasis máximo, alerta

* Negro \= texto principal, estructura, peso institucional

* Blanco \= espacio de lectura, silencio visual

* Gris \= jerarquía secundaria, desactivado, contexto

## **Fotografía y Visuales**

### **Fotografía documental**

* Fotografía en blanco y negro preferida — color solo con edición selectiva

* Las fotos no se recortan arbitrariamente — se presentan en su encuadre completo

* Las imágenes ocupan bloques precisos de la grilla — nunca sangran fuera del módulo

* Fotografía de sujeto neutro, frontal, sin composición dramática exagerada

* Captions debajo de toda imagen, en tipografía más pequeña, alineados a la izquierda de la imagen

### **Infografía y diagramas suizos**

* Diagramas con líneas de 1px exacto, colores planos, sin sombras

* Tablas con reglas horizontales simples — nunca con fondos de celda complejos

* Gráficos de barras y líneas sobre fondo blanco con ejes negros de 1px

* Datos como protagonistas — el contenedor es invisible

## **CSS y Variables para Swiss Style**

### **Implementación web moderna**

* \--grid-unit: 24px (baseline unit)

* \--grid-columns: 12

* \--grid-gutter: 24px

* \--font-primary: 'Helvetica Neue', Helvetica, Arial, sans-serif

* \--font-size-base: 16px

* \--line-height-base: 1.5 (= 24px \= 1 grid unit)

* \--color-black: \#000000

* \--color-white: \#FFFFFF

* \--color-red: \#E30613 (rojo suizo)

* \--color-gray-20: \#CCCCCC

* \--color-gray-40: \#999999

* \--color-gray-60: \#666666

* \--color-gray-80: \#333333

### **Técnicas CSS avanzadas para Swiss Style**

* CSS Grid con explicit named areas para reproducir layouts de la grilla modular

* Subgrid para alinear elementos descendientes a la grilla del padre

* Baseline alignment con align-items: baseline en componentes de texto mixto

* Uso de rem para mantener proporciones relativas al módulo base

* Breakpoints en múltiplos de la unidad de grilla (576px, 768px, 992px, 1200px)

## **Anti-patrones del Swiss Style**

* NUNCA usar fuentes decorativas o manuscritas — Helvetica es la ley

* NUNCA texto centrado excepto en casos muy específicos y justificados

* NUNCA elementos fuera de la grilla sin razón explícita de diseño

* NUNCA múltiples colores de acento — uno, con función precisa

* NUNCA imágenes recortadas en formas orgánicas o circulares sin justificación

* NUNCA ornamentos: marcos decorativos, viñetas elaboradas, líneas decorativas

* NUNCA espaciado inconsistente — todo en múltiplos de la unidad base

* NUNCA animaciones llamativas — transiciones de estado mínimas y funcionales

**04**  **Functional Minimalism**

*UX primero — El diseño invisible que hace todo posible*

| Familia | Estilos Minimalistas |
| :---- | :---- |
| **Índice** | 04 / 05 |
| **Filosofía** | El mejor diseño de interfaz es aquel que el usuario nunca nota porque simplemente funciona |
| **Referentes** | Notion, Linear, Basecamp, Stripe, Vercel, Figma (interfaz propia) |
| **Emoción objetivo** | Fluidez, productividad, control, invisible elegance |

## **Filosofía**

### **El diseño como utilidad pura**

El Functional Minimalism es el lenguaje visual de las herramientas de productividad y software profesional de alto rendimiento. No es minimalismo estético — es minimalismo funcional: se elimina todo lo que no maximice la eficiencia del usuario. La belleza es un efecto secundario de la perfección funcional, no un objetivo en sí mismo.

### **Principios de UX que guían el diseño**

* Zero cognitive load principle: el usuario nunca debe pensar sobre el interface — solo sobre su tarea

* Hick's Law: reducir el número de opciones para acelerar la toma de decisiones

* Fitts's Law: los elementos más usados deben ser los más grandes y accesibles

* Progressive disclosure: mostrar solo lo necesario ahora — el resto cuando se necesite

* Recognition over recall: el usuario no debe recordar dónde están las cosas

### **Diferencia con otros minimalismos**

* No es estético primero — es funcional primero, estético como consecuencia

* Puede tolerar mayor densidad de información si la tarea lo requiere

* Las decisiones de diseño se validan con métricas de uso, no con opiniones estéticas

* La consistencia sistémica \> la expresión creativa individual

## **Densidad de Información**

### **La paradoja de la densidad funcional**

* Functional Minimalism puede ser denso — Notion, Linear, VS Code son densos y minimalistas

* Densidad funcional: toda la información necesaria, ninguna innecesaria

* Modos de densidad: compact / default / comfortable — el usuario elige

* Row height en tablas y listas: 32px (compact), 40px (default), 48px (comfortable)

* Padding en componentes de datos: 8px / 12px / 16px según densidad

### **Jerarquía visual en contextos densos**

* Hover states revelan acciones secundarias que en reposo son invisibles

* El contexto activo se destaca con fondo sutil, no con bordes gruesos

* Indicadores de estado: puntos de colores (●) \+ texto — nunca solo color

* Metadatos: siempre más pequeños y con menor contraste que el contenido principal

## **Componentes de Productividad**

### **Command Palette (Cmd+K)**

* El componente más importante del Functional Minimalism moderno

* Input de búsqueda global \+ lista de acciones recientes \+ categorías

* Tipado anticipado con keyboard shortcuts visibles

* Fondo: modal centrado, blanco o dark, blur del fondo (backdrop-filter)

* Sin padding excesivo — denso y eficiente

### **Sidebar y navegación**

* Sidebar colapsable — el usuario controla cuánto espacio da a la navegación

* Items en sidebar: 32-36px altura, icono 16px \+ texto, hover con fondo sutil

* Sección activa: fondo ligeramente más oscuro, sin bordes llamativos

* Drag to reorder: cursor de agarre, indicator line entre items al arrastrar

* Keyboard navigation completa — Tab/Arrow keys para todo

### **Tablas y listas de datos**

* Headers de columna: uppercase 11px, letter-spacing 0.06em, gris 60%

* Datos primarios: 14px, negro/casi negro, font-weight 400

* Datos secundarios: 13px, gris 60%, alineados a la derecha si son números

* Sorting indicator: chevron inline, solo visible en columna activa

* Row hover: fondo \#F5F5F5 con transition 100ms

* Checkboxes de selección: aparecen solo en hover, desaparecen si nada está seleccionado

### **Tooltips y Popovers**

* Tooltip: máximo 1 línea, aparece en 500ms delay, desaparece en 200ms

* Fondo del tooltip: negro (\#000) con texto blanco, border-radius 4px, padding 4px 8px

* Popover: panel flotante con contenido rico, max-width 320px, shadow-lg

* NUNCA tooltip en mobile — el contenido debe ser autoexplicativo

## **Microinteracciones de Productividad**

### **Estados de carga inteligentes**

* Optimistic UI: actualizar la interfaz ANTES de confirmar el servidor (revertir si falla)

* Skeleton screens en lugar de spinners para carga de contenido estructurado

* Progress indicators: solo cuando la operación tarda más de 1 segundo

* Toast notifications: aparecen desde abajo, duran 4 segundos, tienen acción de deshacer

### **Feedback de acciones**

* Click en botón: scale(0.97) por 100ms \+ color state change

* Guardar exitoso: checkmark animado que aparece y desaparece en 1.5s

* Error: shake animation (translateX ±4px, 3 ciclos, 300ms total)

* Copy to clipboard: icono cambia a check por 2 segundos

* Drag & drop: elemento arrastrado con opacity 0.7, destino con dashed border

## **Dark Mode en Functional Minimalism**

### **Sistema de dark mode real**

* No es simplemente invertir colores — es un sistema de color paralelo completo

* Background levels: \--bg-base: \#0A0A0A, \--bg-surface: \#141414, \--bg-elevated: \#1E1E1E

* Text levels: \--text-primary: \#EDEDED, \--text-secondary: \#A0A0A0, \--text-tertiary: \#666666

* Borders en dark mode: más sutiles que en light mode (opacity 0.1 vs 0.15)

* Shadows en dark mode: glow de color en lugar de sombra oscura

### **Transición de tema**

* Transición suave de todos los colores: transition: color 200ms, background-color 200ms

* Usar CSS custom properties — cambiar el valor de la variable, no el selector

* Imágenes con filter: brightness en dark mode para no quemar los ojos

* El toggle de tema no debe recargar la página — solo cambiar la clase del body

## **Anti-patrones del Functional Minimalism**

* NUNCA landing pages con hero animations en herramientas de productividad — el usuario quiere trabajar

* NUNCA onboarding forzado de múltiples pasos — ofrecer quick start o skip

* NUNCA modal sobre modal — una sola capa de contexto a la vez

* NUNCA estados vacíos sin acción clara de qué hacer a continuación

* NUNCA tooltip sin delay — aparecen al hacer hover accidental constantemente

* NUNCA animaciones de page transition en SPA si el usuario trabaja con teclado

* NUNCA confirmaciones de eliminación con un solo botón — always destructive action \= secondary confirm

* NUNCA paginación si infinite scroll o virtualización es más adecuado

**05**  **Whitespace-First**

*El vacío como lenguaje — Cuando el espacio dice más que los elementos*

| Familia | Estilos Minimalistas |
| :---- | :---- |
| **Índice** | 05 / 05 |
| **Filosofía** | El espacio en blanco no es la ausencia de diseño — es el diseño mismo |
| **Referentes** | Apple.com, Aesop, Everlane, Loewe, editorial de lujo, sitios de galería de arte contemporáneo |
| **Emoción objetivo** | Exclusividad, calma, presencia, peso de marca, lujo silencioso |

## **Filosofía del Espacio**

### **El whitespace como elemento activo**

En el Whitespace-First Design, el espacio no es lo que queda después de poner elementos — es lo primero que se diseña. Los elementos se colocan dentro del espacio, no el espacio se deja entre los elementos. Esta inversión de pensamiento produce interfaces de una presencia visual completamente diferente.

### **Tipos de whitespace**

* Macro whitespace: el espacio entre secciones principales y el margen general de la página

* Micro whitespace: el espacio entre caracteres, líneas, palabras y pequeños elementos

* Active whitespace: el espacio colocado intencionalmente para guiar al ojo

* Passive whitespace: el espacio residual de la tipografía y los componentes

* Negative space compositional: el espacio que define la forma del elemento (fondo como figura)

### **La psicología del espacio**

* Más espacio \= mayor percepción de calidad y exclusividad

* El espacio genera anticipación — el ojo busca qué viene después del silencio visual

* Aislar un elemento con espacio lo jerarquiza sin necesidad de hacerlo más grande

* El ritmo de espacio crea narrative — apertura, contenido, cierre, apertura...

* Marcas de lujo usan whitespace porque el tiempo del usuario es el recurso más escaso

## **Sistema de Espaciado Extremo**

### **Escala de espaciado Whitespace-First**

* Los valores de espaciado son el doble o triple del sistema estándar

* Sección a sección: 160px \- 240px (vs 80-96px en minimalismo estándar)

* Márgenes laterales: 12-15% del viewport width en desktop

* Content max-width: 800px para texto, centrado con margin: auto

* Padding de cards: 48-64px (vs 24-32px estándar)

* Espacio entre titular y primer párrafo: 48px mínimo

| Contexto | Estándar (rem) | Whitespace-First (rem) |
| :---- | :---- | :---- |
| Padding botón | 0.625rem 1.5rem | 1rem 2.5rem |
| Gap entre cards | 1.5rem (24px) | 3rem (48px) |
| Margen de sección | 5rem (80px) | 10-15rem (160-240px) |
| Line-height body | 1.5-1.6 | 1.7-1.85 |
| Padding interno hero | 80px 64px | 160px 80px |
| Espaciado entre letras display | \-0.02em | \-0.04em |

### **Respiración tipográfica**

* Line-height para body: 1.75-1.85 (generosísimo — permite que cada línea respire)

* Paragraph spacing: 2em entre párrafos (equivalente a una línea en blanco visible)

* Anchura de columna de texto: 55-65 caracteres (más estrecho \= más lujo)

* Leading (interlineado) en títulos grandes: 1.0-1.1 (apretado en display, amplio en body)

## **Tipografía en Whitespace-First**

### **Tipografía de alta presencia**

* Fuentes con alta presencia visual — serif editorial o sans-serif con mucha personalidad

* Recomendadas: Tiempos, Canela, Editorial New, Libre Baskerville, Cormorant Garamond

* Sans-serif alternativas: Aktiv Grotesk, Founders Grotesk, GT America, Neue Montreal

* Tamaños de display extremos: 80px \- 160px para el titular principal

* El texto es escaso y poderoso — pocas palabras, máximo impacto

### **Jerarquía por aislamiento**

* El título puede ser el único elemento en toda una sección — rodeado de espacio

* Un dato estadístico grande \+ texto mínimo abajo — el espacio hace el trabajo del diseño

* Pullquotes: texto grande (36-48px), línea de acento, mucho espacio alrededor

* Listas que se convierten en composiciones — un ítem por línea con mucho spacing

## **Composición y Layout**

### **Layouts de alta tensión espacial**

* Full-viewport sections con un solo elemento centrado — el espacio es el mensaje

* Layouts de 2 columnas con proporción 7:5 o 8:4 — no 6:6 (asimetría crea tensión)

* Sticky elements con posición calculada para crear ritmo al hacer scroll

* Parallax muy sutil (0.2-0.4x velocidad) solo en imágenes, nunca en texto

* Horizontal scroll sections como break del ritmo vertical — máximo 1 por página

### **Fotografía de alta presencia**

* Full-bleed images (100vw) sin márgenes — el contenedor desaparece

* Imágenes con mucho espacio negativo en la composición fotográfica

* Una imagen grande vale más que tres imágenes pequeñas

* Object-fit: cover con object-position cuidadosamente elegido

* Tratamiento de color: ligeramente desaturadas o con filtro de color de marca

### **Scroll storytelling**

* Cada sección tiene un momento de 'respiración' antes del siguiente bloque de contenido

* Scroll-triggered reveals: los elementos aparecen con fade-up al entrar en viewport

* El scroll no es navegación — es experiencia secuencial de lectura

* Ancho del contenido puede variar entre secciones: 100% → 80% → 60% → 100%

## **Animaciones en Whitespace-First**

### **El movimiento del lujo**

* Las animaciones son lentas y deliberadas — velocidad transmite apuro, lentitud transmite confianza

* Duración: 600-800ms para apariciones, 300-400ms para interacciones

* Easing: custom cubic-bezier suaves (0.25, 0.1, 0.25, 1.0) o ease-in-out

* Nunca bounce o spring — demasiado informal para este estilo

| Tipo | Duración | Características |
| :---- | :---- | :---- |
| Page section reveal | 700ms ease-out | translateY(40px)→0 \+ opacity, con delay stagger |
| Image lazy load | 500ms | opacity 0→1 \+ blur(4px)→blur(0) |
| Hover en card de producto | 400ms | scale(1.015) muy sutil \+ sombra leve |
| CTA button hover | 300ms | background color transition suave |
| Logo intro | 1000ms | fade in muy lento, solo al cargar |
| Scroll progress | linear | indicator de progreso sutil en top o lateral |

### **Cursor personalizado**

* Cursor custom es aceptable en Whitespace-First — añade capa de lujo táctil

* Cursor circular simple (16-20px) que reemplaza al cursor por defecto

* Al hacer hover sobre links: cursor se expande (32-40px) con mix-blend-mode: difference

* Implementación: posición absoluta actualizada con requestAnimationFrame para suavidad

## **CSS Específico para Whitespace-First**

### **Variables de espaciado generoso**

* \--section-spacing: clamp(6rem, 12vw, 15rem)

* \--content-padding: clamp(1.5rem, 5vw, 5rem)

* \--content-max-width: 800px

* \--reading-width: 65ch

* \--line-height-body: 1.8

* \--line-height-display: 1.05

* \--letter-spacing-display: \-0.04em

* \--letter-spacing-label: 0.12em

### **Técnicas CSS avanzadas**

* clamp() para padding fluido: padding: clamp(3rem, 8vw, 8rem)

* 100dvh en lugar de 100vh para altura correcta en mobile con barra de dirección

* scroll-snap-type: y mandatory para secciones full-viewport

* Intersection Observer API para reveal animations con threshold: 0.15

* CSS @property para animar custom properties (gradientes animados)

* overscroll-behavior: contain en paneles internos para evitar scroll fugitivo

## **Anti-patrones del Whitespace-First**

* NUNCA llenar el espacio porque 'parece vacío' — el vacío ES el diseño

* NUNCA múltiples CTA en una sección — un CTA, todo el espacio para él

* NUNCA banners de cookies o popups agresivos — destruyen completamente la experiencia

* NUNCA carousels con auto-play — rompen el ritmo de lectura del usuario

* NUNCA iconos de redes sociales flotantes en el lateral — el ruido visual mata el whitespace

* NUNCA fondos de colores intensos — el blanco y los neutros son los únicos fondos válidos

* NUNCA animaciones que se activan con scroll pero antes de que el usuario llegue al elemento

* NUNCA footer denso y lleno de links — footer minimalista con lo esencial

