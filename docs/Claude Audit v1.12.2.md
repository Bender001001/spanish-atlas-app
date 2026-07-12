# Claude Audit — ¡ÓRALE! v1.12.2 (review of & complement to the Qwen Audit)

**Date:** July 12, 2026
**Auditor:** Claude (Fable)
**Scope:** (1) Verification of every claim in `docs/Qwen Audit v1.12.0.md`; (2) independent code audit of `app/orale.html` v1.12.2 **and `app/sw.js`** (which Qwen's audit explicitly skipped); (3) pre-release risk assessment for the v2.0.0 GitHub publish.

---

## 1. REVIEW OF THE QWEN AUDIT

**Overall verdict:** a strong, useful audit. The UX benchmarking (§2, §4) is its best material and the priority ranking (§7) is sensible. However, several findings were already implemented, one was factually wrong, one recommendation would have introduced a data-loss bug as written, and the whole class of bugs behind its one real bug-find (the boss timer) was not generalized — four sibling bugs of the same class were missed. Detail below.

### 1.1 Claims verified correct
- Boss-battle timer leak (Critical #4) — real; fixed by Opus in v1.12.1 at the router chokepoint (`recReset`).
- `S.log` growth (Critical #3) — real; hard 2000-entry cap in place since v1.12.1.
- Global namespace / inline `onclick` observations (§1.2) — accurate description; the IIFE recommendation was correctly rejected in the S12 handoff (it would silently break every inline handler). Concur with skipping.
- `$` vs `getElementById` inconsistency, `esc()` string-built views, window-global game callbacks — all accurately described; cosmetic, no action needed pre-release.
- `S.miss` unbounded per-entry growth (§1.3) — real but bounded in practice (each entry is a small integer; decremented on correct answers). Backlog.

### 1.2 Findings that were ALREADY satisfied at audit time (no action needed)
- **`deck()` memoization** (High #7, §5.1): `deck()` is called exactly once at load (`const DECK=deck();` line ~926) and every consumer uses the `DECK` constant. The "rebuilds 968 objects on every page load" cost is one build per page load — that *is* the memoized state. Item closed as already-done, not implemented in this session.
- **Modal overflow guard** (§3.2): `.modal` already has `max-height:86vh;overflow-y:auto`. (The S12 handoff also caught this.)
- **Toast slide-in** (§3.3): `@keyframes pop` already animates from `translateY(12px)`.
- **Reduced-motion support** (§2.5): global `prefers-reduced-motion` kill-switch already present.

### 1.3 Factual errors in the Qwen audit
- **"Tutorial is long (23 pages)"** (§2.1): the `TUT` array has **15 pages**, not 23. The onboarding-split recommendation still has merit, but it is a smaller problem than stated.
- **"~1450-line file"** framing implies smallness; the file is 1,448 lines but ~200 KB (long lines). Not load-relevant (parses in well under the stated 800 ms target), but worth keeping honest in docs.

### 1.4 A recommendation that would have caused a bug as written
- **Batched `localStorage` saves** (High #8): the proposed "dirty flag + save on `visibilitychange`/`beforeunload`" interacts fatally with **Reiniciar todo** (Settings), which does `localStorage.removeItem(KEY); location.reload()`. A flush-on-unload would fire *after* the key is removed and **resurrect the deleted state**, making factory reset impossible. Implemented in this session as a trailing-throttle instead, with an explicit reset guard (see §3 below). This is exactly why save batching was flagged "Careful" in the S12 handoff.

---

## 2. NEW FINDINGS (missed by the Qwen audit)

### 2.1 🔴 Critical — service worker never delivers updates (release blocker)
`app/sw.js` (explicitly unaudited by Qwen) serves **all** same-origin GETs cache-first, including `orale.html` itself. Sequence after publishing an update to GitHub Pages: the installed client loads the *cached* old HTML → the old HTML registers `sw.js?v=<old version>` → the SW file's bytes are unchanged → no update event → the new HTML is **never fetched**. Users who install the PWA are permanently pinned to the version they installed. The CHANGELOG's claim that "updates arrive automatically when APP_VERSION changes" only holds for the `?v=` cache-retirement mechanism, which is never triggered because the shell never updates.
**Fix (this session):** network-first with cache fallback for navigations/`orale.html`; cache-first retained for static assets (`icon.svg`, `manifest.webmanifest`). Offline behavior is unchanged (network failure falls back to cache); online users now always get the latest shell. Qwen's §5.3 asked to "ensure stale-while-revalidate" — right instinct, but it was never verified against the actual file.

### 2.2 🔴 High — the boss-timer bug has four unfixed siblings (stale timers/callbacks re-rendering over the current view)
v1.12.1 fixed the boss `setInterval`, but the same navigate-away-mid-activity pattern breaks in:

1. **Rayo** (`gameRayo`): the 45-second `setTimeout` tick chain keeps running after navigation; when it expires, `end()` **overwrites whatever view you are now on** with the Rayo score screen.
2. **Quiz engine** (`quizAns`): the 900 ms "show next question" timeout fires after navigation and re-renders the quiz over the new view (affects every quiz consumer: repair, Oído, Trampa, dialogues, stories, weekly tests, memory raids).
3. **Conjugation trainer** (`conjGrade`): the 1100 ms feedback timeout, same class.
4. **Constructor** (`gameBuild`): the 700/1600 ms next-phrase timeout, same class.
5. **Boss battles** (`bossHit`): the 750 ms `setTimeout(bossQ)` was NOT covered by the v1.12.1 interval fix; `BOSS` survives navigation, so the pending timeout re-renders the fight.

**Fix (this session):** generation counter (`NAVGEN`) bumped in `recReset()`; each timed flow captures its generation and no-ops if stale; `QZ`/`CQ`/`BOSS` cleared at the router chokepoint with null-guards in their consumers. Same chokepoint strategy as the v1.12.1 fix, generalized.

### 2.3 🟡 Medium
- **`importData` has no schema validation**: any JSON object is `Object.assign`ed over `fresh()` — malformed shapes (e.g. `cards` as an array) surface later as runtime errors deep in render code. Backlog: validate shape before accepting; offer download-file export in addition to clipboard.
- **`gameTrampa` duplicate-option edge**: distractor meanings drawn from other false friends can coincide with the correct string; `indexOf` then marks the visually-identical duplicate wrong. Rare; backlog.
- **`<html lang="en">` on majority-Spanish content**: screen readers will read Spanish views with English phonology. Mixed-language app so no trivial fix; consider per-view `lang` attributes when the card-browser refactor happens. Backlog.
- **Remaining ARIA gaps from audit item A1**: nav/main/labels landed in v1.12.2, but `aria-live` was only added to the shared quiz end screen and XP counter. Session-done, conjugation end, game end, and boss end screens still lack it; `.speak-ico` buttons are unlabeled (`♪` only). Completed in this session.

### 2.4 🟢 Low / notes
- The surprise Memory Raid (30% chance, 4 s after load) can replace the Panel underneath the first-run tutorial modal. Harmless but disorienting for a brand-new user; consider gating on `S.tut`. Backlog.
- `exportData` is clipboard-only; a `.json` file download (mirroring the CSV exporter) would be more robust for large states. Backlog.
- Deleted quiz `.opt` buttons keep focus order after `onclick=null` (keyboard users can tab to dead buttons for ~900 ms). Cosmetic.

---

## 3. CHANGES IMPLEMENTED IN THIS SESSION (v2.0.0)

From the Qwen audit backlog (Tier A/B + safe Tier C per the owner's chosen scope):
1. Remaining ARIA: `aria-live="polite"` on all end/score screens; `aria-label="Escuchar"` on speak buttons. *(A1 completion)*
2. Tablet breakpoint `@media(min-width:600px)`. *(A4)*
3. `.opt` press feedback (`:active` scale + transform transition). *(Tier B)*
4. Tab-switch fade-in on `#view`. *(Tier B)*
5. XP bar level-up glow. *(Tier B)*
6. TTS "speaking" indicator: speak buttons pulse while audio plays. *(Tier B)*
7. Batched localStorage saves: 800 ms trailing throttle + flush on `visibilitychange`/`pagehide`/`beforeunload` + session-critical explicit flush + **reset guard** (see §1.4). *(Tier C, safe variant)*

From this audit's new findings:
8. Service-worker network-first shell fetch (§2.1) — release blocker.
9. Stale timer/callback generation guards across Rayo, quiz engine, conjugation, Constructor, boss battles (§2.2).

Deferred to the community roadmap: onboarding split, light mode, card browser, search, speech-recognition scoring, victory animations, streak freeze, weekly summary, import validation, export-as-file.

---

## 4. RELEASE READINESS VERDICT

With §2.1 and §2.2 fixed and both gates (`tools/validate-data.js`, `tools/smoke-test.js`) green at deck 968, the app is fit for public v2.0.0 release on GitHub Pages. The codebase's unconventional architecture (single file, string-built views, global handlers) is a *deliberate and documented* constraint, not debt to apologize for — but it should be stated plainly in CONTRIBUTING guidance so community PRs don't "helpfully" refactor it into a build system.

*Audit completed by Claude (Fable) on July 12, 2026 against v1.12.2. Companion to `docs/Qwen Audit v1.12.0.md`.*
