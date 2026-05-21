# 🏋️‍♂️🍽️ **Punto de Inflexión**

> Plataforma integral de **nutrición y entrenamiento** para entrenadores personales y sus clientes.

| | |
|---|---|
| **Frontend** | Next.js 16 + React 19 + TypeScript + Tailwind v4 |
| **Backend** | NestJS 11 + TypeScript + Prisma ORM |
| **Base de Datos** | PostgreSQL (Supabase) |
| **AI** | Google Gemini (análisis de alimentos, recomendaciones) |
| **Push** | Web Push API + `@nestjs/schedule` |

---

## 📑 Tabla de Contenidos

1. [¿Qué es Punto de Inflexión?](#-qué-es-punto-de-inflexión)
2. [Arquitectura General](#-arquitectura-general)
3. [Backend — Arquitectura Hexagonal](#-backend--arquitectura-hexagonal)
4. [Frontend — Screaming Architecture](#-frontend--screaming-architecture)
5. [Base de Datos — Modelo Entidad-Relación](#-base-de-datos)
6. [Flujo de Datos](#-flujo-de-datos)
7. [Patrones y Decisiones Técnicas](#-patrones-y-decisiones-técnicas)
8. [Estructura del Proyecto](#-estructura-del-proyecto)
9. [Características Principales](#-características-principales)
10. [Requisitos e Instalación](#-requisitos-e-instalación)
11. [Comandos Útiles](#-comandos-útiles)

---

## 🎯 ¿Qué es Punto de Inflexión?

> **Para el entrenador:** Crea rutinas de gym, monitorea la alimentación de tus clientes, asigna tareas diarias y visualiza su progreso en dashboards en tiempo real.

> **Para el cliente:** Registra tus comidas (con foto + análisis IA), sigue tus rutinas de entrenamiento, trackea hábitos diarios, y recibe recomendaciones nutricionales inteligentes.

Todo sincronizado en una interfaz moderna, responsive, con modo oscuro y diseñada para **cero fricción**.

---

## 🏛️ Arquitectura General

```
┌─────────────────────────────────────────────────────┐
│                    CLIENTE (Browser)                 │
│  ┌─────────────────────────────────────────────────┐│
│  │          Next.js 16 — App Router                ││
│  │  ┌──────────────┐  ┌──────────────────────────┐ ││
│  │  │  (auth)/     │  │    (app)/                 │ ││
│  │  │  login       │  │  dashboard, meals,        │ ││
│  │  │  register    │  │  routines, tasks,         │ ││
│  │  │              │  │  clients, profile,        │ ││
│  │  │              │  │  summary, exercises       │ ││
│  │  └──────────────┘  └──────────────────────────┘ ││
│  └─────────────────────────────────────────────────┘│
│                        │ HTTPS                       │
│                   JWT Bearer Token                    │
└────────────────────────┬────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────┐
│            NestJS 11 — API REST /api/v1             │
│                                                      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌───────┐  │
│  │   Auth   │ │  Users   │ │  Meals   │ │Routines│  │
│  ├──────────┤ ├──────────┤ ├──────────┤ ├───────┤  │
│  │Dashboard │ │  Tasks   │ │Notific.  │ │  AI   │  │
│  └──────────┘ └──────────┘ └──────────┘ └───────┘  │
│                                                      │
│  Cada módulo sigue Arquitectura Hexagonal:           │
│  Domain → Application → Infrastructure              │
└────────────────────────┬────────────────────────────┘
                         │
              ┌──────────▼──────────┐
              │    PostgreSQL DB    │
              │   (Supabase)        │
              │   + Prisma ORM      │
              └─────────────────────┘
```

---

## 🧱 Backend — Arquitectura Hexagonal

Cada módulo del backend está diseñado con **Arquitectura Hexagonal** (Ports & Adapters), separando estrictamente el **core de negocio** de los **detalles técnicos**.

### 📁 Estructura por módulo

```
src/modules/[modulo]/
│
├── domain/                    ← 👑 CORAZÓN DEL NEGOCIO
│   ├── entities/              ← Entidades puras (sin dependencias externas)
│   │   └── user.entity.ts     ← User, Meal, Routine, RoutineDay, Exercise...
│   ├── value-objects/
│   │   └── nutritional-info.vo.ts
│   └── ports/                 ← Interfaces / Contratos abstractos
│       ├── user.repository.port.ts
│       ├── meal.repository.port.ts
│       └── food-recognition.port.ts
│
├── application/               ← 🧠 CASOS DE USO
│   ├── use-cases/             ← Cada operación de negocio es una clase
│   │   ├── create-user.use-case.ts
│   │   ├── create-meal.use-case.ts
│   │   └── analyze-food-photo.use-case.ts
│   └── dtos/                  ← Validación con class-validator
│       ├── login.dto.ts
│       └── register.dto.ts
│
└── infrastructure/            ← 🔌 ADAPTADORES (implementaciones)
    ├── adapters/
    │   ├── http/              ← Controladores REST (NestJS)
    │   │   └── users.controller.ts
    │   ├── persistence/       ← Repositorios concretos
    │   │   ├── prisma-user.repository.ts
    │   │   └── in-memory-user.repository.ts
    │   └── ai/                ← Adaptadores externos
    │       ├── gemini-food-recognition.adapter.ts
    │       └── gemini-diet-recommender.adapter.ts
    └── [modulo].module.ts     ← Módulo NestJS que ensambla dependencias
```

### 🔄 Flujo de una petición

```
HTTP Request → Controller → DTO (validación) → Use Case
    ↓                                    ↓
 Puerto (Interface) ←────── Lógica de negocio pura
    ↓
 Adaptador Prisma (implementación concreta)
    ↓
 PostgreSQL
```

### 🧩 Módulos implementados

| Módulo | Entidad(es) Domain | Puertos | Casos de Uso Clave |
|--------|-------------------|---------|-------------------|
| **Auth** | `InvitationCode` | `InvitationCodeRepository` | `login`, `register`, `generateCode` |
| **Users** | `User` (admin/trainer/client) | `UserRepository` | `createUser`, `updateProfile`, `changePassword`, `completeOnboarding` |
| **Meals** | `Meal`, `NutritionalInfo` | `MealRepository`, `FoodRecognition`, `DietRecommender`, `DietChatMessageRepository` | `createMeal`, `analyzeFoodPhoto`, `chatDiet`, `recommendMeal` |
| **Routines** | `Routine`, `RoutineDay`, `Exercise`, `WorkoutLog` | `RoutineRepository`, `ExerciseDictionaryRepository` | `create`, `update`, `evaluate`, `logWorkout` |
| **Dashboard** | — | — | `getStats`, `getClientDashboard`, `updateWaterLog` |
| **Tasks** | `DailyTask` | `TaskRepository` | CRUD tasks, `toggleLog` |
| **Notifications** | `PushSubscription`, `NotificationPreference` | — | `subscribe`, `send`, `schedule` (push) |

### 📦 Código compartido (`src/shared/`)

```
src/shared/
├── domain/
│   ├── base.entity.ts        ← Entidad base: ID (UUID), createdAt, updatedAt
│   ├── repository.port.ts    ← Interfaz genérica CRUD<T>
│   └── result.ts             ← Monad Result<T> (isSuccess, value, error)
│
└── infrastructure/
    ├── prisma/
    │   ├── prisma.service.ts ← Conexión a PostgreSQL vía Prisma
    │   └── prisma.module.ts
    ├── supabase/
    │   └── supabase-storage.service.ts  ← Almacenamiento de imágenes
    ├── decorators/
    │   ├── current-user.decorator.ts    ← @CurrentUser()
    │   └── roles.decorator.ts           ← @Roles('trainer')
    └── filters/
        └── http-exception.filter.ts     ← Manejador global de errores
```

---

## ⚛️ Frontend — Screaming Architecture

El frontend sigue **Screaming Architecture**: la estructura del proyecto comunica inmediatamente el propósito del negocio. Al abrir `features/` sabes que la app trata de: auth, clients, dashboard, meals, routines, tasks, notifications.

### 📁 Estructura

```
src/
├── app/                           ← Next.js App Router
│   ├── (auth)/                    ← Rutas públicas
│   │   ├── login/
│   │   │   └── page.tsx          ← SignInFlow
│   │   └── register/
│   │       └── page.tsx          ← RegisterFlow
│   ├── (app)/                     ← Rutas protegidas (layout con Sidebar)
│   │   ├── dashboard/page.tsx    ← Vista entrenador y cliente
│   │   ├── meals/page.tsx        ← Comidas + escáner IA + chat
│   │   ├── routines/page.tsx     ← CRUD + builder + tracking
│   │   ├── tasks/page.tsx        ← Hábitos diarios + charts
│   │   ├── clients/page.tsx      ← CRUD + códigos + búsqueda
│   │   ├── exercises/page.tsx    ← Diccionario de ejercicios
│   │   ├── summary/page.tsx      ← Resumen detallado por cliente
│   │   └── profile/page.tsx      ← Perfil + edición + contraseña
│   ├── layout.tsx                ← Layout raíz (fonts, providers)
│   ├── page.tsx                  ← Landing page pública (cinematic hero)
│   ├── providers.tsx             ← ThemeProvider + AuthProvider + Settings
│   └── globals.css               ← Tailwind v4 + variables CSS
│
├── features/                      ← 🔥 FEATURES (screaming architecture)
│   ├── auth/
│   │   ├── components/           ← LoginForm, RegisterForm
│   │   ├── hooks/                ← useAuth (context + localStorage)
│   │   ├── services/             ← auth.service.ts, users.service.ts
│   │   └── types/                ← auth.types.ts
│   ├── clients/
│   │   ├── components/           ← ClientProfileModal, OnboardingSurveyModal, ClientAiChat
│   │   └── services/             ← clients.service.ts
│   ├── dashboard/
│   │   ├── components/           ← StatsOverview, ClientsList, WeeklyChart, MacroChart...
│   │   ├── services/             ← dashboard.service.ts
│   │   └── types/                ← dashboard.types.ts
│   ├── meals/
│   │   ├── components/           ← MealCard, FoodScanner, NutritionSummary, MealDetail
│   │   ├── services/             ← meals.service.ts
│   │   └── types/                ← meals.types.ts
│   ├── routines/
│   │   ├── components/           ← RoutineBuilder, RoutineCalendar, WeeklyTracker...
│   │   ├── services/             ← routines.service.ts, exercise-dictionary.service.ts
│   │   └── types/                ← routines.types.ts
│   ├── tasks/
│   │   ├── services/             ← tasks.service.ts
│   │   └── types/                ← tasks.types.ts
│   └── notifications/
│       ├── components/           ← NotificationPrompt
│       ├── lib/                  ← push.ts (Service Worker)
│       ├── services/             ← notifications.service.ts
│       └── types/                ← notifications.types.ts
│
└── shared/                        ← 📦 CÓDIGO COMPARTIDO
    ├── components/
    │   ├── layout/               ← Sidebar, Header, MobileNav (responsive)
    │   └── ui/                   ← Button, Card, Modal, Avatar, Badge, Input...
    ├── contexts/                 ← SettingsContext (tema, layout mode)
    ├── lib/
    │   ├── api.ts                ← HTTP client con JWT automático
    │   ├── utils.ts              ← cn(), formatDate(), getLocalDateString()...
    │   └── constants.ts          ← MEAL_TYPES, MUSCLE_GROUPS, DAYS_OF_WEEK
    └── types/                    ← common.types.ts (User, ApiResponse)
```

### 🔄 Flujo de datos del frontend

```
Page Component (app/*/page.tsx)
       ↓
Feature Components (features/*/components/)
       ↓
Feature Services (features/*/services/)  ← llama al backend
       ↓
Shared API Client (shared/lib/api.ts)    ← fetch con JWT + base URL
       ↓
Backend (http://localhost:3000/api/v1)
```

### 🧠 Estado global

| Contexto | Propósito | Implementación |
|----------|-----------|---------------|
| **AuthProvider** | Autenticación (JWT + user) | `localStorage` (`ob_token`, `ob_user`) |
| **ThemeProvider** | Modo oscuro/claro | `next-themes` |
| **SettingsProvider** | Layout (mini/full) + tema de color | React Context |

---

## 🗄️ Base de Datos

### Modelo Entidad-Relación

```
┌──────────────┐       ┌──────────────────┐
│     User     │       │ InvitationCode   │
│──────────────│       │──────────────────│
│ id (PK)      │──┐    │ id (PK)          │
│ email (UQ)   │  │    │ code (UQ)        │
│ name         │  │    │ trainerId (FK)───┼──┐
│ role         │  │    │ usedByUserId(FK)─┼──┤
│ trainerId(FK)│──┤    │ expiresAt        │  │
│ password     │  │    └──────────────────┘  │
│ weight/height│  │                          │
│ dietaryGoal  │  │    ┌──────────────────┐  │
│ isActive     │  │    │      Meal        │  │
│ createdAt    │  │    │──────────────────│  │
└──────┬───────┘  │    │ id (PK)          │  │
       │          └────│ userId (FK)──────┼──┘
       │               │ name, mealType   │
       │               │ calories, protein│
       │               │ carbs, fat, fiber│
       │               │ imageUrl         │
       │               │ recommendation   │
       │               │ date             │
       │               └──────────────────┘
       │
       │  ┌──────────────────┐   ┌──────────────────┐
       │  │     Routine      │   │   RoutineDay     │
       │  │──────────────────│   │──────────────────│
       │  │ id (PK)          │──▶│ id (PK)          │
       ├──│ trainerId (FK)   │   │ routineId (FK)   │
       ├──│ clientId (FK)    │   │ dayNumber        │
       │  │ name, weekCount  │   │ focusArea        │
       │  │ isFavorable      │   │ isRestDay        │
       │  └──────────────────┘   └────────┬─────────┘
       │                                  │
       │  ┌──────────────────┐            │
       │  │    Exercise      │◄───────────┘
       │  │──────────────────│
       │  │ id (PK)          │
       │  │ routineDayId(FK) │
       │  │ name, muscleGroup│
       │  │ sets, reps       │
       │  │ restSeconds      │
       │  └────────┬─────────┘
       │           │
       │  ┌────────▼─────────┐
       │  │   WorkoutLog     │
       │  │──────────────────│
       │  │ exerciseId (FK)  │
       ├──│ userId (FK)      │
       │  │ weekNumber       │
       │  │ weight, repsDone │
       │  │ setsData (JSON)  │
       │  └──────────────────┘
       │
       │  ┌──────────────────┐   ┌──────────────────┐
       │  │   DailyTask      │   │    TaskLog       │
       │  │──────────────────│   │──────────────────│
       ├──│ userId (FK)      │──▶│ taskId (FK)      │
       │  │ title, icon      │   │ userId (FK)      │
       │  │ order, isActive  │   │ date (YYYY-MM-DD)│
       │  └──────────────────┘   │ completed (true) │
       │                         └──────────────────┘
       │
       │  ┌──────────────────┐   ┌───────────────────────┐
       │  │   WaterLog       │   │ DietChatMessage       │
       │  │──────────────────│   │───────────────────────│
       ├──│ userId (FK)      │   │ userId (FK)           │
       │  │ date (UQ+userId) │   │ role ("user"|"ai")    │
       │  │ amount (vasos)   │   │ content (text)        │
       │  └──────────────────┘   └───────────────────────┘
       │
       │  ┌────────────────────────┐  ┌───────────────────────┐
       │  │NotificationSubscription│  │ NotificationPreference│
       │  │────────────────────────│  │───────────────────────│
       └──│ userId (FK)            │  │ userId (UQ) (FK)      │
          │ endpoint, p256dh, auth │  │ enabled               │
          │ isActive               │  │ breakfastTime (08:00) │
          └────────────────────────┘  │ lunchTime (13:00)     │
                                      │ dinnerTime (20:00)    │
                                      └───────────────────────┘
```

### Tecnología

- **Motor:** PostgreSQL (Supabase)
- **ORM:** Prisma 6.x con generación de tipos automática
- **Migraciones:** `prisma/migrations/` versionadas

---

## 🔄 Flujo de Datos Completo

### Ejemplo: Registro de una comida con foto

```
1. Usuario abre FoodScanner en /app/meals
2. Toma foto con la cámara
3. Foto se envía a POST /api/v1/meals/analyze
4. Backend (GeminiFoodRecognitionAdapter):
   a. Envía imagen a Google Gemini
   b. Gemini devuelve: nombre, calorías, macros, alimentos
5. Se crea Meal en BD con los datos analizados
6. Gemini también genera una recomendación nutricional
7. Frontend refresca la lista de comidas del día
8. Nutrición se actualiza en el resumen del dashboard
```

### Ejemplo: Creación de rutina

```
1. Entrenador abre RoutineBuilder en /app/routines
2. Selecciona cliente, asigna nombre y duración (semanas)
3. Agrega días y ejercicios (desde diccionario o nuevos)
4. POST /api/v1/routines → crea Routine + RoutineDays + Exercises
5. Cliente ve la rutina en su vista personal
6. Cada semana puede loggear progreso (peso, reps, sets)
7. Entrenador ve el progreso en el dashboard
```

---

## 🧠 Patrones y Decisiones Técnicas

### Backend

| Patrón | Uso |
|--------|-----|
| **Arquitectura Hexagonal** | Todos los módulos (domain/application/infrastructure) |
| **Dependency Injection** | NestJS DI + `@Inject(TOKEN)` para puertos |
| **Repository Pattern** | `UserRepositoryPort`, `MealRepositoryPort`, `RoutineRepositoryPort` |
| **Use Case Pattern** | Cada operación de negocio es una clase inyectable |
| **DTO + Validation** | `class-validator` + `ValidationPipe` global |
| **Strategy Pattern** | In-memory ↔ Prisma repositorios intercambiables |
| **Result Monad** | `Result<T>` para manejo funcional de errores |
| **Cascade Delete** | Prisma relaciones en cascada (routine → days → exercises) |
| **Singleton Pattern** | PrismaService como singleton global |

### Frontend

| Patrón | Uso |
|--------|-----|
| **Screaming Architecture** | `features/` — cada carpeta = un dominio del negocio |
| **Feature-based modules** | Cada feature auto-contiene components/services/types |
| **Composition Pattern** | Páginas componen features que componen shared UI |
| **Custom Hooks** | `useAuth`, hooks locales en cada página |
| **Optimistic Updates** | Tasks: toggle sin esperar respuesta del server |
| **SVG Charts inline** | Charts de rendimiento sin librerías externas |
| **CSS Variables + Tailwind v4** | Temas de color dinámicos (emerald por defecto) |
| **Responsive Design** | Sidebar (desktop) + MobileNav (mobile) |
| **Client-side Auth** | localStorage con JWT, sin Server Components de auth |

---

## 📁 Estructura del Proyecto

```
/
├── olympus-bite-ft/          ← Frontend (Next.js)
│   ├── app/                  ← App Router + Layouts + Pages
│   ├── features/             ← Feature modules
│   │   ├── auth/
│   │   ├── clients/
│   │   ├── dashboard/
│   │   ├── meals/
│   │   ├── notifications/
│   │   ├── routines/
│   │   └── tasks/
│   ├── shared/               ← Código compartido
│   │   ├── components/
│   │   │   ├── layout/       ← Sidebar, Header, MobileNav
│   │   │   └── ui/           ← Button, Card, Modal, Avatar...
│   │   ├── contexts/         ← SettingsContext
│   │   ├── lib/              ← api.ts, utils.ts, constants.ts
│   │   └── types/            ← common.types.ts
│   ├── public/               ← manifest.json, sw.js
│   ├── package.json
│   └── tsconfig.json
│
├── olympus-bite-bk/          ← Backend (NestJS)
│   ├── prisma/
│   │   ├── schema.prisma     ← Modelo de datos
│   │   └── migrations/       ← Migraciones SQL
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── meals/
│   │   │   ├── routines/
│   │   │   ├── dashboard/
│   │   │   ├── tasks/
│   │   │   └── notifications/
│   │   ├── shared/
│   │   │   ├── domain/       ← BaseEntity, Result, RepositoryPort
│   │   │   └── infrastructure/ ← Prisma, Supabase, Decorators, Filters
│   │   ├── main.ts
│   │   └── app.module.ts
│   ├── package.json
│   └── tsconfig.json
│
└── README.md                 ← Este archivo
```

---

## ✨ Características Principales

### 🔐 Autenticación y Roles
- Registro con **código de invitación** seguro (un solo uso, 7 días)
- Roles: **admin**, **trainer**, **client**
- JWT almacenado en localStorage
- Login/registro con flujos UI pulidos

### 📊 Dashboard Dual
- **Vista Entrenador:** stats globales, clientes activos, calorías promedio, tendencias semanales, distribución de macros, top foods, actividad reciente
- **Vista Cliente:** progreso personal, calorías del día, macros, peso, estatura, racha de hábitos

### 🍽️ Gestión de Comidas
- Registro manual o mediante **foto con IA** (Gemini detecta alimentos, calcula macros)
- **Chat nutricional** con IA para recomendaciones personalizadas
- Clasificación por tipo de comida (desayuno, almuerzo, cena, snack)
- Resumen diario de calorías y macros con progreso visual
- Vista para entrenador: monitorear comidas de todos los clientes

### 🏋️ Sistema de Rutinas
- **Builder visual** con días, ejercicios, series, repeticiones, descansos
- Vista **calendario** y vista **tarjetas**
- **Seguimiento semanal** por sets (peso, reps, completado)
- **Evaluación** de rutina (favorable/desfavorable)
- Progreso visual por día y global

### ✅ Hábitos Diarios (Tasks)
- Checklist interactivo con check animado
- Emojis personalizables por hábito
- **Racha** de días consecutivos
- **Gráfico SVG** de rendimiento (últimos 14 días)
- **Heatmap** de actividad
- Mensajes motivacionales según progreso

### 👥 Gestión de Clientes
- Lista con **búsqueda**, **ordenamiento** y **paginación**
- Perfiles detallados con condiciones médicas y preferencias
- **Vinculación** por email sin código
- Generación y gestión de **códigos de invitación**
- Modal de resumen con progreso completo por cliente

### 💧 Water Tracking
- Registro de consumo de agua diario

### 🔔 Notificaciones Push
- Suscripción desde el navegador
- Horarios configurables (desayuno, almuerzo, cena, workout)
- Scheduling automático con `@nestjs/schedule`

### 🎨 UI/UX
- Modo **oscuro/claro**
- Diseño responsive (sidebar desktop / bottom nav mobile)
- **Landing page cinematic** con Three.js (react-three-fiber)
- Animaciones con **Framer Motion** y **GSAP**
- Tema de color dinámico (emerald por defecto)

---

## ⚙️ Requisitos e Instalación

### Requisitos

- **Node.js** ≥ 20
- **npm** ≥ 10
- **PostgreSQL** (o cuenta Supabase)

### Frontend

```bash
cd olympus-bite-ft
npm install

# Variables de entorno
echo "NEXT_PUBLIC_API_URL=http://localhost:3000" > .env.local

npm run dev -- --port 3001   # http://localhost:3001 (puerto 3001 para evitar conflicto con backend)
```

### Backend

```bash
cd olympus-bite-bk
npm install

# Variables de entorno (ya hay .env en el repo)
# Configurar DATABASE_URL, SUPABASE_URL, SUPABASE_KEY, GEMINI_API_KEY

npx prisma migrate dev
npm run start:dev   # http://localhost:3000
```

---

## 📋 Comandos Útiles

### Frontend (`olympus-bite-ft/`)

| Comando | Descripción |
|---------|------------|
| `npm run dev` | Inicia servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run lint` | ESLint |

### Backend (`olympus-bite-bk/`)

| Comando | Descripción |
|---------|------------|
| `npm run start:dev` | Inicia servidor de desarrollo (watch mode) |
| `npm run build` | `prisma generate` + `nest build` |
| `npm run lint` | ESLint con auto-fix |
| `npm run test` | Tests unitarios (Jest) |
| `npm run test:e2e` | Tests end-to-end |

---

## 🧪 Testing

- **Backend:** Jest configurado con `ts-jest`
  - Tests unitarios en `src/` (`*.spec.ts`)
  - Tests e2e en `test/`
- **Frontend:** No hay suite de tests configurada actualmente

---

## 🚀 Deploy

- **Frontend:** Vercel (Next.js optimizado)
- **Backend:** Servidor Node.js con NestJS en modo producción
- **Base de Datos:** Supabase (PostgreSQL gestionado)

---

## 👨‍💻 Autor

Proyecto desarrollado para la gestión integral de **nutrición y entrenamiento** de **Punto de Inflexión**.

---

## 📄 Licencia

UNLICENSED — Proyecto privado.
