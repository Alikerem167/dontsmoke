# Dont Smoke — Copilot Agent Instructions (Mobile App, Production-Grade)

You are building a mobile app called **Dont Smoke**. The app helps users quit smoking using:
- a persistent abstinence timer (seconds/minutes/hours/days since last cigarette),
- a craving helper (“I wanna smoke”),
- a relapse flow (“I did smoke”) that resets and motivates.

## 0) Build Decisions (Required)
Use the most robust, modern, and maintainable mobile stack:
- **React Native + Expo (Managed)**
- **TypeScript**
- Navigation: **@react-navigation/native**
- State: **Zustand** (or React Context if you must, but prefer Zustand)
- Persistence: **Firebase Authentication + Cloud Firestore**
- Offline-first: Use Firestore offline caching + local fallback (AsyncStorage) for lastSmokeAt
- UI: Clean, minimal, accessible. No clutter.
- Code quality: linted, typed, modular, tests where reasonable.

> Goal: “Feels like a real shipped app”, not a demo.

## 1) Core Product Requirements

### Authentication (Mandatory)
User must create an account or log in before using Home.
- Email + Password auth is enough.
- After login/signup → go to Home.
- Add logout from settings or header menu.

Persisted per user:
- `lastSmokeAt` (timestamp in ms) — may be null initially
- `relapseCount` (number)
- `bestStreakSeconds` (number)
- `createdAt` (timestamp)
- `updatedAt` (timestamp)

### Home Screen (Main)
The Home screen must include:

1) A **BIG RED PRIMARY BUTTON** (centered)
2) A **SECONDARY BUTTON** directly under it
3) A live **timer display** (can be inside or above the big button)

#### Big Red Button behavior
State A (first time / no timer running):
- Label: **"Start"**
- On press:
  - set `lastSmokeAt = now`
  - start the live counter immediately (ticks every 1 second)
  - save to Firestore AND local cache

State B (timer running):
- Label: **"I wanna smoke"**
- On press:
  - DO NOT reset timer
  - show a motivational message (modal/bottom sheet/toast/card)
  - rotate messages randomly (avoid immediate repeats)

Timer copy:
- Show a human-friendly format:
  - “You haven’t smoked for 12 seconds”
  - after 60s: “2 minutes 10 seconds”
  - after 60m: “1 hour 3 minutes”
  - after 24h: “2 days 4 hours”
Keep it readable and smooth.

#### Secondary Button ("I did smoke")
Placement: immediately below the big button.
Label: **"I did smoke"**
On press:
- log a relapse event (timestamp)
- increment `relapseCount`
- set `lastSmokeAt = now` (restart from 0)
- show supportive message like:
  - “Don’t worry. We restart now. One slip doesn’t erase progress.”
- update `bestStreakSeconds` if current streak was higher than best.

### Motivational Messages (Craving Prompts)
Create an in-app pool of at least **40** short motivational messages.
Tone:
- supportive but direct
- no cringe
- actionable micro-steps

Examples (EN):
- “Cravings rise and fall. Give it 90 seconds.”
- “Urge is a wave. Surf it, don’t fight it.”
- “Drink water. Walk 2 minutes. Come back.”
- “You’re not ‘needing’ it — your brain is negotiating.”
- “Delay 5 minutes. If you still want it, delay again.”
- “One cigarette restarts the loop. Don’t open it.”
- “Breathe in 4, hold 4, out 6. Repeat x5.”

Rules:
- avoid repeating the same message twice in a row
- optionally track last 5 shown to reduce repeats

### Persistence & Reliability (Non-negotiable)
The timer must persist across:
- app restart
- background/foreground
- network loss

Implementation requirements:
- Source of truth: Firestore (server timestamp stored as ms)
- Fast startup: use local cache (AsyncStorage) to render immediately
- Sync: after auth + firestore fetch, reconcile and update local cache

If Firestore is unavailable:
- timer still works locally
- changes queue and sync later (Firestore offline helps)

### Accessibility & UX polish
- Big red button: accessible label, high contrast, large hit area
- Secondary button: clearly visible but not competing
- Haptics: subtle haptic feedback on button press
- Animations: small and smooth (count updates should not jank)
- No lag: timer updates should not cause re-render storms (optimize with memo/selectors)

## 2) App Screens (Minimum)
1) Auth: Sign Up / Log In
2) Home
3) Settings (optional but recommended): logout, reset account (danger zone)

## 3) Data Model (Firestore)
Collection: `users/{uid}`
Fields:
- createdAt: number
- updatedAt: number
- lastSmokeAt: number | null
- relapseCount: number
- bestStreakSeconds: number

Optional:
Collection: `users/{uid}/relapses/{relapseId}`
- timestamp: number
- streakSecondsBeforeRelapse: number

## 4) Architecture Requirements
Organize code cleanly:
- `/src/screens` (Auth, Home, Settings)
- `/src/components` (BigRedButton, TimerDisplay, MotivationModal)
- `/src/store` (zustand stores)
- `/src/services` (firebase, persistence, timer utilities)
- `/src/utils` (formatDuration, randomMessage, etc.)

Timer strategy:
- derive elapsed = now - lastSmokeAt
- update UI with a single interval (1s)
- store only timestamps, never store “elapsed” as truth

## 5) Acceptance Criteria (Must Pass)
- Login required to access Home
- First press on big red button sets lastSmokeAt and starts timer
- While running, big red button becomes “I wanna smoke” and shows motivation without reset
- “I did smoke” logs relapse, increments count, restarts timer from 0
- Timer persists after app restart
- Works offline gracefully

## 6) Quality Bar (Do not ship below this)
- TypeScript types are correct and strict enough
- No obvious UI bugs on small screens
- No flicker on startup (use cached lastSmokeAt)
- No heavy re-renders every second across the whole screen (optimize)
- Clear error states: auth errors, network issues
- Clean commit-ready code structure

End of instructions.
