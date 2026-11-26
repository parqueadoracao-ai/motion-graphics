import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BarChart } from "./BarChart";
import { Icons } from "./Icons";
import { Title } from "./Title";
import { Whoosh } from "./Whoosh";
import { CHART_START, FADE_OUT_START, ICON_STARTS, TITLE_START } from "./timing";

const Timecode: React.FC = () => {
  const frame = useCurrentFrame();
  const s = Math.floor(frame / 30);
  const f = frame % 30;
  return (
    <div style={{ position: "absolute", right: 60, bottom: 36, fontSize: 28, color: "#5B6678", fontFamily: "monospace" }}>
      00:00:{String(s).padStart(2, "0")}:{String(f).padStart(2, "0")}
    </div>
  );
};

export const CartelaTeste: React.FC = () => {
  const frame = useCurrentFrame();
  const fade = interpolate(frame, [FADE_OUT_START, 299], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill
      style={{
        background: "radial-gradient(ellipse at 50% 0%, #1E2A44 0%, #0B0F17 70%)",
        fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif",
      }}
    >
      <AbsoluteFill style={{ opacity: fade }}>
        <Title />
        <Icons />
        <BarChart />
      </AbsoluteFill>
      <Timecode />

      {/* um whoosh por entrada: título, 3 ícones, gráfico */}
      <Whoosh at={TITLE_START} />
      {ICON_STARTS.map((f) => (
        <Whoosh key={f} at={f} volume={0.65} />
      ))}
      <Whoosh at={CHART_START} />
    </AbsoluteFill>
  );
};
