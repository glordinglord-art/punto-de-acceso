# Punto de Inflexión 🏋️‍♂️🍽️

Punto de Inflexión (formerly Olympus Bite) is a comprehensive Gym & Nutrition management application comprising a modern Next.js frontend and a robust NestJS backend. Its primary features include user authentication, meal tracking (likely with AI image recognition for caloric, macro counting), and gym routine management.

## Project Structure

The project is structured as a monorepo with two main directories:

### 1. `olympus-bite-ft` (Frontend)

- **Framework:** Next.js (latest, App Router) and React 19.
- **Styling:** Tailwind CSS v4.
- **Architecture:** Feature-Sliced Design-like approach.
  - `app/`: Next.js App Router definitions.
  - `features/`: Contains domain-specific logic and UI parts organized by feature (`auth`, `clients`, `dashboard`, `meals`, `routines`).
  - `shared/`: Generic components, hooks, and utilities used across the application.

### 2. `olympus-bite-bk` (Backend)

- **Framework:** NestJS (v11) and TypeScript.
- **Database / Persistence:** Prisma ORM, Supabase.
- **AI Integration:** Google Generative AI (`@google/generative-ai`), utilized for evaluating meals from pictures (calorie counting).
- **Architecture:** Modular architecture.
  - `src/modules/`: Contains domain modules matching frontend features (`auth`, `users`, `dashboard`, `meals`, `routines`).
  - `src/shared/`: Cross-cutting concerns and shared module logic.

## Key Features

- **Authentication:** Secure login and registration.
- **Dashboard:** Overview of the user's progress and stats.
- **Meals:** Upload photos of your meals to automatically count calories and track nutritional goals.
- **Routines:** Create, view, and manage gym exercise routines.

## Development

Currently under active development. Both the frontend and backend utilize modern tooling and best practices to ensure scalability and maintainability.
