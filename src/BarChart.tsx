import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { BAR_STEP, CHART_START } from "./timing";

const DATA = [
  { label: "Jan", value: 42 },
  { label: "Fev", value: 65 },
  { label: "Mar", value: 53 },
  { label: "Abr", value: 81 },
  { label: "Mai", value: 96 },
];
const MAX = 100;
const H = 400;

export const BarChart: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const panel = spring({ frame: frame - CHART_START, fps, config: { damping: 200 } });

  return (
    <div
      style={{
        position: "absolute",
        right: 120,
        top: 400,
        width: 820,
        height: 560,
        padding: "40px 50px 30px",
        boxSizing: "border-box",
        borderRadius: 32,
        background: "#141B28",
        opacity: panel,
        transform: `translateX(${(1 - panel) * 120}px)`,
      }}
    >
      <div style={{ position: "relative", height: H, display: "flex", alignItems: "flex-end", gap: 40 }}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <div key={g} style={{ position: "absolute", left: 0, right: 0, bottom: H * g, borderTop: "2px dashed #2A3447" }} />
        ))}
        {DATA.map((d, i) => {
          const start = CHART_START + 8 + i * BAR_STEP;
          const g = spring({ frame: frame - start, fps, config: { damping: 18, stiffness: 90 } });
          const shown = Math.round(interpolate(g, [0, 1], [0, d.value]));
          return (
            <div key={d.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", zIndex: 1 }}>
              <div style={{ fontSize: 32, fontWeight: 700, color: "#F5F7FA", marginBottom: 10, opacity: g > 0.05 ? 1 : 0 }}>{shown}</div>
              <div
                style={{
                  width: "100%",
                  height: (d.value / MAX) * (H - 60) * g,
                  borderRadius: "14px 14px 4px 4px",
                  background: "linear-gradient(180deg, #2FD3A5, #4F8CFF)",
                }}
              />
            </div>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 40, marginTop: 20 }}>
        {DATA.map((d) => (
          <div key={d.label} style={{ flex: 1, textAlign: "center", fontSize: 30, color: "#AEB8C8" }}>{d.label}</div>
        ))}
      </div>
    </div>
  );
};
