# DEV GUIDE — Environment, Workflow, Assets, Testing

## 1. Environment
- **Runtime target:** modern Chromium (Chrome/Edge desktop) — required for good es-MX speechSynthesis voices. Firefox works with degraded TTS. The app must always work by double-clicking `app/orale.html` from disk (file://). **Source lives in `src/`; `app/orale.html` is a BUILT artifact** (see "Build" below) that must stay ONE self-contained file: all CSS/JS inlined, no external runtime dependency, works offline — ever. A build step exists only to produce that file; the deliverable never needs a build or a server to run.
- **Dev tools:** Node 18+ and `npm ci` (installs the single pinned dev dependency, esbuild). Nothing else.
- **Cowork sessions (Claude Opus / Fable):** open this project folder; read ROADMAP.md for the session, DESIGN.md before touching UI, this file before touching anything.
- **Known gotcha (S4):** in Cowork, file edits (Read/Edit/Write tools) land on the real OneDrive-synced file immediately, but the sandboxed shell's mounted view of the same OneDrive folder can lag behind by an unpredictable amount (observed: still stale after 15s+ and multiple intervening tool calls). Symptom: `node tools/*.js` run right after an edit reports old file size / "no script block" / stale counts even though the edit succeeded. Do not assume a shell-side failure means the edit failed — check the real file first (`Grep`/`Read`, which go through the same side as `Edit`). If you need a reliable test run and the shell mount is stale, build a byte-for-byte mirror in the shell's own `outputs` working directory (not under the OneDrive mount), apply the identical edits there with a script, run the test gate against that mirror, then cross-check structural line counts (`wc -l`, `grep -c .`) between the mirror and the real file via `Grep` to confirm they match before trusting the result. Never "fix" a stale read by rewriting the OneDrive file from a shell script — a buffered Python write to that mount truncated the file once (see CHANGELOG v1.2.0); `cp` of a known-good backup was safe, direct content rewrites were not.
- **Qwen 3.6 local (LM Studio + Cline on the 7900 XTX):** load the packet file the previous Claude session left in `/handoff/` (prompt + template + examples + banned list). Qwen edits only the file/array named in the packet. Context window: keep packets under ~8k tokens; for large data jobs, split into lettered sub-packets (A, B, C) of ≤120 rows each.

## 2. Workflow rules (all models)
1. One session = one ROADMAP entry. Do not exceed scope; log discovered ideas in the ROADMAP backlog instead.
2. Read before write: `view` the relevant file under `src/` (CSS in `style.css`, HTML skeleton in `index.html`, script sections in `src/js/NN-*.js`, each organized by banner comments `/* ==== DATA/ENGINE/VIEW: X ==== */`). Insert new code under the matching banner, then run the build.
3. Append-only data (see DESIGN.md §5): card ids are explicit stable strings stored as the LAST field of every V/PH/SL/ID/TR row (e.g. `"voc.hola"`). Never derive ids from text or position, never change or reuse an id, and give every new row a unique one. `LEGACY_IDS` is frozen (old positional save keys only); validate-data enforces unique ids and full 968-position coverage.
4. State schema changes: additive with defaults in `fresh()` only.
5. Every session ends with: both tools passing, a manual browser sanity check (open app, run tutorial or a review), a CHANGELOG entry with version bump, and — if the next session is Qwen's — a packet written to `/handoff/`.
6. Backwards compatibility with existing user state is non-negotiable. If unsure, write a tiny migration in `load()`.
7. ~~Keep the app a SINGLE file until Session 10 (PWA) explicitly changes packaging.~~ **Updated by S10 (v1.11.0):** `app/` is now orale.html + three PWA siblings (`manifest.webmanifest`, `sw.js`, `icon.svg`). orale.html must still work standalone when double-clicked from disk — the siblings only activate over http(s). No further files without a ROADMAP session that says so. When bumping `APP_VERSION`, nothing else needs touching: the service worker cache is keyed off the registration query string.

## 3. Assets policy
- **No binary assets.** Icons are unicode glyphs or inline SVG. Fonts are local system stacks (DESIGN.md §2). Images: none until S10 icon (inline SVG).
- **Audio:** browser speechSynthesis only. Voice picking order: user choice → es-MX → es-US/es-419 → any es. Never hardcode a voice name.
- **External links:** free, public, stable. Prefer official sites and channel handles; for anything version-fragile use YouTube search URLs via the `yt(query)` helper (guaranteed not to rot). Every added link gets click-tested in the session that adds it; S11 re-audits all.
- **Spanish content standards:** Mexican register (carro not coche, platicar, camión=bus, ¿mande?); accents mandatory (á é í ó ú ñ ü ¿ ¡); slang no stronger than current entries; every SL row needs a natural example sentence; every FF row must be a genuine false friend, not a coincidence.

## Build (src/ -> app/orale.html)
- **Edit `src/`, never `app/orale.html`.** `src/index.html` (shell), `src/style.css`, `src/js/NN-*.js` (script sections, concatenated in filename order into one classic script — shared global scope on purpose because the markup uses inline `onclick="..."` handlers).
- `npm ci` once, then `npm run build` (= `node tools/build.js`) regenerates `app/orale.html` with esbuild (pinned exact in `package.json`, locked in `package-lock.json`; no minify, LF output, deterministic).
- **Commit the built `app/orale.html` together with the `src/` change.** `npm run check-build` fails if they disagree, so a stale build can't slip through.
- The "banner" sections referenced elsewhere in these docs are the `src/js/*.js` files; the INIT marker is `/*! INIT */` (the `!` keeps esbuild from stripping it — tests cut the script there).

## Recorded audio
- `speak(text)` plays a recording when `app/audio/manifest.json` has one for that text, otherwise falls back to `speechSynthesis` (also on any playback error). An explicit voice override (settings voice preview) always uses TTS.
- Manifest: `{ "hola": "audio/hola.mp3" }` — key = text trimmed, single-spaced, lower-case (accents significant); value = `audio/<file>.mp3|ogg|m4a|wav` placed in `app/audio/`. The build validates keys/paths/file existence, inlines the map into the app, and writes every path into the service-worker precache list (between the `audio:start`/`audio:end` markers in `app/sw.js`, generated — never hand-edit). Run `npm run build` and commit all of it.
- `node tools/audio-test.js` tests this with SAMPLE files in `tools/fixtures/audio-app/audio/`; the shipped manifest is empty until real recordings exist.

## 4. Testing gates
```
node tools/validate-data.js   # data integrity: shapes, dup detection, week ranges, GQ answers, link formats
node tools/smoke-test.js      # headless runtime: loads app JS with DOM stubs, exercises every view,
                              # all 6 games, SRS grading, weekly test, tutorial, chest, raid
```
Both (plus `node tools/migrate-test.js`) must print PASS. They run against the BUILT `app/orale.html`; `npm test` builds, checks the build is current, then runs all three. If you add a feature, extend smoke-test.js to exercise it in the same session. A session that leaves the tools red is not complete.

## 5. Handoff packet format (for Qwen sessions)
A markdown file `/handoff/SESSION-N-packet.md` containing: objective (2 lines), the EXACT output format with 5 example rows, hard constraints (week range, register rules, banned duplicate list pasted in), the insertion point (banner comment name), and the validation command. Qwen must output only the array rows, nothing else — a Claude session or the owner pastes them in and runs the tools.

## 6. Release discipline
Versioning: semver in `APP_VERSION` + CHANGELOG. minor = feature session, patch = fixes. Git (once on GitHub): main protected, one branch per session (`s4-conjugation-trainer`), squash merge, tag releases. Pages serves `app/orale.html`.
