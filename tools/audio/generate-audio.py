#!/usr/bin/env python
"""Generate the ORALE recordings with Piper TTS. MACHINE-GENERATED audio, not human-verified.

For every row of audio_script.csv this writes two MP3s: normal (<out>/<id>.mp3) and slow
(<out>/slow/<id>.mp3). See tools/audio/README.md for setup and the whole pipeline.

  python tools/audio/generate-audio.py --voices-dir <dir with the .onnx voices> --out <dir>
  python tools/audio/generate-audio.py ... --only ids.json --force-voice es_MX-claude-high --out <dir2>

Needs: piper-tts 1.8.0 (pip), ffmpeg on PATH.
"""
import argparse, csv, json, os, re, subprocess, sys, wave
from piper import PiperVoice, SynthesisConfig

# --- fixed settings (these produced the shipped files) ---------------------------------------
VOICES = {"male_mx": "es_MX-ald-medium", "female_mx": "es_MX-claude-high"}  # script column "voice" -> Piper voice
SLOW_FACTOR = 1.25      # slow file: length_scale = voice's own length_scale (1.0 for both voices) * 1.25
TARGET_LUFS = -19.0     # integrated loudness every file is normalised to (ffmpeg loudnorm measurement)
TRUE_PEAK = -2          # loudnorm TP used for the measurement pass
LRA = 11                # loudnorm LRA used for the measurement pass
LIMITER = 0.8           # alimiter limit applied after the gain, level=disabled
SAMPLE_RATE = 22050     # both voices are 22050 Hz mono
MP3_BITRATE = "64k"
TAIL_PAD_S = 2          # measurement only: apad=whole_dur=2 so very short clips (one word) can be measured
SILENT_BELOW_LUFS = -60 # measured quieter than this = nothing was synthesised -> file is skipped

def ff(*a):
    return subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-y", *a],
                          capture_output=True, text=True, encoding="utf-8", errors="replace")

def synth(voice, text, length_scale, wav_path):
    cfg = SynthesisConfig(length_scale=length_scale)
    pcm = b"".join(c.audio_int16_bytes for c in voice.synthesize(text, syn_config=cfg))
    with wave.open(wav_path, "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SAMPLE_RATE); w.writeframes(pcm)
    return len(pcm) / 2 / SAMPLE_RATE

def encode(wav, mp3):
    """Measure loudness, apply one gain step to TARGET_LUFS + a limiter, encode mono 64 kbps MP3 with no tags."""
    m = ff("-i", wav, "-af", f"apad=whole_dur={TAIL_PAD_S},loudnorm=I={TARGET_LUFS}:TP={TRUE_PEAK}:LRA={LRA}:print_format=json",
           "-f", "null", "-")
    j = json.loads(re.findall(r'\{[^{}]*"input_i"[^{}]*\}', m.stderr)[-1])
    li = float(j["input_i"])
    if li < SILENT_BELOW_LUFS:
        return None
    r = ff("-i", wav, "-af", f"volume={TARGET_LUFS - li:.2f}dB,alimiter=limit={LIMITER}:level=disabled",
           "-ac", "1", "-c:a", "libmp3lame", "-b:a", MP3_BITRATE, "-ar", str(SAMPLE_RATE),
           "-map_metadata", "-1", "-id3v2_version", "0", "-write_xing", "0", mp3)
    assert r.returncode == 0, r.stderr[-400:]
    return li

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--voices-dir", required=True, help="folder holding <voice>.onnx and <voice>.onnx.json")
    ap.add_argument("--out", required=True, help="output folder (a slow/ subfolder is created inside)")
    ap.add_argument("--script", default=os.path.join(here, "audio_script.csv"))
    ap.add_argument("--only", help="JSON list of ids (e.g. L04_phrase_01); render just those rows")
    ap.add_argument("--force-voice", help="render every selected row with this Piper voice (the claude-high fallback)")
    ap.add_argument("--report", help="write a JSON report [id, kind, voice, input LUFS, seconds]")
    a = ap.parse_args()

    rows = list(csv.DictReader(open(a.script, encoding="utf-8")))
    if a.only:
        keep = set(json.load(open(a.only)))
        rows = [r for r in rows if r["file"][:-4] in keep]
    loaded = {}
    def get(name):
        if name not in loaded:
            base = os.path.join(a.voices_dir, name)
            ls = json.load(open(base + ".onnx.json", encoding="utf-8"))["inference"].get("length_scale", 1.0)
            loaded[name] = (PiperVoice.load(base + ".onnx"), ls)
        return loaded[name]

    rep = []
    for r in rows:
        name = a.force_voice or VOICES[r["voice"]]
        pv, ls = get(name)
        stem = r["file"][:-4]
        text = re.sub(r"\s*/\s*", ", ", r["text"])  # "mi hijo / mi hija" is spoken as "mi hijo, mi hija"
        for kind, scale, d in (("n", ls, a.out), ("s", ls * SLOW_FACTOR, os.path.join(a.out, "slow"))):
            os.makedirs(d, exist_ok=True)
            wav = os.path.join(d, f"_tmp_{stem}_{kind}.wav")
            dur = synth(pv, text, scale, wav)
            li = encode(wav, os.path.join(d, stem + ".mp3"))
            os.remove(wav)
            rep.append((stem, kind, name, li, round(dur, 2)))
    if a.report:
        json.dump(rep, open(a.report, "w"))
    print(len(rep), "files written to", a.out)

if __name__ == "__main__":
    sys.exit(main())
