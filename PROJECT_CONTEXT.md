# Priesthood Path — Project Context

## Overview
- **App**: "Priesthood Path" — mobile-first React web app
- **Stack**: React + Vite + Tailwind CSS
- **Theme**: "Sacred Modern" with CSS variables
  - `--color-bg: #0F172A` (Slate-900)
  - `--color-surface: 30 41 59` (Slate-800, used as rgba)
  - `--color-accent: #EAB308` (Gold-500)
  - `--color-accent-secondary`: Silver or Gold based on priesthood order
  - `--color-text-primary: #F8FAFC`
- **Design**: glassmorphism cards, gold accents, minimal sacred aesthetic

## Structure
- `src/components/`
  - `Navigation.jsx` (bottom nav)
  - `HabitTracker.jsx`
  - `MissionCard.jsx`
  - `WeeklyReflectionWizard.jsx`
  - `PhaseCompletionModal.jsx`
  - `PhaseReviewModal.jsx`
  - `MasteryCelebrationModal.jsx`
  - `HigherPriesthoodModal.jsx`
  - `DeveloperToolbar.jsx` (hidden unless `?dev=true`)
- `src/pages/`
  - `Dashboard.jsx`
  - `Path.jsx`
  - `OrdinanceLab.jsx`
  - `Profile.jsx`
  - `Journal.jsx`
- `src/context/`
  - `MissionProvider.jsx` (global state)
- `src/data/`
  - `curriculum.json` (Starter Week + Months 1–4)
  - `ordinances.json`
- `src/styles/tailwind.css`

## Core Features
### Navigation
Bottom nav: Dashboard, Path, Ordinance Lab, Profile, Journal.

### Mission Flow
- Daily mission rendered by `MissionCard`.
- Mission has scripture link, message, challenge.
- "Read [scripture]" button must be clicked to unlock "Mark Completed".
- After Mark Completed, Daily Reflection modal appears.
- Saved reflections are stored and shown in Path for re-reading.

### Sunday Reflection
`WeeklyReflectionWizard` (Portal) displays 5-step wizard on Sunday:
Saves to Journal + unlocks Starter completion + triggers celebration.

### Monthly Mastery
Months 1–4 via `curriculum.json`.
Tracks `currentMonth` and `currentDay` post starter week.
Month 2/3/4 are office-specific (Aaronic vs Melchizedek).

### Ordinance Lab
Search/filter by category. Modal with Steps, Prayer, Handbook tab.
Includes Read Aloud (Web Speech API) + High Contrast toggle.

### Catch Up / Grace System
If inactive:
- 1–2 days: toast
- 3–6 days: Catch Up modal
- 7+ days: Re-center modal
Catch Up Mode now happens on Dashboard with a modal for the first missed day,
plus a "Verify completion and advance to next day" button.

### Phase-End Buffer
At phase ends (7,35,63,91), if excused days exist:
shows `PhaseReviewModal` to review or proceed with Silver.
Phase badges can upgrade to Gold retroactively when missed days are completed.

### Momentum System
Momentum Score displayed on Dashboard:
`(normalCompleted * 5) + (catchUpCompleted * 3) + (missed * -10)` clamped 0–100.

### Profile Enhancements
Includes:
- Identity fields (name + office)
- Service Summary
- Mastery Ribbons (Gold/Silver)
- Growth Summary: Reliability %, Repentance Rate
- Habit Heatmap (last 120 days)

## Key State & Storage
- **MissionProvider** (`src/context/MissionProvider.jsx`)
  - `selectedOffice` → `priesthood.office`
  - `userName` → `priesthood.userName`
  - `starterState` → `priesthood.starterState`
  - `progressByOffice` → `priesthood.progress`
  - `reflectionsByOffice` → saved via `JournalService`
  - `badges` → `priesthood.badges`
  - `badgeUnlock` → `priesthood.badgeUnlock`
  - `higherUnlocked` → `priesthood.higherUnlocked`
  - `phaseCompletions` → `priesthood.phaseCompletions`
  - `phaseStatus` → `priesthood.phaseStatus` (gold/silver)
  - `graceDays` → `priesthood.graceDays` (day → date map)
  - `manualCompletedDays` → `priesthood.manualCompletedDays`
  - `manualCompletionCount` → `priesthood.manualCompletionCount`
  - `manualCompletionDates` → `priesthood.manualCompletionDates`
  - `lastActiveDate` → `priesthood.lastActiveDate`
  - `lastCompletedDay` → `priesthood.lastCompletedDay`
  - `catchUpMode` → `priesthood.catchUpMode`
  - `catchUpQueue` → `priesthood.catchUpQueue`

- **Journal Entries**
  - Daily reflections: `reflection_${office}_${day}_${timestamp}`
  - Weekly reflections: `sunday_report_${timestamp}`
  - `priesthood.journalEntries` stores habit toggles by date

- **Habit Log**
  - `priesthood.habitLog` — daily habit completion
  - `priesthood.habitsDate` — last date to reset habits

## Important UI Notes
- `MissionCard` uses **resource gate**: scripture link must be clicked.
- "Mission Completed" banner uses a portal, large gold style.
- `DeveloperToolbar` only appears when URL has `?dev=true`.
- `Path` Starter Week is collapsible after completion but always visible.
- Day modals render at root level so they appear above all grids.

## Catch Up Mode
- Triggered after 3–6 days inactivity.
- Opens **Dashboard Catch Up Modal** for the earliest missed day.
- Button: **"Verify completion and advance to next day"**.
- Removes day from queue; ends when queue empty; shows success message.
- Current day is excluded from queue.

## Path States
Day states:
- **Completed** (gold check)
- **Excused** (dashed gold ring)
- **Missed** (gray ring)
- **Locked** (future)
- Current day always highlighted

## Momentum Rules
`Momentum = (normalCompleted * 5) + (catchUpCompleted * 3) + (missed * -10)`
Clamped to 0–100. Displayed on Dashboard.

## Profile Growth Summary
- **Reliability**: % completed in last 30 days
- **Repentance Rate**: avg days to return after a miss (lower = better)
- **Habit Heatmap**: last 120 days, intensity based on 0–3 habits

## Service Worker
`public/sw.js` handles nudge notifications at 7 PM local time.

## Dev / Debug
- Dev tools hidden unless `?dev=true`
- Developer Toolbar supports:
  - Set user name
  - Day slider (1–120)
  - Office selector
  - Last active date (for recovery testing)
  - Clear recovery prompt lock

## Open Items / Placeholders
- Badge images for Month 2+ custom badges still pending (Shield of Faith, Oil of Joy, etc.)
- Some Month 2–4 prompts may still use placeholder text.
# Project Context

Phase,Focus,Key Components
Phase 1,Foundation,"Shell, Navigation, Office Selection, Theme (Slate/Gold)."
Phase 2,Daily Engine,"curriculum.json integration, Habit Tracker, LocalStorage persistence."
Phase 3,Reference,"Ordinance Lab, Step-by-Step guides, High-contrast prayer text."
Phase 4,Mastery,"Sunday Reflection logic, Badge/Milestone system, 4-Month Mastery content."
