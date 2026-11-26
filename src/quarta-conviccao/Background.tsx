import React from "react";
import { AbsoluteFill, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { BG_IN_END, FINAL_START } from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = 1920;
const H = 1080;
const CX = W / 2;
const CY = H / 2;

const STARS = Array.from({ length: 110 }).map((_, i) => ({
  x: random(`sx${i}`) * W,
  y: random(`sy${i}`) * H * 0.85,
  r: 0.6 + random(`sr${i}`) * 1.6,
  phase: random(`sp${i}`) * Math.PI * 2,
  speed: 0.04 + random(`sv${i}`) * 0.08,
}));

// Céu de crepúsculo + mostrador de relógio girando, tudo bem discreto
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fadeIn = interpolate(frame, [0, BG_IN_END], [0, 1], clamp);
  const breathe = 0.85 + 0.15 * Math.sin(frame / 45);
  // no final o mostrador se aproxima e emoldura o título
  const finalT = interpolate(frame, [FINAL_START - 20, FINAL_START + 40], [0, 1], clamp);
  const dialScale = 1 + finalT * 0.08;
  const dialAlpha = 1 + finalT * 0.6;

  const rot = frame * 0.06; // giro lento do anel de minutos
  const rot2 = -frame * 0.035;
  const secondHand = (frame / fps) * 6; // ponteiro de segundos real: 6°/s
  const R = 400;

  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0F17", opacity: fadeIn }}>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 0%, #1E2A44 0%, #0B0F17 72%)" }} />
      {/* brilho do crepúsculo no horizonte */}
      <AbsoluteFill
        style={{
          opacity: breathe,
          background:
            "radial-gradient(95% 62% at 50% 120%, rgba(255,150,70,0.85) 0%, rgba(255,92,122,0.55) 26%, rgba(155,107,255,0.30) 50%, rgba(11,15,23,0) 76%)",
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(40% 40% at 15% 20%, rgba(79,140,255,0.10) 0%, rgba(0,0,0,0) 70%)",
        }}
      />

      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFC24B" stopOpacity="0" />
            <stop offset="1" stopColor="#FFC24B" stopOpacity="0.35" />
          </linearGradient>
          <radialGradient id="vign" cx="50%" cy="50%" r="75%">
            <stop offset="0.55" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
        </defs>

        {/* estrelas */}
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={s.x + Math.sin(frame / 200 + s.phase) * 4}
            cy={s.y}
            r={s.r}
            fill="#F5F7FA"
            opacity={(0.15 + 0.35 * (0.5 + 0.5 * Math.sin(frame * s.speed + s.phase))) * (1 - s.y / H)}
          />
        ))}

        {/* linhas diagonais finas, à deriva */}
        {[0, 1, 2].map((i) => {
          const x = ((frame * (0.6 + i * 0.25) + i * 700) % (W + 800)) - 400;
          return (
            <line key={i} x1={x} y1={-50} x2={x + 520} y2={H + 50} stroke="#AEB8C8" strokeOpacity={0.035} strokeWidth={1} />
          );
        })}

        <g transform={`translate(${CX} ${CY}) scale(${dialScale})`} opacity={dialAlpha}>
          {/* anel de minutos/segundos */}
          <g transform={`rotate(${rot})`}>
            {Array.from({ length: 60 }).map((_, i) => {
              const major = i % 5 === 0;
              return (
                <line
                  key={i}
                  x1={0}
                  y1={-R - (major ? 26 : 12)}
                  x2={0}
                  y2={-R}
                  stroke="#F5F7FA"
                  strokeOpacity={major ? 0.22 : 0.09}
                  strokeWidth={major ? 2 : 1}
                  transform={`rotate(${i * 6})`}
                />
              );
            })}
          </g>
          <circle r={R - 14} fill="none" stroke="#F5F7FA" strokeOpacity={0.06} strokeWidth={1} />
          {/* anel externo tracejado, girando ao contrário */}
          <g transform={`rotate(${rot2})`}>
            <circle r={R + 70} fill="none" stroke="#AEB8C8" strokeOpacity={0.06} strokeWidth={1} strokeDasharray="2 14" />
            <circle r={R + 120} fill="none" stroke="#AEB8C8" strokeOpacity={0.035} strokeWidth={1} />
            <circle cx={0} cy={-(R + 120)} r={3} fill="#FF5C7A" opacity={0.5} />
          </g>
          {/* ponteiro de segundos: rastro em arco + ponto */}
          <g transform={`rotate(${secondHand})`}>
            <path
              d={`M 0 ${-R + 4} A ${R - 4} ${R - 4} 0 0 0 ${-(R - 4) * Math.sin(Math.PI / 6)} ${-(R - 4) * Math.cos(Math.PI / 6)}`}
              fill="none"
              stroke="url(#sweep)"
              strokeWidth={2}
              opacity={0.6}
            />
            <line x1={0} y1={30} x2={0} y2={-R + 4} stroke="#FFC24B" strokeOpacity={0.08} strokeWidth={1} />
            <circle cx={0} cy={-R + 4} r={3.2} fill="#FFC24B" opacity={0.7} />
          </g>
          <circle r={2.5} fill="#F5F7FA" opacity={0.12} />
        </g>

        <rect width={W} height={H} fill="url(#vign)" />
      </svg>
    </AbsoluteFill>
  );
};
