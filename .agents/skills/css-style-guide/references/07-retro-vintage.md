**GUIA DE ESTILOS CSS**

**Estilos Retro y Vintage**

Familia VI de XI — 4 estilos documentados en profundidad

Guía de referencia para la generación de arquitecturas visuales basadas en la nostalgia y las eras tecnológicas pasadas. Cubre desde las limitaciones estrictas del hardware de 8 bits hasta la rebeldía analógica del grunge de los noventa.

| \# | Estilo | Filosofía central | Emoción objetivo |
| :---- | :---- | :---- | :---- |
| 30 | Pixel Art / 8-bit | La limitación técnica elevada a lenguaje artístico estricto | Nostalgia lúdica, claridad absoluta, encanto digital puro |
| 27 | 80s Neon Retro | La visión utópica del futuro imaginada en el pasado | Energía vibrante, nostalgia idealizada, velocidad |
| 26 | Y2K | El optimismo del nuevo milenio: plástico transparente y cromo | Futurismo retro, optimismo comercial, tactilidad sintética |
| 31 | Grunge / 90s | La destrucción de la grilla mediante medios analógicos rotos | Rebeldía, autenticidad cruda, tensión visual |

---

**30 Pixel Art / 8-bit**

*La perfección en la rejilla — Interfaces de precisión a nivel de píxel*

| Familia | Estilos Retro / Vintage |
| :---- | :---- |
| **Índice** | 01 / 04 |
| **Filosofía** | Las limitaciones del hardware antiguo (paletas indexadas reducidas, falta de suavizado, cuadrículas de baja resolución) se adoptan como reglas estrictas de diseño. Cada píxel es intencional y visible. |
| **Referentes** | Interfaces de inventario de survival horror clásicos, menús de arcades de los 80s y 90s, indies modernos (Celeste, Stardew Valley), sistemas operativos primitivos. |
| **Emoción** | Diversión directa, nostalgia técnica, simplicidad estructurada, encanto "low-level". |
| **Sectores** | Portafolios de programadores, marketing de videojuegos indies, plataformas web3/NFT, herramientas para creadores, blogs de tecnología retro. |

## **1\. Filosofía Visual del Pixel Art**

El diseño en 8-bit o Pixel Art rechaza cualquier técnica moderna de renderizado suave. No existen los gradientes fluidos, las sombras difuminadas ni el antialiasing (suavizado de bordes). La composición se basa en bloques duros, creando un contraste extremo que resulta paradójicamente muy legible y estéticamente coherente si se respetan las reglas matemáticas de la rejilla.

### **1.1 Elementos estructurales**

* **Escalado Rígido (Integer Scaling):** Todos los elementos deben escalar en números enteros (2x, 3x, 4x) para evitar píxeles deformados o rectángulos irregulares.  
* **Bordes Contundentes:** Los contenedores y botones utilizan bordes sólidos de 1 o 2 "píxeles" lógicos de grosor. Las esquinas redondeadas no existen mediante radios curvos, sino quitando píxeles específicos en las esquinas para simular la curva de forma escalonada.  
* **Ausencia de Antialiasing:** Las imágenes, iconos y textos deben renderizarse con bordes dentados intencionales (jaggies).

## **2\. Paleta de Color Pixel Art**

| Categoría | Valores hex | Rol en la composición |
| :---- | :---- | :---- |
| Fondo Gameboy | \#9BBC0F, \#8BAC0F | Estética monocromática clásica de consola portátil. Verde militar desaturado. |
| CGA Magenta / Cian | \#FF55FF, \#55FFFF | Colores crudos de los primeros monitores de PC. Máximo contraste, uso para terminales o menús de alto impacto. |
| Paleta EGA 16 Colores | \#0000AA, \#AA0000 | Tonos saturados pero oscuros. Útiles para menús de inventario, fondos de cajas de diálogo (ej. azul profundo clásico de RPGs). |
| Blanco Puro / Negro Puro | \#FFFFFF, \#000000 | Contraste absoluto para tipografía y bordes de contenedores. |

## **3\. Tipografía 8-bit**

* **Bitmap Fonts:** El uso de fuentes de mapa de bits es innegociable. Deben cargarse en tamaños múltiples exactos de su tamaño base (ej. si la fuente es de 8px, solo usar 8px, 16px, 24px). (Ej: *Press Start 2P, VT323, Pixelify Sans, Dogica*).  
* **Renderizado de Texto:** Es crítico desactivar el suavizado de fuentes a nivel del navegador para evitar que los navegadores modernos intenten desenfocar los bordes de la tipografía pixelada.  
* **Mayúsculas Estructurales:** Los títulos y etiquetas de menús de configuración suelen verse mejor y más legibles en mayúsculas debido a la escasa cantidad de píxeles disponibles para los caracteres descendentes (como la 'p' o la 'q').

## **4\. Implementación Arquitectónica (Sin Código)**

* **Renderizado de Imágenes (Image Rendering):** Para que las texturas o íconos no se vuelvan borrosos al escalarse, se debe instruir al motor CSS del navegador que utilice el algoritmo de interpolación por vecino más cercano (pixelated o crisp-edges).  
* **Bordes y Sombras a Medida:** En lugar de usar imágenes para los contenedores, se puede construir una interfaz "pixelada" pura utilizando la propiedad de sombra de caja (box-shadow) con múltiples valores apilados (sin ningún desenfoque). Proyectando sombras sólidas hacia la derecha y hacia abajo en incrementos fijos, se dibujan los píxeles de los bordes directamente en CSS.  
* **Cursores Personalizados:** Sustituir el puntero del ratón por archivos .png de baja resolución o .cur (como una mano pixelada o una retícula de nave espacial) refuerza la inmersión táctil.

## **5\. Animaciones de 8-bit**

| Animación | Duración | Descripción técnica |
| :---- | :---- | :---- |
| Sprite Sheets (Caminar / Rotar) | Bucle continuo | Uso de la función de tiempo escalonada (steps) en CSS para mover una imagen de fondo cuadro por cuadro, sin transiciones suaves entre ellos. |
| Parpadeo de Selección (Blink) | 400ms \- 600ms | El clásico "Press Start". Opacidad que alterna bruscamente entre 0 y 1 o 0.5 y 1, nuevamente usando saltos duros (steps(1)). |
| Transición de Cortinilla (Wipe) | 800ms | Relleno de la pantalla mediante bloques negros que crecen, simulando el barrido de memoria de video antigua al cambiar de "escena". |

## **6\. Anti-patrones del Pixel Art**

* **NUNCA** mezclar resoluciones de píxeles (Mixels). Si el "píxel" lógico del diseño equivale a un bloque de 4x4 píxeles reales, todos los elementos (tipografía, iconos, bordes) deben respetar ese tamaño. Un borde fino junto a un icono de píxeles gruesos destruye la ilusión inmediatamente.  
* **NUNCA** usar sombras caídas difuminadas. Todo el sombreado debe ser sólido y escalonado (dithering).  
* **NUNCA** aplicar rotaciones libres. Rotar un contenedor o icono a, por ejemplo, 15 grados en CSS, obliga al navegador a usar antialiasing, rompiendo la cuadrícula. Si algo debe estar rotado, debe dibujarse rotado en el sprite original.

---

**27 80s Neon Retro / Synthwave**

*La velocidad cromada — Autopistas digitales y soles geométricos*

| Familia | Estilos Retro / Vintage |
| :---- | :---- |
| **Índice** | 02 / 04 |
| **Filosofía** | La estilización extrema de la visión futurista que se tenía en la década de 1980\. Es una estética hiper-saturada que combina los primeros intentos de gráficos 3D por computadora (wireframes) con el glamour de las luces de neón nocturnas y los materiales cromados. |
| **Referentes** | Retrowave, Outrun, portadas de cintas VHS, arcades de naves espaciales y conducción clásicos, estética de Miami Vice, Far Cry Blood Dragon. |
| **Emoción** | Adrenalina nostálgica, intensidad, movimiento perpetuo hacia el horizonte, estilización heroica. |
| **Sectores** | Eventos musicales (synthwave, retrowave), portafolios creativos disruptivos, marketing de productos con temática retro-tech, sitios promocionales de eventos de cultura pop. |

## **1\. Filosofía Visual del Synthwave**

El diseño 80s Neon se construye sobre la perspectiva geométrica. A diferencia del diseño plano (flat design), aquí se busca una profundidad simulada, casi virtual. La composición empuja la vista hacia un punto de fuga en el centro de la pantalla, flanqueado por líneas láser y colores vibrantes sobre el vacío del espacio negro o púrpura profundo.

### **1.1 Elementos estructurales**

* **La Rejilla de Perspectiva:** El elemento más icónico. Una cuadrícula en el "suelo" de la interfaz que se fuga hacia el horizonte, dando ilusión de velocidad y espacio tridimensional virtual.  
* **Materiales Duales:** La coexistencia de la luz emisiva pura (neón) y las superficies reflectantes hiper-pulidas (cromo o metal cepillado).  
* **Geometría Primaria Flotante:** Esferas, pirámides o conos dibujados como estructuras de alambre (wireframes) de un solo color brillante sobre el fondo oscuro.

## **2\. Paleta de Color Synthwave**

| Categoría | Valores hex | Rol en la composición |
| :---- | :---- | :---- |
| Púrpura Cielo / Vacio | \#0D0221, \#241734 | El lienzo base. Un negro que tira fuertemente hacia el violeta o añil. |
| Magenta Láser | \#FF00FF, \#F72585 | El color principal para neones, bordes de la rejilla y acentos de energía. |
| Cian Virtual | \#00FFFF, \#4CC9F0 | Contrapeso frío del magenta. Usado para wireframes secundarios y textos de lectura técnica. |
| Atardecer (Sunset) | \#FF9E00 a \#FF0000 | Gradiente cálido, generalmente usado en tipografía principal cromada o en el sol de fondo. |

## **3\. Tipografía 80s Neon**

* **Display Cromado / Script:** Fuentes tipográficas tipo brocha rápida que simulan estar pintadas con aerosol o firmas de neón. (Ej: *Streamster, Mr Dafoe, Lazer84*).  
* **Sans-Serif Tecnológica:** Para equilibrar la exageración de los títulos, el cuerpo de texto utiliza fuentes geométricas sans-serif, a menudo extendidas horizontalmente, para simular monitores técnicos. (Ej: *Montserrat (Extended), VCR OSD Mono, OCR A*).  
* **Styling Textual:** Los títulos grandes nunca son planos. Requieren máscaras de recorte de fondo (text-clip) para incrustarles gradientes lineales metálicos que van del plata al negro y vuelven al plata.

## **4\. Implementación Arquitectónica (Sin Código)**

* **Rejilla 3D CSS:** Se construye la cuadrícula del piso usando fondos de gradiente lineal repetitivo superpuestos (horizontal y vertical). Luego, a nivel estructural, se aplica una perspectiva profunda al contenedor padre y se rota el contenedor de la rejilla sobre el eje X (rotateX) para acostarlo hacia el horizonte.  
* **Resplandor Multicapa (Neon Glow):** El verdadero efecto neón no se logra con una sola sombra. Se requiere apilar al menos cuatro sombras textuales o de caja: una blanca central muy concentrada, y tres del color del neón (ej. magenta) incrementando el radio de desenfoque progresivamente para simular la disipación atmosférica.  
* **Reflejo Metálico:** Para los textos y contenedores cromados, se utiliza un gradiente lineal estricto de arriba hacia abajo con "paradas duras" (hard stops) que simulan el reflejo de un cielo oscuro y un suelo brillante cortados por la línea del horizonte en el medio exacto del elemento.

## **5\. Animaciones Synthwave**

| Animación | Duración | Descripción técnica |
| :---- | :---- | :---- |
| Movimiento de la Rejilla (Outrun) | Bucle continuo | Desplazamiento lineal y constante de la textura del fondo (background-position) sobre la rejilla 3D hacia el usuario, simulando conducción o vuelo a baja altura. |
| Escaneo de Monitor (Scanline) | Bucle lento | Una línea horizontal semitransparente gruesa que recorre toda la pantalla de arriba a abajo, emulando la actualización de tubos de rayos catódicos (CRT). |
| Pulsación del Neón | Aleatoria | Pequeñas variaciones sutiles en la intensidad de las sombras de los textos para dar la sensación de un tubo de gas eléctrico vivo. |

## **6\. Anti-patrones del 80s Neon**

* **NUNCA** usar sombras internas oscuras (inset shadow negras) en los textos principales. El neón emite luz; si hay oscuridad, es en forma de contraste ambiental, no de sombras proyectadas hacia el fondo.  
* **NUNCA** saturar el cuerpo de lectura. Aunque los títulos son masivos y coloridos, el texto de párrafos debe mantenerse en blancos y cianes claros; aplicar efectos de neón a un párrafo completo lo hace ilegible y fatigante.  
* **NUNCA** dejar los elementos flotar sin anclaje visual. A menos que simulen objetos espaciales, las cajas de contenido deben respetar la perspectiva o actuar como "pantallas" frontales planas contrapuestas al fondo 3D.

---

**26 Y2K**

*El optimismo de cambio de siglo — Plástico, burbujas y cromo líquido*

| Familia | Estilos Retro / Vintage |
| :---- | :---- |
| **Índice** | 03 / 04 |
| **Filosofía** | Representa el periodo entre finales de los 90s y principios de los 2000\. Es una época de optimismo tecnológico utópico antes de las crisis modernas. Se centra en la tactilidad artificial: hardware de colores translúcidos, interfaces que imitan fluidos y renderizados 3D primitivos. |
| **Referentes** | El diseño industrial del iMac G3, la estética inicial de The Matrix, interfaces de reproductores multimedia antiguos (Winamp skinning), revistas de videojuegos del año 2000, diseño gráfico de CDs pop. |
| **Emoción** | Nostalgia alegre, futurismo comercial, curiosidad técnica, táctil y sintético. |
| **Sectores** | Marcas de moda juvenil, agencias de diseño experimental, promoción de música pop electrónica, campañas de marketing nostálgicas orientadas a Millennials/Gen Z. |

## **1\. Filosofía Visual del Y2K**

El diseño Y2K es fundamentalmente redondo, brillante y translúcido. Rompe con la rigidez plana mediante la creación de botones que parecen cápsulas de gel o burbujas de plástico líquido. La información a menudo se enmarca dentro de formas irregulares y curvas orgánicas generadas por vectores o modelos 3D primitivos (blobs).

### **1.1 Elementos estructurales**

* **Skeuomorfismo Translúcido:** Contenedores que imitan el plástico tintado (Frost). A diferencia del "Glassmorphism" moderno, el Y2K es mucho más reflectante e incorpora brillos especulares blancos muy duros en los bordes superiores.  
* **Tipografía Extendida y Distribuida:** Uso exagerado de letras minúsculas en los títulos, estiradas horizontalmente y con mucho espacio entre caracteres (tracking).  
* **Vectores Tribales y Ciber-orgánicos:** Elementos decorativos basados en púas curvas, formas de gotas líquidas y curvas de Bézier extremas que adornan esquinas o divisores.

## **2\. Paleta de Color Y2K**

| Categoría | Valores hex | Rol en la composición |
| :---- | :---- | :---- |
| Plata Milenio | \#E0E5EC, \#FFFFFF | El material base de la época. Limpio, metálico, reflectante. |
| Azul Bondi | \#0095B6, \#00C3E3 | Referencia directa al hardware icónico de Apple de 1998\. |
| Naranja Translúcido | \#FF8C00 | Contrapunto cálido para botones de acción o elementos líquidos tridimensionales. |
| Verde Matrix | \#00FF41, \#131A14 | Tonos de consola fosforescente usados específicamente para fondos o áreas de lectura de datos técnicos. |

## **3\. Tipografía Y2K**

* **Neo-Techno:** Fuentes altamente estilizadas de los años 2000 que intentaban parecer de ciencia ficción pero resultaban orgánicas. Cuentan con curvas inusuales y cortes diagonales. (Ej: *Eurostile Extended, Handel Gothic, Space Age*).  
* **Grotescas Redondeadas:** Tipografía de lectura que complementa la naturaleza burbujeante del diseño. (Ej: *Varela Round, Quicksand*).  
* **Micro-Tipografía en Minúsculas:** Uso de fuentes de mapa de bits diminutas para anotaciones y metadatos, típicamente alineadas a los bordes extremos del diseño para dar un toque de interfaz "técnica".

## **4\. Implementación Arquitectónica (Sin Código)**

* **Efecto de Gel o Botón Aqua:** Se logra combinando sombras. Un botón necesita un gradiente de fondo, una sombra interna superior blanca y dura (brillo especular), una sombra interna inferior oscura (volumen), y una sombra exterior ligera.  
* **Contenedores Irregulares (Blobs):** Utilización de la propiedad de curvatura de bordes (border-radius) pero asignando valores de porcentaje asimétricos complejos para cada una de las 8 esquinas del elemento, generando formas orgánicas que parecen amebas líquidas de colores.  
* **Filtros de Desenfoque y Mezcla:** Uso intensivo de fondos con efectos de mezcla (mix-blend-mode) superponiendo texturas metálicas sobre colores sólidos vibrantes para generar ese aspecto de envoltura plástica sobre hardware.

## **5\. Animaciones Y2K**

| Animación | Duración | Descripción técnica |
| :---- | :---- | :---- |
| Fluctuación Líquida (Morphing) | Bucle muy lento | Variación continua de los valores del radio de borde asimétrico en los contenedores "blob" para simular que flotan en gravedad cero. |
| Rebote Plástico (Jelly Bounce) | 300ms | Animación de escala rápida al hacer hover sobre botones o tarjetas, usando funciones elásticas (cubic-bezier rebotante) para enfatizar la naturaleza táctil del "plástico". |
| Rotación 3D Primitiva | Continua | Elementos decorativos (estrellas cromadas, logos) rotando sobre el eje Y de manera lenta y constante, imitando el renderizado de gráficos de PlayStation 1 o Nintendo 64\. |

## **6\. Anti-patrones del Y2K**

* **NUNCA** usar texturas mate. El estilo se define por su brillo comercial. Todo debe sentirse pulido, resbaladizo o encerrado en plástico.  
* **NUNCA** aplicar minimalismo estricto. El Y2K no teme llenar el espacio con curvas innecesarias, degradados metálicos superfluos o decoraciones cibernéticas en las esquinas.  
* **NUNCA** usar colores tierra (marrones, ocres, verdes oliva). El Y2K es una estética fundamentalmente sintética y post-natural.

---

**31 Grunge / 90s Underground**

*La destrucción del píxel — Fotocopias, ruido y rebelión analógica*

| Familia | Estilos Retro / Vintage |
| :---- | :---- |
| **Índice** | 04 / 04 |
| **Filosofía** | Una reacción directa y violenta contra el diseño limpio corporativo. Se inspira en las fanzines hechas a mano, la cultura del skate y la música alternativa de Seattle. La interfaz debe sentirse física, desgastada, sucia y ensamblada con prisa mediante pegamento y tijeras. |
| **Referentes** | Arte de los discos de Nirvana o Nine Inch Nails, tipografía experimental de David Carson, revistas Ray Gun, estética del cine independiente de los 90s, menús de interfaz desgastados y oxidados. |
| **Emoción** | Autenticidad cruda, tensión artística, energía caótica, anti-autoridad. |
| **Sectores** | Marcas de ropa urbana/streetwear, portafolios de arte transgresor, promoción de bandas de rock/metal/punk, editoriales de cultura alternativa, eventos underground. |

## **1\. Filosofía Visual del Grunge**

El grunge aniquila la grilla suiza. La alineación perfecta es considerada aburrida y corporativa. Las columnas de texto se solapan con las imágenes, las líneas divisorias son garabatos hechos a mano y las texturas simulan fotocopiadoras sin tinta y asfalto rascado.

### **1.1 Elementos estructurales**

* **Collage Destructivo:** Imágenes rasgadas, recortes de revistas con bordes irregulares, uso de cintas adhesivas simuladas para sostener elementos del menú o imágenes.  
* **Ruido y Desgaste (Distress):** Ninguna superficie es sólida o limpia. Se aplican superposiciones (overlays) de polvo, rayones, texturas de papel arrugado y manchas de café o tinta.  
* **Inestabilidad Estructural:** Los elementos rara vez están en ángulos perfectos de 90 grados. Rotaciones leves e irregulares de tarjetas, imágenes y titulares.

## **2\. Paleta de Color Grunge**

| Categoría | Valores hex | Rol en la composición |
| :---- | :---- | :---- |
| Asfalto Desgastado | \#1A1A1A, \#2C2C2C | Fondos opresivos, con texturas superpuestas para romper la monotonía del gris. |
| Papel Viejo / Cinta | \#DED3B6, \#C5BAA0 | Color utilizado para fondos de contenedores recortados o tipografías tipo máquina de escribir. |
| Rojo Óxido / Sangre Seca | \#8A1C1C, \#5C1515 | El acento principal de agresión. Usado para subrayados ásperos, alertas o tachaduras. |
| Cian Sucio | \#3B727A | Acento secundario desaturado, reminiscentes de impresiones de inyección de tinta fallidas. |

## **3\. Tipografía Grunge**

* **Máquinas de Escribir Rotas:** Fuentes monoespaciadas que simulan cintas de tinta gastadas, con caracteres desalineados verticalmente y bordes manchados. (Ej: *Special Elite, Mom's Typewriter, Courier Prime*).  
* **Ransom Note (Nota de Rescate):** Titulares construidos combinando múltiples fuentes diferentes por cada letra, simulando recortes de periódico.  
* **Stencil y Sellos:** Tipografía masiva y ruidosa que parece haber sido aplicada con aerosol sobre cemento o estampada con fuerza brutal. (Ej: *Edo, Capture it, Stampter*).

## **4\. Implementación Arquitectónica (Sin Código)**

* **Bordes Desgarrados (Torn Edges):** En lugar de esquinas redondeadas, se utilizan máscaras SVG (SVG masking) o funciones de recorte con formas poligonales altamente irregulares para simular trozos de papel rasgado en los bordes de los contenedores de texto.  
* **Mezcla Analógica de Texturas:** El uso maestro de la propiedad de mezcla de fondos (background-blend-mode: multiply u overlay). Se apila un color base opaco con una imagen de textura de papel sucio y otra capa de ruido granulado encima, fusionándolas para generar una superficie orgánica en tiempo real.  
* **Texto Tachado o Subrayado Físico:** Se prescinde de las decoraciones de texto estándar web. En su lugar, se utilizan imágenes SVG vectoriales de trazos de lápiz o marcadores superpuestas detrás o sobre el texto como elementos decorativos absolutamente posicionados.

## **5\. Animaciones Grunge**

| Animación | Duración | Descripción técnica |
| :---- | :---- | :---- |
| Stop Motion Temblores | Bucle irregular | Titulares o imágenes que cambian su rotación o escala en 1 o 2 grados bruscamente en lugar de deslizarse, imitando animación de recortes cuadro por cuadro. |
| Parpadeo Defectuoso (Glitch/Flicker) | Aleatoria | Saltos de opacidad que sugieren un tubo fluorescente fallando en un sótano húmedo. |
| Transición Estática / Desgarro | 150ms | Transiciones duras sin interpolación suave. Cambios de estado (hovers) casi inmediatos donde, al interactuar, el color se invierte y el texto se desplaza ligeramente fuera de eje. |

## **6\. Anti-patrones del Grunge**

* **NUNCA** utilizar el blanco absoluto (\#FFFFFF) en superficies grandes. El papel o la pared de un callejón nunca son puros; siempre deben tener un tinte sepia, grisáceo o textura de grano.  
* **NUNCA** usar animaciones con curvas de transición fluidas (easing). El grunge rechaza la elegancia digital moderna; los movimientos deben sentirse espasmódicos, crudos y manuales.  
* **NUNCA** depender de sistemas de grilla de 8px u ordenamiento perfecto (Flexbox/Grid perfectamente centrado y espaciado). El diseño debe sentirse ensamblado, con solapamientos intencionales e inconsistencias espaciales que generen tensión visual.