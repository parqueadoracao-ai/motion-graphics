import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { C, GRID_Y0, GRID_H, SANS } from "./theme";
import { SHIFT, SHIFT_DUR, SLABS_IN, TITLE_FORMED, TITLE_IN, TITLE_UP, TITLE_UP_DUR, TRANS_END } from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const CX = 960;
const CY = 540;
const R = 430;
const MONTHS = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"];

// Relógio-calendário em linhas finas: 12 meses no lugar das horas; o ponteiro para em dezembro
const YearDial: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fade = interpolate(frame, [TRANS_END - 4, TRANS_END + 20], [0, 1], clamp);
  const recede = interpolate(frame, [SLABS_IN - 10, SLABS_IN + 30], [1, 0.45], clamp);
  const k = fade * recede;
  const grow = interpolate(frame, [TRANS_END - 4, TRANS_END + 30], [0.9, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const scale = grow * interpolate(frame, [SLABS_IN - 10, SLABS_IN + 40], [1, 1.12], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  // ponteiro: gira e assenta em dezembro (topo)
  const settle = spring({ frame: frame - TITLE_IN, fps, config: { damping: 16, stiffness: 50 }, durationInFrames: TITLE_FORMED - TITLE_IN + 24 });
  const pointer = interpolate(settle, [0, 1], [-330, 0]);
  const ringRot = frame * 0.05;
  const sweep = (frame / fps) * 24; // arco iridescente percorrendo o anel
  const decGlow = interpolate(settle, [0.85, 1], [0, 1], clamp);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute", opacity: k }}>
      <defs>
        <linearGradient id="dialSweep" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={C.teal} stopOpacity="0" />
          <stop offset="0.6" stopColor={C.blue} stopOpacity="0.5" />
          <stop offset="1" stopColor={C.violet} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <g transform={`translate(${CX} ${CY}) scale(${scale})`}>
        {/* anéis */}
        <circle r={R} fill="none" stroke={C.ink} strokeOpacity={0.1} strokeWidth={1} />
        <circle r={R - 46} fill="none" stroke={C.ink} strokeOpacity={0.05} strokeWidth={1} />
        <g transform={`rotate(${-ringRot})`}>
          <circle r={R + 54} fill="none" stroke={C.ink} strokeOpacity={0.09} strokeWidth={1} strokeDasharray="2 12" />
          <circle cx={0} cy={-(R + 54)} r={3} fill={C.teal} opacity={0.6} />
        </g>
        {/* marcas: 60 finas, 12 maiores (meses) */}
        <g transform={`rotate(${ringRot * 0.3})`}>
          {Array.from({ length: 60 }, (_, i) => {
            const major = i % 5 === 0;
            return (
              <line
                key={i}
                x1={0}
                y1={-R + 1}
                x2={0}
                y2={-R + (major ? 20 : 9)}
                stroke={C.ink}
                strokeOpacity={major ? 0.3 : 0.12}
                strokeWidth={major ? 1.5 : 1}
                transform={`rotate(${i * 6})`}
              />
            );
          })}
        </g>
        {/* meses */}
        {MONTHS.map((m, i) => {
          const a = ((i + 1) * 30 * Math.PI) / 180;
          const rr = R + 24;
          const isDec = i === 11;
          return (
            <text
              key={i}
              x={Math.sin(a) * rr}
              y={-Math.cos(a) * rr}
              textAnchor="middle"
              dominantBaseline="central"
              fontFamily={SANS}
              fontWeight={700}
              fontSize={isDec ? 19 : 15}
              fill={isDec ? C.rose : C.soft}
              opacity={isDec ? 0.5 + 0.5 * decGlow : 0.55}
            >
              {m}
            </text>
          );
        })}
        {/* arco iridescente girando */}
        <g transform={`rotate(${sweep})`}>
          <path
            d={`M ${-(R - 23) * Math.sin(Math.PI / 4)} ${-(R - 23) * Math.cos(Math.PI / 4)} A ${R - 23} ${R - 23} 0 0 1 0 ${-(R - 23)}`}
            fill="none"
            stroke="url(#dialSweep)"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <circle cx={0} cy={-(R - 23)} r={3.2} fill={C.violet} />
        </g>
        {/* ponteiro dos meses (só na borda, não cruza o título) */}
        <g transform={`rotate(${pointer})`}>
          <line x1={0} y1={-R + 30} x2={0} y2={-R - 6} stroke={C.rose} strokeWidth={2.2} strokeLinecap="round" />
          <circle cx={0} cy={-R - 6} r={4.5 + 3 * decGlow} fill="none" stroke={C.rose} strokeWidth={1.4} />
        </g>
      </g>
    </svg>
  );
};

// Linhas editoriais ao lado do título (quando ele está no topo) e divisória vertical
const TITLE_HALF_W = 470; // meia largura do título já reduzido, com respiro
const Rules: React.FC = () => {
  const frame = useCurrentFrame();
  const p = interpolate(frame, [TITLE_UP + TITLE_UP_DUR - 6, TITLE_UP + TITLE_UP_DUR + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const v = interpolate(frame, [SHIFT + SHIFT_DUR - 4, SHIFT + SHIFT_DUR + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const y = 132;
  const left0 = 150;
  const leftEnd = CX - TITLE_HALF_W;
  const len = (leftEnd - left0) * p;
  const label: React.CSSProperties = {
    position: "absolute",
    top: y - 34,
    fontFamily: SANS,
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: 5,
    color: C.soft,
    opacity: interpolate(p, [0.4, 1], [0, 1], clamp),
    whiteSpace: "nowrap",
  };
  return (
    <>
      <div style={{ position: "absolute", left: leftEnd - len, top: y, width: len, height: 1, background: `linear-gradient(90deg, rgba(18,23,43,0), rgba(18,23,43,0.28))` }} />
      <div style={{ position: "absolute", left: CX + TITLE_HALF_W, top: y, width: len, height: 1, background: `linear-gradient(90deg, rgba(18,23,43,0.28), rgba(18,23,43,0))` }} />
      <div style={{ position: "absolute", left: leftEnd - len - 4, top: y - 3, width: 7, height: 7, borderRadius: 4, background: C.violet, opacity: p }} />
      <div style={{ position: "absolute", left: CX + TITLE_HALF_W + len - 3, top: y - 3, width: 7, height: 7, borderRadius: 4, background: C.teal, opacity: p }} />
      <div style={{ ...label, left: left0 }}>2026</div>
      <div style={{ ...label, right: 1920 - 1770, marginRight: -5 }}>PROGRAMAÇÃO</div>
      {/* divisória entre calendário e lista */}
      <div
        style={{
          position: "absolute",
          left: 964,
          top: GRID_Y0 - 40 + (1 - v) * (GRID_H / 2),
          width: 1,
          height: (GRID_H + 80) * v,
          background: "linear-gradient(180deg, rgba(18,23,43,0), rgba(18,23,43,0.22), rgba(18,23,43,0))",
        }}
      />
    </>
  );
};

export const Lines: React.FC = () => (
  <AbsoluteFill>
    <YearDial />
    <Rules />
  </AbsoluteFill>
);
