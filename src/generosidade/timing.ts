// Linha do tempo do projeto Generosidade (frames, 30 fps) — 15 s
export const FPS = 30;
export const DURATION = 450;

// Abertura: o "G"
export const G_IN = 0; // G entra grande e vai ao centro
export const RING_START = 14; // linhas externas começam a contornar o G
export const RING_END = 56; // contorno 100% concluído (chime)
export const G_MOVE = 64; // G viaja até seu lugar na palavra
export const G_MOVE_DUR = 18;

// Palavra completa + linha + subtítulo
export const LETTERS_START = 76; // demais letras de GENEROSIDADE
export const LETTER_STEP = 2;
export const LINE_START = 84; // linha inferior cresce da esquerda p/ direita
export const LINE_DUR = 30;
export const SUBTITLE_START = 102; // DÍZIMOS E OFERTAS

// QR Code
export const QR_START = 118;

// Chamada + celular
export const CTA_START = 142; // "Aponte a câmera..." e a mão com o celular entram juntos
export const CTA2_START = 152; // "Acesse seu banco e contribua."
export const PHONE_IN = CTA_START;
export const SCAN_DETECT = 182; // celular "reconhece" o QR (ding)
export const PHONE_OUT = PHONE_IN + 90; // sai 3 s depois de entrar

// Assinatura
export const LOGO_START = 252;
export const PLACE_START = 270; // PARQUE DOS COQUEIROS
export const HOLD_START = 300; // daqui até o fim: 5 s de tela "parada" com micro-movimentos

// Brilhos periódicos durante a espera
export const SHINE_TIMES = [RING_END - 2, 318, 396];
