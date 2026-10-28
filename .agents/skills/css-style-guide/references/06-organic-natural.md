**GUIA DE ESTILOS CSS**

**Estilos Orgánicos y Naturales**

Familia VII de XI — 4 estilos documentados en profundidad

Guía de referencia para la generación de arquitecturas visuales basadas en la naturaleza, la imperfección y la fluidez. Cubre desde la emulación de formas biológicas hasta la profunda filosofía estética de la imperfección y el paso del tiempo.

| \# | Estilo | Filosofía central | Emoción objetivo |
| :---- | :---- | :---- | :---- |
| 33 | Organic / Biomorphic | La naturaleza no tiene líneas rectas; el diseño debe fluir | Relajación, accesibilidad, suavidad cognitiva |
| 34 | Earthy / Natural | Conexión táctil con los materiales crudos de la tierra | Calidez, sostenibilidad, honestidad material |
| 35 | Botanical / Floral | Celebración del crecimiento y la exuberancia vegetal | Frescura, vitalidad, elegancia orgánica |
| 36 | Wabi-Sabi | La belleza de lo imperfecto, asimétrico y efímero | Serenidad profunda, contemplación, melancolía bella |

---

**33 Organic / Biomorphic**

*El rechazo del píxel cuadrado — Interfaces que respiran y fluyen*

| Familia | Estilos Orgánicos / Naturales |
| :---- | :---- |
| **Índice** | 01 / 04 |
| **Filosofía** | Inspirado en el biormorfismo (arte basado en formas biológicas). Las interfaces digitales son inherentemente cajas rectangulares; este estilo busca ocultar esa estructura mediante curvas extremas, formas de ameba (blobs) y transiciones onduladas. |
| **Referentes** | Arquitectura de Zaha Hadid o Gaudí adaptada a UI, Mailchimp (rebranding orgánico), Headspace, marcas de bienestar mental y salud preventiva. |
| **Emoción** | Calma, amabilidad, ausencia de fricción, fluidez natural. |
| **Sectores** | Aplicaciones de meditación, productos infantiles, agencias creativas, plataformas de psicología, productos ecológicos innovadores. |

## **1\. Filosofía Visual Orgánica**

El diseño biomórfico trata de engañar al ojo para que olvide que está mirando una pantalla de píxeles en una cuadrícula. Utiliza el espacio negativo no como un margen rígido, sino como un fluido que rodea el contenido. No hay esquinas afiladas que detengan la mirada; todo invita a deslizarse hacia la siguiente sección.

### **1.1 Elementos estructurales**

* **Blobs y Formas de Ameba:** Contenedores de imágenes o fondos de sección que utilizan formas redondeadas asimétricas en lugar de círculos perfectos o rectángulos.  
* **Separadores Ondulados (Wave Dividers):** Las secciones no terminan en líneas rectas horizontales, sino en curvas senoidales o fluidas que conectan un bloque de color con el siguiente.  
* **Márgenes Suaves:** Las tarjetas flotan ligeramente y sus radios de borde son amplios (ej. 24px a 40px), eliminando cualquier sensación de "caja".

## **2\. Paleta de Color Biomorphic**

| Categoría | Valores hex | Rol en la composición |
| :---- | :---- | :---- |
| Agua y Brisa (Bases) | \#E8F4F8, \#F0F7F4 | Fondos pastel muy diluidos. Nunca blanco puro, siempre teñidos de naturaleza. |
| Verdes Salvia | \#87A89B, \#A2B9A6 | Colores de interacción y acentos primarios suaves. |
| Corales y Melocotones | \#FF9F87, \#FFCBA4 | Puntos de atención cálidos que contrastan sin la agresión del rojo puro. |
| Azul Profundo | \#1A365D, \#2C4A73 | Usado para la tipografía en lugar del negro, manteniendo la armonía con los tonos pastel. |

## **3\. Tipografía Orgánica**

* **Sans-Serif Redondeadas (Rounded):** Fuentes donde los terminales (las puntas de las letras) son curvos en lugar de rectos, invitando a una lectura suave y amigable. (Ej: *Quicksand, Comfortaa, Nunito, Rubik*).  
* **Display Curvilínea:** Para títulos grandes, se usan fuentes con mucho movimiento interno y curvas pronunciadas, a veces casi retro-orgánicas. (Ej: *Recife, Gazpacho*).

## **4\. Implementación Arquitectónica (Sin Código)**

* **Border-Radius Complejo:** En lugar de un solo valor para curvar esquinas, se utilizan los 8 valores del border-radius (ej. 30% 70% 70% 30% / 30% 30% 70% 70%) para crear figuras amorfas y orgánicas mediante CSS puro.  
* **SVG Waves:** Uso de divisores vectoriales con trazados curvos de Bézier para enmascarar la parte inferior o superior de las secciones contenedoras.  
* **Sombras Difusas Acuáticas:** Sombras de caja (box-shadow) con un desenfoque muy alto y una opacidad bajísima, a menudo tintadas con colores fríos (azul o verde) en lugar de negro o gris neutro.

## **5\. Animaciones Biomorphic**

| Animación | Duración | Descripción técnica |
| :---- | :---- | :---- |
| Respiración de Blob (Morphing) | 4s \- 8s | Bucle infinito alternando sutilmente los porcentajes de un border-radius complejo, haciendo que la forma parezca palpitar o flotar en agua. |
| Flotación Sutil | 3s ease-in-out | Desplazamiento vertical leve (translateY) en tarjetas o imágenes, simulando elementos suspendidos en un fluido. |
| Revelado Líquido | 800ms | Aparición de imágenes utilizando máscaras SVG que se expanden como una gota de agua cayendo sobre una superficie. |

## **6\. Anti-patrones del Organic Design**

* **NUNCA** usar bordes rectos (0px) en botones o tarjetas. Rompe inmediatamente la ilusión de fluidez.  
* **NUNCA** utilizar alto contraste agresivo (ej. amarillo neón sobre negro puro). Lo orgánico requiere transiciones de color suaves y armoniosas.  
* **NUNCA** abusar del "blob". Si todo en la pantalla tiene una forma líquida e irregular, se pierde la jerarquía visual y la interfaz se vuelve confusa. Las formas orgánicas deben guiar hacia el contenido rectilíneo (el texto), no oscurecerlo.

---

**34 Earthy / Natural**

*La interfaz táctil — Arcilla, arena, piedra y honestidad material*

| Familia | Estilos Orgánicos / Naturales |
| :---- | :---- |
| **Índice** | 02 / 04 |
| **Filosofía** | Traslada la sensación física de los materiales crudos y la tierra a la pantalla. Se aleja del plástico y el neón digital para abrazar la sostenibilidad, la artesanía y la calidez humana. |
| **Referentes** | Sitios web de cerámica artesanal, marcas de café de especialidad, hoteles boutique ecológicos, revistas de estilo de vida sostenible (Kinfolk). |
| **Emoción** | Arraigo, autenticidad, calidez reconfortante, lentitud intencional (slow living). |
| **Sectores** | Cosmética natural, arquitectura sostenible, gastronomía "farm-to-table", moda en fibras naturales (lino, algodón crudo), ONGs medioambientales. |

## **1\. Filosofía Visual Earthy**

Este estilo confía enormemente en la textura y el color para transmitir peso físico. Mientras que el estilo biomórfico es "líquido", el Earthy es "sólido y poroso". La interfaz no debe sentirse como una pantalla de cristal reflectante, sino como un papel reciclado pesado, un muro de adobe o una mesa de madera tallada.

### **1.1 Elementos estructurales**

* **Texturas Superficiales:** Fondos que incorporan grano fino, emulando papel kraft, lino o cerámica sin esmaltar.  
* **Fotografía Tonal:** Imágenes con bajo contraste, cálidas, donde predominan las sombras marrones y la luz dorada. Se evitan los blancos quemados.  
* **Cajas Contenidas:** A diferencia del organic fluido, aquí hay estructura, pero es una estructura que se siente pesada, con márgenes gruesos y divisores que simulan bajorrelieves sutiles.

## **2\. Paleta de Color Earthy**

| Categoría | Valores hex | Rol en la composición |
| :---- | :---- | :---- |
| Terracota y Barro | \#C57B57, \#A35A41 | Acentos cálidos que evocan vasijas de barro y arcilla horneada. |
| Arena y Avena | \#F4EBD9, \#EAD7C3 | Los colores primarios de fondo. Crudos, sin blanquear, cálidos. |
| Verde Oliva y Musgo | \#5C6B50, \#7A8B6B | Acentos naturales que anclan la paleta sin usar el verde "digital" chillón. |
| Carbón Cálido | \#3B3835, \#2C2A28 | Para la tipografía principal. Un gris muy oscuro teñido de marrón, nunca negro puro \#000. |

## **3\. Tipografía Earthy**

* **Serifas Humanistas y Rústicas:** Fuentes que muestran ligeras irregularidades o que evocan la impresión tradicional en tipos de plomo. (Ej: *Lora, PT Serif, Tiempos, Playfair Display*).  
* **Sans-Serif Cálidas:** Para metadatos y UI, se buscan fuentes sin gracias que mantengan proporciones clásicas y abiertas. (Ej: *Josefin Sans, Lato, DM Sans*).  
* **Espaciado Generoso:** El texto debe respirar. Líneas de altura (line-height) amplias para invitar a una lectura pausada.

## **4\. Implementación Arquitectónica (Sin Código)**

* **Filtros Fotográficos Sepia:** Uso de propiedades CSS (filter: sepia(0.2) contrast(0.9) brightness(0.95)) para unificar dinámicamente fotografías diversas hacia una estética terrosa y mate.  
* **Overlays de Textura:** Fondos que combinan un color sólido con una imagen SVG de ruido (noise) repetida y aplicada con mezcla de exclusión o multiplicación (mix-blend-mode: multiply), añadiendo porosidad visual al fondo.  
* **Bordes Suaves, no Inexistentes:** Bordes de 1px con colores ligeramente más oscuros que el fondo (ej. arena oscura sobre arena clara) para simular pliegues de papel en lugar de cajas flotantes.

## **5\. Animaciones Earthy**

| Animación | Duración | Descripción técnica |
| :---- | :---- | :---- |
| Fade In Rústico | 600ms \- 1000ms | Aparición muy lenta y pesada. Los elementos no "saltan" a la pantalla, emergen gradualmente. |
| Parallax Sutil de Fondo | Vinculado al scroll | Desplazamiento leve de texturas de fondo que da sensación de profundidad física y materialidad. |
| Hover Táctil | 300ms | En lugar de elevarse (shadow), el botón se oscurece ligeramente como si absorbiera luz, o reduce su escala marginalmente (0.98), sintiéndose sólido bajo el clic. |

## **6\. Anti-patrones del Earthy Design**

* **NUNCA** utilizar colores hexadecimales primarios saturados (\#FF0000, \#0000FF). Rompen la ilusión de pigmentos naturales extraídos de la tierra.  
* **NUNCA** usar sombras de gran elevación estilo Material Design (Nivel 4 o 5). Los materiales crudos tienen peso y gravedad; no flotan a centímetros de la superficie.  
* **NUNCA** usar tipografía monoespaciada o de terminal técnica. El código y lo digital son el antítesis de este enfoque táctil.

---

**35 Botanical / Floral**

*La exuberancia del invernadero — Ilustración botánica y crecimiento visual*

| Familia | Estilos Orgánicos / Naturales |
| :---- | :---- |
| **Índice** | 03 / 04 |
| **Filosofía** | Una celebración de la flora. Se apoya fuertemente en la ilustración detallada, los grabados botánicos clásicos y la superposición de hojas, enredaderas y flores sobre la tipografía. Es una estética elegante, fragante y vital. |
| **Referentes** | Ilustraciones de Ernst Haeckel, diseño de botellas de gin premium (Hendrick's), perfumería de nicho, diseño editorial de jardinería, Herbarium estético. |
| **Emoción** | Frescura exuberante, elegancia clásica, abundancia natural, vitalidad sofisticada. |
| **Sectores** | Floristerías de lujo, perfumerías, bodegas, restaurantes botánicos o veganos premium, eventos de bodas al aire libre, té y boticarios modernos. |

## **1\. Filosofía Visual Botánica**

El diseño botánico trata sobre el crecimiento y la invasión controlada. Las plantas trepan por los márgenes de la pantalla, las hojas cruzan por detrás y por delante del texto principal, creando un efecto diorama tridimensional. Es un estilo que mezcla el orden del diseño editorial clásico con la indomabilidad de la naturaleza.

### **1.1 Elementos estructurales**

* **Enmarcado Orgánico:** Uso de ilustraciones de ramas, enredaderas o grandes hojas en las esquinas de la pantalla para crear un marco (frame) hacia el contenido central.  
* **Profundidad de Campo (Z-Index):** Capas de elementos vegetales. Unas hojas desenfocadas en primerísimo plano, el texto en el medio, y textura botánica en el fondo.  
* **Ilustración Clásica:** Uso de grabados antiguos en blanco y negro o acuarelas detalladas en lugar de vectores planos sin detalle.

## **2\. Paleta de Color Botanical**

| Categoría | Valores hex | Rol en la composición |
| :---- | :---- | :---- |
| Verde Bosque y Esmeralda | \#1C442D, \#2D5A27 | Tonos profundos que anclan el diseño y otorgan elegancia solemne. |
| Rosas Polvo y Lavandas | \#D6B5B8, \#B098A4 | Acentos florales desaturados, utilizados para botones o subrayados elegantes. |
| Suelo Fértil | \#4A3525, \#2F2016 | Tonos tierra oscuros como soporte o color de footer. |
| Pergamino Claro | \#FDFBF7, \#F5F0E6 | El fondo por defecto. Un blanco muy roto que sugiere las páginas de un antiguo libro de botánica. |

## **3\. Tipografía Botánica**

* **Serifas Editoriales Finas:** Fuentes con alto contraste entre sus trazos gruesos y finos, evocando revistas de alta gama o libros clásicos de ciencia natural. (Ej: *Cormorant Garamond, Bodoni Moda, Cinzel*).  
* **Script / Caligrafía Decorativa:** Fuentes manuscritas elegantes usadas *con extrema moderación*, solo para palabras clave, ampersands (&) o firmas. (Ej: *Pinyon Script, Great Vibes*).  
* **Itálicas Clásicas:** Uso extensivo de cursivas para citas o subtítulos, reflejando la nomenclatura científica de las plantas (ej. *Monstera deliciosa*).

## **4\. Implementación Arquitectónica (Sin Código)**

* **Superposición Z-Index y Máscaras:** Colocación de archivos PNG transparentes o SVG de hojas con un z-index superior al del título, obligando a los tallos a entrelazarse visualmente con la tipografía.  
* **Mezcla Multiply en Ilustraciones:** Al usar grabados botánicos oscuros sobre fondos pergamino, se aplica un modo de fusión (mix-blend-mode: multiply) para que la ilustración parezca impresa directamente en el fondo, fundiendo los colores.  
* **Layouts Divididos (Split-Screen):** Una mitad de la pantalla ocupada enteramente por una textura botánica densa y la otra por espacio en blanco, tipografía limpia y estructurada.

## **5\. Animaciones Botanical**

| Animación | Duración | Descripción técnica |
| :---- | :---- | :---- |
| Brisa Suave (Swaying) | 5s \- 10s | Rotación minúscula (rotate(2deg) a rotate(-2deg)) anclada en la base de una ilustración de planta (transform-origin: bottom center) simulando viento. |
| Crecimiento en Scroll | Scroll-linked | A medida que el usuario baja, enredaderas SVG se "dibujan" en la pantalla revelando su trazo largo (stroke-dashoffset). |
| Efecto Diorama Parallax | Variable | Las hojas en primer plano se mueven más rápido con el ratón o el scroll que los fondos, creando profunda inmersión. |

## **6\. Anti-patrones del Botanical Design**

* **NUNCA** usar gráficos vectoriales planos estilo "flat design" (clipart de hojas sin detalle). Destruyen la elegancia requerida; el botánico exige detalle fino, ilustración o fotografía de alta calidad.  
* **NUNCA** permitir que la ilustración compita con la legibilidad del texto. Si una hoja cruza un título, debe haber contraste suficiente para que la palabra se lea instantáneamente.  
* **NUNCA** usar grises azulados o tonos tecnológicos (cian, magenta digital). Chocan violentamente con los pigmentos orgánicos de esta estética.

---

**36 Wabi-Sabi**

*La arquitectura de la impermanencia — Minimalismo Zen roto por el tiempo*

| Familia | Estilos Orgánicos / Naturales |
| :---- | :---- |
| **Índice** | 04 / 04 |
| **Filosofía** | Basado en la estética japonesa profunda. Encuentra belleza en lo imperfecto, lo asimétrico, lo incompleto y lo envejecido. Es la aceptación del ciclo natural de crecimiento y decadencia llevado al espacio digital. |
| **Referentes** | Filosofía Kintsugi (reparar con oro), arquitectura tradicional japonesa desgastada, cerámica Raku, fotografía analógica dañada sutilmente. |
| **Emoción** | Reverencia, melancolía serena, respeto por el tiempo, contemplación silenciosa. |
| **Sectores** | Estudios de arquitectura e interiorismo de lujo sobrio, retiros de silencio/meditación, galerías de arte contemporáneo, artesanía de autor, marcas de té ceremonial. |

## **1\. Filosofía Visual Wabi-Sabi**

El Wabi-Sabi es el minimalismo despojado de su arrogancia y perfección. El espacio vacío (Ma) es el elemento más importante de la composición, no como algo que falta, sino como algo que respira. Las alineaciones perfectas se evitan a propósito; la asimetría refleja la naturaleza impredecible de la vida.

### **1.1 Elementos estructurales**

* **Asimetría Intencional (Fukinsei):** Las columnas nunca son exactamente iguales. Una imagen puede estar ligeramente desfasada respecto a su contenedor.  
* **Bordes Rasgados o Desgastados:** Contenedores que no tienen líneas puras, mostrando el desgaste del "tiempo" digital.  
* **Kintsugi Estético:** La inclusión de líneas doradas o acentos muy sutiles que "unen" secciones o dividen el contenido, celebrando la fractura en lugar de ocultarla.  
* **El Vacío (Ma):** Áreas masivas sin contenido visual, diseñadas para que el ojo descanse y la mente contemple antes de interactuar.

## **2\. Paleta de Color Wabi-Sabi**

| Categoría | Valores hex | Rol en la composición |
| :---- | :---- | :---- |
| Ceniza y Polvo | \#E8E5E1, \#D3CFCA | Grises cálidos, desaturados, que evocan el polvo asentado o la piedra pulida por el viento. |
| Indigo Desteñido | \#3C4A5C, \#56687A | Evoca telas teñidas de forma natural que han perdido color bajo el sol a lo largo de los años. |
| Óxido y Cobre | \#8C5E45, \#A26B4D | Colores de decadencia natural de los metales, usados en pequeñísimas dosis. |
| Oro Kintsugi | \#C5A059 | Acento muy restrictivo, usado solo para divisores finos o subrayados especiales que reparan el diseño. |

## **3\. Tipografía Wabi-Sabi**

* **Serifas Finas y Frágiles:** Tipografías elegantes pero ligeras, con trazos finos que casi desaparecen (hairlines). (Ej: *Spectral, EB Garamond, Shippori Mincho*).  
* **Sans-Serif Minimalista Japonesa:** Fuentes de palo seco extremadamente limpias y neutras, dispuestas con mucha separación. (Ej: *Zen Kaku Gothic, Inter Thin*).  
* **Escala Extrema, pero Silenciosa:** Un título gigantesco (ej. 120px) pero en color gris ceniza sobre gris claro, imponiendo presencia sin necesidad de gritar. Texto vertical ocasional para emular la escritura tradicional oriental.

## **4\. Implementación Arquitectónica (Sin Código)**

* **Layouts Fuera de la Grilla (Off-Grid):** Uso de CSS Grid pero con posicionamientos superpuestos (grid-column: 2 / 5, grid-row: 1 / 3 para la imagen, y texto que arranca en la columna 4 y fila 2), creando tensiones visuales.  
* **Efectos de Revelado Ahumado:** Desvanecimientos fotográficos en los bordes. Se utilizan fondos radiales semitransparentes en superposición para que la imagen se pierda lentamente hacia el color del fondo como humo o niebla.  
* **Líneas Incompletas:** Bordes (border-top o border-left) que no recorren el 100% del contenedor, sino que se dibujan parcialmente usando gradientes lineales de CSS que se vuelven transparentes abruptamente, sugiriendo desgaste.

## **5\. Animaciones Wabi-Sabi**

| Animación | Duración | Descripción técnica |
| :---- | :---- | :---- |
| Reveal Contemplativo | 1200ms \- 2000ms | Extremadamente lento. El contenido no debe interrumpir; el usuario debe sentir que la información estaba ahí, escondida en la sombra, y lentamente recibe luz. |
| Humo y Partículas | Bucle infinito | Un ligerísimo desplazamiento de ruido o partículas tenues generadas por SVG filtrado que simulan polvo iluminado por una ventana. |
| Tinta que se Expande | Vinculado a interacción | Al hacer hover en elementos clave, fondos que se expanden lentamente y con formas irregulares, como tinta sobre papel de arroz mojado. |

## **6\. Anti-patrones del Wabi-Sabi**

* **NUNCA** usar simetría bilateral perfecta (todo centrado, mitades idénticas). Para el wabi-sabi, la perfección geométrica es artificial y, por tanto, carente de alma.  
* **NUNCA** llenar el espacio vacío por "miedo al vacío" (horror vacui). Si hay un gran espacio de color arena, añadir un icono decorativo genérico lo arruina todo. El vacío es el diseño.  
* **NUNCA** animaciones rápidas, elásticas o rebotantes ("bouncy"). Cualquier transición menor a 500ms se siente ansiosa y destroza la atmósfera de contemplación atemporal.