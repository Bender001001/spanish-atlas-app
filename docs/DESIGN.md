# DESIGN — System, Schematics & Data Schemas

The visual identity is "illuminated manuscript meets Mexican arcade": a dark obsidian shell whose accent color and typography shift per zone, with the Códice flipping to full parchment. Do not flatten this into one generic theme — the multi-zone contrast is a core product requirement.

## 1. Design tokens (CSS custom properties, in `:root`)
| Token | Value | Use |
|---|---|---|
| --ink / --ink2 / --ink3 | #10141c / #181e29 / #222a38 | backgrounds: page / cards / controls |
| --line | #2e3746 | all borders |
| --bone | #e9e4d8 | primary text |
| --dim / --faint | #8b94a6 / #5a6375 | secondary / tertiary text |
| --rosa | #e4007c | Arena accent (rosa mexicano — signature color) |
| --mari | #f2a33c | Panel accent, XP, rewards (cempasúchil marigold) |
| --tala | #3e8fb0 | Estudiar accent, links (talavera blue) |
| --lima / --rojo | #8fbf4d / #e05252 | success / error |
| --parch / --parch2 / --sepia / --sepia2 | #f1e7d0 / #e7d9ba / #4a3a22 / #7a6440 | Códice parchment + buddy bubble |
| --ac | varies | active zone accent, set by `body[data-zone]` |

Zone→accent map: panel→mari, learn→tala, arena→rosa, codex→sepia2, cantina→#d98e4a.

## 2. Typography (local stacks only — no webfonts, app must work offline)
- `--ff-codex` Palatino/Book Antiqua/Georgia — headings, Spanish words, Códice body, Anselmo
- `--ff-body` system-ui — UI prose
- `--ff-mono` ui-monospace/Consolas — stats, meta rows, tags, chart labels
Convention: any Spanish lexical content gets class `.es` (codex serif). Never render Spanish study content in the mono stack.

## 3. Layout schematic
```
┌────────────────────────────────────┐
│ header (sticky): brand · streak ✦ · pesos $ · ? · ⚙
│                  rank/level ── XP bar
├────────────────────────────────────┤
│ main #view  ← single mount point; every screen
│             is a render function writing innerHTML
├────────────────────────────────────┤
│ #buddy (fixed, parchment marginalia bubble)
│ nav (fixed): ◆Panel ✎Estudiar ⚔Arena ❧Códice ♪Cantina
└────────────────────────────────────┘
#modal-root → .modal-bg > .modal (settings, tutorial, chest, raids)
```
Max width 760px, mobile-first, bottom nav thumb-reachable. New full-screen flows render into `#view`; transient UI uses `modal()`.

## 4. Component inventory (CSS classes)
`.card` content block · `.btn / .btn.ghost / .btn.sm / .btn.wide` buttons · `.pill` header chips · `.stat` dashboard number tiles · `.quest` mission rows · `.fc*` 3D flashcard (flip via `.flip`) · `.srs-btns` 4-grade bar · `.opt` quiz options (+`.right/.wrong`) · `.game-tile` arena launcher · `.tile/.build-out` constructor pieces · `.codex/.phase/.wk/.marginalia` parchment system · `.slang-card/.ff-row/.fact/.chip` cantina · `.subtabs` pill tabs · `.toast` notifications. Reuse these before inventing new ones.

## 5. Data schemas (all inside the single <script>)
```
V  = [[week:int 1-26, es:str, en:str], ...]                  vocabulary
PH = [[week, es, en], ...]                                    phrases (shadow pool)
SL = [[word, meaning, exampleSentence], ...]                  slang  (unlock wk19)
ID = [[expression, literalTranslation, meaning], ...]         idioms (unlock wk20)
FF = [[word, looksLike, actuallyMeans], ...]                  false friends
CG = [str, ...]                                               cognates
FX = [str, ...]                                               fun facts (chest-gated)
GQ = [{w:int unlockWeek, q:str, o:[4 str], a:answerIdx}, ...] grammar quiz bank
CJ = [[verb, en, pres[6], pret[6], imp[6], irA-future[6]], ...] 12-verb conjugation trainer (S4). Person order is fixed: yo·tú·él-ella-usted·nosotros·ustedes·ellos-ellas (Latin-American, no vosotros). Pseudo-ids `cj{verbIdx}_{tenseIdx}_{personIdx}` feed S.miss like card ids; not gated by week.
DLG= [{wk, t:titleEs, note:noteEn, lines:[[speaker,es,en],...], mcqs:[{q,o:[4str],a}x3]}, ...]  Listening Lab dialogues (S5). Gated by week (wk<=S.week). Line speaker channel alternates by index parity (even/odd), not by name — drives two-voice TTS (pitch/voice alternation in `speak()`'s 3rd/4th args). Comprehension MCQs run through the shared `quizRun` engine; pseudo-ids `dlg{dlgIdx}_{mcqIdx}` feed S.miss. Fable authored 8 (weeks 1-13); a Qwen handoff packet (`/handoff/SESSION-5-packet.md`) covers 12 more (weeks 14-26).
W  = [{n, ph, t:title, g:grammarHTML, m:mission, r:[[label,url]]}, ...]  26 weeks
MED= {songs, series, movies:[[title, where, note]], channels:[[name,url,note]]}
AN = {greet,win,fail,streak,test,nudge,level:[str]}           Anselmo lines
RANKS[12], LV[12] xp thresholds, ACH=[[id,title,desc,predicate(S)]]
```
Card ids: `v{i} p{i} s{i} i{i}` (index into source array). NEVER reorder or delete existing rows — ids are positional and live in user state. Append only; to retire a row, leave it and exclude via week 99.

## 6. State schema (localStorage key `orale_v1`)
```
S = { xp, pesos, week (1-26 unlock frontier), streak, bestStreak, lastActive,
      cards:{id:{e:ease, iv:intervalDays, reps, lapses, due:ts}},
      miss:{id:count}, days:{ "YYYY-MM-DD":{min,rev,game,shadow,nw,chest,conj,dlg} },
      stats:{reviews,games,shadow,tests,conj,dlg}, weeksDone:[int], ach:[id], dlgDone:[int],
      factIdx, created, voice, rate, name, tut }
```
Schema changes must be additive with defaults supplied in `fresh()` (load() merges via Object.assign) so existing users never lose data.

## 7. SRS algorithm (grade(id, g))
g0 Again: ease-0.2 (floor 1.3), interval 0, due +10 min, miss++ · g1 Hard: iv×1.2, ease-0.15 · g2 Good: first success 2d, else iv×ease · g3 Easy: first 4d, else iv×ease×1.35, ease+0.15 (cap 3.0). Mastered = iv ≥ 21d. Failed Memory Raid halves the interval. XP: 5/review (2 on Again).

## 8. Voice & tone
UI copy: Spanish, warm, lightly playful. Anselmo: English-dominant with Spanish seasoning, quirky medieval scribe (never mocking the learner). Tutorial/docs: English. No emojis anywhere — unicode glyphs (✦ ◆ ⚔ ❧ ♪ ▣) only. Slang additions must be labeled for register; nothing stronger than current entries without an explicit "colorful" tag design (future).
