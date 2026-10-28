**GUÍA DE ESTILOS CSS**

**Estilos Artísticos y**

**Culturales**

Familia X de XI — 8 estilos documentados en profundidad

Guía de referencia para la generación de CSS fundamentado en movimientos de historia del arte y manifestaciones culturales. Cubre la traducción de manifiestos artísticos a principios de interfaz: desde la rigidez de la Bauhaus hasta la fluidez del Ukiyo-e. Incluye filosofía, paletas de color, tipografía, texturas, animaciones, variables CSS conceptuales y anti-patrones.

| \# | Estilo | Filosofía central | Emoción objetivo |
| :---- | :---- | :---- | :---- |
| 46 | Bauhaus | La forma sigue a la función; el arte y la técnica son una nueva unidad | Racionalidad, vanguardia, claridad intelectual |
| 47 | Constructivism | El arte al servicio de un propósito social; composición como construcción | Dinamismo, urgencia, tensión visual |
| 48 | Surrealism | La lógica de los sueños aplicada a la navegación interactiva | Desconcierto, fascinación, misterio |
| 49 | Pop Art | El consumismo y la cultura de masas elevados a arte visual | Ironía, impacto, accesibilidad ruidosa |
| 50 | Abstract Expressionism | La emoción visceral traducida en textura y gesto | Expresividad, caos controlado, profundidad |
| 51 | Japanese Minimalism (Zen) | La asimetría equilibrada y el poder del vacío (Ma) | Serenidad, contemplación, elegancia sutil |
| 52 | Ukiyo-e / Woodblock | Perspectiva plana y contornos definidos del mundo flotante | Nostalgia refinada, belleza tradicional |
| 53 | Street Art / Urban | La reapropiación del espacio mediante textura cruda y capas | Rebeldía, energía urbana, crudeza |

---

**46 Bauhaus**

*La forma sigue a la función — La escuela que inventó el diseño moderno*

| Familia | Estilos Artísticos / Culturales |
| :---- | :---- |
| **Índice** | 01 / 08 |
| **Filosofía** | Eliminación de toda ornamentación burguesa. El diseño web debe revelar su naturaleza digital mediante geometría pura, colores primarios y funcionalidad absoluta. |
| **Referentes** | Walter Gropius, Wassily Kandinsky, Piet Mondrian (De Stijl, estrechamente ligado), pósters de exposiciones de 1923\. |
| **Emoción** | Racionalidad, orden absoluto, modernidad atemporal, franqueza estructural. |
| **Sectores** | Estudios de arquitectura, museos de arte moderno, escuelas de diseño, mobiliario de diseño, agencias de branding. |

## **1\. Filosofía de la Bauhaus en Web**

La Bauhaus no disimula su estructura; la celebra. En diseño web, esto significa que las cuadrículas (grids) se hacen visibles, las proporciones matemáticas dictan el tamaño de cada elemento, y la interfaz se despoja de sombras, degradados o texturas que simulen el mundo físico.

## **2\. Paleta de Color**

La reducción a los elementos visuales más básicos.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Primarios Puros** | Rojo (\#E00000), Amarillo (\#FFD700), Azul (\#0033A0). | Utilizados en bloques de fondo sólidos, formas geométricas o botones. |
| **Neutros Estructurales** | Negro puro (\#000000), Blanco puro (\#FFFFFF), Gris industrial (\#D3D3D3). | Líneas de división, tipografía principal, y grandes espacios en blanco para dar respiro. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Geométricas sin remates. *Futura, Helvetica, ITC Bauhaus, o Jost*.  
* **Tratamiento:** Minúsculas generalizadas (una propuesta histórica de Herbert Bayer para economizar tiempo de lectura y escritura). Uso de tamaños extremos para crear jerarquía sin necesidad de usar múltiples colores. Texto a menudo girado 90 grados a lo largo del eje Y para crear bloques de composición.

## **4\. Formas y Elementos Visuales**

* **Geometría Básica:** El triángulo, el círculo y el cuadrado son los bloques de construcción. Se usan como fondos asimétricos o máscaras de recorte (clip-paths) para imágenes.  
* **Líneas Divisorias:** Uso intensivo de bordes sólidos y gruesos (2px a 4px) para enmarcar el contenido y hacer explícito el sistema de cuadrícula (CSS Grid).  
* **Asimetría Equilibrada:** Los elementos no se centran; se balancean visualmente mediante contrapesos (un elemento pequeño rojo equilibra a uno grande gris).

## **5\. Animaciones**

Las animaciones deben ser mecánicas, predecibles y sin rebotes.

* **Transiciones de Color:** Cambios bruscos de un estado a otro (0ms o 100ms), sin *easing* prolongado.  
* **Deslizamiento Ortogonal:** Los elementos entran en la pantalla moviéndose estrictamente en los ejes X o Y, nunca en diagonales orgánicas.

## **6\. Variables CSS Conceptuales**

* **Grid Rígido:** Variables para fracciones exactas (fr) en CSS Grid, forzando a que todo contenido ocupe celdas precisas.  
* **Grosor Estructural:** Una variable global para el ancho de línea (ej. 3px) que se aplica a todos los bordes, separadores y contornos de botones.  
* **Paleta Restringida:** Variables que impiden el uso de colores intermedios. Solo se permite llamar al rojo, azul, amarillo, blanco o negro.

## **7\. Anti-patrones**

* **NUNCA** utilizar bordes redondeados orgánicos o "blobs"; si hay una curva, debe ser un círculo perfecto o un semicírculo matemático.  
* **NUNCA** emplear gradientes de color; la transición entre un color y otro debe ser una línea dura.  
* **NUNCA** usar tipografías manuscritas o con serifa clásica.

---

**47 Constructivism**

*El diseño como agitprop — Diagonalidad, tensión y construcción industrial*

| Familia | Estilos Artísticos / Culturales |
| :---- | :---- |
| **Índice** | 02 / 08 |
| **Filosofía** | El arte debe tener un propósito social y rechazar la composición pasiva. La interfaz debe comunicar urgencia, movimiento industrial y peso fotográfico. |
| **Referentes** | El Lissitzky, Aleksandr Ródchenko, cartelería soviética de los años 20, Franz Ferdinand (portadas de discos). |
| **Emoción** | Agitación, urgencia, impacto monumental, dinamismo industrial. |
| **Sectores** | Revistas políticas, eventos de vanguardia, manifiestos digitales, moda brutalista. |

## **1\. Filosofía del Constructivismo Web**

El Constructivismo rechaza la horizontalidad pacífica. Utiliza líneas gruesas, diagonales agresivas y fotomontajes para forzar al ojo a moverse a través de la pantalla. Es un estilo pesado, de alto impacto, donde la letra es tratada como material de construcción (como vigas de acero).

## **2\. Paleta de Color**

Altísimo contraste, derivado de la imprenta económica de principios del siglo XX.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Dicotomía Base** | Rojo agresivo (\#D92121) y Negro (\#111111). | El 90% de la identidad visual. Tipografía, bloques diagonales. |
| **Fondo** | Blanco roto o pergamino industrial (\#F4F4F0). | Lienzo sobre el que las formas negras y rojas impactan. |
| **Acento Secundario** | Amarillo ocre (\#E5A93D) (opcional). | Usado raramente para destacar elementos menores. |

## **3\. Tipografía**

* **Fuentes recomendadas:** *Impact, Anton, Bebas Neue, o fuentes cirílicas simuladas*. Sans-serif grotescas ultragruesas.  
* **Tratamiento:** Uso masivo de mayúsculas (ALL CAPS). Las letras a menudo se escalan para ocupar todo el ancho del contenedor, sin importar su espaciado. Uso de texto apilado verticalmente o en ángulos de 45 grados.

## **4\. Formas y Elementos Visuales**

* **Ejes Diagonales:** La estructura de la página se inclina usando transform: skewY() o recortes poligonales diagonales.  
* **Barras de Énfasis:** Gruesos rectángulos negros o rojos que subrayan palabras o enmarcan fotografías.  
* **Fotomontaje:** Imágenes en blanco y negro, fuertemente contrastadas (sin grises medios), recortadas abruptamente y superpuestas sobre geometría sólida.

## **5\. Animaciones**

* **Barrido Industrial:** Bloques de color que cruzan la pantalla rápidamente para revelar texto, imitando el golpe de una imprenta.  
* **Parallax Agresivo:** Diferentes capas de fotomontaje que se mueven a velocidades drásticamente distintas en el scroll para exacerbar la profundidad.

## **6\. Variables CSS Conceptuales**

* **Ángulos Constantes:** Variables para definir una inclinación global (ej. \-11 grados) que se aplica a contenedores y texto para mantener coherencia geométrica.  
* **Filtros Fotográficos:** Variables con altos valores de contraste, escala de grises y un ligero tinte sepia para aplicarse mediante filter a cualquier imagen subida por el usuario.  
* **Peso Tipográfico:** Definición estricta del peso (font-weight: 800 o 900\) forzado en todos los encabezados.

## **7\. Anti-patrones**

* **NUNCA** componer una página exclusivamente con rectángulos alineados al eje horizontal y vertical; la ausencia de diagonales mata el dinamismo constructivista.  
* **NUNCA** usar colores pastel o acuarelas.  
* **NUNCA** utilizar fotografías a todo color de estilo *stock* corporativo.

---

**48 Surrealism**

*La lógica de los sueños — Donde la interacción desafía la realidad esperada*

| Familia | Estilos Artísticos / Culturales |
| :---- | :---- |
| **Índice** | 03 / 08 |
| **Filosofía** | La yuxtaposición de elementos inconexos genera una nueva realidad. El diseño web surrealista juega con las expectativas del usuario, utilizando engaños visuales y escalas imposibles. |
| **Referentes** | Salvador Dalí, René Magritte, Giorgio de Chirico, sitios web de experiencias inmersivas Awwwards. |
| **Emoción** | Desorientación fascinante, asombro, curiosidad onírica. |
| **Sectores** | Alta costura experimental, estudios de animación 3D, arte digital, campañas de perfumes/lujo. |

## **1\. Filosofía del Surrealismo Web**

El surrealismo en interfaces no se trata solo de imágenes raras, sino de interacciones inesperadas. Un botón que se derrite al pasar el cursor, un scroll que mueve los elementos lateralmente en lugar de hacia abajo, o elementos que proyectan sombras en direcciones imposibles.

## **2\. Paleta de Color**

Paletas que evocan paisajes oníricos o atardeceres imposibles.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Cielos Modificados** | Degradados que van del azul profundo al verde esmeralda o violeta. | Fondos expansivos. |
| **Tonos Desérticos** | Arenas cálidas, ocres, arcillas suaves. | Bases de tarjetas o secciones de contenido. |
| **Acentos Inesperados** | Colores estridentes fuera de contexto (ej. una manzana azul eléctrico). | Elementos interactivos o llamadas a la acción (CTAs). |

## **3\. Tipografía**

* **Fuentes recomendadas:** Mezcla desconcertante. Una Serif elegante y etérea (*Cormorant, Playfair Display*) yuxtapuesta con una Sans muy técnica, o tipografías *display* deformadas (*Ogg, Bogart*).  
* **Tratamiento:** Texto que enmascara imágenes de fondo (background-clip: text), letras que se superponen entre sí de forma ilegible por diseño, o líneas de texto que siguen trazados curvos e irregulares en SVG.

## **4\. Formas y Elementos Visuales**

* **Derretimiento y Distorsión:** Uso de filtros SVG (feTurbulence, feDisplacementMap) para crear efectos de líquido o aire caliente sobre las imágenes o textos.  
* **Trampantojos Interactivos:** Elementos que parecen ser una cosa pero son otra (ej. una pintura en la pantalla que resulta ser un video de fondo, puertas que revelan contenido).  
* **Escalas Absurdas:** Un objeto cotidiano (una taza de té) masivo ocupando el 80% de la pantalla, junto a un elemento arquitectónico minúsculo.

## **5\. Animaciones**

* **Morphing de Formas:** Contenedores que transicionan fluidamente entre formas irreconocibles mediante animación de nodos SVG.  
* **Cursor Personalizado Inverso:** Un cursor de gran tamaño que funciona como una lupa que invierte los colores del fondo o revela una imagen oculta (efecto máscara).  
* **Gravedad Alterada:** Elementos que "caen" hacia arriba o flotan lentamente sin anclaje a la cuadrícula al hacer scroll.

## **6\. Variables CSS Conceptuales**

* **Mapas de Distorsión:** Variables que guardan referencias a URIs de filtros SVG complejos para aplicarlos selectivamente a estados hover.  
* **Rutas de Recorte (Clip-Path):** Polígonos y curvas asimétricas predefinidas para enmascarar imágenes de forma no rectangular.  
* **Modos de Mezcla (Blend Modes):** Uso extenso de mix-blend-mode: difference o exclusion para crear contraste invertido automático dependiendo del fondo.

## **7\. Anti-patrones**

* **NUNCA** hacer que la navegación principal sea tan surrealista que el usuario no pueda encontrar la información crítica. El arte está en el contenido, no en bloquear la usabilidad básica.  
* **NUNCA** usar la física estándar de la web (desplazamientos lineales simples). Todo debe tener un comportamiento ligeramente "fuera de fase".  
* **NUNCA** usar iconografía de interfaz genérica (casitas para el home, lupas normales).

---

**49 Pop Art**

*La repetición del consumo — Puntos, tramas y colores chillones*

| Familia | Estilos Artísticos / Culturales |
| :---- | :---- |
| **Índice** | 04 / 08 |
| **Filosofía** | La elevación de la cultura de masas y el cómic comercial. La interfaz debe ser ruidosa, repetitiva, accesible e irónica, utilizando estéticas de impresión barata. |
| **Referentes** | Roy Lichtenstein, Andy Warhol, MTV clásica, empaques de dulces retro. |
| **Emoción** | Diversión comercial, nostalgia de los 60s, impacto visual, ironía pop. |
| **Sectores** | Marcas de snacks/bebidas, moda juvenil, eventos de cultura pop, agencias de publicidad. |

## **1\. Filosofía del Pop Art Web**

El diseño trata los componentes web como si fueran viñetas de cómic o latas de sopa en un estante de supermercado. Celebra el medio (la pantalla) simulando los errores técnicos de las máquinas de impresión (registro de color movido, puntos de semitono).

## **2\. Paleta de Color**

Inspirada estrictamente en el modelo CMYK de imprenta, llevado al máximo nivel de saturación.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Tonos CMYK Puros** | Cian (\#00FFFF), Magenta (\#FF00FF), Amarillo (\#FFFF00). | Fondos de grandes áreas, superpuestos entre sí. |
| **Trazos** | Negro tinta intenso (\#0A0A0A). | Contornos gruesos para separar absolutamente cada bloque de color. |
| **Contraste Complementario** | Verde neón o Naranja brillante. | Para botones y destellos de llamada a la acción. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Fuentes gruesas de cómic o *display* pesadas. *Bangers, Comic Neue (versión gruesa), Bungee, Paytone One*.  
* **Tratamiento:** Uso de gruesos contornos negros (-webkit-text-stroke), sombras duras desplazadas (efecto 3D extrusion) y onomatopeyas visuales.

## **4\. Formas y Elementos Visuales**

* **Puntos Ben-Day (Halftone):** Patrones de puntos circulares utilizados para crear texturas o gradientes simulados (generados vía CSS con radial-gradient o SVG).  
* **Burbujas de Diálogo:** Los tooltips o modales adoptan formas de globos de texto de cómic, con colas direccionales.  
* **Repetición en Cuadrícula (Estilo Warhol):** Mostrar un mismo componente (ej. imagen de producto) 4 o 6 veces en una grilla, pero alterando los filtros de color (hue-rotate) en cada instancia.  
* **Desfase de Impresión:** Sombras rojas y cian desplazadas ligeramente del elemento principal para simular una impresión a registro fallido.

## **5\. Animaciones**

* **Aparición Escalada (Pop\!):** Los modales y botones entran escalando desde 0 a 120% y rebotando a 100%, acompañado visualmente por líneas de acción (estrellas de explosión).  
* **Flash de Color:** Al hacer *hover*, el elemento no se aclara u oscurece suavemente, sino que cambia a un color completamente contrastante (de amarillo a magenta instantáneo).

## **6\. Variables CSS Conceptuales**

* **Patrones Halftone:** Variables que construyen complejos gradientes radiales repetitivos para ser utilizados como fondos.  
* **Sombras de Cómic:** Variables para box-shadow: 6px 6px 0px \#000, creando volumen 2D plano.  
* **Filtros de Matiz:** Variables para filter: hue-rotate() que permiten iterar el color de un mismo elemento a lo largo de una cuadrícula repetitiva.

## **7\. Anti-patrones**

* **NUNCA** usar gradientes lineales o radiales suaves. Todo cambio de tono debe simularse mediante tramas de puntos (halftone) o colores sólidos planos.  
* **NUNCA** usar sutileza. El Pop Art requiere volumen visual al 100%. Los colores pastel o apagados matan el estilo.  
* **NUNCA** dejar bordes sin delinear. El estilo cómic exige que casi todo tenga un *stroke* negro.

---

**50 Abstract Expressionism**

*La emoción sobre la forma — Manchas, texturas y el gesto humano*

| Familia | Estilos Artísticos / Culturales |
| :---- | :---- |
| **Índice** | 05 / 08 |
| **Filosofía** | La pantalla como un lienzo de acción. Prioriza la textura cruda, la superposición de capas y la huella del movimiento humano (el "Action Painting") sobre la geometría organizada. |
| **Referentes** | Jackson Pollock, Mark Rothko, Willem de Kooning, sitios de portfolios experimentales. |
| **Emoción** | Caos expresivo, profundidad psicológica, energía visceral. |
| **Sectores** | Estudios de arte, portfolios de fotógrafos o artistas plásticos, marcas de moda *avant-garde*, agencias boutique. |

## **1\. Filosofía del Expresionismo Abstracto Web**

El diseño se centra en la inmersión visual. Se rompen las cajas y los contenedores rectangulares; el fondo y la forma se fusionan mediante brochazos, manchas de pintura digital o campos de color inmensos (Color Field painting) que reaccionan a la interacción.

## **2\. Paleta de Color**

Extremadamente polarizada, dependiendo de la rama expresionista.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Action Painting (Gestual)** | Lienzos crudos (beige/gris) salpicados de colores industriales intensos (negro asfalto, rojo sangre, esmalte blanco). | Fondos con texturas de brochazos y manchas orgánicas. |
| **Color Field (Rothko)** | Bloques inmensos de colores profundos, oscuros y saturados (burdeos, azul marino profundo, ocre vibrante) con bordes difuminados. | Secciones de *scroll* de pantalla completa donde el color es el contenido. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Para contrastar con el caos del fondo, se usan tipografías extremadamente minimalistas y austeras (Sans-serif limpias como *Inter, Neue Haas Unica*) o tipografías *display* que parezcan arañadas o de máquina de escribir desgastada.  
* **Tratamiento:** El texto a menudo es pequeño y marginal, permitiendo que la "pintura" de fondo respire, o por el contrario, gigantesco pero con muy baja opacidad, fundiéndose con las texturas.

## **4\. Formas y Elementos Visuales**

* **Ruptura de Contenedores:** Ausencia de tarjetas (cards) tradicionales. El texto flota sobre áreas de textura creadas por imágenes o manipulaciones de canvas en WebGL.  
* **Bordes Rasgados o Pintados:** Uso de imágenes con canales alfa complejos que simulan brochazos para revelar secciones o imágenes.  
* **Ruido y Granulado (Grain):** Aplicación de ruido visual constante (noise o film grain) sobre toda la pantalla para dar tacto orgánico.

## **5\. Animaciones**

* **Revelación en Máscara Animada:** Las imágenes de los proyectos no aparecen en un cuadrado; se revelan como si un pincel ancho estuviera pintando la pantalla en tiempo real (máscaras SVG animadas).  
* **Campos de Color Pulsantes:** En el estilo *Color Field*, los fondos degradados oscilan muy lentamente en opacidad y matiz, imitando la vibración luminosa de una pintura de Rothko.  
* **Seguimiento Dinámico de Puntero (WebGL):** El cursor deja un rastro fluido temporal, imitando pintura diluida o tinta dispersándose en el agua.

## **6\. Variables CSS Conceptuales**

* **Texturas de Ruido Base:** Variables que apuntan a data URIs de texturas granuladas superpuestas con pointer-events: none y mix-blend-mode.  
* **Gradientes de Bordes Suaves:** Generación de múltiples gradientes radiales superpuestos para recrear la profundidad nebulosa del Color Field.  
* **Z-Index Espaciales:** Estratificación intensa donde la textura de pintura cruza por delante y por detrás del texto interactivo.

## **7\. Anti-patrones**

* **NUNCA** usar *dropshadows* de interfaz estándar (sombras de tarjetas). La profundidad debe lograrse por contraste de texturas y color, no simulando elevación de UI corporativa.  
* **NUNCA** organizar el contenido en una cuadrícula (grid) perfectamente evidente y rígida.  
* **NUNCA** usar iconos vectoriales limpios (SVG line-art). Desentonan por completo con la crudeza del entorno.

---

**51 Japanese Minimalism (Zen)**

*El poder del vacío (Ma) — La contemplación y la asimetría equilibrada*

| Familia | Estilos Artísticos / Culturales |
| :---- | :---- |
| **Índice** | 06 / 08 |
| **Filosofía** | Basado en conceptos como *Ma* (el espacio negativo), *Wabi-sabi* (belleza en la imperfección) y *Shibui* (elegancia sutil). El diseño no debe forzar la atención, sino invitar a la calma. |
| **Referentes** | Kenya Hara, Muji, sitios de ryokans (posadas tradicionales), marcas de té premium, arquitectura de Tadao Ando. |
| **Emoción** | Serenidad, silencio interior, contemplación profunda, respeto, elegancia orgánica. |
| **Sectores** | Spas de lujo, cosmética botánica, estudios de arquitectura, hospitalidad premium. |

## **1\. Filosofía del Minimalismo Zen Web**

Diferente al minimalismo occidental (basado en grillas rígidas suizas y pragmatismo funcional), el minimalismo japonés abraza la asimetría sutil, los elementos de la naturaleza, y trata el espacio vacío no como una ausencia, sino como una presencia sustancial ("Ma").

## **2\. Paleta de Color**

Tonos terrosos, naturales y profundamente silenciados.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Tonos Naturales (Shibui)** | Verde bambú desaturado, gris piedra, marrón corteza, papel de arroz (Washi). | Fondos, superficies sutiles. |
| **Tinta Sumi-e** | Negros apagados o gris carbón profundo (\#1A1A1A). | Para todo el texto e ilustraciones; nunca negro digital puro (\#000000). |
| **Acento Carmesí** | Rojo sello tradicional (Hanko \- \#B32428). | Usado con extrema parsimonia; solo para sellos, botones clave o indicadores de línea sutiles. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Mincho (Serif japonés) o su equivalente occidental como *Cormorant Garamond, Noto Serif, o Shippori Mincho*. También tipografías *sans* ultra finas (*Yu Gothic, Roboto Light*).  
* **Tratamiento:** Texto con generoso interlineado (line-height). A menudo, se incluyen sutiles modos de escritura vertical (writing-mode: vertical-rl) para pequeños títulos o citas poéticas decorativas.

## **4\. Formas y Elementos Visuales**

* **Enso (El círculo Zen):** Uso de círculos sutiles, a veces dibujados con textura de pincel, asimétricos, que enmarcan elementos o flotan en el fondo.  
* **Márgenes Masivos:** El contenido se concentra en áreas pequeñas, rodeado por océanos de espacio en blanco/papel de arroz.  
* **Enmarcado Sutil:** Fotografías enmarcadas por líneas sumamente finas (1px) de color gris o carbón, sin sombras proyectadas.  
* **Organismo y Asimetría:** Los elementos no se alinean perfectamente en centros rígidos; se equilibran como piedras en un jardín Zen (un elemento grande a la izquierda se compensa con mucho espacio vacío a la derecha).

## **5\. Animaciones**

Las animaciones deben emular el flujo del agua o la brisa.

* **Aparición Lenta y Respiratoria:** *Fade-ins* muy lentos (800ms a 1500ms) vinculados al scroll, dando la sensación de que el contenido "respira" al aparecer en la página.  
* **Desplazamiento Horizontal Suave:** Al navegar o abrir galerías, el movimiento es lateral, suave y sin inercia mecánica (emulando las puertas corredizas *Shoji*).

## **6\. Variables CSS Conceptuales**

* **Modos de Escritura:** Variables para controlar la orientación del texto (horizontal vs. vertical) como un recurso de diseño modular.  
* **Espaciado Masivo:** Un sistema de *padding* y *margin* basado en multiplicadores enormes (rem elevados) para garantizar la presencia constante del vacío (*Ma*).  
* **Textura Washi:** Uso sutil de múltiples imágenes de fondo (background-image) con modos de mezcla multiplicar para dar una levísima textura de fibra de papel al blanco.

## **7\. Anti-patrones**

* **NUNCA** llenar la pantalla de información para "aprovechar el espacio". El horror vacui es el enemigo de este estilo.  
* **NUNCA** usar colores primarios brillantes, neones o gradientes artificiales.  
* **NUNCA** implementar animaciones rápidas, rebotantes (spring animations) o que requieran urgencia.

---

**52 Ukiyo-e / Japanese Woodblock**

*El mundo flotante — Perspectiva plana, línea de contorno y naturaleza estilizada*

| Familia | Estilos Artísticos / Culturales |
| :---- | :---- |
| **Índice** | 07 / 08 |
| **Filosofía** | Traducción visual de la xilografía japonesa de los siglos XVII-XIX. Supone el abandono de la perspectiva lineal occidental en favor de la perspectiva isométrica o apilada, con líneas de contorno fuertes y bloques de color plano. |
| **Referentes** | Katsushika Hokusai, Utagawa Hiroshige, sitios turísticos culturales de Kioto, marcas de sake premium, ilustraciones orientadas al manga clásico. |
| **Emoción** | Nostalgia refinada, belleza efímera, admiración por la naturaleza y la artesanía. |
| **Sectores** | Turismo cultural asiático, gastronomía japonesa, artesanía, diseño editorial especializado. |

## **1\. Filosofía del Ukiyo-e en Web**

En la técnica real de xilografía, cada color es un bloque de madera tallado distinto, y la línea negra maestra (keyblock) une todo. La web adopta esto usando áreas de color plano y sólido, bordes definidos (sin sombreados), e incorporando motivos recurrentes como olas estilizadas, nubes en bandas y montañas brumosas.

## **2\. Paleta de Color**

Basada estrictamente en los pigmentos naturales históricos de Edo.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Azul de Prusia (Bokashi)** | Azul índigo o profundo (\#003153) a menudo en gradientes que se desvanecen hacia el blanco. | Cielos, agua, fondos dramáticos. |
| **Rojo Bermellón** | Naranja rojizo intenso (\#E34234). | Acentos, detalles arquitectónicos, sellos. |
| **Tonos Naturales y Papel** | Ocre apagado, verde pino oscuro, pergamino envejecido. | Bases para texto y paisajes terrestres. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Tipografías Serif caligráficas con alta variación en el trazo, simulando escritura con pincel.  
* **Tratamiento:** Integración de "sellos de firma" (pequeños cuadrados rojos con texto invertido en blanco) como marcadores para fechas de artículos, categorías o logotipos. Textos secundarios en orientaciones verticales limpias.

## **4\. Formas y Elementos Visuales**

* **La Línea Clave (Keyline):** Todos los contenedores ilustrados, avatares o modales importantes tienen un contorno continuo de color tinta oscuro (simulando el tallado en madera).  
* **Ausencia de Perspectiva Lineal:** Los elementos de fondo no se desenfocan ni encogen de acuerdo a la óptica moderna; simplemente se posicionan más altos en la página y se solapan.  
* **Gradientes Bokashi:** Un tipo específico de gradiente donde un borde tiene color intenso y se desvanece suave y linealmente hacia la transparencia del papel, utilizado exclusivamente en fondos de cielo o agua.  
* **Nubes Estilizadas (Kasumi):** Formas geométricas de bandas horizontales (niebla) que cruzan las imágenes o el contenido para separar secciones verticales.

## **5\. Animaciones**

* **Parallax de Capas (Planos):** Al hacer scroll, distintas capas vectoriales (olas, barcos, fondo) se mueven a diferentes velocidades horizontales, replicando cómo se estampa un grabado a múltiples placas.  
* **Aparición como Sello:** Los elementos de validación o botones aparecen con un pequeño "golpe" sin rebote, como si un sello de madera mojado en tinta acabara de presionar el papel.

## **6\. Variables CSS Conceptuales**

* **Keyblock Borders:** Variables predefinidas para border: 2px solid \#1a1a1a que se aplican consistentemente a imágenes e inputs.  
* **Bokashi Gradients:** Funciones de linear-gradient predefinidas que emulan el desvanecimiento de pigmento sobre papel texturizado.  
* **Filtros de Tinta:** Manipulación vía CSS para garantizar que los elementos nunca sean puramente negros, aplicando variables de color "tinta índigo oscuro".

## **7\. Anti-patrones**

* **NUNCA** usar renderizados 3D fotorrealistas con iluminación dinámica (raytracing). La planitud (flatness) es la firma estética del Ukiyo-e.  
* **NUNCA** usar colores CMYK brillantes o estéticas de neón cyberpunk (es la antítesis cronológica del Ukiyo-e).  
* **NUNCA** usar sombras de elevación (box-shadow) que creen profundidad volumétrica estándar de UI.

---

**53 Street Art / Urban**

*La reapropiación del espacio — Paredes, esténciles y texturas crudas*

| Familia | Estilos Artísticos / Culturales |
| :---- | :---- |
| **Índice** | 08 / 08 |
| **Filosofía** | Traducir la crudeza visual de la calle a la web. Se apropia de texturas industriales, la inmediatez del aerosol, los carteles rasgados (wheatpaste) y una actitud subversiva ante las reglas de diseño convencionales. |
| **Referentes** | Banksy, Shepard Fairey (Obey), marcas de skate/surf hardcore, festivales de hip-hop underground. |
| **Emoción** | Subversión, energía cruda, autenticidad callejera, caos anárquico. |
| **Sectores** | Ropa de calle (Streetwear), eventos urbanos, lanzamientos de zapatillas, estudios creativos *edgy*, música urbana. |

## **1\. Filosofía del Street Art Web**

La interfaz no se percibe como una pantalla prístina detrás de un cristal, sino como un muro urbano expuesto a los elementos. Se fomenta el desgaste, la yuxtaposición de texturas, el "ensuciamiento" tipográfico y los mensajes directos e impactantes, simulando el vandalismo artístico interactivo.

## **2\. Paleta de Color**

Contraste extremo entre el sustrato físico y el pigmento aplicado.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Materiales Base** | Gris hormigón, rojo ladrillo lavado, negro asfalto, acero oxidado. | Fondos estructurales y contenedores principales. |
| **Pigmento Clandestino** | Colores de lata de aerosol: Fucsia flúor, Amarillo tráfico, Blanco titanio, Cian neón. | Destacados (highlights), botones de acción, logotipos y trazos encima de las imágenes. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Fuentes tipo esténcil (Stencil), firmas de grafiti (Handstyle tags), tipografías *bold* brutalistas distorsionadas, o tipo cartel desgarro.  
* **Tratamiento:** Títulos que parecen haber sido pintados apresuradamente con spray sobre la pared. Mezcla agresiva de fuentes: un título impecable en Helvetica puede estar tachado con una fuente caligráfica ruda simulando un rotulador permanente.

## **4\. Formas y Elementos Visuales**

* **Wheatpaste Posters:** Las imágenes de contenido no tienen bordes redondeados limpios; usan clip-path o PNGs con canales alfa para simular papel rasgado, engomado o arrugado pegado a la pantalla.  
* **Esténcil y Halftone crudo:** Imágenes fotográficas con altísimo contraste, convertidas a 2 tonos (blanco y negro puro) como si fueran plantillas para pintar en aerosol.  
* **Gotas y Salpicaduras (Drips):** Detalles vectoriales de pintura que escurre en los bordes de los contenedores o por debajo de los botones principales.  
* **Capas Ocultas (Overwriting):** Elementos visuales del pasado parcialmente pintados por encima, dejando ver el "fantasma" de las versiones anteriores.

## **5\. Animaciones**

* **Efecto de Raspado / Rasgado:** Transiciones de página donde un contenido "desgarra" o raspa al anterior para aparecer.  
* **Flicker (Glitch) Orgánico:** Pequeños destellos en la opacidad que imitan luces de neón parpadeantes o cámaras de seguridad de baja calidad.  
* **Spray Paint Reveal:** Elementos que se revelan de izquierda a derecha usando una máscara ruidosa (noise mask), imitando el trazo de una lata de spray.

## **6\. Variables CSS Conceptuales**

* **Máscaras de Desgaste:** Definición de máscaras CSS (mask-image mediante URIs) que aplican rayones y texturas de daño a cualquier componente estandarizado que se coloque debajo.  
* **Superposición de Tinta:** Uso intensivo de la variable conceptual de mezcla mix-blend-mode: multiply y color-burn para que el texto de color spray interactúe ópticamente con la textura fotográfica del muro de fondo.  
* **Rotaciones Anárquicas:** Variables aleatorias de inclinación (entre \-3deg y 3deg) para que ninguna imagen quede perfectamente nivelada.

## **7\. Anti-patrones**

* **NUNCA** dejar componentes limpios con sombras suaves de elevación tipo Material Design (las famosas tarjetas blancas corporativas). Parecen un error de carga en este entorno.  
* **NUNCA** usar iconografía *line-art* delicada, redondeada y perfectamente simétrica.  
* **NUNCA** priorizar el orden rígido y el espaciado en blanco inmaculado; en la estética urbana, el espacio vacío siempre atrae el grafiti. El lienzo debe sentirse vivido y utilizado.