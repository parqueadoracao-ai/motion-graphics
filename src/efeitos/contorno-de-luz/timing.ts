// Linha do tempo do efeito "Contorno de Luz" (frames a 30 fps, relativos ao início do efeito)
export const ENTRADA = 0; // letra entra grande e desfocada e se firma no centro
export const ENTRADA_DUR = 14; // tempo do desfoque/fade da entrada
export const ANEIS_INICIO = 14; // linhas de luz começam a contornar a letra
export const ANEIS_FIM = 56; // contorno 100% concluído (onda de luz + brilho)
export const ANEL2_ATRASO = 5; // a 2ª linha sai um pouco depois da 1ª
export const BRILHO = ANEIS_FIM - 2; // reflexo que atravessa a letra grande
export const BRILHO_DUR = 12;
export const ONDA_DUR = 24; // onda de luz que se expande ao concluir
export const VIAGEM = 64; // letra viaja até seu lugar na palavra
export const VIAGEM_DUR = 18;
export const LETRAS = 76; // demais letras da palavra surgem
export const LETRA_PASSO = 2; // frames entre letras
export const LETRA_DUR = 20; // tempo de assentamento de cada letra
export const SEGURA_LETRA = 30; // só uma letra: tempo parado após o contorno

/** Duração total do efeito para uma palavra (até tudo assentar). */
export const duracaoContorno = (palavra: string) => {
  const n = [...palavra.trim()].length;
  return n <= 1 ? ANEIS_FIM + ONDA_DUR + SEGURA_LETRA : LETRAS + (n - 2) * LETRA_PASSO + LETRA_DUR;
};
