import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import {
  CROWN_GLEAM,
  CROWN_START,
  LINES_START,
  SUBTITLE_START,
  TITLE_REVEAL,
  TITLE_START,
  VERSE_START,
} from "./timing";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const FONT = "Inter, 'Helvetica Neue', Arial, sans-serif";

// ---------- Coroa (SVG desenhado à mão, estilo contorno dourado) ----------
const TIPS = [
  { x: 14, y: 58 },
  { x: 64, y: 40 },
  { x: 115, y: 12 },
  { x: 166, y: 40 },
  { x: 216, y: 58 },
];
const VALLEYS = [
  { x: 40, y: 92 },
  { x: 90, y: 80 },
  { x: 140, y: 80 },
  { x: 190, y: 92 },
];

const crownOutline = (() => {
  let d = `M 26,116 L ${TIPS[0].x},${TIPS[0].y}`;
  for (let i = 0; i < VALLEYS.length; i++) {
    d += ` L ${VALLEYS[i].x},${VALLEYS[i].y} L ${TIPS[i + 1].x},${TIPS[i + 1].y}`;
  }
  return d + " L 204,116";
})();

// joia em gota dentro de cada ponta
const jewel = (x: number, y: number, s: number) =>
  `M ${x},${y - 16 * s} C ${x + 9 * s},${y - 4 * s} ${x + 9 * s},${y + 8 * s} ${x},${y + 12 * s} C ${x - 9 * s},${y + 8 * s} ${x - 9 * s},${y - 4 * s} ${x},${y - 16 * s} Z`;

const CrownShapes: React.FC<{ color: string }> = ({ color }) => (
  <g stroke={color} fill="none" strokeLinejoin="round" strokeLinecap="round">
    <path d={crownOutline} strokeWidth={6} />
    <rect x={20} y={116} width={190} height={30} rx={6} strokeWidth={6} />
    <line x1={34} y1={156} x2={196} y2={156} strokeWidth={4} />
    {TIPS.map((t, i) => (
      <circle key={i} cx={t.x} cy={t.y - 9} r={6} fill={color} stroke="none" />
    ))}
    {TIPS.map((t, i) => (
      <path key={"j" + i} d={jewel(t.x, t.y + (i === 2 ? 42 : 32), i === 2 ? 1.15 : 0.85)} strokeWidth={4} />
    ))}
    {[50, 82, 115, 148, 180].map((x, i) => (
      <circle key={"d" + i} cx={x} cy={131} r={i === 2 ? 6 : 4} fill={color} stroke="none" />
    ))}
  </g>
);

const Crown: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - CROWN_START, fps, config: { damping: 200, mass: 1.4 }, durationInFrames: 45 });
  const opacity = interpolate(frame, [CROWN_START, CROWN_START + 24], [0, 1], clamp);
  const blur = interpolate(p, [0, 1], [12, 0]);
  const gleamX = interpolate(frame, [CROWN_GLEAM, CROWN_GLEAM + 28], [-120, 360], clamp);
  const glow = 0.35 + 0.1 * Math.sin(frame * 0.07);

  return (
    <div
      style={{
        position: "absolute",
        top: 70,
        left: 0,
        right: 0,
        display: "flex",
        justifyContent: "center",
        opacity,
        transform: `translateY(${(1 - p) * -36}px) scale(${0.82 + 0.18 * p})`,
        filter: `blur(${blur}px) drop-shadow(0 0 18px rgba(255,200,120,${glow}))`,
      }}
    >
      <svg width={230 * 1.05} height={165 * 1.05} viewBox="0 0 230 165" overflow="visible">
        <defs>
          <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FFF0C8" />
            <stop offset="45%" stopColor="#F2C77A" />
            <stop offset="100%" stopColor="#C98E45" />
          </linearGradient>
          <linearGradient id="gleamGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="white" stopOpacity={0} />
            <stop offset="0.5" stopColor="white" stopOpacity={1} />
            <stop offset="1" stopColor="white" stopOpacity={0} />
          </linearGradient>
          <mask id="gleamMask">
            <rect
              x={gleamX - 50}
              y={-20}
              width={100}
              height={210}
              fill="url(#gleamGrad)"
              transform={`skewX(-20)`}
            />
          </mask>
        </defs>
        <CrownShapes color="url(#gold)" />
        <g mask="url(#gleamMask)">
          <CrownShapes color="#FFFDF5" />
        </g>
      </svg>
    </div>
  );
};

// ---------- EMANUEL ----------
const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - TITLE_START, fps, config: { damping: 200 }, durationInFrames: 50 });
  const wipe = interpolate(frame, [TITLE_START, TITLE_START + TITLE_REVEAL], [-20, 120], clamp);
  const mask = `linear-gradient(90deg, #000 ${wipe - 20}%, transparent ${wipe}%)`;

  return (
    <div
      style={{
        position: "absolute",
        top: 238,
        left: 0,
        right: 0,
        textAlign: "center",
        transform: `translateY(${(1 - p) * 24}px)`,
        filter: "drop-shadow(0 4px 30px rgba(255,170,130,0.35))",
      }}
    >
      <span
        style={{
          display: "inline-block",
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 178,
          lineHeight: 1,
          letterSpacing: `${0.16 - 0.1 * p}em`,
          paddingLeft: `${0.16 - 0.1 * p}em`, // compensa o espaço após a última letra
          backgroundImage: "linear-gradient(90deg, #FFF3DE 0%, #FBD9B0 35%, #F6A98A 68%, #F0656F 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          color: "transparent",
          WebkitMaskImage: mask,
          maskImage: mask,
        }}
      >
        EMANUEL
      </span>
    </div>
  );
};

// ---------- DEUS CONOSCO (com filetes) ----------
const Subtitle: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - SUBTITLE_START, fps, config: { damping: 200 }, durationInFrames: 35 });
  const opacity = interpolate(frame, [SUBTITLE_START, SUBTITLE_START + 18], [0, 1], clamp);
  const lines = spring({ frame: frame - LINES_START, fps, config: { damping: 200 }, durationInFrames: 40 });
  const line = (origin: "left" | "right") => (
    <div
      style={{
        width: 190,
        height: 3,
        borderRadius: 2,
        background: "#F3DCCB",
        opacity: 0.9,
        transform: `scaleX(${lines})`,
        transformOrigin: origin,
      }}
    />
  );

  return (
    <div
      style={{
        position: "absolute",
        top: 442,
        left: 0,
        right: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 34,
      }}
    >
      {line("right")}
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 500,
          fontSize: 62,
          lineHeight: 1,
          letterSpacing: "0.04em",
          color: "#F6DFD0",
          opacity,
          transform: `translateY(${(1 - p) * 18}px)`,
          filter: `blur(${(1 - p) * 6}px)`,
          textShadow: "0 2px 18px rgba(30,10,40,0.45)",
        }}
      >
        DEUS CONOSCO
      </div>
      {line("left")}
    </div>
  );
};

// ---------- MATEUS 1:23 ----------
const Verse: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - VERSE_START, fps, config: { damping: 200 }, durationInFrames: 45 });
  const opacity = interpolate(frame, [VERSE_START, VERSE_START + 22], [0, 1], clamp);
  const spacing = 0.62 - 0.18 * p;

  return (
    <div
      style={{
        position: "absolute",
        top: 528,
        left: 0,
        right: 0,
        textAlign: "center",
        fontFamily: FONT,
        fontWeight: 400,
        fontSize: 36,
        lineHeight: 1,
        letterSpacing: `${spacing}em`,
        paddingLeft: `${spacing}em`,
        color: "#EFC27C",
        opacity,
        textShadow: "0 0 16px rgba(255,190,110,0.35)",
      }}
    >
      MATEUS 1:23
    </div>
  );
};

export const Titles: React.FC = () => (
  <>
    <Crown />
    <Title />
    <Subtitle />
    <Verse />
  </>
);
