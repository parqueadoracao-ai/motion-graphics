"""Gera src/generosidade/assets.ts: matriz do QR Code lida do PNG/WEBP enviado pelo usuário
(sem reencodar o conteúdo; a matriz reconstruída é conferida contra o original).
O título usa o efeito Contorno de Luz (scripts/contorno-de-luz.py).
Uso: python3 scripts/generosidade-assets.py caminho/do/qrcode.(png|webp)
Requer: pip install opencv-python-headless numpy
"""
import json, sys
import cv2, numpy as np

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
    f.write(f"export const QR_N = {N};\nexport const QR_PATH = {json.dumps(''.join(qr))};\n")
print("ok QR", N)
