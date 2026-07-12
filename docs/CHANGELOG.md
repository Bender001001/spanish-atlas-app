# CHANGELOG

All notable changes to ¡ÓRALE! are documented here. Format: [version] - date - model(s). Every merged session MUST append an entry: version bump (minor for features, patch for fixes), bullet list of changes, deck size, and test status.

## [2.0.0] - 2026-07-12 - Claude Fable (Session 13, release audit + v2.0 GitHub release)
### Fixed
- **Service worker update pinning** (release blocker, Claude Audit §2.1): `sw.js` served the app shell cache-first, so installed PWA users could never receive a new version — the cached HTML kept re-registering its own old `sw.js?v=`, and the version-aware cache retirement never triggered. The shell (navigations / `orale.html`) is now network-first with cache fallback; static assets remain cache-first. Offline behavior unchanged.
- **Stale timer/callback family** (Claude Audit §2.2, generalizes the v1.12.1 boss-timer fix): navigating away mid-activity no longer lets pending timers repaint the new view. Added a `NAVGEN` generation counter bumped in `recReset()` (guards the Rayo tick chain, Rayo answer callback, Constructor next-phrase timeout) and router-chokepoint clearing of `QZ`/`CQ`/`BOSS` with null-guards in `quizQ`/`quizAns`/`conjQ` (quiz engine 900ms advance, conjugation 1100ms feedback, boss 750ms advance).
- **Factory-reset resurrection guard**: with batched saves, the unload flush could have re-written deleted state after "Reiniciar todo". Reset now sets a `RESETTING` flag that disables all writes before `removeItem` + reload.
### Added
- **Batched localStorage saves** (Qwen Audit High #8, safe variant): `save()` is now an 800ms trailing throttle over `saveNow()`, with guaranteed flushes on `visibilitychange`(hidden)/`pagehide`/`beforeunload` and explicit `saveNow()` at settings-save and data-import. Cuts write amplification during review bursts (each grade previously triggered 3+ full-state writes).
- **ARIA completion** (Qwen Audit A1 remainder): `aria-live="polite"` on session-done, conjugation feedback/end, Rayo/Cog/Constructor end, and boss end screens; `aria-label="Escuchar"` on all ♪ speak buttons.
- **Tier B polish** (Qwen Audit §3.3/§2.2): quiz options get press feedback (`:active` scale); tab switches fade in (200ms, respects `prefers-reduced-motion`); XP bar glows briefly on level-up; speak buttons pulse while TTS is playing; new `@media(min-width:600px)` tablet spacing.
### Audit / process
- Full audit of v1.12.2 + verification review of the Qwen audit committed as `docs/Claude Audit v1.12.2.md`. Notable: `deck()` memoization (Qwen High #7) found already satisfied; Qwen's proposed save-batching design would have broken factory reset (§1.4); tutorial page count corrected (15, not 23).
- **v2.0.0 marks the first public GitHub release** (ROADMAP S12): repo publish, GitHub Pages, MIT. Publishing guide in `docs/GITHUB-GUIDE.md`; community roadmap in `ROADMAP.md` (root).
### Tests
- Data validation: PASS · Smoke: PASS · Deck: 968 cards (unchanged — engine/UX/infra session)

## [1.12.2] - 2026-07-10 - Claude Opus (Session 12 continued, A2 keyboard shortcuts)
### Added
- **Flashcard keyboard shortcuts** (Audit item A2): spacebar toggles card flip; keys `1`–`4` grade the current card (Otra vez / Difícil / Bien / Fácil). Works only when a flashcard stage is active (`#fc` element present), so other views are unaffected.
### Changed
- `APP_VERSION` 1.12.1 → 1.12.2 (retires stale PWA caches via the version-aware service worker).
### Tests
- Data validation: PASS · Smoke: PASS · Deck: 968 cards (unchanged — engine/UI session)

## [1.12.1] - 2026-07-10 - Claude Opus (Session 12, Qwen Audit v1.12.0 — targeted critical fixes)
### Fixed
- **Boss battle timer leak** (Audit Critical #4): `recReset()` now calls `clearInterval(BOSST)` at its top. Navigating away from a boss fight mid-battle (any nav via `go()`, which calls `recReset()`) previously left the 1-second `bossTick` interval running in the background. Fixed at the router chokepoint so every tab switch clears the stale timer.
- **Review-log hard cap** (Audit Critical #3): `S.log` trim changed from "drop to last ~92 days once over 4500 entries" to a hard count cap — `if(S.log.length>2000)S.log=S.log.slice(-2000)`. Keeps the most recent 2000 reviews and prevents localStorage bloat over long-term use. Ajustes copy updated ("se conservan los últimos ~2000") to stay truthful; the 90-day analytics chart still filters by date and is unaffected.
### Changed
- `APP_VERSION` 1.12.0 → 1.12.1 (also retires stale PWA caches via the version-aware service worker).
### Scope / process
- Only the two data-integrity/bug items were touched by Opus (minimal-token pass at the owner's direction). All other audit items — ARIA/accessibility, onboarding split, keyboard shortcuts, deck() memoization, save batching, light mode, card browser, animations, etc. — are **handed off to Qwen (local/free)**. See the S12 handoff note below and the audit doc §7.
- **Deliberately NOT done — flagged for discussion:** IIFE engine wrap (Audit Critical #1). The app uses inline `onclick="…"` handlers throughout; wrapping everything in an IIFE breaks all of them unless every handler is re-exported to `window`. High-risk, sweeping, and low value for a single-file PWA that is never embedded in another page. Recommend skipping or doing as its own isolated, well-tested session — not folding it into a routine fix pass.
### Tests
- Data validation: PASS · Smoke: PASS · Deck: 968 cards (unchanged — no data touched)

## [1.12.0] - 2026-07-10 - Claude Fable (Session 3, Vocabulary Expansion Pack B completion)
### Added
- Trabajo bonus category: 40-word construction/steel-adjacent vocabulary set (`TR` data array), unlocked at week 17 — covers site essentials (el acero, el cimiento, la viga, soldar, el plano), safety gear (casco de seguridad, arneses, guantes), tools (martillo, taladro, sierra, nivel), and workplace/admin terms (nómina, seguro, pensión, ascenso)
- `TR` integrated into the deck builder: new `deck()` call adds Trabajo cards with `[es, en]` shape; category label "Trabajo" appears in dashboard/repair views alongside existing categories
- `tools/validate-data.js` extended to validate `TR` array shape (2-field rows, string types) and report count in the deck-source log line
### Notes
- Completes the deferred Trabajo bonus from Session 3's CHANGELOG ("flag if you want it done as its own small architecture session") — implemented here as a same-shape content addition: new source array + `deck()` hook + validator check, no UI or engine changes beyond category-label rendering (handled by existing generic category logic)
### Tests
- Data validation: PASS (TR:40, V:783, PH:78, SL:38, ID:28, FF:40, CG:41, FX:22, GQ:24, CJ:12, DLG:20, ST:6) · Smoke: PASS (all views, games, SRS, test, story mode, boss battles, skill tree, tutorial, chest, raid, pwa guard) · Deck: 967 cards (was 927 — +40 Trabajo entries)
### Post-merge amendment (S11 QA session, same day)
- This session ran concurrently with the S11 QA pass ([1.11.1] below); OneDrive merged both edit sets. The merged file was re-gated as one unit by the QA session: validate PASS (V:784 — includes QA's *extrañar* addition, TR:40), smoke PASS, **final merged deck: 968 cards**, APP_VERSION consolidated to 1.12.0
- The 40 TR strings were retro-audited with the S11 tooling + manual register read: zero flags ("el concreto / hormigón" correctly leads with the MX term; one TTS ear-check item added to QA-REPORT §5.3 for its slash). This satisfies the "Opus/Fable review" that S3's ROADMAP entry called for
- Process note for S12: two sessions writing to the OneDrive folder simultaneously produced a benign merge this time, but don't rely on it — serialize sessions until the repo moves to git

## [1.11.1] - 2026-07-10 - Claude Fable (Session 11, QA pass)
### Changed
- S11 Content QA Pass executed (by Fable at the owner's explicit direction — ROADMAP assigned Opus; deviation documented in docs/QA-REPORT.md §Executed-by). 1,379 Spanish strings audited via new `tools/qa-audit.js` + full manual read of SL/ID/FF/GQ/stories/dialogue-sample/Anselmo
- V733 `charlar` gloss → "to chat (Spain — Mexicans say platicar)"; V589 `echar de menos` gloss → flags MX default *extrañar*
- New card appended: `[20,"extrañar","to miss someone (the MX way: te extraño)"]` — deck 927→928
- GQ #6 malformed distractor "quiero puedo" → "puedes" (also removed a second semantically-correct answer)
### Notes
- Full findings, clean-bill sections, GQ curve review, TTS ear-check list and 5 ticketed items in docs/QA-REPORT.md
- Live link click-test blocked by sandbox network this session — format audit passed; 3-minute manual checklist ticketed (re-run required on the live URL at S12 anyway)
### Tests
- Data validation: PASS · Smoke: PASS · Story coverage 89.2–94.4% · Deck: 928 cards

## [1.11.0] - 2026-07-10 - Claude Fable (Session 10)
### Added
- PWA packaging (ends the single-file-only era per DEV-GUIDE §2.7, by design): three sibling files join `app/` — `manifest.webmanifest` (standalone display, es-MX, education category, maskable-ready icon entries), `sw.js` (service worker), and `icon.svg` (talavera-sun app icon in DESIGN.md palette, content inside the maskable safe zone)
- Version-aware offline cache: orale.html registers `sw.js?v=APP_VERSION`, the worker derives its cache name (`orale-v<version>`) from that query param and deletes all older `orale-v*` caches on activate — bumping `APP_VERSION` automatically retires stale caches, no second version constant to keep in sync
- Cache strategy: pre-caches the four core assets on install; runtime cache-first with network fallback for same-origin GETs only (cross-origin — external links, media — never touched); navigation falls back to cached `orale.html` when offline
- Guarded registration (`pwaInit`, new `PWA (S10)` banner): registers only when `serviceWorker` is supported AND protocol is http/https — double-clicking from disk (`file://`) remains a silent no-op, preserving the original open-from-disk path untouched
- Head additions: manifest link, `theme-color`, SVG favicon + apple-touch icon (all harmless on `file://`)
- New tutorial page "Install it like a real app" documenting install, offline behavior, and the different-origin caveat for progress (with the Exportar/Importar remedy)
### Notes
- Real-browser install click-test (address-bar install icon from a local static server) left for the owner/S11 — verified programmatically this session: all four assets serve 200 from a static server, manifest parses with correct fields, sw.js compiles, versioned registration URL resolves
- OneDrive shell-mount staleness hit again mid-session; gate run per DEV-GUIDE §1 mirror procedure (anchors + line counts verified identical to the real file)
### Tests
- Data validation: PASS · Smoke: PASS — new runtime checks prove `pwaInit` is a no-op without SW support and on `file://`, registers version-aware on https, and version matches `APP_VERSION`; new node-side static checks validate manifest JSON/fields, sw.js syntax + version-aware cache + old-cache cleanup, icon.svg, and head links · Deck: 927 cards (unchanged — packaging session)

## [1.10.0] - 2026-07-10 - Claude Opus (Session 9)
### Added
- Boss Battles (S9): each of the 6 curriculum phases now ends in a boss fight, reached from a new **Jefes de Fase** card in the Arena (new `BOSSES` roster + `BOSS BATTLES & SKILL TREE (S9)` engine banner). Bosses unlock at weeks 4 / 8 / 13 / 18 / 22 / 26
- Each fight is timed and mixed-skill: `buildBossItems()` assembles 10 questions from vocabulary (`mcq`), listening (`listenQ`), grammar (`GQ`), conjugation (a new `bossConj` builder over `CJ`), false friends, and — from phase 5 — slang, all drawn from that phase's unlocked weeks. A per-question 15-second countdown (timeout counts as a miss) supplies the "timed" pressure
- Dual health bars: each correct answer damages the boss (−13), each miss damages you (−34, so three misses = defeat); a win requires ≥80% (8/10), which is exactly the damage that drains the boss to zero — the health mechanic and the pass bar are the same number. Anselmo delivers boss-specific intro / taunt / defeat commentary via `buddy()` throughout
- Six themed bosses with flavor — El Trabalenguas, El Tragón, El Chofer Fantasma, La Comadre, El Rey del Albur, and the final boss La Duda (your own doubt) — plus six boss badges (`b1`–`b6`) and per-phase best-score tracking (`S.bossBest`)
- Skill Tree (S9): a visual 5-branch RPG character sheet (Vocabulario / Oído / Voz / Gramática / Callejero), reached from the Arena, each branch auto-leveling 0–5 from existing stats — mastered cards, dialogues + stories, shadowing reps, conjugation rounds, and slang/idioms learned — with node dots, next-level thresholds and a total "poder" score (`skillTree()` / `renderSkillTree()`). No new data to maintain; it purely reads state
- New English tutorial page documenting the bosses and the skill tree
- Launched from the Arena, so no new nav tab; additive state only (`S.bossDone`, `S.bossBest`, default-safe in `fresh()`/`load()`)
### Notes
- S9 was slated Opus-design + Fable-implement; executed end-to-end by Claude Opus in-session (usage headroom; consistent with prior single-model sessions)
- Append-only per DESIGN §5; the shared quiz engine is untouched (bosses run their own timed loop, like the arcade games); `quests()` still returns 4; router/nav unchanged
- The roadmap's "CHANGELOG v1.5.0" note under S9 was a stale version placeholder; the actual release is v1.10.0, continuing the post-1.8.0 sequence
- OneDrive shell-mount staleness (DEV-GUIDE §1) handled per the documented byte-verified-mirror procedure; both tools were re-run green directly against the published canonical file
### Tests
- Data validation: PASS — new checks assert `BOSSES` has exactly 6 entries in phase order, each with name/intro/defeat/taunt, and that `skillTree()` returns 5 branches
- Smoke: PASS — new checks exercise the Arena launchers, the skill-tree render, the boss unlock frontier (locked before week 4, phase-6 boss unlocked at week 26), a full 10-question mixed-skill fight, a ≥80% victory that records `bossDone` and awards badge `b1`, and a three-miss defeat that correctly does NOT mark the boss defeated
- Deck: 927 SRS cards (unchanged — bosses compose from existing pools, the skill tree reads existing stats). Boss roster: 6 · boss badges: 6

## [1.9.0] - 2026-07-10 - Claude Opus (Session 6)
### Added
- Story Mode (S6): the "campaign" layer — a new **Historias** module in Estudiar with 6 graded audio-stories (new `ST` data array + `STORY MODE (S6)` engine banner), one per curriculum phase, following a single protagonist (Mateo) across the 26-week arc from arrival to mastery
- Each story is 250-500 Spanish words in 4-5 paragraphs with Anselmo quest framing, unlocked by week (4 / 8 / 13 / 18 / 22 / 26). A paragraph-by-paragraph reader (`storyPage`) gives per-paragraph TTS (♪ Escuchar) at a storytelling rate with − lento / + rápido controls and prev/next navigation, then a 5-question comprehension check runs through the shared `quizRun` engine (pseudo-ids `st{i}_{j}` feed `S.miss`, exactly like dialogues)
- Graded vocabulary: ~90% of each story draws on already-unlocked weeks. A new vocab-coverage proof in `validate-data.js` confirms ≥85% of every story's tokens resolve to the deck or cognate list — morphology-aware (regular present/preterite/imperfect conjugations, gender/number variants, de-reflexive infinitives) with character/place names excluded from the denominator. Measured coverage: 89.2%–94.4%
- RPG/progress integration, all additive and default-safe in `fresh()`/`load()`: `S.stats.story`, `S.storyDone[]`, `day().story`; XP on completion (8 per correct answer), Anselmo win/fail lines, and two new achievements (Primera Crónica; Cronista de Óralelandia for all 6)
- New English tutorial page documenting Story Mode
- Launched from Estudiar (mirroring the Listening Lab), so no new nav tab — the 5-zone shell is unchanged
### Notes
- S6 was slated Opus-design + Fable-implement; executed end-to-end by Claude Opus in-session (usage headroom; consistent with prior single-model sessions)
- Append-only per DESIGN §5: new arrays/functions/state and small additive hooks only; no existing row reordered or deleted, no nav/router change, `quests()` still returns 4
- OneDrive shell-mount staleness (DEV-GUIDE §1) hit again this session (open-file truncation on the Linux mount); built and gated against a byte-verified mirror per the documented procedure, then re-ran both tools directly against the published canonical file — both green
### Tests
- Data validation: PASS — new checks assert `ST` has exactly 6 stories, each 250-500 words, exactly 5 four-option MCQs with a valid answer index, quest/note present, phase ordering, and the ≥85% coverage proof (logs each story's word count + coverage %)
- Smoke: PASS — new checks exercise the story unlock frontier (0 before week 4, all 6 at week 26), the reader (`storyOpen`/`storyIntro`/`storyPage`/`storySpeak`), the 5-question comprehension check, `S.stats.story` + `S.storyDone` tracking across two stories, and the Historias entry in the Estudiar menu
- Deck: 927 SRS cards (unchanged — Story Mode is a comprehension layer, not new SRS rows). Story source: 6 stories · 30 comprehension questions

## [1.8.0] - 2026-07-09 - Claude Fable (Session 8)
### Added
- Analytics v2: a full deep-dive stats view (`renderAnalytics`, new `VIEW: ANALYTICS v2` banner) reached from a new "Análisis" card on the Panel — sub-view of Panel, no new nav tab
- 90-day retention curve: line chart of % of reviews graded above "Otra vez" per day, with an 85% reference line; powered by a new append-only review log `S.log` (`[epochDay, cardId, grade]`, additive default in `fresh()`, written by `grade()`, auto-pruned to ~92 days once past 4,500 entries — no localStorage bloat)
- Due-load forecast: 14-day bar chart of upcoming card expirations from real SRS `due` timestamps; the "hoy" bar (red) includes everything already overdue
- Per-week mastery heatmap: 26 cells colored by % of that week's cards at interval ≥7 days, locked weeks dimmed, counts in tooltips, legend included
- 170-hour goal projection: pace over the last 28 days, remaining time, estimated finish date (`es-MX` formatted), plus progress bar; handles the zero-pace and goal-reached edge cases
- CSV export of the review log (`buildReviewCSV` + Blob download, UTF-8 BOM for Excel): `fecha,tarjeta_id,espanol,ingles,calificacion`; button disabled while the log is empty
- Seeded fake-data path for testing: "Demo con datos de prueba" toggle renders every chart from a deterministic (seeded LCG) 90-day synthetic state without touching real state or `localStorage`
- Tutorial Panel page updated to document the Análisis room and demo button
### Notes
- Chart-code grunt work was slated for Qwen; executed directly by Claude Fable in-session (consistent with S2/S3/S5 precedent — usage headroom available)
- Retention history starts accruing from this version; the curve fills in as reviews happen (demo mode shows the full picture immediately)
### Tests
- Data validation: PASS · Smoke: PASS — new checks assert log recording + entry shape, heatmap has exactly 26 cells, CSV header/row-count/row-format, export path, demo seed size, demo toggle on/off, and log pruning cap · Deck: 927 cards (unchanged — engine/UI session)
- Note: OneDrive shell-mount staleness (DEV-GUIDE §1 gotcha) hit again this session; gate was run against a byte-verified mirror per the documented procedure (anchors + line counts + symbol positions matched the real file exactly)

## [1.7.0] - 2026-07-09 - Claude Fable (Session 7)
### Added
- Speech Practice v2: MediaRecorder-based record/playback added directly to the shadowing booth
- `🎙 Grabar mi voz` records the user via `getUserMedia`; `▶ Escuchar mi grabación` plays it back; `♪ Comparar con nativo` replays the native TTS for an A/B comparison; `🗑 Descartar` clears it and allows re-recording
- Fully local: recorded audio lives only as an in-memory `Blob`/object URL (`REC` state), never written to `localStorage` or uploaded anywhere; object URLs and mic tracks are released on discard, on a new shadow phrase, and on any navigation away (`go()` now calls `recReset()`)
- Graceful degradation: `recSupported()` feature-detects `MediaRecorder`/`getUserMedia` and swaps in a muted note when unavailable — covers both "browser doesn't support it" and the mic-permission-denied/insecure-context case (e.g. plain `file://`), each surfaced as a friendly toast rather than a broken UI
- Tutorial's shadowing-booth page updated to document the record/playback/compare/discard loop and the local-only privacy note
### Tests
- Syntax: PASS · Data validation: PASS · Smoke: PASS — new checks confirm `recSupported()` is false with no mic stubbed (the realistic file:// default) and true once `MediaRecorder`/`getUserMedia`/`URL.createObjectURL`/`Audio` are mocked, then exercises record → discard → reset without touching real hardware · Deck: 927 cards (unchanged, this is a UI/engine feature not a data session)

## [1.6.0] - 2026-07-09 - Claude Fable (Session 5, Qwen-half batch)
### Added
- Listening Lab expanded to its full 20-dialogue scope: 12 more two-voice dialogues for weeks 14-26, following `/handoff/SESSION-5-packet.md`'s exact schema and hard constraints (executed directly by Claude Fable rather than handed to Qwen — usage headroom available)
- Weeks covered: 14 (opinions/tacos-vs-pizza), 15 (feelings/weather small talk), 16 (phone/rescheduling), 17 (work/career), 18 (storytelling fillers), 19 (Mexican slang core), 20 (crudo/idioms), 21 (subjunctive send-off), 22 (regional identity/carrilla), 23 (ear training), 24 (hypothetical debate), 25 (language exchange/repair strategies)
- Week 26 intentionally skipped for this batch (13 curriculum weeks, 12 dialogues per the packet's own "skip one" instruction) — El Examen Final is a capstone/testing week rather than a new dialogue scene
- `tools/smoke-test.js` DLG-count assertion updated from 8 to 20
### Notes
- S5 is now fully closed: engine + all 20 dialogues + both tools passing. See ROADMAP.md S5 status.
### Tests
- Syntax: PASS · Data validation: PASS (DLG:20, no duplicate titles) · Smoke: PASS · Deck: 927 cards (unchanged — DLG is a separate table)

## [1.5.0] - 2026-07-09 - Claude Fable (Session 3, core module)
### Added
- Vocabulary Expansion Pack B: weeks 14-26 grown from 16 to 30 words each (+182 entries), same protocol as Session 2
- Week 14: opinion/argument connectors (creo que, me parece que, en mi opinión, la neta, comparar, analizar...)
- Week 15: feelings + weather vocab (contento, deprimido, harto, relajado, nublado, soleado, húmedo...)
- Week 16: phone/scheduling vocab (buzón, agenda, reprogramar, colgar, vibrar, línea ocupada...)
- Week 17: career/workplace vocab (carrera, currículum, entrevista, contratar, jubilarse, ascenso...)
- Week 18: storytelling fillers and narration verbs (o algo así, digamos, de plano, luego luego, anécdota, narrar...)
- Week 19: logical connectors (por lo tanto, de hecho, en realidad, ni siquiera, a propósito...)
- Week 20: idiomatic verb-particle combos (echar de menos, caer bien/mal, quedar bien, salir bien/mal, dar igual...)
- Week 21: subjunctive-trigger phrases (ojalá, es posible que, antes de que, a menos que, cualquiera...)
- Week 22: humor/regional-identity vocab tied directly to the curriculum's own week-22 note (albur, carrilla, norteño, chilango, costeño, buena onda/mala onda...)
- Week 23: pronunciation/ear-training vocab (velocidad, sílaba, acentuar, enlazar, susurrar, tartamudear...)
- Week 24: conditional/hypothetical forms (si tuviera, si pudiera, haría, sería, tendría, podría, me gustaría...)
- Week 25: repair-strategy phrases for real conversations (¿cómo se dice?, ¿qué significa?, romper el hielo, arriesgarse...)
- Week 26: closing/celebration vocab (recompensa, graduarse, valió la pena, misión cumplida, nunca te rindas...)
### Deferred
- The ROADMAP's optional "Trabajo" 40-word bonus category (construction/steel-adjacent vocab, week-17-unlocked) was **not** implemented this session. It would need a new deck category (a new source array plus changes to `deck()`, category labels in the dashboard/repair views, and CSS) rather than plain vocab rows — out of scope for a same-protocol-as-S2 content session. Left as an explicit follow-up in ROADMAP.md; flag if you want it done as its own small architecture session.
### Notes
- Like Session 2, this was originally Qwen-scoped bulk work executed directly by Claude Fable at the user's request (usage headroom available). Same gates applied: no duplicate `es` rows, MX register, weeks 14-26 only.
### Tests
- Syntax: PASS · Data validation: PASS (V:783, no dup `es`) · Smoke: PASS · Deck: 927 cards (was 745)

## [1.4.0] - 2026-07-09 - Claude Fable (Session 2)
### Added
- Vocabulary Expansion Pack A: weeks 1-13 grown from 16 to 30-31 words each (+185 entries), targeting `~30 words/week` per ROADMAP S2
- Week 1: courtesy/greeting extras (buenas, qué tal, con permiso, disculpe, salud, provecho, señor/señora/señorita...)
- Week 2: ser/estar conjugated forms + people-description adjectives (soy/estoy/eres/está, casado, simpático, guapo...)
- Week 3: core numbers + time/punctuality vocab (uno-cien, mediodía, reloj, ahorita, tardar...)
- Week 4: extra question words and hedging phrases (cuántos/cuántas/cuáles/quiénes, ni idea, más o menos...)
- Week 5: high-frequency present-tense verbs beyond the Big 5 (trabajar, estudiar, escribir, caminar, empezar...)
- Week 6: taquería/food-market vocabulary (taco, quesadilla, elote, aguacate, cilantro...)
- Week 7: extended family + MX physical-description terms (abuelo/abuela, cuñado, suegra, güero, flaco...)
- Week 8: more reflexive routine verbs + habit vocab (peinarse, afeitarse, acostarse, horario, puntualidad...)
- Week 9: transit/navigation vocabulary (parada, estación, boleto, cruzar, tráfico...)
- Week 10: shopping/checkout vocabulary (descuento, probador, tarjeta, recibo, regatear...)
- Week 11: 3rd-person preterite forms (fue, tuvo, hizo, dijo, vino, llegó...) complementing the existing 1st-person set
- Week 12: 3rd-person imperfect forms (jugaba, tenía, iba, era, estaba...) plus recuerdo/niñez
- Week 13: body parts and emergency/pharmacy vocabulary (garganta, corazón, ambulancia, hospital, doctor/doctora...)
### Notes
- Session originally scoped for Qwen (bulk/template-driven, per WORKFLOW.md) but executed directly by Claude Fable at the user's request (Claude usage headroom available) — same acceptance gates applied (no duplicate `es` entries, MX register, weeks 1-13 only, both tools pass).
- `V` internal-duplicate check in `tools/validate-data.js` was the primary correctness gate; every new entry was manually cross-checked against all 416 pre-existing rows plus the other 12 sessions' worth of new rows before merge — zero duplicates flagged on first run.
### Tests
- Syntax: PASS · Data validation: PASS (V:601, no dup `es`) · Smoke: PASS · Deck: 745 cards (was 560)

## [1.3.0] - 2026-07-09 - Claude Fable (Session 5, Fable half)
### Added
- Listening Lab (Estudiar's 6th tool): two-voice mini-dialogue player with line-by-line playback, per-line replay, and speed control (0.55-1.3x, shared pattern with the shadowing booth)
- `DLG` data array: 8 two-voice dialogues authored for weeks 1-13 (greetings, time/plans, Big-5-verb future, taquería ordering, reflexive routines, directions, preterite catch-up, pharmacy visit), each with 3 Spanish-language comprehension MCQs run through the existing `quizRun` engine
- Two-voice TTS: `speak()` extended with optional `pitch` and `voiceOverride` params (backward compatible — existing calls unaffected); dialogue lines alternate pitch (and voice, if the browser exposes more than one Spanish voice) by line parity
- Dialogue completion tracked via `S.dlgDone` (additive) and `S.stats.dlg` / `day().dlg` counters; comprehension mistakes feed `S.miss` via `dlg{i}_{j}` pseudo-ids, same mechanism as flashcards and the conjugation trainer
- 2 new achievements (Oído de Barrio, Maestro del Oído)
- `/handoff/SESSION-5-packet.md`: Qwen packet for the remaining 12 dialogues (weeks 14-26), per DEV-GUIDE §5 format
- Tutorial's Estudiar page updated from "Five tools" to "Six tools" with a Diálogos bullet (text-accuracy fix, not a new tutorial page — out of this session's acceptance criteria)
### Changed
- `tools/validate-data.js` and `tools/smoke-test.js` extended to validate/exercise `DLG` (shape, week range, duplicate-title check, unlock frontier, full play-through of dialogue → comprehension quiz → stats)
### Tests
- Syntax: PASS · Data validation: PASS (DLG:8) · Smoke: PASS (dialogue playback, line-parity TTS, forced MCQ completion, unlock-frontier check) · Deck: 560 cards (unchanged — DLG is a separate table, not part of the SRS deck)
### Notes
- This is the Fable half of Session 5 only (engine + 8 dialogues). Session 5 is not fully closed until the Qwen packet is run and reviewed (~10% MX-register spot-check) — see ROADMAP.md S5 status.

## [1.2.0] - 2026-07-09 - Claude Fable (Session 4)
### Added
- Conjugation Trainer (Estudiar's 5th tool): 12 highest-value verbs (ser, estar, tener, ir, querer, poder, hacer, decir, saber, poner, venir, dar) drilled across present, preterite, imperfect and ir+a+infinitive future — 288 conjugated forms across 6 persons (yo/tú/él-ella-Ud./nosotros/ustedes/ellos-ellas), `CJ` data array
- Prompt format: person + verb + Spanish time cue (e.g. "yo + tener + ayer"); TTS on the prompt and on reveal
- Type-to-answer (accent-insensitive matching) with a "No sé, dame opciones" multiple-choice fallback
- Mistakes tracked via `cj{verb}_{tense}_{person}` pseudo-ids in `S.miss`, biasing future rounds toward weak items
- 4th daily quest ("Practica conjugación") and `day().conj` / `S.stats.conj` counters, additive to state schema
- 2 new achievements (Verbo Domado, Políglota Verbal); tutorial page 13 added explaining the trainer; English tutorial's Estudiar/Panel/first-week pages updated for the 4-mission, 5-tool system
- `APP_VERSION` bumped to 1.2.0
### Changed
- `tools/validate-data.js` and `tools/smoke-test.js` extended to validate/exercise `CJ` and the new quest count
### Fixed
- None (see Notes — a shell-side file corruption during this session was caught and reverted before merge, not shipped)
### Notes
- Mid-session, a Python script writing directly to the OneDrive-mounted `app/orale.html` via the sandbox shell truncated the file; caught immediately by the test gate ("no script block"), restored from the untouched top-level `orale.html` backup, and all edits were redone through the Read/Edit tool path only. Documented as a gotcha in `DEV-GUIDE.md` §1 for future sessions: the sandbox shell's view of the OneDrive folder can lag well behind Edit-tool writes, so don't trust a shell-side `node tools/*.js` run immediately after an edit without cross-checking the real file first.
### Tests
- Syntax: PASS · Data validation: PASS (CJ:12) · Smoke: PASS (conjugation round, options mode, typed mode, quest count all exercised) · Deck: 560 cards (unchanged; CJ is a separate 12-verb table, not part of the SRS deck)

## [1.1.0] - 2026-07-08 - Claude Fable (Session 1)
### Added
- 12-page English tutorial covering every feature and all Spanish UI terms
- First-run auto-launch of tutorial; reopenable via new "?" header button
- +25 XP one-time tutorial completion reward; `tut` flag in state schema
- `APP_VERSION` constant (1.1.0)
### Tests
- Syntax: PASS (node --check) · Smoke: PASS (all views, 6 games, test flow, tutorial flow) · Deck: 560 cards

## [1.0.0] - 2026-07-08 - Claude Fable (initial build)
### Added
- Single-file app: 5 zones (Panel / Estudiar / Arena / Códice / Cantina) with per-zone themes and typography
- 26-week Mexican Spanish curriculum, 6 phases, weekly gated exams (75% pass), speaking missions, curated free resources
- SRS engine (SM-2 variant): 560 cards (416 vocab, 78 phrases, 38 slang, 28 idioms), 15 new/day cap, es-MX TTS on every card
- Repair queue from miss-tracking; Memory Raid random retention checks (manual + surprise)
- Shadowing booth with speed control (0.55-1.3x)
- Arena: Rayo, Oído, Trampa, Constructor, ¿Amigo o Traidor?, Asalto de Memoria
- Gamification: XP, 12 levels/ranks, pesos, streaks, 3 daily missions, variable-reward chest, 14 achievements
- Cantina: slang, idioms (28), false friends (40), cognates (40), fun facts (22, chest-gated), media library
- Dashboard: 14-day minutes chart (canvas), category mastery bars, weak zones, achievements wall
- Buddy: Profesor Anselmo with contextual quips (greet/win/fail/streak/test/level)
- localStorage persistence, export/import backup, settings (name, voice, week override, reset)
- Session time auto-tracking (30s ticks while visible)
### Tests
- Syntax: PASS · Smoke: PASS · Deck: 560 cards
