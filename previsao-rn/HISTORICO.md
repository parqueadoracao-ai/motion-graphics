# Histórico de versões — Previsão do Tempo RN

Numeração `MAIOR.MENOR.CORREÇÃO`:
- **CORREÇÃO** (1.0.**1**): ajuste visual, texto ou correção de erro.
- **MENOR** (1.**1**.0): recurso novo (ex.: período "Próximos 4 dias", novo tema).
- **MAIOR** (**2**.0.0): mudança grande que altera o jeito de usar.

## 1.6.0 — 27/11/2026

- Versão oficial em uso: mesmo conteúdo da 1.1.5C (ícones traço fino, caixa dos graus com contorno,
  contorno do RN alinhado às divisas, fonte Inter, app "Tempo RN"), só com o número novo.
- Publicada no artefato https://claude.ai/artifact/2PRaowBj4TapFWz8DjF44W.

## 1.1.5C — 27/11/2026 (variante para escolha)

- Base da 1.1.5B (ícones traço fino).
- Contorno do RN refeito a partir das próprias divisas dos municípios: agora coincide exatamente com
  as linhas internas e com o destaque das cidades (antes vinha de outro arquivo do IBGE e ficava
  desencontrado, com arestas e serrilhado).
- Sombra do mapa mais curta e suave, sem borrar a divisa com os estados vizinhos.
- Estados vizinhos (Ceará, Paraíba etc.) um pouco mais escuros, para diferenciar do RN.
- App passa a se chamar **Tempo RN** (nome da janela, do app instalado e do cabeçalho do editor).
- Publicada também como artefato no claude.ai (https://claude.ai/artifact/2PRaowBj4TapFWz8DjF44W):
  salva o MP4 pelo sistema de downloads do Claude, tem botão "Instalar como app" e, no app instalado,
  busca a previsão pelo `curl` do computador (pede "acesso total" uma vez).

## 1.1.5B — 27/11/2026 (variante para escolha)

- Igual à 1.1.5, com ícones no estilo "traço fino" (linha, sem preenchimento) no lugar do
  "chapado geométrico". Depois da escolha do cliente, a opção escolhida vira a versão oficial.

## 1.1.5 — 27/11/2026

- Caixa dos graus no estilo "Contorno": fundo branco, borda azul/laranja e número colorido.
- Divisas entre municípios de volta na abertura e no final: discretas, mas visíveis.

## 1.1.4 — 27/11/2026

- Caixas de mínima e máxima em tom médio (fundo azul/laranja claro e número escuro), menos contraste
  que na 1.1.3.
- Divisas entre municípios mais discretas com o mapa inteiro (abertura e final); com zoom continuam visíveis.

## 1.1.3 — 27/11/2026

- Divisas entre os municípios mais visíveis (cor mais forte e traço um pouco mais grosso de perto),
  ainda discretas.

## 1.1.2 — 27/11/2026

- Fonte trocada de Roboto para Inter: mesma família de desenho, mais encorpada e moderna
  (ExtraBold no título e no nome da cidade, Black nos números).
- Caixas de mínima e máxima com fundo sólido (azul e laranja) e números brancos, para dar contraste.

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
