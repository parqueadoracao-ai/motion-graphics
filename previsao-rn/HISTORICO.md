# Histórico de versões — Previsão do Tempo RN

Numeração `MAIOR.MENOR.CORREÇÃO`:
- **CORREÇÃO** (1.0.**1**): ajuste visual, texto ou correção de erro.
- **MENOR** (1.**1**.0): recurso novo (ex.: período "Próximos 4 dias", novo tema).
- **MAIOR** (**2**.0.0): mudança grande que altera o jeito de usar.

## 1.1.1 — 27/11/2026

- Ícones no estilo "chapado geométrico": formas sólidas em 2 tons, sem contorno, mais legíveis de longe
  (sol com halo pulsando, nuvens flutuando, gotas caindo, raio piscando).
- Fonte trocada para Roboto (cartela e editor).

## 1.1.0 — 27/11/2026

- Câmera mais suave: viagem entre cidades mais longa (2,6 s) com chegada que desacelera
  lentamente; depois de chegar, a câmera continua se aproximando bem devagar até a próxima cidade.
- Zoom out final também mais lento (2,8 s).
- Pino, contorno, nome e caixa entram um pouco depois, quando a câmera já assentou.
- Duração automática de cada cidade passa a ser 4 s de chegada + tempo de fala.
- Nova opção de exportação em 60 fps (30 fps continua como padrão).

## 1.0.0 — 27/11/2026

Primeira versão numerada.

- Tema Atlântico (Plus Jakarta Sans, mar azul médio), formatos horizontal 16:9 e vertical 9:16.
- Mapa oficial do IBGE com os 167 municípios; animação de abertura, câmera passeando pelas 4 cidades,
  pino GPS, contorno, nome, caixa de temperatura e zoom out com resumo final (opcional).
- Busca de previsão no Open-Meteo, inclusive automática na primeira abertura de cada dia.
- Texto do apresentador (curto/completo) com tempo de fala estimado e calibração do ritmo.
- Exportação MP4 (H.264, 30 fps, sem som) no próprio navegador.
- Textos da cartela sem efeito de brilho; rodapé padrão "open-meteo.com".
