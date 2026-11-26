"""Gera src/generosidade/assets.ts a partir de arquivos locais:
- contornos vetoriais do título (Playfair Display 700, via @fontsource) e anéis externos do "G";
- matriz do QR Code (lida do PNG/WEBP enviado pelo usuário, sem reencodar o conteúdo).
Uso: python3 scripts/generosidade-assets.py caminho/do/qrcode.(png|webp)
Requer: pip install fonttools brotli shapely opencv-python-headless numpy
"""
import json, sys
import cv2, numpy as np
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import RecordingPen
from shapely.geometry import Polygon
from shapely.ops import unary_union

FONT = "node_modules/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2"
TEXT = "GENEROSIDADE"
FS = 150          # tamanho final do título em px
TRACK = 14        # espaçamento extra entre letras (px)
BIG = 3.6         # escala do "G" grande na abertura
RINGS = [16, 34]  # distância (px na tela, com o G grande) de cada linha externa

font = TTFont(FONT)
gs = font.getGlyphSet()
cmap = font.getBestCmap()
upm = font["head"].unitsPerEm
k = FS / upm

def flatten(rec, steps=12):
    """Converte comandos da caneta em polígonos (y invertido, em px)."""
    polys, cur, start = [], [], None
    def P(p): return (p[0] * k, -p[1] * k)
    for op, args in rec.value:
        if op == "moveTo":
            cur = [P(args[0])]
        elif op == "lineTo":
            cur.append(P(args[0]))
        elif op == "qCurveTo":
            pts = [P(a) for a in args]
            p0 = cur[-1]
            # quadráticas TrueType com pontos implícitos
            ctrls, end = pts[:-1], pts[-1]
            segs = []
            for i, c in enumerate(ctrls):
                e = end if i == len(ctrls) - 1 else ((c[0] + ctrls[i + 1][0]) / 2, (c[1] + ctrls[i + 1][1]) / 2)
                segs.append((c, e))
            for c, e in segs:
                for s in range(1, steps + 1):
                    t = s / steps
                    cur.append(((1-t)**2*p0[0] + 2*(1-t)*t*c[0] + t*t*e[0], (1-t)**2*p0[1] + 2*(1-t)*t*c[1] + t*t*e[1]))
                p0 = e
        elif op == "curveTo":
            c1, c2, e = [P(a) for a in args]
            p0 = cur[-1]
            for s in range(1, steps + 1):
                t = s / steps
                mt = 1 - t
                cur.append((mt**3*p0[0] + 3*mt*mt*t*c1[0] + 3*mt*t*t*c2[0] + t**3*e[0],
                            mt**3*p0[1] + 3*mt*mt*t*c1[1] + 3*mt*t*t*c2[1] + t**3*e[1]))
        elif op in ("closePath", "endPath"):
            if len(cur) > 2: polys.append(cur)
            cur = []
    return polys

def svg_path(rec):
    out = []
    def f(p): return f"{p[0]*k:.2f} {-p[1]*k:.2f}"
    for op, args in rec.value:
        if op == "moveTo": out.append("M" + f(args[0]))
        elif op == "lineTo": out.append("L" + f(args[0]))
        elif op == "qCurveTo":
            ctrls, end = args[:-1], args[-1]
            for i, c in enumerate(ctrls):
                e = end if i == len(ctrls) - 1 else ((c[0] + ctrls[i+1][0]) / 2, (c[1] + ctrls[i+1][1]) / 2)
                out.append("Q" + f(c) + " " + f(e))
        elif op == "curveTo": out.append("C" + " ".join(f(a) for a in args))
        elif op in ("closePath", "endPath"): out.append("Z")
    return "".join(out)

letters, x = [], 0.0
for ch in TEXT:
    name = cmap[ord(ch)]
    rec = RecordingPen(); gs[name].draw(rec)
    adv = gs[name].width * k
    letters.append({"ch": ch, "x": round(x, 2), "w": round(adv, 2), "d": svg_path(rec), "rec": rec})
    x += adv + TRACK
width = x - TRACK
capH = font["OS/2"].sCapHeight * k

# Anéis externos do G (contorno externo deslocado)
g = letters[0]
shape = unary_union([Polygon(p).buffer(0) for p in flatten(g["rec"])])
gb = shape.bounds  # minx, miny, maxx, maxy
rings = []
for d in RINGS:
    off = shape.buffer(d / BIG, join_style=1, resolution=24)
    ext = off.exterior if off.geom_type == "Polygon" else max(off.geoms, key=lambda p: p.area).exterior
    coords = list(ext.coords)
    # começa no ponto mais alto (topo do G) para o traço nascer em cima
    i0 = min(range(len(coords) - 1), key=lambda i: coords[i][1])
    coords = coords[i0:-1] + coords[:i0] + [coords[i0]]
    rings.append("M" + "L".join(f"{a:.2f} {b:.2f}" for a, b in coords) + "Z")

# QR Code: matriz de módulos lida da imagem retificada
img = cv2.imread(sys.argv[1], cv2.IMREAD_GRAYSCALE)
det = cv2.QRCodeDetector()
data, _, straight = det.detectAndDecode(img)
assert data, "QR não decodificado"
m = (straight < 128).astype(np.uint8)
N = m.shape[0]
# confere: matriz reconstruída decodifica para o mesmo conteúdo
s, q = 10, 4
big = np.full(((N + 2*q) * s,) * 2, 255, np.uint8)
for yy in range(N):
    for xx in range(N):
        if m[yy, xx]: big[(yy+q)*s:(yy+q+1)*s, (xx+q)*s:(xx+q+1)*s] = 0
assert det.detectAndDecode(big)[0] == data, "matriz reconstruída diverge do original"
qr = []
for yy in range(N):
    xx = 0
    while xx < N:
        if m[yy, xx]:
            x0 = xx
            while xx < N and m[yy, xx]: xx += 1
            qr.append(f"M{x0} {yy}h{xx-x0}v1h{x0-xx}z")
        else:
            xx += 1

with open("src/generosidade/assets.ts", "w") as f:
    f.write("// Gerado por scripts/generosidade-assets.py — não editar à mão.\n")
    f.write(f"export const TITLE_FS = {FS};\nexport const TITLE_WIDTH = {width:.2f};\nexport const TITLE_CAP = {capH:.2f};\n")
    f.write(f"export const G_BIG = {BIG};\n")
    f.write(f"export const G_BOUNDS = {json.dumps([round(v, 2) for v in gb])};\n")
    f.write("export const LETTERS: { ch: string; x: number; w: number; d: string }[] = ")
    f.write(json.dumps([{k2: v for k2, v in l.items() if k2 != "rec"} for l in letters]) + ";\n")
    f.write(f"export const G_RINGS = {json.dumps(rings)};\n")
    f.write(f"export const QR_N = {N};\nexport const QR_PATH = {json.dumps(''.join(qr))};\n")
print("ok", "width", round(width), "cap", round(capH), "G bounds", [round(v) for v in gb], "QR", N)
