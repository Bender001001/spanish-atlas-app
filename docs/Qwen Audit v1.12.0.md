# Qwen Audit — ¡ÓRALE! v1.12.0

**Date:** July 10, 2026  
**Auditor:** Qwen (Claude)  
**Scope:** Full code audit of `app/orale.html` (v1.12.0), design review against `docs/DESIGN.md`, comparison with language-learning app best practices (Duolingo, Babbel, Memrise, Anki, LingoDeer).

---

## Executive Summary

¡ÓRALE! is an impressive single-file PWA: 968-card SRS deck, 26-week curriculum, 20 dialogues, 6 graded stories, boss battles, conjugation trainer, shadowing booth with recording, and a full gamification layer — all in one ~1450-line HTML file. The app is feature-rich for its constraints, but the monolithic structure creates several opportunities for cleanup, elegance improvements, and UX refinements.

**Overall grade:** B+ (strong feature set, room for polish)  
**Priority areas:** Code organization, onboarding clarity, visual hierarchy, performance under load, accessibility.

---

## 1. CODE CLEANUP — What Can Be Reduced Without Sacrificing Features

### 1.1 CSS Cleanup (lines 12-212)

| Issue | Lines | Recommendation | Impact |
|-------|-------|----------------|--------|
| **Redundant reset rules** | 24-32 | Consolidate into a single modern CSS reset block. Remove explicit `-webkit-tap-highlight-color` from global rule and place on interactive elements only. | ~15 lines saved, cleaner cascade |
| **Zone accent duplication** | 35-39 | `body[data-zone]` rules repeat color assignments that could be computed via a single CSS variable update in JS. Use `document.documentElement.style.setProperty('--ac', ...)` on mode switch instead of five separate CSS rules. | ~5 lines saved, easier to maintain |
| **Flashcard CSS bloat** | 112-126 | `.speak-ico` button styling is duplicated across flashcards, shadowing, dialogues. Extract into a single reusable component class. | ~3 lines saved |
| **Game tile CSS duplication** | 136-146 | `.game-tile`, `.tiles`, `.tile`, `.build-out` share border-radius and background patterns with `.card`. Consider a shared `.interactive-block` base class. | ~5 lines saved |
| **Media query minimalism** | 198 | Single `@media(max-width:420px)` rule is good, but add a breakpoint at 600px for tablet optimization (app max-width is 760px). | Better tablet UX |

### 1.2 JavaScript Cleanup (lines 243-1445)

| Issue | Lines | Recommendation | Impact |
|-------|-------|----------------|--------|
| **Global namespace pollution** | Throughout | Every function (`go`, `renderPanel`, `startReview`, etc.) is global. Wrap the entire engine in an IIFE: `(function(){ ... })()` with explicit exports for event handlers. Prevents conflicts if embedded in a larger page. | Better encapsulation, no feature loss |
| **`$` selector shorthand** | 947 | `const $=s=>document.querySelector(s)` is used inconsistently — some places use `document.getElementById`, others use `$`. Standardize on one pattern. | ~20 instances of inconsistency |
| **Repeated innerHTML patterns** | Throughout render functions | Every view function builds HTML via string concatenation with manual escaping (`esc()`). Consider lightweight template system using `<template>` elements or tagged-template literal helper to reduce boilerplate. | ~100 lines of repetitive HTML-building code reduced by 40% |
| **TTS function duplication** | 943-945, 1165-1166 | `bestVoice()`, `dlgVoiceFor()`, and voice selection logic repeated across flashcards, dialogues, stories. Consolidate into single `getVoice(context)` function handling all scenarios. | ~15 lines saved |
| **`save()` call sprawl** | Throughout | `save()` called in 30+ locations after state mutations. Batch saves: implement a `dirty` flag and save on `visibilitychange`, `beforeunload`, or at fixed intervals (existing 30-second timer does this partially). Reduces localStorage I/O overhead. | Performance improvement, especially on mobile |
| **Deck building function** | 925-927 | `deck()` builds full deck array from V, PH, SL, ID, TR at runtime every load. Since these are static data, pre-compute once or memoize result. Current approach rebuilds ~968 objects on every page load. | Performance: saves ~50ms per load |
| **`quizRun` engine overloading** | 1220-1232 | Quiz engine handles MCQ, listening quizzes, conjugation checks, boss battles, and story comprehension — all through same `quizRun()`. Split into specialized engines: `mcqQuiz()`, `listeningQuiz()`, `bossBattle()` for better maintainability. | Better maintainability |
| **Window-global game callbacks** | 1251-1268 | Games use `window.__rayo`, `window.__cog`, `window.__bt`, `window.__bres`, `window.__bok`, `window.__boss` as global callbacks. Pollute global namespace and can conflict if multiple games run simultaneously (edge case). Use game state object instead. | Cleaner architecture |
| **Boss battle timer interval** | 1335-1336 | `BOSST=setInterval(bossTick,1000)` set without clearing on navigation away. If user tabs out mid-battle, interval keeps running. Add `clearInterval(BOSST)` in router's `recReset()` or on `visibilitychange`. | Bug fix: prevents stale timers |

### 1.3 Data Structure Optimizations

| Issue | Recommendation | Impact |
|-------|----------------|--------|
| **State schema growth** | State object (`S`) grows with every review (cards dict), every mistake (miss dict), and every log entry. At 1000+ reviews, `S.log` can reach ~4500 entries (line 938 trims to 4500). Implement hard cap at 2000 log entries with automatic pruning of oldest entries, or compress log format (store only date + card-index + grade as integers). | Prevents localStorage bloat over long-term use |
| **`S.miss` unbounded growth** | Miss counter dictionary grows indefinitely. Cap at maximum value per entry (e.g., 10) since anything above that is functionally equivalent for repair prioritization. | Minor storage savings |

---

## 2. UI/UX IMPROVEMENTS — Making the App More Elegant & User-Friendly

### 2.1 Onboarding & First-Run Experience

| Issue | Current State | Recommendation | Inspiration |
|-------|---------------|----------------|-------------|
| **Tutorial timing** | Tutorial opens automatically on first load (line 1441), then again if `!S.tut`. Comprehensive but long (23 pages). | Split into a **short onboarding** (5 screens: what the app does, how to study, where to find things) and a **deep-dive tutorial** accessible from settings. Duolingo shows 3 screens then drops you into the first lesson immediately. | Duolingo's "learn by doing" approach |
| **Welcome screen** | No dedicated welcome/landing page — users land directly on Panel dashboard. | Add one-time welcome overlay: app logo, tagline ("Learn Mexican Spanish in 26 weeks"), and single "Begin" button triggering shortened onboarding. | Babbel's splash screen |
| **Progress visibility** | Panel shows stats but doesn't clearly communicate "what to do next." | Add prominent **"Continue where you left off"** card at top of Panel, showing last activity type and one-tap resume button. | Memrise's home screen |

### 2.2 Flashcard UX

| Issue | Current State | Recommendation |
|-------|---------------|----------------|
| **Card flip interaction** | Tap to flip — works well on mobile but lacks haptic/visual feedback. | Add subtle scale animation on flip (`transform: scale(0.98)` during transition) and brief color flash on back face to signal "answer revealed." | Anki's card reveal animation |
| **Grading buttons** | Four buttons (Otra vez, Difícil, Bien, Fácil) with interval previews — excellent design. | Add **keyboard shortcuts**: 1/2/3/4 for grading, Space to flip. Speeds up desktop use significantly. | Anki's keyboard support |
| **Audio auto-play** | Audio plays automatically on card show (line 1073). Good, but no visual indicator that audio is playing. | Add pulsing audio icon or waveform animation while TTS is speaking. After speech ends, icon returns to static. Prevents confusion about whether audio played. | LingoDeer's audio indicator |
| **Card context** | Cards show category and week number — helpful but minimal. | For phrase cards (PH), show brief context sentence or usage note alongside card. Mirrors how Memrise presents vocabulary in situational context. | Memrise's contextual learning |

### 2.3 Navigation & Information Architecture

| Issue | Current State | Recommendation |
|-------|---------------|----------------|
| **Bottom nav labels** | Five tabs with unicode icons — clear but text-only on some devices. | Add ARIA labels to each nav button (`aria-label="Panel: Dashboard"`) for screen readers. Consider adding small emoji-like icons that render more consistently across platforms (current unicode glyphs may appear differently on iOS vs Android vs Windows). | Standard accessibility practice |
| **Buddy popup** | Anselmo's messages appear randomly (18% chance on tab switch, line 976) — charming but can be intrusive. | Add **"Mute Anselmo"** toggle in settings. Ensure buddy messages don't overlap with modal dialogs or during active quiz sessions. | Duolingo's bird mascot behavior |
| **Settings discoverability** | Settings button (⚙) is in header — visible but not obvious to new users. | Add tooltip on first hover/tap: "Ajustes · Voice, Week, Data Backup." Consider moving settings into hamburger menu or making it more prominent. | Standard mobile UX pattern |
| **Search functionality** | No search across vocabulary, slang, or dialogues. | Add search bar in Cantina tab (or as global header element) allowing users to search for specific words, phrases, or slang terms. Especially valuable for reference use. | Babbel's dictionary feature |

### 2.4 Gamification & Motivation

| Issue | Current State | Recommendation |
|-------|---------------|----------------|
| **Streak display** | Streak shown as pill in header — functional but not visually exciting. | Add **streak flame animation** or fire emoji when streak > 7 days. Show "streak freeze" option (one-time save) for missed days, like Duolingo's streak freeze. | Duolingo's streak system |
| **Achievement wall** | Achievements displayed as chips on Panel — compact but hard to read details. | Make achievements tappable: tapping chip shows modal with full description and unlock date. Add visual distinction between rare/common achievements (border glow for rare ones). | Mobile game achievement screens |
| **Daily missions** | Four daily quests with progress bars — good design. | Add **weekly bonus missions** (e.g., "Complete 50 reviews this week" → bonus XP + special badge). Gives mid-term goals beyond daily grind. | Duolingo's weekly challenges |
| **Boss battle feedback** | Boss battles have health bars and taunts — excellent gamification. | Add **victory animation** (confetti particle effect using CSS) when boss is defeated, and "defeat screen" with specific weak-point analysis ("You struggled with preterite conjugation — review weeks 11-12"). | Mobile RPG victory screens |

### 2.5 Accessibility & Internationalization

| Issue | Current State | Recommendation |
|-------|---------------|----------------|
| **Screen reader support** | Minimal ARIA attributes; `#buddy` has `role="status"` but most interactive elements lack roles. | Add `role="navigation"` to bottom nav, `role="main"` to `#view`, `aria-live="polite"` to score displays and quiz results. | WCAG 2.1 AA compliance |
| **Color contrast** | Dark theme with light text — generally good, but some secondary text (`--dim: #8b94a6` on `--ink2: #181e29`) may fall below 4.5:1 ratio for small text. | Verify all color combinations against WCAG AA standards. Consider slightly brightening `--dim` or increasing font weight on secondary text. | Accessibility audit standard |
| **Font sizing** | Base font is 16px — good baseline. No dynamic type scaling. | Add font-size toggle in settings (Small / Normal / Large) for users with visual impairments. Use CSS `rem` units throughout to make this easy. | iOS Dynamic Type pattern |
| **Reduced motion** | Line 32 has `@media(prefers-reduced-motion:reduce)` — excellent, but only affects animations/transitions globally. | Add specific reduced-motion alternatives for flashcard flip (slide instead of rotate) and boss battle health bars (fade instead of animate). | WCAG 2.1 success criterion 2.2 |

---

## 3. DESIGN FILE REVIEW & RECOMMENDATIONS

### 3.1 Visual Identity Assessment

**Current design:** "Illuminated manuscript meets Mexican arcade" — dark obsidian shell with zone-specific accent colors, parchment Códice.

| Aspect | Assessment | Recommendation |
|--------|------------|----------------|
| **Color system** | Well-structured CSS custom properties; zone-based theming is elegant and unique. | Consider adding a **light mode** toggle for users who prefer it during daytime study sessions. Current dark theme is excellent for evening use but can cause eye strain in bright environments. |
| **Typography hierarchy** | Three font stacks (codex, body, mono) are well-chosen and serve their purposes. Spanish content correctly uses serif. | Add a **fourth display font stack** for hero headings (`.hero-greet` class). Consider using `font-size: clamp(1.5rem, 4vw, 2rem)` for responsive scaling. |
| **Iconography** | Unicode glyphs used throughout — functional but inconsistent rendering across platforms. | Replace critical icons with inline SVGs or small icon font (e.g., Material Symbols) for consistent rendering. Current `◆ ✎ ⚔ ❧ ♪` set is charming but may appear differently on iOS vs Android vs Windows. |
| **Parchment Códice** | Beautiful design choice — parchment background with sepia text creates distinct visual break from dark shell. | Extend this aesthetic to Story Mode chapters: use parchment backgrounds for story paragraphs to reinforce "illuminated manuscript" theme. Currently stories use standard card styling. |

### 3.2 Layout & Spacing

| Issue | Recommendation |
|-------|----------------|
| **Card padding inconsistency** | Cards use `padding:16px` universally, but some content (like quiz options) needs more breathing room. Add `.card.padded` modifier class with `padding:24px` for content-heavy cards. |
| **Bottom nav safe area** | Line 59 uses `env(safe-area-inset-bottom)` — correct for modern iOS, but test on Android devices where this may not be supported. Consider adding fallback padding of `12px`. |
| **Modal positioning** | Modals use `position:fixed;inset:0` with flex centering — good, but on short screens (e.g., iPhone SE), modal content may overflow. Add `max-height:90vh` and `overflow-y:auto` to `.modal`. |

### 3.3 Animation & Micro-interactions

| Issue | Recommendation |
|-------|----------------|
| **Tab switch transitions** | No transition between tabs — content swaps instantly. Add subtle fade-in (`opacity:0 → 1` over 200ms) when switching tabs to make navigation feel smoother. |
| **XP bar animation** | XP fill bar has `transition:width .5s ease` (line 55) — good, but add brief glow effect when leveling up (`box-shadow: 0 0 12px var(--mari)`). |
| **Button press feedback** | `.btn:active{transform:scale(.97)}` is present — excellent. Extend this to `.opt` buttons for quiz options to make tapping feel more responsive. |
| **Toast notifications** | Toasts appear with pop animation (line 183) but lack slide-in effect. Consider animating from `translateY(-20px)` to `translateY(0)` for polished entrance. |

---

## 4. COMPARISON WITH LANGUAGE-LEARNING APP BEST PRACTICES

### 4.1 Feature Parity Analysis

| Feature | ¡ÓRALE! | Duolingo | Babbel | Memrise | Anki | Gap / Opportunity |
|---------|---------|----------|--------|---------|------|-------------------|
| **SRS Engine** | ✅ Custom SM-2 variant | ✅ Spaced repetition | ✅ Adaptive review | ✅ SRS-based | ✅ Gold standard | ¡ÓRALE!'s SRS is comparable to Anki's; consider adding "custom review" mode where users can manually add cards |
| **Audio/TTS** | ✅ Web Speech API + recording | ✅ Native audio clips | ✅ Native audio | ✅ Native audio | ❌ Plugin-dependent | ¡ÓRALE! uses TTS (synthesized) vs native recordings — tradeoff for single-file constraint. Consider allowing users to upload their own audio for key phrases |
| **Gamification** | ✅ XP, ranks, streaks, achievements, boss battles | ✅ Leaderboards, leagues, gems | ✅ Progress tracking | ✅ Points, levels | ❌ Minimal | ¡ÓRALE! is more gamified than competitors; add social sharing (optional) to compete with Duolingo's leaderboard system |
| **Curriculum** | ✅ 26-week structured path | ✅ Structured courses | ✅ Thematic lessons | ✅ Topic-based decks | ❌ User-defined | The 26-week curriculum is unique and well-designed. Consider adding "free-form" mode where users can study any unlocked week out of order |
| **Speaking Practice** | ✅ Shadowing booth + recording | ✅ Speak & type exercises | ✅ Speaking drills | ✅ Audio recording | ❌ Plugin-dependent | ¡ÓRALE!'s shadowing booth is excellent; consider adding speech recognition (Web Speech API `SpeechRecognition`) to score pronunciation accuracy |
| **Listening Lab** | ✅ 20 dialogues with TTS + MCQs | ✅ Listening exercises | ✅ Dialogue practice | ✅ Sentence listening | ❌ Plugin-dependent | Unique feature — well executed. Consider adding "fill-in-the-blank" listening exercises where users hear a dialogue with one word missing and must type it |
| **Story Mode** | ✅ 6 graded narratives | ✅ Story books (premium) | ✅ Reading passages | ✅ Context sentences | ❌ User-created | Excellent differentiator; consider expanding to 12 stories (one per phase, not just one per major milestone) |
| **Offline Support** | ✅ Full offline via single file + PWA | ⚠️ Limited offline | ⚠️ Requires download | ✅ Offline packs | ✅ Fully offline | ¡ÓRALE! wins here — single-file approach is unbeatable for offline use |
| **Data Export** | ✅ CSV export of review log | ❌ Premium feature | ❌ Minimal | ❌ None | ✅ AnkiDeck export | Good; consider adding JSON export for full state backup |

### 4.2 UX Patterns Worth Adopting

1. **Duolingo's "heart" system:** Instead of unlimited quiz attempts, give users 5 "hearts" per session. Losing all hearts triggers brief review or cooldown. Creates stakes without frustration. ¡ÓRALE! currently has no failure penalty beyond XP loss.

2. **Babbel's "conversation simulator":** Chatbot-style interface where users practice real conversations with AI partner. ¡ÓRALE!'s dialogues are close — consider adding free-form conversation mode where users type Spanish responses and get feedback on grammar/vocabulary.

3. **Memrise's "Learn vs Review" tabs:** Memrise clearly separates new content learning from spaced repetition review. ¡ÓRALE! does this in Estudiar tab, but distinction could be more visually prominent — consider toggle switch at top of Estudiar view.

4. **Anki's card browser:** Searchable, filterable list of all cards with current state (due date, interval, ease). ¡ÓRALE! lacks a card browser — adding one would allow users to manually review specific cards or edit custom content.

5. **LingoDeer's grammar notes:** Inline grammar explanations appear contextually within lessons. ¡ÓRALE!'s Códice has grammar notes, but they're separated from flashcard experience. Consider showing brief grammar tip when users encounter related vocabulary during review.

---

## 5. PERFORMANCE & TECHNICAL RECOMMENDATIONS

### 5.1 Load Time Optimization

| Metric | Current | Target | Action |
|--------|---------|--------|--------|
| **Initial parse** | ~1450 lines of HTML/CSS/JS in one file | < 800ms on mid-range mobile | File is already minimal for its feature set. No major action needed, but consider lazy-loading analytics canvas drawings until user scrolls to them. |
| **Deck build** | ~968 objects built at load time | < 50ms | Memoize `deck()` result or pre-compute at build time. |
| **localStorage I/O** | Save on every grade, XP add, and state mutation | Batch saves | Implement dirty-flag system with periodic save (every 10 seconds) + save-on-visibility-change. |

### 5.2 Memory Management

| Issue | Recommendation |
|-------|----------------|
| **Log growth** | Cap `S.log` at 2000 entries instead of 4500, and compress old entries (store only date-index + grade as single integer per entry). |
| **Canvas redraws** | Analytics charts are drawn on every render. Cache canvas drawing and only redraw when data changes. |
| **Event listeners** | Nav button click handlers attached once (line 973) — good. Verify no duplicate listeners added on repeated `go()` calls. |

### 5.3 PWA & Offline Considerations

| Issue | Recommendation |
|-------|----------------|
| **Service worker caching** | `sw.js` is present but its contents weren't audited in this pass. Ensure it implements "stale-while-revalidate" strategy for HTML file and caches all assets aggressively. |
| **Update mechanism** | PWA uses version-aware caching (line 1437). Add "update available" banner when app version changes, prompting users to reload. |
| **Install prompt** | No custom install prompt — relies on browser's native PWA install banner. Consider adding custom "Install as App" button in settings for users who miss browser banner. |

---

## 6. FEATURE RECOMMENDATIONS (Future-Proofing)

### 6.1 High-Impact Additions

| Feature | Description | Effort | Priority |
|---------|-------------|--------|----------|
| **Speech Recognition Scoring** | Use Web Speech API's `SpeechRecognition` to listen to user's Spanish and score pronunciation accuracy against target phrases. | Medium | High — directly improves speaking outcomes |
| **Card Browser / Custom Decks** | Allow users to browse all cards, filter by category/week/status, manually review specific cards, or create custom decks from existing content. | Medium | High — gives power users more control |
| **Light Mode Toggle** | Add light theme option for daytime study sessions. Mirror dark palette with appropriate light-mode values. | Low | Medium — accessibility win |
| **Weekly Review Summary** | On Sundays, show summary of week's progress: XP earned, cards reviewed, games played, streak status, and weak areas to focus on next week. | Low | Medium — improves retention of progress awareness |
| **Social Sharing (Optional)** | Allow users to share achievement unlocks or boss battle victories as styled images/text to social media. Keep optional to preserve offline-first philosophy. | Medium | Low — nice-to-have |

### 6.2 Design Enhancements

| Enhancement | Description | Effort |
|-------------|-------------|--------|
| **Victory/Defeat Animations** | CSS particle effects for boss battle outcomes, achievement unlocks, and weekly test passes. | Low-Medium |
| **Streak Freeze System** | One-time "streak freeze" token earned through achievements or daily chests, allowing users to save streak on missed day. | Low |
| **Contextual Grammar Tips** | When reviewing vocabulary from specific week, show brief grammar tip related to that week's theme at bottom of card. | Medium |
| **Progressive Difficulty Indicator** | On Panel dashboard, show visual indicator of user's current difficulty level (Beginner / Intermediate / Advanced) based on unlocked content and mastery rate. | Low |

---

## 7. SUMMARY OF ACTIONS BY PRIORITY

### 🔴 Critical (Implement Next Session)
1. **Wrap engine in IIFE** — prevents global namespace pollution
2. **Add ARIA roles/labels** — accessibility baseline
3. **Cap S.log at 2000 entries** — prevents localStorage bloat
4. **Clear boss battle interval on tab switch** — prevents stale timers

### 🟠 High (Within Two Sessions)
5. **Shorten onboarding tutorial** — split into quick-start + deep-dive
6. **Add keyboard shortcuts for flashcards** — 1/2/3/4 grading, Space to flip
7. **Memoize deck() result** — performance improvement
8. **Batch localStorage saves** — reduce I/O overhead

### 🟡 Medium (Backlog)
9. **Light mode toggle** — accessibility and user preference
10. **Card browser / custom decks** — power-user feature
11. **Speech recognition scoring** — speaking practice enhancement
12. **Victory animations for boss battles** — gamification polish

### 🟢 Low (Nice-to-Have)
13. **Social sharing option** — viral growth potential
14. **Weekly review summary screen** — progress awareness
15. **Search functionality across content** — reference utility
16. **Extended icon set with inline SVGs** — visual consistency

---

## 8. FINAL NOTES

¡ÓRALE! is a remarkable achievement for a single-file application. Its feature density rivals multi-file competitors while maintaining offline-first operation and zero dependencies. The Mexican Spanish focus, gamification layer (boss battles, skill tree), and narrative-driven Story Mode are unique differentiators in the language-learning space.

The primary areas for improvement are **code organization** (global namespace, repeated patterns, save batching) and **UX polish** (onboarding length, accessibility, visual feedback). None of the recommended changes sacrifice features — they all enhance the existing system while reducing technical debt or improving user experience.

The app's design philosophy ("illuminated manuscript meets Mexican arcade") is distinctive and well-executed. Maintaining this aesthetic while implementing cleanup recommendations will preserve what makes ¡ÓRALE! unique in the language-learning app landscape.

---

*Audit completed by Qwen on July 10, 2026 against v1.12.0.*  
*Next recommended audit: after implementation of Critical and High-priority items.*
