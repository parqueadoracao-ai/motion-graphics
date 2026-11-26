import { Easing, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { QR_N, QR_PATH } from "./assets";
import { C, ip, lerp } from "./theme";
import { HOLD_START, QR_START } from "./timing";

export const QR_CX = 960;
export const QR_CY = 522;
export const CARD = 330;
export const QR_SIZE = 270;

// Só o cartão (usado também dentro da tela do celular)
export const QrGraphic: React.FC<{ reveal?: number; id: string }> = ({ reveal = 1, id }) => (
  <svg width={QR_SIZE} height={QR_SIZE} viewBox={`0 0 ${QR_N} ${QR_N}`} shapeRendering="crispEdges">
    <defs>
      <clipPath id={`qrclip-${id}`}>
        <circle cx={QR_N / 2} cy={QR_N / 2} r={reveal * QR_N * 0.75} />
      </clipPath>
    </defs>
    <path d={QR_PATH} fill={C.ink} clipPath={`url(#qrclip-${id})`} />
  </svg>
);

export const QrCard: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = f - QR_START;
  if (local < 0) return null;

  // entrada: gira em 3D (flip) enquanto sobe e se aproxima
  const p = spring({ frame: local, fps, config: { damping: 16, stiffness: 90, mass: 1 } });
  const rotY = lerp(-100, 0, p);
  const rotX = lerp(18, 0, p);
  const scale = lerp(0.6, 1, p);
  const y = lerp(90, 0, p);
  const op = ip(local, [0, 6], [0, 1]);
  const reveal = ip(local, [6, 26], [0, 1], Easing.out(Easing.cubic));

  // cantoneiras douradas
  const br = spring({ frame: local - 16, fps, config: { damping: 14, stiffness: 120 } });
  const breathe = f > HOLD_START ? Math.sin((f - HOLD_START) * 0.09) : 0;
  const bracketOff = lerp(60, 0, br) + 4 * breathe;

  // reflexo diagonal passando pelo cartão
  const sweep = ip(local, [20, 44], [-1, 1], Easing.inOut(Easing.quad));
  const holdSweepT = (f - HOLD_START - 40) % 110;
  const sweep2 = f > HOLD_START + 40 ? ip(holdSweepT, [0, 30], [-1, 1], Easing.inOut(Easing.quad)) : -1;
  const sw = local < 46 ? sweep : sweep2;

  // anéis finos girando atrás do cartão
  const ringsIn = ip(local, [10, 40], [0, 1], Easing.out(Easing.cubic));

  return (
    <div style={{ position: "absolute", left: QR_CX, top: QR_CY, width: 0, height: 0 }}>
      <svg
        width={900}
        height={900}
        viewBox="-450 -450 900 900"
        style={{ position: "absolute", left: -450, top: -450, opacity: ringsIn * 0.9, overflow: "visible" }}
      >
        <g transform={`rotate(${f * 0.25}) scale(${lerp(0.7, 1, ringsIn)})`}>
          <circle r={262} fill="none" stroke={C.gold} strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="2 10" />
        </g>
        <g transform={`rotate(${-f * 0.18}) scale(${lerp(0.6, 1, ringsIn)})`}>
          <circle r={300} fill="none" stroke={C.sky} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="90 30 6 30" />
        </g>
        <circle r={340 + 6 * breathe} fill="none" stroke={C.ink} strokeOpacity={0.05 * ringsIn} strokeWidth={1} />
      </svg>

      <div
        style={{
          position: "absolute",
          left: -CARD / 2,
          top: -CARD / 2,
          width: CARD,
          height: CARD,
          opacity: op,
          transform: `perspective(1400px) translateY(${y}px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(${scale})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            borderRadius: 30,
            background: "#FFFFFF",
            boxShadow: `0 ${30 + 6 * breathe}px 70px rgba(28,43,69,0.16), 0 6px 16px rgba(28,43,69,0.08)`,
            overflow: "hidden",
          }}
        >
          <div style={{ position: "absolute", left: (CARD - QR_SIZE) / 2, top: (CARD - QR_SIZE) / 2 }}>
            <QrGraphic reveal={reveal} id="main" />
          </div>
          {sw > -1 && sw < 1 && (
            <div
              style={{
                position: "absolute",
                inset: -80,
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0) 40%, rgba(255,255,255,0.65) 50%, rgba(255,255,255,0) 60%)",
                transform: `translateX(${sw * 340}px)`,
                mixBlendMode: "screen",
              }}
            />
          )}
        </div>
        {/* cantoneiras */}
        {[0, 1, 2, 3].map((k) => {
          const sx = k % 2 === 0 ? -1 : 1;
          const sy = k < 2 ? -1 : 1;
          const o = CARD / 2 + 18 + bracketOff;
          return (
            <svg
              key={k}
              width={48}
              height={48}
              viewBox="0 0 48 48"
              style={{
                position: "absolute",
                left: CARD / 2 + sx * o - 24,
                top: CARD / 2 + sy * o - 24,
                transform: `scale(${-sx}, ${-sy})`,
                opacity: br,
              }}
            >
              <path d="M44 4 H14 Q4 4 4 14 V44" fill="none" stroke={C.gold} strokeWidth={4} strokeLinecap="round" />
            </svg>
          );
        })}
      </div>
    </div>
  );
};
