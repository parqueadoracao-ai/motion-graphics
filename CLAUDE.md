# CLAUDE.md

Repositório de motion graphics feito com [Remotion](https://www.remotion.dev/) (React → vídeo).
O usuário fala português: responda sempre em português do Brasil.

## Stack

- Remotion 4.0.547, React 19, TypeScript (versões fixas no `package.json`; não use `^`).
- Entrada: `src/index.ts` → `src/Root.tsx` (registra todas as composições).
- Áudio em `public/`, carregado com `staticFile()` e `<Html5Audio>`.

## Estrutura

```
src/
  Root.tsx           # registra cada <Composition>
  CartelaTeste.tsx   # 1º projeto (cartela de teste), com Title/Icons/BarChart/timing na raiz de src/
  Whoosh.tsx         # componente de som reutilizável: <Whoosh at={frame} />
  quarta-conviccao/  # cartela "Quarta da Convicção" (culto de quarta), tipografia cinética
public/whoosh.wav    # gerado por scripts/make-whoosh.py (sintetizado, sem samples de terceiros)
```

**Projetos novos:** crie uma pasta `src/<nome-do-projeto>/` com o componente principal e um
`timing.ts` próprio, e registre a composição em `src/Root.tsx`. Reaproveite `src/Whoosh.tsx`.
Adicione um script `render:<nome>` no `package.json` gerando `out/<nome>.mp4`.

Fontes ficam em `public/fonts/` (woff2, licença OFL) e são carregadas com `FontFace` + `delayRender`:
o Chrome do render na nuvem não consegue baixar do Google Fonts (erro de certificado no proxy).

## Padrões

- **Formato:** 1920×1080, 30 fps, H.264 + AAC, salvo em `out/` (pasta ignorada pelo Git).
- **Tempos:** tudo em frames, centralizado no `timing.ts` do projeto; nada de números mágicos espalhados.
- **Animação:** use `spring()` e `interpolate()` com `extrapolateLeft/Right: "clamp"`; nunca CSS
  transitions nem `setTimeout` (o Remotion renderiza frame a frame).
- **Som:** um whoosh por entrada de elemento. O pico do whoosh fica uns 7 frames após o início,
  então o componente já antecipa 5 frames (`WHOOSH_LEAD`).
- **Visual padrão:** fundo escuro em gradiente radial (`#1E2A44` → `#0B0F17`), texto `#F5F7FA`,
  texto secundário `#AEB8C8`, acentos `#4F8CFF`, `#2FD3A5`, `#FFC24B`, `#FF5C7A`; fonte sans
  bold (Inter/Helvetica/Arial). Ícones em SVG inline feitos à mão.
- Não recrie marcas, personagens ou vinhetas existentes; use apenas assets originais ou do usuário.

## Comandos

```bash
npm install
npx tsc                 # checagem de tipos, rode antes de renderizar
npm run dev             # Remotion Studio
npm run sfx             # regenera public/whoosh.wav
```

Render **neste ambiente de nuvem** (usa o Chrome já instalado em vez de baixar outro):

```bash
npx remotion render <IdDaComposicao> out/<nome>.mp4 --browser-executable=/opt/pw-browsers/chromium_headless_shell
```

## Fluxo de entrega

1. `npx tsc` sem erros.
2. Renderize o MP4.
3. Confira: `ffprobe` (duração, 1920×1080, faixa de áudio), alguns frames extraídos com `ffmpeg`
   e `silencedetect` para confirmar que os sons caem nos tempos certos.
4. Envie o MP4 ao usuário (SendUserFile) e resuma a linha do tempo.
5. Faça commit e push no branch da sessão. O MP4 não vai para o Git.
