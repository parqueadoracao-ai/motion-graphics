import { continueRender, delayRender, staticFile } from "remotion";

// Fontes (SIL Open Font License) servidas de public/fonts — sem depender da rede no render
export const SERIF = "Instrument Serif";
export const SANS = "Manrope";

const faces = [
  new FontFace(SERIF, `url(${staticFile("fonts/InstrumentSerif-Regular.woff2")}) format("woff2")`, { style: "normal", weight: "400" }),
  new FontFace(SERIF, `url(${staticFile("fonts/InstrumentSerif-Italic.woff2")}) format("woff2")`, { style: "italic", weight: "400" }),
  new FontFace(SANS, `url(${staticFile("fonts/Manrope-latin.woff2")}) format("woff2")`, { style: "normal", weight: "200 800" }),
];

const handle = delayRender("Carregando fontes");
Promise.all(faces.map((f) => f.load()))
  .then((loaded) => {
    loaded.forEach((f) => document.fonts.add(f));
    continueRender(handle);
  })
  .catch((err) => {
    console.error(err);
    continueRender(handle);
  });
