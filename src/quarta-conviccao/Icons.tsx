import React from "react";
import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";

// Ícones originais em SVG, no formato "app do iPhone" (squircle + brilho de vidro)
const Squircle: React.FC<{ id: string; from: string; to: string; glow: string; children: React.ReactNode }> = ({
  id,
  from,
  to,
  glow,
  children,
}) => (
  <svg
    viewBox="0 0 100 100"
    width="100%"
    height="100%"
    style={{ overflow: "visible", filter: `drop-shadow(0 14px 22px rgba(0,0,0,0.5)) drop-shadow(0 0 26px ${glow})` }}
  >
    <defs>
      <linearGradient id={`${id}-bg`} x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor={from} />
        <stop offset="1" stopColor={to} />
      </linearGradient>
      <linearGradient id={`${id}-gloss`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
        <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
      </linearGradient>
    </defs>
    <rect x="0" y="0" width="100" height="100" rx="23" fill={`url(#${id}-bg)`} />
    {children}
    <rect x="0" y="0" width="100" height="100" rx="23" fill={`url(#${id}-gloss)`} />
    <rect x="0.6" y="0.6" width="98.8" height="98.8" rx="22.5" fill="none" stroke="#fff" strokeOpacity="0.18" strokeWidth="1.2" />
  </svg>
);

// Relógio: os ponteiros giram e param em 7:00 (19h); o ponteiro de segundos segue andando
export const ClockIcon: React.FC<{ enter: number }> = ({ enter }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = spring({ frame: frame - enter - 4, fps, config: { damping: 22, stiffness: 40, mass: 1.2 } });
  const minute = interpolate(t, [0, 1], [-720, 0]);
  const hour = interpolate(t, [0, 1], [150, 210]);
  const second = Math.max(0, frame - enter) * 6 * (1 / fps) * 6; // um "tique" visualmente ágil
  return (
    <Squircle id="clk" from="#2A3150" to="#0C0F1C" glow="rgba(79,140,255,0.35)">
      <circle cx="50" cy="50" r="37" fill="#F5F7FA" />
      {Array.from({ length: 60 }).map((_, i) => {
        const major = i % 5 === 0;
        return (
          <line
            key={i}
            x1="50"
            y1={major ? 16.5 : 15.5}
            x2="50"
            y2={major ? 22 : 18}
            stroke={major ? "#0B0F17" : "#8E98AA"}
            strokeWidth={major ? 2 : 0.8}
            strokeLinecap="round"
            transform={`rotate(${i * 6} 50 50)`}
          />
        );
      })}
      <line x1="50" y1="50" x2="50" y2="30" stroke="#0B0F17" strokeWidth="4" strokeLinecap="round" transform={`rotate(${hour} 50 50)`} />
      <line x1="50" y1="50" x2="50" y2="21" stroke="#0B0F17" strokeWidth="2.6" strokeLinecap="round" transform={`rotate(${minute} 50 50)`} />
      <g transform={`rotate(${second} 50 50)`}>
        <line x1="50" y1="58" x2="50" y2="19" stroke="#FF5C7A" strokeWidth="1.2" strokeLinecap="round" />
      </g>
      <circle cx="50" cy="50" r="3" fill="#FF5C7A" />
      <circle cx="50" cy="50" r="1.2" fill="#fff" />
    </Squircle>
  );
};

// Bíblia: livro com cruz e fita marcadora
export const BibleIcon: React.FC = () => (
  <Squircle id="bib" from="#FFC24B" to="#FF7A45" glow="rgba(255,194,75,0.35)">
    <rect x="27" y="22" width="48" height="60" rx="6" fill="#7A2E14" opacity="0.25" transform="translate(2 3)" />
    <rect x="30" y="72" width="44" height="8" rx="2.5" fill="#FFF1D9" />
    <rect x="26" y="18" width="48" height="58" rx="6" fill="#FFFFFF" />
    <rect x="26" y="18" width="7" height="58" rx="3" fill="#FFE2B0" />
    <rect x="49" y="29" width="6" height="34" rx="1.5" fill="#FF9A3D" />
    <rect x="40.5" y="38" width="23" height="6" rx="1.5" fill="#FF9A3D" />
    <path d="M62 74 L62 88 L66 84.5 L70 88 L70 74 Z" fill="#FF5C7A" />
  </Squircle>
);

// Oração: mãos em prece (dedos unidos em ogiva, antebraços em "V") com raios de luz
export const PrayerIcon: React.FC = () => (
  <Squircle id="pray" from="#9B6BFF" to="#FF5C7A" glow="rgba(155,107,255,0.4)">
    {[-50, -25, 0, 25, 50].map((r) => (
      <line key={r} x1="50" y1="8" x2="50" y2="3" stroke="#fff" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" transform={`rotate(${r} 50 34)`} />
    ))}
    {/* antebraços */}
    <line x1="45" y1="60" x2="27" y2="85" stroke="#FFFFFF" strokeWidth="13" strokeLinecap="round" />
    <line x1="55" y1="60" x2="73" y2="85" stroke="#FFFFFF" strokeWidth="13" strokeLinecap="round" />
    <line x1="31" y1="74" x2="40.5" y2="80" stroke="#B48CFF" strokeWidth="2" strokeLinecap="round" />
    <line x1="69" y1="74" x2="59.5" y2="80" stroke="#B48CFF" strokeWidth="2" strokeLinecap="round" />
    {/* palmas e dedos unidos */}
    <path d="M50 12 C56.5 18 60.5 31 61 44 L63 58 C63 65.5 57 70 50 70 C43 70 37 65.5 37 58 L39 44 C39.5 31 43.5 18 50 12 Z" fill="#FFFFFF" />
    <line x1="50" y1="16" x2="50" y2="68" stroke="#B48CFF" strokeWidth="1.4" />
    {/* polegares */}
    <path d="M45 46 C44 51 44.5 55 47 58" fill="none" stroke="#B48CFF" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M55 46 C56 51 55.5 55 53 58" fill="none" stroke="#B48CFF" strokeWidth="1.5" strokeLinecap="round" />
  </Squircle>
);
