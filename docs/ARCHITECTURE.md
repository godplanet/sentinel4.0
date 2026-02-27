# SENTINEL GRC v3.0 - ARCHITECTURE CONSTITUTION

## 1. Core Philosophy: Feature-Sliced Design (FSD)
This project strictly follows FSD methodology.
- **Layers:** `app` > `processes` > `pages` > `widgets` > `features` > `entities` > `shared`.
- **Rule:** Upper layers can import from lower layers. Lower layers CANNOT import from upper layers.
- **Slices:** Code is organized by business domain (e.g., `risk`, `audit`, `universe`), not by tech type.

## 2. Data Integrity Strategy (The Cryo-Chamber)
- **Snapshotting:** Audit engagements MUST use JSONB snapshots for RKM data.
- **Immutability:** Once an audit starts, the risk definition is frozen in `engagement_scopes` table.

## 3. The Nervous System (Event-Driven)
- **Transactional Outbox:** Critical state changes (e.g., Finding Closed) must use the Outbox pattern to notify other modules (Risk Engine, QAIP).

## 4. UI/UX Standards (Functional Glass)
- Use `glass-panel` class for containers.
- Use `Chameleon Engine` (via `useUIStore`) for environment-based theming.
