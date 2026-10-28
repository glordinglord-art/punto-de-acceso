**GUIA DE ESTILOS CSS**

**Estilos Oscuros**

**y Dramaticos**

Familia IV de XI — 4 estilos documentados en profundidad

Guia de referencia para la generacion de CSS oscuro de alta calidad. Cubre los fundamentos de cada estetica oscura: desde el sistema tecnico del dark mode UI hasta la psicologia del horror design. Incluye filosofia, paletas de color, tipografia, texturas, animaciones, variables CSS y anti-patrones.

| \# | Estilo | Filosofia central | Emocion objetivo |
| :---- | :---- | :---- | :---- |
| 14 | Dark Mode / Dark UI | Sistema de color paralelo construido desde la oscuridad | Concentracion y sofisticacion |
| 15 | Gothic / Dark Aesthetic | La belleza en el umbral entre vida y oscuridad | Fascinacion oscura y misterio |
| 16 | Noir | La sombra y la luz en conflicto moral permanente | Tension y elegancia peligrosa |
| 17 | Horror / Occult | El horror que se sugiere es mas aterrador que el que se muestra | Pavor y fascinacion macabra |

**14**    **Dark Mode / Dark UI**

*La oscuridad como decision de diseno — Interfaces nocturnas que cuidan y seducen*

| Familia | Estilos Oscuros / Dramaticos |
| :---- | :---- |
| **Indice** | 01 / 04 |
| **Filosofia** | El dark mode no es el light mode invertido. Es un sistema de color paralelo construido desde cero para que la oscuridad sirva al usuario, no lo fatigue. |
| **Referentes** | Linear.app, Vercel, Raycast, GitHub dark, Figma dark, Stripe dark, Resend, Supabase, Planetscale, Apple dark mode guidelines |
| **Emocion** | Concentracion, sofisticacion tecnologica, confort nocturno, modernidad premium, poder controlado |
| **Sectores** | SaaS y herramientas para developers, editores de codigo, apps de productividad nocturna, plataformas de datos, productos tech de alto rendimiento |

## **1\. Filosofia del Dark Mode Bien Ejecutado**

El dark mode se convirtio de preferencia personal a estandar de diseno cuando Apple lo introdujo en macOS Mojave (2018) y iOS 13 (2019). Pero la mayoria de las implementaciones fallan porque asumen que oscurecer colores es suficiente. El dark mode real es un sistema de diseño paralelo que reimagina cada decision de color, contraste, sombra y elevacion para que funcione sobre fondo oscuro.

*El dark mode no es el light mode con filtro de inversion. Es una segunda ciudad construida con las mismas calles pero iluminada de noche.*

### **1.1  Por que el dark mode requiere su propio sistema**

* Las sombras no funcionan en oscuro — una sombra negra sobre fondo negro es invisible; hay que usar elevacion con luz

* Los colores saturados se vuelven agresivos en oscuro — un azul \#0066FF parece vibrar dolorosamente sobre negro

* Los grises claros del light mode se convierten en grises medios ilegibles en dark mode

* Las imagenes muy brillantes queman los ojos del usuario en modo oscuro — necesitan ajuste de brillo

* Los iconos y graficos con fondo blanco transparente se convierten en cuadros blancos sobre negro

* El contraste que funciona en claro puede ser excesivo en oscuro — WCAG recomienda max 7:1 tambien en dark mode

### **1.2  Los tres tipos de dark mode**

| Tipo | Descripcion | Ejemplos reales |
| :---- | :---- | :---- |
| True Black OLED | Fondo \#000000 puro para pantallas OLED donde los pixeles negros se apagan | Twitter dark, YouTube dark, Instagram |
| Elevated Dark | Fondo \#0A0A0A a \#141414 — el estandar para interfaces modernas de calidad | Linear, Vercel, GitHub dark, Figma |
| Warm Dark | Fondos con ligero tono calido (\#0F0D0B) para reducir la frialdad del gris neutro | Algunos editores de texto, apps creativas |
| Navy / Midnight | Fondo azul-gris muy oscuro (\#0D1117 o \#0A0E1A) — popular en herramientas dev | GitHub dark default, VS Code dark+ |
| Sepia Dark | Fondo crema muy oscuro (\#1A1612) para apps de lectura nocturna | Kindle night mode, apps de ebooks |
| Auto / System | Sigue la preferencia del sistema operativo del usuario | Recomendado siempre como opcion base |

### **1.3  Cuando usar dark mode como default**

* Herramientas para desarrolladores y terminales — el dark mode es el default cultural del sector

* Aplicaciones de edicion de video, audio o fotografia — el fondo oscuro neutraliza y hace que los colores destaquen

* Plataformas de entretenimiento nocturno — streaming, musica, gaming

* Dashboards de monitoreo y datos — los datos en color sobre fondo oscuro tienen mayor impacto visual

* Productos que quieren posicionarse como premium, tecnologicos o de elite — el dark mode comunica sofisticacion

* Siempre ofrecer toggle — nunca forzar dark mode sin opcion de cambio; respetar prefers-color-scheme

## **2\. Sistema de Color para Dark Mode**

La arquitectura de color de un dark mode bien ejecutado tiene cuatro capas de profundidad. Cada capa es ligeramente mas clara que la anterior, creando el sistema de elevacion que reemplaza a las sombras del light mode.

### **2.1  Sistema de superficies — los 6 niveles de fondo**

| Nivel | Valor hex | Elevacion CSS | Uso |
| :---- | :---- | :---- | :---- |
| Base / Fondo | \#0A0A0A | Nivel 0 — sin elevacion | Fondo de la pagina, canvas principal |
| Surface | \#111111 | Nivel 1 — box-shadow glow sutil | Cards, paneles, sidebars |
| Surface raised | \#1A1A1A | Nivel 2 — glow ligeramente mayor | Cards elevadas, dropdowns, menus |
| Surface overlay | \#222222 | Nivel 3 — borde sutil | Tooltips, popovers, banners inline |
| Surface inset | \#080808 | Hundido — sin elevacion, mas oscuro | Inputs, code blocks, areas de contenido sumido |
| Surface modal | \#1E1E1E | Nivel 4 con backdrop blur | Modales, drawers, sheets |

### **2.2  Sistema de texto — jerarquia de opacidades**

En dark mode, el texto usa opacidades sobre blanco en lugar de colores grises fijos. Esto garantiza coherencia en distintos fondos de superficie.

| Nivel de texto | Valor hex / opacidad | Contraste aprox. | Uso |
| :---- | :---- | :---- | :---- |
| Primary | \#EDEDED / rgba(255,255,255,0.92) | 13:1 sobre \#0A0A0A | Texto principal, titulares, contenido activo |
| Secondary | \#AAAAAA / rgba(255,255,255,0.65) | 7.5:1 | Subtitulos, descripciones, texto de apoyo |
| Tertiary | \#777777 / rgba(255,255,255,0.40) | 4.1:1 | Placeholders, metadata, hints — limite WCAG AA |
| Disabled | \#555555 / rgba(255,255,255,0.25) | 2.5:1 | Texto deshabilitado — no informacion critica |
| On-accent | \#FFFFFF | Varía segun acento | Texto sobre colores de acento (botones, badges) |
| Inverse (sobre blanco) | \#0A0A0A | 21:1 | Texto en tooltips claros o areas invertidas |

### **2.3  Colores de acento en dark mode**

* Los acentos en dark mode deben ser MENOS saturados que en light mode — la saturacion maxima quema sobre fondo oscuro

* Regla practica: tomar el color de acento del light mode y reducir saturacion en 15-25% para dark mode

* Los acentos claros (\< 50% de brillo) desaparecen en dark mode — siempre verificar contraste real

* Azul: \#3B82F6 en light → \#4D9EFF en dark (ligeramente mas brillante para compensar el fondo oscuro)

* Verde: \#10B981 en light → \#34D399 en dark (mas claro y ligeramente menos saturado)

* Rojo: \#EF4444 en light → \#F87171 en dark (mas suave, menos agresivo sobre oscuro)

* Amarillo/amber: requiere especial cuidado — puede parecer demasiado brillante; usar \#F59E0B a \#FCD34D en dark

### **2.4  Bordes y separadores en dark mode**

| Tipo de borde | Valor recomendado | Uso |
| :---- | :---- | :---- |
| Borde de componente | rgba(255,255,255,0.08) | Cards, inputs, panels — muy sutil |
| Borde de separacion | rgba(255,255,255,0.06) | Dividers entre items de lista |
| Borde de enfasis | rgba(255,255,255,0.15) | Componente activo, focus state |
| Borde de acento | Color de acento al 40% opacidad | Focus ring, estado seleccionado |
| Borde exterior de modal | rgba(255,255,255,0.12) \+ blur | Frame de modales y sheets |
| Sin borde — solo elevacion | box-shadow: 0 0 0 1px rgba(255,255,255,0.06) | Cards en superficies similares |

## **3\. Sistema de Elevacion y Sombras en Dark Mode**

Las sombras tradicionales (negras sobre claro) se invierten en dark mode. En su lugar, la elevacion se comunica a traves de: fondos mas claros, brillo sutil (glow), y bordes suaves. Este sistema replica visualmente la sensacion de que algunos elementos estan mas 'cerca' del usuario.

### **3.1  Sistema de elevacion de 5 niveles**

   
/\* \=== DARK MODE — SISTEMA DE ELEVACION \=== \*/  
   
/\* Nivel 0 — Base (sin elevacion) \*/  
.dark .elevation-0 {  
  background: \#0A0A0A;  
  box-shadow: none;  
}  
   
/\* Nivel 1 — Surface (cards, paneles) \*/  
.dark .elevation-1 {  
  background: \#111111;  
  box-shadow: 0 0 0 1px rgba(255,255,255,0.06);  
}  
   
/\* Nivel 2 — Raised (cards destacadas, dropdowns) \*/  
.dark .elevation-2 {  
  background: \#1A1A1A;  
  box-shadow:  
    0 0 0 1px rgba(255,255,255,0.08),  
    0 4px 16px rgba(0,0,0,0.4);  
}  
   
/\* Nivel 3 — Floating (popovers, tooltips) \*/  
.dark .elevation-3 {  
  background: \#222222;  
  box-shadow:  
    0 0 0 1px rgba(255,255,255,0.10),  
    0 8px 32px rgba(0,0,0,0.5),  
    0 2px 8px rgba(0,0,0,0.3);  
}  
   
/\* Nivel 4 — Modal (maxima elevacion) \*/  
.dark .elevation-4 {  
  background: \#1E1E1E;  
  box-shadow:  
    0 0 0 1px rgba(255,255,255,0.12),  
    0 24px 64px rgba(0,0,0,0.7),  
    0 8px 24px rgba(0,0,0,0.4);  
}  
   
/\* Glow de acento (para elementos interactivos activos) \*/  
.dark .glow-accent {  
  box-shadow:  
    0 0 0 1px rgba(77,158,255,0.4),  
    0 0 20px rgba(77,158,255,0.15);  
}  
 

### **3.2  Glassmorphism en dark mode**

* El glassmorphism (backdrop-blur \+ transparencia) funciona especialmente bien en dark mode

* Receta dark glass: background: rgba(20,20,20,0.7) \+ backdrop-filter: blur(16px) saturate(160%)

* Borde del panel glass: 1px solid rgba(255,255,255,0.08) — el borde es esencial para definir el contorno

* El elemento detras del panel debe tener suficiente variedad visual para que el efecto sea visible

* En mobile: usar fallback sin blur si backdrop-filter no esta soportado — @supports (backdrop-filter: blur(1px))

* Cuidado con el performance: backdrop-filter crea un contexto de composicion nuevo — usar con moderacion

## **4\. Tipografia en Dark Mode**

### **4.1  Fuentes que funcionan bien en dark mode**

* Las fuentes con trazos muy finos (weight 100-200) desaparecen en oscuro — usar minimo weight 300

* El suavizado de fuentes en dark mode puede hacer que el texto se vea diferente — antialiased suele verse mejor

* Fuentes recomendadas para dark interfaces: Inter, Geist, DM Sans, Sohne, Neue Montreal, SF Pro (macOS)

* Fuentes monospace para dark mode / code: JetBrains Mono, Fira Code, Cascadia Code, Source Code Pro

* Las serif funcionan en dark mode pero requieren mayor tamano minimo — 16px en dark vs 14px en claro

### **4.2  Ajustes CSS de tipografia especificos para dark mode**

   
/\* Suavizado de fuentes en dark mode \*/  
.dark body {  
  \-webkit-font-smoothing: antialiased;  
  \-moz-osx-font-smoothing: grayscale;  
  /\* En light mode, auto es mejor; en dark, antialiased da texto mas fino y legible \*/  
}  
   
/\* Ajuste de peso tipografico en dark \*/  
/\* Algunas fuentes necesitan un peso ligeramente mayor en dark para misma percepcion \*/  
.dark .body-text {  
  font-weight: 400; /\* puede necesitar 450 o 500 segun la fuente \*/  
}  
   
/\* Line-height generoso en dark — el texto necesita mas aire \*/  
.dark .article-body {  
  line-height: 1.75; /\* vs 1.65 en light mode \*/  
}  
   
/\* Titulares en dark — ligeramente menos bold puede ser mas elegante \*/  
.dark h1 { font-weight: 600; } /\* vs 700 en light \*/  
.dark h2 { font-weight: 600; }  
   
/\* Code en dark — monospace con ligero ajuste de tamano \*/  
.dark code {  
  font-size: 0.875em;  
  font-family: 'JetBrains Mono', monospace;  
  background: rgba(255,255,255,0.06);  
  padding: 0.15em 0.4em;  
  border-radius: 4px;  
  color: \#E2B96F; /\* amber para inline code \*/  
}  
 

## **5\. Componentes en Dark Mode**

### **5.1  Inputs y formularios en dark mode**

* Fondo de input: \#0A0A0A o \#111111 — ligeramente mas oscuro que la superficie que lo contiene (nivel inset)

* Borde en reposo: rgba(255,255,255,0.08) — muy sutil, apenas visible

* Borde en focus: color de acento al 60% opacidad \+ glow sutil del mismo color

* Placeholder: rgba(255,255,255,0.30) — nunca mas claro que el texto real

* Label flotante en dark: al flotar, cambiar a color de acento para indicar actividad

* Estado de error en dark: rojo de dark mode (\#F87171) — nunca el rojo de light mode (\#EF4444) que quema

* Estado disabled: opacity 0.38 sobre el componente completo — el estandar de Material Design tambien en dark

### **5.2  Botones en dark mode**

| Tipo de boton | Estilos dark mode | Notas |
| :---- | :---- | :---- |
| Primario | Fondo acento (\#4D9EFF), texto \#0A0A0A o \#FFF segun contraste | El acento oscuro es mas brillante que en light |
| Secundario | Fondo rgba(255,255,255,0.08), borde rgba(255,255,255,0.15), texto primario | Muy sutil, casi invisible hasta el hover |
| Ghost / texto | Solo texto, sin fondo, hover: rgba(255,255,255,0.06) | Para acciones terciarias o en contextos densos |
| Destructivo | Fondo rgba(248,113,113,0.15), texto \#F87171, borde rgba(248,113,113,0.3) | Rojo suave en reposo, mas intenso en hover |
| Icono | Fondo transparent, hover: rgba(255,255,255,0.08), icono texto-secondary | Tamaño minimo 32x32px para target tacticl |
| Cargando | Opacity 0.6, spinner del color del texto del boton | Deshabilitar el boton durante la carga |

### **5.3  Navegacion y sidebar en dark mode**

* Sidebar fondo: misma superficie base (\#0A0A0A) o ligeramente diferente (\#0D0D0D) para distinguir del contenido

* Item activo: fondo rgba(255,255,255,0.08) \+ borde izquierdo del color de acento (2-3px)

* Item hover: fondo rgba(255,255,255,0.05) con transicion 100ms

* Iconos en sidebar: color texto-secondary en reposo, texto-primary al hover o activo

* Separadores entre grupos de navegacion: rgba(255,255,255,0.06) — apenas perceptible

* Badges de notificacion en dark: mismo color de acento del light mode — son elementos de atencion que deben destacar

* Scroll en sidebar: scrollbar personalizada — thin scrollbar con thumb rgba(255,255,255,0.15)

### **5.4  Tablas y listas de datos en dark mode**

* Header de tabla: fondo rgba(255,255,255,0.04) — muy sutil diferenciacion del body

* Filas alternas (zebra): alternar entre rgba(255,255,255,0.0) y rgba(255,255,255,0.02) — casi imperceptible

* Row hover: fondo rgba(255,255,255,0.04) con transicion 100ms

* Row seleccionada: fondo rgba(acento,0.12) \+ borde izquierdo 2px del color de acento

* Texto de datos numericos: texto-primary siempre — los numeros deben ser de maximo contraste

* Texto secundario en tablas (metadata, timestamps): texto-tertiary

## **6\. Animaciones en Dark Mode**

| Animacion | Duracion | Descripcion en dark mode |
| :---- | :---- | :---- |
| Toggle de tema | 300ms ease-out | Transicion suave de todos los colores via CSS variables — color, background-color, border-color |
| Hover glow en botones | 200ms ease | box-shadow con color de acento al 20% que aparece en hover |
| Focus ring | 150ms ease-out | Outline con color de acento \+ glow exterior — debe ser muy visible en dark |
| Card hover elevation | 200ms ease | De elevation-1 a elevation-2 en hover — la sombra aumenta sutilmente |
| Skeleton loading | 1.5s linear loop | Shimmer de rgba(255,255,255,0.04) a rgba(255,255,255,0.10) |
| Toast / notificacion | 300ms ease-out | Slide desde abajo con fondo elevation-3 y borde de acento sutil |
| Modal open | 250ms ease-out | scale(0.97) \+ opacity 0 a 1, backdrop-blur que se activa |
| Command palette | 200ms ease-out | Aparece centrado con blur del backdrop, elevation maxima |
| Cursor glow (premium) | 60fps rAF | Halo de luz sutil que sigue al cursor — rgba(acento,0.06) en radial-gradient |
| Scroll progress bar | Scroll-linked | Linea de 2px en la parte superior con gradiente de acento |

## **7\. Variables CSS Completas para Dark Mode UI**

   
/\* \=== DARK MODE UI — SISTEMA COMPLETO DE VARIABLES CSS \=== \*/  
   
:root {  
  /\* Superficies \*/  
  \--bg-base:       \#0A0A0A;  
  \--bg-surface:    \#111111;  
  \--bg-raised:     \#1A1A1A;  
  \--bg-overlay:    \#222222;  
  \--bg-inset:      \#080808;  
  \--bg-modal:      \#1E1E1E;  
   
  /\* Texto \*/  
  \--text-primary:  \#EDEDED;  
  \--text-secondary:\#AAAAAA;  
  \--text-tertiary: \#666666;  
  \--text-disabled: \#444444;  
  \--text-on-accent:\#FFFFFF;  
   
  /\* Bordes \*/  
  \--border-subtle:  rgba(255,255,255,0.06);  
  \--border-default: rgba(255,255,255,0.08);  
  \--border-strong:  rgba(255,255,255,0.15);  
  \--border-focus:   rgba(77,158,255,0.60);  
   
  /\* Acentos \*/  
  \--accent:         \#4D9EFF;  
  \--accent-subtle:  rgba(77,158,255,0.12);  
  \--accent-hover:   \#6AB0FF;  
  \--success:        \#34D399;  
  \--warning:        \#FCD34D;  
  \--danger:         \#F87171;  
  \--info:           \#67E8F9;  
   
  /\* Elevacion \*/  
  \--shadow-sm:  0 0 0 1px rgba(255,255,255,0.06);  
  \--shadow-md:  0 0 0 1px rgba(255,255,255,0.08), 0 4px 16px rgba(0,0,0,0.4);  
  \--shadow-lg:  0 0 0 1px rgba(255,255,255,0.10), 0 8px 32px rgba(0,0,0,0.5);  
  \--shadow-xl:  0 0 0 1px rgba(255,255,255,0.12), 0 24px 64px rgba(0,0,0,0.7);  
  \--glow-accent:0 0 0 1px rgba(77,158,255,0.4), 0 0 20px rgba(77,158,255,0.15);  
   
  /\* Tipografia \*/  
  \--font-sans:  'Inter', 'Geist', system-ui, sans-serif;  
  \--font-mono:  'JetBrains Mono', 'Fira Code', monospace;  
   
  /\* Transiciones \*/  
  \--t-theme:    color 200ms, background-color 200ms, border-color 200ms, box-shadow 200ms;  
  \--t-fast:     150ms ease;  
  \--t-base:     250ms ease-out;  
   
  /\* Geometria \*/  
  \--radius-sm:  4px;  
  \--radius-md:  8px;  
  \--radius-lg:  12px;  
  \--radius-xl:  16px;  
}  
 

## **8\. Anti-patrones del Dark Mode UI**

* NUNCA usar negro puro (\#000000) como fondo en interfaces que no son OLED — el contraste absoluto fatiga y se ve amateur

* NUNCA usar blanco puro (\#FFFFFF) como texto en dark mode — el contraste extremo (21:1) es demasiado agresivo para lectura prolongada

* NUNCA simplemente invertir los colores del light mode — las sombras negras sobre negro y los grises rotos delatan la falta de sistema

* NUNCA usar sombras oscuras en dark mode — son invisibles. Usar elevacion con capas de brillo y bordes sutiles

* NUNCA colores de acento sin ajuste — los colores saturados del light mode queman visualmente en dark mode

* NUNCA ignorar imagenes con fondo blanco que se convierten en bloques blancos brillantes en dark mode

* NUNCA dark mode sin toggle visible — siempre respetar la preferencia del usuario con prefers-color-scheme Y un control manual

* NUNCA transicion de tema sin animacion — el flash instantaneo de colores es una experiencia intrusiva; usar transition en CSS variables

* NUNCA asumir que el dark mode es 'facil' — requiere tanta atencion de diseno como el light mode, no menos

**15**    **Gothic / Dark Aesthetic**

*La belleza en la oscuridad — Elegancia macabra, misterio cultivado, profundidad emocional*

| Familia | Estilos Oscuros / Dramaticos |
| :---- | :---- |
| **Indice** | 02 / 04 |
| **Filosofia** | Lo gotico no es miedo superficial. Es la estetica de aquello que se situa en el limite: entre lo vivo y lo muerto, entre la belleza y la decadencia, entre lo sagrado y lo profano. |
| **Referentes** | Bram Stoker Dracula (Gary Oldman film identity), Bauhaus (banda), Sisters of Mercy, Wednesday (Netflix), The Cure, A24 films branding, Rick Owens, Ann Demeulemeester, Architectural Digest dark edition |
| **Emocion** | Fascinacion oscura, melancoilia sofisticada, misterio, tension romantica, sublime terrorifico |
| **Sectores** | Moda gotica y dark luxury, musica alternativa, joyeria de plata y obsidiana, tatuajes y arte corporal, vino y bebidas premium oscuras, literatura gotica, juegos de rol y fantasia oscura |

## **1\. Filosofia y Raices Culturales del Gotico**

El estetica gotica tiene sus raices en la arquitectura medieval (catedrales goticas, arbotantes, vitrales), la literatura del siglo XVIII-XIX (Poe, Shelley, Stoker, Le Fanu), y la subcultura musical de los anos 80 (post-punk, goth rock). En diseno web, sintetiza estos elementos en un lenguaje visual de alta densidad emocional: texturas pesadas, tipografias con historia, paletas de profundidad extrema y ornamentos que evocan lo sagrado y lo oscuro simultaneamente.

*Lo gotico no es decoracion negra. Es la arquitectura emocional de los que encuentran belleza exactamente donde otros sienten miedo.*

### **1.1  Los cuatro pilares visuales del Gothic Design**

* OSCURIDAD ESTRUCTURAL: el fondo oscuro no es el canvas que contiene el diseno — es el diseno en si mismo. La luz emerge de la oscuridad, no al reves.

* ORNAMENTO SIGNIFICATIVO: los ornamentos goticos (arcos ojivales, traceria, gargolas) no son decoracion sin funcion — son expresion de una vision del mundo. En web, cada ornamento debe tener este peso.

* TEXTURA COMO HISTORIA: las superficies goticas nunca son lisas. Piedra, terciopelo, cuero envejecido, papel viejo — cada textura cuenta una historia de tiempo y uso.

* TENSION ENTRE OPUESTOS: vida y muerte, luz y sombra, sagrado y profano, belleza y decadencia. El diseno gotico vive en ese umbral, no en ningun extremo.

### **1.2  Variedades del Gothic Design en web**

| Variante | Caracteristicas | Referentes visuales |
| :---- | :---- | :---- |
| Classic Gothic | Negro, rojo sangre, plata, serif Blackletter, texturas de piedra | Dracula, Castlevania, Hammer Horror |
| Romantic Gothic | Purpura oscuro, terciopelo, oro viejo, serif elegante, flores marchitas | Anne Rice, Victorian dark, Pre-Raphaelites |
| Modern Dark Luxury | Negro y plata, minimalismo oscuro con detalle gotico, sans refinada | Rick Owens, Ann Demeulemeester, Yohji |
| Witchcraft / Occult | Negro, verde salvia, cobre, simbolos esotericos, hierbas y botanica | Sabrina, The Witch, Practical Magic |
| Gothic Kawaii / Pastel Goth | Negro con pastel (rosa, lavanda), lolita gotica, cute y oscuro | J-fashion dark, Harajuku subculture |
| Dark Academia | Burgundy, verde oscuro, cuero, madera oscura, libros viejos | The Secret History, Donna Tartt aesthetic |
| Industrial Gothic | Negro metalico, acero oxidado, concreto, cables, tubos | Nine Inch Nails, Ministry, dark industrial |

## **2\. Paleta de Color Gotica**

### **2.1  La arquitectura cromatica del gotico**

| Categoria | Valores hex | Rol en la composicion |
| :---- | :---- | :---- |
| Negros profundos | \#0A0008, \#0D000A, \#080508 | El abismo — fondo base, el vacio de donde emerge todo |
| Negros con tono | \#0F0812, \#100A0A, \#0B0B14 | Fondos de superficie con personalidad cromatica sutil |
| Purpura oscuro | \#1A0A2E, \#2D0A4E, \#3D1A5C | El color del misterio, la magia y la nobleza oscura |
| Rojo sangre | \#4A0000, \#6B0000, \#8B0000 | La vida y la muerte — pasion contenida, peligro elegante |
| Rojo carmesi | \#990000, \#B20000, \#CC0000 | Acento principal de impacto — sangre, terciopelo, vino |
| Plata y gris frio | \#888899, \#9999AA, \#AAAACC | Acero, luna llena, plata de joya — el metal gotico |
| Dorado viejo | \#8B7344, \#A08450, \#C9A84C | Decoracion marchita, oro de catedral, bisuteria antigua |
| Verde musgo oscuro | \#1A2A1A, \#2A3A2A, \#1E3020 | Naturaleza decayendo, bosque nocturno, hierbas magicas |
| Crema envejecida | \#F0EAD6, \#E8DFC8, \#DDD0B8 | El papel viejo de los grimoires, piel de libro antiguo |
| Blanco espectral | \#E8E8EE, \#F0F0F8, \#F8F8FF | La aparicion, la luna, el marfil — nunca blanco puro |

### **2.2  Combinaciones cromaticas goticas clasicas**

* NEGRO \+ ROJO SANGRE: la combinacion mas iconica del gotico — contraste maximo con carga simbolica de vida/muerte

* NEGRO \+ PURPURA \+ PLATA: la trinidad gotica noble — el purpura eleva el negro de lo oscuro a lo mistico

* NEGRO \+ ORO VIEJO: gotico barroco — la decadencia lujosa de las catedrales y los salones victorianos

* NEGRO \+ VERDE OSCURO \+ COBRE: gotico natural y brujeria — el bosque, la magia organica, la alquimia

* NEGRO \+ BLANCO ESPECTRAL: gotico minimalista — maximo contraste sin color, la ausencia como presencia

* MAROON \+ CREMA \+ CUERO: dark academia — la melancoilia de los libros viejos y los pasillos iluminados

### **2.3  Gradientes y efectos de color goticos**

* Fondo degradado radial: radial-gradient(ellipse at 30% 20%, \#2D0A4E 0%, \#0A0008 60%) — luz purpura emergiendo de la oscuridad

* Gradiente de sangre: linear-gradient(180deg, \#0A0008 0%, \#4A0000 50%, \#0A0008 100%) — para secciones de impacto

* Velo de niebla: radial-gradient semitransparente sobre imagen para el efecto de neblina gotica

* Texto con gradiente de llama: background-clip: text con gradiente de rojo-naranja-amarillo (solo para decoracion)

* Efecto de luna: radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(200,200,220,0) 70%) como elemento decorativo flotante

## **3\. Tipografia Gotica**

### **3.1  El universo tipografico gotico completo**

| Categoria | Fuentes | Uso y caracter |
| :---- | :---- | :---- |
| Blackletter / Fractura | UnifrakturMaguntia, MedievalSharp, Deutsch Gothic, Old English Text MT | Titulares de maximo impacto gotico — la escritura de los manuscritos medievales |
| Serif gotico moderno | Cormorant Garamond Italic, Cinzel Decorative, Playfair Display Italic, Cardo | Titulares elegantes con herencia clasica — el gotico sofisticado |
| Serif antiguo de alta clase | Trajan Pro, Cinzel, Libre Caslon, IM Fell English | Autoridad y historia — inscripciones en piedra, titulos de nobleza |
| Display oscuro | Forum, Italiana, GFS Didot, Poiret One | Titulares con drama pero mayor legibilidad que el Blackletter |
| Serif de texto legible | Crimson Text, Lora, Gilda Display, Spectral | Cuerpo de texto de largo aliento — oscuro pero comodo de leer |
| Sans de contraste | Josefin Sans, Raleway Light, Poiret One | Para metadatos, labels, contraste con el serif principal |
| Monospace gotico | Special Elite, Courier Prime Italic | Notas, citas, fragmentos de grimoire — texto de maquina antigua |

### **3.2  Uso del Blackletter en web moderno**

* El Blackletter es icono pero tiene limites: legible solo en tamanos grandes (48px+) y en titulares cortos

* Nunca usar Blackletter para cuerpo de texto — la densidad del trazo lo hace practicamente ilegible a tamanos menores de 24px

* Combinacion optima: Blackletter para el nombre de la marca/publicacion \+ Serif elegante para titulares \+ Serif clasico para cuerpo

* En modo responsive: reducir el peso del Blackletter en mobile usando una version simplificada o cambiando a serif elegante

* El Blackletter requiere mucho tracking negativo en tamanos grandes: letter-spacing: \-0.03em a \-0.05em

* Font-display: swap con fallback en serif para que la carga del Blackletter no rompa el layout

### **3.3  Tecnicas tipograficas goticas avanzadas**

* Capitulares decorativas: ::first-letter con font-family Blackletter, tamano 4-5 lineas, float left con shape-outside

* Texto con efecto de escritura a pluma: SVG path animation que 'escribe' el titulo letra por letra

* Decoraciones tipograficas: fleurons (floreones), cruces, estrellas de seis puntas como separadores — en HTML entities o SVG

* Titulares con efecto de grabado en piedra: text-shadow multiples en grises para simular relieve sobre piedra

* Texto sobre fondo de textura: siempre verificar legibilidad — el texto gotico puede perderse en texturas muy detalladas

## **4\. Texturas, Patrones y Ornamentos Goticos**

Las texturas son el alma del Gothic Design. Sin texturas, el gotico se convierte en dark mode generico. Las texturas comunican la materialidad del universo gotico: la piedra medieval, el terciopelo victoriano, el cuero envejecido, el papel de grimoire.

### **4.1  Catalogo de texturas goticas esenciales**

* PIEDRA Y MAMPOSTERIA: textura granulada de piedra medieval — escaneado en escala de grises, overlay en modo multiply

* TERCIOPELO: patron de nap (felpilla) en color profundo — purpura, borgona, negro — con variacion de luz segun angulo

* CUERO ENVEJECIDO: textura de cuero con craquelado, imperfecciones y desgaste en bordes — para contenedores y fondos de card

* PAPEL DE GRIMOIRE: papel envejecido con manchas de humedad, bordes irregulares, foxing (puntos de oxido) — para secciones de texto

* METAL OXIDADO: hierro con herrumbre para bordes y marcos — patina verde-naranja sobre metal oscuro

* MADERA OSCURA: veta de madera wengue o ebano — para sidebars y marcos estructurales

* NIEBLA Y HUMO: SVG con feTurbulence para niebla generativa animada — se mueve muy lentamente sobre el fondo

* ENCAJE Y FILIGRANA: patrones SVG de encaje negro sobre fondo oscuro — para overlays decorativos de alta densidad

### **4.2  Ornamentos goticos caracteristicos**

* ARCOS OJIVALES: el arco de punta caracteristico del gotico — en SVG como marcos de imagenes o divisores de seccion

* TRACERIA: la red de lineas que forman los vitrales — patrones SVG de alta complejidad para backgrounds

* GARGOLAS Y BESTIAS: iconografia de criaturas goticas — ilustraciones en linea o grabados como elementos decorativos

* PENTAGRAMAS Y SIMBOLOS ESOTERICOS: para la variante occult/witchcraft — en SVG o font de simbolos

* ROSAS Y FLORES MARCHITAS: iconografia romantica gotica — PNG de alta calidad o ilustracion botanica de estilo antiguo

* CANDELABROS Y VELAS: como elementos de iluminacion simulada — gradient radial que imita la luz de vela en las esquinas

* CRUCES Y SIMBOLOS RELIGIOSOS GOTICOS: la cruz celta, la cruz de iron — para la variante dark metal y romantic gothic

* BORDES DE FILIGRANA: marcos ornamentales de esquinas con motivos goticos — para cards y secciones principales

### **4.3  Implementacion CSS de efectos goticos**

   
/\* Efecto de vela — luz calida emanando desde un punto \*/  
.gothic-candle-bg {  
  background:  
    radial-gradient(ellipse 40% 30% at 25% 15%, rgba(180,80,0,0.15) 0%, transparent 70%),  
    radial-gradient(ellipse 30% 20% at 75% 85%, rgba(120,40,0,0.10) 0%, transparent 60%),  
    \#0A0008;  
}  
   
/\* Efecto de texto grabado en piedra \*/  
.gothic-stone-text {  
  color: \#C8C0B0;  
  text-shadow:  
    0 1px 1px rgba(0,0,0,0.8),  
    0 \-1px 0 rgba(255,255,255,0.15),  
    1px 0 1px rgba(0,0,0,0.5);  
}  
   
/\* Borde de filigrana gotica (simulado con box-shadow multiple) \*/  
.gothic-frame {  
  box-shadow:  
    0 0 0 1px rgba(180,140,60,0.4),  
    0 0 0 4px rgba(40,0,20,0.8),  
    0 0 0 5px rgba(180,140,60,0.2),  
    inset 0 0 0 1px rgba(180,140,60,0.1);  
  border-radius: 0; /\* Sin redondeo — angulos goticos \*/  
}  
   
/\* Overlay de niebla animada \*/  
.gothic-mist {  
  position: relative;  
  overflow: hidden;  
}  
.gothic-mist::before {  
  content: '';  
  position: absolute; inset: 0;  
  background: url('noise-mist.svg');  
  opacity: 0.08;  
  animation: mist-drift 12s ease-in-out infinite alternate;  
}  
@keyframes mist-drift {  
  from { background-position: 0% 0%; }  
  to   { background-position: 5% 3%; }  
}  
   
/\* Efecto de sangrado de tinta en titulares \*/  
.gothic-drip {  
  position: relative;  
}  
.gothic-drip::after {  
  content: '';  
  position: absolute;  
  bottom: \-4px; left: 0; right: 0; height: 8px;  
  background: url('ink-drip.svg') repeat-x center bottom;  
  background-size: auto 100%;  
}  
 

## **5\. Animaciones Goticas**

| Animacion | Duracion | Descripcion gotica |
| :---- | :---- | :---- |
| Entrada de pagina | 800-1200ms | Fade desde negro absoluto — como una vela encendiendose en la oscuridad |
| Hover en imagen | 600ms ease-out | La imagen se desatura ligeramente y aparece un overlay de niebla purpura |
| Texto revelado en scroll | 1000ms ease-out | Las palabras aparecen letra a letra o parrafo a parrafo con opacity fade |
| Vela parpadeante | Loop 2-4s irregular | Oscilacion sutil del glow de fondo — setTimeout con duraciones aleatorias |
| Cursor personalizado | 60fps rAF | Circulo con halo de luz purpura tenue que sigue al cursor |
| Niebla de fondo | Loop 15-20s ease-in-out | background-position desplazandose muy lentamente en diagonal |
| Hover en card gotica | 400ms ease | Elevacion \+ intensificacion del glow de borde de color gotico |
| Pajaros/particulas oscuras | Loop variable | SVG paths que se mueven como murciélagos o cuervos — muy sutiles |
| Reveal de ornamento | SVG stroke animation 1500ms | El ornamento se 'dibuja' al entrar en viewport — stroke-dashoffset |
| Modal gotico | 500ms ease-out | Aparece desde el centro con scale \+ el backdrop se cubre de niebla |
| Texto con destello de luz | Loop 6s ease-in-out | Sutilisimo shimmer que recorre el titulo como un destello de vela |

## **6\. Variables CSS para Gothic / Dark Aesthetic**

   
/\* \=== GOTHIC DARK AESTHETIC — CSS CUSTOM PROPERTIES \=== \*/  
   
/\* Fondos \*/  
\--gothic-void:      \#0A0008;  
\--gothic-bg:        \#0D000A;  
\--gothic-surface:   \#120010;  
\--gothic-raised:    \#1A0818;  
\--gothic-overlay:   \#220F20;  
   
/\* Colores goticos primarios \*/  
\--gothic-purple:    \#3D1A5C;  
\--gothic-blood:     \#8B0000;  
\--gothic-crimson:   \#CC0000;  
\--gothic-silver:    \#9999AA;  
\--gothic-gold:      \#C9A84C;  
\--gothic-bone:      \#F0EAD6;  
\--gothic-moss:      \#1E3020;  
   
/\* Texto \*/  
\--gothic-text:      \#E8E0E8;  
\--gothic-text-soft: \#A090A0;  
\--gothic-text-dim:  \#604060;  
   
/\* Gradientes \*/  
\--gothic-candle:    radial-gradient(ellipse at 30% 20%, rgba(180,80,0,0.15), transparent 60%), \#0A0008;  
\--gothic-moonlight: radial-gradient(ellipse at 70% 10%, rgba(153,153,170,0.12), transparent 50%), \#0A0008;  
\--gothic-blood-bg:  linear-gradient(180deg, \#0A0008 0%, \#200005 50%, \#0A0008 100%);  
   
/\* Sombras y brillos \*/  
\--gothic-glow-purple: 0 0 30px rgba(61,26,92,0.6), 0 0 60px rgba(61,26,92,0.2);  
\--gothic-glow-blood:  0 0 20px rgba(139,0,0,0.5), 0 0 40px rgba(139,0,0,0.15);  
\--gothic-glow-gold:   0 0 15px rgba(201,168,76,0.4), 0 0 30px rgba(201,168,76,0.1);  
\--gothic-frame:       0 0 0 1px rgba(180,140,60,0.3), 0 0 0 4px rgba(20,0,15,0.9), 0 0 0 5px rgba(180,140,60,0.15);  
   
/\* Tipografia \*/  
\--font-blackletter: 'UnifrakturMaguntia', 'MedievalSharp', serif;  
\--font-gothic-serif:'Cormorant Garamond', 'Cinzel Decorative', Georgia, serif;  
\--font-body:        'Crimson Text', 'Lora', Georgia, serif;  
\--font-label:       'Josefin Sans', 'Raleway', Arial, sans-serif;  
   
/\* Escalas \*/  
\--fs-display:  clamp(3rem, 8vw, 8rem);  
\--fs-h1:       clamp(2rem, 4vw, 3.5rem);  
\--fs-body:     1.125rem;  
\--lh-gothic:   1.7;  
\--ls-blackletter: \-0.04em;  
\--ls-caps:        0.15em;  
   
/\* Transiciones \*/  
\--t-gothic:    600ms cubic-bezier(0.25, 0.46, 0.45, 0.94);  
\--t-fast:      200ms ease;  
 

## **7\. Anti-patrones del Gothic Design**

* NUNCA usar Blackletter para texto de cuerpo o a tamanos menores de 32px — la ilegibilidad destruye la experiencia

* NUNCA acumular todos los elementos goticos a la vez: niebla \+ textura \+ ornamentos \+ fuente gotica \+ animaciones \= sobrecarga sensorial

* NUNCA gotico generico sin referencia cultural especifica — cada variante gotica tiene un lenguaje propio que hay que conocer

* NUNCA rojo sangre y purpura sin anclas de negro profundo — sin el negro, los colores goticos parecen halloween de baja calidad

* NUNCA animaciones de parpadeo rapido — pueden desencadenar convulsiones en personas con fotosensibilidad

* NUNCA texturas de baja resolucion que pixelen en pantallas retina — las texturas goticas de calidad son archivos pesados que requieren optimizacion

* NUNCA el gotico en contextos de confianza critica (salud, banca, legal) — el misterio y la autoridad institucional son incompatibles

* NUNCA confundir gotico con Halloween — el gotico es una estetica cultural rica; no es decoracion estacional barata

**16**    **Noir**

*Sombra y luz en conflicto — La elegancia de la ambiguedad moral hecha estetica visual*

| Familia | Estilos Oscuros / Dramaticos |
| :---- | :---- |
| **Indice** | 03 / 04 |
| **Filosofia** | El noir no es simplemente blanco y negro. Es la estetica del conflicto moral — donde la luz y la sombra no solo iluminan, sino que revelan y ocultan al mismo tiempo. |
| **Referentes** | Raymond Chandler, Orson Welles (Citizen Kane), Blade Runner, Sin City (Miller), Saul Bass posters, Mad Men, Boardwalk Empire, James Ellroy, Peaky Blinders |
| **Emocion** | Tension contenida, sofisticacion peligrosa, ambiguedad moral, nostalgia de lo oscuro, el placer de lo prohibido |
| **Sectores** | Agencias de detectives o investigacion privada, whisky y bebidas premium, moda masculina dark, joyeria de plata, industria cinematografica, fotografia de arte, novela negra digital |

## **1\. Filosofia Visual del Noir**

El cine noir (1940-1958) establecio un vocabulario visual que trasciende el blanco y negro: la luz que cae en diagonal atraves de persianas venecianas, el humo del cigarrillo que sube en la oscuridad, la silueta de un hombre en el umbral de una puerta. Estos no son recursos tecnicos — son metaforas visuales del conflicto moral que define el genero. En diseno web, el noir traduce estas metaforas en un sistema de contrastes extremos, paleta de grises monocromaticos, tipografia de la era dorada, y composicion cinematografica.

*En el noir, la sombra no es la ausencia de luz. Es el lugar donde vive la verdad que la luz no puede revelar.*

### **1.1  Los elementos visuales del lenguaje noir**

* CHIAROSCURO DIGITAL: contraste extremo entre luz y sombra — backgrounds negros con spots de luz focalizada

* COMPOSICION CINEMATOGRAFICA: encuadres con regla de los tercios, angulos holandeses (Dutch angles), picados y contrapicados

* LINEAS DIAGONALES: las persianas venecianas, los rayos de luz oblicua, las escaleras — la diagonal crea tension y movimiento

* GRAIN Y TEXTURA FOTOQUIMICA: el grano del celuloide en blanco y negro de 35mm — textura de noise sobre imagenes

* TIPOGRAFIA DE EPOCA: serif de imprenta antigua, tipos con grasa de los titulares de periodico de los 40s

* HUMO Y NEBLINA: opacidad y difuminado que ocultan tanto como revelan — la ambiguedad visual como mensaje

### **1.2  Variedades del Noir en diseno web**

| Variante | Caracteristicas | Referentes |
| :---- | :---- | :---- |
| Classic Noir | B\&N estricto, serif pesada, lineas duras, sin color | Film noir clasico, Citizen Kane, Double Indemnity |
| Neo-Noir | Gris con acento de un solo color (rojo, azul neon, amarillo) | Blade Runner, Sin City, L.A. Confidential |
| Tech Noir | Oscuro con acentos neon, futurismo melancolico | Blade Runner 2049, Dark City, Altered Carbon |
| Sepia Noir | Tonos sepia calidos en lugar de gris neutro | Novela negra victoriana, The Knick, Peaky Blinders |
| Graphic Novel Noir | Sin City style: alto contraste, blancos y negros absolutos, salpicaduras de color | Frank Miller, Max Allan Collins |
| Fashion Noir | Noir con glamour — grises frios, piel, plata, muy elegante | Publicidad de moda de lujo monocromatica |

## **2\. Paleta de Color Noir**

### **2.1  La escala de grises del noir — 11 tonos con funcion**

| Nombre | Valor hex | Funcion en la composicion |
| :---- | :---- | :---- |
| Pitch Black | \#000000 | El abismo — fondos de maximo contraste, silhouettes perfectas |
| Rich Black | \#0A0A0A | Fondo base — mas rico que el negro puro, menos agresivo |
| Near Black | \#141414 | Superficies elevadas sobre el fondo base |
| Charcoal | \#1E1E1E | Elementos de superficie en segundo plano |
| Dark Gray | \#2A2A2A | Cards, paneles, elementos contenedores |
| Medium Gray | \#444444 | Texto terciario, separadores, iconos inactivos |
| Neutral Gray | \#666666 | Texto secundario, bordes sutiles en modo claro |
| Silver | \#888888 | Texto de apoyo, metadatos |
| Light Gray | \#AAAAAA | Texto principal sobre fondos muy oscuros |
| Near White | \#CCCCCC | Texto de alta legibilidad sobre fondo oscuro |
| Paper White | \#F0F0F0 | El texto principal — no blanco puro, ligeramente suavizado |

### **2.2  El acento de color en el neo-noir**

* El noir clasico NO tiene color — la monocromaticidad es su declaracion de principios

* El neo-noir usa UN solo color de acento como golpe de impacto visual y significado narrativo

* ROJO: la pasion, la sangre, el peligro — el acento noir mas clasico (labios, faro de coche, letrero de neon)

* AZUL NEON: la ciudad futurista, el frio, la soledad tecnologica — Blade Runner, tech noir, cyberpunk oscuro

* AMARILLO AMBAR: la luz caliente de la lampara de escritorio, el whisky, el oro sucio — sepia noir, 40s detective

* VERDE NEON: el letrero de la farmacia, la pantalla del ordenador — neo-noir contemporaneo

* El acento se usa con extrema economia — maximo en 2-3 elementos clave de toda la pagina

### **2.3  Tratamiento de imagenes estilo noir**

* CONVERSION B\&N: filter: grayscale(1) — la conversion mas limpia para fotografias a noir rapido

* ALTO CONTRASTE: filter: grayscale(1) contrast(1.4) brightness(0.9) — version dramatica con negros mas profundos

* GRAIN DE CELULOIDE: overlay PNG de noise en modo multiply con opacity 0.3-0.5 sobre la imagen

* EFECTO DE EXPOSICION DOBLE: dos imagenes en diferentes capas con mix-blend-mode: screen o overlay

* VIGNETADO: radial-gradient de negro transparente hacia los bordes para focalizar la atencion en el centro

* MOTION BLUR: filter: blur() en una direccion especifica para fotos con movimiento intencional

* SILHOUETTES: recorte del sujeto en negro solido sobre fondo con fuente de luz — el icono visual del noir

## **3\. Tipografia Noir**

### **3.1  El vocabulario tipografico del noir**

| Estilo | Fuentes | Conexion con el noir |
| :---- | :---- | :---- |
| Slab serif de impacta | Rockwell, Clarendon, Sentinel, Archer | Los titulares de periodico de los 40s — urgencia e impacto informativo |
| Serif transitional clasica | Times New Roman, Baskerville, Freight Text | La maquina de escribir del detective, el informe oficial |
| Cursiva de pulso | Lora Italic, Palatino Italic, IM Fell | La nota escrita a mano, el mensaje urgente, la carta anonima |
| Sans condensada de cartel | Trade Gothic Condensed, Franklin Gothic, News Gothic | Los carteles de la ciudad, los anuncios de los 40s |
| Display oscuro serif | Abril Fatface, Ultra, Playfair Display Black | Titulares de gran impacto en materiales de portada |
| Monospace de maquina | Special Elite, Courier, Letter Gothic | El reporte del detective, el telegrama urgente, el archivo |
| Art Deco elegante | Poiret One, Forum, Josefin Slab | El glamour de la decada — vestidos, cigarros, sospechosos elegantes |

### **3.2  Composicion tipografica noir**

* Titulares en blanco puro sobre negro absoluto — el contraste maximo es la norma, no la excepcion

* Uso de UPPERCASE para titulares cortos de impacto — el titular de periodico como forma tipografica

* Subtitulares en italic — la voz narrativa del detective tiene ese tono oblicuo y reflexivo

* Numeros de articulo o de caso en tamano display como elemento decorativo — la burocracia como estetica

* Fechas y timestamps con monospace para el efecto de registro oficial y archivo policial

* El espaciado en noir es tenso — menos respiro que en editoriales elegantes, mas densidad

## **4\. Composicion y Layout Noir**

### **4.1  La composicion cinematografica en web**

* ENCUADRES EN DIAGONAL: elementos colocados en angulo de 15-30 grados para crear tension visual

* ASIMETRIA DRAMATICA: columna de texto en 30% del ancho con imagen que ocupa el 70% restante

* CORTES DUROS: cambios de seccion sin transiciones suaves — de negro absoluto a contenido sin gradiente intermedio

* PROFUNDIDAD DE CAMPO SIMULADA: elementos en primer plano con sombra de color, elementos de fondo con reduccion de opacidad

* EL PANEL DE COMIC NOIR: layout de cuadriculas irregulares que simulan paneles de historieta — grid con gaps de negro

* FUENTES DE LUZ PUNTUAL: radial-gradient que simula una lampara de escritorio o un spot de luz desde un punto especifico

### **4.2  Elementos compositivos noir especificos**

* PERSIANAS VENECIANAS CSS: rayas horizontales sobre imagenes — repeating-linear-gradient de negro semitransparente

* HUMO Y NIEBLA: SVG feTurbulence con animacion lenta sobre fondos oscuros — la ambiguedad visual del noir

* LLUVIA: canvas animation con particulas verticales blancas sobre negro — para hero sections de impacto

* SILUETA DE CIUDAD: SVG de skyline noir como divisor entre secciones o como fondo de footer

* TITULARES CON 'MANCHAS DE SANGRE': letra capital con tratamiento de color rojo sobre negro

* EFECTO DE PAPEL PERIODICO: background de textura de papel viejo con pattern de columnas de texto tipografico

## **5\. Animaciones Noir**

| Animacion | Duracion | Descripcion en clave noir |
| :---- | :---- | :---- |
| Entrada de pagina | 600-800ms | Fade desde negro — como la luz que entra lentamente en una habitacion oscura |
| Reveal de texto en scroll | 400ms ease-out | El texto surge de la oscuridad con opacity fade — la revelacion lenta del detective |
| Efecto de celuloide | Loop 3s steps(1) | Film grain que parpadea ligeramente — simula el movimiento del celuloide |
| Hover en imagen noir | 400ms ease | Intensificacion del contraste \+ vignette que se profundiza |
| Neon parpadeo | Loop 4-8s irregular | El letrero de neon del acento de color que parpadea con setInterval |
| Lluvia de fondo | Loop infinito | Canvas con particulas verticales a diferentes velocidades y opacidades |
| Cursor detective | 60fps rAF | Cursor tipo crosshair o punto de mira — sobrio y preciso |
| Transicion entre secciones | 500ms ease-out | Cortinilla de negro que cubre y descubre — como el fundido a negro del cine |
| Texto de maquina de escribir | Variable, 80ms por caracter | Aparicion caracter a caracter con sonido opcional — el informe del detective |
| Sombra que se alarga en hover | 300ms ease-out | La sombra del elemento se alarga y oscurece — el noir siempre tiene sombras largas |

## **6\. Variables CSS para Noir**

   
/\* \=== NOIR — CSS CUSTOM PROPERTIES \=== \*/  
   
/\* Escala de grises noir \*/  
\--noir-black:      \#000000;  
\--noir-rich-black: \#0A0A0A;  
\--noir-dark:       \#1C1C1C;  
\--noir-charcoal:   \#2A2A2A;  
\--noir-mid:        \#444444;  
\--noir-silver:     \#888888;  
\--noir-light:      \#CCCCCC;  
\--noir-paper:      \#F0F0F0;  
   
/\* Acento de color (elegir UNO segun variante) \*/  
\--noir-red:        \#CC0000;   /\* classic noir \*/  
\--noir-neon-blue:  \#00AAFF;   /\* tech noir / blade runner \*/  
\--noir-amber:      \#D4880A;   /\* sepia noir / 40s detective \*/  
\--noir-green-neon: \#00CC44;   /\* neo-noir contemporaneo \*/  
   
/\* Gradientes y efectos \*/  
\--noir-vignette:   radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%);  
\--noir-spotlight:  radial-gradient(ellipse 40% 50% at 50% 80%, rgba(240,240,240,0.15) 0%, transparent 70%);  
\--noir-blinds:     repeating-linear-gradient(0deg, rgba(0,0,0,0.5) 0px, rgba(0,0,0,0.5) 3px, transparent 3px, transparent 12px);  
\--noir-rain-bg:    linear-gradient(175deg, rgba(200,200,220,0.03) 1px, transparent 1px) 0 0 / 4px 20px;  
   
/\* Sombras noir \*/  
\--noir-shadow-hard: 4px 4px 0 rgba(0,0,0,0.8);  
\--noir-shadow-long: 12px 12px 0 rgba(0,0,0,0.6);  
\--noir-glow-red:    0 0 15px rgba(204,0,0,0.5), 0 0 40px rgba(204,0,0,0.15);  
\--noir-glow-neon:   0 0 10px rgba(0,170,255,0.8), 0 0 30px rgba(0,170,255,0.3);  
   
/\* Tipografia \*/  
\--font-headline:  'Rockwell Extra Bold', 'Clarendon', Georgia, serif;  
\--font-body:      'IM Fell English', 'Libre Baskerville', Georgia, serif;  
\--font-report:    'Special Elite', 'Courier Prime', monospace;  
\--font-caption:   'Trade Gothic Next Condensed', 'Franklin Gothic Medium', Arial, sans-serif;  
   
/\* Escalas \*/  
\--fs-headline:   clamp(2.5rem, 6vw, 6rem);  
\--fs-body:       1rem;  
\--lh-noir:       1.65;  
\--ls-headline:   \-0.01em;  
\--ls-caps:       0.15em;  
   
/\* Filtros fotograficos \*/  
\--filter-noir:       grayscale(1) contrast(1.3) brightness(0.85);  
\--filter-noir-hover: grayscale(1) contrast(1.5) brightness(0.75);  
\--filter-sepia-noir: grayscale(0.8) sepia(0.4) contrast(1.2);  
   
/\* Transiciones \*/  
\--t-noir:   400ms ease-out;  
\--t-reveal: 600ms cubic-bezier(0.4, 0, 0.2, 1);  
 

## **7\. Anti-patrones del Noir**

* NUNCA usar color en exceso — el noir con muchos colores pierde su identidad monocromatica que lo define

* NUNCA tipografia playful o redondeada — el noir es serio, tenso y directo; nada de fuentes amigables

* NUNCA animaciones ligeras o rebotantes — el noir se mueve con la gravedad del destino, no con la ligereza del optimismo

* NUNCA el estilo noir en contextos de alegria o celebracion — hay una incongruencia semantica insalvable

* NUNCA ignorar el significado cultural del noir — es un genero con profundidad historica y moral; el pastiche superficial se nota

* NUNCA blanco puro (\#FFF) mezclado con negro puro (\#000) sin grises intermedios — el contraste absoluto en web da una sensacion aspera y no la elegancia del noir fotografico

* NUNCA textura de grano demasiado visible — el grain del noir es sutil, la presencia de textura se siente pero no se ve claramente

**17**    **Horror / Occult**

*El diseno del umbral — Donde la estetica provoca respuestas viscerales y primitivas*

| Familia | Estilos Oscuros / Dramaticos |
| :---- | :---- |
| **Indice** | 04 / 04 |
| **Filosofia** | El horror no asusta con monstruos — asusta con lo que el cerebro interpola en la oscuridad. El diseno de horror trabaja con lo que se SUGIERE, no con lo que se MUESTRA. |
| **Referentes** | A24 Horror (Midsommar, Hereditary, The Witch), Clive Barker, H.P. Lovecraft covers, The Magnus Archives, creepypasta aesthetic, Ari Aster visual language, Rob Zombie films, Satanic Temple visual identity |
| **Emocion** | Pavor visceral, fascinacion macabra, dread existencial, tension acumulada, lo sublime horrorosamente bello |
| **Sectores** | Entretenimiento de horror (juegos, peliculas, podcasts), haunted houses y escape rooms, literatura de terror, tarot y esoterismo dark, heavy metal y black metal, campanas de terror, eventos de Halloween premium |

## **1\. Filosofia del Horror Design — La Estetica del Miedo**

El horror efectivo en diseno no muestra monstruos — insinua su presencia. El diseno de horror trabaja con tres herramientas psicologicas primarias: lo uncanny (lo familiar que se vuelve extrano), lo liminal (los espacios de umbral donde las reglas normales no aplican), y lo eldritch (lo que trasciende la comprension humana y genera terror por incomprension). Dominar estas herramientas visualmente requiere entender profundamente la psicologia del miedo.

*Lo mas aterrador que puede disenar no es el monstruo. Es el momento justo antes de que el monstruo aparezca.*

### **1.1  Los tres mecanismos del horror visual**

* LO UNCANNY (Freud): algo que deberia ser familiar pero tiene algo ligeramente 'mal' — una proporcion incorrecta, un angulo imposible, un patron que casi tiene sentido pero no del todo. CSS: elementos con transform ligeramente erroneo, simetria casi perfecta pero no del todo.

* LO LIMINAL: los espacios de transicion — pasillos vacios, umbrales de puertas, la habitacion en la que 'algo' estuvo antes. CSS: secciones con sensacion de espacio abandonado, ausencia de personas en fotografias de ambientes donde deberia haber gente.

* LO ELDRITCH: lo que no puede ser comprendido — geometrias no euclidianas, patrones que el ojo sigue pero que no llevan a ningun lugar, texto que cambia sutilmente al releerlo. CSS: SVG con formas que casi tienen sentido, animaciones con easing irregular que no sigue patrones predecibles.

### **1.2  Categorias del Horror Design**

| Categoria | Caracteristicas visuales | Referentes |
| :---- | :---- | :---- |
| Cosmic Horror (Lovecraftian) | Geometrias imposibles, colores de otro mundo, escala inconcebible | H.P. Lovecraft, Annihilation, Color Out of Space |
| Folk Horror | Naturaleza que aterra, simbolos paganos, flores y calaveras, miel y sangre | The Witch, Midsommar, The Wicker Man |
| Psychological Horror | Distorsion de la percepcion, patrones que se mueven, doppelgangers | Hereditary, Black Swan, Shining |
| Supernatural Horror | Lo sagrado corrompido, cruces invertidas, iconografia religiosa oscura | The Exorcist, Rosemary's Baby, Catholicism dark |
| Gore / Visceral | Rojo intenso, texturas organicas, carne y hueso — solo para audiencias adultas especificas | Rob Zombie, Clive Barker, Hellraiser |
| Occult / Esoteric | Simbolos esotericos, circulo magico, signos, grimoires, alquimia | Tarot, Satanic Temple, occultism aesthetic |
| Hauntology | Lo familiar de otra era que perturbadoramente persiste — VHS noise, TV test pattern | Burial, The Stone Tape, analog horror |
| Body Horror | Transformacion, lo organico distorsionado, metamorfosis — solo con audiencia adulta | Cronenberg, The Fly, Annihilation body |

## **2\. Paleta de Color del Horror**

### **2.1  Arquitectura cromatica del horror**

| Color | Valores hex | Significado en el horror |
| :---- | :---- | :---- |
| Negro abisal | \#050505, \#080308, \#050208 | El vacio primordial — de donde viene el horror; no tiene fondo |
| Rojo sangre oscuro | \#3A0000, \#5C0000, \#8B0000 | La herida, la amenaza vital, el peligro biologico primario |
| Rojo carmesi vivo | \#AA0000, \#CC1100, \#FF1A00 | Sangre fresca, urgencia de horror inmediato, gore controlado |
| Purpura abismal | \#1A0028, \#2D0045, \#3D005A | Lo sobrenatural, la magia oscura, el cosmos aterrador |
| Verde putrefacto | \#0A1A00, \#142800, \#1A3D00 | La descomposicion, la corrupcion organica, lo enfermo |
| Verde toxico | \#003300, \#004400, \#005500 | La pestilencia, el veneno, lo que corrompe desde adentro |
| Amarillo enfermo | \#3A3000, \#4A3C00, \#8B7A00 | La palidez de la muerte, la luz enferma de las habitaciones abandonadas |
| Blanco espectral | \#E8E8F0, \#F0F0F8, \#F8F8FF | La aparicion, el cadaver, el hueso — nunca blanco limpio |
| Gris ceniza | \#1A1A1A, \#2A2828, \#383430 | La muerte sin dramaturgia — la ceniza, el polvo, el olvido |
| Naranja putrefacto | \#3A1500, \#5C2000, \#8B3A00 | La descomposicion organica, el cadaver en proceso |

### **2.2  Combinaciones cromaticas por tipo de horror**

* COSMIC HORROR: negro abisal \+ purpura abismal \+ amarillo enfermo sutil — los colores de lo que no deberia existir

* FOLK HORROR: negro \+ rojo sangre oscuro \+ verde naturaleza \+ blanco hueso — la naturaleza como amenaza

* SUPERNATURAL: negro \+ rojo carmesi \+ blanco espectral \+ purpura — la iconografia religiosa corrompida

* OCCULT: negro \+ purpura \+ dorado viejo \+ blanco espectral — los grimoires y los circulos de invocacion

* HAUNTOLOGY: beige muy desaturado \+ cyan palido \+ gris television — la estatica de lo antiguo que persiste

* GORE (uso responsable): rojo carmesi brillante sobre negro — reservado para contextos de entretenimiento adulto explicitamente etiquetados

### **2.3  Efectos de color especificos del horror**

* COLOR BLEEDING: los colores se 'sangran' fuera de sus bordes — filter: blur(0.5px) con color oversaturation en bordes

* DESATURACION SELECTIVA: la escena casi en blanco y negro excepto por el rojo sangre — filter y compositing

* LUZ ENFERMA: el amarillo verdoso de la lamparilla de hospital o la habitacion infectada — color overlay sutil

* EFECTO VHS: color fringing rojo/azul en bordes, noise de cinta, scanlines horizontales — para hauntology

* PULSACION DE COLOR: el rojo que pulsa sutilmente como un latido — animacion de opacity o filter: saturate

## **3\. Tipografia del Horror**

### **3.1  Repertorio tipografico del horror**

| Estilo | Fuentes | Horror que comunica |
| :---- | :---- | :---- |
| Scratch / Distressed | Rubik Dirt, Butcherman, Eater, Henny Penny | Texto arrancado, rayado, como escrito con la urgencia del miedo |
| Serif antiqua deteriorada | IM Fell English, Crimson Text Old Style, Cardo | El grimoire antiguo, la carta del siglo pasado, el libro maldito |
| Gothic Blackletter oscuro | UnifrakturMaguntia, MedievalSharp, Deutsch Gothic | La misa negra, el ritual, la invocacion — solo para display |
| Manuscript / Handwritten terror | Caveat con distorsion, Reenie Beanie erratica | La nota del perturbado, el mensaje en la pared, el diario |
| Serif de horror de los 70s | Alfa Slab One, Plaak, Noto Serif Display Black | Las portadas de horror pulp, Stephen King primeras ediciones |
| Display perturbador | Creepster, Nosifer, Eater — con moderacion | Decorativo de Halloween — perder si se abusa |
| Monospace de terminal | Share Tech Mono, VT323, Courier | El codigo que no deberia ejecutarse, el mensaje en la terminal |
| Sin fuente — texto generado | SVG paths de texto con variacion procedural | El horror que no puede ser leido normalmente — texto que no es texto |

### **3.2  Tecnicas tipograficas de horror**

* TEXTO ERRATICO: cada letra con transform: rotate() aleatorio de \+-3 grados (span por letra con nth-child)

* TEXTO QUE SANGRA: text-shadow en rojo que 'gotea' hacia abajo — multiples shadows con offset vertical creciente

* PARPADEO IRREGULAR: animacion de opacity con setInterval y duraciones aleatorias — la luz que falla

* TEXTO CORRUPTO: caracteres que se sustituyen por simbolos unicode raramente usados — el mensaje que se corrompe

* ESCRITURA EN RETROCESO: texto con direction: rtl mezclado con normal — la escritura que no deberia leerse

* TEXTO INVERTIDO: transform: scaleY(-1) en partes del titulo para el horror de lo reflejado

* TEXTO CON SOMBRA INTERIOR SANGRIENTA: text-shadow con inset simulado — letras huecas llenas de rojo

## **4\. Texturas, Simbolos y Elementos Visuales del Horror**

### **4.1  Texturas esenciales del horror**

* CARNE Y TEJIDO ORGANICO: texturas de piel, musculo, membrana — solo como fondo abstracto, no representacional

* OXIDO Y METAL CORRIDO: superficies metalicas con oxidacion — hierro, sangre seca, tiempo y deterioro

* MADERA PODRIDA: veta de madera con putrefaccion y humedad — para ambientes abandonados

* PAPEL QUEMADO: bordes carbonizados, manchas de fuego, paper burn — para documentos y cartas de horror

* PIEDRA ANTIGUA Y LIQUEN: la superficie de la tumba, el muro del castillo maldito

* ESTATICA Y NOISE: el noise de television sin señal — la hauntologia del horror electronico

* TELARANAS: SVG de tela de arana en las esquinas de los contenedores

* MANCHAS Y SALPICADURAS: formas organicas irregulares de color oscuro o rojo — la violencia que tuvo lugar

### **4.2  Simbolos y iconografia del horror**

* CIRCULO MAGICO Y PENTAGRAMA: el circulo de proteccion/invocacion — SVG con precision geometrica

* OJO DE LA PROVIDENCIA: el ojo que observa sin parpadear — icono SVG o imagen tratada

* ESPIRAL: el vortex del abismo, la espiral de locura — pattern animado que gira muy lentamente

* LA MANO: dedos que emergen, manos que sostienen — siluetas SVG o fotografias tratadas

* EL UMBRAL: la puerta entreabierta, el pasillo que termina en oscuridad — composicion fotografica especifica

* LA LUNA: llena como testigo, en eclipse como presagio — elemento decorativo con glow sutilisimo

* HUESOS Y CRÁNEOS: la iconografia de la muerte — ilustraciones estilizadas, nunca fotografias realistas

* INSECTOS Y ARANAS: lo que vive en la oscuridad — SVG de alta calidad o ilustracion grabada

### **4.3  Implementacion CSS de efectos horror**

   
/\* Efecto de VHS / hauntology \*/  
.vhs-effect {  
  position: relative;  
  filter: contrast(1.1) saturate(0.8);  
}  
.vhs-effect::before {  
  content: '';  
  position: absolute; inset: 0; z-index: 1;  
  background: repeating-linear-gradient(  
    0deg, rgba(0,0,0,0.03) 0px, rgba(0,0,0,0.03) 1px, transparent 1px, transparent 2px  
  );  
  pointer-events: none;  
}  
.vhs-effect::after {  
  content: '';  
  position: absolute; inset: 0; z-index: 2;  
  background: url('noise.svg');  
  opacity: 0.04;  
  animation: vhs-noise 0.1s steps(1) infinite;  
  pointer-events: none;  
}  
@keyframes vhs-noise {  
  0%   { background-position: 0% 0%; }  
  20%  { background-position: \-10% 5%; }  
  40%  { background-position: 5% \-10%; }  
  60%  { background-position: \-5% 15%; }  
  80%  { background-position: 10% \-5%; }  
  100% { background-position: 0% 0%; }  
}  
   
/\* Texto que 'sangra' \*/  
.blood-text {  
  color: \#F0F0F0;  
  text-shadow:  
    0 2px 4px rgba(139,0,0,0.8),  
    0 4px 8px rgba(139,0,0,0.5),  
    0 8px 16px rgba(139,0,0,0.3),  
    0 16px 32px rgba(80,0,0,0.2);  
}  
   
/\* Pulsacion de horror (latido) \*/  
.horror-pulse {  
  animation: horror-beat 2s ease-in-out infinite;  
}  
@keyframes horror-beat {  
  0%, 100% { filter: brightness(1); }  
  45%      { filter: brightness(1); }  
  50%      { filter: brightness(1.15) saturate(1.3); }  
  55%      { filter: brightness(1); }  
}  
   
/\* Texto erratico (cada span con rotacion aleatoria via CSS vars) \*/  
.erratic-text span {  
  display: inline-block;  
  transform: rotate(var(--r, 0deg)) translateY(var(--y, 0px));  
}  
/\* Asignar \--r y \--y con diferentes valores por nth-child en CSS o JS \*/  
   
/\* Efecto uncanny — casi correcto pero no del todo \*/  
.uncanny {  
  transform: scaleX(1.01) scaleY(0.99) skewX(0.3deg);  
  filter: contrast(1.05);  
}  
 

## **5\. Animaciones de Horror**

Las animaciones de horror son las mas psicologicamente complejas del diseno. Deben ser suficientemente inquietantes para provocar tension sin ser tan agresivas como para causar malestar real o problemas de accesibilidad. El principio rector: el horror que se SUGIERE siempre es mas efectivo que el que se MUESTRA.

| Animacion | Duracion | Descripcion psicologica |
| :---- | :---- | :---- |
| Latido de fondo | Loop 2s ease-in-out | Pulsacion muy sutil de brillo/contraste — el corazon que late en las paredes |
| Texto que parpadea | Loop irregular 3-8s | Opacity 1 → 0.85 → 1 con duracion aleatoria — la luz que falla |
| Elemento que se 'mueve' en periferia | Loop lento 8-12s | Elemento decorativo con movimiento muy lento en los bordes del viewport |
| Efecto de presencia | 500ms al hover | La sombra del elemento crece y se vuelve mas densa — como si algo se acercara |
| Texto que se corrompe al hover | 300ms scramble | Los caracteres se sustituyen brevemente antes de volver a la normalidad |
| Distorsion de imagen | 400ms ease-in | filter: distort con feTurbulence animado al hover — la realidad que se dobla |
| Aparicion espectral | 800ms ease-out | Fade de opacity \+ desenfoque que se resuelve — como una aparicion haciendose visible |
| Scroll de revelacion ominosa | Scroll-linked | Elemento que se revela lentamente desde la oscuridad al hacer scroll |
| Cursor de horror | 60fps rAF | Circulo que se expande y contrae como una pupila — o una gota de sangre que sigue |
| Audio trigger (con permiso) | Variable | Sonido sutil de ambiente al entrar en ciertas secciones — SIEMPRE opt-in |

### **5.1  Principios de accesibilidad en horror design**

* PREFERS-REDUCED-MOTION es absolutamente obligatorio — las animaciones de horror pueden causar malestar real

* El flash rapido (\> 3 veces por segundo) puede desencadenar epilepsia fotosensible — NUNCA usar flicker rapido

* Advertencia de contenido (content warning) al inicio de experiencias de horror intensas — es buena practica y respectuosa

* Los efectos de parpadeo de texto deben respetar el umbral de la WCAG: \< 3 Hz (3 veces por segundo) maximos

* Las animaciones de color rojo intenso son especialmente problematicas para personas con fotosensibilidad — moderar su uso

* Proporcionar siempre una forma de desactivar las animaciones mas intensas en la interfaz misma, no solo via prefers-reduced-motion

## **6\. Variables CSS para Horror / Occult**

   
/\* \=== HORROR / OCCULT — CSS CUSTOM PROPERTIES \=== \*/  
   
/\* Abismo de fondos \*/  
\--horror-void:     \#050505;  
\--horror-bg:       \#080308;  
\--horror-surface:  \#100810;  
\--horror-raised:   \#1A0A18;  
   
/\* Colores de horror \*/  
\--horror-blood-dark:  \#3A0000;  
\--horror-blood:       \#8B0000;  
\--horror-crimson:     \#CC1100;  
\--horror-purple:      \#3D005A;  
\--horror-bone:        \#F0EAD6;  
\--horror-spectral:    \#F0F0F8;  
\--horror-green-rot:   \#1A3D00;  
\--horror-amber-sick:  \#4A3C00;  
   
/\* Texto \*/  
\--horror-text:        \#E8E0E8;  
\--horror-text-soft:   \#908090;  
\--horror-text-blood:  \#CC3333;  
   
/\* Gradientes de horror \*/  
\--horror-abyss:    radial-gradient(ellipse at 50% 0%, \#1A0A18 0%, \#050505 60%);  
\--horror-hellfire: radial-gradient(ellipse at 50% 100%, \#3A0000 0%, \#050505 50%);  
\--horror-vortex:   conic-gradient(from 0deg at 50% 50%, \#050505, \#1A0028, \#050505, \#1A0028, \#050505);  
   
/\* Sombras y glows \*/  
\--horror-glow-blood:  0 0 20px rgba(139,0,0,0.6), 0 0 60px rgba(80,0,0,0.2);  
\--horror-glow-purple: 0 0 20px rgba(61,0,90,0.7), 0 0 50px rgba(40,0,60,0.2);  
\--horror-drip-shadow: 0 4px 0 rgba(139,0,0,0.8), 0 8px 0 rgba(100,0,0,0.5), 0 16px 0 rgba(60,0,0,0.3);  
   
/\* Filtros de imagen \*/  
\--filter-horror:   grayscale(0.3) contrast(1.3) brightness(0.7) saturate(0.6);  
\--filter-cursed:   grayscale(0.5) sepia(0.3) contrast(1.4) brightness(0.65);  
\--filter-vhs:      contrast(1.1) saturate(0.75) brightness(0.9);  
   
/\* Tipografia \*/  
\--font-display:  'UnifrakturMaguntia', 'Crimson Text', Georgia, serif;  
\--font-horror:   'Alfa Slab One', 'Rockwell Extra Bold', Georgia, serif;  
\--font-body:     'IM Fell English', 'Lora', Georgia, serif;  
\--font-occult:   'Josefin Sans', 'Raleway', Arial, sans-serif;  
\--font-terminal: 'Share Tech Mono', 'VT323', monospace;  
   
/\* Escala \*/  
\--fs-display:  clamp(3rem, 10vw, 10rem);  
\--fs-body:     1.0625rem;  
\--lh-horror:   1.7;  
   
/\* Transiciones \*/  
\--t-horror:    500ms cubic-bezier(0.4, 0, 0.2, 1);  
\--t-pulse:     2s ease-in-out;  
 

## **7\. Anti-patrones del Horror / Occult Design**

* NUNCA usar efectos de parpadeo rapido (\> 3 Hz) — riesgo real de desencadenar episodios en personas con epilepsia fotosensible

* NUNCA horror sin content warning en experiencias intensas — el respeto por la audiencia es parte del diseno etico

* NUNCA el horror superficial — calaveras y sangre sin concepto son decoracion de Halloween barata, no horror design

* NUNCA representacion realista de violencia, gore extremo o trauma sin proposito narrativo claro y audiencia adulta verificada

* NUNCA horror que pretende ser otra cosa — si el contenido es aterrador, debe ser presentado con transparencia

* NUNCA sonido que se inicia sin permiso del usuario — en horror design, el audio es especialmente impactante y requiere opt-in

* NUNCA confundir el horror efectivo con el gore gratuitamente — el dread psicologico es mas poderoso y mas respetuoso

* NUNCA usar iconografia cultural o religiosa real de comunidades especificas sin entender su significado y sus implicaciones

* NUNCA olvidar que prefers-reduced-motion no es solo comodidad — en horror design con animaciones intensas, es una necesidad medica

