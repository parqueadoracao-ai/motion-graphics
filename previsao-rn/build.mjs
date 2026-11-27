// Monta previsao-rn/previsao-rn-v<VERSAO>.html (arquivo único, funciona offline) a partir de:
//   app.html                    — editor + animação + exportação
//   dados/*.geojson, *.json     — malhas e nomes oficiais do IBGE (baixados uma vez, ver README)
//   node_modules                — fonte Inter e mp4-muxer
// Uso: npm run build:previsao-rn
import { readFileSync, writeFileSync, readdirSync, unlinkSync } from "node:fs";
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
// Contorno do RN montado a partir das próprias divisas dos municípios (arestas que pertencem a um só
// município). Assim o contorno coincide exatamente com as linhas internas e com o destaque das cidades.
function bordaDosMunicipios() {
  const key = (p) => p[0].toFixed(6) + "," + p[1].toFixed(6);
  const pts = new Map(), cnt = new Map();
  for (const f of malha.features) for (const ring of rings(f.geometry))
    for (let i = 1; i < ring.length; i++) {
      const a = key(ring[i - 1]), b = key(ring[i]); if (a === b) continue;
      pts.set(a, ring[i - 1]); pts.set(b, ring[i]);
      const k = a < b ? a + "|" + b : b + "|" + a; cnt.set(k, (cnt.get(k) || 0) + 1);
    }
  const viz = new Map(); const add = (a, b) => { if (!viz.has(a)) viz.set(a, []); viz.get(a).push(b); };
  for (const [k, n] of cnt) if (n === 1) { const [a, b] = k.split("|"); add(a, b); add(b, a); }
  const usadas = new Set(), aneis = [];
  for (const inicio of viz.keys()) {
    for (const prox of viz.get(inicio)) {
      const e0 = inicio < prox ? inicio + "|" + prox : prox + "|" + inicio; if (usadas.has(e0)) continue;
      const anel = [inicio]; let ant = inicio, at = prox; usadas.add(e0);
      while (at !== inicio) {
        anel.push(at);
        const seg = viz.get(at).find((q) => { const e = at < q ? at + "|" + q : q + "|" + at; return q !== ant && !usadas.has(e); });
        if (!seg) break;
        usadas.add(at < seg ? at + "|" + seg : seg + "|" + at); ant = at; at = seg;
      }
      aneis.push(anel.map((k) => pts.get(k)));
    }
  }
  return pathOf({ type: "Polygon", coordinates: aneis.filter((a) => a.length > 3).map((a) => [...a, a[0]]) });
}
const mapa = { bounds, rn: bordaDosMunicipios(), vizinhos, municipios };

// ---------- fontes e bibliotecas ----------
const fontDir = join(root, "node_modules/@fontsource/inter/files");
const fontes = { familia: "Inter", pesos: Object.fromEntries([500, 600, 800, 900].map((w) => [w, read(join(fontDir, `inter-latin-${w}-normal.woff2`)).toString("base64")])) };
const muxer = readFileSync(join(root, "node_modules/mp4-muxer/build/mp4-muxer.js"), "utf8");

let html = readFileSync(join(here, "app.html"), "utf8");
const inject = (marker, code) => {
  if (!html.includes(marker)) throw new Error("Marcador ausente: " + marker);
  html = html.replace(marker, () => code.replace(/<\/script/gi, "<\\/script"));
};
inject("/*__MAPA__*/", "window.MAPA_RN=" + JSON.stringify(mapa) + ";");
inject("/*__FONTES__*/", "window.FONTES=" + JSON.stringify(fontes) + ";");
inject("/*__MP4MUXER__*/", muxer);
// versão: previsao-rn/VERSAO (ex.: 1.0.0). O arquivo gerado leva a versão no nome e no cabeçalho do app.
const versao = readFileSync(join(here, "VERSAO"), "utf8").trim();
if (!/^\d+\.\d+\.\d+$/.test(versao)) throw new Error("VERSAO inválida: " + versao);
// variantes para o cliente comparar (ex.: 1.1.5B com outros ícones), em variantes.json:
//   { "B": { "icones": "traco" } }   → gera também previsao-rn-v<VERSAO>B.html
let variantes = {};
try { variantes = JSON.parse(readFileSync(join(here, "variantes.json"), "utf8")); } catch (e) {}
// "_principal": false gera só as variantes (as já entregues da mesma versão ficam como estão)
const principal = variantes._principal !== false; delete variantes._principal;
const builds = [...(principal ? [["", { icones: "chapado" }]] : []), ...Object.entries(variantes)];
const saidas = builds.map(([suf]) => `previsao-rn-v${versao}${suf}.html`);
for (const f of readdirSync(here)) { const m = f.match(/^previsao-rn(?:-v([\d.]+)[A-Z]?)?\.html$/); if (m && m[1] !== versao) unlinkSync(join(here, f)); }
builds.forEach(([suf, cfg], i) => {
  const out = html.replaceAll("__VERSAO__", versao + suf).replaceAll("__ESTILO_ICONES__", cfg.icones || "chapado");
  writeFileSync(join(here, saidas[i]), out);
  console.log(`${saidas[i]}: ${(out.length / 1024).toFixed(0)} KB · ${municipios.length} municípios · ícones ${cfg.icones || "chapado"}`);
});
