# Warmup/Cooldown Video Steps Design

**Goal:** Add MuscleWiki videos to warmup and cooldown steps, with dynamic step selection aligned to the day’s training focus. Each warmup/cooldown shows 4 steps: 3 focus-matched + 1 general.

## Summary
- Expand offline MW library with warmup/cooldown exercise pools.
- Add metadata to each step: `stepType` (`warmup`/`cooldown`) and `focus` (`legs`/`core`/`upper`/`agility`/`general`).
- Planner selects warmup/cooldown steps dynamically based on the day’s plan roles/modules.
- UI renders each step with title + duration + dual-angle videos (same video component + fallback).

## Data Model
**New pools** in `data/exercises.mw.js`:
- `warmup`: array of warmup steps (video + metadata)
- `cooldown`: array of cooldown steps (video + metadata)

**New fields per step:**
- `stepType`: `warmup` | `cooldown`
- `focus`: `legs` | `core` | `upper` | `agility` | `general`
- `name`, `duration`, `tips`, `mistakes`, `videoSide`, `videoFront`, `fallbackImageSide`, `fallbackImageFront` (reuse schema)

**Rationale:** This keeps warmup/cooldown steps compatible with existing video rendering and allows deterministic selection.

## Selection Logic
- Determine day focus from generated plan:
  - Map `role`/`module` to `focus` (e.g. `knee/hip` -> `legs`, `core` -> `core`, `upper` -> `upper`, `agility` -> `agility`).
- For each of warmup and cooldown:
  - Choose 3 steps from the dominant focus pool (if multiple focuses, use a 2+1 split or 1+1+1 based on weights).
  - Choose 1 step from `general` pool.
- Deterministic randomness:
  - Use the existing date seed + `offset` to keep “same day stable, next day different”.
- Avoid repeats within the same warmup/cooldown selection using `usedIds`.
- If a focus pool is insufficient, fall back to `general` to keep 4 steps.

## UI/UX
- Warmup/Cooldown cards remain “step list” layout but each step becomes a **video row**:
  - Left: step name + duration
  - Right: dual-angle video (reuse existing video frame, skeleton, fallback).
- Default collapsed, tap to expand (existing behavior).
- Small-screen layout: stack videos vertically if needed to avoid narrow columns.

## Testing
- Add unit tests for selection:
  - `warmupSteps.length === 4`, `cooldownSteps.length === 4`
  - 3 steps match focus + 1 general
  - Deterministic same-day output
  - Fallback to `general` when focus pool is insufficient
- Add data validation test for warmup/cooldown steps to ensure required fields exist.

## Risks / Mitigations
- **Data bloat**: More steps increase library size → keep warmup/cooldown pool minimal (14–20 total).
- **Video availability**: Some MW entries may be missing angle → reuse existing fallback UI.
- **UI height**: More video rows → keep 4 steps and collapse by default.

## Open Questions
- Final list of warmup/cooldown MW exercises to include in the offline sync blueprint.
- Whether to allow user-configurable warmup/cooldown duration in settings (future).
