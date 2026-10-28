**GUIA DE ESTILOS CSS**

**Estilos Editoriales**

**y Tipograficos**

Familia III de XI — 4 estilos documentados en profundidad

Documento de referencia para la generacion de CSS editorial de alta calidad. Cubre desde los fundamentos de la tipografia digital hasta los sistemas de grid de revista. Incluye filosofia, sistemas tipograficos completos, anatomia de componentes, animaciones, variables CSS y anti-patrones para cada uno de los cuatro estilos.

| \# | Estilo | Filosofia central | Emocion objetivo |
| :---- | :---- | :---- | :---- |
| 10 | Editorial Design | Cada decision de layout es una decision editorial | Autoridad intelectual |
| 11 | Typographic / Type-first | La letra no describe el diseno — la letra ES el diseno | Precision y sofisticacion |
| 12 | Brutalist Typography | El texto sin domesticar como gesto de poder | Confrontacion y urgencia |
| 13 | Magazine Layout | La pagina como seduccion visual irresistible | Deseo y aspiracion |

**10**    **Editorial Design**

*El arte de dar forma al pensamiento — Layouts que hacen del contenido una experiencia*

| Familia | Estilos Editoriales / Tipograficos |
| :---- | :---- |
| **Indice** | 01 / 04 |
| **Filosofia** | Cada decision de layout, tipografia y espacio es una decision editorial: dice quien es la publicacion y como quiere ser leida |
| **Referentes** | The New York Times, The Guardian, Monocle, Kinfolk, Works That Work, New York Magazine, The Atlantic, National Geographic digital |
| **Emocion** | Autoridad intelectual, placer de lectura profunda, confianza, sofisticacion cultural |
| **Sectores** | Medios digitales, revistas culturales, periodicos online, blogs de largo aliento, publicaciones academicas con diseno cuidado |

## **1\. Filosofia y Principios Editoriales**

El Editorial Design en web hereda cinco siglos de tradicion tipografica impresa. Su mision es resolver la tension entre la naturaleza fluida del medio digital y las demandas de legibilidad, jerarquia y estetica de la pagina impresa. El resultado es el diseno web mas cercano a la experiencia de leer una gran publicacion.

### **1.1  Los cinco pilares del diseno editorial**

* JERARQUIA: el ojo del lector debe saber siempre donde esta y que importa mas. La jerarquia visual no se impone con colores llamativos sino con tamano, peso, espacio y posicion.

* RITMO: la alternancia de bloques de texto denso, imagenes y espacio en blanco crea una cadencia que hace la lectura placentera y no agotadora.

* TENSION: los mejores layouts editoriales tienen tension entre elementos — un titulo muy grande junto a un cuerpo de letra pequena, una imagen que sangra al borde junto a un texto estrecho.

* LEGIBILIDAD: todo lo demas es irrelevante si el texto no es comodo de leer en profundidad durante 15-20 minutos seguidos.

* VOZ VISUAL: el diseno debe reflejar la personalidad editorial de la publicacion. The Guardian suena diferente a Monocle aunque ambos sean editoriales serios.

### **1.2  Tipos de publicacion y sus convenciones visuales**

| Tipo | Densidad | Tipografia dominante | Referente |
| :---- | :---- | :---- | :---- |
| Periodico digital | Alta — mucho contenido | Sans-serif robusta | NYT, Guardian, El Pais |
| Revista cultural | Media — respiro editorial | Serif elegante \+ sans | Monocle, Kinfolk, Cereal |
| Blog largo aliento | Media-baja — inmersiva | Serif legible, 18-20px | The Atlantic, Aeon, Longreads |
| Publicacion academica | Alta — datos y texto | Serif clasico | Journal de universidades |
| Newsletter premium | Baja — scannable | Sans moderna \+ serif display | Substack premium, Puck |
| Revista de fotos | Muy baja — imagen primero | Sans minimalista | National Geographic, Nat Geo |

### **1.3  El concepto de 'voz visual' editorial**

La voz visual es la suma de todas las decisiones de diseno que hacen que una publicacion sea reconocible sin leer su nombre. Se construye a traves de:

* La eleccion tipografica: que serif usa para los titulares, que sans para los cuerpos, si usa una sola familia o dos

* El sistema de color: si usa acentos de color o es monocromatica, si el color denota seccion o solo decoracion

* El tratamiento de las imagenes: blanco y negro o color, con caption o sin, como se recortan y que proporcion ocupan

* La densidad del layout: cuanto espacio en blanco hay entre elementos, si hay columnas estrechas o anchas

* El sistema de separadores: como se distinguen las secciones, si hay lineas, colores o solo espacio

## **2\. Sistema Tipografico Editorial**

La tipografia es la columna vertebral del diseno editorial. Mientras que en otros estilos la tipografia puede ser decoracion o acento, aqui es estructura. Cada decision tipografica tiene consecuencias directas sobre la experiencia de lectura.

### **2.1  La escala tipografica editorial completa**

| Nivel | Tamano | Peso | Line-height | Uso especifico |
| :---- | :---- | :---- | :---- | :---- |
| Kicker / Eyebrow | 11-12px | 600-700 | 1.3 | Etiqueta de seccion sobre el titular, UPPERCASE |
| Titular (Display) | 48-96px | 700-900 | 1.0-1.05 | Portada, feature principal, articulo estrella |
| H1 / Titular articulo | 36-48px | 600-700 | 1.1-1.15 | Titular de articulo individual |
| H2 / Subtitular | 24-30px | 600 | 1.2-1.3 | Seccion dentro del articulo o pagina |
| H3 / Cabeza de seccion | 18-22px | 600 | 1.3-1.4 | Subseccion, sidebar header |
| Deck / Sumario | 18-22px | 400 | 1.4-1.5 | Parrafo de introduccion destacado, italic o normal |
| Cuerpo de texto | 17-19px | 400 | 1.65-1.75 | Texto de articulo de largo aliento |
| Cuerpo compacto | 15-16px | 400 | 1.55-1.65 | Briefs, noticias cortas, listas |
| Caption / Pie de foto | 12-13px | 400-500 | 1.4-1.5 | Descripcion de imagen, siempre diferenciado |
| Metadata / Byline | 12-13px | 400 | 1.3 | Autor, fecha, tiempo de lectura |
| Label / Tag | 10-11px | 600-700 | 1.2 | Etiquetas de categoria, UPPERCASE \+ letter-spacing |

### **2.2  Pares tipograficos editoriales clasicos**

La combinacion de una fuente serif para titulares con una sans-serif para cuerpos (o viceversa) es la estructura tipografica mas comun y efectiva en diseno editorial web.

| Combinacion | Perfil de publicacion | Personalidad |
| :---- | :---- | :---- |
| Tiempos New Roman \+ GT America | Periodico digital moderno | Autoridad con apertura contemporanea |
| Playfair Display \+ Source Sans Pro | Revista cultural aspiracional | Elegancia accesible |
| Freight Display \+ Freight Text | Super system (misma familia) | Coherencia maxima, sofisticacion |
| Chronicle \+ Graphik | Publicacion de largo aliento premium | Profundidad intelectual |
| Canela \+ Suisse Int'l | Revista de diseno y cultura | Modernidad editorial europea |
| Georgia \+ Helvetica Neue | Periodico tradicional digitalizado | Fiabilidad y legibilidad probada |
| Domaine \+ DM Sans | Newsletter / blog premium | Calidez serif \+ claridad sans |
| Editorial New \+ Space Grotesk | Tech editorial / producto digital | Futurismo editorial |
| EB Garamond \+ Lato | Publicacion academica en linea | Tradicion humanista \+ modernidad neutral |

### **2.3  La anatomia del titular editorial**

Un titular editorial completo tiene hasta cuatro capas textuales que trabajan juntas:

* KICKER (eyebrow): texto muy pequeno encima del titular. Categoriza el articulo. Ej: 'POLITICA INTERNACIONAL'. Tipografia: uppercase, 11px, letter-spacing 0.12em, color de seccion o gris.

* TITULAR PRINCIPAL: el titulo del articulo. El nivel de mayor tamano de la pagina salvo el nombre de la publicacion. Serif en la mayoria de publicaciones.

* DECK / STANDFIRST: 1-3 frases que amplian el titular. Introduce el articulo. Tamano intermedio (18-22px), a menudo en italica o peso regular (frente al bold del titular).

* BYLINE \+ METADATA: autor, fecha, tiempo de lectura estimado. El nivel mas pequeno. Separa el area editorial del contenido informativo.

### **2.4  Reglas de detalle tipografico editorial**

* Usar comillas tipograficas verdaderas (' ' y " ") nunca comillas rectas — en CSS: content: open-quote / close-quote

* Guiones: guion corto (-) para compuestos, guion largo (--) para parenteticas. En HTML: \&mdash; nunca dos guiones.

* Numeros con letra minuscula (oldstyle figures) para texto corrido: font-variant-numeric: oldstyle-nums

* Fracciones verdaderas: font-variant-numeric: diagonal-fractions donde la fuente lo soporte

* Virgulillas y simbolos especiales: no usar sustitutos ASCII cuando existen los caracteres reales

* Texto justificado en columnas editoriales: solo si hay hyphens: auto activado — sin hyphenation el justificado crea rios blancos

* Widow y orphan control: orphans: 3; widows: 3 en CSS para evitar lineas sueltas al final de columnas

* Espaciado entre parrafos: text-indent en el primer parrafo con margin-top 0, o margin-top 1em sin indent. Nunca ambos.

## **3\. Sistema de Layout y Grid Editorial**

El layout editorial en web combina la rigidez matematica de la grilla impresa con la flexibilidad del medio digital. El objetivo es crear composiciones que dirijan la lectura de forma natural mientras permiten la variedad visual necesaria para sostener el interes del lector.

### **3.1  La grilla editorial de 12 columnas**

* Grilla base: 12 columnas con gutter de 24-32px — la maxima flexibilidad editorial

* Maxima anchura del contenedor de texto: 720-760px para columnas de lectura profunda (aprox. 70 caracteres)

* Columnas de texto: 7-8 cols de 12 para el cuerpo principal

* Sidebar: 4-5 cols — contenido relacionado, publicidad o informacion complementaria

* Full-bleed: 12 cols para imagenes de apertura de articulo y hero sections

* La grilla debe ser invisible al lector pero sentida — cuando algo esta fuera de la grilla, se nota mal

### **3.2  Tipos de layout de articulo editorial**

| Tipo de layout | Estructura | Cuando usarlo |
| :---- | :---- | :---- |
| Single column, centered | 1 columna 680-720px centrada | Largo aliento profundo, ensayos, newsletters |
| Main \+ sidebar | 8+4 cols — contenido \+ sidebar | Noticias, articulos con contenido relacionado |
| Two-column editorial | 6+6 cols con gutter amplio | Entrevistas, puntos de vista enfrentados |
| Full-bleed hero \+ narrow body | 12 cols imagen / 6-8 cols texto | Features, reportajes fotograficos |
| Modular magazine | Grid irregular con cards mixtas | Portadas, indices de seccion, sumarios |
| Immersive scroll | Secciones full-viewport con texto superpuesto | Features especiales, periodismo narrativo |
| Data \+ narrative | Visualizacion \+ columna de texto paralela | Periodismo de datos, investigaciones |

### **3.3  Jerarquia visual en la portada editorial**

La portada (homepage o front page) de una publicacion editorial es el ejercicio de jerarquia mas complejo del diseno web. Debe comunicar inmediatamente:

* LA NOTICIA PRINCIPAL: el articulo mas importante debe ser visualmente dominante — titulo mayor, imagen mayor, posicion superior izquierda o central

* EL SEGUNDO NIVEL: 2-3 historias secundarias de importancia similar — tamanos coherentemente menores al principal

* EL TERCER NIVEL: contenido de relleno, noticias breves, contenido de servicio — tamano compacto, densidad mayor

* LA SECCION Y LA MARCA: cabecera con nombre, navegacion de secciones, identidad visual consistente en cada carga

* CONTENIDO URGENTE VS. EVERGREEN: el layout debe permitir diferenciar breaking news de contenido atemporal

### **3.4  El tratamiento de las imagenes en layout editorial**

* Imagen hero: full-width (100vw o 100% del contenedor de articulo), aspect-ratio 16:9 o 3:2

* Imagen in-text: puede sangrar al ancho de la columna o al ancho del contenedor completo para enfasis

* Imagen con caption: el caption va SIEMPRE debajo, nunca encima, tipografia diferenciada (12-13px, italic o gris)

* Credito de foto: dentro del caption o superpuesto en la esquina inferior derecha de la imagen (10-11px, uppercase)

* Galerias: carrusel con controles visibles, indicador de progreso, posibilidad de ver en pantalla completa

* Infografias: siempre con version movil pensada — si no escala, ofrecer version texto alternativa

* Videos embebidos: aspect-ratio 16:9, siempre con subtitulos disponibles, autoplay desactivado por defecto

## **4\. Sistema de Color Editorial**

El color en el diseno editorial tiene una funcion primariamente semantica: comunica seccion, urgencia, tipo de contenido y marca. Las grandes publicaciones usan el color con extrema economia — lo que hace que cuando aparece, sea poderoso.

### **4.1  Arquitectura de color en publicaciones editoriales**

| Elemento | Estrategia de color | Ejemplos reales |
| :---- | :---- | :---- |
| Color de marca | 1 color distintivo y consistente | NYT: negro. Guardian: azul. Atlantic: rojo. Monocle: azul marino |
| Colores de seccion | 1 color por seccion editorial principal | Politica: rojo. Cultura: morado. Economia: verde. Deporte: azul |
| Color de urgencia | Rojo para breaking news y alertas | Consistente en toda la industria periodistica |
| Fondo de pagina | Blanco puro o blanco calido levemente crema | Facilita la lectura prolongada vs. blanco brillante |
| Texto principal | Negro o negro muy oscuro (\#111 o \#0A0A0A) | Maximo contraste para lectura de largo aliento |
| Texto secundario | Gris medio (\#666-\#888) | Metadata, captions, informacion contextual |
| Separadores | Gris muy claro o linea de color de marca | Estructura invisible que organiza sin distraer |
| Links | Color de marca o azul clasico, underline | Siempre diferenciados del texto, nunca solo por color |

### **4.2  Dark mode en publicaciones editoriales**

* Dark mode no es opcional en 2024 — las grandes publicaciones lo ofrecen todas

* Fondo dark: no negro puro (\#000) — usar \#0F0F0F o \#141414 para reducir contraste extremo

* Texto dark: no blanco puro (\#FFF) — usar \#E8E8E8 o \#F0F0F0 para la misma razon

* Imagenes en dark mode: considerar filter: brightness(0.9) para reducir el impacto de imagenes muy brillantes

* El color de marca puede necesitar ajuste: un rojo brillante sobre negro puede ser demasiado agresivo

* Los separadores en dark mode deben ser mas claros que el fondo pero sutiles: rgba(255,255,255,0.1)

## **5\. Componentes UI Editoriales**

### **5.1  Articulo de largo aliento — estructura completa**

* PROGRESS BAR: indicador de lectura en la parte superior (posicion fija, height 3px, color de marca)

* BYLINE SECTION: foto del autor (32-40px circular) \+ nombre \+ seccion \+ fecha \+ tiempo de lectura

* IMAGEN HERO: full-width con caption y credito — puede ser fotografica o ilustracion editorial

* DECK: parrafo de introduccion en tamano mayor (18-20px) que diferencia el articulo de la web informativa

* PRIMERA LETRA CAPITULAR (DROP CAP): ::first-letter grande (3-4 lineas de altura) en el primer parrafo

* PULLQUOTES: citas destacadas del texto en tamano mayor, con separacion visual clara del cuerpo

* ASIDE / ANOTACIONES: informacion contextual al margen — en desktop puede ir en la columna lateral

* RELATED ARTICLES: al final o en sidebar — presentados como mini-cards editoriales

* SECCION DE AUTOR: bio expandida con foto mas grande y links a otros articulos al final del texto

### **5.2  Cards editoriales — sistema de cards de noticias**

| Tipo de card | Estructura visual | Contenido |
| :---- | :---- | :---- |
| Hero card | Imagen 16:9 \+ titulo grande (28-36px) \+ deck \+ meta | Historia principal de portada |
| Feature card | Imagen 3:2 \+ titulo medio (22-26px) \+ meta | Historias secundarias destacadas |
| Brief card | Sin imagen o miniatura pequeña \+ titulo (16-18px) \+ meta | Noticias breves, actualizaciones rapidas |
| Opinion card | Foto de autor circular \+ titulo \+ nombre del columnista | Columnas de opinion y analisis |
| Video card | Thumbnail 16:9 con play overlay \+ titulo \+ duracion | Contenido de video |
| Gallery card | Grid de 4 imagenes en miniatura \+ titulo | Reportajes fotograficos, galerias |
| Data card | Visualizacion pequeña \+ titulo \+ contexto | Articulos de datos, graficos |
| Sponsored card | Igual que feature pero con etiqueta 'PATROCINADO' visible | Contenido de marca, advertorial |

### **5.3  Sistema de navegacion editorial**

* CABECERA: altura fija, nombre de la publicacion prominente (izquierda o centrado), fecha en desktop

* NAVEGACION DE SECCIONES: lista horizontal de secciones editoriales en la cabecera o en una segunda barra

* SECCION ACTIVA: indicada por color de seccion o underline — siempre clara para orientar al lector

* BUSQUEDA: icono de lupa con campo desplegable — fundamental en publicaciones con archivo profundo

* SUSCRIPCION: CTA visible pero no agresivo — la relacion editorial pide respeto, no presion

* SCROLL BEHAVIOR: sticky header que se reduce en scroll down, aparece en scroll up (header inteligente)

* BREADCRUMB: en articulos, indica la seccion y sub-seccion — ayuda a la navegacion contextual

### **5.4  Pullquotes y elementos de enfasis en texto**

* PULLQUOTE tipo revista: texto grande (24-32px), italic, con separadores horizontales arriba y abajo

* PULLQUOTE tipo periodico: borde izquierdo de color (4-6px), texto indent, tamano mediano (20-24px)

* BLOCKQUOTE de cita: indentado (40-60px izquierda), tipografia diferenciada, sin comillas graficas falsas

* HIGHLIGHT BOX: fondo de color muy suave (tono pastel del color de marca), para datos clave o estadisticas

* NUMERO GRANDE: estadistica principal en font muy grande (64-96px) con contexto en texto pequeno debajo

* TOOLTIP / DEFINICION: hover sobre terminos tecnicos con definicion en popover — vital en periodismo especializado

## **6\. Animaciones y Motion Editorial**

El motion en diseno editorial es funcional y sutil. El lector ha venido a leer, no a ver una exhibicion de animaciones. Cada movimiento tiene una justificacion de UX.

| Animacion | Duracion | Proposito y descripcion |
| :---- | :---- | :---- |
| Page load / articulo | 200ms fade-in | Evitar flash de contenido sin estilos (FOUC) |
| Progress bar de lectura | Continua, scroll-linked | Indicador de posicion en el texto — anchura \= % leido |
| Lazy load de imagenes | 300ms opacity 0 a 1 | Imagenes que aparecen al entrar en viewport |
| Sticky header reduce tamano | 200ms ease-out | Header pasa de 80px a 52px en el primer scroll |
| Header reaparece en scroll-up | 150ms ease-out | Slide-down desde \-52px a 0 al invertir scroll |
| Hover en card de articulo | 200ms | Titulo con color de acento o underline reveal sutil |
| Imagen hover en cards | 300ms ease-out | scale(1.03) muy sutil dentro del contenedor con overflow:hidden |
| Tooltip / definicion | 150ms fade-in | Aparece 200ms despues del hover para evitar activaciones accidentales |
| Infinite scroll load | Skeleton screen 300ms | Placeholder animado antes de cargar el siguiente batch |
| Share button pulse | 600ms una vez | Animacion de atencion discreta al llegar al final del articulo |

### **6.1  Periodismo inmersivo — scroll storytelling**

* SCROLL-TRIGGERED REVEALS: secciones que aparecen (fade \+ translateY) al entrar en viewport — Intersection Observer

* PARALLAX EDITORIAL: la imagen de fondo se mueve mas lento que el texto — factor 0.3-0.5x, nunca en texto

* STICKY TEXT sobre imagen scrollable: el texto se queda fijo mientras la imagen cambia debajo — position: sticky

* TRANSICIONES DE CAPITULO: cambios de fondo de color o imagen al avanzar entre capitulos del reportaje

* ANIMACION DE DATOS EN SCROLL: graficos que se 'dibujan' cuando llegan al viewport — SVG stroke-dashoffset

* VIDEO BACKGROUND: video de fondo en sections hero de reportajes especiales — autoplay, muted, loop obligatorios

## **7\. Variables CSS para Editorial Design**

   
/\* \=== EDITORIAL DESIGN — CSS CUSTOM PROPERTIES \=== \*/

/\* Tipografia \*/  
\--font-display:      'Tiempos Headline', 'Playfair Display', Georgia, serif;  
\--font-body:         'GT America', 'Source Sans Pro', Helvetica, sans-serif;  
\--font-mono:         'Courier Prime', Courier, monospace;

/\* Escala tipografica editorial \*/  
\--fs-kicker:         0.6875rem;   /\* 11px \*/  
\--fs-caption:        0.75rem;     /\* 12px \*/  
\--fs-meta:           0.8125rem;   /\* 13px \*/  
\--fs-body-sm:        0.9375rem;   /\* 15px \*/  
\--fs-body:           1.0625rem;   /\* 17px \*/  
\--fs-body-lg:        1.125rem;    /\* 18px \*/  
\--fs-deck:           1.25rem;     /\* 20px \*/  
\--fs-h3:             1.375rem;    /\* 22px \*/  
\--fs-h2:             1.75rem;     /\* 28px \*/  
\--fs-h1:             2.5rem;      /\* 40px \*/  
\--fs-display:        clamp(2.5rem, 5vw, 5rem);

/\* Line heights \*/  
\--lh-tight:          1.1;  
\--lh-heading:        1.25;  
\--lh-deck:           1.45;  
\--lh-body:           1.7;  
\--lh-loose:          1.85;

/\* Letter spacing \*/  
\--ls-kicker:         0.12em;  
\--ls-heading:        \-0.02em;  
\--ls-display:        \-0.03em;  
\--ls-body:           0;

/\* Layout \*/  
\--content-width:     720px;  
\--wide-width:        960px;  
\--full-width:        1200px;  
\--col-gap:           2rem;  
\--section-gap:       5rem;  
\--reading-width:     68ch;

/\* Color editorial \*/  
\--color-ink:         \#0A0A0A;  
\--color-ink-2:       \#444444;  
\--color-ink-3:       \#888888;  
\--color-paper:       \#FFFFFF;  
\--color-paper-warm:  \#FDFAF6;  
\--color-rule:        \#E0E0E0;  
\--color-brand:       \#B81C1C;   /\* ajustar por publicacion \*/  
\--color-section-1:   \#B81C1C;   /\* politica \*/  
\--color-section-2:   \#1A5C9A;   /\* cultura \*/  
\--color-section-3:   \#1A7A3C;   /\* economia \*/

/\* Transiciones \*/  
\--transition-read:   200ms ease-out;  
\--transition-hover:  150ms ease;  
 

## **8\. Anti-patrones del Editorial Design**

* NUNCA usar text-decoration: none en links dentro de cuerpo de texto — en editorial, los links DEBEN ser underlined

* NUNCA columnas de texto mas anchas de 80 caracteres — la lectura profunda se vuelve incomoda

* NUNCA justificar texto sin hyphenation activa — crea rios blancos que arruinan el ritmo de lectura

* NUNCA usar mas de 2 familias tipograficas activas simultaneamente en una publicacion

* NUNCA titles en lowercase sin intencion clara de marca — las mayusculas en titulares tienen historia y razon

* NUNCA imagenes sin atribucion o caption — en periodismo, la autoria de la imagen es obligacion etica y legal

* NUNCA autoplay de video con audio en articulos de lectura — es una de las experiencias mas intrusivas

* NUNCA publicidad que compite visualmente con el contenido editorial — destruye la confianza del lector

* NUNCA truncar titulares con ellipsis sin que el titular completo sea accesible via tooltip o click

* NUNCA ignorar los tiempos de carga — una publicacion editorial que tarda en cargar pierde credibilidad

* NUNCA diseno sin accesibilidad: los lectores de publicaciones serias incluyen personas mayores y con discapacidades visuales

**11**    **Typographic / Type-first**

*La letra como imagen — Cuando el texto es el diseno*

| Familia | Estilos Editoriales / Tipograficos |
| :---- | :---- |
| **Indice** | 02 / 04 |
| **Filosofia** | En ausencia de imagenes, colores e iconos, la tipografia debe cargar todo el peso visual. La letra no describe el diseno — la letra ES el diseno. |
| **Referentes** | I Love Typography, Fonts In Use, Type Wolf, A2/SW/HK studio, Commercial Type, Klim Type Foundry, Emigre, sitio de Erik Spiekermann |
| **Emocion** | Precision intelectual, confianza en el detalle, admiracion craft, sofisticacion sin ostentacion |
| **Sectores** | Agencias de branding tipografico, foundries de fuentes, publicaciones especializadas en diseno, portfolios de disenadores, libros digitales de arte |

## **1\. Filosofia del Type-First Design**

El Type-First Design parte de una restriccion radical: si la tipografia no puede sostener el diseno sola, el diseno falla. Es el estilo de los disenadores que entienden las fuentes como objetos culturales con historia, caracter y personalidad propias. No es minimalismo por falta de recursos — es confianza absoluta en el poder expresivo de la letra.

*Si la tipografia no puede sostener el diseno por si sola, el diseno no esta terminado.*

### **1.1  Los principios del diseno type-first**

* LA FUENTE ES EL MENSAJE: la eleccion tipografica comunica antes de que el lector lea una sola palabra — el tipo tiene voz propia

* EL CONTRASTE TIPOGRAFICO ES COMPOSICION: tamaño, peso, estilo y color crean tension visual sin necesidad de graficos

* EL ESPACIO EN BLANCO ES RESPETO: el espacio alrededor del texto no es vacio — es la sala en la que el texto vive

* LA GRILLA EMERGE DE LA TIPOGRAFIA: el modulo de la grilla se deriva de las proporciones de la caja tipografica, no al reves

* LA JERARQUIA ES ARQUITECTURA: la estructura de la informacion se hace visible a traves del diseno tipografico puro

* CADA DETALLE IMPORTA: el kern entre dos letras especificas, la altura de la x, el angulo de las italilas — todo comunica

### **1.2  Casos de uso del Type-First Design**

* Foundries y fabricantes de fuentes tipograficas — su producto ES la tipografia

* Estudios de diseno grafico que quieren mostrar su conocimiento tipografico

* Portfolios de disenadores editoriales y tipografos

* Publicaciones especializadas en diseno, arte y cultura visual

* Marcas de lujo que comunican exclusividad a traves de la calidad tipografica

* Invitaciones digitales, carteleria tipografica y piezas de comunicacion de alto nivel

* Editoriales y sellos que quieren comunicar rigor intelectual

## **2\. Anatomia Tipografica y Fundamentos**

Para disenar con tipografia como protagonista es imprescindible conocer su anatomia y terminologia. Estos conceptos deben traducirse a decisiones concretas de CSS.

### **2.1  Terminologia esencial y su aplicacion CSS**

| Termino tipografico | Definicion | Implicacion en CSS |
| :---- | :---- | :---- |
| Cap height | Altura de las mayusculas desde la linea base | Afecta al vertical-rhythm y al tamano real percibido |
| x-height | Altura de la letra 'x' minuscula | Fuentes con x-height alta son mas legibles en pantalla |
| Ascendentes | Partes que suben sobre la altura de x | Determina el espacio necesario entre lineas (line-height) |
| Descendentes | Partes que bajan bajo la linea base (g, p, q) | Requiere line-height adicional para no cortarse con la linea inferior |
| Tracking / Letter-spacing | Espacio entre todos los caracteres | letter-spacing en CSS — positivo abre, negativo cierra |
| Kerning | Espacio entre pares especificos de letras (AV, To) | font-kerning: normal activa el kerning de la fuente |
| Leading / Line-height | Espacio entre lineas de texto | line-height: 1.5 \= 1.5x el tamano de la fuente |
| Ligatura | Caracteres que se fusionan (fi, fl, ffi) | font-variant-ligatures: common-ligatures |
| Numeros tabulares | Numeros de anchura fija para tablas | font-variant-numeric: tabular-nums |
| Smallcaps | Mayusculas a la altura de la x | font-variant-caps: small-caps |
| Optical sizing | Variaciones del diseno segun tamano de uso | font-optical-sizing: auto en variable fonts |
| Variable font axes | Ejes de variacion: weight, width, optical size | font-variation-settings: 'wght' 400, 'wdth' 100 |

### **2.2  Clasificacion tipografica y caracter visual**

| Categoria | Caracteristicas | Personalidad | Ejemplos |
| :---- | :---- | :---- | :---- |
| Serif Old Style | Remates diagonales, contraste bajo, eje inclinado | Humanista, calida, clasica | Garamond, Caslon, Jenson |
| Serif Transitional | Remates horizontales, contraste medio, eje vertical | Equilibrada, autoridad moderada | Times New Roman, Baskerville |
| Serif Moderno (Didone) | Contraste extremo thick/thin, remates finos horizontales | Fria, elegante, dramatica | Bodoni, Didot, HTF Didot |
| Slab Serif | Remates rectangulares de peso similar al trazo | Robusta, americana, directa | Rockwell, Clarendon, Archer |
| Sans Grotesque | Sin remates, terminaciones planas, geometria irregular | Neutral, funcional, urbana | Helvetica, Akzidenz, Unica |
| Sans Geometrico | Basado en circulos y lineas perfectas | Moderna, limpia, fria | Futura, Geometric 415, Avenir |
| Sans Humanista | Proporciones del serif clasico sin remates | Calida, legible, accesible | Gill Sans, Optima, Frutiger |
| Display / Decorativa | Diseniada para uso a gran tamano | Variable — depende del diseno | Abril Fatface, Cooper, Lobster |
| Variable Fonts | Un archivo con multiples variaciones | Flexible y moderna | Recursive, Amstelvar, Fraunces |

## **3\. Tecnicas de Composicion Tipografica**

### **3.1  Contraste tipografico — los seis tipos**

* CONTRASTE DE TAMANO: un titular de 96px junto a un cuerpo de 16px — la diferencia extrema crea jerarquia poderosa

* CONTRASTE DE PESO: Thin (100) junto a Black (900) en la misma linea o parrafo — el tension weight contrast

* CONTRASTE DE ESTILO: roman vs. italic — la italic no es solo enfasis, es una voz diferente dentro del texto

* CONTRASTE DE COLOR: negro sobre blanco vs. gris sobre blanco — la reduccion de contraste de color tambien es tecnica

* CONTRASTE DE FORMA: serif vs. sans en la misma composicion — la diferencia morfologica crea separacion de niveles

* CONTRASTE DE ESPACIADO: texto muy apretado (tracking \-0.05em) junto a texto con mucho tracking (0.2em)

### **3.2  Composicion tipografica avanzada — CSS moderno**

   
/\* Titulares que se ajustan al ancho del contenedor \*/  
.headline-fit { font-size: clamp(2rem, 8vw, 8rem); }

/\* Texto que llena exactamente el contenedor (fit-text) \*/  
.headline-fill { font-size: calc(100vw / (var(--chars) \* 0.6)); }

/\* Variable font: animar peso al hacer hover \*/  
.type-hover {  
  font-variation-settings: 'wght' 400;  
  transition: font-variation-settings 300ms ease;  
}  
.type-hover:hover {  
  font-variation-settings: 'wght' 900;  
}

/\* Titulares con optical size automatico \*/  
.display-title {  
  font-optical-sizing: auto;  
  font-size: clamp(3rem, 10vw, 10rem);  
  letter-spacing: \-0.04em;  
  line-height: 1.0;  
}

/\* Smallcaps verdaderas (no simuladas) \*/  
.label-caps {  
  font-variant-caps: small-caps;  
  letter-spacing: 0.12em;  
  font-size: 0.9em;  
}

/\* Numeros tabulares para datos \*/  
.data-numbers {  
  font-variant-numeric: tabular-nums lining-nums;  
}

/\* Kerning y ligaduras optimas \*/  
.body-text {  
  font-kerning: normal;  
  font-variant-ligatures: common-ligatures;  
  text-rendering: optimizeLegibility;  
}  
 

### **3.3  Sistemas de escala tipografica modular**

Una escala tipografica modular es un conjunto de tamaños que se derivan matematicamente de un tamano base y una razon de escala. Esto garantiza armonia entre todos los tamaños tipograficos del sistema.

| Escala | Razon | Uso | Paso calculado | Desde base 16px |
| :---- | :---- | :---- | :---- | :---- |
| Menor segunda | 1.067 | Textos muy densos, datos | Muy pequeno | 17px, 18px, 19px, 21px |
| Mayor segunda | 1.125 | Interfaces UI densas | Sutil | 18px, 20px, 23px, 25px |
| Menor tercera | 1.2 | Uso general UI y web | Equilibrado | 19px, 23px, 27px, 33px |
| Mayor tercera | 1.25 | Publicaciones editoriales | Comodo | 20px, 25px, 31px, 39px |
| Cuarta justa | 1.333 | Editoriales con rango amplio | Expresivo | 21px, 28px, 37px, 50px |
| Quinta justa | 1.5 | Display y titulares con impacto | Dramatico | 24px, 36px, 54px, 81px |
| Octava justa | 2.0 | Solo para displays extremos | Muy dramatico | 32px, 64px, 128px |

### **3.4  Text-overflow y composicion de texto largo**

* COLUMNAS CSS: column-count: 2-3 para texto largo en viewport ancho — evitar con column-gap insuficiente

* INITIAL LETTER (drop cap nativo CSS): initial-letter: 3 para letra capital que ocupa 3 lineas — soporte creciente

* WRAP SHAPES: shape-outside con clip-path para texto que rodea formas irregulares (soporte webkit)

* HANGING PUNCTUATION: hanging-punctuation: first last — las comillas de apertura cuelgan en el margen

* TEXT BALANCE: text-wrap: balance para titulares multili­nea que se distribuyen equitativamente (Chrome 114+)

* HYPHENATION: hyphens: auto con lang='es' para corte de palabras segun el idioma

* OVERFLOW WRAP: overflow-wrap: break-word para evitar que URLs y palabras largas rompan el layout

## **4\. Type-First en Practica — Casos de Uso**

### **4.1  Portada tipografica pura**

* Un solo titular de gran tamano (100-200px) que ocupa todo el viewport — la imagen ES el texto

* Uso de font-size: clamp() para que el titular siempre llene el viewport sin overflow

* Solo 2 elementos: el titular y un CTA o navegacion minima — nada mas

* El fondo puede ser de color solido o una imagen de muy baja opacidad que no compita

* Kerning ajustado al extremo: en titulares mayores de 80px, ajustar manualmente letter-spacing

### **4.2  Seccion hero con contraste de pesos**

* Combinar en la misma linea peso thin y black: 'El' en thin 100 \+ 'MANIFIESTO' en black 900

* Los pesos contrarios crean un ritmo visual que hace el titular memorable sin imagenes

* Animar los pesos con variable fonts: font-variation-settings animado en hover o en scroll

* Mantener el color monocromatico — el contraste de peso es suficientemente poderoso

### **4.3  Texto como patron de fondo**

* Palabra o frase repetida en muy baja opacidad (0.04-0.08) como textura de fondo de seccion

* Implementacion: posicion absolute, z-index \-1, font-size muy grande, color inherit con opacity

* Rotacion a 45° o \-45° para que la textura no compita con el texto principal

* Solo funciona con tipografias de gran presencia visual — serif de alto contraste o sans bold

## **5\. Variables CSS para Type-First Design**

   
/\* \=== TYPE-FIRST DESIGN — CSS CUSTOM PROPERTIES \=== \*/

/\* Una sola familia con variaciones de peso amplio \*/  
\--font-primary:  'Neue Haas Grotesk', 'Helvetica Neue', Arial, sans-serif;  
\--font-secondary: 'Canela', 'Tiempos', Georgia, serif; /\* para contraste \*/

/\* Weights del sistema \*/  
\--weight-thin:    100;  
\--weight-light:   300;  
\--weight-regular: 400;  
\--weight-medium:  500;  
\--weight-bold:    700;  
\--weight-black:   900;

/\* Escala de la cuarta justa (ratio 1.333) desde 16px \*/  
\--fs-xs:      0.75rem;     /\* 12px \*/  
\--fs-sm:      0.875rem;    /\* 14px \*/  
\--fs-base:    1rem;        /\* 16px \*/  
\--fs-md:      1.333rem;    /\* 21px \*/  
\--fs-lg:      1.777rem;    /\* 28px \*/  
\--fs-xl:      2.369rem;    /\* 38px \*/  
\--fs-2xl:     3.157rem;    /\* 51px \*/  
\--fs-3xl:     4.209rem;    /\* 67px \*/  
\--fs-display: clamp(4rem, 10vw, 10rem);

/\* Tracking \*/  
\--ls-tight:   \-0.04em;  
\--ls-heading: \-0.02em;  
\--ls-normal:   0;  
\--ls-wide:     0.06em;  
\--ls-caps:     0.12em;

/\* Line heights \*/  
\--lh-display: 1.0;  
\--lh-heading: 1.15;  
\--lh-subhead: 1.3;  
\--lh-body:    1.65;

/\* Colores (monocromaticos) \*/  
\--color-ink:      \#0A0A0A;  
\--color-ink-mid:  \#555555;  
\--color-ink-soft: \#999999;  
\--color-paper:    \#FFFFFF;  
 

## **6\. Anti-patrones del Type-First Design**

* NUNCA mezclar mas de 2 familias tipograficas — la restriccion es la disciplina

* NUNCA usar pesos intermedios como principales — los extremos (thin y black) crean el drama necesario

* NUNCA compensar con color lo que la tipografia no logra sola — si falla el tipo, cambiar el tipo

* NUNCA usar tipografias de sistema (Arial, Times) como solucion de fallback visible — elegir fuentes web que carguen

* NUNCA type-first sin haber dominado la tipografia — el estilo exige conocimiento real, no solo estetica

* NUNCA ignorar la carga de fuentes — 8 weights de una variable font puede ser un solo archivo; 8 fuentes separadas son 8 requests

* NUNCA text-decoration: underline en titulares — los titulares no llevan subrayado nunca

* NUNCA olvidar el contraste de accesibilidad — los grises sutiles y elegantes pueden no superar WCAG AA

**12**    **Brutalist Typography**

*Crudo, honesto, sin disculpas — El poder del texto sin domesticar*

| Familia | Estilos Editoriales / Tipograficos |
| :---- | :---- |
| **Indice** | 03 / 04 |
| **Filosofia** | El tipo brutalista rechaza la comodidad del buen gusto. La letra como materia bruta, sin pulir, sin suavizar — su impacto viene de la honestidad de lo no domesticado. |
| **Referentes** | Bloomberg Businessweek covers, Vice Media early identity, DayPoet, Balenciaga digital, Virgil Abloh typography, Dazed & Confused, i-D Magazine |
| **Emocion** | Confrontacion, urgencia, irreverencia inteligente, anti-establishment con estetica, poder sin pretension |
| **Sectores** | Moda vanguardista, medios de contracultura, arte y cultura experimental, marcas que quieren confrontar a su audiencia |

## **1\. Filosofia y Principios del Brutalismo Tipografico**

El brutalismo tipografico hereda del movimiento brutalista en arquitectura (Corbusier, Rudolph) su etica de la honestidad material: el texto se presenta sin adornos, sin suavizar, sin el barniz del 'buen diseno'. Pero donde el web brutalismo rechaza el CSS, el brutalismo tipografico domina la tipografia profundamente para transgredir sus reglas conscientemente.

*Las reglas tipograficas no existen para seguirse. Existen para que, cuando las rompas, sepas exactamente por que y que estas diciendo.*

### **1.1  Los seis gestos del brutalismo tipografico**

* ESCALA EXTREMA: titulares tan grandes que las letras se fragmentan al borde del viewport — la letra como arquitectura

* MONOCROMIA RADICAL: negro y blanco exclusivamente, o un solo color de impacto — el color es debilidad en el brutalismo puro

* DENSIDAD MAXIMA: texto apretado sin respiro, columnas estrechas, sin espacio entre parrafos — la informacion como masa

* DISTORSION INTENCIONAL: escalas deformadas, stretching horizontal o vertical del texto — la fuente violada como gesto

* CONTRADICCION DE ESCALA: un titulo enorme junto a texto microscópico en la misma composicion

* ROTURA DE LAYOUT: texto que sangra fuera del viewport, que se superpone a otros elementos, que ignora la grilla

### **1.2  Brutalismo tipografico vs. Brutalismo web**

| Aspecto | Brutalismo Web | Brutalismo Tipografico |
| :---- | :---- | :---- |
| CSS | Minimo o ninguno — HTML crudo | CSS sofisticado — domina la tipografia |
| Color | Los defaults del navegador | Negro/blanco absolutos o 1 color impacto |
| Grilla | No hay — flujo natural del HTML | Hay grilla pero se rompe intencionalmente |
| Tipografia | Times New Roman, links azules | Grotesca condensada o display extremo, custom |
| Imagenes | Sin estilos, tamano natural | Blanco y negro, tratadas o ausentes |
| Filosofia | Anti-CSS, raw, accesibilidad total | Maxima maestria tipografica expresada como transgresion |
| Audiencia | Puristas del HTML, developers | Industria de la moda, arte, cultura de vanguardia |

### **1.3  Cuando usar Brutalismo Tipografico**

* Marcas de moda de vanguardia que necesitan posicionarse como anti-establishment

* Publicaciones culturales que quieren confrontar a su lector, no complacerlo

* Artistas y creativos con voz fuerte que quieren una presencia digital perturbadora

* Festivales, eventos o lanzamientos que quieren crear impacto inmediato y memorable

* Momentos especificos dentro de un producto: paginas de error, estados vacios con actitud, portadas de campana

## **2\. Tipografia Brutalista — Seleccion y Uso**

### **2.1  Fuentes con caracter brutalista**

| Categoria | Fuentes | Uso brutalista |
| :---- | :---- | :---- |
| Grotesca condensada | Impact, Haettenschweiler, Bebas Neue, Anton | Titulares que llenan todo el viewport |
| Grotesca extendida | Archivo Black, Black Han Sans, Big Shoulders | Titulares con presencia horizontal dominante |
| Grotesca neutra radical | Helvetica Neue Ultra Condensed, Arial Narrow | La neutralidad como acto brutalista |
| Slab serif de impacto | Rockwell ExtraBold, Plaak, Nilland | Peso del slab como martillo visual |
| Monospace brutalista | Courier, Space Mono, Letter Gothic | El tipo de maquina de escribir como gesto de urgencia |
| Sans de sistema | Arial Black, Verdana Bold — las 'feas' del sistema | Lo anti-elegante como declaracion |
| Display experimental | Neue Machina, Monument Grotesk, Authentic | Grotescas contemporaneas con actitud |

### **2.2  Tecnicas de composicion brutalista**

* TITULARES OVERFLOW: font-size calculado para que las letras se corten por el borde — overflow: hidden en el contenedor

* TEXTO STACK SIN INTERLINEA: line-height: 0.85-0.9 para que los descendentes de una linea toquen los ascendentes de la siguiente

* TRACKING NEGATIVO EXTREMO: letter-spacing: \-0.08em a \-0.12em — las letras casi se tocan o se superponen

* CONDENSED STRETCH: transform: scaleX(0.6) para condensar aun mas tipografias ya condensadas

* EXTENDED STRETCH: transform: scaleX(1.4-1.6) para extender una grotesca normal a maxima anchura

* MIX CASE INTENCIONAL: alternancia de mayusculas y minusculas como gesto — no error sino decision

* TEXTO VERTICAL: writing-mode: vertical-rl para titulares de seccion o columnas laterales

* SUPERPOSICION DE TEXTO: z-index y posicionamiento para que titulares se superpongan a contenido

### **2.3  El uso del espacio en el brutalismo tipografico**

El brutalismo tipografico tiene una relacion paradojica con el espacio: puede ser extremadamente denso (texto sin respiro, columnas apretadas) o extremadamente abierto (un solo titular en todo el viewport). Lo que rechaza es el espacio 'comodo' — el espacio de buen gusto que hace todo facil.

* Espacio extremo abierto: un titular en 120px en todo el viewport — silencio brutal antes del contenido

* Espacio extremo cerrado: texto sin padding, sin margen, pegado al borde del navegador

* El espacio como confrontacion: hacer que el lector se sienta incomodo en su relacion con el texto

* Sin redondeo: border-radius: 0 en todos los elementos — los angulos son parte de la dureza brutalista

## **3\. Sistema de Color Brutalista**

### **3.1  Paleta brutalista pura**

* MODO MONOCROMO: negro \#000000 puro y blanco \#FFFFFF puro — sin grises — el contraste maximo como declaracion

* MODO UN ACENTO: negro/blanco \+ 1 color de impacto maximo — rojo \#FF0000 puro, amarillo \#FFFF00, lima \#00FF00

* El color del acento se usa en 1-2 elementos maximos — su rareza lo hace poderoso

* NUNCA gradientes en el brutalismo puro — la transicion es blandura que el brutalismo rechaza

* Inversiones: secciones en negro con texto blanco sin transicion suave — el cambio es abrupto y deliberado

### **3.2  Tratamiento de imagenes brutalista**

* Imagenes en blanco y negro duro (alto contraste) — filter: grayscale(1) contrast(1.5)

* Duotono con el acento de color: filter con SVG feColorMatrix o CSS gradient overlay en mix-blend-mode

* Imagenes recortadas bruscamente — sin border-radius, sin fade suave en los bordes

* Texto superpuesto directo sobre imagen sin overlay — el contraste se gestiona con el tratamiento de imagen

* Imagenes como material bruto: sin retoque obvio, sin perfeccion comercial

## **4\. Layout y Composicion Brutalista**

### **4.1  La grilla rota intencionalmente**

* Empezar con una grilla matematica (12 columnas, 8px base) — luego violarla en puntos especificos con intencion

* Elementos que sobresalen 20-40px de la grilla crean tension sin caos — la transgresion controlada

* Texto en columna de 3 sobre fondo en columna de 4 — la asinconia como gesto

* Margin negativo: margin-left: \-2rem para que un elemento 'rompa' su contenedor

* Position: absolute fuera del flujo para elementos de impacto que no participan de la grilla

### **4.2  Separadores y ritmo brutalista**

* Lineas negras de 3-8px como separadores de seccion — sin curvado, sin suavidad

* Fondos alternos de negro/blanco entre secciones sin transicion — el cambio abrupto ES el separador

* Numeros de seccion en tamano gigante como elemento compositivo (el '01' de 200px como decoracion de seccion)

* El espacio en blanco como silencio obligatorio antes de la siguiente pieza — el 'shhh' entre palabras fuertes

## **5\. Animaciones Brutalistas**

El brutalismo tipografico tiene una relacion ambigua con las animaciones. La version puritana las rechaza: si el tipo es suficientemente poderoso, no necesita moverse. La version contemporanea las acepta si son igualmente brutalistas en su ejecucion.

| Animacion | Duracion | Descripcion brutalista |
| :---- | :---- | :---- |
| Glitch text | Loop: 5s con 200ms burst | El texto se 'rompe' brevemente con clip-path y translate |
| Scramble / decode text | 800ms al hover | Las letras se revuelven y se recomponen (JS letter by letter) |
| Flash de color | 50ms steps(1) | El fondo alterna negro/blanco en rapidisimo parpadeo — solo con prefers-reduced-motion off |
| Cursor personalizado | 60fps | Cruz (+) o punto cuadrado en lugar del cursor estandar |
| Texto que se escribe | Variable, linear | Efecto typewriter con velocidad irregular |
| Scroll snapping brusco | Instantaneo o 100ms | Transicion de seccion sin ease — el snap como gesto brutalista |
| Hover: inversion de color | 0ms (instantaneo) | background y color se invierten sin transicion — impacto puro |
| Titulares con split reveal | 600ms staggered | Las letras entran desde posiciones inesperadas, sin ease suave |

## **6\. Variables CSS para Brutalist Typography**

   
/\* \=== BRUTALIST TYPOGRAPHY — CSS CUSTOM PROPERTIES \=== \*/

\--font-brutal:   'Impact', 'Haettenschweiler', 'Arial Narrow', sans-serif;  
\--font-body:     'Courier New', 'Courier', monospace;  
\--font-alt:      'Arial Black', 'Helvetica Neue', Arial, sans-serif;

/\* Escala extrema \*/  
\--fs-body:       1rem;  
\--fs-headline:   clamp(3rem, 12vw, 14rem);  
\--fs-display:    clamp(6rem, 20vw, 22rem);  
\--fs-micro:      0.6rem;

/\* Tracking brutalista \*/  
\--ls-brutal:     \-0.08em;  
\--ls-ultra:      \-0.12em;  
\--ls-normal:      0;  
\--ls-wide:        0.3em;

/\* Line heights \*/  
\--lh-brutal:     0.88;  
\--lh-tight:      1.0;  
\--lh-body:       1.5;

/\* Color \*/  
\--black:         \#000000;  
\--white:         \#FFFFFF;  
\--red:           \#FF0000;  
\--yellow:        \#FFFF00;

/\* Sin border-radius — todo anguloso \*/  
\--radius:         0;

/\* Borders agresivos \*/  
\--border-brutal:  3px solid \#000000;  
\--border-heavy:   6px solid \#000000;

/\* Transiciones brutalistas \*/  
\--transition-instant: 0ms;  
\--transition-fast:    80ms steps(1);  
\--transition-normal:  200ms linear;  
 

## **7\. Anti-patrones del Brutalismo Tipografico**

* NUNCA usar bordes redondeados — el border-radius: 0 es dogma brutalista

* NUNCA gradientes ni sombras difuminadas — el brutalismo puro no suaviza nada

* NUNCA el brutalismo como 'estilo por defecto' — es una declaracion que necesita contexto y audiencia adecuada

* NUNCA sacrificar la legibilidad minima necesaria — brutalismo no es ilegibilidad, es dureza legible

* NUNCA hacer brutalismo sin conocer el brutalismo — las referencias culturales son parte del estilo

* NUNCA aplicar a sectores donde la confianza es critica: salud, banca, legal, gobierno

* NUNCA ignorar prefers-reduced-motion para las animaciones de glitch y flash — pueden causar malestar real

* NUNCA confundir brutalismo con descuido — cada decision brutalista debe ser intencionada y justificable

**13**    **Magazine Layout**

*La pagina como espectaculo — Donde el diseno hace al contenido irresistible*

| Familia | Estilos Editoriales / Tipograficos |
| :---- | :---- |
| **Indice** | 04 / 04 |
| **Filosofia** | Una revista no informa: seduce. Cada pagina es una composicion que compite por la atencion del lector con la misma intensidad que un anuncio publicitario. |
| **Referentes** | Vogue.com, Wallpaper\*, Bloomberg Businessweek, The New Yorker, Wired, Fast Company, Harper's Bazaar, Esquire, Apartamento |
| **Emocion** | Deseo, aspiracion, placer de la lectura visual, descubrimiento, gusto cultivado |
| **Sectores** | Revistas digitales de moda, arquitectura, viajes, tecnologia, cultura, lifestyle premium |

## **1\. Filosofia del Magazine Layout**

El Magazine Layout es el diseno editorial llevado a su dimension mas seductora y visual. A diferencia del periodismo diario (que prioriza la velocidad y la densidad informativa), el diseno de revista prioriza la experiencia de pagina — el placer del que se detiene, mira y decide leer. Cada apertura de pagina es una promesa de experiencia.

### **1.1  Los cinco principios del diseno de revista**

* LA PRIMERA IMPRESION LO ES TODO: el lector decide en 0.3 segundos si una pagina merece su atencion — el impacto visual inmediato es la primera funcion del diseno

* LA IMAGEN MANDA: en una revista, la imagen editorial es el contenido principal — el texto amplifica la imagen, no al reves

* LA VARIEDAD ES OBLIGATORIA: una revista que repite el mismo layout en cada pagina pierde lectores — la variacion sistematica crea el ritmo de pagina a pagina

* EL LUJO ES ESPACIO: en la revista premium, el espacio en blanco es la senaL mas clara de valor — las revistas baratas estan llenas de contenido

* LA CONSISTENCIA HACE A LA MARCA: dentro de toda la variacion, hay un sistema visual que hace que cada pagina sea reconociblemente de la misma publicacion

### **1.2  Tipologia de revistas y sus convenciones digitales**

| Tipo de revista | Densidad visual | Tipografia dominante | Fotografia |
| :---- | :---- | :---- | :---- |
| Moda de lujo | Muy baja — lujo del espacio | Serif Didone o sans minimal | Fashion editorial, arte |
| Lifestyle / interiores | Baja-media — respiro generoso | Serif calido \+ sans humanista | Ambientes, productos |
| Noticias de negocios | Media-alta — informacion densa | Sans bold \+ serif de texto | Retratos, graficos datos |
| Tecnologia | Media — equilibrada | Sans moderna \+ mono para datos | Productos, personas |
| Cultura y artes | Variable — segun articulo | Display expresivo \+ serif lectura | Arte, personas, eventos |
| Viajes | Baja — imagen protagonista | Serif suave \+ sans ligero | Destinos, paisajes, comida |
| Arquitectura / Diseno | Muy baja — precision visual | Sans minimal, muy refinada | Arquitectura, objetos |

## **2\. Sistema de Grid de Revista**

El grid de revista es mas complejo y variable que el grid editorial de periodico. Debe soportar composiciones muy diferentes manteniendo coherencia de sistema. La clave es la flexibilidad dentro de reglas estrictas.

### **2.1  Tipos de apertura de pagina de revista**

| Tipo de apertura | Composicion | Cuando usarlo |
| :---- | :---- | :---- |
| Full-bleed fotografica | Imagen 100vw / 100vh \+ titulo superpuesto minimo | Articulo de gran impacto, portada interna |
| Cincuenta-cincuenta | Imagen 50% \+ texto 50% a la misma altura | Entrevistas, perfiles con retrato |
| Texto dominante | Columna de texto ancha \+ elemento visual pequeno | Essays, columnas de opinion |
| Grid de imagenes | Mosaico de 3-6 imagenes con proporciones variadas | Sumarios de moda, series fotograficas |
| Tipografica pura | Solo texto con diseno tipografico dominante | Manifiestos, editoriales de opinion fuerte |
| Infographic spread | Datos visualizados a doble pagina | Especiales de datos, estadisticas del sector |
| Pull-quote dominante | Cita en enorme tamano como elemento visual | Entrevistas con declaraciones impactantes |
| Collage editorial | Mezcla de foto, ilustracion y tipografia superpuestos | Moda, cultura pop, arte |

### **2.2  La grid de revista — implementacion CSS**

* Grid de 12 columnas con gutter de 20-24px como estructura base

* Las imagenes pueden ocupar 4, 6, 8, 9 o 12 columnas — la flexibilidad crea variedad

* Texto en columnas de 4-5 columnas maximas para columnas de cuerpo de revista

* Subgrid (CSS subgrid) para que elementos dentro de articles se alineen a la grid principal

* Areas nombradas en CSS Grid para composiciones especificas (feature, aside, image, caption)

* Responsive: en mobile, la apertura a doble pagina se convierte en secuencia vertical scrollable

### **2.3  Composicion de cover / portada digital**

* Imagen de portada: debe ocupar el 60-75% del area visible above the fold

* Nombre de la publicacion: en la parte superior, tipografia de marca reconocible, legible sobre la imagen

* Titular principal: superpuesto a la imagen en la parte inferior o en el area de mayor contraste

* Sumario de contenidos: 3-5 titulares de articulos, tipografia compacta, alineados en columna lateral o inferior

* Fecha y numero: discreta, parte del sistema de identidad, nunca protagonista

* CTA de suscripcion: presente pero integrado al diseno, nunca como elemento intruso

## **3\. Tipografia de Revista**

### **3.1  Sistemas tipograficos de las grandes publicaciones**

| Publicacion | Sistema tipografico | Personalidad tipografica |
| :---- | :---- | :---- |
| Vogue | Bodoni / Didot para display \+ sans neutro para cuerpo | Drama Didone, elegancia fria, fashion authority |
| The New Yorker | Irvin (custom) para portada \+ tipografia de texto clasica | Literaria, sofisticada, wit americano |
| Wired | Custom Wired Display \+ sans moderna | Tech-optimista, bold, directa |
| Bloomberg Businessweek | Custom \+ condensadas de impacto | Informacion como espectaculo, urgencia inteligente |
| Wallpaper\* | Diseño tipografico propio, sans refinada | Arquitectura visual, minimalismo europeo |
| Monocle | Custom \+ serif de calidad \+ sans japonesa | Cosmopolita, calidad artesanal, curado global |
| National Geographic | NG serif custom \+ sans para datos | Autoridad cientifica, descubrimiento, academia popular |

### **3.2  Elementos tipograficos exclusivos de revista**

* FOLIO: numero de pagina con nombre de seccion — en digital, indicador de posicion en el articulo

* RUNNING HEAD: nombre de la publicacion o seccion en la parte superior de cada pagina — en digital, en el sticky header

* TITLE CASE vs. SENTENCE CASE: las revistas de lujo tienden a Sentence case para titulares — mas elegante que TODO MAYUSCULAS

* COLUMNA DE TEXTO: 3-4 columnas en doble pagina de revista — en digital, 1-2 columnas con control de ancho

* TIPOGRAFIA SECUNDARIA: las revistas tienen 4-5 estilos tipograficos distintos — cada uno con rol especifico

* LETRA CAPITULAR en apertura de articulo: initial-letter o pseudo-elemento ::first-letter de 3-5 lineas de altura

* CABEZALES de seccion: identificadores de categoria en la parte superior del articulo, tipografia de marca de la seccion

### **3.3  Escala tipografica de revista premium**

| Elemento | Tamano | Peso | Estilo | Notas |
| :---- | :---- | :---- | :---- | :---- |
| Cover headline | 48-80px | 700-900 | Normal o italic | Puede sangrar fuera del contenedor |
| Feature title | 36-56px | 600-800 | Serif italic elegante | Con deck de 18-22px debajo |
| Department head | 11-14px | 700 | UPPERCASE | Letter-spacing 0.15-0.2em |
| Kicker | 10-12px | 600 | UPPERCASE color de seccion | Sobre el titular, identifica la seccion |
| Deck / standfirst | 16-20px | 400-500 | Italic o normal segun diseno | Puente entre titular y cuerpo |
| Cuerpo de articulo | 16-18px | 400 | Serif o sans segun diseno | Line-height 1.6-1.75 |
| Caption de foto | 11-12px | 400-500 | Italic o light | Siempre diferenciado del cuerpo |
| Credito fotografico | 9-10px | 400 | UPPERCASE, color de marca | En la imagen o debajo del caption |
| Pull-quote | 24-40px | 400-600 | Italic con serif o sans bold | Separado visualmente del flujo de texto |

## **4\. Fotografía e Imagen Editorial de Revista**

La fotografia editorial de revista no es documentacion — es escenificacion. Cada imagen ha sido pensada, dirigida y editada para comunicar un mundo, una aspiracion o una idea. En digital, el tratamiento tecnico de esas imagenes debe ser impecable para no traicionar el trabajo del fotografo y el director de arte.

### **4.1  Tratamiento tecnico de imagenes en revista digital**

* RESOLUCION: imagenes a 2x para pantallas retina — srcset con 1x, 2x y 3x si el budget lo permite

* FORMATOS: WebP como prioritario (hasta 30% menos peso), con JPEG como fallback — usar picture element

* LAZY LOADING: loading='lazy' en todas las imagenes below the fold — nativo sin JavaScript

* ASPECT RATIO: definir aspect-ratio en CSS antes de cargar la imagen para evitar Cumulative Layout Shift (CLS)

* COLOR SPACE: sRGB para web — las imagenes en Adobe RGB o P3 amplian colores pero no todos los navegadores los gestionan bien

* SHARPENING: un leve post-procesado de sharpening para pantalla es diferente al sharpening para impresion

### **4.2  Composicion y encuadre editorial**

* REGLA DE LOS TERCIOS: los sujetos principales se posicionan en los tercios de la imagen — nunca centrados salvo intencion

* ESPACIO NEGATIVO INTENCIONAL: las mejores imagenes de revista tienen espacio vacío donde va el texto superpuesto

* RECORTE vs. SANGRADO: las imagenes pueden sangrar al borde del contenedor (bleed) o tener margenes — ambos son validos

* PROPORCION DE IMAGEN: establecer aspect-ratio consistente dentro del mismo contexto — 3:2 para retratos, 16:9 para paisajes, 1:1 para cuadradas editoriales

* TRATAMIENTO CROMATICO CONSISTENTE: dentro de un mismo articulo, todas las imagenes deben tener coherencia de color — esto puede requerir post-procesado con el mismo LUT o preset

### **4.3  Texto sobre imagen — tecnicas avanzadas**

* OVERLAY GRADIENT: linear-gradient de transparente a negro en la parte donde va el texto — el gradiente debe ser sutil

* TEXTO EN EL ESPACIO NEGATIVO: colocar texto solo donde la imagen lo permite sin overlay — requiere buena comunicacion con el fotografo

* BACKDROP-FILTER: blur muy sutil (2-4px) en el area de texto para aumentar legibilidad sin overlay opaco

* MEZCLA DE MODOS (mix-blend-mode): texto en multiply o screen sobre imagen para integracion organica — requiere pruebas con distintas imagenes

* CAJA DE TEXTO: fondo solido detras del texto — mas legible pero menos elegant si no esta bien ejecutado

## **5\. Componentes UI Especificos de Revista**

### **5.1  La portada digital (homepage de revista)**

* HERO FOTOGRAFICO: imagen principal de portada que ocupa 80-100vh — la declaracion de intenciones

* CABECERA DE MARCA: logo / nombre de la revista en posicion fija, con fondo transparente sobre la imagen hero

* ARTICULOS DESTACADOS: 3-5 cards con imagen, kicker, titular y byline — escalonados en tamano

* SEPARADORES DE SECCION: bandas de color de seccion o tipografia de cabezal de seccion

* MODO DE LECTURA: alternar entre 'browsing' (imagenes grandes, texto minimo) y 'reading' (lista de titulares)

* NEWSLETTER CTA: integrado de forma elegante en el flujo de la portada, no como popup intruso

### **5.2  El articulo de revista largo**

* APERTURA DE ARTICULO: imagen hero full-bleed con titulo superpuesto — el equivalente digital de la doble pagina inaugural

* CREDITOS: kicker \+ titular \+ deck \+ byline \+ foto del autor \+ fecha \+ tiempo de lectura — en un bloque previo al cuerpo

* LETRA CAPITULAR: inicial decorativa al comienzo del primer parrafo — ::first-letter o initial-letter CSS

* PULL-QUOTES: citas destacadas cada 400-600 palabras para dar ritmo visual al texto largo

* IMAGENES IN-TEXT: fotos que ilustran el texto, siempre con caption — pueden ocupar columna completa o media columna

* DATOS / ESTADISTICAS: infografias inline o datos grandes (numero \+ contexto) para variar el ritmo

* CONTENIDO RELACIONADO: al final del articulo y/o en sidebar — 3-5 articulos del mismo tema o seccion

### **5.3  Sumario de revista / tabla de contenidos**

* NO es una lista de links — es una composicion editorial en si misma

* Cada seccion de la revista tiene su color y tratamiento visual diferente

* Las imagenes del sumario son distintas a las del articulo — son 'imagenes sumario', mas abstractas

* El numero de pagina (en digital: el numero de articulo o seccion) como elemento visual prominente

* Los titulares del sumario son mas cortos y evocadores que los titulares completos del articulo

## **6\. Animaciones en Revista Digital**

| Animacion | Duracion | Descripcion en contexto de revista |
| :---- | :---- | :---- |
| Entrada de portada | 800-1200ms escalonada | El titulo aparece sobre la imagen con fade elegante y lento |
| Cambio de imagen en hero | 1000ms crossfade | Si hay multiple imagen en el hero, el fade es muy lento y suave |
| Card reveal al scroll | 400ms ease-out | Las cards de articulo aparecen con translateY(-20px) \+ opacity al entrar en viewport |
| Hover en card de articulo | 300ms ease-out | La imagen hace scale(1.04) dentro del contenedor, el titulo cambia de color |
| Parallax en articulo feature | Scroll-linked | La imagen hero se mueve a 0.4x la velocidad del scroll — efecto profundidad |
| Progress de lectura | Continua, scroll-linked | Linea de color de marca que crece segun el % del articulo leido |
| Sticky header con color | 200ms ease | El header cambia de transparente a color de marca solido al hacer scroll |
| Galeria de fotos | 300ms slide | Transicion lateral suave entre imagenes, con indicadores de posicion |
| Carga lazy de imagenes | 400ms blur-to-sharp | La imagen carga con blur(8px) y se enfoca al cargarse completamente |
| Pull-quote entrance | 500ms ease-out | La cita aparece desde la izquierda o la derecha segun su posicion en el layout |

## **7\. Variables CSS para Magazine Layout**

   
/\* \=== MAGAZINE LAYOUT — CSS CUSTOM PROPERTIES \=== \*/

/\* Sistema tipografico de revista \*/  
\--font-display:   'Canela', 'Cormorant Garamond', 'Playfair Display', serif;  
\--font-heading:   'Freight Display', 'Libre Baskerville', Georgia, serif;  
\--font-body:      'Freight Text', 'Source Serif Pro', Georgia, serif;  
\--font-sans:      'Suisse Intl', 'Helvetica Neue', Arial, sans-serif;  
\--font-caps:      'Suisse Intl', Arial, sans-serif; /\* para kickers y labels \*/

/\* Escala tipografica de revista \*/  
\--fs-kicker:      0.6875rem;   /\* 11px, UPPERCASE \*/  
\--fs-caption:     0.75rem;     /\* 12px \*/  
\--fs-meta:        0.8125rem;   /\* 13px \*/  
\--fs-body:        1.0625rem;   /\* 17px \*/  
\--fs-deck:        1.25rem;     /\* 20px \*/  
\--fs-h3:          1.5rem;      /\* 24px \*/  
\--fs-h2:          2rem;        /\* 32px \*/  
\--fs-h1:          clamp(2.5rem, 5vw, 4rem);  
\--fs-feature:     clamp(3.5rem, 8vw, 7rem);  
\--fs-cover:       clamp(4rem, 12vw, 10rem);

/\* Letter spacing de revista \*/  
\--ls-kicker:      0.18em;  
\--ls-caps-label:  0.12em;  
\--ls-heading:     \-0.02em;  
\--ls-display:     \-0.035em;

/\* Line heights \*/  
\--lh-display:     1.05;  
\--lh-heading:     1.15;  
\--lh-deck:        1.4;  
\--lh-body:        1.7;

/\* Layout de revista \*/  
\--mag-max-width:    1280px;  
\--mag-content-width: 740px;  
\--mag-gutter:       1.5rem;  
\--mag-section-gap: clamp(4rem, 8vw, 8rem);

/\* Colores \*/  
\--color-brand:      \#0D1B4B;  
\--color-text:       \#111111;  
\--color-text-soft:  \#666666;  
\--color-bg:         \#FFFFFF;  
\--color-bg-warm:    \#FDFBF8;  
\--color-rule:       \#E2E2E2;

/\* Secciones con color \*/  
\--color-fashion:    \#B81C1C;  
\--color-culture:    \#2C5F8A;  
\--color-travel:     \#2A7A4B;  
\--color-design:     \#8B4513;  
\--color-opinion:    \#6B1C8A;

/\* Transiciones elegantes \*/  
\--transition-elegant: 400ms cubic-bezier(0.25, 0.46, 0.45, 0.94);  
\--transition-image:   600ms ease;  
 

## **8\. Anti-patrones del Magazine Layout**

* NUNCA usar el mismo layout en todos los articulos — la variedad es constitutiva del formato revista

* NUNCA comprimir imagenes editoriales de alta calidad por debajo de los estandares visuales — la foto es el producto

* NUNCA anuncios que interrumpan el flujo de lectura de un articulo largo — la publicidad de revista debe integrarse en el sistema visual

* NUNCA titulares de articulo sin imagen de apertura de calidad — en formato revista, el texto sin imagen pierde competitividad

* NUNCA captions de imagen genericos ('Foto: Getty Images') — el caption es parte del contenido editorial

* NUNCA contenido de video con autoplay sobre articulos de lectura — la revista pide atencion selectiva, no intrusiva

* NUNCA olvidar la experiencia movil — las dobles paginas se convierten en scroll vertical y deben rediseñarse, no simplemente apilarse

* NUNCA mezclar fotografias de estilos visuales incompatibles dentro del mismo articulo — la coherencia fotoeditorial es identidad

* NUNCA el logotipo de la publicacion en tamano discreto o escondido — en una revista, la marca es parte del contenido

