import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Scene } from "./Scene";
import { Titles } from "./Titles";
import { CAMERA_SCALE_END, CAMERA_SCALE_START, DURATION, FADE_IN_END } from "./timing";

// Cartela "Emanuel — Deus conosco — Mateus 1:23". Sem áudio.
// A parte inferior (abaixo do chão) fica livre para a logo da igreja.
export const Emanuel: React.FC = () => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, DURATION - 1], [CAMERA_SCALE_START, CAMERA_SCALE_END], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.sin),
  });
  const fadeIn = interpolate(frame, [0, FADE_IN_END], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "#07060f" }}>
      <AbsoluteFill style={{ opacity: fadeIn }}>
        {/* câmera: zoom out lento (os textos ficam fora dela, estáveis) */}
        <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: "50% 70%" }}>
          <Scene />
        </AbsoluteFill>
        {/* vinheta */}
        <AbsoluteFill
          style={{
            background:
              "radial-gradient(ellipse 75% 75% at 50% 50%, rgba(0,0,0,0) 55%, rgba(6,4,16,0.55) 100%)",
          }}
        />
        <Titles />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
