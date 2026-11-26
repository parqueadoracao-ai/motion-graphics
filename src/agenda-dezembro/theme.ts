import { continueRender, delayRender, staticFile } from "remotion";

// Paleta: ambiente claro (porcelana fria) com tinta azul-marinho e acentos iridescentes
export const C = {
  bgCenter: "#FAFBFE",
  bgEdge: "#E2E7F1",
  ink: "#12172B",
  soft: "#5B6479",
  line: "rgba(18, 23, 43, 0.08)",
  violet: "#6D5BFF",
  blue: "#3F7BFF",
  teal: "#14B8A6",
  rose: "#E0529C",
  // cena escura
  night: "#06050B",
  neon: "#A86BFF",
  neonHot: "#E36BFF",
};

export const IRIDESCENT = `linear-gradient(155deg, ${C.violet} 0%, ${C.blue} 34%, ${C.teal} 64%, ${C.rose} 100%)`;

// Fontes (SIL Open Font License) servidas de public/fonts
export const DISPLAY = "Outfit"; // geométrica, próxima da referência "stella"
export const SANS = "Inter Tight"; // apoio, estilo das legendas da referência

const faces = [
  new FontFace(DISPLAY, `url(${staticFile("fonts/Outfit-latin.woff2")}) format("woff2")`, { weight: "100 900" }),
  new FontFace(SANS, `url(${staticFile("fonts/InterTight-latin.woff2")}) format("woff2")`, { weight: "100 900" }),
];
const handle = delayRender("Carregando fontes");
Promise.all(faces.map((f) => f.load()))
  .then((loaded) => {
    loaded.forEach((f) => document.fonts.add(f));
    continueRender(handle);
  })
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });

// Programação
export type Evento = { day: number; name: string; from: string; to: string };
export const EVENTOS: Evento[] = [
  { day: 11, name: "Assembleia local", from: "#7B61FF", to: "#3F7BFF" },
  { day: 12, name: "ConfraDay", from: "#22B5E8", to: "#12B5A5" },
  { day: 13, name: "Aniversário da igreja", from: "#FF9A5C", to: "#E0529C" },
  { day: 20, name: "Especial de Natal", from: "#E0529C", to: "#7B61FF" },
];

export const WEEKDAYS_SHORT = ["D", "S", "T", "Q", "Q", "S", "S"];
export const WEEKDAYS_LONG = ["Domingo", "Segunda-feira", "Terça-feira", "Quarta-feira", "Quinta-feira", "Sexta-feira", "Sábado"];

// Calendário de dezembro de 2026
export const YEAR = 2026;
export const MONTH = 11; // dezembro (0-based)
export const DAYS = 31;
export const OFFSET = new Date(YEAR, MONTH, 1).getDay(); // 1º de dezembro de 2026 = terça
export const weekdayOf = (day: number) => (OFFSET + day - 1) % 7;

// Geometria final do calendário (posição à esquerda, escala 1)
export const CELL_W = 100;
export const CELL_H = 88;
export const GAP = 12;
export const GRID_X0 = 150;
export const GRID_Y0 = 298;
export const ROWS = Math.ceil((OFFSET + DAYS) / 7);
export const GRID_W = 7 * CELL_W + 6 * GAP;
export const GRID_H = ROWS * CELL_H + (ROWS - 1) * GAP;
export const cellRect = (day: number) => {
  const idx = OFFSET + day - 1;
  return {
    x: GRID_X0 + (idx % 7) * (CELL_W + GAP),
    y: GRID_Y0 + Math.floor(idx / 7) * (CELL_H + GAP),
  };
};
export const GRID_CX = GRID_X0 + GRID_W / 2;
export const GRID_CY = GRID_Y0 + GRID_H / 2;
// Estado centralizado (antes de ir para a esquerda)
export const CENTER_SCALE = 1.18;
export const CENTER_DX = 960 - GRID_CX;
export const CENTER_DY = 612 - GRID_CY;

// Lista de anúncios à direita
export const LIST_X = 1010;
export const LIST_W = 770;
export const ROW_H = 104;
export const ROW_GAP = 22;
export const rowY = (i: number) => GRID_Y0 - 6 + i * (ROW_H + ROW_GAP);

// Botão da cena escura
export const BTN_CX = 960;
export const BTN_CY = 470;
export const BTN_SIZE = 230;
