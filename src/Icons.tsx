import { spring, useCurrentFrame, useVideoConfig } from "remotion";
import { ICON_STARTS } from "./timing";

const Star = () => (
  <path d="M50 8 L61 38 L93 38 L67 57 L77 88 L50 69 L23 88 L33 57 L7 38 L39 38 Z" fill="currentColor" />
);
const Heart = () => (
  <path d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C39 8 46 13 50 20 C54 13 61 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z" fill="currentColor" />
);
const Bolt = () => <path d="M58 4 L18 56 L46 56 L38 96 L82 40 L54 40 Z" fill="currentColor" />;

const ICONS = [
  { Icon: Star, color: "#FFC24B", label: "Destaque" },
  { Icon: Heart, color: "#FF5C7A", label: "Favorito" },
  { Icon: Bolt, color: "#4F8CFF", label: "Energia" },
];

export const Icons: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (
    <div style={{ position: "absolute", left: 120, top: 430, display: "flex", gap: 56 }}>
      {ICONS.map(({ Icon, color, label }, i) => {
        // mola com pouco amortecimento = overshoot visível
        const s = spring({ frame: frame - ICON_STARTS[i], fps, config: { damping: 8, stiffness: 120, mass: 0.8 } });
        const rot = (1 - s) * -90;
        return (
          <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: 40,
                background: "#1B2333",
                border: `3px solid ${color}55`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color,
                transform: `scale(${s}) rotate(${rot}deg)`,
                boxShadow: `0 20px 50px ${color}33`,
              }}
            >
              <svg viewBox="0 0 100 100" width={120} height={120}>
                <Icon />
              </svg>
            </div>
            <div style={{ fontSize: 34, color: "#AEB8C8", fontWeight: 600, opacity: Math.min(1, Math.max(0, s)) }}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
};
