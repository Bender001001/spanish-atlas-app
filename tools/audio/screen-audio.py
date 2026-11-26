#!/usr/bin/env python
"""Whisper "screen": transcribe each generated MP3 (faster-whisper small, Spanish) and score the text
against the script with difflib similarity (accents/punctuation stripped). A ROUGH proxy only:
Whisper writes numbers as digits ("cuatro" -> "4") and hallucinates on one-word clips ("¡Suscríbete!").

  python tools/audio/screen-audio.py --audio-dir <out> --model-dir <whisper cache> --report asr.json
Output rows: [id, "n"|"s", script voice, script text, Whisper text, similarity 0..1]
Needs: faster-whisper 1.2.1, numpy, ffmpeg on PATH.
"""
import argparse, csv, difflib, json, os, re, subprocess, unicodedata
import numpy as np
from faster_whisper import WhisperModel

def norm(t):
    t = unicodedata.normalize("NFD", t.lower())
    t = "".join(c for c in t if unicodedata.category(c) != "Mn")
    return " ".join(re.sub(r"[^a-z0-9 ]", " ", t).split())

def load(f):
    b = subprocess.run(["ffmpeg", "-v", "error", "-i", f, "-f", "f32le", "-ac", "1", "-ar", "16000", "-"], capture_output=True).stdout
    return np.frombuffer(b, dtype=np.float32)

def main():
    here = os.path.dirname(os.path.abspath(__file__))
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--audio-dir", required=True, help="folder with <id>.mp3 and slow/<id>.mp3")
    ap.add_argument("--model-dir", required=True, help="download_root for the faster-whisper 'small' model")
    ap.add_argument("--script", default=os.path.join(here, "audio_script.csv"))
    ap.add_argument("--only", help="JSON list of ids to screen")
    ap.add_argument("--report", required=True)
    a = ap.parse_args()
    keep = set(json.load(open(a.only))) if a.only else None
    rows = {r["file"][:-4]: r for r in csv.DictReader(open(a.script, encoding="utf-8")) if keep is None or r["file"][:-4] in keep}
    m = WhisperModel("small", device="cpu", compute_type="int8", download_root=a.model_dir)
    res = []
    for stem, r in rows.items():
        for kind, d in (("n", a.audio_dir), ("s", os.path.join(a.audio_dir, "slow"))):
            segs, _ = m.transcribe(load(os.path.join(d, stem + ".mp3")), language="es", beam_size=5,
                                   vad_filter=False, condition_on_previous_text=False)
            hyp = " ".join(s.text for s in segs).strip()
            sim = difflib.SequenceMatcher(None, norm(r["text"]), norm(hyp)).ratio()
            res.append((stem, kind, r["voice"], r["text"], hyp, round(sim, 2)))
    json.dump(res, open(a.report, "w", encoding="utf-8"), ensure_ascii=False)
    print("done", len(res))

if __name__ == "__main__":
    main()
