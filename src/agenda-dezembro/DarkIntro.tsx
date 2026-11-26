import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { FemaleHand } from "./Hand";
import { BTN_CX, BTN_CY, BTN_SIZE, C } from "./theme";
import { BTN_SPIN, BTN_SPIN_DUR, HAND_ARRIVE, HAND_GONE, HAND_IN, HAND_OUT, PRESS, TRANS_START } from "./timing";

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
  // cena 1: o botão entra girando (meia volta em Y + giro no plano) e assenta
  const spin = spring({ frame: frame - BTN_SPIN, fps, config: { damping: 15, stiffness: 70 }, durationInFrames: BTN_SPIN_DUR });
  const appear = interpolate(frame, [BTN_SPIN, BTN_SPIN + 10], [0, 1], clamp);
  const s = BTN_SIZE;
  return (
    <div
      style={{
        position: "absolute",
        left: BTN_CX - s / 2,
        top: BTN_CY - s / 2,
        width: s,
        height: s,
        opacity: appear,
        transform: `perspective(900px) rotateY(${(1 - spin) * 360}deg) rotateZ(${(1 - spin) * -90}deg) scale(${(0.55 + 0.45 * spin) * (1 - push * 0.06) * grow})`,
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

const HAND_W = 340;

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
            left: tipX - 260 * (HAND_W / 420),
            top: tipY,
            transformOrigin: "50% 0%",
            transform: `rotate(${-tilt}deg)`,
            filter: `brightness(${0.5 + 0.45 * light + 0.15 * inP})`,
          }}
        >
          <FemaleHand light={light} width={HAND_W} />
        </div>
      )}
      {/* vinheta */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};
