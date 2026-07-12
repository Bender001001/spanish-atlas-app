# Qwen Handoff — post-Audit v1.12.0 (Session 12)

**From:** Claude Opus (S12) · **To:** Qwen (local)
**Base file:** `app/orale.html` — now at **v1.12.1** (single file; all CSS/JS inline)
**Backup of pre-S12 state:** `app/backups/orale-v1.12.0-backup-*.html`

## What Claude already did (do NOT redo)
- **Boss timer leak** — `recReset()` now starts with `clearInterval(BOSST)`.
- **Log cap** — the `S.log` trim is now `if(S.log.length>2000)S.log=S.log.slice(-2000)`; the Ajustes copy line was updated to "se conservan los últimos ~2000".
- **APP_VERSION** bumped to `1.12.1`.

## What Claude deliberately skipped
- **Audit Critical #1 (IIFE engine wrap): DO NOT DO THIS unless the owner explicitly asks.** The app wires every button with inline `onclick="…"` (e.g. `go`, `hideBuddy`, `ans`, `window.__rayo`). Wrapping the script in an IIFE hides all those functions from the HTML and breaks every button unless each handler is re-exported to `window`. High risk, no benefit for a standalone single-file app. Leave as-is.

## Ground rules for every change below
1. **Work in `app/orale.html` only.** It is one file — CSS lives in `<style>` (~lines 12–212), markup ~213–240, JS in the big `<script>` from ~243 to the end.
2. **After ANY change, bump `APP_VERSION`** (line ~1407) one patch level and **add a CHANGELOG entry** in `docs/CHANGELOG.md` (newest at top, copy the existing format: version, date, model=Qwen, bullets, and the Tests line).
3. **Re-run both gates before you consider a change done:**
   `node tools/validate-data.js` and `node tools/smoke-test.js` — both must print `PASS`. Deck must stay **968** unless you intentionally added cards.
4. **Additive only.** Don't rename existing functions or restructure the engine. Add classes/attributes/handlers alongside what exists.
5. Line numbers below are approximate anchors — search for the quoted text, don't trust the number blindly (edits shift lines).

---

## TIER A — mechanical, safe, do these first

### A1. ARIA roles & labels (Audit Critical #2, §2.3, §2.5)
Static markup, ~lines 216–239.
- `<main id="view">` (line ~231) → add `role="main"`.
- `<nav>` (line ~232) → add `role="navigation" aria-label="Navegación principal"`.
- Each of the 5 nav `<button>`s (lines ~233–237) → add an `aria-label`, e.g. `aria-label="Panel"`, `"Estudiar"`, `"Arena"`, `"Códice"`, `"Cantina"`.
- Score/result displays: add `aria-live="polite"` to the quiz result container. Search for `class="bigscore"` (appears in `quizQ` end screen ~1222, boss end ~1354, session-done ~1068) — add `aria-live="polite"` to the wrapping `<div class="card" …>`.
- The XP number `<b id="xp-num">` (line ~227) → add `aria-live="polite"`.
Test: smoke should still PASS (ARIA doesn't affect logic).

### A2. Flashcard keyboard shortcuts (Audit High #6, §2.2)
The flashcard render is `showCard()` (~1068–1073). Flip is `onclick="this.classList.toggle('flip')"` on `#fc`; grading is `ans(0..3)` (buttons ~1072, handler `ans` ~1075).
Add a single global `keydown` listener (near INIT, ~line 1439, next to the existing `setInterval`):
```js
document.addEventListener("keydown",e=>{
  var fc=document.getElementById("fc"); if(!fc) return;      // only when a card is on screen
  if(e.key===" "||e.code==="Space"){e.preventDefault();fc.classList.toggle("flip");}
  else if(e.key>="1"&&e.key<="4"){ans(+e.key-1);}            // 1=Otra vez … 4=Fácil
});
```
Guard on `#fc` existing so keys do nothing on other screens. Test manually + smoke PASS.

### A3. Modal safety on short screens (§3.2)
`.modal` (line ~190) already has `max-height:86vh;overflow-y:auto` — audit asked for this and it's **already present**. No action; just confirm and note "already satisfied" in changelog if you touch nearby CSS.

### A4. Tablet breakpoint (§1.1)
There's one media query, `@media(max-width:420px)` (line ~198). Optionally add a `@media(min-width:600px)` block to widen spacing on tablets (app max-width is 760px). Low priority, purely cosmetic.

---

## TIER B — small CSS/animation polish (§3.3, §2.2)

All are additive CSS or one-line tweaks.
- **Button feedback on quiz options:** `.opt` (line ~128) — add `transition:border-color .12s, transform .12s;` and a `.opt:active{transform:scale(.98)}` rule (mirrors the existing `.btn:active` at line ~71).
- **Toast slide-in:** the `@keyframes pop` (line ~186) already slides from `translateY(12px)`. Audit wanted slide-in — **already effectively done**; optionally soften. Low priority.
- **XP level-up glow:** `.xp-fill` (line ~55) has `transition:width .5s ease`. Add a temporary glow when leveling up: in `renderHeader()` / wherever level increases, toggle a `.leveling` class that applies `box-shadow:0 0 12px var(--mari)`. Needs finding the level-up moment — search `lvlOf(`; medium effort.
- **Tab fade-in (§3.3):** in `go()` (line ~974), after rendering, add a quick opacity fade on `#view`. Simple approach: give `#view` a CSS class `.fade` with an `@keyframes` and re-trigger it each `go()` by removing/adding the class. Test that it doesn't fight `prefers-reduced-motion` (line ~32).
- **Audio-playing indicator (§2.2):** the `♪` button is `.speak-ico`. Optional: add a pulsing class while TTS speaks. `speak()` is line ~945 — you'd add `u.onstart`/`u.onend` to toggle a class on the active `.speak-ico`. Medium effort, nice-to-have.

---

## TIER C — larger features (do only if you have time; each is its own mini-project)

Each of these should be a **separate** change + version bump + test run, not bundled.

- **Light-mode toggle** (§3.1, §6.1): the theme is CSS custom properties in `:root` (~lines 13–20). Add a `body.light{ … }` override set and a toggle in Ajustes (search `btn-settings` / the settings render). Keep dark as default.
- **`deck()` memoization** (Audit High #7, §5.1): `deck()` (line ~925) rebuilds ~968 objects every load. Memoize: compute once into a module-level `DECK` and return it. **Careful:** confirm nothing mutates the returned array; `BYID` is built from it. Re-run smoke (it checks deck size = 968).
- **Batch localStorage saves** (Audit High #8, §5.1): `save()` (line ~912) is called 30+ times. Introduce a `dirty` flag + flush on the existing 30s timer (line ~1439) and on `visibilitychange`/`beforeunload`. **Careful:** don't lose the final save on grade — keep an explicit flush on session-end and page-hide. Test that reloading mid-session preserves progress.
- **Card browser** (§4.2, §6.1), **search** (§2.3), **onboarding split** (§2.1), **streak/achievement/boss animations** (§2.4, §6.2), **weekly missions/summary** (§2.4, §6.1): all backlog features from the audit §7 Medium/Low lists. Design each additively; none should touch the SRS core (`grade`, `showCard`, `quizRun`).

---

## Reference: audit priority → status map
- Critical #1 IIFE → **skipped by design** (see above).
- Critical #2 ARIA → **A1** (yours).
- Critical #3 log cap → **done by Claude.**
- Critical #4 boss timer → **done by Claude.**
- High #5 onboarding split → Tier C. #6 keyboard → **A2.** #7 deck memoize → Tier C. #8 save batching → Tier C.
- Medium/Low (light mode, card browser, speech recognition, animations, social, weekly summary, search, SVG icons) → Tier B/C.

Full detail for any item: `docs/Qwen Audit v1.12.0.md`.
