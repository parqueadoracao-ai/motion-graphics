"""Gera public/agenda-dezembro/click.wav: clique curto de botão (sintetizado, sem samples).
Uso: python3 scripts/agenda-click.py
"""
import math, random, struct, wave

SR = 48000
random.seed(7)
n = int(SR * 0.18)
out = []
for i in range(n):
    t = i / SR
    tick = random.uniform(-1, 1) * math.exp(-t * 900)            # ataque seco
    body = math.sin(2 * math.pi * 1900 * t) * math.exp(-t * 60)   # "tic" tonal
    low = math.sin(2 * math.pi * 140 * t) * math.exp(-t * 35)     # corpo grave
    out.append(0.55 * tick + 0.25 * body + 0.35 * low)
peak = max(abs(s) for s in out)
with wave.open("public/agenda-dezembro/click.wav", "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(b"".join(struct.pack("<h", int(s / peak * 0.8 * 32767)) for s in out))
print("ok click.wav")
