import { Easing, spring, useCurrentFrame, useVideoConfig } from "remotion";
import { QrGraphic, QR_CX, QR_CY, CARD, QR_SIZE } from "./QrCard";
import { C, SANS, ip, lerp } from "./theme";
import { PHONE_IN, PHONE_OUT, SCAN_DETECT } from "./timing";

const W = 214;
const H = 432;
const INSET = 9;
const SW = W - INSET * 2;
const SH = H - INSET * 2;
const ZOOM = 0.52; // "zoom" da câmera: quanto o QR aparece na tela do celular
const DETECT = "#3DDC97";

// Mão ilustrada (coordenadas locais do celular: centro do aparelho = 0,0)
const HandBack: React.FC = () => (
  <g>
    {/* antebraço com manga, vindo do canto inferior direito */}
    <g transform="rotate(9 150 100)">
      <rect x={150} y={30} width={900} height={150} rx={75} fill={C.skin} />
      <rect x={150} y={130} width={900} height={50} rx={25} fill={C.skinShade} opacity={0.45} />
      <rect x={330} y={14} width={800} height={182} rx={40} fill={C.sleeve} />
      <rect x={330} y={14} width={46} height={182} rx={20} fill={C.sleeveShade} />
    </g>
    {/* palma atrás do aparelho */}
    <path
      d="M40 -80 C150 -105 250 -30 258 60 C266 140 226 196 150 206 C80 214 20 180 10 120 Z"
      fill={C.skin}
    />
    <path d="M150 206 C226 196 266 140 258 60 C248 130 210 186 150 206 Z" fill={C.skinShade} opacity={0.5} />
    {/* pontas dos dedos aparecendo na borda esquerda */}
    {[-92, -38, 16, 68].map((y, i) => (
      <g key={i}>
        <rect x={-142 + i * 2} y={y} width={80} height={44 - i * 2} rx={22 - i} fill={C.skin} />
        <rect x={-142 + i * 2} y={y + 28 - i} width={80} height={14 - i} rx={7} fill={C.skinShade} opacity={0.35} />
      </g>
    ))}
  </g>
);

const Thumb: React.FC = () => (
  <g transform="rotate(-38 160 100) translate(0 -20)">
    <rect x={86} y={96} width={150} height={52} rx={26} fill={C.skin} />
    <rect x={86} y={126} width={150} height={22} rx={11} fill={C.skinShade} opacity={0.4} />
    <rect x={92} y={104} width={38} height={30} rx={13} fill="#F3D5C0" />
  </g>
);

export const PhoneHand: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  if (f < PHONE_IN || f > PHONE_OUT + 30) return null;

  const inP = spring({ frame: f - PHONE_IN, fps, config: { damping: 17, stiffness: 70, mass: 1.1 } });
  const outP = ip(f, [PHONE_OUT, PHONE_OUT + 24], [0, 1], Easing.in(Easing.cubic));

  // movimentos suaves de mão humana
  const t = f - PHONE_IN;
  const swayX = Math.sin(t * 0.07) * 7 + Math.sin(t * 0.17) * 2;
  const swayY = Math.cos(t * 0.06) * 6 + Math.sin(t * 0.21) * 1.5;
  const swayR = Math.sin(t * 0.05 + 1) * 1.6;

  const px = QR_CX + 14 + lerp(820, 0, inP) + swayX + outP * 760;
  const py = QR_CY + 4 + lerp(520, 0, inP) + swayY + outP * 560;
  const rot = lerp(28, -5, inP) + swayR + outP * 26;
  const scale = lerp(1.1, 0.9, inP);

  // tela da câmera
  const scanP = ((t - 14) % 34) / 34;
  const detected = ip(f, [SCAN_DETECT, SCAN_DETECT + 8], [0, 1], Easing.out(Easing.cubic));
  const pill = spring({ frame: f - SCAN_DETECT - 4, fps, config: { damping: 15, stiffness: 140 } });

  // posição do QR dentro da tela (cena "atrás" do celular, vista pela câmera)
  const dx = QR_CX - px;
  const dy = QR_CY - py;
  const rad = (-rot * Math.PI) / 180;
  const qx = (dx * Math.cos(rad) - dy * Math.sin(rad)) * ZOOM;
  const qy = (dx * Math.sin(rad) + dy * Math.cos(rad)) * ZOOM;
  const box = QR_SIZE * ZOOM + 14;
  const frameBox = lerp(150, box, detected);
  const fbx = lerp(0, qx, detected);
  const fby = lerp(-10, qy, detected);
  const frameColor = detected > 0.5 ? DETECT : "#FFFFFF";

  return (
    <div
      style={{
        position: "absolute",
        left: px,
        top: py,
        width: 0,
        height: 0,
        transform: `rotate(${rot}deg) scale(${scale})`,
        filter: "drop-shadow(0 40px 50px rgba(28,43,69,0.28))",
      }}
    >
      <svg width={2400} height={2400} viewBox="-1200 -1200 2400 2400" style={{ position: "absolute", left: -1200, top: -1200 }}>
        <HandBack />
        {/* corpo do celular */}
        <rect x={-W / 2 - 3} y={-H / 2 - 3} width={W + 6} height={H + 6} rx={40} fill="#3A3F4A" />
        <rect x={-W / 2} y={-H / 2} width={W} height={H} rx={37} fill="#111318" />
        <rect x={W / 2 + 1} y={-110} width={4} height={56} rx={2} fill="#4A505C" />
      </svg>

      {/* tela: câmera aberta mostrando o QR "por trás" do aparelho */}
      <div
        style={{
          position: "absolute",
          left: -SW / 2,
          top: -SH / 2,
          width: SW,
          height: SH,
          borderRadius: 30,
          overflow: "hidden",
          background: "#DCE3EA",
        }}
      >
        <div style={{ position: "absolute", left: SW / 2, top: SH / 2, width: 0, height: 0 }}>
          <div style={{ position: "absolute", transform: `rotate(${-rot}deg) scale(${ZOOM})` }}>
            <div style={{ position: "absolute", transform: `translate(${dx}px, ${dy}px)` }}>
              <div
                style={{
                  position: "absolute",
                  left: -CARD / 2,
                  top: -CARD / 2,
                  width: CARD,
                  height: CARD,
                  borderRadius: 30,
                  background: "#FFFFFF",
                  boxShadow: "0 20px 50px rgba(28,43,69,0.2)",
                }}
              >
                <div style={{ position: "absolute", left: (CARD - QR_SIZE) / 2, top: (CARD - QR_SIZE) / 2 }}>
                  <QrGraphic id="phone" />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* vinheta + barras da interface da câmera */}
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.35) 100%)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 58, background: "rgba(10,12,16,0.55)" }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 96, background: "rgba(10,12,16,0.6)" }} />
        {/* ilha da câmera frontal */}
        <div style={{ position: "absolute", left: SW / 2 - 36, top: 10, width: 72, height: 20, borderRadius: 10, background: "#000" }} />
        {/* ícones no topo */}
        <svg width={SW} height={58} style={{ position: "absolute", left: 0, top: 0 }}>
          <path d="M24 40 l6 -12 h-5 l4 -9 h8 l-5 8 h5 z" fill="#FFFFFF" opacity={0.9} />
          <circle cx={SW - 28} cy={36} r={8} fill="none" stroke="#FFFFFF" strokeWidth={2} opacity={0.9} />
          <circle cx={SW - 28} cy={36} r={2.5} fill="#FFFFFF" opacity={0.9} />
        </svg>
        {/* moldura de leitura */}
        <div
          style={{
            position: "absolute",
            left: SW / 2 + fbx - frameBox / 2,
            top: SH / 2 + fby - frameBox / 2,
            width: frameBox,
            height: frameBox,
            transform: `rotate(${-rot * detected}deg)`,
          }}
        >
          {[0, 1, 2, 3].map((k) => (
            <div
              key={k}
              style={{
                position: "absolute",
                width: 26,
                height: 26,
                left: k % 2 ? undefined : 0,
                right: k % 2 ? 0 : undefined,
                top: k < 2 ? 0 : undefined,
                bottom: k < 2 ? undefined : 0,
                borderColor: frameColor,
                borderStyle: "solid",
                borderWidth: 0,
                borderTopWidth: k < 2 ? 4 : 0,
                borderBottomWidth: k < 2 ? 0 : 4,
                borderLeftWidth: k % 2 ? 0 : 4,
                borderRightWidth: k % 2 ? 4 : 0,
                borderRadius: 8,
              }}
            />
          ))}
          {detected > 0 && (
            <div style={{ position: "absolute", inset: 0, borderRadius: 8, background: DETECT, opacity: 0.18 * Math.sin(Math.PI * detected) + 0.08 }} />
          )}
          {detected === 0 && t > 14 && (
            <div
              style={{
                position: "absolute",
                left: 6,
                right: 6,
                top: `${8 + scanP * 84}%`,
                height: 3,
                borderRadius: 2,
                background: "linear-gradient(90deg, rgba(255,255,255,0), #FFFFFF, rgba(255,255,255,0))",
                boxShadow: "0 0 12px rgba(255,255,255,0.9)",
              }}
            />
          )}
        </div>
        {/* aviso de leitura concluída */}
        {f >= SCAN_DETECT && (
          <div
            style={{
              position: "absolute",
              left: 12,
              right: 12,
              bottom: 108,
              padding: "9px 12px",
              borderRadius: 14,
              background: "rgba(255,255,255,0.95)",
              fontFamily: SANS,
              fontSize: 12.5,
              whiteSpace: "nowrap",
              fontWeight: 700,
              color: C.ink,
              display: "flex",
              alignItems: "center",
              gap: 8,
              opacity: pill,
              transform: `translateY(${(1 - pill) * 20}px) scale(${lerp(0.9, 1, pill)})`,
            }}
          >
            <span style={{ width: 18, height: 18, borderRadius: 9, background: DETECT, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <svg width={10} height={10} viewBox="0 0 10 10">
                <path d="M1.5 5.2 L4 7.5 L8.5 2.5" fill="none" stroke="#FFFFFF" strokeWidth={1.8} strokeLinecap="round" />
              </svg>
            </span>
            QR Code detectado
          </div>
        )}
        {/* botão do obturador */}
        <div style={{ position: "absolute", left: SW / 2 - 28, bottom: 22, width: 56, height: 56, borderRadius: 28, border: "4px solid #FFFFFF", boxSizing: "border-box" }}>
          <div style={{ position: "absolute", inset: 4, borderRadius: 24, background: "#FFFFFF" }} />
        </div>
      </div>

      {/* polegar por cima da borda do aparelho */}
      <svg width={2400} height={2400} viewBox="-1200 -1200 2400 2400" style={{ position: "absolute", left: -1200, top: -1200 }}>
        <Thumb />
      </svg>
    </div>
  );
};
