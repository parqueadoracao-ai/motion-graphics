import { Easing, Img, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { C, SANS, ip, lerp } from "./theme";
import { CTA2_START, CTA_START, HOLD_START, LOGO_START, PLACE_START } from "./timing";

const CTA_Y = 728;

// "Aponte a câmera para o QR Code" — palavra por palavra
export const Cta: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const words = ["Aponte", "a", "câmera", "para", "o", "QR", "Code"];
  const l2 = ip(f, [CTA2_START, CTA2_START + 22], [0, 1], Easing.out(Easing.cubic));
  return (
    <div style={{ position: "absolute", top: CTA_Y, left: 0, right: 0, textAlign: "center", fontFamily: SANS }}>
      <div style={{ fontSize: 46, fontWeight: 800, color: C.ink, letterSpacing: -0.5 }}>
        {words.map((w, i) => {
          const local = f - (CTA_START + i * 2);
          const p = spring({ frame: local, fps, config: { damping: 16, stiffness: 150 } });
          const accent = i >= 5;
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: i < words.length - 1 ? 13 : 0,
                opacity: ip(local, [0, 7], [0, 1]),
                transform: `translateY(${(1 - p) * 34}px)`,
                filter: `blur(${(1 - ip(local, [0, 10], [0, 1])) * 5}px)`,
                color: accent ? C.gold : C.ink,
              }}
            >
              {w}
            </span>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 10,
          fontSize: 30,
          fontWeight: 500,
          color: C.slate,
          letterSpacing: 1,
          opacity: l2,
          transform: `translateY(${(1 - l2) * 16}px)`,
        }}
      >
        Acesse seu banco e contribua.
      </div>
    </div>
  );
};

const LOGO_W = 540;
const LOGO_H = (LOGO_W * 320) / 2000;
const LOGO_Y = 878;

// Logo (arte do usuário, recolorida em azul-tinta por máscara) + "PARQUE DOS COQUEIROS"
export const Footer: React.FC = () => {
  const f = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lp = ip(f, [LOGO_START, LOGO_START + 26], [0, 1], Easing.bezier(0.3, 0, 0.1, 1));
  const ls = spring({ frame: f - LOGO_START, fps, config: { damping: 200 } });
  const shineT = f > HOLD_START + 60 ? ((f - HOLD_START - 60) % 120) / 30 : -1;
  const shineX = shineT >= 0 && shineT <= 1 ? lerp(-0.3, 1.3, Easing.inOut(Easing.quad)(shineT)) : null;

  const place = "PARQUE DOS COQUEIROS";
  const deco = ip(f, [PLACE_START + 6, PLACE_START + 30], [0, 1], Easing.out(Easing.cubic));
  const logoMask = {
    WebkitMaskImage: `url(${staticFile("generosidade/logo.png")})`,
    maskImage: `url(${staticFile("generosidade/logo.png")})`,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
  } as React.CSSProperties;

  return (
    <>
      {/* garante que a imagem da máscara esteja carregada antes do frame */}
      <Img src={staticFile("generosidade/logo.png")} style={{ position: "absolute", width: 1, height: 1, opacity: 0 }} />
      {lp > 0 && (
        <div
          style={{
            position: "absolute",
            left: 960 - LOGO_W / 2,
            top: LOGO_Y,
            width: LOGO_W,
            height: LOGO_H,
            clipPath: `inset(-20% ${50 - lp * 50}% -20% ${50 - lp * 50}%)`,
            transform: `scale(${lerp(1.08, 1, ls)}) translateY(${(1 - ls) * 10}px)`,
            filter: `blur(${(1 - lp) * 8}px)`,
            opacity: ip(f, [LOGO_START, LOGO_START + 10], [0, 1]),
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: C.ink, ...logoMask }} />
          {shineX !== null && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                ...logoMask,
                background: `linear-gradient(105deg, rgba(255,255,255,0) ${shineX * 100 - 12}%, ${C.goldLight} ${shineX * 100}%, rgba(255,255,255,0) ${shineX * 100 + 12}%)`,
              }}
            />
          )}
        </div>
      )}
      <div
        style={{
          position: "absolute",
          top: LOGO_Y + LOGO_H + 26,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 26,
          fontFamily: SANS,
        }}
      >
        <div style={{ width: 90 * deco, height: 1.5, background: `linear-gradient(90deg, rgba(185,139,63,0), ${C.gold})` }} />
        <div style={{ fontSize: 26, fontWeight: 600, color: C.gold, letterSpacing: 10, whiteSpace: "pre" }}>
          {place.split("").map((ch, i) => {
            const local = f - (PLACE_START + i * 0.9);
            return (
              <span
                key={i}
                style={{
                  display: "inline-block",
                  opacity: ip(local, [0, 8], [0, 1]),
                  transform: `translateY(${(1 - ip(local, [0, 12], [0, 1], Easing.out(Easing.back(2)))) * 14}px)`,
                  marginRight: i === place.length - 1 ? -10 : 0,
                }}
              >
                {ch}
              </span>
            );
          })}
        </div>
        <div style={{ width: 90 * deco, height: 1.5, background: `linear-gradient(90deg, ${C.gold}, rgba(185,139,63,0))` }} />
      </div>
    </>
  );
};
