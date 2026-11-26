import { Composition } from "remotion";
import { CartelaTeste } from "./CartelaTeste";
import { QuartaConviccao } from "./quarta-conviccao/QuartaConviccao";
import { DURATION, FPS } from "./quarta-conviccao/timing";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="CartelaTeste" component={CartelaTeste} durationInFrames={300} fps={30} width={1920} height={1080} />
    <Composition
      id="QuartaConviccao"
      component={QuartaConviccao}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
