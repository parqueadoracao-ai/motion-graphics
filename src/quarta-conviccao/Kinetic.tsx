import React from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Entrada/saída cinética: sobe com desfoque e leve giro em X; sai subindo e desfocando.
export const useKinetic = (enter: number, exit?: number, exitLen = 16, snappy = false) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({
    frame: frame - enter,
    fps,
    config: snappy ? { damping: 13, stiffness: 230, mass: 0.7 } : { damping: 17, stiffness: 110, mass: 0.9 },
  });
  const amp = snappy ? 1.7 : 1; // entrada enérgica: vem de mais longe, mais rápido
  const q =
    exit === undefined
      ? 0
      : interpolate(frame, [exit, exit + exitLen], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const appear = interpolate(frame, [enter, enter + (snappy ? 5 : 10)], [0, 1], clamp);
  return {
    y: (1 - p) * 80 * amp - q * 70,
    blur: Math.max(0, (1 - p) * 16) + q * 18,
    rot: (1 - p) * 55 * amp - q * 30,
    opacity: appear * (1 - q),
    p,
    q,
  };
};

export const KWord: React.FC<{
  enter: number;
  exit?: number;
  style?: React.CSSProperties;
  innerStyle?: React.CSSProperties;
  snappy?: boolean;
  children: React.ReactNode;
}> = ({ enter, exit, style, innerStyle, snappy, children }) => {
  const k = useKinetic(enter, exit, 16, snappy);
  return (
    <span
      style={{
        display: "inline-block",
        transform: `perspective(900px) translateY(${k.y}px) rotateX(${k.rot}deg)`,
        transformOrigin: "50% 100%",
        filter: `blur(${k.blur}px)`,
        opacity: k.opacity,
        ...style,
      }}
    >
      <span style={{ display: "inline-block", ...innerStyle }}>{children}</span>
    </span>
  );
};

// Ícone que "salta" (escala com overshoot + giro), estilo app do iPhone
export const KIcon: React.FC<{ enter: number; exit?: number; size: number; children: React.ReactNode }> = ({
  enter,
  exit,
  size,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - enter, fps, config: { damping: 11, stiffness: 140, mass: 0.8 } });
  const k = useKinetic(enter, exit);
  return (
    <span
      style={{
        display: "inline-block",
        width: size,
        height: size,
        verticalAlign: "middle",
        transform: `translateY(${-k.q * 70}px) scale(${s * (1 - k.q * 0.4)}) rotate(${(1 - s) * -18}deg)`,
        opacity: interpolate(frame, [enter, enter + 6], [0, 1], clamp) * (1 - k.q),
        filter: `blur(${k.q * 18}px)`,
      }}
    >
      {children}
    </span>
  );
};
