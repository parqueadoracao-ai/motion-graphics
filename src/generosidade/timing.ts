import * as CL from "../efeitos/contorno-de-luz/timing";
// Linha do tempo do projeto Generosidade (frames, 30 fps) — 15 s
export const FPS = 30;
export const DURATION = 450;

// Abertura: o "G" com o efeito Contorno de Luz (tempos vêm do efeito, começando no frame 0)
export const G_IN = CL.ENTRADA;
export const RING_START = CL.ANEIS_INICIO;
export const RING_END = CL.ANEIS_FIM;
export const G_MOVE = CL.VIAGEM;

// Palavra completa + linha + subtítulo
export const LETTERS_START = CL.LETRAS; // demais letras de GENEROSIDADE
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

