import { interpolate, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { LETTER_STEP, TITLE_START } from "./timing";

const TEXT = "CARTELA DE TESTE";

export const Title: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lastLetter = TITLE_START + (TEXT.length - 1) * LETTER_STEP;
  const underline = spring({ frame: frame - lastLetter, fps, config: { damping: 200 } });

  return (
    <div style={{ position: "absolute", top: 110, left: 0, right: 0, textAlign: "center" }}>
      <div style={{ fontSize: 120, fontWeight: 800, letterSpacing: 6, color: "#F5F7FA" }}>
        {TEXT.split("").map((ch, i) => {
          const local = frame - (TITLE_START + i * LETTER_STEP);
          const p = spring({ frame: local, fps, config: { damping: 14, stiffness: 180 } });
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                whiteSpace: "pre",
                opacity: interpolate(local, [0, 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
                transform: `translateY(${(1 - p) * 60}px) scale(${0.6 + 0.4 * p})`,
              }}
            >
              {ch}
            </span>
          );
        })}
      </div>
      <div
        style={{
          margin: "18px auto 0",
          height: 8,
          width: 900 * underline,
          borderRadius: 4,
          background: "linear-gradient(90deg, #4F8CFF, #2FD3A5)",
        }}
      />
    </div>
  );
};
