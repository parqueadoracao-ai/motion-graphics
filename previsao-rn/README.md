# Previsão do Tempo RN

Editor de cartelas animadas de previsão do tempo para os 167 municípios do Rio Grande do Norte.
Gera o vídeo MP4 (sem som, 30 ou 60 fps) direto no navegador.

## Como usar

1. Abra `previsao-rn-vX.Y.Z.html` (a versão mais recente) no **Chrome** ou no **Edge** (duplo clique no arquivo). Funciona offline;
   só a busca automática da previsão precisa de internet.
2. Preencha os 4 municípios: nome (com autocompletar), mínima, máxima, chance de chuva e condição
   (clique na setinha ou use o botão direito para escolher o ícone). **⟳ Buscar previsão** preenche
   tudo pelo Open-Meteo; os campos continuam editáveis.
3. Confira o **texto do apresentador** (Curto ou Completo, **↻ Outra versão** troca a frase). O app
   estima o tempo de fala e usa como duração da cidade: 4 s de chegada da câmera + fala. A duração
   pode ser ajustada à mão.
4. Escolha **Horizontal 16:9** ou **Vertical 9:16**, confira na prévia e clique em **Exportar MP4**.

Os dados ficam salvos no próprio navegador do computador. **Na primeira abertura de cada dia**, o app
busca sozinho a previsão dos 4 municípios salvos (e atualiza a data); basta conferir e exportar.
O rodapé começa com "open-meteo.com"; se usar dados de outra fonte, troque o texto.

### Ritmo do apresentador

O padrão é 170 palavras por minuto (medido em 2 testes). Depois do programa, abra
**Calibrar com o tempo real do apresentador**, digite quanto tempo ele levou em cada cidade e
clique em **Aplicar**.

## Linha do tempo

| Trecho | Duração |
|---|---|
| Abertura (mapa + título) | 1,5 s |
| Cada município | 4 s + tempo de fala (mínimo 5 s) |
| Câmera: viagem até a cidade | 2,6 s, chegada desacelerando; depois aproximação lenta de 3,5% |
| Pino, contorno, nome, caixa | entram entre 2,2 s e 4,25 s |
| Final: zoom out (2,8 s) + resumo das 4 cidades | 5,5 s (3 s sem o resumo) |

Os tempos ficam no topo do script em `app.html` (`T_INTRO`, `T_TRAVEL`, …).

## Desenvolvimento

`previsao-rn-vX.Y.Z.html` é gerado; edite `app.html`, suba a versão em `VERSAO`, registre a mudança em
`HISTORICO.md` e rode:

```bash
npm run build:previsao-rn
```

Para mostrar uma segunda opção ao cliente (ex.: 1.1.5B), liste-a em `variantes.json`
(`{"B": {"icones": "traco"}}`); o build gera os dois arquivos.

O build junta `app.html` com a malha do IBGE (`dados/`), a fonte Inter e o mp4-muxer
(ambos em `node_modules`) num único arquivo.

### Fontes de dados

- **Mapa:** malha municipal do IBGE (`servicodados.ibge.gov.br/api/v3/malhas`), qualidade máxima
  para o RN e intermediária para os estados vizinhos. Os arquivos já estão em `dados/`.
- **Previsão:** Open-Meteo (gratuito, sem cadastro, liberado para uso direto no navegador). O INMET
  foi testado, mas a API dele não permite ser lida direto do navegador e não traz chance de chuva.
- O ícone sugerido combina chance de chuva, milímetros e cobertura de nuvens, porque o código de
  tempo diário do Open-Meteo marca "garoa" com muita facilidade.
