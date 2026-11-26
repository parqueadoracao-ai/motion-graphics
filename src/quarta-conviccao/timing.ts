// Linha do tempo da "Quarta da Convicção" (em frames, 30 fps)
export const FPS = 30;
export const DURATION = 480; // 16 s

export const BG_IN_END = 20;

// Cena 1 — "Não espere o domingo..."
export const S1_START = 12;
export const S1_STEP = 6; // frames entre palavras
export const S1_OUT = 84;

// Cena 2 — três linhas ligadas
export const S2A_START = 96; // "Todas as quartas, às 19h,"
export const S2B_START = 122; // [relógio] "temos um encontro marcado"
export const S2C_START = 162; // [bíblia] "Momentos de estudo da Palavra e" [oração] "oração"
export const S2_STEP = 4;
export const LINK_LEAD = 6; // a linha de ligação começa a desenhar antes da próxima frase
export const S2_SETTLE = 204; // tudo assentado
export const S2_HOLD = 90; // 3 s de respiro
export const S2_OUT = S2_SETTLE + S2_HOLD; // 294
export const OUT_STEP = 1.5; // saída em cascata
export const OUT_LEN = 16;

// Cena 3 — título final
export const FINAL_START = 330;
export const LETTER_STEP = 2;
export const FINAL_LINE = 370;
export const FINAL_TIME = 378; // "19h"
export const FADE_OUT_START = 462;
