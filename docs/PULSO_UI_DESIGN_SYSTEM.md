# Sistema de Diseño UI/UX: Anamnesis Tipo Pulso / Fitia (Vital Fit)

Este documento recopila de manera detallada todos los patrones de interfaz, componentes, flujos y animaciones observados en las referencias de **Pulso** para implementar una experiencia de onboarding visualmente impactante, fluida y de estándar mundial en **Vital Fit**.

---

## 1. Principios de Interfaz y Experiencia (UX)

```
┌────────────────────────────────────────────────────────┐
│  <  [══════════════════════════]  Paso 4 de 12          │ <- Header: Flecha Atrás + Barra de Progreso Fina
├────────────────────────────────────────────────────────┤
│                                                        │
│             ¿Cuál es tu peso actual?                  │ <- Título Centrado (text-2xl / bold)
│   Tu peso es importante para crear un plan a tu medida │ <- Subtítulo explicativo / contexto
│                                                        │
│                                                        │
│                       85 kg                            │ <- Hero Input / Tipografía Gigante
│                                                        │
│               [   1   ][   2   ][   3   ]              │ <- Keypad o Selector Táctil Ergonómico
│               [   4   ][   5   ][   6   ]              │
│               [   7   ][   8   ][   9   ]              │
│               [       ][   0   ][   ⌫   ]              │
│                                                        │
├────────────────────────────────────────────────────────┤
│             ℹ️ Podrás cambiarlo desde tu perfil         │ <- Banner de tranquilidad / contexto
│         [                  Siguiente                 ] │ <- Botón Sticky de Ancho Completo
└────────────────────────────────────────────────────────┘
```

### Reglas Clave de Diseño:
1. **Una intención por pantalla (Micro-steps):**
   * Cada pantalla se enfoca en responder una sola pregunta o grupo conceptual homogéneo. Cero saturación cognitiva.
2. **Jerarquía Visual Inmersiva:**
   * **Header fijo:** Botón `<` (volver atrás) a la izquierda, barra de progreso superior de 2px a 3px con animación fluida entre pasos.
   * **Tipografía protagonista:** Título legible con subtítulo secundario explicativo.
   * **Hero Value:** Valores como peso, edad o estatura se muestran en fuentes grandes (`text-6xl` a `text-7xl`) con su unidad al lado.
3. **Sliders Interactivos con Etiquetas Dinámicas:**
   * Para el peso objetivo, el slider altera en tiempo real la etiqueta inferior:
     * Peso idéntico $\rightarrow$ **`Recomposición corporal`**
     * Peso menor $\rightarrow$ **`Pérdida moderada`** o **`Pérdida considerable`**
     * Peso mayor $\rightarrow$ **`Ganancia muscular / Superávit`**
   * Opción secundaria en texto sutil: *"No sé cuál es mi peso objetivo"*.
4. **Tarjetas Táctiles Multiselección y Selección Única:**
   * Contenedor con bordes redondeados amplios (`rounded-2xl`).
   * Icono representativo a la izquierda en cápsula sutil.
   * Título en negrita + subtítulo descriptivo (ej: *"Longevidad, hábitos y salud preventiva"*).
   * Checkbox / radio discreto a la derecha.
   * **Comportamiento exclusivo:** La opción *"Ninguna de las siguientes"* o *"Sin dolor"* desmarca automáticamente el resto y viceversa.
5. **Caja con Línea Discontinua (Dashed Button):**
   * Botón estilizado con borde punteado: `+ Añadir otra condición o patología`.
6. **Banner Informativo de Tranquilidad:**
   * Cápsula azulada / neutral: `ℹ️ Podrás cambiarlo cuando quieras desde tu perfil`.
7. **Botón Fijo Inferior (Sticky Bottom Action):**
   * Botón `Siguiente` / `Continuar` siempre visible en la parte inferior, con esquinas redondeadas y estado deshabilitado si falta el dato obligatorio.

---

## 2. Mapa Detallado de Pantallas (Desglose Pulso para Vital Fit)

| Pantalla | Pregunta Principal | Tipo de Componente | Feedback Contextual |
| :--- | :--- | :--- | :--- |
| **01. Nombre** | *¿Cómo te gustaría que te llamemos?* | Input de texto con botón de borrar `(x)` | *"Puedes usar tu nombre o un apodo"* + Banner inferior *"Podrás cambiarlo cuando quieras desde tu perfil"* |
| **02. Propósito** | *Cuéntanos para qué quieres usar Vital Fit* | Tarjetas de 2 columnas con iconos | *"Puedes elegir hasta 2 propósitos"* (Grasa/músculo, Longevidad, Digestión, Energía, Rendimiento) |
| **03. Sexo** | *¿Cuál es tu sexo biológico?* | 2 tarjetas grandes (Hombre / Mujer) | Auto-avance al tocar la opción |
| **04. Fecha de Nacimiento / Edad** | *Indica tu fecha de nacimiento* | Selector tipo Drum / Wheel Picker (Día, Mes, Año) o Keypad numérico para edad | *"Tu edad influye en tu metabolismo y en tus necesidades nutricionales"* |
| **05. Estatura** | *¿Cuál es tu estatura?* | Hero number grande en `cm` con selector o slider táctil | *"La usaremos para estimar tu gasto calórico y superficie corporal"* |
| **06. Peso Actual** | *¿Cuál es tu peso actual?* | Hero number grande con switch `[ kg \| lbs ]` | *"Tu punto de partida para diseñar tu estrategia nutricional"* |
| **07. Porcentaje de Grasa Corporal** | *¿Cuál es tu porcentaje de grasa corporal?* | Grid 3 columnas de avatares circulares con siluetas anatómicas (<8%, 9-14%, 15-19%, 20-24%, 25-29%, 30-34%, 35-39%, 40%+) | *"Elige la imagen que se aproxime a tu contextura"* + Botón *"Ingresar porcentaje exacto"* |
| **08. Peso Meta** | *¿Cuál es tu objetivo de peso?* | Slider continuo interactivo con thumb | Badge dinámica: `Recomposición`, `Déficit moderado`, `Pérdida considerable`, `Ganancia muscular` + botón *"No sé mi peso objetivo"* |
| **09. Comportamiento del Peso** | *¿Cómo se ha comportado tu peso recientemente?* | Lista de tarjetas táctiles (Estable, Fluctuante, Aumentando, Disminuyendo) | *"Nos ayuda a identificar tu adaptabilidad y tendencia metabólica"* |
| **10. Tipo de Actividad Física** | *¿Qué tipo de actividad física realizas?* | Tarjetas multiselección con checkboxes: Cardio, Ejercicio de fuerza, Ninguna (exclusivo) | *"Puedes elegir más de una opción"* |
| **11. Frecuencia de Fuerza** | *¿Con qué frecuencia realizas ejercicio de fuerza?* | Lista vertical de radios (1 a 7 veces por semana) | Se muestra si seleccionó fuerza en el paso anterior |
| **12. Duración de la Sesión** | *¿Cuánto dura tu sesión promedio?* | Hero number grande (`min`) + Slider continuo con marcas (30, 45, 60, 75, 90, 120 min) | *"Elige el nivel que mejor describa tu rutina actual"* |
| **13. Preferencias Alimenticias** | *¿Tienes preferencias alimenticias?* | Nube de cápsulas interactivas con emojis (Vegano, Vegetariano, Pescetariano, Bajo en azúcar, Sin fritos, etc.) + `+ Escribir otra opción` | Contador de *"X memorias guardadas"* |
| **14. Alergias e Intolerancias** | *¿Tienes alergias, celiaquía o intolerancias?* | Nube de cápsulas con selección visual activa (fondo azul vibrante) + `+ Escribir otra opción` | Excluye alérgenos del plan nutricional |
| **15. Memorias y Contexto Libre** | *Usa las memorias para contarle a Vital Fit todo lo que tiene que saber sobre ti* | Burbuja de notas / Textarea elegante con sugerencias de hábitos | Permite agregar notas libres que la IA procesará |
| **16. Rendimiento** | *¿Qué aspecto de tu rendimiento quieres priorizar?* | Tarjetas seleccionables con iconos (Recuperación, Rendimiento aeróbico, Fuerza máxima, Energía constante) | *"Adaptaremos la carga de carbohidratos e hidratación"* |
| **17. Salud Clínica / Patologías** | *Cuéntanos un poco sobre tu salud* | Scrollable card list con checkboxes (Hipertensión, Diabetes, Colesterol, Tiroides, Medicación, Asma, Ninguna) + botón con borde punteado `+ Añadir otra condición` | *"Tu seguridad médica es nuestra prioridad"* |
| **18. Biomecánica** | *Molestias articulares o limitaciones físicas* | Tarjetas de zonas corporales (Hombros, Lumbar, Rodillas, Cuello, Muñecas, Sin molestias) | Previene lesiones en la prescripción deportiva |
| **19. Actividad Diaria NEAT** | *¿Cómo es tu nivel de movimiento diario?* | 3 tarjetas (Sedentario, De pie / Activo ligero, Físicamente exigente) | *"Gasto energético no asociado al gimnasio"* |
| **20. Sueño y Nivel de Estrés** | *Calidad de sueño y nivel de estrés* | Selector de horas (<6h, 6-7h, 7-9h reparador) + escala visual de estrés (Bajo, Moderado, Elevado) | *"El cortisol modula la retención de líquidos y pérdida de grasa"* |
| **21. Psicología y Digestión** | *Picos de ansiedad y salud digestiva* | Tarjetas de momentos de ansiedad (Tarde, Noche, Fines de semana, Ninguno) + Tolerancias digestivas + Frecuencia de comidas | *"Para adaptar la frecuencia y densidad de tus platos"* |
| **22. Análisis IA** | *Configurando tu Arquitectura Biológica* | Holograma / Spinner circular pulsante con mensajes clínicos sincronizados | BMR canónico, TDEE, modulación por cortisol y cálculo de macronutrientes |
| **23. Prescripción y Bienvenida** | *¡Bienvenido a Vital Fit!* | Modal / Pantalla de bienvenida con desglose de macros (Proteína g/kg, Carbos, Grasas, Hidratación) y Justificación clínica | Botón principal *"Comenzar mi Plan Vital Fit"* |

---

## 3. Animaciones y Microinteracciones

* **Transición entre pantallas:** Desplazamiento horizontal suave (slide left on next, slide right on back) mediante `framer-motion` o CSS transitions.
* **Feedback táctil:** Al pulsar una tarjeta, leve reducción de escala (`scale: 0.98`) y activación instantánea del borde con acento de color.
* **Slider Háptico:** Barra fluida con gradiente y arrastre elástico.
* **Auto-avance:** En pantallas de selección única (como sexo o nivel de actividad), un retardo de 200ms permite visualizar la selección antes de pasar a la siguiente pantalla sin obligar a tocar "Siguiente".

---

## 4. Especificaciones Visuales de los Nuevos Componentes (Detalle de Capturas)

### A. Selector de Fecha de Nacimiento (Drum / Wheel Picker)
* **Visual:** Selector de 3 columnas (Día, Mes en texto [Ene, Feb, Mar...], Año).
* **Banda de selección:** Contenedor horizontal central translúcido con esquinas redondeadas (`bg-zinc-800/60` o `bg-blue-500/10`) que enmarca los valores activos con tipografía en negrita (`font-bold text-xl`).
* **Cálculo automático:** Convierte la fecha seleccionada en la edad en años para el cálculo metabólico sin fricción para el usuario.

### B. Selector Visual de Grasa Corporal (Siluetas Anatómicas)
* **Grid:** 3 columnas de círculos anatómicos elegantes.
* **Rangos:** `Menor a 8%`, `9-14%`, `15-19%`, `20-24%`, `25-29%`, `30-34%`, `35-39%`, `40% o más`.
* **Estado seleccionado:**
  * Borde circular con halo azul/acento (`ring-4 ring-blue-500` / `ring-red-500`).
  * Checkmark circular azul con tilde blanco centrado sobre el avatar.
* **Acción secundaria:** Botón tipo cápsula sutil `Ingresar porcentaje exacto` para atletas que se hayan realizado DEXA, plicometría o bioimpedancia (InBody).

### C. Duración de la Sesión Promedio
* **Visual:** Hero number `90 min` en tipografía ultra destacada (`text-6xl font-black`).
* **Control:** Slider horizontal suave con ticks/puntos indicadores para 30, 45, 60, 75, 90, 120 min.
* **Thumb táctil:** Botón deslizador circular translúcido con borde sutil y halo.

### D. Nube de Cápsulas (Pill Tags) de Preferencias y Alergias
* **Distribución:** Flex wrap centrado/orgánico con pastillas redondeadas (`rounded-full py-2.5 px-4`).
* **Estado inactivo:** Fondo gris neutro suave (`bg-zinc-800/80` o `bg-neutral-100`), texto legible y emoji a la izquierda.
* **Estado activo:** Fondo azul eléctrico (`bg-blue-600 text-white font-medium shadow-md shadow-blue-500/20`).
* **Botón punteado:** Cápsula con borde discontinuo `border-dashed border-2 border-zinc-600` para `+ Escribir otra opción` (abre input modal dinámico).
* **Contador inferior de memorias:** Indicador contextual dinámico `X memorias` sobre el botón de acción principal.

### E. Pantalla de "Memorias / Contexto Libre" y Modal "Agregar Memoria"
* **Concepto:** Burbujas de notas conversacionales donde el usuario puede escribir cualquier detalle único sobre su estilo de vida (ej: *"Uso la Thermomix para cocinar"*, *"Entreno en ayunas los sábados"*).
* **Modal / Bottom Sheet "Agregar memoria":**
  * Header con botón cerrar `×` a la izquierda, título central *"Agregar memoria"* y botón circular `✓` de confirmación en la esquina superior derecha.
  * Input / Textarea minimalista con placeholder *"Escribe una memoria..."* y foco automático.
* **Integración IA:** Estas memorias se envían a Gemini 2.5 Flash para que el Director Clínico las considere al redactar la justificación y los macros.

### F. Hábitos y Estilo de Vida (Nube de Cápsulas)
* **Visual:** Nube fluida de 18+ cápsulas con emojis:
  * 🍽️ Como fuera de casa, 🍬 Antojos dulces, 🍿 Pico entre comidas, 💧 Poca agua, 😴 Duermo menos de 7 h, 💻 Trabajo sentado, 😓 Estrés y comida, 🛵 Delivery frecuente, ⚡ Como rápido, 🌙 Ceno tarde, 👨‍🍳 Cocino poco, 📋 Planifico poco, ⏭️ Me salteo comidas, 🥩 Poca proteína, 🪑 Poca actividad, 🍷 Alcohol semanal, ☕ Tomo mucha cafeína, 📱 Uso pantallas de noche.
* **Contador inferior:** Indicador dinámico `X memorias` sobre el botón Siguiente.

### G. Pantalla Explicativa de Valor con Mockup de Celular (Interludio Pedagógico)
* **Frame de Celular:** Mockup realista con bordes redondeados y notch / dynamic island.
* **Animación interior:** Burbuja de chat simulada que dice *"El coach está escribiendo..."* con tres puntos suspensivos pulsantes animados.
* **Copia pedagógica:**
  * **Título:** *Vital Fit entiende tu estilo de vida y objetivos*
  * **Subtítulo:** *Tu coach conecta tus datos de salud, historial de comidas, actividad, hábitos y suplementos para encontrar patrones y ayudarte a alcanzar tus objetivos.*
* **Botón:** *Continuar* (ancho completo).

### H. Selector de País de Residencia
* **Buscador:** Input superior con icono `🔍 Buscar país`.
* **Sección "Más frecuentes":** Lista de tarjetas con radio buttons y banderas de alta fidelidad:
  * 🇦🇷 Argentina, 🇨🇱 Chile, 🇨🇴 Colombia, 🇪🇨 Ecuador, 🇪🇸 España, 🇺🇸 Estados Unidos, 🇲🇽 México.
* **Auto-selección:** Guarda la procedencia geográfica para adaptar la canasta básica de alimentos y los equivalentes culturales de nutrición en la IA.

### I. Pantalla de Ayuno Intermitente
* **Opciones:**
  * No
  * Sí, 12 horas (12:12)
  * Sí, 14 horas (14:10)
  * Sí, 16 horas (16:8)
  * Sí, 18 horas (18:6)
  * Sí, 20 horas (20:4)
  * OMAD (una comida al día)
* **Formato:** Tarjetas redondeadas verticales con indicador radio circular a la derecha.

### J. Pantalla de Uso de Suplementos e Interludio
* **Pregunta inicial:** *¿Usas suplementos?* (Sí / No en tarjetas táctiles amplias).
* **Interludio pedagógico:** Mockup de teléfono con captura de biblioteca de suplementos (Buscador "Omega", 197 resultados).
* **Copia pedagógica:**
  * *Podrás registrar tus suplementos más adelante: Cuando termines de crear tu plan, podrás registrar qué suplementos tomas y en qué horario. Vital Fit analizará tu nutrición y suplementación para entender mejor tus necesidades.*

### K. Pantalla de Calorías Diarias Recomendadas (Hero Stepper)
* **Visual:**
  * Título: *Calorías diarias recomendadas*
  * Subtítulo: *Te recomendamos esta cantidad de calorías en base a tus objetivos*
  * Label: *Calorías recomendadas*
  * **Hero Stepper:** Botón circular `[-]`, número gigante `2874 kcal` (`text-6xl font-black text-blue-600` / `text-red-500`) y botón circular `[+]`.
* **Aviso de Rigor Profesional y Entrenador:**
  * *La recomendación de calorías se calcula en base a tu información personal y tiene en cuenta el enfoque metabólico y la evidencia científica. Esto puede cambiar dependiendo de lo que te indique tu entrenador y sea mejor para ti.*
* **Cápsula de Evidencia:** Botón `👨‍⚕️ Ver evidencia científica` que despliega el desglose clínico (BMR, factor NEAT, déficit/superávit y ajuste por estrés).

### M. Modal de Evidencia Científica y Justificación Médica
* **Visual:** Sheet / Modal emergente con desenfoque de fondo (`backdrop-blur-md`).
* **Header:** Botón de cierre `×` a la izquierda y avatar circular centrado del Director Clínico IA.
* **Sección "Sobre las calorías":**
  * Texto que explica cómo el cálculo se adapta al objetivo específico (pérdida de grasa, preservación de masa muscular o hipertrofia) y al perfil metabólico del atleta.
* **Sección "Fuentes de referencia":**
  * Citas de evidencia clínica (estudios sobre balance energético, composición corporal y modulación metabólica) que dan soporte técnico al algoritmo.

### N. Pantalla de Distribución de Macronutrientes (Anillos Circulares / Donut Rings)
* **Gráficos superiores:** 3 anillos de progreso circular con porcentajes y gramos:
  * 🟣 **Proteínas:** 25-30% (`text-purple-400`, borde púrpura con halo).
  * 🟠 **Grasas:** 20-30% (`text-amber-500`, borde naranja/ámbar).
  * 🟢 **Carbohidratos:** 40-55% (`text-emerald-400`, borde verde esmeralda o cian).
* **Feedback dinámico:** Subtítulo que cambia según la estrategia seleccionada (ej: *"Distribución estándar..."* vs. *"Menos grasas y más carbohidratos para sostener tu energía diaria"*).
* **Presets:**
  * ⚖️ **Balanceada** (Badge: `RECOMENDADA` en cápsula azul vibrante).
  * 🫒 **Mediterránea**
  * 💪 **Baja en grasas**
  * 🥗 **Baja en carbohidratos**
  * 🥩 **Keto**
* **Acción secundaria:** Botón tipo cápsula `✏️ Ajustar de forma manual`.

### O. Pantalla de Ajuste Manual de Macros (Dotted Track Stepper)
* **Visual:**
  * Contador central: `0 Puntos a distribuir`.
  * Tarjetas de macros independientes:
    * Botón decremento `[-]`, nombre del macro e icono, cantidad en gramos, botón incremento `[+]`.
    * **Barra de puntos discretos:** Línea de 20 círculos indicadores (`● ● ● ● ● ○ ○ ○ ○ ...`) que se llenan según la asignación.
    * Leyenda de densidad energética: `4kcal por gramo` / `9kcal por gramo` y calorías totales derivadas (`864/2874 kcal - 30%`).
* **Acción inferior:** Botón flotante `🎛️ Modificar valores` (abre el modal avanzado).

### P. Modal "Modificar Valores" (Ajuste Avanzado y Asistente IA para Entrenadores)
* **Diseño:** Sheet / Modal de precisión nutricional.
* **Controles:**
  * Switch superior tipo cápsula: `[ Gramos | Porcentaje ]`.
  * Stepper general de calorías: `[-] 2874 kcal [+]`.
  * Indicador en tiempo real: `0% pendiente de distribuir` (alerta en rojo o verde si sobra/falta porcentaje).
  * Steppers individuales por macro (`Proteínas`, `Grasas`, `Carbohidratos`).
  * Leyenda de seguridad metabólica: *Cada macronutriente debe aportar entre 15% y 50% de tus calorías para una distribución equilibrada.*
### Q. Pantalla de Notificaciones y Recomendaciones del Coach
* **Visual:** Tarjeta de notificación push simulada en la parte superior:
  * Icono de app + `☕ Es momento de desayunar • ahora`
  * Subtítulo: *"El desayuno es clave para mantenerte en equilibrio."*
* **Título:** *No te pierdas las recomendaciones de tu coach*
* **Subtítulo:** *El coach te avisa cuando tiene algo importante para contarte*
* **Acciones:**
  * Botón primario: *Permitir notificaciones* (azul vibrante)
  * Botón secundario: *Tal vez después* (gris redondeado)

### R. Pantalla de Mentalidad: "Hora de Romper la Racha"
* **Header:** Iconos de racha con llama de fuego y día fallido tachado (`🚫🔥`).
* **Título:** *Hora de romper la racha*
* **Subtítulo:** *Las rachas funcionan, pero no a tu favor*
* **Tarjetas educativas con rigor científico:**
  * ⚡ **Vital Fit mide consistencia, no perfección:** *Miramos el patrón de tus últimas semanas. Un mal día nunca te vuelve a cero.*
  * 🔻 **Un día fallido no debería hacerte abandonar:** *Las rachas pueden hacer que un tropiezo se sienta como perder todo el progreso.* `[Fuente: False hopes of self-change]`
  * 🧭 **Saltar un día no rompe un hábito:** *Lo que importa es volver, no ser perfecto.* `[Fuente: How are habits formed]`
* **Botón:** *Siguiente*

### S. Animación de Embudo: "Tarjetas Convergiendo en el Documento del Plan" (Signature Animation)
* **Concepto Visual:** Todas las respuestas del atleta (nutrición 🥩, actividad 🚶 6.801, sueño 😴 78, preferencias 🥑, entrenamiento 🏋️, memorias del coach 💬) se materializan como pequeñas tarjetas flotantes en el espacio superior.
* **Coreografía de Animación (`framer-motion`):**
  * Las tarjetas flotan sutilmente con leve rotación y efecto de gravedad cero.
  * Al pulsar el botón o tras 1.5s, las tarjetas inician una trayectoria de absorción en espiral convergiendo hacia el interior de un icono central grande de **Carpeta / Documento azul brillante** (`FileText` / `Folder`).
  * Efecto de pulso y escala (`scale: [1, 1.08, 1]`) en el icono de documento cuando cada tarjeta entra.
* **Copia central:**
  * **Título:** *Todo listo. Vamos a crear tu plan personalizado.*
* **Botón:** *Generar mi plan* (dispara la transición al cálculo IA).

### T. Pantalla de Preparación y Cálculo Clínico IA (Secuencia de 5 Iconos)
* **Visual:** Fondo degradado sutil con 5 iconos clínicos en fila central:
  * 🎯 **Objetivos** | ❤️ **Biometría/Salud** | 📋 **Recomendaciones** | 🎛️ **Metabolismo** | 🪄 **Plan Integral**
* **Animación:** Los iconos se encienden secuencialmente con un spinner de arco azul giratorio (`Loader2` / `motion.div`) y mensaje dinámico:
  * 1️⃣ *Revisando tus objetivos...*
  * 2️⃣ *Organizando tus recomendaciones...*
  * 3️⃣ *Modulando balance metabólico y cortisol...*
  * 4️⃣ *Preparando tu plan personalizado...*

### U. Pantalla Final de Resumen y Entrega del Plan: "¡Tu plan ya está listo!"
* **Header / Ilustración:** Documento del Plan central con las tarjetas de métricas en órbita alrededor.
* **Titular Triunfal:**
  * **¡Tu plan ya está listo, [NOMBRE DEL ATLETA]!**
  * *La IA de Vital Fit usa tu objetivo, hábitos, comidas y métricas para generar una guía diaria personalizada.*

### V. Tarjetas de Metas y Desglose Integral del Plan

#### 1. Nutrición y Rangos de Macros
* **Barra de distribución porcentual:**
  * 🟠 30% Grasas | 🟢 34% Carbohidratos | 🌿 6% Fibra/Micros | 🟣 30% Proteínas
* **Tarjetas colapsables de rangos:**
  * 🔥 **Calorías:** `2874 kcal`
  * 💧 **Grasas:** `94-97 g`
  * 🥣 **Carbohidratos:** `282-292 g`
  * ↔️ **Proteínas:** `212-219 g`

#### 2. Comidas Recomendadas (Recetas Visuales)
* **Carrusel horizontal / Cards:**
  * 🥗 *Ensalada tibia de garbanzos con espinaca y tomate*
  * 🍲 *Tofu salteado con brócoli y quinoa* / *Pechuga de pollo con boniato y verduras*
* **Botón sutil:** *Podrás ver más comidas en tu plan*

#### 3. Micronutrientes Clave (Chips Tabla Periódica)
* **Visual:** Cápsulas cuadradas con esquinas redondeadas tipo elemento químico:
  * 🟩 `Fi` - **Fibra Dietética:** *40.2g por día*
  * 🟪 `Mg` - **Magnesio:** *420mg por día*
  * 🟪 `K` - **Potasio:** *4700mg por día*
  * 🟪 `Fe` - **Hierro:** *8mg por día*
  * 🟪 `I` - **Yodo:** *150mcg por día*

#### 4. Ingredientes Recomendados
* **Tarjetas visuales con emojis y badges:**
  * 🫘 **Frijoles Negros:** *Aporta fibra y saciedad*
  * 🍗 **Pollo / Pescado blanco:** *Proteína de alto valor biológico*

#### 5. Actividad y Guía de Entrenamiento
* **Tarjetas de sesión:**
  * 🏋️ **Fuerza de cuerpo completo:** *90 min • 4 veces por semana*
  * 🚶 **Caminatas activas:** *30 min • 3 veces por semana*
* **Caja de Consejo de Oro:**
  * 💡 *Consejo: Mantén la mayoría de tus sesiones en un ritmo moderado: puedes hablar, pero no cantar.*
* **Disclaimer Clínico y Entrenador:**
  * ℹ️ *Usa Vital Fit como apoyo diario para ordenar tus hábitos y avanzar con más claridad. Tu entrenador supervisará y adaptará tu plan en base a tus resultados y sensaciones.*

---

Este documento queda guardado en la memoria del proyecto como la guía oficial y exhaustiva de diseño para la reconstrucción de la pantalla de onboarding y el gestor nutricional de entrenadores.
