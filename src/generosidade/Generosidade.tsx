import { AbsoluteFill, Html5Audio, Sequence, staticFile } from "remotion";
import { Whoosh } from "../Whoosh";
import { Background } from "./Background";
import { PhoneHand } from "./PhoneHand";
import { QrCard } from "./QrCard";
import { Cta, Footer } from "./Texts";
import { Title } from "./Title";
import {
  G_IN, LETTERS_START, LOGO_START, PHONE_IN, PHONE_OUT, PLACE_START, QR_START, RING_END,
  RING_START, SCAN_DETECT, SUBTITLE_START,
} from "./timing";

const Sfx: React.FC<{ at: number; src: string; volume: number; dur?: number }> = ({ at, src, volume, dur = 90 }) => (
  <Sequence from={at} durationInFrames={dur} layout="none">
    <Html5Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

export const Generosidade: React.FC = () => (
  <AbsoluteFill style={{ overflow: "hidden" }}>
    <Background />
    <Title />
    <QrCard />
    <Cta />
    <Footer />
    <PhoneHand />

    {/* trilha ambiente sintetizada */}
    <Html5Audio src={staticFile("generosidade/pad.wav")} volume={0.55} />

    {/* um whoosh por entrada de elemento */}
    <Whoosh at={G_IN + 5} volume={0.55} />
    <Whoosh at={RING_START + 4} volume={0.3} />
    <Whoosh at={LETTERS_START} volume={0.45} />
    <Whoosh at={SUBTITLE_START} volume={0.35} />
    <Whoosh at={QR_START + 4} volume={0.5} />
    <Whoosh at={PHONE_IN + 6} volume={0.45} />
    <Whoosh at={PHONE_OUT + 6} volume={0.35} />
    <Whoosh at={LOGO_START + 4} volume={0.45} />
    <Whoosh at={PLACE_START + 2} volume={0.3} />

    {/* brilhos */}
    <Sfx at={RING_END - 3} src="generosidade/chime.wav" volume={0.45} />
    <Sfx at={SCAN_DETECT} src="generosidade/ding.wav" volume={0.5} dur={48} />
  </AbsoluteFill>
);
