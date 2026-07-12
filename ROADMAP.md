# ¡ÓRALE! — Public Roadmap

This is the community-facing roadmap from v2.0.0 onward. The pre-release build history (Sessions 1–13) lives in `docs/ROADMAP.md` and `docs/CHANGELOG.md`.

**How to pick something up:** comment on (or open) the matching GitHub Issue so work isn't duplicated, read `docs/DEV-GUIDE.md` and the Contributing section of the README, and keep the golden rule: **`app/orale.html` must keep working when double-clicked from disk** — single file, no build step, no dependencies, additive changes only. Every PR must pass `node tools/validate-data.js` and `node tools/smoke-test.js`, bump `APP_VERSION`, and add a `docs/CHANGELOG.md` entry.

Items are sized as **S** (an evening), **M** (a weekend), or **L** (its own project). References like "Qwen §2.1" point to the audit docs in `docs/`.

---

## v2.1 — Onboarding & everyday UX

| Item | Size | Notes |
|---|---|---|
| Split onboarding: 5-screen quick-start + deep-dive tutorial from settings | M | Qwen §2.1. Tutorial is 15 pages today; new users should reach their first flashcard in under a minute |
| "Continue where you left off" card on the Panel | S | Resume last activity with one tap (Qwen §2.1) |
| Search across vocabulary, slang, idioms, dialogues | M | Global reference lookup, likely a Cantina tab or header field (Qwen §2.3) |
| "Mute Anselmo" toggle in settings | S | Buddy popups are charming but should be optional (Qwen §2.3) |
| Export data as a downloadable .json file (not just clipboard) | S | Mirrors the existing CSV exporter (Claude §2.4) |
| Import validation: check state shape before accepting | S | Claude §2.3 — malformed imports currently fail deep in render code |
| Don't fire surprise Memory Raids under the first-run tutorial | S | Claude §2.4 |

## v2.2 — Study power tools

| Item | Size | Notes |
|---|---|---|
| Card browser: searchable, filterable list of all 968 cards with due date / interval / ease | L | The #1 power-user feature (Qwen §4.2). No SRS-core changes needed — read-only first version is fine |
| Custom decks / manually add cards | L | Builds on the card browser (Qwen §6.1) |
| Weekly review summary (Sundays): XP, cards, weak areas, streak status | M | Qwen §6.1 |
| Weekly bonus missions with special badge | S | Mid-term goals beyond the daily grind (Qwen §2.4) |
| Streak freeze token (earned, single-use) | S | Qwen §2.4 |
| Fill-in-the-blank listening exercises in the Listening Lab | M | Qwen §4.1 |

## v2.3 — Look & feel

| Item | Size | Notes |
|---|---|---|
| Light mode toggle (dark stays default) | M | Mirror the CSS custom-property palette (Qwen §3.1). Verify WCAG AA contrast both ways |
| Victory/defeat animations for boss battles (CSS particles) + weak-point analysis on defeat | M | Qwen §2.4 |
| Parchment styling for Story Mode paragraphs | S | Extends the illuminated-manuscript aesthetic (Qwen §3.1) |
| Font-size setting (Small / Normal / Large) | S | Accessibility win (Qwen §2.5) |
| Inline SVG icons for cross-platform consistency | M | Unicode glyphs render differently per OS (Qwen §3.1) |
| Contrast audit of secondary text against WCAG AA | S | Qwen §2.5 |

## v3.0 — Speech & beyond (big swings)

| Item | Size | Notes |
|---|---|---|
| Speech-recognition pronunciation scoring (Web Speech API `SpeechRecognition`) | L | The highest-impact feature on the list (Qwen §6.1). Must degrade gracefully offline/unsupported |
| Conversation simulator: free-form typed dialogue practice | L | Qwen §4.2 |
| Multi-user profiles via localStorage namespaces | M | e.g. spouse profile (original backlog) |
| Anki .apkg export | M | Original backlog |
| Community deck import format | L | Define a JSON schema so others can write content packs (original backlog) |
| Social sharing of achievements (optional, offline-first preserved) | M | Qwen §6.1 |

## Standing engineering backlog (any release)

- Per-view `lang` attributes for screen-reader phonology (Claude §2.3)
- `gameTrampa` duplicate-distractor edge case (Claude §2.3)
- Cache canvas chart drawings; redraw only on data change (Qwen §5.2)
- More automated tests: the smoke test is broad but shallow — targeted regression tests for SRS math, streak logic, and boss damage math welcome
- Content expansion: more dialogues (20 → 30), more stories (6 → 12, one per major milestone), GQ grammar bank growth — **Spanish content PRs must pass the MX-register checklist in `docs/QA-REPORT.md`**

## Explicitly out of scope

These will be declined in PR review (see Contributing in the README):

- Build systems, bundlers, transpilers, or splitting `orale.html` into modules
- Frameworks (React/Vue/etc.), external runtime dependencies, CDN-loaded libraries
- Server components, accounts, telemetry, or anything that breaks offline-first
- IIFE-wrapping the engine (evaluated and rejected — see `docs/Claude Audit v1.12.2.md` §1.1)
