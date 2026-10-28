**GUIA DE ESTILOS CSS**

**Estilos Futuristas y Tecnológicos**

Familia V de XI — 3 estilos documentados en profundidad (Parte 1\)

Guía de referencia para la generación de arquitecturas visuales basadas en la tecnología, el futurismo y la ciencia ficción. Cubre desde interfaces tácticas para simuladores y robótica hasta los estándares funcionales del software empresarial moderno.

| \# | Estilo | Filosofía central | Emoción objetivo |
| :---- | :---- | :---- | :---- |
| 18 | Cyberpunk | High tech, low life; la tecnología invasiva y el neón sobre la decadencia | Sobrecarga sensorial, rebeldía, inmersión distópica |
| 19 | Sci-Fi / Space UI | Funcionalidad extrema para la supervivencia en entornos hostiles y telemetría | Precisión táctica, inmersión técnica, control absoluto |
| 21 | Tech / SaaS Modern | La interfaz debe ser invisible; el foco absoluto está en los datos y la conversión | Confianza institucional, claridad cognitiva, eficiencia |

---

**18 Cyberpunk**

*El neón que corta la niebla — Interfaces agresivas de una distopía hiperconectada*

| Familia | Estilos Futuristas / Tecnológicos |
| :---- | :---- |
| **Índice** | 01 / 07 |
| **Filosofía** | El futuro no es limpio. El cyberpunk es la estética de la tecnología avanzada (cibernética, IA, megacorporaciones) superpuesta sobre la decadencia urbana. La interfaz es intrusiva, brillante y ocasionalmente inestable. |
| **Referentes** | Cyberpunk 2077 (UI design), Blade Runner, Ghost in the Shell, The Matrix, Akira, interfaces de terminales underground. |
| **Emoción** | Adrenalina, urgencia tecnológica, saturación de información, actitud subversiva. |
| **Sectores** | Videojuegos de acción, portafolios de desarrolladores low-level, marcas de hardware extremo, interfaces de robótica experimental, eventos de ciberseguridad. |

## **1\. Filosofía Visual del Cyberpunk**

El diseño Cyberpunk rechaza la limpieza del minimalismo moderno. Exige que la interfaz se sienta como un sistema operativo hackeado o una terminal de una megacorporación. Utiliza el contraste al límite absoluto, abusando de la luz emisiva (neón) contra fondos que simulan el asfalto mojado o el vacío digital.

### **1.1 Elementos estructurales**

* **Geometría Agresiva:** Ángulos cortados (chamfered corners), bloques rectangulares duros, asimetría intencional. Nada es suave o redondeado.  
* **Glitch Estético:** La tecnología falla. La aberración cromática, los cortes de línea y los artefactos visuales comunican que el sistema está siendo forzado.  
* **Densidad de Datos:** Interfaces cargadas de números aleatorios, códigos de barras, identificadores alfanuméricos y gráficos de líneas que simulan procesamiento en tiempo real.

## **2\. Paleta de Color Cyberpunk**

| Categoría | Valores hex | Rol en la composición |
| :---- | :---- | :---- |
| Fondo Abisal | \#020204, \#05050A | El vacío de la red. Negros con una fracción imperceptible de azul o violeta. |
| Amarillo Corporativo | \#FCEE0A, \#FFCC00 | Alertas, botones primarios. Un amarillo ácido y agresivo. |
| Cian Neón | \#00F0FF, \#08E8DE | El color principal de lectura e interacción. Simula los hologramas. |
| Magenta / Rosa Láser | \#FF003C, \#D80073 | Acentos secundarios, botones de destrucción o advertencia, aberración cromática. |
| Verde Fósforo | \#39FF14 | Referencia a los monitores CRT antiguos. Uso en terminales integradas. |
| Gris Plomo | \#121212, \#242424 | Superficies de hardware, paneles modales y contenedores de datos. |

## **3\. Tipografía Cyberpunk**

* **Display / Títulos:** Fuentes sans-serif geométricas, extendidas y pesadas. (Ej: *Orbitron, Rajdhani, Michroma, Syncopate*). Las mayúsculas son obligatorias para los títulos.  
* **Datos y Código:** Monospace estricto para simular terminales. (Ej: *Share Tech Mono, JetBrains Mono, VT323*).  
* **Cuerpo de Texto:** Sans-serif cuadradas y legibles pero de aspecto técnico. (Ej: *Chakra Petch, Roboto Mono*).

## **4\. Implementación Arquitectónica (Sin Código)**

Para construir este sistema utilizando CSS puro, se deben emplear las siguientes técnicas documentadas:

* **Bordes Cortados (Chamfered):** Se logra utilizando la propiedad clip-path: polygon(...). Por ejemplo, para cortar la esquina superior derecha y la inferior izquierda, se define un polígono que esquive esas coordenadas exactas.  
* **Efecto Neón:** Requiere el uso apilado de la propiedad box-shadow y text-shadow. Se deben declarar al menos tres capas: un resplandor interno brillante, un desenfoque medio del color base, y un desenfoque amplio con menor opacidad para simular la dispersión de la luz en el ambiente.  
* **Aberración Cromática (Glitch):** Se simula duplicando texto o usando pseudoelementos (::before, ::after) desplazados 1px o 2px a la izquierda con color cian, y a la derecha con color magenta, aplicando opacidades de mezcla (mix-blend-mode: screen).

## **5\. Animaciones Cyberpunk**

| Animación | Duración | Descripción técnica |
| :---- | :---- | :---- |
| Parpadeo de Neón (Flicker) | Loop irregular | Opacidad y resplandor que caen a 0.5 y regresan a 1 de forma abrupta (steps). |
| Glitch de Bloque | 200ms aleatorio | clip-path que oculta franjas horizontales del componente rápidamente. |
| Marquesina de Datos | Scroll continuo | Cadenas de texto hexadecimal moviéndose de derecha a izquierda en los bordes. |

## **6\. Anti-patrones del Cyberpunk**

* **NUNCA** utilizar sombras caídas (drop shadows) negras. En un mundo de luz emisiva, las sombras son resplandores de color (glows).  
* **NUNCA** usar bordes redondeados (border-radius mayor a 2px). El cyberpunk es industrial y afilado; las curvas rompen la estética.  
* **NUNCA** aplicar fondos blancos. Si se necesita un tema claro, se debe utilizar la variante "Mirror's Edge" (blanco clínico, rojo brillante y negro mate), pero el cyberpunk tradicional exige oscuridad profunda.

---

**19 Sci-Fi / Space UI**

*Telemetría y control — Interfaces de supervivencia para el vacío espacial*

| Familia | Estilos Futuristas / Tecnológicos |
| :---- | :---- |
| **Índice** | 02 / 07 |
| **Filosofía** | La interfaz es una herramienta de supervivencia militar o exploratoria. La estética nace de la necesidad de mostrar telemetría compleja (vectores, temperatura, integridad estructural) de un vistazo, sin fatigar la vista en entornos de baja luz. |
| **Referentes** | Interfaces de naves espaciales en películas, juegos de acción de naves y simuladores de vuelo, Star Citizen, Elite Dangerous, UI de la NASA/SpaceX. |
| **Emoción** | Foco táctico, precisión matemática, inmersión de pilotaje, escala cósmica. |
| **Sectores** | Juegos de simulación y acción espacial, interfaces para maquinaria pesada, robótica médica avanzada, dashboards de monitoreo físico. |

## **1\. Filosofía Visual del Space UI**

A diferencia del Cyberpunk, el Space UI (o FUI \- Fictional User Interface) no busca ser rebelde ni estar roto. Su objetivo es la legibilidad de datos hiper-complejos bajo presión. Se basa fuertemente en la iconografía instrumental: retículas (crosshairs), indicadores de grados, radares polares y barras de integridad.

### **1.1 Elementos estructurales**

* **Retículas y Guías:** Líneas finas (1px) que cruzan la pantalla, marcas de calibración y escalas de medición en los bordes de los contenedores.  
* **Modularidad Estricta:** La pantalla se divide en paneles de instrumentación claramente separados, simulando las pantallas MFD (Multi-Function Displays) de las cabinas de naves.  
* **Micro-tipografía:** Abundancia de textos diminutos que indican estados numéricos exactos (coordenadas espaciales, ángulos de inclinación).

## **2\. Paleta de Color Space UI**

| Categoría | Valores hex | Rol en la composición |
| :---- | :---- | :---- |
| Azul HUD Base | \#4A90E2, \#00A8FF | El color principal de la telemetría. Frío, claro y no cansa la vista en la oscuridad. |
| Ámbar Táctico | \#FF9F00, \#FF6600 | Utilizado para advertencias de colisión, sistemas de armas o calor. (Referencia a CRT ámbar). |
| Cristal Oscuro | \#0A1118, rgba(0, 20, 40, 0.6) | Fondos de los paneles modulares. Generalmente translúcidos para ver el "espacio" de fondo. |
| Verde Radar | \#00FF66 | Datos aliados, escáneres topográficos, confirmaciones de integridad. |
| Rojo Crítico | \#FF0000 | Falla catastrófica de escudos o brechas de casco. Uso extremadamente limitado. |

## **3\. Tipografía Sci-Fi**

* **Principal de Datos:** Sans-serif altamente condensadas y legibles a tamaños muy pequeños. (Ej: *DIN Alternate, Teko, Rajdhani, Univers*).  
* **Lecturas de Telemetría:** Monospace estricta, ideal para que los números cambien rápidamente sin que el texto salte. (Ej: *Space Mono, Fira Code*).  
* **Casing Técnico:** Se utilizan habitualmente MAYÚSCULAS para títulos de módulos y *minúsculas* para identificadores de variables de sistema (ej. velocidad\_vectorial, indiceMotor).

## **4\. Componentes y Arquitectura CSS Teórica**

* **Glassmorphism Técnico:** Paneles con backdrop-filter: blur(4px) combinados con fondos de baja opacidad y bordes sólidos de 1px del color del HUD principal para delimitar el cristal.  
* **Crosshairs y Esquinas:** Se diseñan utilizando fondos SVG en línea o combinaciones complejas de bordes direccionales (border-top, border-left) en elementos absolutamente posicionados en las esquinas de los contenedores.  
* **Barras de Progreso Segmentadas:** Barras de energía o escudos construidas mediante fondos con repeating-linear-gradient para simular bloques individuales de carga.

## **5\. Animaciones Sci-Fi**

| Animación | Duración | Descripción técnica |
| :---- | :---- | :---- |
| Boot Sequence | 1000ms \- 2500ms | Aparición secuencial de los paneles, simulando el encendido del motor de la interfaz. |
| Scanning Line | Bucle lento | Una línea semitransparente brillante que recorre de arriba a abajo o rota en círculo simulando un radar. |
| Data Update | Continua | Números que cambian a 60fps usando fuentes tabulares para mantener el ancho exacto del componente numérico. |

## **6\. Anti-patrones del Space UI**

* **NUNCA** usar colores sólidos opacos puros en componentes grandes que bloqueen la vista; las interfaces tácticas asumen que el usuario necesita ver a través del panel (cockpit view).  
* **NUNCA** incluir animaciones elásticas o rebotes (bounce, ease-in-out exagerado). Las máquinas de precisión se mueven de forma lineal, rápida y matemática (linear o ease-out duro).  
* **NUNCA** usar fuentes Serif. La tecnología aeroespacial prioriza la lectura rápida y las serifas añaden ruido óptico innecesario en pantallas de alta densidad de datos.

---

**21 Tech / SaaS Modern**

*La arquitectura de la eficiencia — Claridad clínica para el software de escala*

| Familia | Estilos Futuristas / Tecnológicos |
| :---- | :---- |
| **Índice** | 03 / 07 |
| **Filosofía** | El diseño desaparece para que la tarea brille. Es el estándar de la industria del software corporativo, plataformas en la nube y sector salud. La estética comunica estabilidad institucional, seguridad de datos y flujos de trabajo eficientes sin fricción cognitiva. |
| **Referentes** | Stripe, Vercel, Tailwind UI, Microsoft Azure, plataformas hospitalarias y de historiales médicos (EHR), GitHub, Linear. |
| **Emoción** | Confianza profesional, calma operativa, eficiencia milimétrica, alta accesibilidad. |
| **Sectores** | Herramientas B2B, sector salud y telemedicina, plataformas de infraestructura DevOps, dashboards financieros, software empresarial complejo. |

## **1\. Filosofía Visual del Tech / SaaS**

A diferencia de las interfaces de ficción o distópicas, el software moderno como servicio (SaaS) lidia con la productividad real. Un usuario interactuará con estas pantallas durante horas continuas. La jerarquía visual debe ser absoluta: qué es información, qué es una acción primaria y qué es contexto secundario.

### **1.1 Elementos estructurales**

* **Uso Quirúrgico del Espacio en Blanco (Whitespace):** Agrupación lógica de elementos mediante el vacío en lugar de múltiples líneas divisorias.  
* **Elevación Semántica:** Sombras difusas y extremadamente suaves para indicar niveles de interacción (modales, dropdowns, tarjetas flotantes).  
* **Micro-feedback:** Reacciones visuales inmediatas a cada interacción del usuario (hovers de botones, estados de carga de tablas).

## **2\. Paleta de Color SaaS Modern**

| Categoría | Valores hex | Rol en la composición |
| :---- | :---- | :---- |
| Fondo de Aplicación | \#F8FAFC (Light) / \#0F172A (Dark) | Fondos neutros y fríos que reducen la fatiga visual. |
| Superficie Contenedora | \#FFFFFF (Light) / \#1E293B (Dark) | El color de las tarjetas, formularios y tablas de datos. |
| Acento de Marca | \#4F46E5 (Indigo), \#2563EB (Azul) | Colores de alta confianza para botones primarios, barras de progreso y enlaces. |
| Estado: Éxito | \#10B981 | Confirmación de guardado, despliegues exitosos, signos vitales estables. |
| Estado: Error | \#EF4444 | Borrados destructivos, errores de compilación, alertas de validación. |
| Grises Tipográficos | \#0F172A (Primario), \#64748B (Secundario) | Jerarquía de texto estricta basada en el contraste WCAG. |

## **3\. Tipografía Tech / SaaS**

* **Sistemas Nativos:** Se priorizan las fuentes del sistema operativo (San Francisco, Segoe UI) para maximizar el rendimiento y familiaridad.  
* **Neo-Grotescas Modernas:** Si se usa tipografía web, se buscan fuentes altamente optimizadas para interfaces de datos. (Ej: *Inter, Roboto, Geist, SF Pro*).  
* **Tabular Figures:** Se utilizan propiedades CSS (font-variant-numeric: tabular-nums) para asegurar que los números en tablas financieras o gráficas de salud se alineen perfectamente en columnas.

## **4\. Componentes y Arquitectura de Datos**

* **Sistemas de Grillas de Datos (Data Grids):** Tablas con headers fijos, filas con zebra-striping muy sutil, y celdas con densidades ajustables para visualizar grandes volúmenes de datos.  
* **Bordes Intermedios:** Uso exhaustivo de variables de borde muy suaves (ej. rgba(0,0,0, 0.05)) para estructurar formularios complejos sin sobrecargar visualmente el formulario.  
* **Indicadores de Estado (Badges/Pills):** Pequeños bloques con fondo de opacidad baja (10-15%) y texto en color completo para indicar estados (Activo, Pendiente, Desplegando, Critico) con alta legibilidad.

## **5\. Animaciones SaaS**

| Animación | Duración | Descripción técnica |
| :---- | :---- | :---- |
| Micro-interacciones | 150ms | Transiciones de color en botones e inputs (ease-out). Rápidas, funcionales y sin demoras. |
| Skeleton Loaders | Bucle infinito | Un gradiente sutil que se desliza sobre rectángulos grises para mitigar la ansiedad de espera al cargar datos externos. |
| Entradas Modales | 200ms | Animación de escala ligera (0.95 a 1\) combinada con opacidad (0 a 1\) para centrar la atención en flujos de decisión críticos. |

## **6\. Anti-patrones del SaaS Moderno**

* **NUNCA** ocultar acciones principales detrás de menús contextuales en vistas de uso intensivo. La eficiencia requiere clics mínimos.  
* **NUNCA** depender exclusivamente del color para comunicar estado. En plataformas médicas o de ingeniería, un error crítico debe tener un ícono y texto explícito, no solo estar pintado de rojo.  
* **NUNCA** utilizar tipografías delgadas (font-weight: 100 o 200). La legibilidad en monitores de diversa calidad requiere trazos sólidos, especialmente en interfaces ricas en datos numéricos.

---

*Nota: La documentación de los estilos restantes de esta familia (Glitch Art, AI / Generative Aesthetic, Holographic, Matrix / Terminal) está disponible bajo la misma estructura y profundidad si se requiere continuar con el desarrollo del documento.*