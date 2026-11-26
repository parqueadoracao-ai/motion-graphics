import { Composition } from "remotion";
import { CartelaTeste } from "./CartelaTeste";
import { AgendaDezembro } from "./agenda-dezembro/AgendaDezembro";
import { DURATION, FPS } from "./agenda-dezembro/timing";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="CartelaTeste" component={CartelaTeste} durationInFrames={300} fps={30} width={1920} height={1080} />
    <Composition id="AgendaDezembro" component={AgendaDezembro} durationInFrames={DURATION} fps={FPS} width={1920} height={1080} />
    <Composition
      id="AgendaDezembroVertical"
      component={AgendaDezembro}
      defaultProps={{ vertical: true }}
      durationInFrames={DURATION}
      fps={FPS}
      width={1080}
      height={1920}
    />
  </>
);
