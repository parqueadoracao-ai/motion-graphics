import { useMemo } from "react";
import { Easing, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { G_BIG, G_BOUNDS, G_RINGS, LETTERS, TITLE_WIDTH } from "./assets";
import { C, SANS, ip, lerp } from "./theme";
import {
  G_IN, G_MOVE, G_MOVE_DUR, LETTERS_START, LETTER_STEP, LINE_DUR, LINE_START,
  RING_END, RING_START, SHINE_TIMES, SUBTITLE_START,
} from "./timing";

export const TITLE_X = 960 - TITLE_WIDTH / 2;
export const BASELINE = 226;
const LINE_Y = BASELINE + 30;
const GCX = (G_BOUNDS[0] + G_BOUNDS[2]) / 2;
const GCY = (G_BOUNDS[1] + G_BOUNDS[3]) / 2;
const SHINE_DUR = 26;
const pointAt = (d: string, l: number) => getPointAtLength(d, l) ?? { x: 0, y: 0 };

// Configuração visual de cada linha que contorna o G
const RINGS = [
  { width: 3.2, color: "url(#ringGold)", delay: 0, reverse: false, glow: C.goldLight },
  { width: 1.8, color: "url(#ringSky)", delay: 5, reverse: true, glow: "#BFD9F2" },
];

const ringProgress = (f: number, delay: number) =>
  ip(f, [RING_START + delay, RING_END], [0, 1], Easing.bezier(0.65, 0, 0.25, 1));

export const Title: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lens = useMemo(() => G_RINGS.map((d) => getLength(d)), []);

  // ----- G: entrada, centro e viagem até a palavra -----
  const enter = spring({ frame: f - G_IN, fps, config: { damping: 18, stiffness: 70, mass: 1.1 } });
  const move = spring({ frame: f - G_MOVE, fps, durationInFrames: G_MOVE_DUR, config: { damping: 200 } });
  const bigScale = G_BIG * lerp(1.55, 1, enter);
  const gScale = lerp(bigScale, 1, move);
  const gx = lerp(960, TITLE_X + GCX, move);
  const gy = lerp(540 + (1 - enter) * 40, BASELINE + GCY, move);
  const gBlur = (1 - ip(f, [G_IN, G_IN + 14], [0, 1])) * 14;
  const gOpacity = ip(f, [G_IN, G_IN + 10], [0, 1]);

  // pulso de conclusão do contorno
  const done = ip(f, [RING_END - 2, RING_END + 22], [0, 1], Easing.out(Easing.cubic));
  const doneOn = f >= RING_END - 2;
  const ringsFade = 1 - ip(f, [G_MOVE + 2, G_MOVE + 14], [0, 1]);
  const glow = doneOn ? Math.sin(Math.PI * ip(f, [RING_END - 2, G_MOVE + 6], [0, 1])) : 0;

  // brilho (shine) que atravessa o G / o título
  const shine = (() => {
    for (let i = 0; i < SHINE_TIMES.length; i++) {
      const t = SHINE_TIMES[i];
      const dur = i === 0 ? 12 : SHINE_DUR;
      if (f >= t && f <= t + dur) {
        const p = ip(f, [t, t + dur], [0, 1], Easing.inOut(Easing.quad));
        return i === 0 ? lerp(G_BOUNDS[0] - 60, G_BOUNDS[2] + 60, p) : lerp(-160, TITLE_WIDTH + 160, p);
      }
    }
    return null;
  })();

  // ----- linha inferior -----
  const lineP = ip(f, [LINE_START, LINE_START + LINE_DUR], [0, 1], Easing.bezier(0.45, 0, 0.15, 1));
  const lineW = TITLE_WIDTH * lineP;

  // ----- subtítulo -----
  const sub = ip(f, [SUBTITLE_START, SUBTITLE_START + 24], [0, 1], Easing.out(Easing.cubic));

  return (
    <>
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <linearGradient id="inkFill" x1="0" y1="-110" x2="0" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={C.ink2} />
            <stop offset="1" stopColor={C.ink} />
          </linearGradient>
          <linearGradient id="ringGold" x1="0" y1="-130" x2="120" y2="20" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={C.goldLight} />
            <stop offset="0.5" stopColor={C.gold} />
            <stop offset="1" stopColor={C.goldLight} />
          </linearGradient>
          <linearGradient id="ringSky" x1="0" y1="0" x2="120" y2="-120" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={C.sky} />
            <stop offset="1" stopColor={C.sage} />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2={TITLE_WIDTH} y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor={C.gold} stopOpacity="0.15" />
            <stop offset="0.25" stopColor={C.gold} />
            <stop offset="0.5" stopColor={C.goldLight} />
            <stop offset="0.75" stopColor={C.gold} />
            <stop offset="1" stopColor={C.gold} stopOpacity="0.15" />
          </linearGradient>
          <radialGradient id="comet">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="0.25" stopColor={C.goldLight} stopOpacity="0.9" />
            <stop offset="1" stopColor={C.goldLight} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="cometSky">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="0.3" stopColor="#BFD9F2" stopOpacity="0.9" />
            <stop offset="1" stopColor="#BFD9F2" stopOpacity="0" />
          </radialGradient>
          {shine !== null && (
            <linearGradient id="shine" x1={shine - 70} y1="0" x2={shine + 70} y2="-40" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
              <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.75" />
              <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
            </linearGradient>
          )}
          <filter id="gBlur" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={gBlur / gScale} />
          </filter>
          <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={6 / gScale} />
          </filter>
          {LETTERS.map((_, i) => {
            const local = f - (LETTERS_START + (i - 1) * LETTER_STEP);
            return (
              <filter key={i} id={`lb${i}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={Math.max(0, 1 - local / 12) * 6} />
              </filter>
            );
          })}
        </defs>

        {/* onda de luz quando o contorno termina */}
        {doneOn && done < 1 && (
          <g transform={`translate(${gx} ${gy})`} opacity={(1 - done) * 0.8}>
            <circle r={lerp(230, 520, done)} fill="none" stroke={C.goldLight} strokeWidth={lerp(6, 0.5, done)} />
            <circle r={lerp(200, 380, done)} fill="none" stroke={C.sky} strokeWidth={lerp(3, 0.5, done)} opacity={0.7} />
          </g>
        )}

        {/* O "G" e suas linhas */}
        <g transform={`translate(${gx} ${gy}) scale(${gScale}) translate(${-GCX} ${-GCY})`} opacity={gOpacity}>
          {/* halo dourado no G */}
          {glow > 0 && <path d={LETTERS[0].d} fill={C.goldLight} opacity={glow * 0.9} filter="url(#soft)" />}
          <g filter={gBlur > 0.05 ? "url(#gBlur)" : undefined}>
            <path d={LETTERS[0].d} fill="url(#inkFill)" />
          </g>
          {shine !== null && <path d={LETTERS[0].d} fill="url(#shine)" />}

          {ringsFade > 0 &&
            RINGS.map((r, i) => {
              const len = lens[i];
              const p = ringProgress(f, r.delay);
              if (p <= 0) return null;
              const drawn = len * p;
              const head = r.reverse ? len - drawn : drawn;
              const trail = Math.min(len * 0.16, drawn);
              const comet = p < 1;
              const pt = pointAt(G_RINGS[i], Math.min(len - 0.01, Math.max(0, head)));
              const sw = r.width / gScale;
              const sparks = [];
              if (comet) {
                for (let k = 1; k <= 12; k++) {
                  const pk = ringProgress(f - k * 0.7, r.delay);
                  if (pk <= 0) break;
                  const hk = r.reverse ? len - len * pk : len * pk;
                  const q = pointAt(G_RINGS[i], Math.min(len - 0.01, Math.max(0, hk)));
                  const ang = (k * 2.3 + i) % 6.28;
                  const drift = (k * 2.2) / gScale;
                  sparks.push(
                    <circle
                      key={k}
                      cx={q.x + Math.cos(ang) * drift}
                      cy={q.y + Math.sin(ang) * drift}
                      r={Math.max(0.4, 3.4 - k * 0.24) / gScale}
                      fill="#FFFFFF"
                      opacity={(1 - k / 13) * 0.9}
                    />,
                  );
                }
              }
              return (
                <g key={i} opacity={ringsFade}>
                  {/* traço principal desenhando de 0 a 100% */}
                  <path
                    d={G_RINGS[i]}
                    fill="none"
                    stroke={r.color}
                    strokeWidth={sw * (doneOn ? 1 + glow * 0.8 : 1)}
                    strokeLinecap="round"
                    strokeDasharray={`${len} ${len}`}
                    strokeDashoffset={r.reverse ? -(len - drawn) : len - drawn}
                  />
                  {/* rastro luminoso perto da cabeça */}
                  {comet && (
                    <path
                      d={G_RINGS[i]}
                      fill="none"
                      stroke="#FFFFFF"
                      strokeWidth={sw * 1.6}
                      strokeLinecap="round"
                      opacity={0.85}
                      strokeDasharray={
                        r.reverse ? `0 ${head} ${trail} ${len * 2}` : `0 ${Math.max(0, head - trail)} ${trail} ${len * 2}`
                      }
                    />
                  )}
                  {comet && (
                    <>
                      {sparks}
                      <circle cx={pt.x} cy={pt.y} r={26 / gScale} fill={i === 0 ? "url(#comet)" : "url(#cometSky)"} />
                      <circle cx={pt.x} cy={pt.y} r={4 / gScale} fill="#FFFFFF" />
                    </>
                  )}
                </g>
              );
            })}
        </g>

        {/* Demais letras de GENEROSIDADE */}
        <g transform={`translate(${TITLE_X} ${BASELINE})`}>
          {LETTERS.slice(1).map((l, j) => {
            const i = j + 1;
            const local = f - (LETTERS_START + (i - 1) * LETTER_STEP);
            if (local < 0) return null;
            const p = spring({ frame: local, fps, config: { damping: 15, stiffness: 140 } });
            const op = ip(local, [0, 8], [0, 1]);
            return (
              <g key={i} transform={`translate(${l.x} ${(1 - p) * 46}) `} opacity={op}>
                <g filter={local < 12 ? `url(#lb${i})` : undefined}>
                  <path d={l.d} fill="url(#inkFill)" />
                </g>
              </g>
            );
          })}
          {/* brilho do título inteiro (coordenadas do título) */}
          {shine !== null && f > SHINE_TIMES[0] + 12 &&
            LETTERS.slice(1).map((l, j) => <path key={j} d={l.d} transform={`translate(${l.x} 0)`} fill="url(#shine)" />)}
        </g>

        {/* Linha inferior crescendo da esquerda para a direita */}
        {lineP > 0 && (
          <g transform={`translate(${TITLE_X} ${LINE_Y})`}>
            <rect x={0} y={-1.5} width={lineW} height={3} rx={1.5} fill="url(#lineGrad)" />
            {lineP < 1 && (
              <>
                <circle cx={lineW} cy={0} r={16} fill="url(#comet)" />
                <circle cx={lineW} cy={0} r={3} fill="#FFFFFF" />
              </>
            )}
            {/* reflexo que percorre a linha na espera */}
            {shine !== null && f > SHINE_TIMES[0] + 12 && (
              <>
                <rect x={shine - 70} y={-2.5} width={140} height={5} rx={2.5} fill={C.goldLight} />
                <circle cx={shine} cy={0} r={14} fill="url(#comet)" />
              </>
            )}
          </g>
        )}
      </svg>

      {/* DÍZIMOS E OFERTAS */}
      <div
        style={{
          position: "absolute",
          top: LINE_Y + 22,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 30,
          color: C.slate,
          letterSpacing: lerp(34, 16, sub),
          paddingLeft: lerp(34, 16, sub), // compensa o espaçamento da última letra
          opacity: sub,
          filter: `blur(${(1 - sub) * 6}px)`,
          transform: `translateY(${(1 - sub) * 14}px)`,
        }}
      >
        DÍZIMOS <span style={{ color: C.gold }}>E</span> OFERTAS
      </div>
    </>
  );
};
