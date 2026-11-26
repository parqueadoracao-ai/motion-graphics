import { AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  C,
  CELL_H,
  CELL_W,
  CENTER_DX,
  CENTER_DY,
  CENTER_SCALE,
  DAYS,
  DISPLAY,
  EVENTOS,
  GAP,
  GRID_CX,
  GRID_CY,
  GRID_X0,
  GRID_Y0,
  IRIDESCENT,
  LIST_W,
  LIST_X,
  ROW_H,
  SANS,
  WEEKDAYS_LONG,
  WEEKDAYS_SHORT,
  cellRect,
  rowY,
  weekdayOf,
} from "./theme";
import {
  CARD_OPEN,
  EVENT_START,
  EVENT_STEP,
  FLY_DUR,
  HEADER_IN,
  ORGANIZE,
  ORGANIZE_DUR,
  ORGANIZE_STEP,
  SHIFT,
  SHIFT_DUR,
  SLABS_IN,
  SLAB_STEP,
} from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const SLAB = 230; // lado do bloco na fase 3D
const eventStart = (i: number) => EVENT_START + i * EVENT_STEP;
const eventIndexOf = (day: number) => EVENTOS.findIndex((e) => e.day === day);

// Bloco de vidro: fileira 3D iluminada → célula do calendário
const Slab: React.FC<{ day: number }> = ({ day }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const i = day - 1;
  const n = DAYS;
  const mid = (n - 1) / 2;

  // entrada (sobe e aparece)
  const enter = spring({ frame: frame - (SLABS_IN + i * SLAB_STEP), fps, config: { damping: 16, mass: 0.9 } });
  // organização (fileira → grade)
  const org = spring({
    frame: frame - (ORGANIZE + i * ORGANIZE_STEP),
    fps,
    config: { damping: 19, mass: 0.9 },
    durationInFrames: ORGANIZE_DUR,
  });

  // fileira 3D: diagonal suave com onda
  const wave = Math.sin(frame * 0.09 - i * 0.38);
  const rowX = GRID_CX + (i - mid) * 40;
  const rowY = GRID_CY + 40 + (i - mid) * -3.5 + wave * 16 + (1 - enter) * 420;
  const rotY = 58 + Math.sin(frame * 0.06 - i * 0.3) * 9;
  // luz que percorre a fileira (faixa iridescente)
  const band = interpolate(frame, [SLABS_IN, ORGANIZE + 20], [-8, n + 6], clamp);
  const k = Math.exp(-(((i - band) / 3.4) ** 2));

  const { x: gx, y: gy } = cellRect(day);
  const cx = interpolate(org, [0, 1], [rowX, gx + CELL_W / 2]);
  const cy = interpolate(org, [0, 1], [rowY, gy + CELL_H / 2]);
  const w = interpolate(org, [0, 1], [SLAB, CELL_W]);
  const h = interpolate(org, [0, 1], [SLAB, CELL_H]);
  const ry = interpolate(org, [0, 1], [rotY, 0]);
  const radius = interpolate(org, [0, 1], [42, 18]);
  const irid = k * (1 - org) * 0.9;
  const numberIn = interpolate(org, [0.6, 1], [0, 1], clamp);

  // destaque do evento
  const ev = eventIndexOf(day);
  const evP = ev >= 0 ? interpolate(frame, [eventStart(ev), eventStart(ev) + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) }) : 0;
  const pop = ev >= 0 ? spring({ frame: frame - eventStart(ev), fps, config: { damping: 9 } }) : 0;
  const popScale = 1 + 0.14 * pop * (1 - interpolate(frame, [eventStart(ev) + 8, eventStart(ev) + 22], [0, 1], clamp));
  const e = ev >= 0 ? EVENTOS[ev] : null;

  return (
    <div
      style={{
        position: "absolute",
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        transformStyle: "preserve-3d",
        transform: `rotateY(${ry}deg) rotateX(${(1 - org) * -6}deg) scale(${popScale})`,
        opacity: enter,
      }}
    >
      {/* espessura (face de trás) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          transform: "translateZ(-14px)",
          background: "linear-gradient(160deg, #C9D1E2, #A9B4CB)",
          opacity: 1 - org,
        }}
      />
      {/* face */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: radius,
          overflow: "hidden",
          background: "linear-gradient(150deg, rgba(255,255,255,0.96), rgba(226,231,242,0.92))",
          border: `1.5px solid rgba(255,255,255,${0.9 - 0.4 * org})`,
          boxShadow: `0 ${14 - 8 * org}px ${34 - 16 * org}px rgba(40,52,90,${0.18 - 0.06 * org}), inset 0 0 0 1px ${C.line}`,
        }}
      >
        <div style={{ position: "absolute", inset: 0, background: IRIDESCENT, opacity: irid }} />
        {/* brilho especular */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(115deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.75) 45%, rgba(255,255,255,0) 60%)",
            opacity: k * (1 - org),
          }}
        />
        {e && <div style={{ position: "absolute", inset: 0, background: `linear-gradient(145deg, ${e.from}, ${e.to})`, opacity: evP }} />}
        <div
          style={{
            position: "absolute",
            left: 14,
            top: 10,
            fontFamily: DISPLAY,
            fontWeight: 600,
            fontSize: 30,
            color: evP > 0.5 ? "#FFFFFF" : C.ink,
            opacity: numberIn,
          }}
        >
          {day}
        </div>
      </div>
    </div>
  );
};

// Bloco que sai do calendário e vira o cartão do anúncio
const EventCard: React.FC<{ i: number }> = ({ i }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const e = EVENTOS[i];
  const t0 = eventStart(i);
  if (frame < t0) return null;
  const fly = spring({ frame: frame - t0 - 2, fps, config: { damping: 17, mass: 0.8 }, durationInFrames: FLY_DUR });
  const open = interpolate(frame, [t0 + CARD_OPEN, t0 + CARD_OPEN + 16], [0, 1], { ...clamp, easing: Easing.bezier(0.25, 0, 0.1, 1) });
  const txt = (d: number) => interpolate(frame, [t0 + CARD_OPEN + 6 + d, t0 + CARD_OPEN + 18 + d], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const { x: cx0, y: cy0 } = cellRect(e.day);
  const bx = interpolate(fly, [0, 1], [cx0, LIST_X]);
  const by = interpolate(fly, [0, 1], [cy0, rowY(i)]);
  const bw = interpolate(fly, [0, 1], [CELL_W, ROW_H]);
  const bh = interpolate(fly, [0, 1], [CELL_H, ROW_H]);
  const arc = Math.sin(fly * Math.PI) * -40; // leve arco no voo
  const wd = WEEKDAYS_LONG[weekdayOf(e.day)];
  // linha fina que liga o dia no calendário ao cartão: desenha e depois se recolhe
  const lineIn = interpolate(frame, [t0, t0 + 10], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const lineOut = interpolate(frame, [t0 + 16, t0 + 30], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const x1 = cx0 + CELL_W / 2;
  const y1 = cy0 + CELL_H / 2;
  const x2 = LIST_X;
  const y2 = rowY(i) + ROW_H / 2;
  return (
    <>
      {lineOut < 1 && (
        <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
          <path
            d={`M ${x1} ${y1} C ${x1 + 120} ${y1 - 60}, ${x2 - 140} ${y2}, ${x2} ${y2}`}
            fill="none"
            stroke={e.to}
            strokeWidth={1.4}
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${lineIn - lineOut} 2`}
            strokeDashoffset={-lineOut}
            opacity={0.8}
          />
          <circle cx={x1} cy={y1} r={4 + 10 * lineIn} fill="none" stroke={e.to} strokeWidth={1.2} opacity={1 - lineIn * 0.9} />
        </svg>
      )}
      {/* corpo do cartão abrindo a partir do bloco */}
      <div
        style={{
          position: "absolute",
          left: LIST_X,
          top: rowY(i),
          width: ROW_H + (LIST_W - ROW_H) * open,
          height: ROW_H,
          borderRadius: 26,
          background: "rgba(255,255,255,0.88)",
          boxShadow: `0 18px 40px rgba(40,52,90,${0.14 * open}), inset 0 0 0 1px ${C.line}`,
          opacity: open > 0 ? 1 : 0,
          overflow: "hidden",
        }}
      >
        {/* faixa de luz que atravessa ao abrir */}
        <div
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            width: 160,
            left: -200 + open * (LIST_W + 220),
            background: `linear-gradient(100deg, rgba(255,255,255,0), ${e.from}33, rgba(255,255,255,0))`,
          }}
        />
        <div style={{ position: "absolute", left: ROW_H + 34, top: 15, whiteSpace: "nowrap" }}>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 600,
              fontSize: 44,
              lineHeight: 1.05,
              color: C.ink,
              letterSpacing: "-0.01em",
              opacity: txt(0),
              transform: `translateX(${(1 - txt(0)) * 30}px)`,
            }}
          >
            {e.name}
          </div>
          <div
            style={{
              marginTop: 6,
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 17,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: C.soft,
              opacity: txt(4),
              transform: `translateX(${(1 - txt(4)) * 30}px)`,
            }}
          >
            {wd}
          </div>
        </div>
      </div>
      {/* bloco voador / selo da data */}
      <div
        style={{
          position: "absolute",
          left: bx,
          top: by + arc,
          width: bw,
          height: bh,
          borderRadius: interpolate(fly, [0, 1], [18, 26]),
          background: `linear-gradient(145deg, ${e.from}, ${e.to})`,
          boxShadow: `0 ${10 + 14 * Math.sin(fly * Math.PI)}px ${26 + 20 * Math.sin(fly * Math.PI)}px ${e.to}55`,
          color: "#FFFFFF",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${1 + 0.1 * Math.sin(fly * Math.PI)})`,
        }}
      >
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: interpolate(fly, [0, 1], [30, 46]), lineHeight: 1 }}>{e.day}</div>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 14, letterSpacing: 3, marginTop: 4, opacity: fly, marginRight: -3 }}>DEZ</div>
      </div>
    </>
  );
};

export const Calendar: React.FC = () => {
  const frame = useCurrentFrame();
  if (frame < SLABS_IN - 2) return null;
  const shift = interpolate(frame, [SHIFT, SHIFT + SHIFT_DUR], [0, 1], { ...clamp, easing: Easing.bezier(0.6, 0, 0.2, 1) });
  const s = interpolate(shift, [0, 1], [CENTER_SCALE, 1]);
  const dx = interpolate(shift, [0, 1], [CENTER_DX, 0]);
  const dy = interpolate(shift, [0, 1], [CENTER_DY, 0]);
  const header = interpolate(frame, [HEADER_IN, HEADER_IN + 14], [0, 1], clamp);
  const shadow = interpolate(frame, [SLABS_IN, SLABS_IN + 20, ORGANIZE, ORGANIZE + 30], [0, 1, 1, 0], clamp);
  return (
    <AbsoluteFill style={{ perspective: 1800, perspectiveOrigin: "50% 45%" }}>
      <AbsoluteFill
        style={{
          transformStyle: "preserve-3d",
          transformOrigin: `${GRID_CX}px ${GRID_CY}px`,
          transform: `translate(${dx}px, ${dy}px) scale(${s})`,
        }}
      >
        {/* sombra no chão da fileira */}
        <div
          style={{
            position: "absolute",
            left: GRID_CX - 720,
            top: GRID_CY + 120,
            width: 1440,
            height: 150,
            borderRadius: "50%",
            background: "radial-gradient(ellipse, rgba(60,72,120,0.28), rgba(60,72,120,0) 70%)",
            filter: "blur(18px)",
            opacity: shadow,
            transform: "rotate(-4deg)",
          }}
        />
        {/* dias da semana */}
        {WEEKDAYS_SHORT.map((d, c) => (
          <div
            key={c}
            style={{
              position: "absolute",
              left: GRID_X0 + c * (CELL_W + GAP),
              width: CELL_W,
              top: GRID_Y0 - 44,
              textAlign: "center",
              fontFamily: SANS,
              fontWeight: 800,
              fontSize: 19,
              letterSpacing: 2,
              color: c === 0 ? C.rose : C.soft,
              opacity: interpolate(frame, [HEADER_IN + c * 2, HEADER_IN + c * 2 + 10], [0, 1], clamp),
              transform: `translateY(${(1 - header) * 8}px)`,
            }}
          >
            {d}
          </div>
        ))}
        {Array.from({ length: DAYS }, (_, i) => (
          <Slab key={i} day={i + 1} />
        ))}
      </AbsoluteFill>
      {EVENTOS.map((_, i) => (
        <EventCard key={i} i={i} />
      ))}
    </AbsoluteFill>
  );
};
