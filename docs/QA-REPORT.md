# QA-REPORT — S11 Content QA Pass (v1.11.1, merged & re-gated at v1.12.0, 2026-07-10)

**Executed by:** Claude Fable, at the project owner's explicit direction (ROADMAP assigns S11 to Opus; deviation noted and accepted by the project owner in-session). Mitigating factor: the S6 stories, S9 boss/skill-tree strings and the original curriculum were written by Opus or predate Fable's sessions, so the bulk of the audited content still received cross-model review. Fable-authored content (S2/S3 vocab, S5 dialogues) was re-audited here with fresh automated tooling rather than by the model that wrote it — flagged for Opus to spot-check at S12 sign-off if desired.

## 1. Scope & method

1,379 Spanish strings audited across every data table: V (784), PH (78), SL (38×2 incl. examples), ID (28), FF (40), CG (41), GQ (24), CJ (12 verbs × all conjugated forms), DLG (20 dialogues: every line + every MCQ), ST (6 stories: every paragraph, question, quest and note), AN (all 21 Anselmo lines).

Method: (a) automated scanner (`tools/qa-audit.js`, committed) — mojibake/encoding damage, stray HTML entities, missing inverted punctuation, a 30-word always-accented list checked against unaccented forms, and a banned-register list (coche, autobús, charlar, ordenador, zumo, patatas, vosotros, guay, enfadado, móvil, coger, piscina, conducir); (b) full human-model read of the high-risk sets (SL, ID, FF, GQ, all 6 stories, 4-of-20 dialogue deep sample + automated scan of all 20, AN); (c) GQ difficulty-curve review; (d) link extraction + format audit; (e) TTS-risk string extraction.

## 2. Findings — fixed in this pass (v1.11.1)

| # | Item | Issue | Fix |
|---|------|-------|-----|
| 1 | V733 `charlar` (wk25) | Peninsular register presented as neutral, sitting beside its MX twin | Gloss now reads "to chat (Spain — Mexicans say platicar)" — teaches the contrast explicitly |
| 2 | V589 `echar de menos` (wk20) | Spain-leaning default for "to miss someone"; MX says *extrañar* | Gloss now flags the register; see also fix 3 |
| 3 | Missing `extrañar` | The MX-default verb wasn't taught at all | Appended `[20,"extrañar","to miss someone (the MX way: te extraño)"]` — deck grows 927→928 (append-only, new id v783) |
| 4 | GQ #6 (wk5) | Malformed distractor `"quiero puedo"` (two words); `"quiero"` alone would also have been semantically correct | Distractor replaced with `"puedes"` (wrong person — unambiguously wrong) |

## 3. Findings — clean (no action)

Zero mojibake, zero HTML-entity leaks, zero missing-accent hits across all 1,379 strings. Zero banned-register hits beyond `charlar` above. SL (38): register accurate, all safety-appropriate (nothing stronger than *no manches*; *güey* correctly framed), every example natural. ID (28): all literal/actual glosses verified accurate, MX-specific entries (*mole de olla*, *quedarse de a seis*, *irse de pinta*) correctly tagged. FF (40): every row a genuine false friend, including the subtle ones (*actualmente*, *suceso*, *compromiso*, *billón*). PH (78): natural MX throughout (*gripa*, *te marco*, *¿bueno?*, *me da pena*, *la pasé bien*). Stories: register exemplary (*platica*, *güey*, *chido*, *la neta*, *chilango*, proper *albur* framing at wk22); grading matches curriculum phase; Mateo's arc mirrors the learner. Dialogues: MX-correct (*camión* for bus, *dé vuelta*, *se me cayó*, *me invitó un taco*). Anselmo lines are deliberately English-with-Spanish-sprinkles (by design — he tutors in English); inverted-punctuation flags on 3 of his English exclamations are false positives.

Note kept, not changed: stories ST4/ST5 use *echar de menos / echaba de menos*. Understood everywhere and consistent with the wk20 deck entry the learner has by then; with fixes 2–3 the register contrast is now taught explicitly. Left as-is to preserve the validated ≥85% vocab-coverage gate.

## 4. GQ difficulty curve — reviewed, healthy

24 items, weeks 2–24, one concept each, monotonic difficulty: ser/estar → time/articles → question words → ir+a → tener idioms → poder → gustar agreement → adjective agreement → reflexives → hay → comparatives → preterite vs imperfect → doler → creo que → hace calor → DO pronouns → llevo+time → reported speech → aunque → subjunctive triggers → repair phrases → conditional (*si tuviera*). Answer keys all verified. Minor gaps ticketed below.

## 5. Ticketed (not blocking, for S12 or backlog)

1. **Live link click-test — BLOCKED this session** (sandbox egress unavailable; web_fetch timed out, browser extension disconnected). All 10 distinct URLs passed format audit. Manual checklist for the owner (~3 min): languagetransfer.org · dreamingspanish.com · youtube.com/@EasySpanish · @SpanishandGo · @ButterflySpanish · conversationexchange.com · spanishdict.com · forvo.com · one `yt()` search URL from any Códice week · one from the Cantina media library. Must be re-run anyway on the live Pages URL at S12.
2. **PWA install click-test** (carried from S10): `npx serve app` → install icon appears → installs → works offline.
3. ~~**TTS ear-check list**~~ **RESOLVED 2026-07-10 (owner):** `s0` "güey / wey" ear-tested — voice reads "güey" only, slash is silent. Since slash handling is voice-level behavior, `s20` "morro / morra" and TR "el concreto / hormigón" are covered by the same result (they're week-gated 19/17, hence not directly reachable early). Ellipsis strings render as pauses as designed. No `speak()` change needed.
4. **GQ gaps**: no items for wk1, wk20, wk22, wk25–26; wk2/wk5 have two each. Suggested S12-or-backlog additions: a wk20 idiom item and a wk22 register/humor item.
5. **Opus spot-check option at S12**: 10% sample of Fable-authored S2/S3 vocab rows, per the project's own cross-review rule.

## 6. Concurrent-session merge addendum (same day)

While this QA pass ran, a parallel session completed S3's deferred **Trabajo module** (+40 TR cards, TR-aware validator) directly on the OneDrive folder; OneDrive merged both edit sets. Actions taken: the merged file was re-gated as one unit, the 40 TR strings were retro-audited with the same automated scanner + manual register read (**zero flags**; "el concreto / hormigón" correctly leads with the MX term — its slash added to the TTS list above), APP_VERSION consolidated to 1.12.0, and CHANGELOG [1.12.0] amended with the merged deck count. The audited-string total rises from 1,379 to **1,420**; final deck **968**. Process recommendation for S12: serialize sessions until the project is on git — this merge was benign, the next may not be.

## 7. Gate status (final, merged v1.12.0)

`validate-data.js` PASS (968 cards, TR:40, V:784, no duplicate es, weeks in range, GQ answers valid) · `smoke-test.js` PASS (all views/games/SRS/test/story/boss/skill-tree/tutorial/chest/raid/pwa guard) · story coverage 89.2–94.4% (≥85% required) · APP_VERSION 1.12.0 · CHANGELOG updated.
