# Walkthrough: Onboarding de Alto Rendimiento estilo Pulso / Fitia (Vital Fit)

Se ha completado e implementado con éxito la **arquitectura integral de Onboarding y Anamnesis Clínica** inspirada fielmente en **Pulso** y **Fitia**, respetando los estándares visuales de las 30 referencias fotográficas proporcionadas por el usuario.

---

## 1. Arquitectura de Pantallas (27 Micro-Screens)

El wizard de bienvenida ha sido reconstruido bajo una arquitectura de **una única intención por pantalla**, eliminando la fatiga cognitiva del usuario:

| Paso | Micro-Screen | Componentes y Comportamiento |
|---|---|---|
| **01** | **Nombre / Apodo** | Hero input centrado con cursor auto-focus, botón de borrado rápido y nota al pie sobre edición posterior. |
| **02** | **Propósito** | Cards con selección múltiple (hasta 2 objetivos): *Perder grasa, Ganar músculo, Salud y longevidad, Rendimiento deportivo*. |
| **03** | **Sexo Biológico** | Selector dual (Hombre / Mujer) con icono y descripción sobre cálculo de tasa metabólica basal (BMR). |
| **04** | **Fecha de Nacimiento** | Drum / Wheel Picker interactivo con tres columnas (Día, Mes, Año) y cálculo automático de edad en tiempo real. |
| **05** | **Estatura** | Switch dinámico `cm` / `ft + in` con indicador visual de silueta y slider preciso. |
| **06** | **Peso Actual** | Switch dinámico `kg` / `lbs` con slider interactivo y visualizador de peso de alta legibilidad. |
| **07** | **Peso Deseado** | Input de meta con badge inteligente que calcula el delta dinámico (e.g. *-6.0 kg a perder* o *+4.0 kg a ganar*). |
| **08** | **Porcentaje de Grasa** | 6 avatares anatómicos circulares divididos por rangos (<8%, 9-12%, 13-17%, 18-24%, 25-34%, 35%+) + **Modal de Ajuste Exacto**. |
| **09** | **Actividad Diaria** | Selector de nivel NEAT (*Sedentario, Ligeramente activo, Moderadamente activo, Muy activo*). |
| **10** | **Tipos de Entrenamiento** | Tag cloud interactivo (*Fuerza / Pesas, Crossfit, Running, Calistenia, Natación, Ciclismo, Deportes de combate*). |
| **11** | **Frecuencia Semanal** | Stepper visual (1 a 7 días por semana) para entrenamiento de fuerza. |
| **12** | **Duración de Sesión** | Grid de opciones (30 min, 45 min, 60 min, 90 min, 120+ min). |
| **13** | **Preferencias de Alimentación** | Cards detalladas (*Omnívora, Vegetariana, Vegana, Keto / Cetogénica, Paleolítica, Mediterránea*). |
| **14** | **Alergias e Intolerancias** | Tag cloud de selección múltiple (*Gluten, Lactosa, Frutos secos, Mariscos, Huevo, Soja, Fructosa, Sin alergias*). |
| **15** | **Hábitos de Estilo de Vida** | Chips interactivos (*Fumo habitualmente, Consumo alcohol los fines de semana, Tomo café a diario, Trabajo sentado, etc.*). |
| **16** | **Calidad de Sueño** | Selector de descanso (*Menos de 6h, 6 a 7 horas, 7 a 9h profundo*). |
| **17** | **Nivel de Estrés** | Selector de nivel de cortisol y carga mental (*Bajo, Moderado, Alto*). |
| **18** | **Condiciones y Molestias** | Selección múltiple (*Molestias en hombros, rodillas, zona lumbar, hipertensión, diabetes, ninguna*). |
| **19** | **País y Gastronomía** | Grid de banderas y países para ajustar el contexto gastronómico de los planes de comidas. |
| **20** | **Horarios y Ayuno** | Selector de protocolos de ayuno intermitente (*No realizo ayuno, 16/8 clásico, 14/10 moderado, 18/6 avanzado*). |
| **21** | **Suplementación** | Tag cloud de suplementos (*Creatina monohidratada, Proteína whey, Cafeína, Omega 3, Multivitamínico, Magnesio, Ninguno*). |
| **22** | **Teléfono Mockup & Memoria IA** | Frame de smartphone que simula chat inteligente con la IA clínica + botón para abrir el **Modal "Agregar memoria clínica"**. |
| **23** | **Calorías Recomendadas** | Stepper interactivo `[-] 2874 kcal [+]`, modal de **Evidencia Científica** y modal de **Ajuste Manual de Calorías**. |
| **24** | **Macronutrientes** | Donut Rings circulares con tracks punteados de 20 puntos por macro, selector de presets y modal de **Modificación de Valores**. |
| **25** | **Convergencia al Plan** | Animación de transición donde las 3 tarjetas de objetivos convergen y se guardan dentro de la carpeta del plan. |
| **26** | **Ticker de Carga de 5 Pasos** | Pantalla de procesamiento con 5 iconos secuenciales (analizando perfil, balance energético, periodización de macros, sincronización clínica). |
| **27** | **Resumen Final de Entrega** | Panel completo de prescripción nutricional y actividad con el botón de acceso directo **"Comenzar en Vital Fit"**. |

---

## 2. Modales Interactivos de Alta Precisión

1. **Modal de Agregar Memoria Clínica (Paso 22):**
   - Permite al atleta o entrenador registrar notas específicas (e.g. *"Tiendo a tener atracones nocturnos los domingos"* o *"Entreno en ayunas los martes"*).
2. **Modal de Evidencia Científica (Paso 23):**
   - Desglosa la formulación matemática de Mifflin-St Jeor, factores de actividad y modulación adaptativa.
3. **Modal de Ajuste Manual de Calorías (Paso 23):**
   - Slider y display numérico con advertencia clínica clara: *"Este valor puede ser modificado posteriormente por tu entrenador según tu progreso real"*.
4. **Modal de Modificación de Macros (Paso 24):**
   - Ajuste independiente de gramos de Proteína, Carbohidratos y Grasas con recálculo automático de calorías y validación porcentual.
5. **Modal de Porcentaje Graso Exacto (Paso 08):**
   - Permite ingresar un valor decimal exacto de bioimpedancia o plicometría en lugar de seleccionar un rango visual.

---

## 3. Experiencia y Hard Gatekeeper Multimodo

- **Aislamiento Visual:** Cuando el usuario está en `/onboarding`, la barra lateral (`Sidebar`), la navegación móvil (`MobileNav`), los asistentes flotantes y las notificaciones se ocultan completamente para ofrecer una experiencia limpia e inmersiva.
- **Escape Hatch para Entrenadores:** En la cabecera del onboarding, si el usuario tiene el rol de entrenador o superadmin y está probando el flujo en *Modo Atleta*, dispone del botón **"Modo Coach"** para salir al dashboard del entrenador inmediatamente sin quedar atrapado.
- **Bloqueo Estricto:** Los atletas con `onboardingCompleted === false` son redirigidos automáticamente a `/onboarding` sin poder acceder a rutas protegidas.

---

## 4. Verificación y Despliegue en Tiempo Real

- **Backend (`olympus-bite-bk`):**
  - Compilación: `npm run build` completado con código `0` (Prisma Client regenerado y NestJS compilado).
  - API online en: `http://localhost:3000/api/v1`
  - Validaciones de clase (`OnboardingSubmissionDto`) probadas y activas.
- **Frontend (`olympus-bite-ft`):**
  - Chequeo de tipos: `npx tsc --noEmit` completado con código `0` (0 errores).
  - Servidor Next.js online en: `http://localhost:3001`
  - Ruta `/onboarding` responde con código HTTP `200 OK`.
- **Servidores PM2:**
  - `vitalfit-backend`: En línea.
  - `vitalfit-frontend`: En línea.
  - Scripts `./iniciar.sh` y `./detener.sh` configurados con persistencia de socket en el workspace.
