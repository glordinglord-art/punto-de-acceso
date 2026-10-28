**GUÍA DE ESTILOS CSS**

**Estilos Lúdicos y Creativos**

Familia IX de XI — 5 estilos documentados en profundidad

Guía de referencia para la generación de CSS lúdico y creativo. Cubre los fundamentos de cada estética: desde la psicología de la diversión y la ternura hasta la implementación de interfaces que invitan a la interacción táctil y el descubrimiento. Incluye filosofía, paletas de color, tipografía, texturas, animaciones, variables CSS conceptuales y anti-patrones.

| \# | Estilo | Filosofía central | Emoción objetivo |
| :---- | :---- | :---- | :---- |
| 41 | Playful / Cartoon | El diseño no tiene que ser aburrido para ser funcional | Alegría, energía, curiosidad y accesibilidad |
| 42 | Kawaii | La ternura como herramienta de conexión emocional y confort | Afecto, calma, inocencia y seguridad |
| 43 | Doodle / Hand-drawn | La imperfección humana como antídoto a la esterilidad digital | Cercanía, calidez, autenticidad y encanto |
| 44 | Sticker / Collage | El desorden intencional y la superposición como expresión cultural | Rebeldía alegre, nostalgia táctil y creatividad |
| 45 | LEGO / Toy-like | La interfaz construida con bloques primarios e indestructibles | Familiaridad, solidez lúdica y extrema claridad |

---

**41 Playful / Cartoon**

*La interfaz como un patio de recreo — Donde la función se encuentra con la diversión*

| Familia | Estilos Lúdicos / Creativos |
| :---- | :---- |
| **Índice** | 01 / 05 |
| **Filosofía** | Las interfaces corporativas y rígidas generan fricción; el diseño juguetón (playful) desarma la tensión del usuario invitándolo a interactuar sin miedo a equivocarse. |
| **Referentes** | Duolingo, Headspace, Discord (versiones tempranas), Mailchimp (ilustraciones), sitios de festivales de animación. |
| **Emoción** | Optimismo, accesibilidad, energía vibrante, confianza exploratoria. |
| **Sectores** | EdTech (educación), apps de hábitos, productos orientados a Gen Z, herramientas creativas, agencias de diseño disruptivas. |

## **1\. Filosofía del Playful Design**

El diseño Playful o Cartoon toma prestadas las convenciones de la animación tradicional y los cómics para crear interfaces que se sienten vivas. No se trata de infantilizar el producto, sino de humanizarlo a través del humor, la exageración y el movimiento.

*Un botón no solo se presiona; se aplasta y rebota. Un error no es un bloque rojo de texto; es un personaje que se encoge de hombros.*

### **1.1 Principios visuales del estilo Cartoon**

* **Exageración de proporciones:** Elementos UI sobredimensionados, border-radius extremos y tipografías gruesas.  
* **Física de dibujos animados:** Los elementos tienen "masa" y "elasticidad". Se estiran, rebotan y tienen inercia.  
* **Bordes definidos (Strokes):** Uso de contornos oscuros y gruesos (estilo *cel shading* o cómic) para separar elementos.  
* **Micro-recompensas:** Confeti, partículas o cambios de expresión en ilustraciones al completar acciones.

## **2\. Paleta de Color**

La paleta es vibrante, saturada y de alto contraste. Se evitan los grises corporativos en favor de tonos cálidos y colores primarios o secundarios muy puros.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Colores Primarios** | Altos niveles de saturación y brillo (ej. \#FF4B4B, \#1CB0F6, \#FFC800). | Botones principales, fondos de secciones clave. |
| **Sombras Duras** | Negro puro (\#000000) o versiones muy oscuras del color base sin difuminado. | Sombras de desplazamiento sólido (hard shadows) para dar volumen 2D. |
| **Tonos de Fondo** | Off-whites cálidos (\#F7F7F7) o pasteles muy lavados. | Evitar el blanco puro para que los colores vibrantes destaquen sin lastimar la vista. |
| **Contornos** | \#202020 o tonos entintados oscuros. | Para dar el efecto de ilustración a los contenedores. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Rounded sans-serifs, gruesas y amigables. Ejemplos: *Fredoka One, Nunito, Balsamiq Sans, Quicksand, o Poppins Black*.  
* **Jerarquía:** Títulos masivos, pesados (weight 800-900) y con *letter-spacing* ajustado.  
* **Cuerpo de texto:** Legible pero con remates redondeados (peso 500 o 600). Se evita el texto delgado (peso 300 o menor).  
* **Tratamiento:** Uso frecuente de *text-shadows* sólidos desplazados para imitar títulos de cómics.

## **4\. Formas y Elementos Visuales**

* **Botones:** Pill-shaped (totalmente redondeados) o con *border-radius* asimétricos leves. Tienen un estado de reposo elevado mediante *box-shadow* sólido (ej. 4px 4px 0px \#000).  
* **Blob shapes:** Fondos de contenedores generados con formas orgánicas (curvas Bézier fluidas) en lugar de rectángulos perfectos.  
* **Neobrutalismo lúdico:** Componentes que parecen tarjetas físicas dibujadas a mano, con contornos negros asimétricos.

## **5\. Animaciones**

| Animación | Duración | Descripción Playful |
| :---- | :---- | :---- |
| **Botón Click** | 150ms | El botón se desplaza hacia abajo absorbiendo su propia sombra dura (translateY \+ reducción de box-shadow). |
| **Aparición (Pop-in)** | 400ms | *Overshoot* (rebote elástico). El elemento escala a 110% y luego se asienta en 100%. |
| **Hover en Tarjeta** | 200ms | Ligera rotación (ej. rotate(2deg)) y elevación simultánea. |
| **Éxito (Success)** | 600ms | Explosión de partículas SVG desde el centro del elemento (efecto confeti). |

## **6\. Variables CSS Conceptuales**

* **Superficies:** Variables para fondos cálidos y bordes gruesos (ej. border-width: 3px).  
* **Sombras Duras:** Variables para box-shadow sin *blur-radius*, creando volumen de bloque (ej. offset-x: 4px, offset-y: 4px, blur: 0px).  
* **Radios Extremos:** Variables para redondeo total (border-radius: 999px para botones) y blobs asimétricos (border-radius: 40% 60% 70% 30%).  
* **Transiciones Elásticas:** Curvas de interpolación personalizadas (cubic-bezier) que incluyen valores mayores a 1 o menores a 0 para generar efecto de rebote.

## **7\. Anti-patrones**

* **NUNCA** usar líneas finas (hairlines) o tipografías *light*. Restan peso y tangibilidad a la interfaz.  
* **NUNCA** utilizar sombras difuminadas suaves (soft drop-shadows). Chocan con la estética de cómic/cartoon.  
* **NUNCA** usar transiciones lineales aburridas. La falta de aceleración/desaceleración elástica mata la personalidad.  
* **NUNCA** llenar la pantalla de texto denso. El contenido debe estar troceado (chunking) y apoyado siempre por apoyos visuales.

---

**42 Kawaii**

*La ciencia de la ternura — Empatía visual y reducción total de la fricción*

| Familia | Estilos Lúdicos / Creativos |
| :---- | :---- |
| **Índice** | 02 / 05 |
| **Filosofía** | Originaria de Japón, la estética Kawaii utiliza la ternura para desarmar emocionalmente al usuario, creando un entorno de software que se siente como un refugio seguro y amigable. |
| **Referentes** | Nintendo UI (Animal Crossing), Sanrio, apps de *journaling* asiáticas, Pusheen, Tamagotchi. |
| **Emoción** | Calma, afecto, inocencia, confort psicológico, ausencia de estrés. |
| **Sectores** | Salud mental y bienestar, seguimiento de hábitos, e-commerce de papelería/lifestyle, gaming casual, apps infantiles. |

## **1\. Filosofía del Kawaii Design**

El diseño Kawaii elimina todo lo que sea amenazante, afilado o corporativo. Aplica el concepto psicológico del "esquema del bebé" (baby schema): características que inspiran instintos de cuidado y protección. En UI, esto se traduce en proporciones anchas, elementos redondos, caritas antropomórficas en objetos inanimados y una paleta de colores calmante.

*Una notificación de error no es un obstáculo; es un personaje pidiendo disculpas tiernamente.*

## **2\. Paleta de Color**

Los colores pastel son la columna vertebral absoluta de este estilo. El contraste es intencionalmente bajo para mantener la suavidad ocular.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Pasteles Base** | Rosa palo, menta suave, lavanda, amarillo mantequilla, celeste cielo. | Fondos de pantalla, tarjetas, modales. |
| **Texto y Trazos** | Marrón chocolate (\#4A3018) o gris violáceo (\#5C4D5C). | **Jamás se usa negro puro.** El marrón oscuro mantiene el contraste sin la agresividad del negro. |
| **Acentos de Brillo** | Blanco puro (\#FFFFFF) y amarillo estrella (\#FFF59D). | Brillos en botones, destellos, iconos. |

## **3\. Tipografía**

* **Fuentes recomendadas:** *Varela Round, M PLUS Rounded, Sniglet, Cherry Bomb One*.  
* **Características:** Terminales 100% redondeadas. Ojos (espacios internos de las letras) grandes y amigables.  
* **Tratamiento:** Uso de tracking (espaciado entre letras) ligeramente positivo para dar aire. Los títulos a menudo llevan un borde blanco exterior (text-stroke) sutil.

## **4\. Formas y Elementos Visuales**

* **Ausencia de esquinas:** Todos los elementos tienen un border-radius significativo. Los botones son pastillas (pill-shaped).  
* **Antropomorfismo:** Iconos, tostadoras de notificaciones y estados vacíos suelen tener pequeñas caras (dos puntos separados por una línea pequeña: • ᴗ •).  
* **Elementos flotantes:** Estrellitas, destellos (sparkles), nubes y corazones utilizados como ornamentación de fondo.  
* **Brillo (Gloss):** Reflejos blancos semi-transparentes en la parte superior de los botones para dar un aspecto de caramelo o gelatina.

## **5\. Animaciones**

| Animación | Duración | Descripción Kawaii |
| :---- | :---- | :---- |
| **Carga (Loading)** | Loop continuo | Elementos que se balancean (wobble) de lado a lado suavemente, como un muñeco tentetieso. |
| **Aparición de Modal** | 500ms | Fade in desde abajo combinado con una pequeña flotación suave y un ease-out largo. |
| **Hover en Botón** | 200ms | El botón se encoge un 5% (squish) en lugar de agrandarse, dando sensación de ser de goma blanda. |

## **6\. Variables CSS Conceptuales**

* **Paleta Pastel:** Variables de color restringidas a alta luminosidad y baja saturación (ej. funciones hsl con L\>85%).  
* **Sombras Blandas:** Variables para box-shadow utilizando colores del mismo tono que el fondo pero más oscuros, con un desenfoque amplio (ej. rosa oscuro sobre fondo rosa claro), nunca sombras negras.  
* **Filtros de Brillo:** Variables para aplicar degradados lineales semi-transparentes sobre componentes (efecto caramelo).

## **7\. Anti-patrones**

* **NUNCA** usar negro puro para el texto; crea un contraste demasiado áspero que rompe la ilusión de suavidad.  
* **NUNCA** usar ángulos rectos o esquinas afiladas en tarjetas, botones o modales.  
* **NUNCA** utilizar rojo brillante para los estados de error; reemplazar por un tono coral o salmón suave acompañado de un mensaje empático.

---

**43 Doodle / Hand-drawn**

*El rechazo al píxel perfecto — La imperfección como garantía de humanidad*

| Familia | Estilos Lúdicos / Creativos |
| :---- | :---- |
| **Índice** | 03 / 05 |
| **Filosofía** | Frente a la esterilidad del diseño digital hiper-optimizado, el estilo *hand-drawn* introduce la irregularidad humana, los trazos temblorosos y las texturas físicas para generar una conexión inmediata y artesanal. |
| **Referentes** | Oatly, Basecamp (marketing pages), Mailchimp, sitios web de ilustradores independientes, marcas orgánicas/artesanales. |
| **Emoción** | Autenticidad, honestidad, calidez, espíritu indie, anti-corporativo. |
| **Sectores** | Agencias creativas, portfolios, ONGs, cafeterías, marcas de productos sostenibles, blogs personales. |

## **1\. Filosofía del Doodle Design**

Si el *Swiss Style* busca la precisión matemática, el estilo *Doodle* busca que parezca que la interfaz fue dibujada en un cuaderno de bocetos hace cinco minutos. La estética se apoya en la idea de que lo imperfecto es confiable porque evidentemente fue hecho por una persona, no por un algoritmo.

## **2\. Paleta de Color**

Simula herramientas y materiales físicos de arte.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Fondo Base** | Papel texturizado: Off-white (\#FDFBF7), crema, pergamino claro. | Fondos de página y tarjetas. |
| **Trazos (Tinta/Grafito)** | Gris carbón (\#2C2C2C), azul bolígrafo (\#0033CC), rojo marcador. | Bordes, textos, iconos dibujados. |
| **Rellenos (Marcador/Acuarela)** | Colores desaturados aplicados de forma asimétrica (fuera de las líneas del contorno). | Resaltadores de texto, fondos de botones. |

## **3\. Tipografía**

* **Fuentes recomendadas:** *Caveat, Patrick Hand, Amatic SC, Just Another Hand, Indie Flower*.  
* **Mixtura:** Es muy común mezclar una fuente de escritura a mano (para los títulos y notas al margen) con una tipografía serif clásica de máquina de escribir o una sans-serif muy legible para el cuerpo de texto largo.  
* **Tratamiento:** Inclinaciones aleatorias leves en los títulos (transform: rotate(-2deg)).

## **4\. Formas y Elementos Visuales**

* **Bordes Irregulares:** Uso extensivo de la propiedad border-radius con múltiples valores aleatorios para simular cajas dibujadas a pulso (ej. border-radius: 255px 15px 225px 15px/15px 225px 15px 255px).  
* **Subrayados Múltiples:** En lugar de text-decoration: underline, se utilizan imágenes SVG de trazos irregulares posicionados debajo del texto.  
* **Elementos decorativos:** Flechas dibujadas a mano, tachaduras, círculos erráticos rodeando elementos clave, manchas de tinta, "garabatos" en los márgenes.

## **5\. Animaciones**

| Animación | Duración | Descripción Hand-drawn |
| :---- | :---- | :---- |
| **Efecto de Dibujado** | 800ms \- 1.5s | Animación SVG utilizando stroke-dasharray y stroke-dashoffset para que los bordes e iconos parezcan estar dibujándose en tiempo real. |
| **Jitter / Boiling Line** | Loop rápido (100ms/frame) | El trazo SVG alterna entre 2 o 3 versiones ligeramente diferentes (o se usa un filtro SVG de desplazamiento iterativo) para simular la técnica de animación tradicional. |
| **Hover en Botón** | 150ms | El fondo de color tipo "marcador" se desplaza ligeramente fuera del contorno del botón. |

## **6\. Variables CSS Conceptuales**

* **Trazos de Tinta:** Variables para grosores de borde imprecisos (ej. combinando border con box-shadow interiores/exteriores irregulares).  
* **Filtros SVG de Rugosidad:** Variables que aplican feDisplacementMap y feTurbulence a los elementos del DOM para darles bordes ásperos simulados por código.  
* **Capas de Textura:** Variables con URIs de datos (Base64) de texturas de papel superpuestas con mix-blend-mode: multiply.

## **7\. Anti-patrones**

* **NUNCA** usar líneas rectas perfectas de 1px generadas puramente por CSS. Parecen errores de carga en este estilo.  
* **NUNCA** alinear todo milimétricamente. La falta de asimetría rompe la ilusión de lo manual.  
* **NUNCA** usar fuentes manuscritas para párrafos largos; la legibilidad siempre debe prevalecer sobre el estilo en textos de más de 3 líneas.

---

**44 Sticker / Collage**

*La rebeldía del álbum de recortes — Zine culture y caos intencional*

| Familia | Estilos Lúdicos / Creativos |
| :---- | :---- |
| **Índice** | 04 / 05 |
| **Filosofía** | Inspirado en la cultura punk, los fanzines (zines) y la estética Y2K de personalizar portátiles y patinetas, este estilo abraza el caos controlado, la superposición extrema y la nostalgia táctil. |
| **Referentes** | Spotify Wrapped, campañas de marcas de *streetwear*, interfaces web3 lúdicas, sitios promocionales de artistas pop/indie. |
| **Emoción** | Expresión radical, rebeldía alegre, energía DIY (Do It Yourself), nostalgia milenial/Gen Z. |
| **Sectores** | Industria musical, moda urbana, eventos culturales, agencias creativas experimentales, cultura juvenil. |

## **1\. Filosofía del Sticker Design**

El estilo rompe activamente la cuadrícula (grid) y se burla del "espacio en blanco" minimalista llenando los huecos con elementos decorativos. Todo en la interfaz parece haber sido recortado de una revista y pegado con pegamento, o despegado de una plancha de calcomanías.

## **2\. Paleta de Color**

Choques de color intencionales.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Colores Neón/Ácidos** | Rosa fucsia, verde lima, naranja eléctrico. | Acentos, pegatinas y tipografías destacadas. |
| **CMYK / Imprenta** | Cian, Magenta, Amarillo puro, Negro intenso. | Elementos que simulan errores de impresión o arte pop. |
| **Texturas de Fondo** | Patrones de tablero de ajedrez (checkerboard), papel holográfico, texturas de semitono (halftone). | Fondos de contenedores principales. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Grotescas ultra-anchas (Extended), tipografías estilo *Ransom Note* (letras recortadas), Blackletter combinada con Sans-serif condensada.  
* **Tratamiento:** Las letras a menudo actúan como calcomanías individuales. Uso extremo de la propiedad text-transform: uppercase. Títulos con múltiples contornos o sombras duras desplazadas.

## **4\. Formas y Elementos Visuales**

* **El Efecto Calcomanía:** Elementos con un contorno blanco muy grueso y uniforme (creado con múltiples capas de *drop-shadow* o filtros SVG) y una sutil sombra de caída paralela (drop shadow) para simular grosor físico.  
* **Recortes de Revista:** Imágenes recortadas toscamente (estilo *cut-out*), a menudo de estética retro o surrealista, superpuestas sobre fondos vibrantes.  
* **Z-index Caótico:** Los elementos se superponen sin respeto por las jerarquías tradicionales. Un *sticker* puede solapar ligeramente un bloque de texto.  
* **Cintas adhesivas:** Elementos visuales que simulan *washi tape* o cinta aislante para "sujetar" fotos a la interfaz.

## **5\. Animaciones**

| Animación | Duración | Descripción Collage |
| :---- | :---- | :---- |
| **Hover "Peel" (Despegar)** | 250ms | Al pasar el cursor, el elemento rota levemente y su esquina inferior se "levanta" (aumento asimétrico de sombra), como si intentaras despegar el sticker. |
| **Marquee (Texto deslizante)** | Loop | Barras diagonales de texto repetido desplazándose continuamente, estilo cinta policial cruzando la pantalla. |
| **Rotación On-Load** | 400ms | Los stickers "caen" en la pantalla y rotan grados aleatorios (entre \-15deg y 15deg) al asentar. |

## **6\. Variables CSS Conceptuales**

* **Bordes de Sticker:** Variables para filtros estandarizados que crean el borde blanco exterior característico (filter: drop-shadow(...)).  
* **Rotaciones Aleatorias:** Variables para almacenar transformaciones angulares que rompen la ortogonalidad.  
* **Texturas Halftone:** Variables para generar degradados radiales o de fondo que simulan los puntos de la impresión de revistas antiguas.

## **7\. Anti-patrones**

* **NUNCA** respetar una grilla de alineación perfecta y simétrica; destruye por completo el concepto de collage "hecho a mano".  
* **NUNCA** dejar cantidades masivas de espacio en blanco inactivo (whitespace pasivo). El vacío debe llenarse con pequeñas decoraciones o texturas.  
* **NUNCA** usar imágenes rectangulares estándar (fotos de stock enteras). Deben estar silueteadas/recortadas.

---

**45 LEGO / Toy-like**

*Construcción basada en bloques — La interfaz tangible y modular*

| Familia | Estilos Lúdicos / Creativos |
| :---- | :---- |
| **Índice** | 05 / 05 |
| **Filosofía** | Las interfaces digitales son inherentemente modulares; este estilo toma esa premisa literalmente, diseñando componentes web que parecen piezas de plástico inyectado, bloques de construcción infantiles o hardware retro-futurista de juguete. |
| **Referentes** | Sitios corporativos de juguetes (Lego, Playmobil), Teenage Engineering (hardware), interfaces de juegos de puzzles, interfaces *Neobrutalistas* estructuradas. |
| **Emoción** | Nostalgia táctil, familiaridad física, estructura indestructible, claridad funcional. |
| **Sectores** | Herramientas de productividad gamificadas, constructores de sitios web (website builders), portafolios de ingenieros/desarrolladores, interfaces para niños. |

## **1\. Filosofía del Toy-like Design**

Este estilo convierte el esqueleto estructural (el *box model* de CSS) en el diseño final. Todo está en cajas. Todo encaja perfectamente. A diferencia del *Flat Design*, aquí el diseño no es plano: es tridimensional, pero es un 3D plano, mecánico e industrial, simulando el plástico ABS de los bloques de construcción o botones de máquinas arcade.

## **2\. Paleta de Color**

Paletas categóricas y organizadas.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Bloques Primarios** | Rojo fuego, Amarillo girasol, Azul rey, Verde grama. | Se usan puros, sin gradientes. Cada bloque de interfaz suele tener un color completo de fondo. |
| **Estructura** | Gris plástico (\#E0E0E0), Negro profundo y Blanco. | Contenedores base donde los bloques coloridos se "conectan". |
| **Bordes/Sombras** | Versiones oscurecidas (multiply) del color base del bloque. | Para dar el efecto de bisel 3D del plástico inyectado. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Geométricas, densas y bloqueadas. *Rubik, Montserrat Black, Space Grotesk, Roboto Mono*.  
* **Tratamiento:** Textos en mayúsculas para botones y etiquetas, simulando el texto moldeado en plástico o impreso en una etiqueta de juguete. A menudo en blanco puro o negro puro, centrados perfectamente dentro del bloque.

## **4\. Formas y Elementos Visuales**

* **El Efecto Biselado (Bevel):** El núcleo del estilo. Se logra utilizando múltiples sombras interiores (inset box-shadows) —blancas semi-transparentes en la parte superior e izquierda, negras/oscuras en la inferior y derecha— creando la ilusión de un botón físico saliente.  
* **Bordes Gruesos Perimetrales:** Cada "pieza" suele estar delimitada por un borde sólido oscuro que separa visualmente los bloques de construcción.  
* **Studs/Topes:** Patrones de fondo sutiles o elementos circulares que imitan los puntos de anclaje de un bloque Lego.  
* **Grid Visible:** Las interfaces de juguete suelen mostrar la cuadrícula subyacente o las líneas divisorias duras entre los componentes modulares.

## **5\. Animaciones**

Las animaciones deben sentirse mecánicas y pesadas, nunca orgánicas o flotantes.

| Animación | Duración | Descripción Toy-like |
| :---- | :---- | :---- |
| **Pulsación (Click)** | 100ms | Animación instantánea donde la sombra inferior desaparece, la posición baja (translateY) y las sombras *inset* se invierten para simular un botón físico presionado hasta el fondo. |
| **Snap into Place** | 200ms | Cuando un elemento aparece o se mueve (como en drag-and-drop), no flota; se ajusta a la cuadrícula con un movimiento rígido y un paro abrupto. |
| **Interruptores (Toggles)** | 150ms | Transiciones duras y rápidas simulando un interruptor mecánico de hardware pesado. |

## **6\. Variables CSS Conceptuales**

* **Sistema de Bisel (Bevel 3D):** Variables que agrupan conjuntos complejos de box-shadow y border-color para aplicarlos rápidamente a cualquier contenedor y convertirlo en un "bloque de plástico".  
* **Módulo Base:** Variables de espaciado altamente estrictas (ej. \--lego-unit: 8px). Todo tamaño, *margin* y *padding* debe ser un múltiplo exacto de esta unidad para que las piezas encajen visualmente.  
* **Colores Sólidos:** Sistema de tokens de color sin variaciones de opacidad (excepto para los reflejos del biselado).

## **7\. Anti-patrones**

* **NUNCA** usar gradientes suaves o formas orgánicas fluidas. Todo debe ser ortogonal o tener curvas perfectamente circulares (pill-shape).  
* **NUNCA** usar sombras difuminadas flotantes (soft elevation). Los juguetes son objetos físicos pesados que descansan sobre el suelo; las sombras deben ser proyecciones duras u ortogonales.  
* **NUNCA** tener márgenes que no se alineen a la cuadrícula. Rompe la ilusión del sistema de encaje de bloques.