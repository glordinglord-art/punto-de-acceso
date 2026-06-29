# Routine Execution Redesign

**Date:** 2026-06-28
**Scope:** `features/routines/` — split, visual overhaul, auto timer, calories estimate

---

## Problem

`ClientRoutinesView.tsx` is 2844 lines containing unrelated concerns. Users (including the developer) find:
1. Visual — routine execution looks poor, no hierarchy
2. Timer — unclear whether rest countdown is running
3. Calories — no feedback on effort during session

---

## Architecture

Split `ClientRoutinesView.tsx` into focused files:

```
features/routines/components/
├── ClientRoutinesView.tsx        ← shell: routes between list and session
├── RoutineListView.tsx           ← routine list + weekly calendar
├── GuidedSessionView.tsx         ← fullscreen session orchestrator
├── ExerciseCard.tsx              ← single exercise: name, sets, reps, weight
├── SetLogger.tsx                 ← inline form: weight input + reps + confirm
├── RestTimer.tsx                 ← SVG ring countdown, auto-starts
└── CaloriesBurnedTracker.tsx     ← running kcal estimate for session
```

All logic from the current file is redistributed — no behavior deleted.

---

## GuidedSessionView Layout

Fullscreen overlay replacing the current modal/inline approach.

```
┌─────────────────────────────────┐
│  ← Día 2 · Pecho      13% ████░│  header: day name, session progress bar
├─────────────────────────────────┤
│                                 │
│     PRESS DE BANCA              │  exercise name — large bold type
│     3 series · 10-12 reps       │  subtitle
│                                 │
│         ●●○○○  2/5              │  dot indicators: done / total sets
│                                 │
│   [ 50 kg ]  [ 12 reps ]   ✓   │  SetLogger: weight + reps + confirm btn
│                                 │
├─────────────────────────────────┤
│        ⏱  01:30                 │  RestTimer ring — auto countdown
│     Descanso en curso...        │
│         [ Saltar ]              │
├─────────────────────────────────┤
│  🔥 127 kcal quemadas           │  CaloriesBurnedTracker — session total
└─────────────────────────────────┘
```

**Colors:** All via CSS variables from `SettingsContext`:
- Active/accent: `var(--color-p500)`
- Completed sets: `var(--color-p400)`
- Pending sets: `var(--color-p900)` (dark)
- Background: existing dark theme tokens
- No hardcoded hex values in components

---

## RestTimer

- SVG `<circle>` with animated `strokeDashoffset` — no library
- Auto-starts when `onSetComplete()` fires
- `duration` from `restSeconds` field already in DB schema
- On finish: `navigator.vibrate(200)` + single beep via Web Audio API (oscillator, ~3 lines)
- User can skip with "Saltar" button
- Props: `{ duration: number; onFinish: () => void }`

---

## CaloriesBurnedTracker

Formula: `kcal = MET × weightKg × (durationHours)`

MET table by muscle group (hardcoded, standard values):
```ts
const MET: Record<string, number> = {
  pecho: 7, espalda: 7, piernas: 8, hombros: 6,
  brazos: 5, abdomen: 5, cardio: 10, default: 6,
};
```

- `weightKg` from user profile (already in DB)
- Duration: time from session start to now, updated every 30s
- Displayed as running total in session footer
- No backend call — pure client calculation

---

## RoutineListView Visual

Improvements to the list screen (not fullscreen session):
- Cleaner day cards with `var(--color-p500)` accent on active day
- Completed days get checkmark + muted style
- Rest days clearly labeled, not clickable
- Typography hierarchy: day name bold large, exercise count small muted

---

## Out of Scope

- Meals, Dashboard, Tasks redesign — separate initiative
- Backend changes — all data already exists
- New theme colors — use existing 4 presets

---

## Success Criteria

- User can complete a full session without confusion about timer state
- Timer auto-starts after marking a set, shows clearly (ring animation)
- Calories shown throughout session
- `ClientRoutinesView.tsx` reduced from 2844 to <200 lines
- All colors respond to theme preset changes
