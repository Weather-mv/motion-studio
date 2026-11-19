#!/usr/bin/env python3
"""Synthesises the Meritclaw Link music bed and UI SFX. Original sound, no samples, no third-party licence.

150 BPM => one beat = 0.4 s = 12 frames at 30 fps, so downbeats land on frames 0, 48, 96, ...
Music map (frames): 0-96 drive in | 96-240 full groove | 240-384 tension, 16th hats |
384-528 riser + snare roll swell | 528 final hit (strong beat) | 528-540 tail.
Run: python3 tools/gen_audio.py   (needs numpy and ffmpeg)
"""
import subprocess, wave
from pathlib import Path
import numpy as np

SR = 44100
FPS = 30
BPM = 150
BEAT = 60 / BPM  # 0.4 s
DUR = 18.0
OUT = Path(__file__).resolve().parent.parent / "public" / "audio"
OUT.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)


def t_of(n):
    return np.arange(int(n * SR)) / SR


def env(n, a=0.002, d=0.2):
    t = t_of(n)
    return np.minimum(1, t / a) * np.exp(-t / d)


def hp(x):  # crude high-pass
    return np.concatenate([[0], np.diff(x)])


def ma(x, w):  # moving-average low-pass
    c = np.cumsum(np.concatenate([np.zeros(w), x]))
    return (c[w:] - c[:-w]) / w


def place(buf, sig, at):
    i = int(round(at * SR))
    if i >= len(buf):
        return
    n = min(len(sig), len(buf) - i)
    buf[i:i + n] += sig[:n]


def sine_sweep(f0, f1, n, k=20):
    t = t_of(n)
    f = f1 + (f0 - f1) * np.exp(-k * t)
    return np.sin(2 * np.pi * np.cumsum(f) / SR)


def kick(n=0.35):
    t = t_of(n)
    return np.tanh(2.2 * sine_sweep(170, 46, n, 28)) * np.exp(-t / 0.13) + 0.25 * hp(rng.standard_normal(len(t))) * np.exp(-t / 0.004)


def clap(n=0.25):
    t = t_of(n)
    nz = hp(rng.standard_normal(len(t)))
    e = sum(np.exp(-np.clip(t - d, 0, None) / 0.03) * (t >= d) for d in (0, 0.012, 0.024)) * 0.5
    return ma(nz, 2) * e * np.exp(-t / 0.12)


def hat(n=0.06, o=False):
    t = t_of(0.28 if o else n)
    return hp(hp(rng.standard_normal(len(t)))) * np.exp(-t / (0.09 if o else 0.018)) * 0.5


def pluck(freq, n=0.22, bright=1.0):
    t = t_of(n)
    s = sum(np.sin(2 * np.pi * freq * k * t + k) / k * np.exp(-t * (9 + 14 * k) / bright) for k in range(1, 8))
    return s * np.minimum(1, t / 0.003)


def bass(freq, n=0.19):
    t = t_of(n)
    s = np.sin(2 * np.pi * freq * t) + 0.45 * np.sin(4 * np.pi * freq * t) + 0.2 * np.sin(6 * np.pi * freq * t)
    return np.tanh(1.6 * s) * np.minimum(1, t / 0.004) * np.exp(-t / 0.28)


def pad(freqs, n):
    t = t_of(n)
    s = sum(np.sin(2 * np.pi * f * t) + 0.5 * np.sin(2 * np.pi * f * 1.004 * t) for f in freqs)
    return s * np.minimum(1, t / 0.4) * np.minimum(1, (n - t) / 0.4) * 0.12


def riser(n):
    t = t_of(n)
    nz = rng.standard_normal(len(t))
    bright = hp(nz) * (t / n) ** 2 + ma(nz, 24) * (1 - t / n) * 1.5
    tone = np.sin(2 * np.pi * np.cumsum(180 + 2400 * (t / n) ** 2.2) / SR) * 0.35
    return (bright * 0.5 + tone) * (t / n) ** 1.6


# ---------------- music ----------------
def music():
    L = int(DUR * SR)
    kb, sb, bb, ab = (np.zeros(L) for _ in range(4))  # kick, snare/clap/hat, bass, arp+pad
    hats = np.zeros(L)
    roots = [55.0, 43.65, 65.41, 49.0]  # A1 F1 C2 G1, one per bar
    chords = [[220, 261.63, 329.63], [174.61, 220, 261.63], [261.63, 329.63, 392], [196, 246.94, 293.66]]
    pent = {0: [440, 523.25, 659.25, 783.99], 1: [349.23, 440, 523.25, 698.46], 2: [523.25, 659.25, 783.99, 1046.5], 3: [392, 493.88, 587.33, 783.99]}
    nb = int(DUR / BEAT)  # 45 beats
    for b in range(nb):
        tt = b * BEAT
        bar = (b // 4) % 4
        in_roll = 32 <= b < 44
        if b < 44:
            place(kb, kick() * (0.95 if not (b >= 38) else 1.0), tt)
        if b >= 8 and b % 2 == 1 and b < 44 and not in_roll:
            place(sb, clap(), tt)
        # off-beat open hat, 8ths closed hats
        place(hats, hat(o=True) * 0.8, tt + BEAT / 2)
        for s in range(4):
            if b >= 4 or s % 2 == 0:
                tick16 = 20 <= b < 44  # scene 3 onward: 16th hats
                if tick16 or s % 2 == 0:
                    place(hats, hat() * (0.5 if s % 2 else 0.8), tt + s * BEAT / 4)
        # bass: 8ths with octave pop
        if b >= 2 and b < 44:
            for h in range(2):
                f = roots[bar] * (2 if (h == 1 and b % 2) else 1)
                place(bb, bass(f), tt + h * BEAT / 2)
        # arp: 16ths from beat 8
        if 8 <= b < 44:
            notes = pent[bar]
            for s in range(4):
                f = notes[(b * 4 + s * 3) % 4] * (1 if (b * 4 + s) % 8 < 6 else 0.5)
                place(ab, pluck(f) * (0.55 if s % 2 else 0.8) * (0.7 if b < 20 else 1.0), tt + s * BEAT / 4)
        if b % 4 == 0 and b < 44:
            place(ab, pad(chords[bar], 4 * BEAT), tt)
    # snare roll through the swell: quarter -> 8th -> 16th hits
    for b in range(32, 44):
        div = 1 if b < 36 else 2 if b < 40 else 4
        for s in range(div):
            place(sb, clap(0.2) * (0.5 + 0.5 * (b - 32) / 12), b * BEAT + s * BEAT / div)
    # riser from frame 390 to the hit
    place(ab, riser((528 - 390) / FPS) * 0.9, 390 / FPS)
    # sidechain: duck bass/arp/pad under each kick
    duck = np.ones(L)
    for b in range(0, 44):
        i = int(b * BEAT * SR)
        n = int(0.16 * SR)
        duck[i:i + n] *= 1 - 0.6 * np.exp(-np.arange(min(n, L - i)) / (0.05 * SR))
    mix = kb * 0.95 + sb * 0.55 + hats * 0.28 + (bb * 0.75 + ab * 0.5) * duck
    # final strong beat on frame 528: kick + sub boom + noise crash, rings into the tail
    hit = 528 / FPS
    t = t_of(1.0)
    boom = np.sin(2 * np.pi * 42 * t) * np.exp(-t / 0.35) * 1.1
    crash = hp(rng.standard_normal(len(t))) * np.exp(-t / 0.25) * 0.4
    place(mix, boom, hit)
    place(mix, kick() * 1.2, hit)
    place(mix, crash, hit)
    mix[int(hit * SR) + int(0.42 * SR):] *= 0  # nothing rings past the cut of the video grid
    # start of the track: short fade in
    mix[:int(0.01 * SR)] *= np.linspace(0, 1, int(0.01 * SR))
    mix = np.tanh(mix * 0.9)
    return mix / np.max(np.abs(mix)) * 0.89


# ---------------- sfx ----------------
def click(n=0.09, f=2300):
    t = t_of(n)
    return (hp(rng.standard_normal(len(t))) * np.exp(-t / 0.004) * 0.7 + np.sin(2 * np.pi * f * t) * np.exp(-t / 0.012)) * 0.8


def snap():
    t = t_of(0.22)
    out = sine_sweep(900, 220, 0.22, 26) * np.exp(-t / 0.06) * 0.9
    out[:len(click())] += click()
    return out


def pop():
    t = t_of(0.25)
    return (sine_sweep(1150, 360, 0.25, 40) * np.exp(-t / 0.07) + 0.3 * np.sin(2 * np.pi * 1800 * t) * np.exp(-t / 0.03))


def whoosh(n=0.8):
    t = t_of(n)
    nz = rng.standard_normal(len(t))
    out = np.zeros(len(t))
    ws = [96, 48, 24, 12, 6, 3]  # bright -> dull as it passes
    x = t / n
    centre = 0.35
    for k, w in enumerate(ws):
        wt = np.exp(-((x - (0.15 + k * 0.1)) ** 2) / 0.02)
        out += ma(nz, w)[:len(t)] * wt * (w ** 0.35)
    return out * np.sin(np.pi * np.clip(x / 0.9, 0, 1)) ** 1.5 * 0.9


def chime():
    t = t_of(1.6)
    s = 0
    for f, a, d in ((1318.5, 1.0, 0.7), (1975.5, 0.6, 0.55), (2637.0, 0.4, 0.4), (3951.0, 0.2, 0.25)):
        s = s + a * np.sin(2 * np.pi * f * t + 0.8 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t / 0.05)) * np.exp(-t / d)
    # second note, a fifth up, 0.11 s later
    t2 = np.clip(t - 0.11, 0, None)
    s = s + 0.7 * np.sin(2 * np.pi * 1975.5 * t2) * np.exp(-t2 / 0.6) * (t >= 0.11)
    return s * np.minimum(1, t / 0.002) * 0.5


def ticks():
    n = 19 * 4 / FPS + 0.2
    buf = np.zeros(int(n * SR))
    for i in range(19):
        place(buf, click(0.05, 3200 if i % 4 == 0 else 2600) * (1.0 if i % 4 == 0 else 0.7), i * 4 / FPS)
    return buf


def thud():
    t = t_of(0.9)
    body = np.sin(2 * np.pi * np.cumsum(30 + 55 * np.exp(-t * 18)) / SR) * np.exp(-t / 0.22) * 1.2
    knock = ma(rng.standard_normal(len(t)), 28) * np.exp(-t / 0.05) * 5
    sub = np.sin(2 * np.pi * 36 * t) * np.exp(-t / 0.4) * 0.6
    return np.tanh(1.8 * (body + knock + sub))


def write_wav(path, sig, peak=0.7):
    sig = sig / (np.max(np.abs(sig)) + 1e-9) * peak
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((np.clip(sig, -1, 1) * 32767).astype("<i2").tobytes())


for name, sig, peak in (
    ("sfx_click", click(), 0.6), ("sfx_snap", snap(), 0.7), ("sfx_pop", pop(), 0.7), ("sfx_whoosh", whoosh(), 0.6),
    ("sfx_chime", chime(), 0.6), ("sfx_ticks", ticks(), 0.55), ("sfx_thud", thud(), 0.95),
):
    write_wav(OUT / f"{name}.wav", sig, peak)

tmp = OUT / "_music.wav"
write_wav(tmp, music(), 0.89)
# Music sits under the SFX, so it is normalised below the -14 LUFS delivery target (about -17 LUFS integrated).
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(tmp), "-t", str(DUR), "-af", "loudnorm=I=-17:TP=-2:LRA=7", "-ar", "44100", "-ac", "2", "-b:a", "192k", str(OUT / "fast_tech_bed.mp3")], check=True)
tmp.unlink()
print("wrote", sorted(p.name for p in OUT.iterdir()))
