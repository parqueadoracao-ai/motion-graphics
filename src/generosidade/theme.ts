import { delayRender, continueRender, interpolate, Easing } from "remotion";
import "@fontsource/manrope/400.css";
import "@fontsource/manrope/500.css";
import "@fontsource/manrope/600.css";
import "@fontsource/manrope/700.css";
import "@fontsource/manrope/800.css";

// Paleta clara, quente e serena
export const C = {
  paper: "#F8F5EF",
  mist: "#EDF2F7",
  ink: "#1C2B45",
  ink2: "#34507A",
  slate: "#5E6D84",
  gold: "#B98B3F",
  goldLight: "#E6C680",
  sky: "#7FAEDC",
  sage: "#8EC3AE",
  white: "#FFFFFF",
  skin: "#E7B793",
  skinShade: "#D29C77",
  sleeve: "#8EA9CB",
  sleeveShade: "#7893B6",
};

export const SANS = "Manrope, Inter, 'Helvetica Neue', Arial, sans-serif";

// Aguarda as fontes antes de renderizar cada frame
const handle = delayRender("fonts");
Promise.all(
  ["400", "500", "600", "700", "800"].map((w) => document.fonts.load(`${w} 40px Manrope`, "ÁÂÍ abc")),
)
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));

const CL = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const ip = (f: number, i: [number, number], o: [number, number], ease = Easing.inOut(Easing.cubic)) =>
  interpolate(f, i, o, { ...CL, easing: ease });
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
