# Audio spot-check (MACHINE-GENERATED, UNVERIFIED)

Every file in `app/audio/` was synthesized with Piper (es_MX voices) and has **not** been listened to by a person. The Whisper "screen" (faster-whisper small) is only a rough proxy: it writes numbers as digits ("cuatro" -> "4") and hallucinates on one-word clips ("¡Suscríbete!"), so a low score does not prove the audio is bad, and a high score does not prove it is right.

Each line below exists as a normal file (`app/audio/<id>.mp3`) and a slow file (`app/audio/slow/<id>.mp3`). Listen to both. Lines 14 and 15 are **not shipped**; their files are in `tools/audio/unshipped/`.

## The 15 lines to check first

Re-rendered with the fallback voice (claude-high) but still low on Whisper:
1. L03_phrase_03 — "Él es de... / Ella es de..." (heard as "LSD y LSD")
2. L06_phrase_07 — "agua" (heard as "¡Ewa!")
3. L07_phrase_07 — "tu / tus" (heard as "¡Totos!")
4. L09_phrase_07 — "Vivo en..." (low on both speeds)
5. L04_phrase_17 — "dieciséis" (heard as "y así seis")

Female voice (claude-high), shipped, flagged by the Whisper screen:
6. L02_phrase_06 — "Eres..." (heard as "It is.")
7. L04_phrase_12 — "once" (heard as "¡Pose!" / "Don't Say")
8. L04_phrase_14 — "trece" (heard as "¡Plesa!")
9. L04_phrase_16 — "quince" (heard as "¡Clinse!")

Male voice (ald), shipped because it was not flagged, but among the lowest Whisper scores:
10. L01_dialogue_01 — "Buenos días, Ana. ¿Cómo estás?" (heard as "…I am up the worst test")
11. L02_dialogue_05 — "Sí, soy nuevo." (heard as "Sí, soy rebelde.")
12. L08_phrase_01 — "¿Qué hora es?" (slow file heard as "¿Qué lo hagas?")
13. L10_phrase_07 — "todo derecho" (heard as "¡Dónde he hecho!")

The phone number, not shipped (both rows are ald, both were flagged; the text appears twice so neither was kept). The digits-vs-words mismatch explains most of the low score, so these may well be fine. Listen for whether all six digits are right and in order:
14. L04_dialogue_05 — "Cinco, cinco, tres, cero, ocho, nueve." (`tools/audio/unshipped/`)
15. L04_listen_03 — "Cinco, cinco, tres, cero, ocho, nueve." (`tools/audio/unshipped/`; the slow file scored 1.0, the normal file 0.22 because Whisper added a trailing "y...")

Also low but not in the 15: L04_phrase_23 "cuarenta" (ald, heard as "¡Penta!"), L04_phrase_11 "diez" (claude-high fallback, heard as "¡Bies!").

## All 41 fallback-voice lines (ald -> claude-high)

Single word/phrase items the male voice (ald) failed on, rendered with the female voice claude-high so they still have offline audio (`fallbackVoice: true` in `app/audio/manifest-meta.json`). Whisper similarity on these rose from a 0.42 mean to 0.74; most of the remaining low scores are digits. Listen to all of them: the voice differs from the other male lines.

- L06_phrase_07 — agua
- L10_phrase_09 — aquí / allá
- L04_phrase_15 — catorce
- L04_phrase_01 — cero
- L04_phrase_05 — cuatro
- L05_phrase_03 — de nada
- L04_phrase_19 — dieciocho
- L04_phrase_17 — dieciséis
- L04_phrase_11 — diez
- L04_phrase_13 — doce
- L03_phrase_13 — guanajuato
- L01_phrase_01 — hola
- L08_phrase_13 — jueves
- L10_phrase_13 — la farmacia
- L08_phrase_11 — martes
- L02_phrase_01 — me llamo...
- L07_phrase_01 — mi familia
- L07_phrase_03 — mi hijo / mi hija
- L07_phrase_05 — mi mamá / mi papá
- L09_phrase_13 — mucho / poco
- L03_phrase_05 — méxico
- L02_phrase_09 — nuevo / nueva
- L04_phrase_09 — ocho
- L05_phrase_05 — perdón
- L05_phrase_01 — por favor
- L06_phrase_01 — quiero...
- L04_phrase_07 — seis
- L08_phrase_03 — son las dos / tres / cuatro...
- L02_phrase_05 — soy...
- L08_phrase_15 — sábado
- L02_phrase_07 — sí
- L04_phrase_27 — tiene... años
- L09_phrase_05 — trabajo en...
- L07_phrase_07 — tu / tus
- L04_phrase_21 — veinte
- L03_phrase_11 — veracruz
- L09_phrase_07 — vivo en...
- L08_phrase_05 — y cuarto
- L08_phrase_07 — ¿a qué hora es...?
- L01_phrase_05 — ¿cómo estás?
- L03_phrase_03 — él es de... / ella es de...

## Other Whisper-flagged lines that shipped (claude-high, not re-rendered)

- L04_phrase_18 — diecisiete
- L02_phrase_06 — eres...
- L04_phrase_12 — once
- L04_phrase_16 — quince
- L04_listen_02 — tengo treinta y cinco años.
- L04_phrase_14 — trece
- L04_phrase_04 — tres
- L04_phrase_02 — uno

## Left to device TTS (no recording)

- L01_listen_03 — Hasta mañana, Ana.
- L04_dialogue_02 — Tengo treinta y cuatro años. ¿Y tú?
- L04_dialogue_03 — Tengo cuarenta y dos.
- L04_dialogue_05 — Cinco, cinco, tres, cero, ocho, nueve. (duplicate: both rows left to TTS)
- L04_listen_03 — Cinco, cinco, tres, cero, ocho, nueve. (duplicate: both rows left to TTS)
- L05_dialogue_04 — Ah, sí. Gracias.
- L07_dialogue_01 — ¿Tienes hijos, Tom?

## Duplicate texts: decisions applied

A manifest maps a text to one file, so for each text that appears in two script rows one row is kept (`tools/audio/duplicates.json`):

- bien, gracias. ¿y tú? -> L01_phrase_06
- ¿cómo te llamas? -> L02_phrase_02
- ¿de qué parte de méxico? -> L03_phrase_07
- ¿de dónde es usted? -> L03_phrase_14
- con gusto. -> L10_dialogue_06
- ¿puedes repetir, por favor? -> L05_phrase_08
- ¿algo más? -> L06_phrase_16
- ¿dónde vives? -> L09_phrase_06
- ¿está lejos? -> L10_phrase_15
- cinco, cinco, tres, cero, ocho, nueve. -> none (both rows left to TTS; files in `tools/audio/unshipped/`)

Rows dropped in favour of the kept one (no file copied):

- L01_dialogue_02 — Bien, gracias. ¿Y tú? (kept L01_phrase_06 instead)
- L02_listen_03 — ¿Cómo te llamas? (kept L02_phrase_02 instead)
- L03_dialogue_03 — ¿De qué parte de México? (kept L03_phrase_07 instead)
- L03_listen_03 — ¿De dónde es usted? (kept L03_phrase_14 instead)
- L05_dialogue_05 — Con gusto. (kept L10_dialogue_06 instead)
- L05_listen_03 — ¿Puedes repetir, por favor? (kept L05_phrase_08 instead)
- L06_dialogue_05 — ¿Algo más? (kept L06_phrase_16 instead)
- L09_dialogue_04 — ¿Dónde vives? (kept L09_phrase_06 instead)
- L10_dialogue_03 — ¿Está lejos? (kept L10_phrase_15 instead)

## Coverage caveat

Only **29 of the 222** recorded texts exactly match a string the app actually speaks (words and phrases from the vocabulary and phrase lists), and **none of the app's 144 dialogue lines** match a recording: the recorded "dialogue" script (Ana, Carlos, …) is different text from the dialogues in the app. Until the recorded script is regenerated from the app's own text, dialogue lines will always use device TTS, even after the voice-matching fix.
