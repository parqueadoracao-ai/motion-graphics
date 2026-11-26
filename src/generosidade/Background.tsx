import { AbsoluteFill, random, useCurrentFrame } from "remotion";
import { C, ip } from "./theme";

// Manchas de luz pastel que flutuam devagar
const BLOBS = [
  { x: 18, y: 22, r: 760, c: "rgba(127,174,220,0.34)", sx: 0.011, sy: 0.008, ax: 60, ay: 40 },
  { x: 86, y: 18, r: 680, c: "rgba(230,198,128,0.30)", sx: 0.009, sy: 0.012, ax: 50, ay: 50 },
  { x: 80, y: 88, r: 820, c: "rgba(142,195,174,0.30)", sx: 0.007, sy: 0.01, ax: 70, ay: 40 },
  { x: 10, y: 92, r: 700, c: "rgba(196,178,230,0.26)", sx: 0.01, sy: 0.007, ax: 60, ay: 50 },
  { x: 50, y: 55, r: 900, c: "rgba(255,255,255,0.75)", sx: 0.006, sy: 0.009, ax: 30, ay: 30 },
];

const DotGrid: React.FC<{ x: number; side: 1 | -1 }> = ({ x, side }) => {
  const f = useCurrentFrame();
  const appear = ip(f, [20, 60], [0, 1]);
  const dots = [];
  for (let r = 0; r < 6; r++)
    for (let c = 0; c < 4; c++) {
      const wave = Math.sin(f * 0.07 - (r + c * side) * 0.6);
      dots.push(
        <circle
          key={`${r}-${c}`}
          cx={c * 46}
          cy={r * 46 + wave * 3}
          r={3.2 + wave * 0.8}
          fill={C.ink}
          opacity={(0.1 + 0.06 * wave) * appear}
        />,
      );
    }
  return (
    <svg width={160} height={260} viewBox="-10 -10 160 260" style={{ position: "absolute", left: x, top: 420 }}>
      {dots}
    </svg>
  );
};

export const Background: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.paper} 0%, #F3F1EC 45%, ${C.mist} 100%)` }}>
      {BLOBS.map((b, i) => {
        const x = (b.x / 100) * 1920 + Math.sin(f * b.sx * 6.28 * 0.5 + i) * b.ax;
        const y = (b.y / 100) * 1080 + Math.cos(f * b.sy * 6.28 * 0.5 + i * 2) * b.ay;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: x - b.r / 2,
              top: y - b.r / 2,
              width: b.r,
              height: b.r,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${b.c} 0%, rgba(255,255,255,0) 68%)`,
            }}
          />
        );
      })}
      <DotGrid x={70} side={1} />
      <DotGrid x={1920 - 70 - 140} side={-1} />
      <Particles />
      {/* vinheta bem leve para dar profundidade */}
      <AbsoluteFill
        style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 55%, rgba(28,43,69,0.08) 100%)" }}
      />
    </AbsoluteFill>
  );
};

// Partículas de luz subindo lentamente
const Particles: React.FC = () => {
  const f = useCurrentFrame();
  const items = [];
  for (let i = 0; i < 26; i++) {
    const sx = random(`px${i}`) * 1920;
    const speed = 0.35 + random(`ps${i}`) * 0.6;
    const size = 3 + random(`pz${i}`) * 7;
    const y = 1120 - ((random(`py${i}`) * 1200 + f * speed) % 1200);
    const x = sx + Math.sin(f * 0.02 + i) * 24;
    const tw = 0.5 + 0.5 * Math.sin(f * 0.08 + i * 1.7);
    const gold = i % 3 === 0;
    items.push(
      <div
        key={i}
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: "50%",
          background: gold ? C.goldLight : "#FFFFFF",
          boxShadow: `0 0 ${size * 2}px ${gold ? "rgba(230,198,128,0.8)" : "rgba(255,255,255,0.9)"}`,
          opacity: (gold ? 0.55 : 0.85) * (0.35 + 0.65 * tw),
        }}
      />,
    );
  }
  return <>{items}</>;
};
