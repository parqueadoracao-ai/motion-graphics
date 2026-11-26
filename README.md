# motion-graphics

Projeto [Remotion](https://www.remotion.dev/) com uma cartela de teste de 10 s (1920×1080, 30 fps).

## Conteúdo da cartela (`CartelaTeste`)

| Tempo | Elemento | Som |
|---|---|---|
| 0,3 s | Título "CARTELA DE TESTE" entrando letra por letra | whoosh |
| 2,3 / 2,8 / 3,3 s | 3 ícones (estrela, coração, raio) com efeito de mola | whoosh em cada |
| 4,3 s | Painel com gráfico de barras crescendo | whoosh |
| 9,5 s | Fade out | — |

A linha do tempo fica em `src/timing.ts`. O whoosh (`public/whoosh.wav`) é sintetizado por `scripts/make-whoosh.py` (ruído filtrado com varredura de frequência), sem samples de terceiros.

## Uso

```bash
npm install
npm run dev      # abre o Remotion Studio
npm run render   # gera out/cartela-teste.mp4
npm run sfx      # regenera o whoosh
```

Se o ambiente já tiver um Chrome Headless Shell, dá para evitar o download do Remotion com
`--browser-executable=/caminho/para/chrome-headless-shell`.
