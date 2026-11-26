// Linha do tempo da "Quarta da Convicção" (em frames, 30 fps)
export const FPS = 30;

// Abertura — fundo aparece junto com o relógio entrando (starglow só na viagem)
export const BG_IN_END = 45;
export const DIAL_IN_END = 46; // relógio chega ao centro
export const DIAL_GLOW_OFF = 60; // starglow já apagado

// Cena 1 — "Não espere o domingo..."
export const S1_START = 50;
export const S1_STEP = 6; // frames entre palavras
export const S1_OUT = 122;

// Cena 2 — três linhas ligadas
export const S2A_START = 134; // "Todas as quartas, às 19h,"
export const S2B_START = 160; // [relógio] "temos um encontro marcado"
export const S2C_START = 200; // [bíblia] "Momentos de estudo da Palavra e" [oração] "oração"
export const S2_STEP = 4;
export const LINK_LEAD = 6; // a linha de ligação começa a desenhar antes da próxima frase
export const S2_SETTLE = 242; // tudo assentado
export const S2_HOLD = 45; // 1,5 s de respiro
export const S2_OUT = S2_SETTLE + S2_HOLD; // 287
export const OUT_STEP = 1; // saída em cascata
export const OUT_LEN = 16;

// Cena 3 — título final, entrada enérgica
export const FINAL_START = 318;
export const LETTER_STEP = 1.2;
export const FINAL_LINE = FINAL_START + 20;
export const FINAL_TIME = FINAL_START + 24; // "19h"

// Assinatura — logo da igreja + "PARQUE DOS COQUEIROS"
export const LOGO_START = FINAL_START + 44;
export const PLACE_START = LOGO_START + 18;
export const ALL_IN = PLACE_START + 32; // último elemento assentado
export const FINAL_HOLD = 90; // 3 s congelado (o Lumen para no último frame)
export const DURATION = ALL_IN + FINAL_HOLD;
