import { Composition } from "remotion";
import { CartelaTeste } from "./CartelaTeste";
import { Emanuel } from "./emanuel/Emanuel";
import { DURATION as EMANUEL_DURATION } from "./emanuel/timing";

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
      id="Emanuel"
      component={Emanuel}
      durationInFrames={EMANUEL_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
