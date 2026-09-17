# 🚀 Resumen Ejecutivo y Guía de Merge para David: Onboarding Clínico & Pulso UI (Vital Fit)

**Rama:** `feature/dani-mejoras`  
**Destino:** `main`  
**Autor:** Danilo (<quinteroar.018@gmail.com>) & Equipo Vital Fit  
**Fecha:** Septiembre 2026  

---

## 🎯 1. Objetivo del Release

Implementar el nuevo flujo integral de **Evaluación Inicial / Anamnesis Deportiva** y **Prescripción Nutricional Inteligente** en Vital Fit, bajo una interfaz gráfica de vanguardia inspirada en **Pulso** y **Fitia** (27 micro-pantallas de alta fidelidad, animaciones fluidas, controles táctiles y feedback clínico en tiempo real).

Asimismo, este release garantiza:
1. **Inviolabilidad de datos (Zero Data Loss):** Ninguna tabla de Supabase fue reiniciada ni borrada. Los cambios de esquema fueron aplicados de forma aditiva no destructiva (`npx prisma db push`).
2. **Hard Gatekeeper Infranqueable:** Atletas sin onboarding completado son interceptados y aislados en `/onboarding` sin acceso a rutas internas hasta completar su perfil.
3. **Compatibilidad Multimodo (Escape Hatch para Entrenadores):** Los entrenadores y administradores pueden testear el flujo de atletas en cualquier momento y regresar a su rol de coach mediante el botón "Modo Coach" sin quedar atrapados.
4. **Director Clínico Híbrido:** Cálculo de Tasa Metabólica Basal (Mifflin-St Jeor), modulación adaptativa con Gemini 2.5 Flash según cortisol, digestión y sueño, respaldado por un motor determinista científico de contingencia.

---

## 📂 2. Documentos de Referencia Incluidos en esta Rama

| Documento | Ubicación | Descripción |
|---|---|---|
| **Diseño Pulso UI** | [`docs/PULSO_UI_DESIGN_SYSTEM.md`](./PULSO_UI_DESIGN_SYSTEM.md) | Especificación de las 27 micro-screens, tokens visuales, modales, transiciones y componentes interactivos. |
| **Plan de Implementación** | [`docs/PLAN_IMPLEMENTACION_ONBOARDING_CLINICO.md`](./PLAN_IMPLEMENTACION_ONBOARDING_CLINICO.md) | Plan técnico completo de arquitectura hexagonal, DTOs, casos de uso y sincronización transaccional. |
| **Walkthrough Técnico** | [`docs/WALKTHROUGH_PULSO_ONBOARDING.md`](./WALKTHROUGH_PULSO_ONBOARDING.md) | Bitácora de ejecución, pruebas de compilación y verificación de endpoints. |
| **Innovación Food Scanner** | [`docs/INNOVACION_FOOD_SCANNER_PRECISION_Y_UX.md`](./INNOVACION_FOOD_SCANNER_PRECISION_Y_UX.md) | Fundamentación científica del 75% al 95% de precisión, carga dual (cámara/galería) y dashboard multimodal. |

---

## 🛠️ 3. Cambios Clave por Módulo

### A. Base de Datos (PostgreSQL Supabase via Prisma)
- Se añadieron columnas no destructivas a la tabla `users`:
  - `target_protein` (`Float?`): Gramos objetivo de proteína diaria.
  - `target_carbs` (`Float?`): Gramos objetivo de carbohidratos diarios.
  - `target_fats` (`Float?`): Gramos objetivo de grasas diarias.
  - `weight_unit_preference` (`String`, default `'kg'`): Preferencia métrica (`kg` / `lbs`).
  - `gender` (`String?`): Sexo biológico (`male` / `female`).
  - `age` (`Int?`): Edad calculada a partir de fecha de nacimiento.
  - `anamnesis_data` (`Json?`): Almacenamiento íntegro de la respuesta del onboarding para auditoría y reajustes clínicos.

### B. Backend (`olympus-bite-bk`)
- **DTO:** `OnboardingSubmissionDto` con validaciones de clase exhaustivas (`class-validator`).
- **Caso de Uso:** `ProcessOnboardingUseCase`:
  - Conversión métrica canónica (`lbs` -> `kg`).
  - Ecuación Mifflin-St Jeor diferenciada por sexo.
  - Factor de actividad física y duración de sesiones.
  - Ajuste de déficit o superávit calórico según meta deportiva.
  - Consulta asíncrona a **Gemini 2.5 Flash** para modulaciones clínicas de cortisol y lesiones.
  - Creación transaccional del primer log en `DailyStressLog`.
- **Endpoint HTTP:** `POST /api/v1/users/:id/onboarding` (retorna `{ success: true, data: { user, clinicalPlan } }`).

### C. Frontend (`olympus-bite-ft`)
- **27 Micro-Screens (`app/(app)/onboarding/page.tsx`):**
  - Selectores ergonómicos: Drum Wheel Picker para fecha de nacimiento, switches dinámicos de unidades, sliders reactivos, badges con deltas matemáticos.
  - Visualización anatómica: 6 cards corporales (<8% a >35%) y modal de porcentaje de grasa exacto.
  - Mockup interactivo de teléfono con simulación de chat IA y modal de memoria clínica del atleta.
  - Stepper de calorías `[-] 2874 kcal [+]`, modal de evidencia científica y modal de ajuste manual con aviso de entrenador.
  - Donut rings circulares de macronutrientes con pistas punteadas de 20 puntos por macro y modal de reconfiguración.
  - Animación de convergencia de tarjetas hacia la carpeta del plan.
  - Ticker de 5 pasos con iconos animados durante el cálculo de la IA.
  - Resumen final de entrega con botón directo al dashboard.
- **Aislamiento en Layout (`app/(app)/layout.tsx`):**
  - En la ruta `/onboarding`, no se renderizan sidebars, mobile navs ni widgets externos para una experiencia 100% inmersiva.
- **Servicio de Clientes (`features/clients/services/clients.service.ts`):**
  - Tipos actualizados para soportar todos los campos del nuevo onboarding.
- **Gestión de Sesión (`features/auth/hooks/useAuth.tsx`):**
  - `updateUser()` sincroniza reactivamente en memoria y `localStorage` para liberar el bloqueo inmediatamente al culminar.
- **Escáner de Comidas y Precisión IA (`features/meals/components/FoodScanner.tsx`):**
  - Entrada Híbrida: Cuadro de texto permanente con botón integrado de dictado por voz y streaming en tiempo real, tolerante a restricciones de permisos.
  - Revelación Progresiva: Colapso de más de 25 chips estáticos en una barra elegante de 3 píldoras on-demand (`[🔥 Cocción]`, `[✋ Porción Mano]`, `[🥤 Bebidas]`) con feedback visual activo.
  - Eliminación de Sobrecarga: Depuración de tarjetas redundantes de contexto técnico para dejar el botón de *"Analizar comida"* a la vista directa sin scroll, acompañado de una micro-línea de calibración de perfil.


---

## 📋 4. Pasos para que David realice el Merge y Despliegue

### Paso 1: Revisión y Fetch de la Rama
```bash
git fetch origin
git checkout feature/dani-mejoras
git pull origin feature/dani-mejoras
```

### Paso 2: Verificación de Compilación Local
```bash
# 1. Backend
cd olympus-bite-bk
npm run build   # Debe terminar con código 0

# 2. Frontend
cd ../olympus-bite-ft
npx tsc --noEmit # Debe reportar 0 errores
```

### Paso 3: Merge a `main`
```bash
git checkout main
git pull origin main
git merge feature/dani-mejoras --no-ff -m "feat: merge clinical onboarding and pulso ui design system"
git push origin main
```

### Paso 4: Despliegue en Servidor / Producción
```bash
# En el servidor de producción:
git pull origin main

# Sincronización de base de datos segura (SIN BORRAR NADA):
cd olympus-bite-bk
npx prisma generate
npx prisma db push

# Recompilar y reiniciar PM2:
npm run build
cd ../olympus-bite-ft
npm run build
cd ..
./iniciar.sh
```

---

## 🔒 5. Garantía de Estabilidad
- Base de datos preservada íntegramente.
- Todos los tipos TypeScript están alineados entre Backend y Frontend.
- Scripts `./iniciar.sh` y `./detener.sh` actualizados para gestionar PM2 de forma confiable dentro del entorno.
