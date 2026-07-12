# ¡ÓRALE! — The Mexican Spanish Codex

**Learn conversational Mexican Spanish in 26 weeks — one HTML file, zero dependencies, fully offline.**

No server. No account. No subscription. No tracking. Download `app/orale.html`, open it in Chrome or Edge, and start. It also installs as a full offline PWA.

**Method:** 1 hour/day — 25 min free audio course (Language Transfer, then Dreaming Spanish), 20 min in-app SRS, 10 min shadowing out loud, 5 min Cantina (slang & culture). ~170 hours to conversational B1; the month 7–12 extension reaches ~350 hours / B2.

<!-- LANDING PAGE: an HTML presentation (index.html) will live at the repo root and be served by GitHub Pages. See docs/GITHUB-GUIDE.md §6. -->

## What's inside (v2.0.0)

- **968-card SRS deck** (SM-2 variant) with es-MX text-to-speech: 784 words, 78 phrases, 38 slang terms, 28 idioms, 40 construction/work terms
- **26-week curriculum** (the Códice) with spoken-first grammar, speaking missions, curated free links, weekly gated exams
- **6 boss battles** — timed, mixed-skill phase exams with health bars and commentary from Profesor Anselmo
- **Story Mode** — 6 graded audio-stories following one protagonist across the arc, with comprehension checks
- **Listening Lab** — 20 two-voice dialogues with per-line replay, speed control, and MCQs
- **Conjugation trainer** — 12 highest-value verbs × 4 tenses × 6 persons, spoken-first
- **Shadowing booth** — Pimsleur-style imitation drills with mic recording and A/B compare against native TTS (audio never leaves your browser)
- **6 arena mini-games**, adaptive repair queue built from your own mistakes, surprise Memory Raids
- **Full gamification layer** — XP, 12 ranks, streaks, daily missions, reward chests, achievements, 5-branch skill tree
- **Analytics room** — 90-day retention curve, due-load forecast, weekly mastery heatmap, 170-hour goal projection, CSV export
- **Cantina** — 40 false friends, cognates, fun facts, and a curated media library (songs / series / movies / channels)
- **15-page English tutorial**, keyboard shortcuts (Space to flip, 1–4 to grade), localStorage persistence with export/import

## Quick start

1. **Zero-install:** download `app/orale.html` and double-click it. That's the whole app.
2. **As an installed app (PWA):** serve the `app/` folder (`npx serve app` or `python -m http.server -d app`), open `orale.html`, and Chrome/Edge shows an install icon in the address bar. Installed, it runs standalone and fully offline; updates arrive automatically when a new version is published.
3. Note: the double-clicked file and the installed app are different origins and keep separate progress — move progress between them with Exportar/Importar in ⚙ Ajustes.

## Repository layout

```
orale-project/
├── app/orale.html           # the entire application (works standalone from disk)
├── app/manifest.webmanifest # PWA manifest
├── app/sw.js                # service worker — network-first shell, version-aware cache
├── app/icon.svg             # app icon
├── ROADMAP.md               # public roadmap — pick something up!
├── docs/CHANGELOG.md        # full version history
├── docs/DESIGN.md           # design system, schematics, data schemas
├── docs/DEV-GUIDE.md        # environment, workflow, asset rules, testing
├── docs/GITHUB-GUIDE.md     # how this repo is published & released
├── docs/*Audit*.md          # code audits (Qwen v1.12.0, Claude v1.12.2)
├── tools/smoke-test.js      # headless runtime test (node)
├── tools/validate-data.js   # data integrity linter (node)
└── LICENSE                  # MIT
```

## Contributing

The single-file architecture is a **deliberate design constraint**, not technical debt: the entire app must keep working when `orale.html` is double-clicked from disk. PRs that introduce build steps, frameworks, or split the file will be declined — everything else is fair game. Before opening a PR:

1. Read `docs/DEV-GUIDE.md` (rules of engagement) and pick an item from `ROADMAP.md`.
2. Make your change additively — don't rename or restructure existing engine functions.
3. Run both gates and confirm they print PASS: `node tools/validate-data.js` and `node tools/smoke-test.js`.
4. Bump `APP_VERSION` one level and add a `docs/CHANGELOG.md` entry (newest at top, match the existing format).

Spanish content PRs must use Mexican register (carro not coche, platicar not charlar) — see the QA checklist in `docs/QA-REPORT.md`.

## History

Built by a three-model AI team (Claude Opus — architecture & QA, Claude Fable — features & content, local Qwen — bulk work) coordinated through Cowork sessions, for a real learner. The full session-by-session build log lives in `docs/CHANGELOG.md`.

## License

MIT — see `LICENSE`.
