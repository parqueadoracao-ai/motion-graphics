/**
 * Efeito "Contorno de Luz"
 * A 1ª letra da palavra entra grande no centro da tela; duas linhas de luz (dourada e azul)
 * contornam o lado de fora da letra, no formato dela, com cometa e faíscas. Ao fechar o contorno
 * há uma onda de luz e um reflexo; então a letra viaja até o lugar dela e o resto da palavra surge.
 * Com uma letra só, ela fica no centro com o contorno desenhado. Não tem som (adicione no projeto).
 *
 * Uso:  <ContornoDeLuz palavra="GENEROSIDADE" />            (começa no frame 0)
 *       <ContornoDeLuz palavra="A" inicio={30} />            (só a letra, a partir do frame 30)
 */
import { useId, useMemo } from "react";
import { Easing, interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { getLength, getPointAtLength } from "@remotion/paths";
import { GLIFOS, GRANDE } from "./glifos";
import {
  ANEIS_FIM, ANEIS_INICIO, ANEL2_ATRASO, BRILHO, BRILHO_DUR, ENTRADA, ENTRADA_DUR, LETRAS,
  LETRA_PASSO, ONDA_DUR, VIAGEM, VIAGEM_DUR,
} from "./timing";

export type CoresContorno = {
  tinta: string; // cor da letra (base do degradê)
  tinta2: string; // topo do degradê da letra
  ouro: string;
  ouroClaro: string;
  azul: string;
  salvia: string;
};

export const CORES_PADRAO: CoresContorno = {
  tinta: "#1C2B45",
  tinta2: "#34507A",
  ouro: "#B98B3F",
  ouroClaro: "#E6C680",
  azul: "#7FAEDC",
  salvia: "#8EC3AE",
};

export type ContornoDeLuzProps = {
  palavra: string;
  inicio?: number; // frame em que o efeito começa
  centroX?: number; // centro horizontal da palavra formada
  linhaBase?: number; // linha de base (y) da palavra formada (padrão: palavra centralizada na tela)
  espacamento?: number; // espaço extra entre letras (px)
  centroLetra?: { x: number; y: number }; // onde a letra grande aparece
  cores?: Partial<CoresContorno>;
};

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ip = (f: number, i: [number, number], o: [number, number], ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, i, o, { ...CL, easing: ease });
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const pontoEm = (d: string, l: number) => getPointAtLength(d, l) ?? { x: 0, y: 0 };

/** Normaliza a palavra: maiúsculas e só caracteres que o efeito conhece. */
export const prepararPalavra = (palavra: string) =>
  [...palavra.trim().toUpperCase()].filter((c) => GLIFOS[c]).join("");

/** Largura da palavra formada (px), para alinhar outros elementos (ex.: uma linha embaixo). */
export const larguraPalavra = (palavra: string, espacamento = 14) => {
  const cs = [...prepararPalavra(palavra)];
  return cs.reduce((s, c) => s + GLIFOS[c].avanco, 0) + espacamento * Math.max(0, cs.length - 1);
};

export const ContornoDeLuz: React.FC<ContornoDeLuzProps> = ({
  palavra,
  inicio = 0,
  centroX = 960,
  linhaBase = 593,
  espacamento = 14,
  centroLetra = { x: 960, y: 540 },
  cores,
}) => {
  const f = useCurrentFrame() - inicio;
  const { fps } = useVideoConfig();
  const c = { ...CORES_PADRAO, ...cores };
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const id = (n: string) => `cl${uid}${n}`;

  const chars = [...prepararPalavra(palavra)];
  const so = chars.length <= 1; // só uma letra: fica no centro
  const g = GLIFOS[chars[0] ?? "G"];
  const xs: number[] = [];
  chars.reduce((x, ch) => (xs.push(x), x + GLIFOS[ch].avanco + espacamento), 0);
  const largura = larguraPalavra(palavra, espacamento);
  const x0 = centroX - largura / 2;

  const aneis = useMemo(
    () => [
      { subs: g.aneis[0], len: g.aneis[0].map((d) => getLength(d)), largura: 3.2, cor: `url(#${id("ouro")})`, atraso: 0, inverso: false, cometa: `url(#${id("cometa")})` },
      { subs: g.aneis[1], len: g.aneis[1].map((d) => getLength(d)), largura: 1.8, cor: `url(#${id("azul")})`, atraso: ANEL2_ATRASO, inverso: true, cometa: `url(#${id("cometaAzul")})` },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [g, uid],
  );
  const progresso = (fr: number, atraso: number) =>
    ip(fr, [ANEIS_INICIO + atraso, ANEIS_FIM], [0, 1], Easing.bezier(0.65, 0, 0.25, 1));

  if (f < ENTRADA || chars.length === 0) return null;

  const gcx = (g.caixa[0] + g.caixa[2]) / 2;
  const gcy = (g.caixa[1] + g.caixa[3]) / 2;

  // entrada, centro e viagem até a palavra
  const entra = spring({ frame: f - ENTRADA, fps, config: { damping: 18, stiffness: 70, mass: 1.1 } });
  const viaja = so ? 0 : spring({ frame: f - VIAGEM, fps, durationInFrames: VIAGEM_DUR, config: { damping: 200 } });
  const escala = lerp(GRANDE * lerp(1.55, 1, entra), 1, viaja);
  const lx = lerp(centroLetra.x, x0 + gcx, viaja);
  const ly = lerp(centroLetra.y + (1 - entra) * 40, linhaBase + gcy, viaja);
  const desfoque = (1 - ip(f, [ENTRADA, ENTRADA + ENTRADA_DUR], [0, 1])) * 14;
  const opacidade = ip(f, [ENTRADA, ENTRADA + 10], [0, 1]);

  // conclusão do contorno
  const onda = ip(f, [ANEIS_FIM - 2, ANEIS_FIM + ONDA_DUR - 2], [0, 1], Easing.out(Easing.cubic));
  const concluido = f >= ANEIS_FIM - 2;
  const someAneis = so ? 1 : 1 - ip(f, [VIAGEM + 2, VIAGEM + 14], [0, 1]);
  const halo = concluido ? Math.sin(Math.PI * ip(f, [ANEIS_FIM - 2, VIAGEM + 6], [0, 1])) : 0;
  const brilho =
    f >= BRILHO && f <= BRILHO + BRILHO_DUR
      ? lerp(g.caixa[0] - 60, g.caixa[2] + 60, ip(f, [BRILHO, BRILHO + BRILHO_DUR], [0, 1], Easing.inOut(Easing.quad)))
      : null;

  return (
    <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={id("tinta")} x1="0" y1="-110" x2="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.tinta2} />
          <stop offset="1" stopColor={c.tinta} />
        </linearGradient>
        <linearGradient id={id("ouro")} x1="0" y1="-130" x2="120" y2="20" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.ouroClaro} />
          <stop offset="0.5" stopColor={c.ouro} />
          <stop offset="1" stopColor={c.ouroClaro} />
        </linearGradient>
        <linearGradient id={id("azul")} x1="0" y1="0" x2="120" y2="-120" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor={c.azul} />
          <stop offset="1" stopColor={c.salvia} />
        </linearGradient>
        <radialGradient id={id("cometa")}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="0.25" stopColor={c.ouroClaro} stopOpacity="0.9" />
          <stop offset="1" stopColor={c.ouroClaro} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={id("cometaAzul")}>
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="0.3" stopColor="#BFD9F2" stopOpacity="0.9" />
          <stop offset="1" stopColor="#BFD9F2" stopOpacity="0" />
        </radialGradient>
        {brilho !== null && (
          <linearGradient id={id("brilho")} x1={brilho - 70} y1="0" x2={brilho + 70} y2="-40" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.75" />
            <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        )}
        <filter id={id("desfoque")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={desfoque / escala} />
        </filter>
        <filter id={id("suave")} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation={6 / escala} />
        </filter>
        {chars.map((_, i) => {
          const local = f - (LETRAS + (i - 1) * LETRA_PASSO);
          return (
            <filter key={i} id={id(`l${i}`)} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation={Math.max(0, 1 - local / 12) * 6} />
            </filter>
          );
        })}
      </defs>

      {/* onda de luz quando o contorno termina */}
      {concluido && onda < 1 && (
        <g transform={`translate(${lx} ${ly})`} opacity={(1 - onda) * 0.8}>
          <circle r={lerp(230, 520, onda)} fill="none" stroke={c.ouroClaro} strokeWidth={lerp(6, 0.5, onda)} />
          <circle r={lerp(200, 380, onda)} fill="none" stroke={c.azul} strokeWidth={lerp(3, 0.5, onda)} opacity={0.7} />
        </g>
      )}

      {/* a letra em destaque e suas linhas de luz */}
      <g transform={`translate(${lx} ${ly}) scale(${escala}) translate(${-gcx} ${-gcy})`} opacity={opacidade}>
        {halo > 0 && <path d={g.d} fill={c.ouroClaro} opacity={halo * 0.9} filter={`url(#${id("suave")})`} />}
        <g filter={desfoque > 0.05 ? `url(#${id("desfoque")})` : undefined}>
          <path d={g.d} fill={`url(#${id("tinta")})`} />
        </g>
        {brilho !== null && <path d={g.d} fill={`url(#${id("brilho")})`} />}

        {someAneis > 0 &&
          aneis.map((a, i) => {
            const p = progresso(f, a.atraso);
            if (p <= 0) return null;
            const traco = a.largura / escala;
            const comCometa = p < 1;
            return (
              <g key={i} opacity={someAneis}>
                {a.subs.map((d, s) => {
                  const len = a.len[s];
                  const feito = len * p;
                  const cabeca = a.inverso ? len - feito : feito;
                  const rastro = Math.min(len * 0.16, feito);
                  return (
                    <g key={s}>
                      {/* traço desenhando de 0 a 100% */}
                      <path
                        d={d}
                        fill="none"
                        stroke={a.cor}
                        strokeWidth={traco * (concluido ? 1 + halo * 0.8 : 1)}
                        strokeLinecap="round"
                        strokeDasharray={`${len} ${len}`}
                        strokeDashoffset={a.inverso ? -(len - feito) : len - feito}
                      />
                      {/* rastro luminoso atrás da cabeça */}
                      {comCometa && (
                        <path
                          d={d}
                          fill="none"
                          stroke="#FFFFFF"
                          strokeWidth={traco * 1.6}
                          strokeLinecap="round"
                          opacity={0.85}
                          strokeDasharray={
                            a.inverso ? `0 ${cabeca} ${rastro} ${len * 2}` : `0 ${Math.max(0, cabeca - rastro)} ${rastro} ${len * 2}`
                          }
                        />
                      )}
                      {comCometa && s === 0 && (
                        <Cometa d={d} len={len} p={p} f={f} i={i} a={a} escala={escala} progresso={progresso} />
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}
      </g>

      {/* demais letras da palavra */}
      {!so && (
        <g transform={`translate(${x0} ${linhaBase})`}>
          {chars.slice(1).map((ch, j) => {
            const i = j + 1;
            const local = f - (LETRAS + (i - 1) * LETRA_PASSO);
            if (local < 0 || !GLIFOS[ch].d) return null;
            const s = spring({ frame: local, fps, config: { damping: 15, stiffness: 140 } });
            return (
              <g key={i} transform={`translate(${xs[i]} ${(1 - s) * 46}) `} opacity={ip(local, [0, 8], [0, 1])}>
                <g filter={local < 12 ? `url(#${id(`l${i}`)})` : undefined}>
                  <path d={GLIFOS[ch].d} fill={`url(#${id("tinta")})`} />
                </g>
              </g>
            );
          })}
        </g>
      )}
    </svg>
  );
};

// Cabeça do cometa + faíscas que ficam para trás
const Cometa: React.FC<{
  d: string; len: number; p: number; f: number; i: number; escala: number;
  a: { atraso: number; inverso: boolean; cometa: string };
  progresso: (fr: number, atraso: number) => number;
}> = ({ d, len, p, f, i, a, escala, progresso }) => {
  const pos = (pp: number) => pontoEm(d, Math.min(len - 0.01, Math.max(0, a.inverso ? len - len * pp : len * pp)));
  const pt = pos(p);
  const faiscas = [];
  for (let k = 1; k <= 12; k++) {
    const pk = progresso(f - k * 0.7, a.atraso);
    if (pk <= 0) break;
    const q = pos(pk);
    const ang = (k * 2.3 + i) % 6.28;
    const desvio = (k * 2.2) / escala;
    faiscas.push(
      <circle
        key={k}
        cx={q.x + Math.cos(ang) * desvio}
        cy={q.y + Math.sin(ang) * desvio}
        r={Math.max(0.4, 3.4 - k * 0.24) / escala}
        fill="#FFFFFF"
        opacity={(1 - k / 13) * 0.9}
      />,
    );
  }
  return (
    <>
      {faiscas}
      <circle cx={pt.x} cy={pt.y} r={26 / escala} fill={a.cometa} />
      <circle cx={pt.x} cy={pt.y} r={4 / escala} fill="#FFFFFF" />
    </>
  );
};
