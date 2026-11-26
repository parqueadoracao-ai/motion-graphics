"""Gera public/whoosh.wav: ruído filtrado com varredura de frequência (sintetizado, sem samples externos)."""
import math, random, struct, wave, os

SR = 48000
DUR = 0.7
random.seed(7)
n = int(SR * DUR)
low = band = 0.0
out = []
for i in range(n):
    t = i / n
    # cutoff sobe e desce (300 Hz -> 3.5 kHz -> 600 Hz)
    fc = 300 + 3200 * math.sin(math.pi * t) ** 1.5
    f = 2 * math.sin(math.pi * fc / SR)
    q = 0.6
    x = random.uniform(-1, 1)
    low += f * band
    high = x - low - q * band
    band += f * high
    # envelope: ataque rápido, cauda suave
    env = (t / 0.35) ** 2 if t < 0.35 else ((1 - t) / 0.65) ** 1.6
    out.append(band * env)
peak = max(abs(s) for s in out)
os.makedirs("public", exist_ok=True)
with wave.open("public/whoosh.wav", "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    frames = bytearray()
    for i, s in enumerate(out):
        v = s / peak * 0.8
        pan = 0.5 + 0.4 * math.sin(math.pi * (i / n - 0.5))  # leve pan L->R
        frames += struct.pack("<hh", int(v * (1 - pan) * 1.2 * 32767), int(v * pan * 1.2 * 32767))
    w.writeframes(bytes(frames))
print("ok public/whoosh.wav")
