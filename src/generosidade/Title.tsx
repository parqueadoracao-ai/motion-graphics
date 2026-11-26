import { Easing, useCurrentFrame } from "remotion";
import { ContornoDeLuz, larguraPalavra } from "../efeitos/contorno-de-luz/ContornoDeLuz";
import { C, SANS, ip, lerp } from "./theme";
import { G_IN, LINE_DUR, LINE_START, SUBTITLE_START } from "./timing";

const WORD = "GENEROSIDADE";
const TITLE_WIDTH = larguraPalavra(WORD);
export const TITLE_X = 960 - TITLE_WIDTH / 2;
export const BASELINE = 226;
const LINE_Y = BASELINE + 30;

export const Title: React.FC = () => {
  const f = useCurrentFrame();

  // ----- linha inferior -----
  const lineP = ip(f, [LINE_START, LINE_START + LINE_DUR], [0, 1], Easing.bezier(0.45, 0, 0.15, 1));
  const lineW = TITLE_WIDTH * lineP;

  // ----- subtítulo -----
  const sub = ip(f, [SUBTITLE_START, SUBTITLE_START + 24], [0, 1], Easing.out(Easing.cubic));

  return (
    <>
      {/* "G" com o efeito Contorno de Luz, depois a palavra se forma no topo */}
      <ContornoDeLuz
        palavra={WORD}
        inicio={G_IN}
        linhaBase={BASELINE}
        cores={{ tinta: C.ink, tinta2: C.ink2, ouro: C.gold, ouroClaro: C.goldLight, azul: C.sky, salvia: C.sage }}
      />

      {/* Linha inferior crescendo da esquerda para a direita */}
      {lineP > 0 && (
        <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <defs>
            <linearGradient id="lineGrad" x1="0" y1="0" x2={TITLE_WIDTH} y2="0" gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor={C.gold} stopOpacity="0.15" />
              <stop offset="0.25" stopColor={C.gold} />
              <stop offset="0.5" stopColor={C.goldLight} />
              <stop offset="0.75" stopColor={C.gold} />
              <stop offset="1" stopColor={C.gold} stopOpacity="0.15" />
            </linearGradient>
            <radialGradient id="lineComet">
              <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
              <stop offset="0.25" stopColor={C.goldLight} stopOpacity="0.9" />
              <stop offset="1" stopColor={C.goldLight} stopOpacity="0" />
            </radialGradient>
          </defs>
          <g transform={`translate(${TITLE_X} ${LINE_Y})`}>
            <rect x={0} y={-1.5} width={lineW} height={3} rx={1.5} fill="url(#lineGrad)" />
            {lineP < 1 && (
              <>
                <circle cx={lineW} cy={0} r={16} fill="url(#lineComet)" />
                <circle cx={lineW} cy={0} r={3} fill="#FFFFFF" />
              </>
            )}
          </g>
        </svg>
      )}

      {/* DÍZIMOS E OFERTAS */}
      <div
        style={{
          position: "absolute",
          top: LINE_Y + 22,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily: SANS,
          fontWeight: 600,
          fontSize: 30,
          color: C.slate,
          letterSpacing: lerp(34, 16, sub),
          paddingLeft: lerp(34, 16, sub), // compensa o espaçamento da última letra
          opacity: sub,
          filter: `blur(${(1 - sub) * 6}px)`,
          transform: `translateY(${(1 - sub) * 14}px)`,
        }}
      >
        DÍZIMOS <span style={{ color: C.gold }}>E</span> OFERTAS
      </div>
    </>
  );
};
