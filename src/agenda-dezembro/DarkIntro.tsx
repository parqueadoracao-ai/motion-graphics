import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LineHand, TIP } from "./Hand";
import { BTN_CX, BTN_CY, BTN_SIZE, C } from "./theme";
import { BTN_SPIN, BTN_SPIN_DUR, HAND_ARRIVE, HAND_GONE, HAND_IN, HAND_OUT, PRESS, TRANS_START } from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Quanto o botão está "ligado" (0..1)
export const useLight = () => {
  const frame = useCurrentFrame();
  return interpolate(frame, [PRESS, PRESS + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
};

// Botão redondo de power (anel duplo) com raios que acendem
const PowerButton: React.FC = () => {
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
          borderRadius: "50%",
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
      {/* anel externo, ícone de power e raios */}
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
        <circle cx="50" cy="50" r="58" fill="none" stroke={`rgba(${150 + 90 * L},${140 + 70 * L},${190 + 65 * L},${0.3 + 0.6 * L})`} strokeWidth={1.6} filter="url(#neonGlow)" />
        <g fill="none" stroke={L > 0.02 ? "#FFFFFF" : "#4A4460"} strokeOpacity={0.6 + 0.4 * L} strokeWidth={5} strokeLinecap="round" filter="url(#neonGlow)">
          <path d="M37.3 35.5 A20 20 0 1 0 62.7 35.5" />
          <line x1="50" y1="27" x2="50" y2="49" />
        </g>
        {/* raios: aparecem ao ligar */}
        <g stroke="#E9D8FF" strokeWidth={3.2} strokeLinecap="round" filter="url(#neonGlow)" opacity={L}>
          {[-40, 0, 40].map((a) => {
            const r0 = 68 + 4 * (1 - on);
            const r1 = 68 + 14 * on;
            const rad = (a * Math.PI) / 180;
            return <line key={a} x1={50 + Math.sin(rad) * r0} y1={50 - Math.cos(rad) * r0} x2={50 + Math.sin(rad) * r1} y2={50 - Math.cos(rad) * r1} />;
          })}
        </g>
      </svg>
    </div>
  );
};

const HAND_SCALE = 0.62;
const DIR = { x: 0.56, y: 0.83 }; // direção do braço (da ponta do dedo para o pulso)

export const DarkIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const light = useLight();
  // trajetória da ponta do dedo
  const inP = spring({ frame: frame - HAND_IN, fps, config: { damping: 20, mass: 1.1 }, durationInFrames: HAND_ARRIVE - HAND_IN });
  const press = interpolate(frame, [PRESS - 4, PRESS, PRESS + 6], [0, 14, 6], clamp);
  const outP = interpolate(frame, [HAND_OUT, HAND_GONE], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  // a mão desliza na diagonal (ao longo do braço), de baixo/direita até o botão
  const along = (1 - inP) * 900 - press + outP * 900;
  const tipX = BTN_CX + 14 + DIR.x * along;
  const tipY = BTN_CY + 18 + DIR.y * along;
  const ambient = interpolate(frame, [0, 20], [0, 1], clamp);
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {/* luz ambiente fraca */}
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 55% 60% at 50% 44%, rgba(70,50,120,${0.28 * ambient + 0.35 * light}) 0%, rgba(20,14,40,${0.3 * ambient}) 45%, rgba(0,0,0,0) 75%)`,
        }}
      />
      <PowerButton />
      {frame >= HAND_IN && frame < HAND_GONE && (
        <svg width={1920} height={1080} style={{ position: "absolute", overflow: "visible" }}>
          <g transform={`translate(${tipX} ${tipY}) scale(${HAND_SCALE}) translate(${-TIP.x} ${-TIP.y})`}>
            <LineHand light={light} draw={interpolate(frame, [HAND_IN, HAND_ARRIVE + 2], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) })} />
          </g>
        </svg>
      )}
      {/* vinheta */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.7) 100%)" }} />
    </AbsoluteFill>
  );
};
