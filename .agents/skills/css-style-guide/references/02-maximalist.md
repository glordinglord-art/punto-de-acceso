**GUIA DE ESTILOS CSS**

**Estilos Maximalistas**

Familia II de XI — 4 estilos documentados

Guia de referencia para generacion automatica de CSS basada en identidad de marca y estilo visual. Cada estilo incluye: filosofia, paleta de color, tipografia, patrones, animaciones, componentes, variables CSS y anti-patrones.

**Estilos incluidos:** 06 Maximalism  07 Cluttercore  08 Memphis Design  09 Psychedelic / Groovy

| \# | Estilo | Filosofia central | Emocion objetivo |
| :---- | :---- | :---- | :---- |
| 06 | Maximalism | La abundancia intencional como lujo visual | Exuberancia y poder |
| 07 | Cluttercore | El caos habitado con afecto y memoria | Calidez y autenticidad |
| 08 | Memphis Design | Geometria alegre que desafia el buen gusto | Alegria e irreverencia |
| 09 | Psychedelic | Formas organicas y color que expanden la percepcion | Alteracion sensorial |

**06**   **Maximalism**

*Más es más — La abundancia como declaración de intención estética*

| Familia | Estilos Maximalistas |
| :---- | :---- |
| **Índice** | 01 / 04 |
| **Filosofía** | El maximalismo no es exceso sin control; es abundancia con intención. Cada capa, textura y color comunica algo. |
| **Referentes** | Versace.com, Gucci (era Alessandro Michele), Rick Owens, Dolce & Gabbana, Die With Your Boots On, Burberry archivo |
| **Emoción** | Exuberancia, poder, sensorialidad, provocación, riqueza cultural |

## **Filosofía y Principios del Maximalism**

El Maximalism web es la antítesis directa del minimalismo, pero comparte con él una exigencia: todo debe ser intencional. La diferencia es que aquí la intención es crear abundancia visual deliberada, capas de significado y una experiencia sensorial envolvente. Un buen diseño maximalista tiene una lógica interna clara aunque su superficie sea densa.

### **El manifiesto maximalista**

* La abundancia es honesta — el minimalismo oculta; el maximalismo revela todo

* Las capas no son ruido — son profundidad; el ojo descubre más con cada mirada

* La contradicción es bienvenida — patrones que chocan crean tensión productiva

* La historia importa — texturas, referencias culturales y arquetipos acumulados

* El espacio en blanco es desperdiciar lienzo — cada pixel puede tener vida

* La escala extrema es herramienta — lo gigante y lo minúsculo en la misma composición

### **Diferencia entre Maximalism bien ejecutado y mal ejecutado**

* BIEN: abundancia con jerarquía clara — el ojo sabe por dónde empezar

* BIEN: las capas tienen función semántica — cada una añade significado

* BIEN: la paleta es rica pero coherente internamente (aunque extensa)

* MAL: acumulación sin tensión visual — todo al mismo nivel de importancia

* MAL: colores que no se relacionan entre sí ni con la identidad de marca

* MAL: tipografías aleatorias mezcladas sin criterio compositivo

* MAL: confundir maximalismo con bajo presupuesto de diseño

### **Cuándo usar Maximalism**

* Marcas de moda de lujo o streetwear con identidad cultural fuerte

* Artistas, músicos o creativos con universo estético definido

* Eventos, festivales o experiencias que quieren transmitir celebración

* Marcas de belleza, perfumería o joyas con herencia histórica

* Proyectos editoriales de arte o cultura con audiencia sofisticada

## **Paleta de Color**

### **Sistema de color maximalista**

* 5 a 8 colores activos simultáneamente — sin miedo a la riqueza cromática

* Colores intensamente saturados mezclados con neutros profundos (negro, dorado, crema)

* Fondos oscuros (negro, burdeos, verde botella) como base que contiene la riqueza

* Gradientes ricos y complejos — pueden tener 3 o 4 stops de color

* Metalicos como acentos estructurales: dorado (\#C9A84C), plata (\#A8A9AD), cobre (\#B87333)

* Transparencias y overlays de color para crear profundidad de capas

| Rol | Ejemplo de valor | Función |
| :---- | :---- | :---- |
| Fondo base | \#0D0D0D / \#1A0A0A | Lienzo oscuro que contiene todo |
| Color primario 1 | \#CC2200 (rojo cármine) | Dominante de marca, impacto máximo |
| Color primario 2 | \#C9A84C (dorado) | Lujo, estructura, jerarquía áurea |
| Color secundario 1 | \#4A0080 (púrpura profundo) | Misterio, poder, contraste con rojo |
| Color secundario 2 | \#006B3C (verde esmeralda) | Riqueza natural, contraste con dorado |
| Acento cálido | \#FF6B00 (naranja quemado) | Llamadas a la acción, focos de energía |
| Acento frío | \#00B4D8 (azul eléctrico) | Tensión de temperatura, modernidad |
| Neutro crema | \#F2E8DC | Respiro entre colores intensos |

### **Técnicas de aplicación del color**

* Fondos con gradientes de malla (CSS mesh gradients) con 4+ puntos de color

* Overlays de textura en modo de fusión multiply o overlay sobre fondos de color

* Texto con gradiente de color (background-clip: text) para titulares principales

* Bordes con gradientes: border-image con linear-gradient o conic-gradient

* Sombras de color (no negras): box-shadow con el color complementario del elemento

* Pseudo-elementos ::before y ::after para capas de color adicionales sin HTML extra

## **Tipografía**

### **Filosofía tipográfica maximalista**

* La tipografía es imagen tanto como es texto — el shape de las letras importa visualmente

* Mezclar hasta 3 familias tipográficas si cada una tiene un rol estructural claro

* Tamaños extremos: títulos de 120-200px son normales en diseño maximalista

* Texto que sangra fuera del viewport para crear tensión de escala

* Tipografía como textura de fondo: palabras repetidas en muy baja opacidad

| Nivel | Fuentes recomendadas | Notas |
| :---- | :---- | :---- |
| Display/Hero | Bodoni Moda, Playfair Display, Abril Fatface, Anton | Serif con alto contraste thick/thin o sans condensada |
| Títulos H1-H2 | Freight Display, Cormorant, Canela, Bebas Neue | Puede ser serif elegante o sans bold extremo |
| Subtítulos | DM Serif Display, Libre Baskerville, Oswald Bold | Contraste con el display principal |
| Cuerpo de texto | Garamond, EB Garamond, Lora, Spectral | Serif legible con personalidad clásica |
| Labels/Caps | Futura, Montserrat, Letter Gothic, Space Mono | Sans neutral que no compite con el display |

### **Técnicas tipográficas avanzadas**

* Texto oversize: font-size: clamp(80px, 15vw, 200px) para impacto de portada

* Kerning manual en titulares clave: letter-spacing ajustado par a par con CSS

* Texto en múltiples ejes simultáneos (rotaciones de 90° o \-45° como elementos compositivos)

* Mezcla de pesos extremos en la misma línea: thin \+ black para contraste intra-texto

* Variable fonts para animación de peso/anchura: font-variation-settings animado

* Texto sobre imagen con blend-mode: multiply o difference para integración

* Drop caps de párrafo (::first-letter) con tamaño 4-5x y color de acento

## **Textura, Patrones y Capas**

Las texturas y los patrones son los elementos que definen el Maximalism frente a otros estilos ricos visualmente. No son elementos de relleno — son capas de significado que añaden densidad cultural y visual.

### **Tipos de textura para Maximalism**

* Texturas orgánicas: papel envejecido, tela, piel, madera — escaneadas en alta res

* Texturas de ruido (CSS grain): filter con SVG feTurbulence o noise overlay PNG

* Patrones geométricos: damasco, argyle, jacquard, mosaico, azulejo — en muy baja opacidad sobre fondos

* Degradados de ruido: gradient mesh con turbulencia CSS para fondos vivos

* Texturas metálicas: foil, holográfico, lenticular — CSS con animación de background-position

* Film grain sobre imágenes: pseudo-elemento con noise PNG en modo overlay, opacity 0.3-0.5

### **Sistema de capas (z-layering)**

* Capa 0 — fondo base: color sólido oscuro o gradiente rico

* Capa 1 — textura de fondo: PNG de ruido o patrón en opacity 0.05-0.15

* Capa 2 — elementos gráficos de fondo: ilustraciones, ornamentos, formas grandes en baja opacity

* Capa 3 — contenido principal: texto e imágenes primarias con z-index superior

* Capa 4 — overlays decorativos: bordes de frame, ornamentos de esquina, sellos

* Capa 5 — efectos de luz: gradientes radiales tipo 'glow' sobre el contenido

* Cada capa tiene su propio blend-mode para integración orgánica con las demás

### **Ornamentos y elementos decorativos**

* Bordes ornamentales: marcos con esquinas elaboradas, filetes dobles o triples

* Divisores de sección: separadores tipo art nouveau, líneas con rosetas, colas de ornamento

* Florones tipográficos (dingbats): usados como elementos compositivos entre bloques

* Sellos circulares: texto circular con seal effect para credenciales o fechas

* Monogramas: letras superpuestas con SVG clip-path para headers de marca

* Volutas y arabescos: SVG de ornamentos florales como textura o acento de sección

## **Imágenes y Fotografía**

### **Tratamiento fotográfico maximalista**

* Imágenes con post-procesado de color agresivo: saturación alta, contraste extremo

* Color grading con LUT de estilo cinematográfico (sepia, cross-process, duotono)

* Duotonos con los colores primarios de la marca sobre fotografías en B\&N

* Imágenes recortadas en formas no rectangulares: clip-path con formas ornamentales

* Fotografías de gran formato que sangran al borde del viewport

* Superposición de múltiples imágenes con blend-mode para crear collages

* Tratamiento de grano analógico sobre fotos digitales para textura vintage

### **Collage digital como técnica**

* Elementos recortados con fondo transparente superpuestos a diferentes escalas

* Sombras paralelas individuales por elemento para crear profundidad de collage

* Mezcla de fotografía, ilustración y tipografía en la misma composición

* Elementos que 'rompen' el frame del contenedor para crear profundidad tridimensional

* Uso de filter: drop-shadow() para sombras irregulares sobre recortes PNG

## **Animaciones y Motion**

### **Filosofía de movimiento maximalista**

* Las animaciones son teatrales y deliberadamente exuberantes — el movimiento es espectáculo

* Múltiples animaciones simultáneas en diferentes capas crean profundidad cinética

* Los loops continuos son aceptables — el mundo maximalista siempre está vivo

* Los efectos de entrada son dramáticos: slides largos, rotaciones, escalas extremas

* El timing es parte del lujo — animaciones lentas y cuidadas transmiten calidad

| Animación | Duración | Descripción |
| :---- | :---- | :---- |
| Hero entrance | 1200-1600ms | Capas que aparecen en cascada con stagger de 200ms |
| Texto cinético | 800ms ease-in-out | Letras individuales con delay escalonado (GSAP SplitText) |
| Parallax rico | Scroll-linked | 3-5 capas a velocidades distintas: 0.1x / 0.3x / 0.6x / 1x |
| Textura animada | Loop infinito 8s | background-position desplazándose en diagonal |
| Hover de imagen | 600ms cubic-bezier | scale(1.05) \+ filtro de color \+ sombra de color |
| Ornamento rotatorio | Loop 20s linear | Elemento decorativo con rotación continua y lenta |
| Gradiente animado | Loop 6s ease-in-out | @keyframes con hue-rotate o background-position |
| Cursor personalizado | 60fps rAF | Trailing cursor con múltiples círculos concéntricos |
| Glitch sutil en hover | 300ms | clip-path animation con offset de RGB channels |

### **CSS avanzado para motion maximalista**

* @property \--gradient-angle: permite animar variables de ángulo en gradientes

* hue-rotate() en keyframes para fondos con ciclo de color continuo

* clip-path: polygon() animado para transiciones de sección orgánicas

* filter: saturate() \+ contrast() animado en hover para énfasis cromático

* mix-blend-mode: difference en cursor overlay para efecto de inversión

* offset-path para animar elementos a lo largo de un trayecto SVG

* scroll-driven animations (animation-timeline: scroll()) para parallax nativo CSS

## **Componentes UI Maximalistas**

### **Botones y CTAs**

* Botón primario: fondo con gradiente rico \+ borde dorado \+ sombra de color \+ texto en crema

* Hover: escala leve (1.04) \+ intensificación de gradiente \+ glow exterior de color

* Padding generoso: 18px 40px mínimo — el espacio dentro del botón es parte del lujo

* Posibles tratamientos: borde con gradiente animado, shimmer de luz al hover, borde ornamental

* Botones secundarios: borde 2px con gradiente, texto del color primario, fondo transparente

* Iconos en botones: siempre presente en maximalismo — el ícono añade densidad visual

### **Cards y contenedores**

* Fondo de card: puede ser de color, con textura o con gradiente — nunca blanco plano

* Bordes: múltiples líneas (doble borde), o borde con gradiente, o marco ornamental

* Sombra: box-shadow compleja con 3+ capas, incluyendo glow de color

* Hover: transform con rotate muy sutil (1-2°) \+ intensificación de todos los efectos

* Headers de card con banda de textura o patrón de la paleta de marca

### **Navegación**

* Navbar con fondo opaco de color de marca o con gradiente \+ logo grande

* Mega-menú al hover: panel rico con imágenes, tipografía editorial y categorías visuales

* Links con efecto de reveal de color al hover: clip-path o pseudo-elemento sliding

* Mobile nav: full-screen overlay con imagen de fondo, tipografía grande, animación teatral

* Breadcrumbs ornamentados con separadores tipográficos decorativos

## **Variables CSS para Maximalism**

**CUSTOM PROPERTIES BASE**

* \--color-bg-base: \#0D0D0D

* \--color-bg-surface: \#1A1A1A

* \--color-primary: \#CC2200

* \--color-gold: \#C9A84C

* \--color-cream: \#F2E8DC

* \--color-accent-1: \#4A0080

* \--color-accent-2: \#006B3C

* \--gradient-hero: linear-gradient(135deg, \#0D0D0D 0%, \#1A0A0A 40%, \#2A0D0D 100%)

* \--gradient-gold: linear-gradient(90deg, \#8B6914, \#C9A84C, \#E8D08A, \#C9A84C, \#8B6914)

* \--shadow-glow-red: 0 0 40px rgba(204,34,0,0.4), 0 0 80px rgba(204,34,0,0.15)

* \--shadow-rich: 0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)

* \--border-gold: 1px solid rgba(201,168,76,0.6)

* \--font-display: 'Bodoni Moda', 'Playfair Display', Georgia, serif

* \--font-body: 'EB Garamond', Garamond, Georgia, serif

* \--font-label: 'Futura', 'Montserrat', Arial, sans-serif

* \--texture-overlay: url('noise.png'), url('texture.png')

* \--transition-luxe: 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)

## **Anti-patrones del Maximalism**

* NUNCA abundancia sin jerarquía — el ojo necesita un punto de entrada aunque todo sea rico

* NUNCA mezclar estilos de época incompatibles sin intención (art deco \+ pixel art \= caos sin concepto)

* NUNCA sacrificar la legibilidad del texto en favor de la densidad visual

* NUNCA usar texturas de baja resolución — el maximalismo exige calidad de alta gama

* NUNCA aplicar este estilo a interfaces de productividad o SaaS — el costo cognitivo es demasiado alto

* NUNCA usar maximalismo sin entender la identidad cultural que se referencia

* NUNCA ignorar la performance — CSS con 20 capas de box-shadow mata el render budget

* NUNCA olvidar prefers-reduced-motion — las animaciones complejas requieren alternativas

* NUNCA confundir maximalismo con mal gusto — son cosas completamente distintas

**07**   **Cluttercore**

*El caos organizado — Colecciones con alma que cuentan historias*

| Familia | Estilos Maximalistas |
| :---- | :---- |
| **Índice** | 02 / 04 |
| **Filosofía** | El desorden aparente esconde un sistema personal e íntimo de organización. Cada objeto importa. |
| **Referentes** | Pinterest boards de cottagecore, tiendas vintage online, webs de coleccionistas, zines digitales, Depop, estética de cuarto de adolescente con carácter |
| **Emoción** | Calidez, nostalgia, autenticidad, intimidad, abundancia afectiva |

## **Filosofía del Cluttercore**

El Cluttercore es la estética del cuarto lleno de cosas queridas. A diferencia del Maximalism de alto lujo, el Cluttercore tiene una calidez doméstica e íntima. Sus referencias son las estanterías llenas de libros y colecciones personales, los tableros de corcho llenos de postales, las mesas de trabajo donde cada objeto tiene un significado. En web, traduce esto en interfaces que sienten como espacios habitados, orgánicos y llenos de personalidad.

### **Qué hace al Cluttercore diferente del Maximalism general**

* Escala humana: los objetos son personales y cotidianos, no de lujo o grandilocuentes

* Asimetría real: la composición simula acumulación natural, no diseño calculado

* Patina del tiempo: texturas envejecidas, bordes irregulares, papel viejo, tinta corrida

* Narrativa de coleccionista: cada elemento parece tener una historia de dónde vino

* Paleta terrosa y cálida vs. el drama del Maximalism de lujo

* Tipografías manuscritas y sello de goma vs. serif editorial de alta costura

### **Casos de uso ideales**

* Tiendas vintage o de segunda mano con identidad auténtica

* Portafolios de artistas, ilustradores y creativos con estética personal

* Blogs y revistas digitales de lifestyle, cottagecore, witchcraft, academia

* Zines digitales y publicaciones independientes con voz editorial fuerte

* Marcas artesanales, de velas, cerámica, papelería o joyería hecha a mano

## **Paleta de Color**

### **Paleta de Cluttercore**

* Tonos terrosos como base: ocre (\#C8882A), terracota (\#C1614A), siena (\#A0522D)

* Cremas y huesos: \#F5EDD6, \#EDE0C4, \#E8D5B0 — papel envejecido como neutro dominante

* Verdes musgosos y bosque: \#6B7C45, \#4A5C2A, \#8FA060 — naturaleza y jardín

* Rosas empolvados: \#D4896A, \#C8826E, \#E8A898 — calidez sin dulzura excesiva

* Morados y ciruelas: \#7B5EA7, \#5C4A8A, \#9B7EC8 — misterio y magia cotidiana

* Oscuros de tinta: \#2C1810, \#1A1209, \#3D2515 — fondos de cuaderno antiguo

* EVITAR: azules fríos, grises tecnológicos, blancos clínicos, colores saturados primarios

### **Técnicas de color específicas del Cluttercore**

* Transparencias cálidas: overlays de color sepia o naranja sobre imágenes (opacity 0.15-0.3)

* Degradados sutiles de papel: gradiente muy suave de crema a crema ligeramente más oscuro

* Manchas de acuarela como elementos decorativos: SVG con formas orgánicas y bordes blandos

* Variaciones de un mismo color base para crear cohesión en la variedad (sistema análogo)

* Texto de diferentes colores en la misma composición — manuscrito y anotaciones en distintos tonos

## **Tipografía**

### **Selección de fuentes para Cluttercore**

* Manuscritas con carácter: Caveat, Reenie Beanie, Sacramento, Shadows Into Light, Patrick Hand

* Serif con irregularidad vintage: Playfair Display, Special Elite, Libre Baskerville, Cardo

* Máquina de escribir: Courier Prime, Special Elite, American Typewriter, Camingocode

* Sello de goma / stencil: Anton, Black Han Sans, Rubik Dirt, Rye

* Handwritten display: Pacifico, Dancing Script, Great Vibes (con moderación)

* Combinación recomendada: manuscrita para títulos \+ serif para cuerpo \+ monospace para notas

### **Técnicas tipográficas del Cluttercore**

* Texto rotado irregularmente: transform: rotate(-2deg) a rotate(3deg) según el elemento

* Efecto de sticker: texto con borde blanco grueso (text-stroke o \-webkit-text-stroke 3px white)

* Tachados intencionales: text-decoration: line-through como elemento narrativo de borrador

* Anotaciones al margen: texto pequeño en manuscrita en los bordes del contenido principal

* Subrayados manuales: border-bottom personalizado con SVG de línea irregular

* Tamaños mixtos en el mismo bloque: la imperfección tipográfica es parte del estilo

* Texto sobre papel texturizado: siempre ajustar contraste — la textura no debe comerse la legibilidad

## **Composición y Elementos Visuales**

### **Layout de tablero de corcho digital**

* Elementos con posicionamiento absoluto a rotaciones ligeramente distintas (±3°)

* Sombras de papel: box-shadow sutil con offset visible para simular objeto físico sobre superficie

* Overlapping deliberado: los elementos se solapan parcialmente como en una mesa de trabajo

* Stickers y etiquetas: elementos PNG recortados con aspecto de adhesivo o papel cortado

* Polaroids: imágenes con marco blanco amplio abajo \+ sombra \+ ligera rotación

* Post-its: rectangulares con esquinas ligeramente redondeadas, colores pastel, rotados

* Washi tape: pseudo-elementos con textura de cinta adhesiva de papel en las esquinas

### **Colecciones y cuadrículas irregulares**

* Masonry grid (CSS columns o JS masonry) para colecciones de objetos de distintas alturas

* Cada card de objeto tiene su propia rotación sutil diferente (CSS nth-child con rotaciones)

* Los items no se alinean perfectamente — hay micro-desplazamientos de 2-4px intencionados

* Etiquetas de precio manuscritas en las cards de productos vintage

* Categorías representadas por imágenes polaroid en lugar de texto de navegación

### **Elementos decorativos característicos**

* Ilustraciones botánicas: flores, plantas, hierbas — en estilo grabado o acuarela

* Sellos postales y marcas de tinta: elementos PNG de sello de goma con transparency

* Manchas de café o tinta: overlays PNG en modo multiply para envejecer el papel

* Clips, alfileres, cintas: elementos decorativos que 'sostienen' las cards en el tablero

* Puntos de cera lacre: círculos con textura de sello, para cerrar secciones formalmente

* Cintas y lazos: SVG decorativo para separar secciones o envolver elementos

* Mapas y páginas de libro: como textura de fondo de secciones específicas

## **Animaciones**

### **Motion orgánico e imperfecto**

* Las animaciones deben sentirse manuales, no mecanizadas — easings irregulares e imperfectos

* Hover en polaroid: rotación leve que se intensifica \+ sombra que se expande (simula levantarlo)

* Entrada de elementos: caída suave desde arriba con ligero rebote al aterrizar

* Post-its: ligero movimiento de flotación en loop (translateY ±3px, 3s ease-in-out infinite)

* Stickers al hover: ligero scale-up (1.08) con rotación que aumenta 1-2° adicionales

* Cursor: forma de círculo grande con trailing lento (3-5 frames de delay) — efecto de dedo

* Scroll reveal: elementos caen en cascada como si se dejaran caer sobre una mesa

| Animación | Duración | Descripción |
| :---- | :---- | :---- |
| Card drop-in | 500ms spring | translateY(-20px) opacity 0 → natural con bounce sutil |
| Polaroid hover | 400ms ease-out | scale(1.05) \+ rotate(+1°) \+ shadow-lg |
| Post-it float | 3s ease-in-out infinite | translateY(0px) ↔ translateY(-4px) en loop |
| Sticker hover | 300ms ease | scale(1.1) \+ drop-shadow más intenso |
| Page flip entrance | 800ms ease-out | rotateY(90°→0°) con perspective 1000px |
| Handwriting reveal | 1500ms linear | SVG stroke-dashoffset animation, texto que 'se escribe' |
| Tape peel hover | 500ms ease | Pseudo-elemento que se 'dobla' en esquina |

## **Variables CSS para Cluttercore**

**CUSTOM PROPERTIES**

* \--color-paper: \#F5EDD6

* \--color-paper-dark: \#E8D5B0

* \--color-ink: \#2C1810

* \--color-ink-light: \#5C4030

* \--color-terracotta: \#C1614A

* \--color-ochre: \#C8882A

* \--color-moss: \#6B7C45

* \--color-plum: \#7B5EA7

* \--shadow-paper: 2px 4px 12px rgba(44,24,16,0.2), 0 1px 3px rgba(44,24,16,0.15)

* \--shadow-sticker: 3px 6px 16px rgba(44,24,16,0.25)

* \--rotate-card-1: rotate(-1.5deg)

* \--rotate-card-2: rotate(0.8deg)

* \--rotate-card-3: rotate(-0.5deg)

* \--rotate-card-4: rotate(2.1deg)

* \--font-handwritten: 'Caveat', 'Patrick Hand', cursive

* \--font-vintage: 'Special Elite', 'Courier Prime', monospace

* \--font-serif: 'Libre Baskerville', 'Cardo', Georgia, serif

* \--texture-paper: url('paper-texture.png')

* \--transition-organic: 400ms cubic-bezier(0.34, 1.56, 0.64, 1\)

## **Anti-patrones del Cluttercore**

* NUNCA usar tipografías sans-serif limpias y modernas — rompen toda la autenticidad del estilo

* NUNCA hacer el caos perfectamente simétrico — destruye la ilusión de acumulación orgánica

* NUNCA ignorar la performance: imágenes PNG de alta res sin optimizar matan el tiempo de carga

* NUNCA usar colores fríos o de alta saturación digital — son ajenos al mundo del Cluttercore

* NUNCA hacer una versión 'limpia' del Cluttercore — si se limpia, pierde su esencia

* NUNCA aplicar a interfaces transaccionales (e-commerce de alta conversión) sin pruebas de UX

* NUNCA tener texto ilegible por exceso de textura de fondo — el contenido sigue siendo el rey

* NUNCA que la apariencia de desorden enmascare desorientación de navegación real

**08**   **Memphis Design**

*Caos geométrico alegre — El postmodernismo que se niega a ser serio*

| Familia | Estilos Maximalistas |
| :---- | :---- |
| **Índice** | 03 / 04 |
| **Filosofía** | Romper las reglas del buen gusto con inteligencia y celebrar el kitsch como forma de libertad creativa |
| **Referentes** | Memphis Group (Ettore Sottsass, 1981), MTV años 80, Stranger Things branding, Kid Cudi álbumes, Squarespace templates retro, Mailchimp ilustraciones antiguas |
| **Emoción** | Alegría, irreverencia, energía, nostalgia de los 80s, humor inteligente |

## **Historia y Filosofía del Memphis Design**

El Memphis Group nació en Milán en 1981 cuando Ettore Sottsass convocó un grupo de diseñadores para crear muebles y objetos que desafiaran el funcionalismo y el buen gusto establecido. El resultado fue una explosión de colores primarios, formas geométricas aleatorias, patrones estridentes y superficies que mezclaban lo serio con lo juguetón. Su influencia en la estética digital es directa e inmediata.

### **Principios del Memphis Design en web**

* Los colores primarios son los héroes — rojo, amarillo, azul, verde en su versión más pura

* Las formas geométricas simples se convierten en motivos decorativos: círculos, triángulos, zig-zag

* Los patrones son superficiales y repetitivos (squiggles, polka dots, rayas) sin profundidad simulada

* No hay jerarquía de importancia entre los elementos decorativos — todo coexiste

* La contradicción estética ES el estilo: mármol falso \+ neón, serio \+ ridículo

* El humor no es accidental — es el mensaje

### **Memphis Design vs. sus contemporáneos**

* vs. Bauhaus: Memphis rechaza 'la forma sigue a la función' — aquí la forma provoca y divierte

* vs. Swiss Style: Memphis destruye la grilla como ley — la coloca como elemento más entre otros

* vs. Modernismo: Memphis es deliberadamente impuro, kitsch y anti-élite cultural

* vs. Postmodernismo general: Memphis tiene reglas propias aunque parezca no tenerlas

### **Cuándo usar Memphis Design en web**

* Marcas dirigidas a millennials y Gen Z con sentido del humor y autoconciencia

* Agencias creativas, estudios de diseño que quieren mostrar su lado juguetón

* Productos de consumo masivo con identidad energética y popular

* Eventos, festivales de música o cultura con energía retro-futurista

* Páginas de error 404, estados vacíos y páginas de celebración dentro de productos

* Apps de productividad que quieren suavizar su seriedad con personalidad visual

## **Paleta de Color**

### **Colores Memphis clásicos y modernos**

* Colores primarios sin miedo: \#FF0000 rojo puro, \#0044CC azul royal, \#FFD700 amarillo brillante

* Verdes Memphis: \#00CC44 (verde menta saturado), \#228B22 (verde bosque como acento oscuro)

* Rosas y magentas: \#FF4499 (rosa shocking), \#CC0077 (magenta intenso)

* Negros y blancos siempre presentes como anclas visuales

* Turquesa: \#00CCCC como color cool que balancea los cálidos

* Toques pastel solo en versiones 'neo-Memphis' modernas: peach, mint, lavender

| Token | Valor | Uso en Memphis |
| :---- | :---- | :---- |
| \--memphis-red | \#FF3333 | Formas primarias, fondos de acento, CTAs |
| \--memphis-blue | \#0044CC | Fondos de sección, elementos de peso visual |
| \--memphis-yellow | \#FFD700 | Squiggles, puntos, detalles decorativos |
| \--memphis-black | \#111111 | Texto, bordes de formas, outline de patrones |
| \--memphis-white | \#FFFFFF / \#FFFEF0 | Fondos base, respiro entre patrones |
| \--memphis-pink | \#FF66AA | Acentos secundarios, hover states |
| \--memphis-green | \#00CC44 | Alternativa refrescante al rojo |
| \--memphis-teal | \#00BBCC | Balance cromático entre cálidos y fríos |

### **Reglas de color Memphis**

* Nunca gradientes en el Memphis clásico — colores sólidos y planos siempre

* El negro es el pegamento que une los colores — los bordes negros de las formas son esenciales

* Fondo blanco con elementos de color O fondo de color con elementos blancos y negros

* En versión neo-Memphis: se permiten gradientes de 2 colores Memphis adyacentes

* Los patrones de fondo mezclan 2-3 colores Memphis sobre blanco o negro

## **Patrones y Motivos Característicos**

Los patrones son la firma del Memphis Design. Son la herramienta principal para crear las superficies ricas y caóticas que definen el estilo. Cada patrón tiene nombre y carácter propio.

### **El vocabulario de patrones Memphis**

* Squiggles / Ondas: líneas curvas irregulares y repetitivas (el patrón más icónico de Memphis)

* Polka dots: puntos perfectos a escala mediana-grande, sin gradiente ni sombra

* Rayas diagonales: a 45° de grosor variable, en colores primarios

* Zigzag: chevrons y zigzags a distintas escalas y colores

* Checks: cuadros tipo tablero de ajedrez a escala grande

* Triángulos scatter: triángulos de distintos tamaños distribuidos aleatoriamente

* Grid de diamantes / argyle: losangos en dos colores con líneas de intersección

* Memphis dots: puntos de tamaños mixtos en composición libre

### **Implementación CSS de patrones Memphis**

* Squiggles: SVG como background-image con repeat, o elemento decorativo posicionado

* Polka dots: background: radial-gradient(circle, color 25%, transparent 25%) con background-size

* Rayas: repeating-linear-gradient con ángulo 45deg y stops de colores alternos

* Zigzag: SVG de path repetido o CSS con gradientes angulados en combinación

* Checks: background con linear-gradient en dos direcciones superpuestas

* Para patrones complejos: usar SVG inline como background-image con encodeURIComponent

* Animar patrones: background-position en keyframes para movimiento continuo de textura

### **Formas geométricas como elementos compositivos**

* Círculos perfectos de distintos tamaños flotando en la composición

* Rectángulos rotados que 'sobresalen' de los contenedores

* Triángulos y flechas apuntando en direcciones aleatorias

* Líneas gruesas (8-16px) que cruzan secciones como si fueran marcadores

* Semicírculos como bordes de sección (clip-path o border-radius extremo en un lado)

* Formas con borde negro grueso (outline o stroke de 3-4px) como en cómic o ilustración infantil

## **Tipografía Memphis**

### **Fuentes con espíritu Memphis**

* Display bold geométrico: Futura ExtraBold, Nunito Black, Poppins Black, Rounded Bold

* Retro sin-serif: Cooper Black, Rockwell Extra Bold, Alfa Slab One

* Handlettering con energía: Fredoka One, Righteous, Baloo Bhai, Titan One

* Monospace punk: Space Mono, VT323, Share Tech Mono (para datos y etiquetas)

* Mezcla intencionada: display retro para títulos \+ sans geométrico para body

### **Técnicas tipográficas Memphis**

* Texto con borde negro grueso (text-shadow múltiple para simular outline)

* Letras con colores alternos por caracter (span por letra con colores rotativos)

* Texto con fondo de color recortado: background-color en el span, padding generoso

* Rótulos de color sólido (badge-style): texto en blanco sobre rectángulo de color de pleno

* Tamaños de titular extremos: font-size que ocupa todo el ancho del contenedor (fit-text)

* Tracking muy positivo en subheads: letter-spacing: 0.15em en uppercase

## **Animaciones Memphis**

### **Motion con energía ochentera**

* Las animaciones son rápidas y con energía — nada de slow fade elegante

* Bouncing y spring son bienvenidos — aquí el rebote no es informal, es característico

* Los patrones de fondo se mueven lentamente en loop — el mundo Memphis nunca está quieto

* Transiciones de color abrupto (sin gradual) pueden ser intencionales en secciones

* Los elementos geométricos decorativos rotan o pulsan en loop continuo

| Animación | Duración | Descripción |
| :---- | :---- | :---- |
| Entrada de elementos | 400ms spring | scale(0) → scale(1.1) → scale(1) con bounce |
| Pattern drift | Loop 15s linear | background-position moviéndose diagonal lentamente |
| Forma flotante | Loop 4s ease-in-out | translateY(-8px) ↔ translateY(8px) en formas decorativas |
| Color flash hover | 200ms steps(1) | Cambio abrupto de color (estilo flip-flop) |
| Squiggle draw | 1s linear | SVG stroke-dashoffset reveal de izquierda a derecha |
| Memphis loader | Loop 800ms | Formas geométricas que rotan en secuencia escalonada |
| CTA hover | 300ms cubic-bezier bounce | scale(1.08) \+ rotate(±2°) \+ color swap |

## **Componentes UI Memphis**

### **Cards Memphis**

* Fondo de card: blanco con borde negro de 3px — o color sólido con borde negro

* Sombra sólida (hard shadow): box-shadow offset sin blur — ej: 6px 6px 0 \#000000

* Hover: incrementar el offset de la sombra sólida (6px → 10px) \+ ligero translate

* Patrón de fondo en el header de la card (polka dots o rayas del color de la categoría)

* Las cards no tienen border-radius o lo tienen mínimo (4px) — los ángulos son parte del estilo

### **Botones Memphis**

* Estilo hard shadow: fondo de color \+ borde negro 2-3px \+ sombra sólida 4px 4px 0 \#000

* Hover: translate(-2px, \-2px) \+ shadow 6px 6px 0 \#000 — el botón 'sube'

* Active/press: translate(4px, 4px) \+ shadow 0 0 0 — el botón 'baja'

* Formas no convencionales: botones con clip-path para recortes geométricos

* Texto en uppercase, font-weight 700+, letter-spacing mínimo 0.05em

### **Navegación Memphis**

* Navbar con fondo de patrón Memphis y texto negro/blanco de alto contraste

* Links activos: fondo de color sólido detrás del texto del link (bloque de color)

* Indicadores de sección: punto o círculo de color sólido junto al link activo

* Mobile hamburger: icono de 3 líneas de diferente longitud (efecto Memphis de asimetría)

* Dropdown: fondo blanco con borde negro 2px \+ hard shadow — sin blur, sin transparencia

## **Variables CSS para Memphis Design**

**CUSTOM PROPERTIES**

* \--memphis-red: \#FF3333

* \--memphis-blue: \#0044CC

* \--memphis-yellow: \#FFD700

* \--memphis-black: \#111111

* \--memphis-white: \#FFFEF0

* \--memphis-pink: \#FF66AA

* \--memphis-green: \#00CC44

* \--memphis-teal: \#00BBCC

* \--shadow-hard-sm: 4px 4px 0 \#111111

* \--shadow-hard-md: 6px 6px 0 \#111111

* \--shadow-hard-lg: 10px 10px 0 \#111111

* \--border-bold: 3px solid \#111111

* \--font-display: 'Fredoka One', 'Nunito Black', 'Arial Black', sans-serif

* \--font-body: 'Poppins', 'Nunito', Arial, sans-serif

* \--font-mono: 'Space Mono', 'VT323', monospace

* \--pattern-dots: radial-gradient(circle, var(--memphis-blue) 25%, transparent 26%) center/20px 20px

* \--pattern-stripes: repeating-linear-gradient(45deg, var(--memphis-yellow) 0, var(--memphis-yellow) 3px, transparent 3px, transparent 50%) 0/20px 20px

* \--transition-pop: 300ms cubic-bezier(0.34, 1.56, 0.64, 1\)

## **Anti-patrones del Memphis Design**

* NUNCA usar gradientes en fondos — el Memphis clásico es todo flat, sólido y sin profundidad

* NUNCA mezclar Memphis con estilos incompatibles sin concepto (ej: Memphis \+ Glassmorphism)

* NUNCA usar más de 5-6 colores simultáneos sin anclas de negro y blanco

* NUNCA ignorar los bordes negros — son el pegamento estructural del estilo

* NUNCA olvidar el humor: si la implementación se siente agresiva y sin alegría, algo falló

* NUNCA aplicar a productos financieros, médicos o legales — la irreverencia destruye la confianza

* NUNCA escalar Memphis a 'pequeñas dosis' sin comprometerse — a medias no funciona

* NUNCA usar blur o sombras con difuminado — el Memphis es nítido y sin suavidad

* NUNCA olvidar que es un estilo de época — hay que referenciarlo conscientemente, no inconscientemente

**09**   **Psychedelic / Groovy**

*Formas que respiran y colores que pulsan — El trip visual controlado*

| Familia | Estilos Maximalistas |
| :---- | :---- |
| **Índice** | 04 / 04 |
| **Filosofía** | Disolver los bordes de la percepción convencional a través del movimiento orgánico, el color ácido y las formas que no obedecen la geometría euclidiana |
| **Referentes** | Carteles de Grateful Dead, Woodstock 1969, Tame Impala visual identity, Adult Swim 4am aesthetics, Lofi hip hop artwork, PC Music, Drain Gang |
| **Emoción** | Alteración perceptual, euforia visual, misticismo, nostalgia lisérgica, expansión sensorial |

## **Filosofía del Psychedelic / Groovy Design**

El diseño psicodélico nació como extensión visual de la contracultura de los 60s, buscando replicar en papel y pantalla la experiencia de expansión perceptual. Sus herramientas: color como información emocional directa (no funcional), formas orgánicas que rechazan los ángulos rectos, tipografía que se mueve y deforma, y la sensación de que los elementos del diseño tienen vida propia.

### **El diseño psicodélico en la web contemporánea**

* Neo-psicodélico: versión contemporánea que mezcla referencias 60s-70s con CSS moderno

* Liquid / morphing shapes: SVG y CSS que crean formas que se transforman continuamente

* Gradient mesh animation: fondos que se mueven como lava o líquido viscoso

* Tipografía liquida: texto con deformaciones de warp o wave

* Optical illusions: patrones que crean ilusiones de movimiento o profundidad imposible

### **Variantes del estilo**

* Psicodélico clásico (60s-70s): carteles con tipografía Art Nouveau, paleta ácida original

* Groovy / retro: warmth de los 70s, naranja y marrón, formas redondeadas y amigables

* Neo-psych moderno: blobs de color, gradientes de malla, CSS animations generativas

* Vaporwave-psych: cruza con la estética vaporwave, añade niebla digital y glitch

* Dark psych: versión oscura y más intensa, fondo negro, neones, misticismo

### **Cuándo usar este estilo**

* Artistas musicales o visuales con identidad psicodélica o experimental

* Festivales de música de electrónica, psych rock, jazz experimental

* Marcas de cannabis, wellness psicodélico o neuro-diversidad (donde sea legal)

* Proyectos de arte digital, generative art, y net art

* Webs personales de diseñadores con voluntad de impacto visual extremo

* Elementos específicos dentro de productos: páginas de celebración, easter eggs

## **Paleta de Color Psicodélica**

### **Filosofía del color psicodélico**

* Los colores se eligen por su impacto emocional y su capacidad de vibrar visualmente cuando se yuxtaponen

* Colores complementarios extremos uno junto al otro crean vibración óptica (efecto simultaneous contrast)

* La saturación es máxima — los colores psicodélicos no tienen tonos sucios ni desaturados

* Los neones y fosforescentes son válidos y deseables en la variante contemporánea

* El negro como fondo de referencia hace que todos los colores brillen al máximo

| Paleta | Colores clave | Efecto visual |
| :---- | :---- | :---- |
| Clásica 60s | \#FF6600, \#FFCC00, \#FF0066, \#9900CC, \#00CC66 | Vibración ácida, energía de cartel de rock |
| Groovy 70s | \#CC5500, \#FF8C00, \#FFCC44, \#8B4513, \#228B22 | Calor orgánico, amanecer en el festival |
| Neo-psych | \#FF00FF, \#00FFCC, \#FFFF00, \#FF3300, \#0033FF | Eléctrico y contemporáneo, digital y físico |
| Dark psych | \#7700CC, \#FF00FF, \#00FFAA, \#FF6600, \#000000 | Misticismo nocturno, neón en la oscuridad |
| Cosmic / space | \#000033, \#6600CC, \#CC00FF, \#00CCFF, \#FFFFFF | Profundidad cósmica, expansión del universo |

### **Gradientes psicodélicos avanzados**

* Gradientes de malla (mesh gradients): múltiples puntos de color que crean topografía cromática

* Conic gradient para mandala de color: background: conic-gradient(from 0deg, col1, col2, col3, col1)

* Gradiente animado: @keyframes con hue-rotate(360deg) para ciclo continuo de arcoíris

* Radial gradients superpuestos con mix-blend-mode: screen para efecto de luces de color

* backdrop-filter: hue-rotate() animado sobre elementos para crear efecto psicodélico en capas

## **Formas Orgánicas y Morfología**

Las formas orgánicas son la columna vertebral del diseño psicodélico. Rechazan los ángulos y las geometrías perfectas en favor de las curvas irregulares, los blobs ameboides y las formas que parecen vivas y en movimiento constante.

### **Blobs y formas ameboides**

* SVG con paths de curvas Bezier irregulares como contenedores o elementos decorativos

* CSS clip-path: polygon() con muchos puntos para recortes orgánicos

* border-radius con valores asimétricos por esquina: 60% 40% 30% 70% / 60% 30% 70% 40%

* Animación de blob: cambiar los valores del border-radius en keyframes para morfing continuo

* Blobs como fondos de sección con position:absolute y z-index negativo

* Múltiples blobs de distintos colores superpuestos con mix-blend-mode: multiply o screen

### **Ondas y fluidos**

* Wave dividers entre secciones: SVG con path sinusoidal en el color de la siguiente sección

* CSS wave animation: SVG path de onda animado con stroke-dashoffset

* Liquid background: gradiente de malla con background-position animado

* Ripple effects: animaciones de ondas concéntricas en colores de la paleta

* Lava lamp CSS: blobs que suben y bajan lentamente con keyframes de translateY y border-radius

### **Patrones de ilusión óptica**

* Concentric circles con colores alternos que crean profundidad hipnótica

* Spirals SVG con stroke-dashoffset animado para efecto de giro continuo

* Op art patterns: CSS con radial-gradient y tamaños cuidadosamente calibrados para vibración óptica

* Moiré effect: dos patrones de grilla superpuestos con ligero offset y rotación diferente

* Tunnel pattern: perspectiva CSS con transform: perspective() en elementos anidados

## **Tipografía Psicodélica**

### **Fuentes con alma psicodélica**

* Art Nouveau / Organic: Poiret One, Josefin Sans, Philosopher, Julius Sans One

* Retro groovy: Cooper Black, ITC Benguiat, Rockwell, Alfa Slab One, Lobster

* Display experimental: Righteous, Permanent Marker, Pacifico con mucho tamaño

* Variable fonts para deformación: fuentes con axis de weight y width para animar

* Para cuerpo de texto: mantener legibilidad — Lora, Merriweather, o incluso sans neutral

### **Efectos de texto psicodélicos**

* Texto con outline múltiple (text-shadow en varias capas de diferentes colores)

* Gradiente de texto animado: background: linear-gradient animado con background-clip: text

* SVG text con filter: feTurbulence para deformación ondulante del texto

* Warp text: CSS perspective \+ rotateX sutil para texto que parece curvar en el espacio

* Rainbow text: cada letra en un span con color del espectro de la paleta psicodélica

* Glowing text: text-shadow en color neón puro \+ versión difuminada grande del mismo color

* Texto sobre imagen con mix-blend-mode: exclusion o difference para integración psicodélica

## **Animaciones Psicodélicas**

### **El movimiento como experiencia central**

* Las animaciones no son complementarias — son el corazón de la experiencia

* Los loops infinitos son la norma: el mundo psicodélico está siempre en movimiento

* La sincronía visual entre elementos (movimiento coordinado) crea sensación de organismo vivo

* El easing debe ser orgánico: ease-in-out suave o cubic-bezier personalizado sin rebotes mecánicos

* La velocidad varía: algunos elementos muy lentos (20s loops), otros con pulso (2-3s loops)

| Animación | Duración | Descripción |
| :---- | :---- | :---- |
| Blob morphing | Loop 8s ease-in-out | border-radius cambia entre 4-5 estados orgánicos |
| Hue rotation fondo | Loop 12s linear | filter: hue-rotate(0→360deg) en fondo o overlay |
| Gradient drift | Loop 10s ease-in-out | background-position 0% 50% ↔ 100% 50% en mesh gradient |
| Spiral reveal | 1500ms ease-out | stroke-dashoffset animation en SVG espiral de entrada |
| Rainbow text | Loop 5s linear | background-position en gradiente arcoíris con clip:text |
| Lava lamp blob | Loop 12s ease-in-out | translateY(-60px) ↔ translateY(0) con escala y morph simultáneos |
| Optical pulse | Loop 3s ease-in-out | scale(1) ↔ scale(1.05) en patrón óptico para crear pulsación |
| Kaleidoscope section | Loop 20s linear | rotate(0→360deg) en elemento decorativo de fondo |

### **CSS avanzado para efectos psicodélicos**

* @property \--hue: permite animar una variable CSS de tono para gradientes dinámicos

* SVG feTurbulence \+ feDisplacementMap para deformación liquida de imágenes y texto

* CSS Houdini Paint API para fondos generativos (donde esté soportado)

* backdrop-filter: hue-rotate() animado para secciones que alteran los colores debajo

* mix-blend-mode: hue o color en capas para efectos de fusión psicodélica entre elementos

* CSS trigonometric functions: sin() y cos() para animaciones de trayectoria orbital

* Canvas API para efectos de partículas y lava lamp que excedan las capacidades de CSS puro

## **Componentes UI Psicodélicos**

### **Botones y CTAs**

* Forma de blob o píldora con border-radius extremo (30px+) y fondo de gradiente animado

* Borde de gradiente animado: pseudo-elemento con hue-rotation continua

* Texto con gradiente complementario al fondo del botón

* Hover: intensificación del gradiente \+ scale(1.05) \+ glow de color psicodélico

* Partículas al click: animación de partículas de color que se dispersan (JavaScript)

### **Cards y secciones**

* Cards con fondo de blob de color y forma orgánica — no rectangulares

* Glassmorphism psicodélico: backdrop-filter: blur(20px) \+ saturate(180%) sobre fondo colorido

* Secciones separadas por wave dividers SVG animados en los colores de la paleta

* Headers con gradiente de malla que ocupa el 100% del viewport

* Fondos de card con patrón de ilusión óptica en muy baja opacidad (0.05-0.1)

## **Variables CSS para Psychedelic / Groovy**

**CUSTOM PROPERTIES**

* \--psycho-purple: \#7700CC

* \--psycho-magenta: \#FF00FF

* \--psycho-cyan: \#00FFCC

* \--psycho-yellow: \#FFFF00

* \--psycho-orange: \#FF6600

* \--psycho-bg: \#0A000F

* \--gradient-psycho: linear-gradient(135deg, \#7700CC, \#FF00FF, \#FF6600, \#FFFF00, \#00FFCC)

* \--gradient-groovy: linear-gradient(135deg, \#CC5500, \#FF8C00, \#FFCC44, \#006633)

* \--shadow-glow-purple: 0 0 20px rgba(119,0,204,0.8), 0 0 60px rgba(119,0,204,0.3)

* \--shadow-glow-magenta: 0 0 20px rgba(255,0,255,0.6), 0 0 60px rgba(255,0,255,0.2)

* \--blob-shape-1: 60% 40% 30% 70% / 60% 30% 70% 40%

* \--blob-shape-2: 40% 60% 70% 30% / 40% 70% 30% 60%

* \--blob-shape-3: 50% 50% 40% 60% / 30% 60% 40% 70%

* \--font-display: 'Cooper Black', 'Lobster', 'Righteous', cursive

* \--font-body: 'Lora', Georgia, serif

* \--transition-organic: 800ms cubic-bezier(0.45, 0.05, 0.55, 0.95)

* \--animation-hue: hue-rotate 10s linear infinite

## **Anti-patrones del Psychedelic / Groovy Design**

* NUNCA usar colores desaturados o pastel — la saturación al máximo es innegociable

* NUNCA tener formas con ángulos rectos en los elementos principales — el cuadrado es el enemigo

* NUNCA sacrificar la legibilidad del texto por un efecto psicodélico llamativo

* NUNCA animar todo simultáneamente a la misma velocidad — crea caos sin estructura

* NUNCA usar este estilo en interfaces de alta responsabilidad (banca, salud, emergencias)

* NUNCA ignorar prefers-reduced-motion — las animaciones intensas pueden causar malestar físico real

* NUNCA hacer una versión 'a medias' del estilo — o se compromete o se elige otro

* NUNCA confiar solo en color para comunicar estado — el daltonismo y la accesibilidad siempre importan

* NUNCA que los efectos tarden en cargar — el impacto visual debe ser inmediato o perder sentido

