import { Composition } from "remotion";
import { CartelaTeste } from "./CartelaTeste";

export const RemotionRoot: React.FC = () => (
  <Composition
    id="CartelaTeste"
    component={CartelaTeste}
    durationInFrames={300}
    fps={30}
    width={1920}
    height={1080}
  />
);
