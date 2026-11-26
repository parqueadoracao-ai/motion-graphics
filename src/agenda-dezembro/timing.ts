// Agenda dezembro — todos os tempos em frames (30 fps, 20 s)
export const FPS = 30;
export const DURATION = 600;

// Cena escura: botão desligado, mão entra e aperta
export const HAND_IN = 10; // mão começa a subir
export const HAND_ARRIVE = 44; // ponta do dedo encosta no botão
export const PRESS = 48; // clique (botão liga)
export const HAND_OUT = 60; // mão recua
export const HAND_GONE = 84;

// Transição: a luz do botão se expande e vira o ambiente claro
export const TRANS_START = 74;
export const TRANS_END = 98;

// Título
export const TITLE_IN = 92;
export const TITLE_LETTER_STEP = 1.6;
export const TITLE_FORMED = 122; // título completo
export const TITLE_HOLD = 45; // repouso de 1,5 s
export const TITLE_UP = TITLE_FORMED + TITLE_HOLD; // 167: sobe para o topo
export const TITLE_UP_DUR = 22;

// Blocos 3D
export const SLABS_IN = 182;
export const SLAB_STEP = 1.1;
export const ORGANIZE = 252; // blocos viram calendário
export const ORGANIZE_STEP = 1.2;
export const ORGANIZE_DUR = 30;
export const HEADER_IN = 300; // dias da semana
export const SHIFT = 318; // calendário vai para a esquerda
export const SHIFT_DUR = 22;

// Anúncios (um bloco por data)
export const EVENT_START = 344;
export const EVENT_STEP = 40;
export const FLY_DUR = 16; // bloco voa do calendário para a lista
export const CARD_OPEN = 12; // após o início do voo, o cartão se abre

// Assinatura
export const LOGO_START = EVENT_START + 4 * EVENT_STEP + 10; // 514
export const PLACE_START = LOGO_START + 14;
