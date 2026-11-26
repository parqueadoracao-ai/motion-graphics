import { Html5Audio, Sequence, staticFile } from "remotion";
import { WHOOSH_LEAD } from "./timing";

export const Whoosh: React.FC<{ at: number; volume?: number }> = ({ at, volume = 0.8 }) => (
  <Sequence from={Math.max(0, at - WHOOSH_LEAD)} durationInFrames={25} layout="none">
    <Html5Audio src={staticFile("whoosh.wav")} volume={volume} />
  </Sequence>
);
