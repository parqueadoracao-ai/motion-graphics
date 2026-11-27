import { AbsoluteFill, random, useCurrentFrame } from "remotion";

const W = 1920;
const H = 1080;
const CX = W / 2;
const GROUND_Y = 872;

// Variação suave da intensidade da luz (soma de senoides lentas)
export const lightIntensity = (f: number) =>
  1 + 0.07 * Math.sin(f * 0.055) + 0.04 * Math.sin(f * 0.113 + 1.3) + 0.025 * Math.sin(f * 0.21 + 2.1);

// ---------- Parede da caverna (contorno orgânico procedural) ----------
// perfil base (distância da borda da tela) em função de y: bojo no alto, recua no meio, abre na base
const PROFILE: [number, number][] = [
  [-60, 250], [120, 300], [260, 330], [400, 270], [520, 215], [640, 250], [760, 300], [880, 360], [1000, 450], [1140, 540],
];
const profileAt = (y: number) => {
  for (let i = 0; i < PROFILE.length - 1; i++) {
    const [y0, x0] = PROFILE[i];
    const [y1, x1] = PROFILE[i + 1];
    if (y <= y1) {
      const t = (y - y0) / (y1 - y0);
      const e = t * t * (3 - 2 * t);
      return x0 + (x1 - x0) * e;
    }
  }
  return PROFILE[PROFILE.length - 1][1];
};
const wallPoints = (seed: string, inset: number, rough: number) => {
  const pts: [number, number][] = [];
  for (let y = -60; y <= H + 60; y += 26) {
    const lump = 26 * Math.sin(y * 0.018 + random(seed + "a") * 6) + 14 * Math.sin(y * 0.043 + random(seed + "b") * 6);
    const jag = (random(seed + y) - 0.5) * rough;
    pts.push([profileAt(y) + inset + lump + jag, y]);
  }
  return pts;
};
const smoothPath = (pts: [number, number][], side: "left" | "right") => {
  const X = (x: number) => (side === "left" ? x : W - x);
  const edge = side === "left" ? -80 : W + 80;
  let d = `M ${edge},-60 L ${X(pts[0][0])},${pts[0][1]}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    d += ` Q ${X(pts[i][0]).toFixed(1)},${pts[i][1]} ${X(mx).toFixed(1)},${my}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L ${X(last[0])},${last[1]} L ${edge},${H + 60} Z`;
};
const LEFT_WALL = smoothPath(wallPoints("L", 0, 22), "left");
const RIGHT_WALL = smoothPath(wallPoints("R", -10, 22), "right");
// camada de rocha mais ao fundo, um pouco mais para dentro
const LEFT_WALL_BACK = smoothPath(wallPoints("LB", 70, 30), "left");
const RIGHT_WALL_BACK = smoothPath(wallPoints("RB", 60, 30), "right");

// ---------- Chão ondulado ----------
const GROUND_PATH = (() => {
  let d = `M -60,${H + 40} L -60,${GROUND_Y + 20}`;
  for (let x = -60; x <= W + 60; x += 20) {
    const y = GROUND_Y + 6 * Math.sin(x * 0.006) + 4 * Math.sin(x * 0.017 + 1) - Math.pow(Math.abs(x - CX) / 960, 2) * 60;
    d += ` L ${x},${y.toFixed(1)}`;
  }
  return d + ` L ${W + 60},${H + 40} Z`;
})();

// ---------- Raios de luz ----------
const RAYS = new Array(9).fill(0).map((_, i) => {
  const spread = (i - 4) / 4; // -1..1
  return {
    topX: CX + spread * 90,
    bottomX: CX + spread * 330 + (random("ray" + i) - 0.5) * 60,
    width: 30 + random("rw" + i) * 70,
    speed: 0.03 + random("rs" + i) * 0.05,
    phase: random("rp" + i) * 6.28,
    alpha: 0.25 + random("ra" + i) * 0.35,
  };
});

// ---------- Partículas ----------
const PARTICLES = new Array(170).fill(0).map((_, i) => {
  const r = (k: string) => random(`p${i}${k}`);
  const gauss = (r("x1") + r("x2") + r("x3")) / 3 - 0.5; // concentra no centro
  return {
    x: CX + gauss * 1500,
    y0: r("y"),
    speed: 0.12 + r("s") * 0.45,
    size: 1.2 + Math.pow(r("z"), 3) * 4.5,
    swayAmp: 6 + r("a") * 18,
    swayFreq: 0.01 + r("f") * 0.03,
    tw: 0.04 + r("t") * 0.1,
    phase: r("ph") * 6.28,
  };
});
const P_TOP = 560;
const P_BOTTOM = GROUND_Y + 10;

const Particles: React.FC<{ light: number }> = ({ light }) => {
  const frame = useCurrentFrame();
  const band = P_BOTTOM - P_TOP;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
      {PARTICLES.map((p, i) => {
        const travel = (p.y0 * band + p.speed * frame) % band;
        const y = P_BOTTOM - travel;
        const x = p.x + p.swayAmp * Math.sin(frame * p.swayFreq + p.phase);
        const edgeFade = Math.min(1, travel / 60, (band - travel) / 120);
        const centerFall = Math.exp(-Math.pow((x - CX) / 520, 2));
        const twinkle = 0.45 + 0.55 * (0.5 + 0.5 * Math.sin(frame * p.tw + p.phase));
        const a = Math.max(0, edgeFade * centerFall * twinkle * Math.min(1.2, light));
        return (
          <circle
            key={i}
            cx={x}
            cy={y}
            r={p.size}
            fill={p.size > 3.8 ? "rgba(255,214,180,0.55)" : "rgb(255,236,214)"}
            opacity={a}
            filter={p.size > 3.8 ? "url(#bokeh)" : undefined}
          />
        );
      })}
      <defs>
        <filter id="bokeh" x="-200%" y="-200%" width="500%" height="500%">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
      </defs>
    </svg>
  );
};

// ---------- Manjedoura + criança (silhueta) ----------
const STRAW = new Array(46).fill(0).map((_, i) => {
  const t = i / 45; // 0..1 ao longo da borda
  const x = -205 + t * 410;
  const out = (t - 0.5) * 2; // -1 esquerda .. 1 direita
  const len = 18 + random("sl" + i) * 34 * (0.6 + Math.abs(out) * 0.8);
  const ang = -Math.PI / 2 + out * 1.15 + (random("sa" + i) - 0.5) * 0.6;
  const w = 5 + random("sw" + i) * 5;
  const by = -192 + (random("sy" + i) - 0.5) * 10;
  const tx = x + Math.cos(ang) * len;
  const ty = by + Math.sin(ang) * len;
  return `M ${x - w},${by} L ${tx.toFixed(1)},${ty.toFixed(1)} L ${x + w},${by} Z`;
});
// palha caindo pela frente da manjedoura
const STRAW_FRONT = new Array(14).fill(0).map((_, i) => {
  const x = -180 + (i / 13) * 360 + (random("fx" + i) - 0.5) * 20;
  const len = 14 + random("fl" + i) * 22;
  const tilt = (random("ft" + i) - 0.5) * 14;
  return `M ${x - 5},-188 L ${x + tilt},${-188 + len} L ${x + 5},-188 Z`;
});

const SILHOUETTE = "#24111d";

const Manger: React.FC = () => {
  const frame = useCurrentFrame();
  // gesto de "conversa": braço sobe e desce com pausas, mão gira de leve
  const envelope = 0.55 + 0.45 * Math.sin(frame * 0.021 - 1.2);
  const armAngle = -8 + 16 * envelope * Math.sin(frame * 0.085) + 5 * Math.sin(frame * 0.19 + 0.7);
  const handTilt = 12 * Math.sin(frame * 0.13 + 0.4);
  const headTilt = 3.2 * Math.sin(frame * 0.05 + 0.5) + 1.2 * Math.sin(frame * 0.12);
  const breath = 1 + 0.012 * Math.sin(frame * 0.09);

  return (
    <svg
      width={W}
      height={H}
      style={{ position: "absolute", inset: 0, filter: "drop-shadow(0 0 10px rgba(255,190,150,0.55))" }}
    >
      <g transform={`translate(${CX}, ${GROUND_Y + 2}) scale(0.8)`} fill={SILHOUETTE}>
        {/* pernas */}
        <path d="M -128,-100 L -108,-100 L -160,0 L -186,0 Z" />
        <path d="M 128,-100 L 108,-100 L 160,0 L 186,0 Z" />
        <rect x={-150} y={-52} width={300} height={10} rx={3} />
        {/* cocho */}
        <path d="M -198,-196 L 198,-196 L 150,-92 L -150,-92 Z" />
        <rect x={-206} y={-200} width={412} height={14} rx={4} />
        {/* palha */}
        {STRAW.map((d, i) => (
          <path key={i} d={d} />
        ))}
        {STRAW_FRONT.map((d, i) => (
          <path key={"f" + i} d={d} />
        ))}
        {/* criança enrolada em panos */}
        <g transform={`translate(0,-200) scale(1, ${breath}) translate(0,200)`}>
          <path d="M -78,-196 C -80,-246 -40,-268 10,-266 C 60,-264 104,-250 120,-224 C 132,-206 120,-196 104,-196 Z" />
          {/* braço levantado (bracinho gordinho + mão aberta) */}
          <g transform={`translate(30,-256) rotate(${armAngle})`}>
            <path d="M -13,8 C -15,-12 -11,-30 -4,-40 C 0,-45 12,-44 14,-37 C 13,-24 12,-8 13,8 Z" />
            <g transform={`translate(5,-44) rotate(${handTilt})`}>
              <ellipse cx={0} cy={-8} rx={14} ry={14} />
              {[-11, -4, 3, 10].map((fx, i) => (
                <ellipse key={i} cx={fx} cy={-22} rx={3.6} ry={7} transform={`rotate(${fx * 1.6} ${fx} -16)`} />
              ))}
              <ellipse cx={-15} cy={-6} rx={4} ry={7} transform="rotate(-50 -15 -6)" />
            </g>
          </g>
        </g>
        {/* cabeça */}
        <g transform={`rotate(${headTilt} -72 -214)`}>
          <circle cx={-96} cy={-236} r={38} />
        </g>
      </g>
    </svg>
  );
};

// ---------- Cena completa (fica dentro da câmera) ----------
export const Scene: React.FC = () => {
  const frame = useCurrentFrame();
  const L = lightIntensity(frame);
  const hazeShift = frame * 0.35;

  return (
    <AbsoluteFill
      style={{
        background:
          "radial-gradient(ellipse 65% 70% at 50% 58%, #5a3a98 0%, #33246f 38%, #1a1446 70%, #0d0b26 100%)",
      }}
    >
      {/* luz quente vindo do alto à esquerda */}
      <AbsoluteFill
        style={{
          opacity: 0.85 * L,
          background:
            "radial-gradient(circle at 4% -4%, rgba(255,236,200,1) 0%, rgba(255,176,110,0.85) 9%, rgba(232,110,110,0.45) 24%, rgba(170,70,140,0.18) 42%, rgba(0,0,0,0) 60%)",
        }}
      />
      {/* névoa / nuvens */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: 0.55, mixBlendMode: "screen" }}>
        <defs>
          <filter id="haze" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0022 0.0055" numOctaves={4} seed={7} />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0.55  0 0 0 0 0.5  0 0 0 0 0.95  0 0 0 1.3 -0.45"
            />
          </filter>
          <radialGradient id="hazeMask" cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="white" stopOpacity={1} />
            <stop offset="100%" stopColor="white" stopOpacity={0} />
          </radialGradient>
          <mask id="hm">
            <rect width={W} height={H} fill="url(#hazeMask)" />
          </mask>
        </defs>
        <g mask="url(#hm)">
          <rect x={-200 + hazeShift} y={0} width={W + 400} height={H} filter="url(#haze)" />
        </g>
      </svg>

      {/* raios de luz descendo sobre a manjedoura */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "screen" }}>
        <defs>
          <linearGradient id="rayGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#c9b8ff" stopOpacity={0} />
            <stop offset="45%" stopColor="#d9c8ff" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#fff1e0" stopOpacity={0.9} />
          </linearGradient>
          <filter id="rayBlur" x="-50%" y="-10%" width="200%" height="120%">
            <feGaussianBlur stdDeviation="14" />
          </filter>
        </defs>
        <g filter="url(#rayBlur)">
          {RAYS.map((r, i) => {
            const a = r.alpha * (0.75 + 0.25 * Math.sin(frame * r.speed + r.phase)) * L;
            return (
              <path
                key={i}
                d={`M ${r.topX - r.width * 0.2},120 L ${r.topX + r.width * 0.2},120 L ${r.bottomX + r.width},${GROUND_Y} L ${r.bottomX - r.width},${GROUND_Y} Z`}
                fill="url(#rayGrad)"
                opacity={a}
              />
            );
          })}
        </g>
      </svg>

      {/* brilho por trás da manjedoura */}
      <AbsoluteFill
        style={{
          opacity: 0.9 * L,
          mixBlendMode: "screen",
          background:
            "radial-gradient(ellipse 22% 26% at 50% 76%, rgba(255,240,225,0.95) 0%, rgba(255,190,200,0.5) 35%, rgba(180,120,230,0.18) 70%, rgba(0,0,0,0) 100%)",
        }}
      />

      {/* chão com textura de ondulações */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <radialGradient id="groundGrad" cx="50%" cy={GROUND_Y} r="900" gradientUnits="userSpaceOnUse" fx={CX} fy={GROUND_Y}>
            <stop offset="0%" stopColor="#f2b49c" />
            <stop offset="18%" stopColor="#b8617a" />
            <stop offset="45%" stopColor="#5a2a5e" />
            <stop offset="100%" stopColor="#1c0f2a" />
          </radialGradient>
          <filter id="sand" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0025 0.02" numOctaves={5} seed={3} result="n" />
            <feDiffuseLighting in="n" surfaceScale={10} lightingColor="#ffffff" result="lit">
              <feDistantLight azimuth={250} elevation={38} />
            </feDiffuseLighting>
            <feBlend in="lit" in2="SourceGraphic" mode="multiply" result="b" />
            <feComposite in="b" in2="SourceGraphic" operator="in" />
          </filter>
          <filter id="rock" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.008 0.016" numOctaves={5} seed={11} result="n" />
            <feDiffuseLighting in="n" surfaceScale={9} lightingColor="#ffffff" result="lit">
              <feDistantLight azimuth={20} elevation={42} />
            </feDiffuseLighting>
            <feBlend in="lit" in2="SourceGraphic" mode="multiply" result="b" />
            <feComposite in="b" in2="SourceGraphic" operator="in" />
          </filter>
          <linearGradient id="leftWallGrad" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#12081a" />
            <stop offset="55%" stopColor="#3a1a3a" />
            <stop offset="88%" stopColor="#a5504f" />
            <stop offset="100%" stopColor="#f0a070" />
          </linearGradient>
          <linearGradient id="leftWallBack" x1="0" y1="0" x2="1" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#2a1436" />
            <stop offset="80%" stopColor="#6a3a6a" />
            <stop offset="100%" stopColor="#d88a7a" />
          </linearGradient>
          <linearGradient id="rightWallBack" x1="1" y1="0" x2="0" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#1d1638" />
            <stop offset="80%" stopColor="#4a3a80" />
            <stop offset="100%" stopColor="#a58ad8" />
          </linearGradient>
          <linearGradient id="rightWallGrad" x1="1" y1="0" x2="0" y2="0" gradientUnits="objectBoundingBox">
            <stop offset="0%" stopColor="#0f0a1c" />
            <stop offset="55%" stopColor="#2a1c48" />
            <stop offset="88%" stopColor="#6b4a9a" />
            <stop offset="100%" stopColor="#c69ad8" />
          </linearGradient>
        </defs>
        <path d={GROUND_PATH} fill="url(#groundGrad)" filter="url(#sand)" />
        <path d={LEFT_WALL_BACK} fill="url(#leftWallBack)" filter="url(#rock)" opacity={0.9} />
        <path d={RIGHT_WALL_BACK} fill="url(#rightWallBack)" filter="url(#rock)" opacity={0.9} />
        <path d={LEFT_WALL} fill="url(#leftWallGrad)" filter="url(#rock)" />
        <path d={RIGHT_WALL} fill="url(#rightWallGrad)" filter="url(#rock)" />
      </svg>

      {/* luz quente transbordando sobre a rocha */}
      <AbsoluteFill
        style={{
          opacity: 0.7 * L,
          mixBlendMode: "screen",
          background:
            "radial-gradient(circle at 6% 0%, rgba(255,226,180,0.95) 0%, rgba(255,160,100,0.55) 10%, rgba(220,100,110,0.2) 26%, rgba(0,0,0,0) 45%)",
        }}
      />

      {/* poça de luz no chão, sob a manjedoura */}
      <AbsoluteFill
        style={{
          opacity: 0.75 * L,
          mixBlendMode: "screen",
          background:
            "radial-gradient(ellipse 15% 5% at 50% 81%, rgba(255,245,230,1) 0%, rgba(255,200,170,0.5) 45%, rgba(0,0,0,0) 100%)",
        }}
      />

      <Particles light={L} />
      <Manger />
    </AbsoluteFill>
  );
};
