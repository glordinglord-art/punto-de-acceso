**GUÍA DE ESTILOS CSS**

**Estilos de Interfaz**

**Específicos**

Familia XI de XI — 9 estilos documentados en profundidad

Guía de referencia para la generación de CSS basado en tendencias específicas de interfaz de usuario (UI), sistemas de diseño propietarios y movimientos radicales de la web. Cubre la filosofía técnica, características visuales, paletas de color, tipografía, texturas simuladas, variables CSS y anti-patrones.

| \# | Estilo | Filosofía central | Emoción objetivo |
| :---- | :---- | :---- | :---- |
| 54 | Glassmorphism | Jerarquía visual a través de la translucidez y el fondo dinámico | Modernidad etérea, sofisticación, inmersión |
| 55 | Neumorphism | Los componentes extruidos del propio material del fondo | Minimalismo táctil, homogeneidad, suavidad |
| 56 | Claymorphism | 3D amable y amigable con volúmenes mate e inflados | Accesibilidad lúdica, alegría, confort visual |
| 57 | Skeuomorphism | Simulación de texturas y funcionamientos del mundo real | Familiaridad física, artesanía digital |
| 58 | Material Design | Tinta mágica sobre papel digital con iluminación física | Orden sistemático, previsibilidad, universalidad |
| 59 | Fluent Design | Materiales acrílicos, profundidad, iluminación direccional (Microsoft) | Productividad enfocada, ligereza, ambiente nativo |
| 60 | Brutalism (Web) | La honestidad del HTML puro, sin adornos ni frameworks | Autenticidad cruda, nostalgia técnica, utilidad |
| 61 | Anti-Design | La ruptura intencional de la usabilidad y la jerarquía | Provocación, caos, anarquía digital |
| 62 | Data Visualization | Los datos densos transformados en belleza estructural | Claridad analítica, rigor científico, descubrimiento |

---

**54 Glassmorphism**

*La jerarquía de la translucidez — El vidrio esmerilado como contenedor de información*

| Familia | Estilos de Interfaz Específicos |
| :---- | :---- |
| **Índice** | 01 / 09 |
| **Filosofía** | Crear profundidad tridimensional en un entorno 2D permitiendo que los colores y formas del fondo interactúen con los elementos de primer plano a través de un desenfoque (blur) translúcido. |
| **Referentes** | Apple (macOS Big Sur, iOS), Windows 11, sitios de tarjetas de crédito modernas, dashboards cripto. |
| **Emoción** | Sofisticación tecnológica, ligereza, ambiente premium y espacialidad. |
| **Sectores** | Fintech, dashboards premium, landing pages SaaS, carteras Web3. |

## **1\. Filosofía del Glassmorphism**

El Glassmorphism no trata de ocultar el fondo, sino de utilizarlo para dar contexto. Requiere múltiples capas: un fondo colorido y dinámico, y superficies semi-transparentes que desenfocan lo que hay detrás, creando una sensación de "vidrio esmerilado" o *frosted glass*.

## **2\. Paleta de Color**

La paleta se divide estrictamente entre el fondo y el cristal.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Fondo Dinámico** | Colores análogos vivos (ej. púrpuras, rosas, azules) a menudo en gradientes fluidos o formas abstractas. | El lienzo posterior (canvas) que le da vida al cristal. |
| **Cristal Blanco (Light)** | rgba(255, 255, 255, 0.1) a 0.4. | Tarjetas y contenedores principales en temas claros. |
| **Cristal Oscuro (Dark)** | rgba(0, 0, 0, 0.2) a 0.6 o grises azulados muy profundos. | Dashboards en modo oscuro. |
| **Luz de Borde** | Blanco al 20-40% de opacidad (rgba(255,255,255,0.3)). | Simula el reflejo de la luz incidiendo en el borde del cristal cortado. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Sans-serif geométricas de altísima legibilidad (*Inter, SF Pro, Roboto, Poppins*).  
* **Tratamiento:** Debido a que el fondo desenfocado reduce el contraste, la tipografía debe ser extremadamente nítida. Se prefiere el color blanco sólido (o negro sólido en light mode), con pesos estructurales fuertes (Medium 500 o Semibold 600\) para evitar que el texto se "disuelva" visualmente.

## **4\. Formas y Elementos Visuales**

* **Cristal Esmerilado:** Uso de backdrop-filter: blur(10px) saturate(150%) para crear el efecto óptico de refracción. La saturación aumentada evita que el desenfoque opaque demasiado los colores de fondo.  
* **Reflejo Perimetral:** Un borde interno sutil de 1px (border: 1px solid rgba(255,255,255,0.18)), generalmente más brillante en la parte superior izquierda, que delinea la tarjeta contra el fondo.  
* **Superposición Z-Index:** Al menos 3 o 4 tarjetas superpuestas espacialmente para demostrar cómo el cristal trasero desenfoca al delantero.

## **5\. Animaciones**

* **Fondo Vivo:** Formas de colores en el fondo (blobs) que se mueven o giran lentamente, haciendo evidente que el panel frontal es translúcido y reactivo a la luz.  
* **Hover de Iluminación:** Al hacer *hover* sobre una tarjeta de cristal, aumenta ligeramente la opacidad del blanco (de 10% a 20%) o se intensifica la luz del borde.

## **6\. Variables CSS Conceptuales**

* **Blur Control:** Variables para la intensidad del desenfoque (--glass-blur: 16px).  
* **Glass Background:** Definición del fondo del cristal (--glass-bg-light: rgba(255, 255, 255, 0.05)).  
* **Glass Border:** Contorno que define la forma geométrica (--glass-edge: 1px solid rgba(255, 255, 255, 0.15)).

## **7\. Anti-patrones**

* **NUNCA** aplicar Glassmorphism sobre fondos blancos puros o negros planos; el efecto es invisible si no hay variaciones de color o textura detrás del elemento.  
* **NUNCA** descuidar la accesibilidad (WCAG). Textos grises o finos sobre cristal translúcido son ilegibles.  
* **NUNCA** olvidar un *fallback* de CSS (fondo sólido opaco) para navegadores antiguos que no soporten backdrop-filter.

---

**55 Neumorphism**

*La extrusión del material — Interfaces suaves de una sola superficie*

| Familia | Estilos de Interfaz Específicos |
| :---- | :---- |
| **Índice** | 02 / 09 |
| **Filosofía** | Los elementos de la interfaz no flotan sobre el fondo, sino que están esculpidos en él. El diseño se basa en la manipulación sutil de luces y sombras para extruir o hundir la interfaz de un único bloque de material. |
| **Referentes** | Conceptos de Dribbble (2020), interfaces de control de hardware de audio (sintetizadores virtuales), calculadoras minimalistas. |
| **Emoción** | Homogeneidad clínica, tacto plástico suave, limpieza hiper-moderna. |
| **Sectores** | Interfaces de domótica (Smart Home), reproductores de música, aplicaciones utilitarias de un solo propósito. |

## **1\. Filosofía del Neumorphism**

A diferencia del Material Design (tarjetas que flotan separadas del fondo), en el Neumorfismo la tarjeta *es* el fondo. Todo comparte el mismo color exacto, y solo las sombras proyectadas en dos ejes contrarios definen la topografía de los botones, *sliders* o campos de texto.

## **2\. Paleta de Color**

La monocromía llevada al extremo funcional.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Color Base Único** | Generalmente un gris cálido, azulado muy suave o *off-white* (\#E0E5EC, \#F0F0F3). | Fondo general, fondo de los botones, fondo de los inputs. Todo. |
| **Sombra Oscura** | El color base oscurecido (ej. restando \-20% a la luminosidad HSL). | Sombra proyectada en la esquina inferior derecha. |
| **Sombra Clara (Luz)** | El color base aclarado (ej. blanco puro o luminosidad \+20%). | Reflejo proyectado en la esquina superior izquierda. |
| **Acento** | Un color suave y plano (azul cielo, coral). | Usado con extrema restricción para iconos activos o botones de encendido. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Tipografías Sans-serif redondeadas o muy neutras (*Nunito, Varela Round, SF Pro Rounded*).  
* **Tratamiento:** El texto principal utiliza una versión profundamente oscura del color base (no negro puro). Los textos secundarios pueden adoptar un estilo de bajorelieve sutil usando un efecto Letterpress (sombra de texto inferior blanca, sombra superior oscura).

## **4\. Formas y Elementos Visuales**

* **La Sombra Doble (Drop Shadow):** Un botón elevado se logra con dos sombras CSS simultáneas: box-shadow: 9px 9px 16px rgb(163,177,198,0.6), \-9px \-9px 16px rgba(255,255,255, 0.5).  
* **El Elemento Hundido (Inset Shadow):** Los *inputs* de texto o botones presionados utilizan exactamente la misma sombra pero con la propiedad inset, creando el efecto de que el material ha sido ahuecado.  
* **Bordes Invisibles:** Los elementos nunca tienen la propiedad border, ya que rompería la ilusión del material continuo.

## **5\. Animaciones**

* **Pulsación Neumórfica:** Al hacer clic (:active), la sombra exterior transiciona suavemente hacia una sombra interior (inset), hundiendo el botón en la superficie física.  
* **Interruptores y Sliders:** Animaciones fluidas que desplazan el elemento resaltado a través de "rieles" esculpidos (elementos con sombra *inset*).

## **6\. Variables CSS Conceptuales**

* **Variables Tonales:** Sistema que calcula automáticamente el color base (--neu-base), la sombra de luz (--neu-light) y la sombra de profundidad (--neu-dark).  
* **Mixins de Elevación:** Agrupación de sombras exteriores (--shadow-out) e interiores (--shadow-in) para aplicar a botones activos e inactivos.

## **7\. Anti-patrones**

* **NUNCA** usar Neumorfismo para elementos críticos de jerarquía primaria sin complementos visuales (el contraste natural del neumorfismo suele fallar los estándares WCAG).  
* **NUNCA** usar un color base negro puro o blanco puro. Si es negro puro, no puedes hacer una sombra oscura; si es blanco puro, no puedes hacer la luz superior. Necesita un tono intermedio.  
* **NUNCA** saturar la pantalla con decenas de botones extruidos; genera un ruido visual táctil excesivo y confusión.

---

**56 Claymorphism**

*El 3D de arcilla — Interfaces infladas, mate y amigables*

| Familia | Estilos de Interfaz Específicos |
| :---- | :---- |
| **Índice** | 03 / 09 |
| **Filosofía** | Crear elementos que parecen modelados en arcilla suave, plastilina o goma inflada. Combina la perspectiva 2D/3D con colores pastel y reflejos internos mate. |
| **Referentes** | Ilustraciones de Amrit Pal Singh, Meta Avatars (estilo visual), interfaces de herramientas Web3 lúdicas y EdTech moderna. |
| **Emoción** | Accesibilidad amigable, diversión, confort infantil, ausencia de peligro o tensión. |
| **Sectores** | Educación en línea, criptojuegos, realidad virtual amigable (metaverso casual), agencias de innovación. |

## **1\. Filosofía del Claymorphism**

A diferencia del Neumorfismo (que es plano y tallado) o el Material Design (que son hojas de papel delgadas), el Claymorphism introduce volumen físico y grosor al componente. Es una respuesta juguetona y táctil a las interfaces planas y corporativas.

## **2\. Paleta de Color**

Vibrante, mate y desaturada.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Pasteles Vibrantes** | Rosa chicle, lavanda, celeste, naranja suave. | El cuerpo de los elementos tridimensionales. |
| **Fondo Contraste** | Colores análogos más claros que los botones. | Entorno general del canvas. |
| **Sombras Tonales** | Variantes ricas y más oscuras del color base (nunca gris/negro). | El núcleo del efecto volumen. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Sans-serif *Black* o *ExtraBold*, con terminales redondeadas. *Fredoka One, Dosis, Quicksand, Baloo*.  
* **Tratamiento:** Los textos flotan sobre el botón inflado. Nunca se entierran ni se graban; a menudo tienen su propia micro-sombra de caída para separar el texto del volumen inferior.

## **4\. Formas y Elementos Visuales**

* **Curvas Extremas:** Radios de borde (border-radius) masivos. Las esquinas afiladas están completamente prohibidas.  
* **La Triple Sombra 3D:** La receta CSS del Claymorphism requiere tres capas:  
  1. box-shadow externo difuminado (para proyectar sombra en el fondo).  
  2. inset box-shadow oscuro en la parte inferior derecha (para dar el volumen esférico inferior).  
  3. inset box-shadow blanco o muy claro en la parte superior izquierda (el reflejo suave de la luz incidiendo en el plástico mate).

## **5\. Animaciones**

* **Rebote Físico (Jelly):** Al hacer clic o hover, la tarjeta se aplasta (escala Y reducida, escala X aumentada) simulando la física de un objeto de goma viscoelástica.  
* **Flotación Volumétrica:** Los botones principales levitan y oscilan muy lentamente en el eje Y.

## **6\. Variables CSS Conceptuales**

* **Clay Formula:** Una variable compleja que contiene la triple sombra ajustada al color de la tarjeta (box-shadow: 8px 8px 16px rgba(0,0,0,0.1), inset \-6px \-6px 12px rgba(0,0,0,0.15), inset 6px 6px 12px rgba(255,255,255,0.7)).  
* **Blobs de Radio:** Variables para manejar el border-radius asimétrico si se buscan formas de nubes o rocas de arcilla.

## **7\. Anti-patrones**

* **NUNCA** usar sombras proyectadas negras y duras. Las sombras de "arcilla" son siempre difusas y, de preferencia, del mismo tono del fondo pero más oscuras.  
* **NUNCA** usar texturas fotográficas brillantes, de cristal o de metal. El material es inherentemente mate (baja reflectividad).  
* **NUNCA** aplicar líneas divisorias de 1px (borders finos). El volumen anula la necesidad de líneas.

---

**57 Skeuomorphism**

*El hiperrealismo físico — La artesanía de la réplica digital*

| Familia | Estilos de Interfaz Específicos |
| :---- | :---- |
| **Índice** | 04 / 09 |
| **Filosofía** | Las interfaces deben replicar el aspecto visual y funcional de los equivalentes físicos del mundo real para reducir la carga cognitiva apoyándose en la familiaridad intuitiva. |
| **Referentes** | iOS 6 (y anteriores), plugins VST de audio (simuladores de amplificadores y sintetizadores), iBooks clásico (librería de madera), interfaces de relojes inteligentes (esferas clásicas). |
| **Emoción** | Nostalgia táctil, artesanía premium, familiaridad inmediata, lujo clásico. |
| **Sectores** | Producción musical (plugins de audio), relojería de lujo, juegos digitales (mesas de casino, tablero). |

## **1\. Filosofía del Skeuomorphism**

Antes del *Flat Design*, el skeuomorfismo reinaba. Las aplicaciones de notas parecían blocs de papel amarillo con cuero sintético; los micrófonos virtuales tenían rejillas metálicas. Aunque fue desestimado por "recargado", hoy sobrevive con extrema fuerza en nichos donde el "hardware" virtualizado aporta un valor premium (audio, simuladores automotrices).

## **2\. Paleta de Color**

Dictada exclusivamente por el material del mundo real a imitar.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Materiales Orgánicos** | Marrón cuero, verde fieltro, madera caoba, papel viejo. | Fondos de la interfaz (la "mesa" o "consola"). |
| **Materiales Industriales** | Acero cepillado, cromo pulido, cristal de lente de cámara, plástico negro texturizado. | Carcasas de la interfaz, botones mecánicos, diales (knobs). |
| **Luz Sintética** | LED Rojo brillante, verde neón, o naranja de válvula de vacío. | Indicadores de encendido/apagado, medidores de volumen (VU meters). |

## **3\. Tipografía**

* **Fuentes recomendadas:** Se adaptan al objeto simulado. Si imita hardware de los 80s: LCD Monospace, o *Helvetica* condensada como la impresa en aluminio. Si imita una libreta: caligrafía o fuente de máquina de escribir (*Courier*).  
* **Tratamiento:** Letterpress o grabado (engraved text). El texto impreso en metal virtual lleva una sombra interior de 1px oscura, o un texto de color más oscuro con una sombra de luz blanca de 1px desplazada hacia abajo (simulando hendidura).

## **4\. Formas y Elementos Visuales**

* **Iluminación Coherente:** Un principio inviolable. Si la fuente de luz imaginaria viene de la esquina superior izquierda a las 11:00 am, **absolutamente todos** los biseles, botones, cables y pantallas deben proyectar sombras hacia la parte inferior derecha, y reflejar la luz (highlights) en la parte superior izquierda.  
* **Texturas Ricas:** Uso intensivo de background-image con patrones fotográficos *seamless* (sin costuras) para recrear madera o aluminio cepillado.  
* **Detalles No Funcionales:** Inclusión de costuras falsas de hilo en bordes de cuero, o tornillos en las esquinas de los paneles de aluminio para anclar el diseño a la realidad física.

## **5\. Animaciones**

* **Física Mecánica:** Los interruptores no transicionan de color suavemente; saltan de posición con una rápida aceleración simulando un muelle mecánico interno.  
* **Giro de Dial:** Interfaces con perillas redondas que responden al giro del ratón, imitando la fricción de un potenciómetro.

## **6\. Variables CSS Conceptuales**

* **Gradientes Metálicos:** Complejos conjuntos de variables linear-gradient y radial-gradient (a veces 5 o 6 capas superpuestas) para lograr reflejos cromados en CSS puro sin usar imágenes externas.  
* **Estilos de Grabado:** Agrupaciones de text-shadow optimizadas para crear textos hundidos en superficies mates o brillantes.

## **7\. Anti-patrones**

* **NUNCA** usar iluminación inconsistente (ej. que la sombra de un botón caiga hacia abajo y la de otro botón cercano hacia arriba). Destruye la ilusión espacial inmediatamente.  
* **NUNCA** usar texturas de baja calidad fotográfica que sufran de pixelación en pantallas de alta densidad (Retina).  
* **NUNCA** mezclar estilos: si la aplicación es un sintetizador analógico de los 70s, no le pongas un botón flotante estilo Material Design.

---

**58 Material Design**

*Tinta y papel digital — El sistema operativo de la web*

| Familia | Estilos de Interfaz Específicos |
| :---- | :---- |
| **Índice** | 05 / 09 |
| **Filosofía** | Las interfaces están compuestas de "hojas de papel" digital, un material que tiene superficie sólida, genera sombra en un entorno 3D, y reacciona a los toques con "tinta" mágica. Se basa en una jerarquía tipográfica inquebrantable. |
| **Referentes** | El ecosistema de aplicaciones de Google, framework MUI (Material-UI), Vuetify, Android OS UI. |
| **Emoción** | Previsibilidad, orden corporativo universal, eficiencia lógica. |
| **Sectores** | Aplicaciones empresariales, paneles de administración masivos, software Android nativo, web-apps corporativas. |

## **1\. Filosofía de Material Design**

Introducido por Google en 2014, Material Design fue un intento de estandarizar la usabilidad global. Cada píxel debe obedecer leyes físicas: el papel puede deslizarse, superponerse y elevarse, pero nunca atravesarse a sí mismo (como si fueran objetos físicos en una caja poco profunda).

## **2\. Paleta de Color**

Colores inspirados en el diseño arquitectónico moderno y señalética de carreteras.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Color Primario (y variantes)** | Colores muy definidos de la escala Material (Ej. Blue 500, Purple 700). | Barras de aplicaciones (App Bars), botones primarios, estados activos. |
| **Acento (Secondary)** | Un color de alto contraste con el primario (ej. Teal, Pink, Amber). | Floating Action Buttons (FAB), toggles, barras de progreso. |
| **Background / Surface** | Blanco absoluto (\#FFFFFF) o gris extremadamente claro. | El "papel" de las tarjetas (cards) y modales. |

## **3\. Tipografía**

* **Fuentes recomendadas:** *Roboto* (la fuente oficial), o su reemplazo corporativo moderno *Google Sans*.  
* **Tratamiento:** Rigidez modular. Existe una escala estricta (Headline 1 a 6, Subtitle 1-2, Body 1-2, Button, Caption, Overline). Los botones utilizan siempre texto en MAYÚSCULAS con tracking (espaciado entre letras) positivo. Los textos de cuerpo se sitúan mayormente en gris de opacidad 87% para alta prioridad o 60% para baja prioridad (nunca negro puro).

## **4\. Formas y Elementos Visuales**

* **Elevación (Elevation):** El concepto clave. Es un sistema z-index enlazado a sobras específicas (dp o *density-independent pixels*). Una tarjeta está a elevación 2dp (sombra muy corta y definida), mientras que un FAB o Modal flotan a 8dp o 24dp (sombras expansivas y difusas).  
* **Botón de Acción Flotante (FAB):** Un círculo perfecto, generalmente en la esquina inferior derecha, que representa la acción primaria de toda la pantalla (ej. "Escribir nuevo correo").  
* **Bordes Subordinados:** Los contenedores suelen tener esquinas sutilmente redondeadas (estándar histórico de 4px, versiones recientes permiten más redondeo).

## **5\. Animaciones**

Material Design posee una guía de animación (*choreography*) exhaustiva.

* **Ripple Effect (Ondas de Tinta):** Al tocar o hacer clic en una superficie, un círculo de color translúcido (tinta) se expande desde el punto exacto de contacto hasta cubrir el elemento.  
* **Transformación de Material:** Si haces clic en una tarjeta para abrirla, la tarjeta no desaparece: crece, cambia de proporción asimétricamente y se convierte en la pantalla entera, mientras su sombra se intensifica al "acercarse" al usuario.  
* **Easing Material:** Las animaciones usan la curva estandarizada cubic-bezier(0.4, 0.0, 0.2, 1). Un inicio rápido seguido de una desaceleración muy suave.

## **6\. Variables CSS Conceptuales**

* **Sistema de Elevación:** Un diccionario de variables \--md-elevation-1 hasta \--md-elevation-24 que contiene configuraciones precisas de dos sombras por nivel (sombra de luz ambiente y sombra de luz direccional clave).  
* **Paleta de Tonos:** Variables que almacenan las gradaciones del 50 al 900 de cada tono base, permitiendo consistencia a lo largo del framework.  
* **Easing Curve:** Estandarización de \--md-transition: 250ms cubic-bezier(0.4, 0.0, 0.2, 1).

## **7\. Anti-patrones**

* **NUNCA** usar sombras de colores. Las sombras en Material Design siempre representan un bloqueo de luz fotorealista (grises o negras).  
* **NUNCA** superponer dos superficies a la misma elevación espacial. Cada capa requiere su propia altitud en el eje Z de sombras.  
* **NUNCA** usar múltiples Floating Action Buttons de igual tamaño y color en la misma pantalla; confunde cuál es la acción prioritaria de la vista.

---

**59 Fluent Design**

*Los materiales del entorno — La integración profunda con el sistema*

| Familia | Estilos de Interfaz Específicos |
| :---- | :---- |
| **Índice** | 06 / 09 |
| **Filosofía** | El sistema de Microsoft enfocado en cinco pilares de percepción humana: Luz, Profundidad, Movimiento, Material y Escala. La interfaz no debe sentirse como una web ajena, sino como una extensión nativa e integrada del sistema operativo. |
| **Referentes** | Windows 11, interfaz web de Microsoft 365, Azure Portals, sitios promocionales de productos Surface. |
| **Emoción** | Productividad cristalina, ligereza corporativa, modernidad integrada, enfoque. |
| **Sectores** | Herramientas B2B para Windows, aplicaciones de ofimática web, paneles de nube corporativos. |

## **1\. Filosofía de Fluent Design**

Mientras Material Design es opaco y de colores planos (tinta en papel), Fluent Design abraza el vidrio teñido, la refracción sutil, la iluminación interactiva direccional, y el respeto total por el esquema de colores a nivel de sistema del usuario (Light/Dark preference).

## **2\. Paleta de Color**

* **Neutros Sólidos:** Variaciones de blanco a negro rigurosas que cambian completamente dependiendo del sistema del usuario.  
* **El Color de Énfasis (Accent Color):** Fluent respeta agresivamente el color de preferencia del usuario (ej. un azul corporativo o un rojo vino) utilizándolo en todos los estados activos, bordes seleccionados y cajas de verificación (checkboxes).  
* **Materiales Base:** No son colores puros, sino *shaders*. *Mica* (un material de fondo opaco teñido que refleja sutilmente el color del escritorio trasero) y *Acrylic* (superficies translúcidas que permiten ver lo que hay directamente detrás de la ventana).

## **3\. Tipografía**

* **Fuentes recomendadas:** *Segoe UI Variable* (o *system-ui* configurado para fallback).  
* **Tratamiento:** Énfasis masivo en la legibilidad variable (modificación del peso y espaciado según tamaño pt). Alineación consistente a la izquierda, uso prudente de jerarquías para escalabilidad desde móviles hasta paneles interactivos gigantes.

## **4\. Formas y Elementos Visuales**

* **Bordes Redondeados System-Wide:** En su iteración actual, Fluent utiliza radios estandarizados (generalmente 4px para controles internos, 8px para tarjetas).  
* **El Borde Revelador (Reveal Highlight):** Los controles (botones, elementos de lista) no solo cambian de fondo en hover; un borde luminoso o sutil (de 1px) sigue al ratón sobre los elementos vecinos inactivos, iluminando el límite donde está el cursor, generando orientación espacial.

## **5\. Animaciones**

* **Iluminación Interactiva:** Un resplandor radial suave (radial-gradient) sigue de cerca la posición X/Y del puntero sobre el menú o botón, interactuando con el fondo translúcido (Acrylic brush).  
* **Animaciones Conectadas:** Los elementos mutan a su nuevo estado no por saltos (cuts), sino guiando el ojo del usuario con una transición posicional sin fisuras a través de la interfaz.

## **6\. Variables CSS Conceptuales**

* **Acrylic Fallback:** Variables para generar backdrop-filter: blur() saturate() mezcladas imperceptiblemente con un patrón de ruido (SVG noise texture base64) minúsculo para darle cuerpo real al cristal y prevenir el "banding" de color de fondo.  
* **Control de Mouse-Tracking:** Configuración de gradientes CSS cuyas coordenadas de centro (at x y) se actualizan mediante variables globales de JavaScript para el efecto *Reveal*.

## **7\. Anti-patrones**

* **NUNCA** implementar los efectos translúcidos (Acrylic/Glass) sin el ruido sutil (noise map). Sin la textura física, se verá como macOS, no como el material de Microsoft.  
* **NUNCA** obligar al sistema a ignorar el esquema preferido por el usuario (forzar Light mode). Fluent exige accesibilidad adaptativa total.

---

**60 Brutalism (Web)**

*La honestidad técnica — La exhibición de los engranajes HTML*

| Familia | Estilos de Interfaz Específicos |
| :---- | :---- |
| **Índice** | 07 / 09 |
| **Filosofía** | Reacción rebelde contra la uniformidad, ligereza y corporativismo de los frameworks (como Material o Bootstrap). Valora la exhibición del HTML crudo sin estilos decorativos, celebrando el medio en su forma más pura y funcional. |
| **Referentes** | Sitios de Craiglist clásico, Drudge Report, el movimiento Brutalist Websites, Bloomberg (en ciertas fases experimentales de UX), portfolios de desarrolladores puristas. |
| **Emoción** | Nostalgia de la web de los 90, honestidad radical, rapidez agresiva, rechazo de las modas, "feo por elección". |
| **Sectores** | Medios experimentales, agencias de diseño que cuestionan dogmas, directorios masivos, arte en línea. |

## **1\. Filosofía del Web Brutalism**

Inspirado en la arquitectura Brutalista (que exponía el hormigón crudo y las tuberías en lugar de taparlos con pintura y estuco), el brutalismo web no estiliza en absoluto el código. Lo que importa es la carga casi instantánea, la robustez y el contenido puro. No importa si es "bonito", solo importa si es útil y directo.

## **2\. Paleta de Color**

Paleta predeterminada de los navegadores antiguos o contrastes crudos.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Colores por Defecto HTML** | Azul brillante para links (\#0000EE), Violeta para links visitados (\#551A8B). | Navegación estándar de la red originaria. |
| **Fondo** | Blanco puro (\#FFFFFF) o Gris estándar (\#C0C0C0). | Fondo global, el clásico color gris de Windows 95 para contenedores o botones default. |
| **Texto** | Negro absoluto (\#000000) o colores saturados directamente del RGB primario (rojo puro red, verde puro green). | El texto que domina agresivamente el diseño. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Exclusivamente fuentes seguras del sistema (Web-Safe fonts). *Times New Roman, Courier New, Arial, Verdana, Georgia*. Se prohíben las cargas de @font-face o Google Fonts.  
* **Tratamiento:** Texto alineado a la izquierda sin contemplaciones. Las listas (\<ul\>) mantienen sus viñetas (bullets) por defecto. Los tamaños son grandes, o exactamente los valores predeterminados (16px base o titulares nativos de \<h1\> a \<h6\>).

## **4\. Formas y Elementos Visuales**

* **Controles por Defecto:** Los botones, desplegables (\<select\>), casillas y entradas de texto utilizan el appearance: auto del navegador de turno del usuario. Ningún CSS interfiere para "redondearlos" o darles sombra plana.  
* **Tablas Visibles:** Uso de la etiqueta \<table\> para mostrar datos con el infame atributo border="1" clásico, mostrando líneas negras sólidas y finas sin *padding* acolchado.  
* **Separadores Nativos:** Uso intensivo de la etiqueta \<hr\> (línea divisoria estriada nativa) para estructurar el contenido horizontalmente.

## **5\. Animaciones**

* **Cero Absoluto:** El Brutalismo genuino no tiene transiciones (CSS transition) ni animaciones (CSS animation). Las cosas suceden en un salto de 0 ms. El ratón pasa sobre un link: aparece el subrayado. Se hace clic: se carga instantáneamente. La velocidad y la ligereza son la "animación" estética de este estilo.

## **6\. Variables CSS Conceptuales**

La ironía es que un sitio web verdaderamente brutalista casi no usa variables globales de CSS porque requiere CSS mínimo (reset.css está prohibido, el navegador manda).

* **Sin embargo**, un "Neo-brutalismo" intencionado usaría variables para fijar un azul vibrante estándar (--web-blue: blue) o bordes duros de 1px a todo, forzando un reseteo visual hacia "lo nativo de los años 90".

## **7\. Anti-patrones**

* **NUNCA** intentar embellecer el brutalismo añadiendo "un poquito de padding suave", bordes redondeados (border-radius) o gradientes amigables de CSS3. Hacerlo traiciona la estética purista cruda y lo convierte en un mal diseño corporativo.  
* **NUNCA** usar flexbox avanzado o CSS Grid con justificación al centro para crear diseños súper espaciados de lujo.  
* **NUNCA** incluir librerías JavaScript pesadas para control visual de diseño (como jQuery o animaciones scroll).

---

**61 Anti-Design**

*El caos deliberado — La subversión de todas las reglas de experiencia de usuario*

| Familia | Estilos de Interfaz Específicos |
| :---- | :---- |
| **Índice** | 08 / 09 |
| **Filosofía** | Diseñado deliberadamente para romper convenciones de UX (User Experience). Causa fricción, confusión e incomodidad para obligar al usuario a prestar atención al medio, funcionando como una performance de arte digital y una sátira al diseño hiperoptimizado de Silicon Valley. |
| **Referentes** | El movimiento Web Brutalism llevado al extremo, sitios de net.art, proyectos de graduación de arte experimental, *Hacker News* pero sobrecargado. |
| **Emoción** | Irritación inicial, curiosidad perversa, sobreestimulación abrumadora, rebeldía total. |
| **Sectores** | Exclusivamente proyectos de arte, fanzines radicales en línea, portafolios hipervanguardistas, campañas de marketing de guerrilla shock. |

## **1\. Filosofía del Anti-Design**

Si el buen diseño es "invisible", el Anti-Design es un obstáculo gritando en medio de la pantalla. No hay jerarquía clara, y lo que es importante está escondido mientras que lo inútil domina la pantalla. Las leyes de Fitts, Hick y los patrones "Z-pattern" se utilizan, pero para ser invertidos.

## **2\. Paleta de Color**

Paletas discordantes, creadoras de vibración óptica molesta.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Choques Complementarios** | Rojo puro sobre verde brillante, o Magenta vibrante sobre Cian agresivo. | Textos y fondos de los textos donde sea imperativa la dificultad deliberada de lectura. |
| **Colores 'Feos' (Unflattering)** | Marrones sucios, verde oliva militar fluorescente, amarillo bilis. | Fondos de grandes áreas para romper cualquier sentido de estética armónica. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Cuentan con una mezcla masiva de tipografías incompatibles (ej. Cómic Sans mezclada con Arial Black y una vieja fuente Blackletter caligráfica alemana).  
* **Tratamiento:** Ilegibilidad intencional. Textos que se superponen entre sí debido a valores negativos de interlineado (line-height). Tamaños de fuente gigantes truncados por contenedores estrechos (overflow: visible).

## **4\. Formas y Elementos Visuales**

* **Superposición Destructiva (Z-index anárquico):** Imágenes, textos en marquesina y botones se sitúan unos sobre otros ocultando información, usando posiciones absolutas caóticas.  
* **Marquesinas Recuperadas:** Recuperación irónica de la vieja etiqueta \<marquee\> (ahora simulada por animaciones de CSS) para textos desplazándose a distintas velocidades.  
* **GIFs Animados de Baja Resolución:** Estética de GeoCities, cursores que giran, calaveras o llamas en llamas esparcidos sin un esquema modular.  
* **Bordes Asimétricos y Ruidosos:** Uso de bordes (borders) dobles, rayados o *ridge/groove* con grosores enormes en colores neón.

## **5\. Animaciones**

* **Pulsaciones Abrasivas:** Contenedores de texto que alteran su color de fondo violentamente varias veces por segundo (violando toda normativa de epilepsia fotosensible si no hay advertencias claras).  
* **Desplazamientos Contraintuitivos:** Enlaces o botones interactivos que "escapan" al movimiento del ratón, u objetos que giran al intentar clickearlos, generando una experiencia web hostil (hostile UX).

## **6\. Variables CSS Conceptuales**

* **Sistemas de Caos (Posición):** Variables generadas a través de bucles SASS (o en JavaScript) asignando top/left al azar o transform: rotate extremos (ej. \--rotation: 17deg, \--rotation: \-81deg) a todos los hijos dentro del documento.  
* **Animaciones Infinitas:** animation: spin 0.3s linear infinite en botones críticos.

## **7\. Anti-patrones (Paradójicamente, la meta del estilo)**

* **NUNCA** intentes hacer que el Anti-Design sea "accesible" (WCAG) o "amigable" (UX friendly). El propósito ontológico del estilo es ser el anti-patrón supremo de la web corporativa. (Nota: Esto limita severamente su uso comercial ético a círculos artísticos estrictos, conscientes e interactivos de optar).  
* **NUNCA** organices la información con una grilla coherente. La simetría es tabú.

---

**62 Data Visualization / Infographic**

*La arquitectura de la información densa — Belleza basada en la evidencia*

| Familia | Estilos de Interfaz Específicos |
| :---- | :---- |
| **Índice** | 09 / 09 |
| **Filosofía** | La data hiperdensa no es un adorno; es el contenido y el lienzo. La belleza proviene de la organización impecable de la estadística compleja permitiendo análisis intuitivos, guiado por los principios de la relación datos-tinta (Data-Ink ratio) de Edward Tufte. |
| **Referentes** | Sitios de periodismo interactivo (New York Times, The Pudding), mapas de la Universidad Johns Hopkins (COVID dashboard), Bloomberg Terminal, diseño visual de D3.js. |
| **Emoción** | Rigor científico, claridad inmensa, revelación intelectual, descubrimiento confiable. |
| **Sectores** | Fintech, dashboards médicos, interfaces SaaS de analítica (BI), periodismo de investigación. |

## **1\. Filosofía de Data Vis Web**

La estética se somete totalmente a la integridad estructural de la información. Elimina todo "Chartjunk" (basura de gráfico): sombras innecesarias, falsos 3D y cuadrículas pesadas que distraigan de las líneas, barras o puntos que cargan el significado verdadero.

## **2\. Paleta de Color**

Diseñada científicamente para evitar la distorsión, garantizar la diferenciación y tener accesibilidad visual para daltónicos.

| Categoría | Características | Uso típico |
| :---- | :---- | :---- |
| **Categórica (Cualitativa)** | Colores muy diferenciados entre sí que no insinúen jerarquías (no ordenables naturalmente). | Identificación de distintos países en un gráfico de líneas, diferentes marcas. |
| **Secuencial (Cuantitativa)** | Gradiente de luz a oscuridad de un mismo color (Ej. verde pastel a verde botella). | Mapas de calor (Heatmaps) mostrando intensidad o temperatura de baja a alta. |
| **Divergente** | Dos colores secuenciales que se encuentran en un neutro claro en el centro (Ej. Rojo profundo a Blanco a Azul profundo). | Contrastar variables bipolares (Pérdidas frente a Ganancias, Frío a Calor). |
| **Neutro / Estructura** | Grises muy pálidos (\#E5E5E5) para líneas de grilla (axes), negro sólido (\#111111) para datos resaltados. | Ceder protagonismo a las formas coloreadas. |

## **3\. Tipografía**

* **Fuentes recomendadas:** Familias diseñadas para tablas y pantallas pequeñas (*Inter, Roboto Mono, IBM Plex Sans, Fira Code*).  
* **Tratamiento Numérico:** Es obligatorio el uso de *Tabular Lining* o font-variant-numeric: tabular-nums para que los números cambien y fluyan en tablas sin causar "saltos" en la interfaz. Anchos monospaciados consistentes para una rápida escaneabilidad. Ejes etiquetados usando fuentes sans-serif muy nítidas con poco contraste de grosor (low contrast fonts).

## **4\. Formas y Elementos Visuales**

* **Manipulación de Atributos Críticos:** Los datos se representan variando la posición en X e Y (la más precisa humana), seguida por la longitud/altura (barras), luego el área (burbujas) y finalmente el color (mapas térmicos). Las formas elegidas (nodos circulares, líneas) se dibujan frecuentemente vía \<svg\> limpio.  
* **Mini-gráficos (Sparklines):** Integración de minúsculos gráficos de línea de alta resolución embebidos directamente en medio del texto de los párrafos como "palabras visuales".  
* **Grosor como Importancia:** Líneas maestras en 2px o 3px que destacan el recorrido seleccionado, mientras el resto del contexto (centenares de otras trayectorias) caen a 0.5px de grosor gris.

## **5\. Animaciones**

* **Animación de Dibujo SVG:** Gráficos que revelan progresivamente su información simulando un lápiz de datos al interactuar, utilizando la animación nativa de CSS o librerías D3 (stroke-dashoffset / stroke-dasharray).  
* **Scrollytelling:** El contenido narrativo textual baja por la pantalla, mientras que el gráfico permanece fijado en un lado (position: sticky), actualizando sus líneas, enfocando, reescalando o reorientándose paramétricamente según los puntos de datos que se leen (interpolación en tiempo real).

## **6\. Variables CSS Conceptuales**

* **Paleta de D3 Accesible:** Escalas globales inmutables inyectadas como custom properties (--scale-color-categorical-1, etc.) que respetan los modos de daltonismo simulado.  
* **Dimensiones Estructurales Base:** Variables ligadas directamente a porcentajes fluidos para ancho de barras, coordenadas y gap consistentes entre subgráficos de cajas.

## **7\. Anti-patrones**

* **NUNCA** usar gráficos 3D falsos (como gráficos de pastel en ángulo extruido). El falso volumen distorsiona el área aparente de los sectores de datos, corrompiendo la interpretación del cerebro (un sector trasero luce más grande por el borde extruido en la perspectiva).  
* **NUNCA** ignorar la accesibilidad en daltonismo. Nunca usar rojo y verde puros sin un diferenciador extra de forma, trama o etiqueta en contexto.  
* **NUNCA** incluir una sobrecarga decorativa de grillas traseras marcadas en negro que ahogan las delgadas líneas del gráfico en sí. (Usar grillas ausentes o gris claro al 10% de opacidad).