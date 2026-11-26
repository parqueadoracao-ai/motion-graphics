import { AbsoluteFill, CalculateMetadataFunction } from "remotion";
import { ContornoDeLuz, ContornoDeLuzProps } from "./ContornoDeLuz";
import { duracaoContorno } from "./timing";

// Composição de teste/renderização avulsa do efeito, sobre um fundo claro neutro.
// npx remotion render ContornoDeLuz out/contorno-amor.mp4 --props='{"palavra":"AMOR"}'
export const SEGURA_FINAL = 30; // 1 s parado no fim

export const ContornoDeLuzDemo: React.FC<ContornoDeLuzProps> = (props) => (
  <AbsoluteFill
    style={{
      background:
        "radial-gradient(ellipse at 30% 25%, rgba(127,174,220,0.22) 0%, rgba(255,255,255,0) 55%), " +
        "radial-gradient(ellipse at 75% 80%, rgba(230,198,128,0.22) 0%, rgba(255,255,255,0) 55%), " +
        "linear-gradient(160deg, #F8F5EF 0%, #F3F1EC 45%, #EDF2F7 100%)",
    }}
  >
    <ContornoDeLuz {...props} />
  </AbsoluteFill>
);

export const calcularDuracao: CalculateMetadataFunction<ContornoDeLuzProps> = ({ props }) => ({
  durationInFrames: (props.inicio ?? 0) + duracaoContorno(props.palavra) + SEGURA_FINAL,
});
