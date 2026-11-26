# Audio spot-check (MACHINE-GENERATED, UNVERIFIED)

Every file in `app/audio/` was synthesized with Piper (es_MX voices) and has **not** been listened to by a person. The Whisper "screen" (faster-whisper small) is only a rough proxy: it writes numbers as digits ("cuatro" -> "4") and hallucinates on one-word clips ("¡Suscríbete!"), so a low score does not prove the audio is bad, and a high score does not prove it is right.

Each line below exists as a normal file (`app/audio/<id>.mp3`) and a slow file (`app/audio/slow/<id>.mp3`). Listen to both.

## The 15 lines to check first

Re-rendered with the fallback voice (claude-high) but still low on Whisper:
1. L03_phrase_03 — "Él es de... / Ella es de..." (heard as "LSD y LSD")
2. L06_phrase_07 — "agua" (heard as "¡Ewa!")
3. L07_phrase_07 — "tu / tus" (heard as "¡Totos!")
4. L09_phrase_07 — "Vivo en..." (low on both speeds)
5. L04_phrase_17 — "dieciséis" (heard as "y así seis")
6. L04_phrase_11 — "diez" (heard as "¡Bies!" / "10.")

Female voice (claude-high), shipped, flagged by the Whisper screen:
7. L02_phrase_06 — "Eres..." (heard as "It is.")
8. L04_phrase_12 — "once" (heard as "¡Pose!" / "Don't Say")
9. L04_phrase_14 — "trece" (heard as "¡Plesa!")
10. L04_phrase_16 — "quince" (heard as "¡Clinse!")

Male voice (ald), shipped because it was not flagged, but lowest Whisper scores among those:
11. L01_dialogue_01 — "Buenos días, Ana. ¿Cómo estás?" (heard as "…I am up the worst test")
12. L02_dialogue_05 — "Sí, soy nuevo." (heard as "Sí, soy rebelde.")
13. L08_phrase_01 — "¿Qué hora es?" (slow file heard as "¿Qué lo hagas?")
14. L10_phrase_07 — "todo derecho" (heard as "¡Dónde he hecho!")
15. L04_phrase_23 — "cuarenta" (heard as "¡Penta!" / "VENTA")

## All 41 fallback-voice lines (ald -> claude-high)

These are single word/phrase items the male voice (ald) failed on. They are rendered with the female voice claude-high so they still have offline audio, and are marked `fallbackVoice: true` in `app/audio/manifest-meta.json`. Whisper similarity on these rose from a 0.42 mean to 0.74, and most of the remaining low scores are digits ("cuatro" -> "4"). Listen to all of them, because the voice differs from the rest of the male lines.

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

## Left to device TTS (no recording shipped)

ald dialogue/listening lines that failed the screen (a dialogue turn is not re-rendered with a different voice):

- L01_listen_03 — Hasta mañana, Ana.
- L04_dialogue_02 — Tengo treinta y cuatro años. ¿Y tú?
- L04_dialogue_03 — Tengo cuarenta y dos.
- L05_dialogue_04 — Ah, sí. Gracias.
- L07_dialogue_01 — ¿Tienes hijos, Tom?

## Held out (duplicate texts, not decided yet)

The same text appears in more than one script row, but a manifest can map a text to only one file. Per instruction, no duplicate handling has been applied: **both files of every pair are left out of the manifests and not copied** until a decision is made.

- bien, gracias. ¿y tú? — L01_dialogue_02.mp3, L01_phrase_06.mp3
- ¿cómo te llamas? — L02_listen_03.mp3, L02_phrase_02.mp3
- ¿de qué parte de méxico? — L03_dialogue_03.mp3, L03_phrase_07.mp3
- ¿de dónde es usted? — L03_listen_03.mp3, L03_phrase_14.mp3
- cinco, cinco, tres, cero, ocho, nueve. — L04_dialogue_05.mp3, L04_listen_03.mp3
- con gusto. — L05_dialogue_05.mp3, L10_dialogue_06.mp3
- ¿puedes repetir, por favor? — L05_listen_03.mp3, L05_phrase_08.mp3
- ¿algo más? — L06_dialogue_05.mp3, L06_phrase_16.mp3
- ¿dónde vives? — L09_dialogue_04.mp3, L09_phrase_06.mp3
- ¿está lejos? — L10_dialogue_03.mp3, L10_phrase_15.mp3
