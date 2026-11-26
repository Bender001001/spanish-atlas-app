# Recorded audio pipeline (MACHINE-GENERATED, UNVERIFIED)

Everything in `app/audio/` was synthesized with Piper TTS (`piper-tts` on PyPI). **No human has listened to it.** See `docs/AUDIO-SPOTCHECK.md` for what to listen to first.

| File | Purpose |
|---|---|
| `audio_script.csv` | Input: `file,voice,text,kind` for all 238 lines (`voice` is `male_mx` or `female_mx`). |
| `generate-audio.py` | Piper -> WAV -> loudness-normalised MP3, normal + slow. |
| `screen-audio.py` | Whisper "screen": transcribes each MP3 and scores it against the script. |
| `weak-lines.json` | Result of the earlier screen: `"<id>:n"` / `"<id>:s"` entries (normal / slow file) that failed. See *Provenance* below. |
| `assemble-audio.js` | Copies files into `app/audio/` and writes `manifest.json`, `manifest-slow.json`, `manifest-meta.json`. |

## Settings that produced the shipped files

- Voices: `male_mx` -> **`es_MX-ald-medium`**, `female_mx` -> **`es_MX-claude-high`**. Both are 22050 Hz mono, espeak voice `es-419`, voice `length_scale` 1.0 (read from each `.onnx.json`).
- **Slow = `length_scale` x 1.25** (1.0 -> 1.25). Other synthesis settings are the voice's own (`noise_scale`/`noise_w` from its `.onnx.json`).
- Text: `" / "` is spoken as `", "` ("mi hijo / mi hija" -> "mi hijo, mi hija").
- Loudness: measure with ffmpeg `loudnorm=I=-19:TP=-2:LRA=11` (after padding to 2 s so one-word clips measure), apply one gain step to **-19 LUFS integrated**, then `alimiter=limit=0.8:level=disabled`. Files measured quieter than -60 LUFS are skipped.
- Encode: `libmp3lame`, mono, **64 kbps**, 22050 Hz, no tags (`-map_metadata -1 -id3v2_version 0 -write_xing 0`).
- Fallback voice: male **phrase** lines that failed the screen with `ald` were re-rendered with `es_MX-claude-high` (`--force-voice`). Male dialogue/listening lines that failed ship no file (device TTS).

## Voice models (not in the repo)

Not committed (~63 MB each). Where they came from was not recorded when they were downloaded. They match the Piper community voices `es_MX-ald-medium` and `es_MX-claude-high`, normally published in the `rhasspy/piper-voices` repository on Hugging Face (`es/es_MX/<name>/<quality>/`); that origin is **assumed, not verified**, so confirm each voice's licence in its model card before redistributing audio. SHA-256 of the files used:

```
6ca4b9bc22b3fa19792c212822186fa0f34cb73c1bdced6be83e4038aa946e10  es_MX-ald-medium.onnx
94bd0137c7736b2b13ec5c04943e4a0a121b2793ad4bf20c64d625365839edc9  es_MX-ald-medium.onnx.json
3ef40a71ea63852cd8ab7e6fa7d2ecdcfa67a0b47c9c48e3f10e02ee02083ea0  es_MX-claude-high.onnx
1afc81f703c0e4cb3b4d7c0dca096b8b54a98806807f0170cf5eb5557723c12d  es_MX-claude-high.onnx.json
```

Tool versions used: Python 3.14, `piper-tts` 1.8.0, `faster-whisper` 1.2.1 (model `small`, int8, CPU), `numpy` 2.5, ffmpeg 9.0.

## Rerun

```sh
python -m venv .audio-venv && .audio-venv/bin/pip install piper-tts==1.8.0 faster-whisper==1.2.1 numpy   # Windows: .audio-venv\Scripts\
# put the four voice files in ./voices/ (see above), ffmpeg + ffprobe on PATH

# 1. everything with each line's own voice
python tools/audio/generate-audio.py --voices-dir voices --out build/audio-normal
# 2. the male phrase lines that failed the screen, with the fallback voice
node -e 'const j=require("./tools/audio/weak-lines.json"),c=require("fs").readFileSync("tools/audio/audio_script.csv","utf8");console.log(JSON.stringify([...new Set(j.map(k=>k.split(":")[0]))].filter(s=>new RegExp("^"+s+"\.mp3,male_mx,.*,phrase$","m").test(c))))' > build/weak-phrases.json
python tools/audio/generate-audio.py --voices-dir voices --out build/audio-fallback --only build/weak-phrases.json --force-voice es_MX-claude-high
# 3. (optional) screen the output
python tools/audio/screen-audio.py --audio-dir build/audio-normal --model-dir build/whisper --report build/asr.json
# 4. copy into app/audio and write the manifests, then rebuild + test
node tools/audio/assemble-audio.js --normal build/audio-normal --fallback build/audio-fallback
npm test
```

## Caveats

- **Synthesis is not deterministic.** Piper samples noise, so a rerun gives audio of the same quality but not the same bytes. Rerunning replaces the shipped files with new, equally unverified ones; do it deliberately, and re-listen.
- The Whisper score is a weak proxy (digits, one-word hallucinations). A low score is a reason to listen, not proof of a bad file.
- **Provenance of `weak-lines.json`:** it is the recorded outcome of the earlier screen (about 95 entries). The exact rule that produced it was not saved, so it is committed as data and cannot be regenerated from `screen-audio.py` alone.
- The original generation run may have turned `" / "` into `" , "` instead of `", "` (a regex that lost its backslashes); this script uses the intended `", "`. No text in the script has a letter touching a slash, so the spoken difference is at most a slightly different pause.
- Duplicate texts (10 of them) are deliberately left out of the manifests until a decision is made; see `docs/AUDIO-SPOTCHECK.md`.
