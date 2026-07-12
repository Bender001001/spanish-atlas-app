# ROADMAP — Session-wise Build Plan

How to use: open a Cowork session with the assigned model and say **"Complete Session N from docs/ROADMAP.md."** The session is done only when every acceptance criterion passes and CHANGELOG.md is updated. Sessions are ordered but S2-S9 are largely independent; S10-S12 must run last and in order.

## The team and the division of labor

| Model | Where | Role | Assign when the work needs... |
|---|---|---|---|
| **Claude Opus** | Cowork | Architect and QA gate | Architecture decisions, pedagogy/curriculum design, review of other models' output, ambiguous bugs, release sign-off |
| **Claude Fable** | Cowork | Primary builder | New features, UI/UX and design-system work, Spanish content needing cultural nuance (slang, idioms, register), documentation |
| **Qwen 3.6 (local, LM Studio + Cline)** | The owner's 7900 XTX rig | Bulk worker | Long autonomous sessions: data expansion from fixed templates, repetitive refactors, test authoring, link audits. Zero-cost tokens |

**Iron rules for Qwen output:** (1) Qwen only ever works from an explicit template and example rows given in the prompt; (2) everything Qwen produces must pass `tools/validate-data.js` and `tools/smoke-test.js`; (3) a Claude model spot-checks at least 10% of any Spanish content Qwen generates before merge (local models drift on Mexican register). Claude prepares Qwen's prompt packet at the end of the preceding session.

---

## ✅ S1 — English Tutorial & Onboarding (COMPLETE, v1.1.0)
Fable. 12-page English tutorial covering every feature, first-run auto-launch, ? header button, +25 XP completion reward.

## ✅ S2 — Vocabulary Expansion Pack A (weeks 1-13, COMPLETE, v1.4.0) — **Qwen**, Opus review
**Objective:** grow weeks 1-13 from 16 to ~30 words each (+~180 entries) so daily new-card supply never runs dry.
**Tasks:** Claude (5 min) drafts the template packet: exact array format `[week,"es","en"]`, per-week themes, banned duplicates list (export of current `V`). Qwen generates; run both tools; Claude spot-checks 20 random rows for MX usage (e.g., must prefer carro/platicar/camión over coche/charlar/autobús).
**Acceptance:** validate-data passes (no dup `es`, weeks 1-13 only, MX-register check noted in PR text); smoke test passes; deck size reported in CHANGELOG.
**Files:** app/orale.html (V array only).
**Done:** executed directly by Claude Fable (not Qwen) at user's request — Claude usage was available, so the Qwen hand-off was skipped this time. All acceptance criteria met: weeks 1-13 now 30-31 words each (+185), no duplicates, MX register throughout, both tools pass. See CHANGELOG.md [1.4.0].

## ✅ S3 — Vocabulary Expansion Pack B (weeks 14-26 + Trabajo bonus, COMPLETE, v1.12.0) — **Qwen**, Opus/Fable review
Same protocol as S2 for weeks 14-26 (+~180 entries). Optional stretch: a 40-word `Trabajo` bonus category (construction/steel-adjacent daily vocab) added as week-17-unlocked cards. Same acceptance gates.
**Done:** Core vocab expansion complete in v1.5.0 (weeks 14-26 at 30 words each, +182, no duplicates) — see CHANGELOG.md [1.5.0]. The optional Trabajo bonus category is now also complete in v1.12.0: 40-word `TR` construction/steel vocabulary set, unlocked at week 17, wired into `deck()` with its own category label; produced via Qwen, reviewed and merged by Claude Fable. Both tools pass (TR:40, deck 967 cards). See CHANGELOG.md [1.12.0]. S3 is fully closed, nothing deferred.

## ✅ S4 — Conjugation Trainer (COMPLETE, v1.2.0) — **Fable**
**Objective:** new Estudiar module drilling the 12 highest-value verbs across present / preterite / imperfect / ir+a future, spoken-first.
**Tasks:** data table of conjugations; drill UI (prompt: "yo + tener + ayer" → type/choose "tuve", with TTS); mistakes feed `S.miss` via pseudo-ids; XP + quest integration; tutorial page 13 added.
**Acceptance:** 12 verbs × 4 tenses × 6 persons in data; drill playable end-to-end; both tools pass; CHANGELOG v1.2.0.
**Done:** all acceptance criteria met — see CHANGELOG.md [1.2.0]. Not week-gated (available from the first session, like most Arena games); gating tenses/verbs to curriculum weeks is a candidate for the Backlog.

## ✅ S5 — Listening Lab (dialogues, COMPLETE, v1.6.0) — **Fable** builds engine, **Qwen** expands content
**Objective:** 20 two-voice mini-dialogues (A/B lines, alternating TTS voices/pitch), each with 3 comprehension MCQs, unlocked by week.
**Acceptance:** dialogue player with line-by-line replay and speed control; 8 dialogues authored by Fable (weeks 1-13); Qwen packet prepared for 12 more; tools pass.
**Done:** all 20 dialogues complete. Engine + 8 dialogues (weeks 1-13) in v1.3.0; remaining 12 (weeks 14-26) executed directly by Claude Fable per `/handoff/SESSION-5-packet.md`'s spec in v1.6.0 (Qwen hand-off skipped — usage was available). Both tools pass with DLG:20. See CHANGELOG.md [1.3.0] and [1.6.0].

## ✅ S6 — Story Mode (COMPLETE, v1.9.0) — **Opus** designs arcs & implements
**Objective:** 6 graded audio-stories (one per phase) told by Anselmo, 250-500 words, ~90% vocabulary from unlocked weeks, with quest framing and a 5-question check. This is the "campaign" layer for the RPG feel.
**Acceptance:** story reader with paragraph TTS, vocab-coverage script proves ≥85% of story tokens exist in deck or cognate list; tools pass.
**Done:** all acceptance criteria met — see orale-project/docs/CHANGELOG.md [1.9.0]. New "Historias" module in Estudiar: 6 stories (weeks 4/8/13/18/22/26) following one protagonist (Mateo) across the arc; paragraph-by-paragraph reader with per-paragraph es-MX TTS + speed control, quest framing, and a 5-question comprehension check via the shared quiz engine. Vocab-coverage proof added to `validate-data.js` (morphology-aware, names excluded): every story scores 89.2–94.4% (≥85% gate). Additive state (`stats.story`, `storyDone`), 2 achievements, tutorial page; no new nav tab. Both tools pass. Executed by Claude Opus (Fable hand-off skipped — usage available).

## ✅ S7 — Speech Practice v2 (recording, COMPLETE, v1.7.0) — **Fable**
**Objective:** MediaRecorder-based record/playback in the shadowing booth: hear native TTS, record yourself, A/B compare. Stays fully local (no upload). Graceful fallback when mic permission denied.
**Acceptance:** record → playback → discard loop works in Chrome/Edge; no localStorage bloat (audio kept in memory only); tutorial updated; tools pass.
**Done:** all acceptance criteria met — see CHANGELOG.md [1.7.0]. Record → playback → discard loop built into the Shadow Booth (record/play/compare-with-native/discard), fully in-memory via Blob + ObjectURL (no localStorage bloat), graceful fallback via `recSupported()` when MediaRecorder/mic unavailable, tutorial page updated, both tools pass.

## ✅ S8 — Analytics v2 (COMPLETE, v1.8.0) — **Fable**, **Qwen** for chart-code grunt work
**Objective:** dashboard deep-dive view: 90-day retention curve, due-load forecast (next 14 days), per-week mastery heatmap, hours vs 170h goal projection with finish-date estimate, CSV export of review log.
**Acceptance:** all charts render from real state with seeded fake data path for testing; export produces valid CSV; tools pass.
**Done:** all acceptance criteria met — see docs/CHANGELOG.md [1.8.0]. New "Análisis" sub-view of Panel; review log (`S.log`) added additively for retention/CSV; deterministic seeded demo mode; chart grunt work executed directly by Claude Fable (Qwen hand-off skipped).

## ✅ S9 — Boss Battles & Skill Tree (COMPLETE, v1.10.0) — **Opus** designs & implements
**Objective:** phase-end exams become "boss fights" (timed, mixed-skill, health bar, Anselmo commentary); visual 5-branch skill tree (Vocabulario / Oído / Voz / Gramática / Callejero) fed by existing stats; 6 boss badges.
**Acceptance:** boss playable for phases 1-6, defeat requires ≥80%; skill tree renders from state; tools pass; CHANGELOG v1.5.0.
**Done:** all acceptance criteria met — see orale-project/docs/CHANGELOG.md [1.10.0] (the "v1.5.0" above was a stale placeholder; actual release is v1.10.0). Six themed bosses (unlock weeks 4/8/13/18/22/26) reached from a new "Jefes de Fase" card in the Arena: each a 10-question, timed (15s/question), mixed-skill duel (vocab/listening/grammar/conjugation/false-friends/slang) with dual health bars and Anselmo intro/taunt/defeat commentary; win = ≥80% (the −13/−34 damage math makes the health bars and the 80% bar the same number). 6 boss badges (`b1`–`b6`) + best-score tracking. Visual 5-branch skill tree (`renderSkillTree`) levels 0–5 automatically from existing stats. Additive state only (`bossDone`, `bossBest`); shared quiz engine, router and nav untouched; tutorial page added. Both tools pass (validate asserts 6 bosses + 5 branches; smoke exercises a full win and a loss). Executed by Claude Opus (Fable hand-off skipped — usage available).

## ✅ S10 — PWA & Packaging (COMPLETE, v1.11.0) — **Fable**
**Objective:** installable offline app: manifest + service worker (inline or sibling files), app icon (SVG), version-aware cache. Must not break the single-file open-from-disk path.
**Acceptance:** installs from a local static server; still works double-clicked from disk; tools pass.
**Done:** see docs/CHANGELOG.md [1.11.0]. Sibling files `manifest.webmanifest` + `sw.js` + `icon.svg`; version-aware cache keyed off `sw.js?v=APP_VERSION`; `pwaInit` guard keeps `file://` untouched. Programmatic serve-test done; the in-browser install click-test is queued as an S11 QA checklist item.

## ✅ S11 — Content QA Pass (COMPLETE, v1.11.1) — **Opus** leads *(executed by Fable at the owner's direction)*
**Objective:** full native-register audit checklist executed over all Spanish strings (accents, MX register, slang safety/level labels), every external link click-tested, TTS pronunciation spot-check list, difficulty curve review of GQ bank.
**Acceptance:** QA report committed as docs/QA-REPORT.md with issues fixed or ticketed; tools pass.
**Done:** see docs/QA-REPORT.md. 1,420 strings audited (incl. retro-audit of the concurrently-merged S3 Trabajo module), 4 issues fixed (register glosses, missing *extrañar*, malformed GQ distractor). Final merged state re-gated at v1.12.0, deck 968. Link click-test environmentally blocked → 3-min manual checklist ticketed (re-runs at S12 on the live URL regardless). Opus may spot-check per report §5.5 at S12 sign-off.

## ✅ S12–S13 — v2.0 Release & GitHub (COMPLETE, v2.0.0) — **Opus** critical fixes, **Fable** release session
**Objective:** regression run of all features, docs freeze, repo publish: public GitHub repo, MIT license, GitHub Pages deployment of app/orale.html, release notes, README badges.
**Acceptance:** live Pages URL loads and completes tutorial + one review session; tagged release v2.0.0; CHANGELOG finalized.
**Done:** S12 (Opus) shipped the audit-critical fixes and keyboard shortcuts (v1.12.1–v1.12.2). S13 (Fable) closed the release: verification review of the Qwen audit + independent audit of the engine and `sw.js` (`docs/Claude Audit v1.12.2.md`) — headline finds were a release-blocking service-worker update-pinning bug and four siblings of the v1.12.1 stale-timer bug, all fixed; safe audit backlog implemented (ARIA completion, Tier B polish, batched saves with factory-reset guard); v2.0.0 cut with both gates PASS at deck 968; release zip + step-by-step publishing guide in `docs/GITHUB-GUIDE.md`; public community roadmap at repo root. Remaining acceptance item: the in-browser click-test on the live Pages URL (tutorial + one review session) — runs when the owner publishes, per the guide.

---

**Post-v2.0.0 planning lives in the public `ROADMAP.md` at the repo root** (community-facing: v2.1 / v2.2 / v2.3 / v3.0 milestones with sized items). The old unscheduled-ideas backlog has been folded into it. This file remains as the historical build log of Sessions 1–13.
