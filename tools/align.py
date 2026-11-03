"""Word-level timestamps for a job's voiceover.
Usage: .venv/Scripts/python.exe tools/align.py <job> [language]    (needs: pip install faster-whisper numpy; ffmpeg on PATH)
Writes jobs/<job>/edit/words.json: [{"word","start","end"}]
"""
import json, subprocess, sys, pathlib

SAMPLE_RATE = 16000
root = pathlib.Path(__file__).resolve().parent.parent
if len(sys.argv) < 2:
    sys.exit("Usage: python tools/align.py <job> [language]")
job = sys.argv[1]
lang = sys.argv[2] if len(sys.argv) > 2 else None
plan = json.loads((root / "jobs" / job / "plan.json").read_text(encoding="utf-8"))
audio = plan["meta"].get("audio")
if not audio:
    sys.exit("Set meta.audio in plan.json first (file lives in public/jobs/<job>/).")
path = root / "public" / "jobs" / job / audio
import numpy as np
from faster_whisper import WhisperModel
# Decode with ffmpeg: faster-whisper's own decoder breaks on current PyAV (metadata_errors argument removed).
raw = subprocess.run(
    ["ffmpeg", "-v", "error", "-i", str(path), "-f", "f32le", "-ac", "1", "-ar", str(SAMPLE_RATE), "-"],
    capture_output=True, check=True,
).stdout
samples = np.frombuffer(raw, dtype=np.float32)
# device="cpu": the default "auto" picks a GPU and crashes when the CUDA libraries are absent.
model = WhisperModel("small", device="cpu", compute_type="int8")
segments, info = model.transcribe(samples, word_timestamps=True, language=lang)
words = [{"word": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segments for w in s.words]
out = root / "jobs" / job / "edit" / "words.json"
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(json.dumps(words, indent=2), encoding="utf-8")
print(f"{len(words)} words, language={info.language}, duration={len(samples) / SAMPLE_RATE:.2f}s -> {out}")
