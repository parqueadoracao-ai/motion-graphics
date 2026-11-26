import React from "react";
import { AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig } from "remotion";
import { BG_IN_END, DIAL_GLOW_OFF, DIAL_IN_END, FINAL_START } from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const W = 1920;
const H = 1080;
const CX = W / 2;
const CY = H / 2;
const R = 400;

const STARS = Array.from({ length: 110 }).map((_, i) => ({
  x: random(`sx${i}`) * W,
  y: random(`sy${i}`) * H * 0.85,
  r: 0.6 + random(`sr${i}`) * 1.6,
  phase: random(`sp${i}`) * Math.PI * 2,
  speed: 0.04 + random(`sv${i}`) * 0.08,
}));

// Mostrador do relógio. k multiplica as opacidades (k=1: discreto; k alto: cópia luminosa do starglow)
const Dial: React.FC<{ frame: number; k: number; sweepId: string }> = ({ frame, k, sweepId }) => {
  const { fps } = useVideoConfig();
  const o = (v: number) => Math.min(1, v * k);
  const rot = frame * 0.06; // giro lento do anel de minutos
  const rot2 = -frame * 0.035;
  const secondHand = (frame / fps) * 6; // ponteiro de segundos real: 6°/s
  return (
    <>
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
              strokeOpacity={o(major ? 0.22 : 0.09)}
              strokeWidth={major ? 2 : 1}
              transform={`rotate(${i * 6})`}
            />
          );
        })}
      </g>
      <circle r={R - 14} fill="none" stroke="#F5F7FA" strokeOpacity={o(0.06)} strokeWidth={1} />
      {/* anel externo tracejado, girando ao contrário */}
      <g transform={`rotate(${rot2})`}>
        <circle r={R + 70} fill="none" stroke="#AEB8C8" strokeOpacity={o(0.06)} strokeWidth={1} strokeDasharray="2 14" />
        <circle r={R + 120} fill="none" stroke="#AEB8C8" strokeOpacity={o(0.035)} strokeWidth={1} />
        <circle cx={0} cy={-(R + 120)} r={3} fill="#FF5C7A" opacity={o(0.5)} />
      </g>
      {/* ponteiro de segundos: rastro em arco + ponto */}
      <g transform={`rotate(${secondHand})`}>
        <path
          d={`M 0 ${-R + 4} A ${R - 4} ${R - 4} 0 0 0 ${-(R - 4) * Math.sin(Math.PI / 6)} ${-(R - 4) * Math.cos(Math.PI / 6)}`}
          fill="none"
          stroke={`url(#${sweepId})`}
          strokeWidth={2}
          opacity={o(0.6)}
        />
        <line x1={0} y1={30} x2={0} y2={-R + 4} stroke="#FFC24B" strokeOpacity={o(0.08)} strokeWidth={1} />
        <circle cx={0} cy={-R + 4} r={3.2} fill="#FFC24B" opacity={o(0.7)} />
      </g>
      <circle r={2.5} fill="#F5F7FA" opacity={o(0.12)} />
    </>
  );
};

// Estrela de 4 pontas (cintilação) usada no starglow
const Glint: React.FC<{ x: number; y: number; s: number; color: string; opacity: number }> = ({ x, y, s, color, opacity }) => (
  <g transform={`translate(${x} ${y})`} opacity={opacity}>
    <path
      d={`M0 ${-s} Q ${s * 0.06} ${-s * 0.06} ${s} 0 Q ${s * 0.06} ${s * 0.06} 0 ${s} Q ${-s * 0.06} ${s * 0.06} ${-s} 0 Q ${-s * 0.06} ${-s * 0.06} 0 ${-s} Z`}
      fill={color}
    />
    <path
      d={`M0 ${-s * 0.5} Q ${s * 0.05} ${-s * 0.05} ${s * 0.5} 0 Q ${s * 0.05} ${s * 0.05} 0 ${s * 0.5} Q ${-s * 0.05} ${s * 0.05} ${-s * 0.5} 0 Q ${-s * 0.05} ${-s * 0.05} 0 ${-s * 0.5} Z`}
      fill={color}
      transform="rotate(45)"
      opacity={0.6}
    />
    <circle r={s * 0.08} fill="#fff" />
  </g>
);

const GLINT_COLORS = ["#FFC24B", "#FF5C7A", "#9B6BFF", "#F5F7FA"];

// Céu de crepúsculo + mostrador de relógio girando, tudo bem discreto
export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, BG_IN_END], [0, 1], { ...clamp, easing: Easing.out(Easing.quad) });
  const breathe = 0.85 + 0.15 * Math.sin(frame / 45);

  // entrada do relógio: cresce de fora da tela para o centro, girando
  const inT = interpolate(frame, [0, DIAL_IN_END], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const entryScale = interpolate(inT, [0, 1], [3.4, 1]);
  const entrySpin = interpolate(inT, [0, 1], [-70, 0]);
  // starglow: acende na viagem e some ao chegar
  const glow = interpolate(frame, [0, 6, DIAL_IN_END - 8, DIAL_GLOW_OFF], [0, 1, 1, 0], clamp);
  const arrive = interpolate(frame, [DIAL_IN_END - 10, DIAL_IN_END, DIAL_GLOW_OFF], [0, 1, 0], clamp);

  // no final o mostrador se aproxima e emoldura o título
  const finalT = interpolate(frame, [FINAL_START - 10, FINAL_START + 30], [0, 1], clamp);
  const dialScale = entryScale * (1 + finalT * 0.08);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0F17" }}>
      <AbsoluteFill style={{ opacity: fadeIn }}>
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
      </AbsoluteFill>

      <svg width={W} height={H} style={{ position: "absolute" }}>
        <defs>
          {["sweep", "sweepG"].map((id) => (
            <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#FFC24B" stopOpacity="0" />
              <stop offset="1" stopColor="#FFC24B" stopOpacity="0.35" />
            </linearGradient>
          ))}
          <radialGradient id="vign" cx="50%" cy="50%" r="75%">
            <stop offset="0.55" stopColor="#000" stopOpacity="0" />
            <stop offset="1" stopColor="#000" stopOpacity="0.55" />
          </radialGradient>
          {/* raios do starglow: desfoque anisotrópico (horizontal / vertical), tingido */}
          <filter id="streakH" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="38 0.6" />
            <feColorMatrix type="matrix" values="1.3 0 0 0 0.1  0 0.85 0 0 0  0 0 0.5 0 0  0 0 0 2.2 0" />
          </filter>
          <filter id="streakV" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="0.6 38" />
            <feColorMatrix type="matrix" values="1.1 0 0 0 0.05  0 0.5 0 0 0  0 0 1.2 0 0.1  0 0 0 2.2 0" />
          </filter>
          <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <g opacity={fadeIn}>
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
        </g>

        <g transform={`translate(${CX} ${CY}) scale(${dialScale}) rotate(${entrySpin})`}>
          <g opacity={interpolate(frame, [0, 10], [0, 1], clamp)}>
            <Dial frame={frame} k={1} sweepId="sweep" />
          </g>

          {glow > 0.001 && (
            <g style={{ mixBlendMode: "screen" }} opacity={glow}>
              {/* halo + raios em 8 direções (horizontal, vertical e diagonais) */}
              <g filter="url(#soft)">
                <Dial frame={frame} k={6} sweepId="sweepG" />
              </g>
              <g filter="url(#streakH)">
                <Dial frame={frame} k={10} sweepId="sweepG" />
              </g>
              <g filter="url(#streakV)">
                <Dial frame={frame} k={10} sweepId="sweepG" />
              </g>
              <g transform="rotate(45)">
                <g filter="url(#streakH)" opacity={0.55}>
                  <g transform="rotate(-45)">
                    <Dial frame={frame} k={8} sweepId="sweepG" />
                  </g>
                </g>
              </g>
              <g transform="rotate(-45)">
                <g filter="url(#streakH)" opacity={0.55}>
                  <g transform="rotate(45)">
                    <Dial frame={frame} k={8} sweepId="sweepG" />
                  </g>
                </g>
              </g>
              {/* cintilações nas marcas das horas */}
              <g transform={`rotate(${frame * 0.06})`}>
                {Array.from({ length: 12 }).map((_, i) => {
                  const a = (i * 30 * Math.PI) / 180;
                  const tw = 0.55 + 0.45 * Math.sin(frame * 0.7 + i * 1.7);
                  return (
                    <Glint
                      key={i}
                      x={Math.sin(a) * (R + 13)}
                      y={-Math.cos(a) * (R + 13)}
                      s={(26 + (i % 3) * 10) * tw / Math.sqrt(dialScale)}
                      color={GLINT_COLORS[i % 4]}
                      opacity={tw}
                    />
                  );
                })}
              </g>
            </g>
          )}
        </g>

        {/* lampejo suave no centro quando o relógio "encaixa" */}
        {arrive > 0.001 && (
          <g transform={`translate(${CX} ${CY})`} style={{ mixBlendMode: "screen" }} opacity={arrive * 0.7}>
            <circle r={R + 20} fill="none" stroke="#FFC24B" strokeWidth={3} filter="url(#soft)" />
          </g>
        )}

        <rect width={W} height={H} fill="url(#vign)" opacity={fadeIn} />
      </svg>
    </AbsoluteFill>
  );
};
