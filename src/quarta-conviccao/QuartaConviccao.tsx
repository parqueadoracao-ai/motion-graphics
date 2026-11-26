import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Background } from "./Background";
import { SANS, SERIF } from "./fonts";
import { BibleIcon, ClockIcon, PrayerIcon } from "./Icons";
import { KIcon, KWord } from "./Kinetic";
import { C, DUSK, duskAt } from "./palette";
import {
  DURATION,
  FINAL_LINE,
  FINAL_START,
  FINAL_TIME,
  LETTER_STEP,
  LOGO_START,
  PLACE_START,
  LINK_LEAD,
  OUT_STEP,
  S1_OUT,
  S1_START,
  S1_STEP,
  S2A_START,
  S2B_START,
  S2C_START,
  S2_OUT,
  S2_STEP,
} from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const gradText: React.CSSProperties = {
  backgroundImage: DUSK,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  paddingRight: "0.08em", // não corta o itálico
};

// ---------- Cena 1 ----------
const S1_WORDS = ["Não", "espere", "o", "domingo..."];
const Scene1: React.FC = () => (
  <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
    <div style={{ fontFamily: SERIF, fontSize: 150, color: C.text, letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
      {S1_WORDS.map((w, i) => (
        <KWord
          key={w}
          enter={S1_START + i * S1_STEP}
          exit={S1_OUT + i * 3}
          style={{ marginRight: i < S1_WORDS.length - 1 ? "0.26em" : 0 }}
          innerStyle={w === "domingo..." ? { ...gradText, fontStyle: "italic" } : undefined}
        >
          {w}
        </KWord>
      ))}
    </div>
  </AbsoluteFill>
);

// ---------- Cena 2 ----------
// Cada item da cena: palavra ou ícone, com ordem de entrada e de saída
type Item = { kind: "word"; text: string; style?: React.CSSProperties } | { kind: "icon"; node: React.ReactNode; size: number };

const LINE_A: Item[] = [
  { kind: "word", text: "Todas" },
  { kind: "word", text: "as" },
  { kind: "word", text: "quartas,", style: { color: C.text } },
  { kind: "word", text: "às" },
  { kind: "word", text: "19h,", style: { ...gradText, fontWeight: 700 } },
];
const LINE_B: Item[] = [
  { kind: "icon", node: <ClockIcon enter={S2B_START} />, size: 124 },
  { kind: "word", text: "temos" },
  { kind: "word", text: "um" },
  { kind: "word", text: "encontro", style: { ...gradText, fontStyle: "italic" } },
  { kind: "word", text: "marcado", style: { ...gradText, fontStyle: "italic" } },
];
const LINE_C: Item[] = [
  { kind: "word", text: "Momentos" },
  { kind: "word", text: "de" },
  { kind: "icon", node: <BibleIcon />, size: 84 },
  { kind: "word", text: "estudo", style: { color: C.text } },
  { kind: "word", text: "da" },
  { kind: "word", text: "Palavra", style: { color: C.amber } },
  { kind: "word", text: "e" },
  { kind: "icon", node: <PrayerIcon />, size: 84 },
  { kind: "word", text: "oração", style: { color: C.pink } },
];

const LINE_COUNTS = [LINE_A.length, LINE_B.length, LINE_C.length];
const exitOf = (line: number, idx: number) =>
  S2_OUT + (LINE_COUNTS.slice(0, line).reduce((a, b) => a + b, 0) + idx) * OUT_STEP;

const Line: React.FC<{ items: Item[]; start: number; line: number; style: React.CSSProperties }> = ({
  items,
  start,
  line,
  style,
}) => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", whiteSpace: "nowrap", ...style }}>
    {items.map((it, i) => {
      const enter = start + i * S2_STEP;
      const exit = exitOf(line, i);
      const last = i === items.length - 1;
      const gap = { marginRight: last ? 0 : "0.28em" };
      return it.kind === "word" ? (
        <KWord key={i} enter={enter} exit={exit} style={gap} innerStyle={it.style}>
          {it.text}
        </KWord>
      ) : (
        <span key={i} style={{ display: "inline-flex", marginRight: last ? 0 : "0.4em" }}>
          <KIcon enter={enter} exit={exit} size={it.size}>
            {it.node}
          </KIcon>
        </span>
      );
    })}
  </div>
);

// Fio de luz que "liga" uma frase à próxima
const Link: React.FC<{ at: number; exit: number; width: number }> = ({ at, exit, width }) => {
  const frame = useCurrentFrame();
  const draw = interpolate(frame, [at, at + 22], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const out = interpolate(frame, [exit, exit + 14], [0, 1], { ...clamp, easing: Easing.in(Easing.cubic) });
  const dot = interpolate(frame, [at, at + 22], [0, 1], { ...clamp, easing: Easing.inOut(Easing.cubic) });
  return (
    <div style={{ position: "relative", width, height: 2, margin: "0 auto", opacity: 1 - out }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(90deg, rgba(255,194,75,0) 0%, ${C.amber} 30%, ${C.pink} 60%, rgba(155,107,255,0) 100%)`,
          transform: `scaleX(${draw * (1 - out * 0.7)})`,
          opacity: 0.75,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: -3,
          left: dot * width - 4,
          width: 8,
          height: 8,
          borderRadius: 8,
          background: "#fff",
          boxShadow: `0 0 14px 4px ${C.pink}`,
          opacity: interpolate(dot, [0, 0.1, 0.9, 1], [0, 1, 1, 0]),
        }}
      />
    </div>
  );
};

const Scene2: React.FC = () => {
  const frame = useCurrentFrame();
  // respiro suave durante a permanência
  const drift = interpolate(frame, [S2A_START, S2_OUT + 30], [0, 1], clamp);
  const scale = 1 + drift * 0.035;
  const floatY = Math.sin(frame / 38) * 5;
  const lastExit = exitOf(2, LINE_C.length - 1);
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <div style={{ transform: `translateY(${floatY}px) scale(${scale})`, display: "flex", flexDirection: "column", gap: 34 }}>
        <Line
          items={LINE_A}
          start={S2A_START}
          line={0}
          style={{ fontFamily: SANS, fontWeight: 500, fontSize: 64, color: C.soft, letterSpacing: "-0.01em" }}
        />
        <Link at={S2B_START - LINK_LEAD} exit={S2_OUT + 4} width={560} />
        <Line
          items={LINE_B}
          start={S2B_START}
          line={1}
          style={{ fontFamily: SERIF, fontSize: 128, color: C.text, lineHeight: 1.05, transform: `translateY(${Math.sin(frame / 30) * 2}px)` }}
        />
        <Link at={S2C_START - LINK_LEAD} exit={lastExit - 6} width={760} />
        <Line
          items={LINE_C}
          start={S2C_START}
          line={2}
          style={{ fontFamily: SANS, fontWeight: 500, fontSize: 52, color: C.soft, letterSpacing: "-0.005em" }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ---------- Cena 3 ----------
const TITLE = "Quarta da Convicção";
const GRAD_FROM = TITLE.indexOf("Convicção");

const Scene3: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const zoom = spring({ frame: frame - FINAL_START, fps, config: { damping: 14, stiffness: 160, mass: 0.8 } });
  const settle = interpolate(frame, [FINAL_START, DURATION - 1], [0, 1], clamp);
  const line = interpolate(frame, [FINAL_LINE, FINAL_LINE + 26], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const t = spring({ frame: frame - FINAL_TIME, fps, config: { damping: 15, stiffness: 120 } });
  const glow = interpolate(frame, [FINAL_START + 18, FINAL_START + 50], [0, 1], clamp) * (0.75 + 0.25 * Math.sin(frame / 20));

  // onda de luz circular no impacto do título
  const wave = interpolate(frame, [FINAL_START + 4, FINAL_START + 34], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const flash = interpolate(frame, [FINAL_START, FINAL_START + 5, FINAL_START + 24], [0, 1, 0], clamp);

  let gi = 0;
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
      <AbsoluteFill
        style={{
          opacity: flash * 0.55,
          background: "radial-gradient(45% 40% at 50% 46%, rgba(255,194,75,0.55) 0%, rgba(255,92,122,0.25) 40%, rgba(0,0,0,0) 75%)",
        }}
      />
      {wave > 0 && wave < 1 && (
        <div
          style={{
            position: "absolute",
            left: 960 - 1100 * wave,
            top: 500 - 1100 * wave,
            width: 2200 * wave,
            height: 2200 * wave,
            borderRadius: "50%",
            border: `2px solid ${C.amber}`,
            boxShadow: `0 0 30px ${C.pink}, inset 0 0 30px ${C.pink}`,
            opacity: (1 - wave) * 0.6,
          }}
        />
      )}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          transform: `translateY(-80px) scale(${1.45 - zoom * 0.45 + settle * 0.03})`,
        }}
      >
        <div
          style={{
            position: "relative",
            fontFamily: SERIF,
            fontSize: 184,
            color: C.text,
            whiteSpace: "nowrap",
            lineHeight: 1.1,
            letterSpacing: "-0.015em",
            textShadow: `0 0 ${50 * glow}px rgba(255,92,122,${0.35 * glow})`,
          }}
        >
          {TITLE.split("").map((ch, i) => {
            const isGrad = i >= GRAD_FROM;
            const color = isGrad ? duskAt(gi++ / ("Convicção".length - 1)) : C.text;
            return (
              <KWord
                key={i}
                enter={FINAL_START + i * LETTER_STEP}
                snappy
                style={{ whiteSpace: "pre" }}
                innerStyle={{ color, fontStyle: isGrad ? "italic" : "normal" }}
              >
                {ch}
              </KWord>
            );
          })}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 28, marginTop: 18 }}>
          <div style={{ width: 220 * line, height: 2, background: `linear-gradient(90deg, rgba(255,194,75,0), ${C.amber})` }} />
          <div
            style={{
              width: 10,
              height: 10,
              transform: `rotate(45deg) scale(${line})`,
              background: C.amber,
              boxShadow: `0 0 16px ${C.amber}`,
            }}
          />
          <div
            style={{
              fontFamily: SANS,
              fontWeight: 700,
              fontSize: 96,
              letterSpacing: "0.04em",
              transform: `translateY(${(1 - t) * 50}px) scale(${0.85 + 0.15 * t})`,
              opacity: interpolate(frame, [FINAL_TIME, FINAL_TIME + 8], [0, 1], clamp),
              filter: `blur(${(1 - Math.min(1, t)) * 12}px)`,
            }}
          >
            <span style={{ ...gradText, paddingRight: 0 }}>19h</span>
          </div>
          <div
            style={{
              width: 10,
              height: 10,
              transform: `rotate(45deg) scale(${line})`,
              background: C.violet,
              boxShadow: `0 0 16px ${C.violet}`,
            }}
          />
          <div style={{ width: 220 * line, height: 2, background: `linear-gradient(90deg, ${C.violet}, rgba(155,107,255,0))` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ---------- Assinatura: logo da igreja + local (mesma arte e letreiro do Generosidade) ----------
const LOGO_W = 560;
const LOGO_H = (LOGO_W * 320) / 2000;
const LOGO_Y = 699; // mesma distância título→19h (91 px de tinta) entre 19h→logo
const PLACE = "PARQUE DOS COQUEIROS";

const Footer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lp = interpolate(frame, [LOGO_START, LOGO_START + 26], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.1, 1) });
  const ls = spring({ frame: frame - LOGO_START, fps, config: { damping: 200 } });
  const deco = interpolate(frame, [PLACE_START + 6, PLACE_START + 30], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const logo = staticFile("quarta-conviccao/logo.png");
  return (
    <>
      {lp > 0 && (
        <Img
          src={logo}
          style={{
            position: "absolute",
            left: 960 - LOGO_W / 2,
            top: LOGO_Y,
            width: LOGO_W,
            height: LOGO_H,
            clipPath: `inset(-20% ${50 - lp * 50}% -20% ${50 - lp * 50}%)`,
            transform: `scale(${1.08 - 0.08 * ls}) translateY(${(1 - ls) * 10}px)`,
            filter: `blur(${(1 - lp) * 8}px)`,
            opacity: interpolate(frame, [LOGO_START, LOGO_START + 10], [0, 1], clamp) * 0.95,
          }}
        />
      )}
      <div
        style={{
          position: "absolute",
          top: LOGO_Y + LOGO_H + 81, // e de novo 91 px entre logo→nome
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 26,
          fontFamily: SANS,
        }}
      >
        <div style={{ width: 90 * deco, height: 1.5, background: `linear-gradient(90deg, rgba(255,194,75,0), ${C.amber})` }} />
        <div style={{ fontSize: 26, fontWeight: 600, color: C.soft, letterSpacing: 10, whiteSpace: "pre" }}>
          {PLACE.split("").map((ch, i) => {
            const local = frame - (PLACE_START + i * 0.9);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: interpolate(local, [0, 8], [0, 1], clamp),
                  transform: `translateY(${(1 - interpolate(local, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) })) * 14}px)`,
                  marginRight: i === PLACE.length - 1 ? -10 : 0,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{ width: 90 * deco, height: 1.5, background: `linear-gradient(90deg, ${C.violet}, rgba(155,107,255,0))` }} />
      </div>
    </>
  );
};

export const QuartaConviccao: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ backgroundColor: "#0B0F17", fontFamily: SANS }}>
      <Background />
      {frame < S2A_START + 10 && <Scene1 />}
      {frame >= S2A_START - 2 && frame < FINAL_START + 8 && <Scene2 />}
      {frame >= FINAL_START - 2 && <Scene3 />}
      {frame >= LOGO_START && <Footer />}

    </AbsoluteFill>
  );
};
