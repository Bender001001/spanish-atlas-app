# DEV GUIDE — Environment, Workflow, Assets, Testing

## 1. Environment
- **Runtime target:** modern Chromium (Chrome/Edge desktop) — required for good es-MX speechSynthesis voices. Firefox works with degraded TTS. The app must always work by double-clicking `app/orale.html` from disk (file://). No build step, no bundler, no external runtime dependency — ever.
- **Dev tools:** Node 18+ for `tools/` scripts. Nothing else.
- **Cowork sessions (Claude Opus / Fable):** open this project folder; read ROADMAP.md for the session, DESIGN.md before touching UI, this file before touching anything.
- **Known gotcha (S4):** in Cowork, file edits (Read/Edit/Write tools) land on the real OneDrive-synced file immediately, but the sandboxed shell's mounted view of the same OneDrive folder can lag behind by an unpredictable amount (observed: still stale after 15s+ and multiple intervening tool calls). Symptom: `node tools/*.js` run right after an edit reports old file size / "no script block" / stale counts even though the edit succeeded. Do not assume a shell-side failure means the edit failed — check the real file first (`Grep`/`Read`, which go through the same side as `Edit`). If you need a reliable test run and the shell mount is stale, build a byte-for-byte mirror in the shell's own `outputs` working directory (not under the OneDrive mount), apply the identical edits there with a script, run the test gate against that mirror, then cross-check structural line counts (`wc -l`, `grep -c .`) between the mirror and the real file via `Grep` to confirm they match before trusting the result. Never "fix" a stale read by rewriting the OneDrive file from a shell script — a buffered Python write to that mount truncated the file once (see CHANGELOG v1.2.0); `cp` of a known-good backup was safe, direct content rewrites were not.
- **Qwen 3.6 local (LM Studio + Cline on the 7900 XTX):** load the packet file the previous Claude session left in `/handoff/` (prompt + template + examples + banned list). Qwen edits only the file/array named in the packet. Context window: keep packets under ~8k tokens; for large data jobs, split into lettered sub-packets (A, B, C) of ≤120 rows each.

## 2. Workflow rules (all models)
1. One session = one ROADMAP entry. Do not exceed scope; log discovered ideas in the ROADMAP backlog instead.
2. Read before write: `view` the relevant section of orale.html; the file is one HTML document — CSS block, HTML skeleton, then one `<script>` organized by banner comments (`/* ==== DATA/ENGINE/VIEW: X ==== */`). Insert new code under the matching banner.
3. Append-only data (see DESIGN.md §5): card ids are positional.
4. State schema changes: additive with defaults in `fresh()` only.
5. Every session ends with: both tools passing, a manual browser sanity check (open app, run tutorial or a review), a CHANGELOG entry with version bump, and — if the next session is Qwen's — a packet written to `/handoff/`.
6. Backwards compatibility with existing user state is non-negotiable. If unsure, write a tiny migration in `load()`.
7. ~~Keep the app a SINGLE file until Session 10 (PWA) explicitly changes packaging.~~ **Updated by S10 (v1.11.0):** `app/` is now orale.html + three PWA siblings (`manifest.webmanifest`, `sw.js`, `icon.svg`). orale.html must still work standalone when double-clicked from disk — the siblings only activate over http(s). No further files without a ROADMAP session that says so. When bumping `APP_VERSION`, nothing else needs touching: the service worker cache is keyed off the registration query string.

## 3. Assets policy
- **No binary assets.** Icons are unicode glyphs or inline SVG. Fonts are local system stacks (DESIGN.md §2). Images: none until S10 icon (inline SVG).
- **Audio:** browser speechSynthesis only. Voice picking order: user choice → es-MX → es-US/es-419 → any es. Never hardcode a voice name.
- **External links:** free, public, stable. Prefer official sites and channel handles; for anything version-fragile use YouTube search URLs via the `yt(query)` helper (guaranteed not to rot). Every added link gets click-tested in the session that adds it; S11 re-audits all.
- **Spanish content standards:** Mexican register (carro not coche, platicar, camión=bus, ¿mande?); accents mandatory (á é í ó ú ñ ü ¿ ¡); slang no stronger than current entries; every SL row needs a natural example sentence; every FF row must be a genuine false friend, not a coincidence.

## 4. Testing gates
```
node tools/validate-data.js   # data integrity: shapes, dup detection, week ranges, GQ answers, link formats
node tools/smoke-test.js      # headless runtime: loads app JS with DOM stubs, exercises every view,
                              # all 6 games, SRS grading, weekly test, tutorial, chest, raid
```
Both must print PASS. They read `app/orale.html` directly — no copying needed. If you add a feature, extend smoke-test.js to exercise it in the same session. A session that leaves the tools red is not complete.

## 5. Handoff packet format (for Qwen sessions)
A markdown file `/handoff/SESSION-N-packet.md` containing: objective (2 lines), the EXACT output format with 5 example rows, hard constraints (week range, register rules, banned duplicate list pasted in), the insertion point (banner comment name), and the validation command. Qwen must output only the array rows, nothing else — a Claude session or the owner pastes them in and runs the tools.

## 6. Release discipline
Versioning: semver in `APP_VERSION` + CHANGELOG. minor = feature session, patch = fixes. Git (once on GitHub): main protected, one branch per session (`s4-conjugation-trainer`), squash merge, tag releases. Pages serves `app/orale.html`.
