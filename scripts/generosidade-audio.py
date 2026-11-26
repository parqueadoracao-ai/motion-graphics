"""Gera a trilha e os efeitos do projeto Generosidade (tudo sintetizado, sem samples):
public/generosidade/pad.wav    trilha ambiente de 15 s (acordes suaves + sinos)
public/generosidade/chime.wav  brilho de conclusão do contorno do G
public/generosidade/ding.wav   'QR detectado' no celular
"""
import os, wave
import numpy as np

SR = 48000
rng = np.random.default_rng(3)
os.makedirs("public/generosidade", exist_ok=True)

def hz(n):  # nota MIDI -> Hz
    return 440 * 2 ** ((n - 69) / 12)

def reverb(x, secs=2.8, mix=0.35):
    n = int(SR * secs)
    t = np.arange(n) / SR
    ir = rng.standard_normal(n) * np.exp(-t * 3.2)
    ir[: int(0.012 * SR)] = 0
    ir /= np.sqrt((ir ** 2).sum())
    L = len(x) + n
    nfft = 1 << (L - 1).bit_length()
    wet = np.fft.irfft(np.fft.rfft(x, nfft) * np.fft.rfft(ir, nfft), nfft)[:L]
    dry = np.concatenate([x, np.zeros(n)])
    return dry * (1 - mix) + wet * mix * 3

def save(name, l, r):
    st = np.stack([l, r], 1)
    st = st / (np.abs(st).max() + 1e-9) * 0.85
    with wave.open(f"public/generosidade/{name}", "wb") as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((st * 32767).astype("<i2").tobytes())

def pad_voice(f, dur, att=1.2, rel=1.6):
    t = np.arange(int(dur * SR)) / SR
    v = np.zeros_like(t)
    for det in (-0.06, 0.0, 0.07):  # leve desafinação = coro
        ff = f * 2 ** (det / 12)
        for h in range(1, 7):
            v += np.sin(2 * np.pi * ff * h * t + rng.uniform(0, 6.28)) / (h ** 1.7)
    env = np.minimum(1, t / att) * np.minimum(1, (dur - t) / rel).clip(0)
    return v * env * (1 + 0.08 * np.sin(2 * np.pi * 0.25 * t))

def bell(f, dur=2.5, amp=1.0):
    t = np.arange(int(dur * SR)) / SR
    v = (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(2 * np.pi * f * 2.0 * t) * np.exp(-t * 3)
         + 0.18 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t * 5))
    return v * np.exp(-t * 2.2) * np.minimum(1, t / 0.004) * amp

# ---------- trilha ----------
TOTAL = 15.0
N = int(TOTAL * SR)
L = np.zeros(N); R = np.zeros(N)
# Ré maior, sereno: Dmaj9 – Bm9 – Gmaj9 – Asus4/Dadd9
chords = [[50, 57, 61, 64, 66], [47, 54, 57, 61, 62], [43, 50, 54, 57, 59], [45, 52, 57, 62, 64]]
seg = TOTAL / len(chords)
for i, ch in enumerate(chords):
    start = int(i * seg * SR)
    for j, n in enumerate(ch):
        v = pad_voice(hz(n), seg + 1.6, att=1.4 if i else 2.0)
        end = min(N, start + len(v))
        pan = 0.3 + 0.4 * (j / (len(ch) - 1))
        L[start:end] += v[: end - start] * (1 - pan) * (0.6 if j == 0 else 0.35)
        R[start:end] += v[: end - start] * pan * (0.6 if j == 0 else 0.35)
# sinos esparsos (pentatônica de Ré), suaves
for tt, n in [(1.9, 74), (3.1, 78), (4.6, 81), (6.2, 76), (7.6, 83), (9.3, 78), (10.8, 81), (12.4, 86), (13.6, 81)]:
    b = bell(hz(n), 3.0, 0.16)
    s = int(tt * SR); e = min(N, s + len(b)); p = rng.uniform(0.25, 0.75)
    L[s:e] += b[: e - s] * (1 - p); R[s:e] += b[: e - s] * p
L = reverb(L)[:N]; R = reverb(R)[:N]
t = np.arange(N) / SR
fade = np.minimum(1, t / 1.0) * np.minimum(1, (TOTAL - t) / 1.8).clip(0)
save("pad.wav", L * fade, R * fade)

# ---------- chime (conclusão do contorno) ----------
n = int(3.0 * SR); cl = np.zeros(n); cr = np.zeros(n)
for k, note in enumerate([86, 90, 93, 98]):
    b = bell(hz(note), 2.6, 1.0 - k * 0.15)
    s = int(k * 0.045 * SR); e = min(n, s + len(b)); p = 0.3 + 0.13 * k
    cl[s:e] += b[: e - s] * (1 - p); cr[s:e] += b[: e - s] * p
# brilho de ruído agudo
tn = np.arange(n) / SR
air = np.diff(rng.standard_normal(n + 1)) * np.exp(-tn * 6) * 0.08
save("chime.wav", reverb(cl + air, 2.0, 0.4)[:n], reverb(cr + air, 2.0, 0.4)[:n])

# ---------- ding (QR detectado) ----------
n = int(1.6 * SR); d = np.zeros(n)
for k, note in enumerate([88, 95]):
    b = bell(hz(note), 1.4, 0.9)
    s = int(k * 0.09 * SR); e = min(n, s + len(b)); d[s:e] += b[: e - s]
d = reverb(d, 1.2, 0.25)[:n]
save("ding.wav", d, d)
print("ok pad/chime/ding")
