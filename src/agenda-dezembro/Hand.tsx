// Mão feminina delicada, vista pela palma (desenho original em SVG, inspirado na pose da referência):
// indicador estendido para cima, médio/anelar/mindinho dobrados com as unhas à mostra, polegar erguido à direita.
// Ponta do indicador em (260, 0) no viewBox 420×900.

const SKIN = "url(#skinGrad)";

// Formas na ordem de desenho (de trás para a frente)
const PALM = "M44 372 C34 470 52 560 92 636 C104 700 108 800 110 900 L304 900 C300 800 304 700 318 650 C352 560 360 470 350 392 C346 330 300 300 250 300 L110 300 C70 300 48 330 44 372 Z";
// Dedo afinando: topo (largura wt) e base (largura wb) arredondados, laterais levemente abauladas
const finger = (ct: number, yt: number, wt: number, cb: number, yb: number, wb: number, bulge = 4) => {
  const rt = wt / 2;
  const rb = wb / 2;
  const m = (yt + yb) / 2;
  return [
    `M${ct - rt} ${yt + rt}`,
    `A${rt} ${rt} 0 0 1 ${ct + rt} ${yt + rt}`,
    `C${ct + rt + bulge} ${m} ${cb + rb + bulge} ${m} ${cb + rb} ${yb - rb}`,
    `A${rb} ${rb} 0 0 1 ${cb - rb} ${yb - rb}`,
    `C${cb - rb - bulge} ${m} ${ct - rt - bulge} ${m} ${ct - rt} ${yt + rt}`,
    "Z",
  ].join(" ");
};
// indicador: estreito na ponta; dobrados: nó largo em cima, ponta (com unha) embaixo
const INDEX = finger(260, 0, 54, 262, 410, 68, 3);
const THUMB = finger(338, 166, 50, 314, 430, 84, 6);
const PINKY = finger(90, 282, 64, 104, 436, 46);
const RING = finger(143, 236, 76, 157, 430, 54);
const MIDDLE = finger(198, 192, 84, 211, 404, 60);

// Unha com ponta francesinha (a borda livre fica embaixo, voltada para a palma)
const Nail: React.FC<{ x: number; y: number; w: number; h: number; rot?: number }> = ({ x, y, w, h, rot = 0 }) => (
  <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
    <rect x={x} y={y} width={w} height={h} rx={w / 2.2} fill="url(#nailGrad)" stroke="#B9877C" strokeOpacity={0.45} strokeWidth={1} />
    <path d={`M${x + 1.5} ${y + h * 0.72} Q${x + w / 2} ${y + h * 0.62} ${x + w - 1.5} ${y + h * 0.72} L${x + w - 3} ${y + h - 4} Q${x + w / 2} ${y + h + 1} ${x + 3} ${y + h - 4} Z`} fill="#FFFFFF" opacity={0.92} />
    <rect x={x + w * 0.22} y={y + h * 0.12} width={w * 0.18} height={h * 0.42} rx={w * 0.09} fill="#FFFFFF" opacity={0.35} />
  </g>
);

export const FemaleHand: React.FC<{ light: number; width?: number }> = ({ light, width = 360 }) => {
  const crease = { fill: "none", stroke: "#9A5F52", strokeOpacity: 0.35, strokeWidth: 1.6, strokeLinecap: "round" as const };
  const edge = { fill: "none", stroke: "#8E5446", strokeOpacity: 0.45, strokeWidth: 1.6 };
  const cyl = "url(#cylGrad)";
  return (
    <svg viewBox="0 0 420 900" width={width} height={(width * 900) / 420} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="skinGrad" x1="0" y1="0" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#F6D3BF" />
          <stop offset="0.45" stopColor="#EBB79F" />
          <stop offset="1" stopColor="#B98069" />
        </linearGradient>
        <linearGradient id="cylGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6E3A2E" stopOpacity="0.28" />
          <stop offset="0.3" stopColor="#6E3A2E" stopOpacity="0" />
          <stop offset="0.6" stopColor="#FFFFFF" stopOpacity="0.1" />
          <stop offset="1" stopColor="#6E3A2E" stopOpacity="0.32" />
        </linearGradient>
        <linearGradient id="nailGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F2C1BA" />
          <stop offset="1" stopColor="#F7D6D0" />
        </linearGradient>
        <radialGradient id="palmShade" cx="0.45" cy="0.55" r="0.6">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.12" />
          <stop offset="1" stopColor="#5A2C22" stopOpacity="0.28" />
        </radialGradient>
        <linearGradient id="violetSpill" x1="0" y1="0" x2="0" y2="620" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#C68BFF" stopOpacity="0.7" />
          <stop offset="0.5" stopColor="#A86BFF" stopOpacity="0.22" />
          <stop offset="1" stopColor="#A86BFF" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="armFade" x1="0" y1="0" x2="0" y2="900" gradientUnits="userSpaceOnUse">
          <stop offset="0.68" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.98" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="armMask">
          <rect x="-60" y="-60" width="560" height="1020" fill="url(#armFade)" />
        </mask>
        <clipPath id="handClip">
          <path d={PALM} />
          <path d={INDEX} />
          <path d={THUMB} />
          <path d={PINKY} />
          <path d={RING} />
          <path d={MIDDLE} />
        </clipPath>
      </defs>

      <g mask="url(#armMask)">
        {/* palma e pulso */}
        <path d={PALM} fill={SKIN} />
        <path d={PALM} fill="url(#palmShade)" />
        {/* linhas da palma */}
        <path d="M120 560 C170 600 240 610 300 585" {...crease} />
        <path d="M150 640 C190 660 240 664 285 650" {...crease} strokeOpacity={0.22} />
        <path d="M300 470 C280 520 262 570 250 640" {...crease} strokeOpacity={0.25} />

        {/* indicador */}
        <path d={INDEX} fill={SKIN} />
        <path d={INDEX} fill={cyl} />
        <path d="M244 150 Q261 157 278 150" {...crease} />
        <path d="M241 262 Q261 271 283 262" {...crease} />
        <path d="M242 272 Q261 280 282 272" {...crease} strokeOpacity={0.2} />

        {/* polegar */}
        <path d={THUMB} fill={SKIN} />
        <path d={THUMB} fill={cyl} />
        <path d="M304 300 Q326 308 350 300" {...crease} />
        <g transform="rotate(-5 352 200)">
          <rect x={345} y={176} width={13} height={48} rx={6.5} fill="url(#nailGrad)" stroke="#B9877C" strokeOpacity={0.45} strokeWidth={1} />
          <rect x={345} y={174} width={13} height={11} rx={5.5} fill="#FFFFFF" opacity={0.9} />
        </g>

        {/* mindinho, anelar e médio dobrados */}
        <path d={PINKY} fill={SKIN} />
        <path d={PINKY} fill={cyl} />
        <path d={PINKY} {...edge} />
        <path d="M66 346 Q96 356 124 346" {...crease} />
        <Nail x={92} y={394} w={26} h={36} rot={-6} />

        <path d={RING} fill={SKIN} />
        <path d={RING} fill={cyl} />
        <path d={RING} {...edge} />
        <path d="M110 318 Q148 330 184 318" {...crease} />
        <Nail x={141} y={382} w={32} h={42} rot={-5} />

        <path d={MIDDLE} fill={SKIN} />
        <path d={MIDDLE} fill={cyl} />
        <path d={MIDDLE} {...edge} />
        <path d="M162 286 Q203 299 244 286" {...crease} />
        <Nail x={193} y={350} w={36} h={48} rot={-3} />

        {/* luz roxa do botão sobre a mão */}
        <g clipPath="url(#handClip)">
          <rect x="-20" y="-20" width="460" height="940" fill="url(#violetSpill)" opacity={0.2 + 0.5 * light} style={{ mixBlendMode: "screen" }} />
        </g>
      </g>
    </svg>
  );
};
