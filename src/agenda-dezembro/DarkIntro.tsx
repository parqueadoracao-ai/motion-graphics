import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BTN_CX, BTN_CY, BTN_SIZE, C } from "./theme";
import { HAND_ARRIVE, HAND_GONE, HAND_IN, HAND_OUT, PRESS, TRANS_START } from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Quanto o botão está "ligado" (0..1)
export const useLight = () => {
  const frame = useCurrentFrame();
  return interpolate(frame, [PRESS, PRESS + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
};

// Botão de vidro com ícone de play
const PlayButton: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const on = useLight();
  // afunda no clique e volta com mola
  const push = interpolate(frame, [PRESS - 4, PRESS], [0, 1], clamp) * (1 - spring({ frame: frame - PRESS - 2, fps, config: { damping: 12 } }));
  const flicker = frame >= PRESS && frame < PRESS + 8 ? [1, 0.55, 1, 0.7, 1, 1, 0.85, 1][frame - PRESS] : 1;
  const L = on * flicker;
  // cresce um pouco quando a luz invade a tela
  const grow = interpolate(frame, [TRANS_START - 6, TRANS_START + 18], [1, 1.25], { ...clamp, easing: Easing.in(Easing.cubic) });
  const pulse = 1 + Math.sin(frame / 5) * 0.04 * on;
  const s = BTN_SIZE;
  return (
    <div
      style={{
        position: "absolute",
        left: BTN_CX - s / 2,
        top: BTN_CY - s / 2,
        width: s,
        height: s,
        transform: `scale(${(1 - push * 0.06) * grow})`,
      }}
    >
      {/* halo */}
      <div
        style={{
          position: "absolute",
          inset: -s * 0.9,
          borderRadius: "50%",
          background: `radial-gradient(circle, rgba(168,107,255,${0.55 * L}) 0%, rgba(227,107,255,${0.18 * L}) 35%, rgba(0,0,0,0) 68%)`,
          transform: `scale(${pulse})`,
        }}
      />
      {/* corpo */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 58,
          background: `linear-gradient(160deg, rgba(${40 + 110 * L},${36 + 40 * L},${60 + 160 * L},0.9), rgba(${18 + 60 * L},${16 + 10 * L},${30 + 90 * L},0.95))`,
          border: `${3 + 3 * L}px solid rgba(${120 + 115 * L},${110 + 90 * L},${150 + 105 * L},${0.25 + 0.75 * L})`,
          boxShadow: [
            `0 0 ${10 + 50 * L}px rgba(190,120,255,${0.9 * L})`,
            `0 0 ${40 + 120 * L}px rgba(168,107,255,${0.7 * L})`,
            `inset 0 0 ${30 + 30 * L}px rgba(227,107,255,${0.6 * L})`,
            `0 18px 40px rgba(0,0,0,0.6)`,
          ].join(", "),
        }}
      />
      {/* ícone play */}
      <svg viewBox="0 0 100 100" style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <defs>
          <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation={2.5 * L} result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d="M40 31 L69 50 L40 69 Z"
          fill={`rgba(255,255,255,${0.05 + 0.25 * L})`}
          stroke={L > 0.02 ? "#FFFFFF" : "#4A4460"}
          strokeOpacity={0.6 + 0.4 * L}
          strokeWidth={4.5}
          strokeLinejoin="round"
          filter="url(#neonGlow)"
        />
      </svg>
    </div>
  );
};

// Mão feminina em traço fino (line art feito à mão), vista pelo dorso.
// Indicador estendido (ponta em 200,0); médio, anelar e mindinho levemente curvados; polegar solto.
const HAND_OUTLINE = [
  "M168 960 L168 760",
  "C168 700 150 630 124 540", // lateral do pulso até a base do polegar
  "C110 500 100 456 102 424 C104 398 128 390 136 408", // polegar: borda externa e ponta
  "C146 440 158 474 172 500 L178 468", // polegar: borda interna até a base do indicador
  "L178 26 C178 3 222 3 222 26", // indicador: lado esquerdo e ponta
  "L223 262", // indicador: lado direito
  "C226 212 229 176 233 152 C236 128 274 128 275 154", // médio
  "C276 186 272 236 269 280",
  "C271 238 274 206 277 192 C280 170 313 172 313 196", // anelar
  "C314 232 313 268 311 304",
  "C313 284 316 266 318 252 C321 232 349 234 349 256", // mindinho
  "C350 300 352 350 350 404",
  "C350 480 340 560 318 640 C306 690 304 740 304 760 L304 960",
].join(" ");

const HAND_DETAILS = [
  // unhas
  "M186 40 C186 18 214 18 214 40 C214 48 186 48 186 40",
  "M240 160 C241 142 268 142 269 160",
  "M283 202 C284 186 307 186 308 202",
  "M323 260 C324 246 344 246 345 260",
  "M108 422 C110 406 128 402 132 414",
  // articulações do indicador
  "M184 150 Q200 156 216 150",
  "M183 160 Q200 165 217 160",
  "M184 290 Q200 297 216 290",
  // articulações dos outros dedos
  "M236 220 Q252 226 268 220",
  "M280 248 Q295 253 309 248",
  "M321 300 Q334 305 347 300",
  // nós dos dedos (dorso)
  "M190 380 Q200 372 212 380",
  "M238 360 Q250 352 262 360",
  "M282 372 Q292 366 302 372",
  "M320 400 Q330 394 340 402",
  // tendões discretos
  "M200 420 C204 500 212 580 226 650",
  "M250 400 C250 480 248 560 244 640",
  "M292 410 C288 480 280 560 266 640",
  // pulseira fina
  "M168 760 C200 778 272 778 304 760",
  "M168 772 C200 790 272 790 304 772",
];

const Hand: React.FC<{ light: number; draw: number }> = ({ light, draw }) => {
  const stroke = `rgba(${226 + 20 * light},${216 + 10 * light},255,${0.7 + 0.3 * light})`;
  return (
    <svg viewBox="0 0 400 960" width={360} height={864} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="handFill" x1="0" y1="0" x2="0" y2="960" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#2A1F48" />
          <stop offset="0.6" stopColor="#120E22" />
          <stop offset="1" stopColor="#06050B" />
        </linearGradient>
        <linearGradient id="handFade" x1="0" y1="0" x2="0" y2="960" gradientUnits="userSpaceOnUse">
          <stop offset="0.7" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.95" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="handMask">
          <rect x="-50" y="-50" width="500" height="1060" fill="url(#handFade)" />
        </mask>
        <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation={1 + 3 * light} result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <g mask="url(#handMask)">
        {/* preenchimento escuro: a mão fica na frente do botão */}
        <path d={HAND_OUTLINE + " Z"} fill="url(#handFill)" opacity={0.92} />
        <g fill="none" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)">
          <path d={HAND_OUTLINE} strokeWidth={2.4} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - draw} />
          {HAND_DETAILS.map((d, k) => (
            <path
              key={k}
              d={d}
              strokeWidth={1.5}
              strokeOpacity={0.75}
              pathLength={1}
              strokeDasharray="1 1"
              strokeDashoffset={1 - interpolate(draw, [0.35 + k * 0.012, 0.75 + k * 0.012], [0, 1], clamp)}
            />
          ))}
        </g>
      </g>
    </svg>
  );
};

export const DarkIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const light = useLight();
  // trajetória da ponta do dedo
  const inP = spring({ frame: frame - HAND_IN, fps, config: { damping: 20, mass: 1.1 }, durationInFrames: HAND_ARRIVE - HAND_IN });
  const press = interpolate(frame, [PRESS - 4, PRESS, PRESS + 6], [0, 14, 6], clamp);
  const outP = interpolate(frame, [HAND_OUT, HAND_GONE], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const tipY = interpolate(inP, [0, 1], [1180, BTN_CY + 8]) + press + outP * 760;
  const tipX = BTN_CX + 6 + (1 - inP) * 120 + outP * 60;
  const tilt = (1 - inP) * 10 + outP * 6;
  const ambient = interpolate(frame, [0, 20], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {/* luz ambiente fraca */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 60% at 50% 44%, rgba(70,50,120,${0.28 * ambient + 0.35 * light}) 0%, rgba(20,14,40,${0.3 * ambient}) 45%, rgba(0,0,0,0) 75%)`,
        }}
      />
      <PlayButton />
      {frame >= HAND_IN && frame < HAND_GONE && (
        <div
          style={{
            position: "absolute",
            left: tipX - 180,
            top: tipY,
            transformOrigin: "50% 0%",
            transform: `rotate(${-tilt}deg)`,
          }}
        >
          <Hand light={light} draw={interpolate(frame, [HAND_IN, HAND_ARRIVE + 4], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) })} />
        </div>
      )}
      {/* vinheta */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};
