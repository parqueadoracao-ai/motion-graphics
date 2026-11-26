"""Gera src/efeitos/contorno-de-luz/glifos.ts para o efeito "Contorno de Luz".

Para cada caractere suportado (A–Z, 0–9, acentuadas do português e espaço) grava:
- o contorno vetorial da letra (Playfair Display 700, via @fontsource) em px, tamanho TAM;
- avanço horizontal (para montar palavras);
- os anéis externos (contorno da própria letra deslocado para fora), usados pelas linhas de luz.
Uso: python3 scripts/contorno-de-luz.py
Requer: pip install fonttools brotli shapely
"""
import json
from fontTools.ttLib import TTFont
from fontTools.pens.recordingPen import DecomposingRecordingPen
from shapely.geometry import Polygon
from shapely.ops import unary_union

FONT = "node_modules/@fontsource/playfair-display/files/playfair-display-latin-700-normal.woff2"
CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789ÁÀÂÃÄÉÈÊËÍÌÎÏÓÒÔÕÖÚÙÛÜÇÑ"
TAM = 150         # tamanho da letra na palavra formada (px)
GRANDE = 3.6      # escala da letra no centro da tela
ANEIS = [16, 34]  # distância (px na tela, com a letra grande) de cada linha de luz

font = TTFont(FONT)
gs = font.getGlyphSet()
cmap = font.getBestCmap()
k = TAM / font["head"].unitsPerEm

def qsegs(args):
    ctrls, end = args[:-1], args[-1]
    for i, c in enumerate(ctrls):
        e = end if i == len(ctrls) - 1 else ((c[0] + ctrls[i + 1][0]) / 2, (c[1] + ctrls[i + 1][1]) / 2)
        yield c, e

def poligonos(rec, steps=12):
    polys, cur = [], []
    P = lambda p: (p[0] * k, -p[1] * k)
    for op, args in rec.value:
        if op == "moveTo":
            cur = [P(args[0])]
        elif op == "lineTo":
            cur.append(P(args[0]))
        elif op == "qCurveTo":
            p0 = cur[-1]
            for c, e in qsegs(args):
                c, e = P(c), P(e)
                for s in range(1, steps + 1):
                    t = s / steps
                    cur.append(((1-t)**2*p0[0] + 2*(1-t)*t*c[0] + t*t*e[0], (1-t)**2*p0[1] + 2*(1-t)*t*c[1] + t*t*e[1]))
                p0 = e
        elif op == "curveTo":
            c1, c2, e = [P(a) for a in args]
            p0 = cur[-1]
            for s in range(1, steps + 1):
                t = s / steps; m = 1 - t
                cur.append((m**3*p0[0] + 3*m*m*t*c1[0] + 3*m*t*t*c2[0] + t**3*e[0],
                            m**3*p0[1] + 3*m*m*t*c1[1] + 3*m*t*t*c2[1] + t**3*e[1]))
        elif op in ("closePath", "endPath"):
            if len(cur) > 2: polys.append(cur)
            cur = []
    return polys

def caminho(rec):
    out = []
    f = lambda p: f"{p[0]*k:.2f} {-p[1]*k:.2f}"
    for op, args in rec.value:
        if op == "moveTo": out.append("M" + f(args[0]))
        elif op == "lineTo": out.append("L" + f(args[0]))
        elif op == "qCurveTo":
            for c, e in qsegs(args): out.append("Q" + f(c) + " " + f(e))
        elif op == "curveTo": out.append("C" + " ".join(f(a) for a in args))
        elif op in ("closePath", "endPath"): out.append("Z")
    return "".join(out)

def silhueta(rec):
    """Letra preenchida respeitando os furos (regra par/ímpar via XOR)."""
    shape = None
    for p in poligonos(rec):
        g = Polygon(p).buffer(0)
        shape = g if shape is None else shape.symmetric_difference(g)
    return shape

glifos = {}
for ch in CHARS + " ":
    rec = DecomposingRecordingPen(gs); gs[cmap[ord(ch)]].draw(rec)
    adv = round(gs[cmap[ord(ch)]].width * k, 2)
    if ch == " ":
        glifos[ch] = {"d": "", "avanco": adv, "caixa": [0, 0, adv, 0], "aneis": []}
        continue
    shape = silhueta(rec)
    aneis = []
    for d in ANEIS:
        off = shape.buffer(d / GRANDE, join_style=1, resolution=24).simplify(0.08)
        partes = sorted(off.geoms if off.geom_type == "MultiPolygon" else [off], key=lambda p: -p.area)
        subs = []
        for parte in partes:  # 1ª = corpo da letra; demais = acentos, cedilha etc.
            coords = list(parte.exterior.coords)[:-1]
            i0 = min(range(len(coords)), key=lambda i: coords[i][1])  # começa no topo
            coords = coords[i0:] + coords[:i0] + [coords[i0]]
            subs.append("M" + "L".join(f"{a:.1f} {b:.1f}" for a, b in coords) + "Z")
        aneis.append(subs)
    glifos[ch] = {"d": caminho(rec), "avanco": adv, "caixa": [round(v, 2) for v in shape.bounds], "aneis": aneis}

with open("src/efeitos/contorno-de-luz/glifos.ts", "w") as f:
    f.write("// Gerado por scripts/contorno-de-luz.py — não editar à mão.\n")
    f.write(f"export const TAM = {TAM};\nexport const GRANDE = {GRANDE};\n")
    f.write("export type Glifo = { d: string; avanco: number; caixa: number[]; aneis: string[][] };\n")
    f.write("export const GLIFOS: Record<string, Glifo> = ")
    f.write(json.dumps(glifos, ensure_ascii=False) + ";\n")
print("ok", len(glifos), "glifos")
