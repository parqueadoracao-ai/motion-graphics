import { Composition } from "remotion";
import { CartelaTeste } from "./CartelaTeste";
import { Generosidade } from "./generosidade/Generosidade";
import { DURATION, FPS } from "./generosidade/timing";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="CartelaTeste"
      component={CartelaTeste}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="Generosidade"
      component={Generosidade}
      durationInFrames={DURATION}
      fps={FPS}
      width={1920}
      height={1080}
    />
  </>
);
