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

// Mão estilizada apontando para cima (SVG feito à mão). Ponta do dedo em (250, 0).
const Hand: React.FC<{ light: number }> = ({ light }) => (
  <svg viewBox="0 0 500 1000" width={330} height={660} style={{ overflow: "visible" }}>
    <defs>
      <linearGradient id="skin" x1="0" y1="0" x2="0" y2="1000" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#E9B79C" />
        <stop offset="0.45" stopColor="#C98C70" />
        <stop offset="1" stopColor="#5E3A33" />
      </linearGradient>
      <linearGradient id="shade" x1="120" y1="0" x2="430" y2="0" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#000" stopOpacity="0.25" />
        <stop offset="0.45" stopColor="#000" stopOpacity="0" />
        <stop offset="1" stopColor="#000" stopOpacity="0.45" />
      </linearGradient>
      <linearGradient id="glowSpill" x1="0" y1="0" x2="0" y2="700" gradientUnits="userSpaceOnUse">
        <stop offset="0" stopColor="#D48BFF" stopOpacity="0.85" />
        <stop offset="0.5" stopColor="#A86BFF" stopOpacity="0.35" />
        <stop offset="1" stopColor="#A86BFF" stopOpacity="0" />
      </linearGradient>
      <clipPath id="handShape">
        <rect x="195" y="0" width="110" height="480" rx="55" />
        <rect x="150" y="380" width="262" height="380" rx="96" />
        <rect x="288" y="362" width="104" height="150" rx="50" />
        <rect x="330" y="432" width="92" height="140" rx="45" />
        <rect x="350" y="512" width="78" height="122" rx="38" />
        <rect x="96" y="420" width="96" height="236" rx="48" transform="rotate(-24 144 538)" />
        <rect x="178" y="640" width="232" height="420" rx="44" />
      </clipPath>
    </defs>
    <g clipPath="url(#handShape)">
      <rect x="0" y="0" width="500" height="1000" fill="url(#skin)" />
      <rect x="0" y="0" width="500" height="1000" fill="url(#shade)" />
      <rect x="0" y="0" width="500" height="1000" fill="url(#glowSpill)" opacity={0.15 + 0.85 * light} style={{ mixBlendMode: "screen" }} />
    </g>
    {/* unha */}
    <rect x="221" y="12" width="58" height="70" rx="27" fill="#FFE3D6" opacity={0.28 + 0.3 * light} />
    {/* dobras */}
    <g fill="none" stroke="#5A2E2A" strokeOpacity="0.35" strokeWidth="4" strokeLinecap="round">
      <path d="M212 205 Q250 214 288 205" />
      <path d="M216 330 Q250 338 286 330" />
      <path d="M300 440 Q340 452 386 438" />
      <path d="M335 510 Q372 520 418 508" />
      <path d="M355 585 Q388 594 424 584" />
      <path d="M176 470 Q200 520 232 560" />
    </g>
  </svg>
);

export const DarkIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const light = useLight();
  // trajetória da ponta do dedo
  const inP = spring({ frame: frame - HAND_IN, fps, config: { damping: 20, mass: 1.1 }, durationInFrames: HAND_ARRIVE - HAND_IN });
  const press = interpolate(frame, [PRESS - 4, PRESS, PRESS + 6], [0, 14, 6], clamp);
  const outP = interpolate(frame, [HAND_OUT, HAND_GONE], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const tipY = interpolate(inP, [0, 1], [1180, BTN_CY + 34]) + press + outP * 760;
  const tipX = BTN_CX + 18 + (1 - inP) * 120 + outP * 60;
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
            left: tipX - 165,
            top: tipY,
            transformOrigin: "50% 0%",
            transform: `rotate(${-tilt}deg)`,
            filter: `drop-shadow(0 0 ${30 * light}px rgba(168,107,255,${0.35 * light}))`,
          }}
        >
          <Hand light={light} />
        </div>
      )}
      {/* vinheta */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};
