// Monta previsao-rn/previsao-rn.html (arquivo único, funciona offline) a partir de:
//   app.html                    — editor + animação + exportação
//   dados/*.geojson, *.json     — malhas e nomes oficiais do IBGE (baixados uma vez, ver README)
//   node_modules                — fonte Plus Jakarta Sans e mp4-muxer
// Uso: npm run build:previsao-rn
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..");
const read = (p) => readFileSync(p);
const json = (p) => JSON.parse(readFileSync(join(here, "dados", p), "utf8"));

// ---------- projeção: equiretangular corrigida pela latitude média do RN ----------
const LAT0 = -5.8, LON0 = -36.7, K = Math.cos((LAT0 * Math.PI) / 180), S = 1000; // 1000 unidades por grau de latitude
const proj = ([lon, lat]) => [(lon - LON0) * K * S, -(lat - LAT0) * S];
const unproj = ([x, y]) => [x / (K * S) + LON0, -y / S + LAT0];
const r1 = (v) => Math.round(v * 10) / 10;

const rings = (geom) =>
  geom.type === "Polygon" ? geom.coordinates : geom.type === "MultiPolygon" ? geom.coordinates.flat() : [];
const outerRings = (geom) =>
  geom.type === "Polygon" ? [geom.coordinates[0]] : geom.type === "MultiPolygon" ? geom.coordinates.map((p) => p[0]) : [];

function pathOf(geom) {
  let d = "";
  for (const ring of rings(geom)) {
    const pts = ring.map(proj);
    let last = null;
    pts.forEach((p, i) => {
      const q = [r1(p[0]), r1(p[1])];
      if (last && q[0] === last[0] && q[1] === last[1]) return;
      d += (i === 0 ? "M" : "L") + q[0] + " " + q[1];
      last = q;
    });
    d += "Z";
  }
  return d;
}

function inside(pt, ring) {
  let c = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}
function segDist(p, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / (dx * dx + dy * dy || 1)));
  return Math.hypot(p[0] - a[0] - t * dx, p[1] - a[1] - t * dy);
}
// ponto mais "central" do polígono (o mais distante das bordas): onde o pino é fincado
function poleOf(ring) {
  const xs = ring.map((p) => p[0]), ys = ring.map((p) => p[1]);
  let [x0, x1, y0, y1] = [Math.min(...xs), Math.max(...xs), Math.min(...ys), Math.max(...ys)];
  let best = null, bd = -1;
  for (let pass = 0; pass < 3; pass++) {
    const n = 24, sx = (x1 - x0) / n, sy = (y1 - y0) / n;
    for (let i = 0; i <= n; i++)
      for (let j = 0; j <= n; j++) {
        const p = [x0 + i * sx, y0 + j * sy];
        if (!inside(p, ring)) continue;
        let d = Infinity;
        for (let k = 0, m = ring.length - 1; k < ring.length; m = k++) d = Math.min(d, segDist(p, ring[m], ring[k]));
        if (d > bd) { bd = d; best = p; }
      }
    [x0, x1, y0, y1] = [best[0] - 2 * sx, best[0] + 2 * sx, best[1] - 2 * sy, best[1] + 2 * sy];
  }
  return best;
}
const ringArea = (r) => Math.abs(r.reduce((a, p, i) => { const q = r[(i + 1) % r.length]; return a + p[0] * q[1] - q[0] * p[1]; }, 0) / 2);
function perimeter(geom) {
  let L = 0;
  for (const ring of rings(geom)) { const pts = ring.map(proj); for (let i = 1; i < pts.length; i++) L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); }
  return L;
}

// ---------- municípios ----------
const nomes = Object.fromEntries(json("ibge-municipios-rn.json").map((m) => [String(m.id), m.nome]));
const malha = json("malha-rn-municipios.geojson");
const municipios = malha.features.map((f) => {
  const id = String(f.properties.codarea);
  const outer = outerRings(f.geometry).map((r) => r.map(proj)).sort((a, b) => ringArea(b) - ringArea(a))[0];
  const c = poleOf(outer);
  const all = rings(f.geometry).flat().map(proj);
  const xs = all.map((p) => p[0]), ys = all.map((p) => p[1]);
  const ll = unproj(c);
  return {
    id, nome: nomes[id],
    d: pathOf(f.geometry),
    c: [r1(c[0]), r1(c[1])],
    b: [r1(Math.min(...xs)), r1(Math.min(...ys)), r1(Math.max(...xs)), r1(Math.max(...ys))],
    len: Math.round(perimeter(f.geometry)),
    ll: [Math.round(ll[0] * 1e4) / 1e4, Math.round(ll[1] * 1e4) / 1e4],
  };
}).sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));
if (municipios.length !== 167 || municipios.some((m) => !m.nome)) throw new Error("Malha/nomes do IBGE incompletos");

const uf = (n) => pathOf(json(`malha-uf-${n}.geojson`).features[0].geometry);
const rnFeat = json("malha-uf-24.geojson").features[0].geometry;
const rnPts = rings(rnFeat).flat().map(proj);
const bounds = [
  r1(Math.min(...rnPts.map((p) => p[0]))), r1(Math.min(...rnPts.map((p) => p[1]))),
  r1(Math.max(...rnPts.map((p) => p[0]))), r1(Math.max(...rnPts.map((p) => p[1]))),
];
// estados vizinhos (só contexto, desenhados como terra clara)
const vizinhos = [23, 25, 26, 27, 28, 29].map(uf).join("");
const mapa = { bounds, rn: uf(24), vizinhos, municipios };

// ---------- fontes e bibliotecas ----------
const fontDir = join(root, "node_modules/@fontsource/plus-jakarta-sans/files");
const fontes = Object.fromEntries([500, 700, 800].map((w) => [w, read(join(fontDir, `plus-jakarta-sans-latin-${w}-normal.woff2`)).toString("base64")]));
const muxer = readFileSync(join(root, "node_modules/mp4-muxer/build/mp4-muxer.js"), "utf8");

let html = readFileSync(join(here, "app.html"), "utf8");
const inject = (marker, code) => {
  if (!html.includes(marker)) throw new Error("Marcador ausente: " + marker);
  html = html.replace(marker, () => code.replace(/<\/script/gi, "<\\/script"));
};
inject("/*__MAPA__*/", "window.MAPA_RN=" + JSON.stringify(mapa) + ";");
inject("/*__FONTES__*/", "window.FONTES=" + JSON.stringify(fontes) + ";");
inject("/*__MP4MUXER__*/", muxer);
writeFileSync(join(here, "previsao-rn.html"), html);
console.log(`previsao-rn.html: ${(html.length / 1024).toFixed(0)} KB · ${municipios.length} municípios`);
