import { AbsoluteFill, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Calendar } from "./Calendar";
import { DarkIntro } from "./DarkIntro";
import { Lines } from "./Lines";
import { BTN_CX, BTN_CY, C, HEADLINE, IRIDESCENT, SANS } from "./theme";
import {
  LOGO_START,
  PLACE_START,
  TITLE_IN,
  TITLE_LETTER_STEP,
  TITLE_UP,
  TITLE_UP_DUR,
  TRANS_END,
  TRANS_START,
} from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// Fundo claro com manchas de luz pastel em movimento lento
const LightBackground: React.FC = () => {
  const frame = useCurrentFrame();
  const t = frame / 30;
  const blob = (x: number, y: number, r: number, color: string, o: number) => (
    <div
      style={{
        position: "absolute",
        left: x - r,
        top: y - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        background: `radial-gradient(circle, ${color} 0%, rgba(255,255,255,0) 70%)`,
        opacity: o,
      }}
    />
  );
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 75% at 50% 42%, ${C.bgCenter} 0%, ${C.bgEdge} 100%)`, overflow: "hidden" }}>
      {blob(300 + Math.sin(t * 0.5) * 80, 200 + Math.cos(t * 0.4) * 50, 520, "rgba(150,130,255,0.35)", 1)}
      {blob(1650 + Math.cos(t * 0.45) * 90, 880 + Math.sin(t * 0.5) * 60, 600, "rgba(60,200,190,0.25)", 1)}
      {blob(1500 + Math.sin(t * 0.3) * 60, 140, 380, "rgba(224,82,156,0.16)", 1)}
    </AbsoluteFill>
  );
};

// Título "Agenda dezembro": letras sobem do desfoque; depois vai para o topo
const TITLE_WORDS = ["Agenda", "dezembro"];
const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < TITLE_IN) return null;
  const up = spring({ frame: frame - TITLE_UP, fps, config: { damping: 20 }, durationInFrames: TITLE_UP_DUR });
  const y = interpolate(up, [0, 1], [540, 132]);
  const scale = interpolate(up, [0, 1], [1, 0.56]);
  let n = 0;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top: y,
        display: "flex",
        justifyContent: "center",
        transform: `translateY(-50%) scale(${scale})`,
        fontFamily: HEADLINE,
        fontWeight: 800,
        fontSize: 196,
        lineHeight: 1.1,
        letterSpacing: "-0.045em",
        whiteSpace: "nowrap",
      }}
    >
      {TITLE_WORDS.map((w, wi) => (
        <span key={w} style={{ display: "inline-block", marginRight: wi === 0 ? "0.22em" : 0 }}>
          {w.split("").map((ch, ci) => {
            const local = frame - (TITLE_IN + n++ * TITLE_LETTER_STEP);
            const p = interpolate(local, [0, 14], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.7, 0.2, 1) });
            return (
              <span
                key={ci}
                style={{
                  display: "inline-block",
                  opacity: interpolate(local, [0, 8], [0, 1], clamp),
                  transform: `translateY(${(1 - p) * 70}px)`,
                  filter: `blur(${(1 - p) * 12}px)`,
                  ...(wi === 1
                    ? {
                        backgroundImage: IRIDESCENT,
                        backgroundSize: "460% 100%",
                        backgroundPosition: `${(ci / 7) * 100}% 0`,
                        WebkitBackgroundClip: "text",
                        backgroundClip: "text",
                        color: "transparent",
                        paddingRight: "0.02em",
                      }
                    : { color: C.ink }),
                }}
              >
                {ch}
              </span>
            );
          })}
        </span>
      ))}
    </div>
  );
};

// Assinatura: logo da igreja (tingida em azul-marinho) + Parque dos Coqueiros
const LOGO_W = 500;
const LOGO_H = (LOGO_W * 320) / 2000;
const LOGO_Y = 852;
const PLACE = "PARQUE DOS COQUEIROS";
const Footer: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (frame < LOGO_START) return null;
  const lp = interpolate(frame, [LOGO_START, LOGO_START + 24], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.1, 1) });
  const ls = spring({ frame: frame - LOGO_START, fps, config: { damping: 200 } });
  const line = interpolate(frame, [PLACE_START + 4, PLACE_START + 28], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  const logo = staticFile("agenda-dezembro/logo.png");
  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 960 - LOGO_W / 2,
          top: LOGO_Y,
          width: LOGO_W,
          height: LOGO_H,
          background: C.ink,
          WebkitMaskImage: `url(${logo})`,
          maskImage: `url(${logo})`,
          WebkitMaskSize: "100% 100%",
          maskSize: "100% 100%",
          clipPath: `inset(-20% ${50 - lp * 50}% -20% ${50 - lp * 50}%)`,
          transform: `scale(${1.08 - 0.08 * ls}) translateY(${(1 - ls) * 10}px)`,
          filter: `blur(${(1 - lp) * 8}px)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          top: LOGO_Y + LOGO_H + 22,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 20,
        }}
      >
        <div style={{ width: 70 * line, height: 2, background: `linear-gradient(90deg, rgba(109,91,255,0), ${C.violet})` }} />
        <div style={{ fontFamily: SANS, fontSize: 22, fontWeight: 700, color: C.soft, letterSpacing: 9, whiteSpace: "pre", marginRight: -9 }}>
          {PLACE.split("").map((ch, i) => {
            const local = frame - (PLACE_START + i * 0.9);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: interpolate(local, [0, 8], [0, 1], clamp),
                  transform: `translateY(${(1 - interpolate(local, [0, 12], [0, 1], { ...clamp, easing: Easing.out(Easing.back(2)) })) * 12}px)`,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{ width: 70 * line, height: 2, background: `linear-gradient(90deg, ${C.teal}, rgba(20,184,166,0))` }} />
      </div>
    </>
  );
};

// Transição: a luz do botão abre um círculo que revela o ambiente claro
const LightReveal: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const frame = useCurrentFrame();
  const r = interpolate(frame, [TRANS_START, TRANS_END], [0, 2300], { ...clamp, easing: Easing.bezier(0.55, 0, 0.35, 1) });
  const flash = interpolate(frame, [TRANS_START, TRANS_START + 8, TRANS_END + 6], [0, 0.9, 0], clamp);
  if (frame < TRANS_START) return null;
  return (
    <>
      <AbsoluteFill style={{ clipPath: frame >= TRANS_END ? undefined : `circle(${r}px at ${BTN_CX}px ${BTN_CY}px)` }}>{children}</AbsoluteFill>
      {frame < TRANS_END + 8 && (
        <AbsoluteFill
          style={{
            background: `radial-gradient(circle at ${BTN_CX}px ${BTN_CY}px, rgba(255,255,255,${flash}) 0%, rgba(214,180,255,${flash * 0.6}) ${Math.max(1, r / 30)}%, rgba(255,255,255,0) ${Math.max(2, r / 14)}%)`,
            pointerEvents: "none",
          }}
        />
      )}
    </>
  );
};

export const AgendaDezembro: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: C.night }}>
      {frame < TRANS_END && <DarkIntro />}
      <LightReveal>
        <LightBackground />
        <Lines />
        <Calendar />
        <Title />
        <Footer />
      </LightReveal>

    </AbsoluteFill>
  );
};
