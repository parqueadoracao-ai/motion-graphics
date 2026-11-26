export const C = {
  text: "#F5F7FA",
  soft: "#AEB8C8",
  amber: "#FFC24B",
  pink: "#FF5C7A",
  violet: "#9B6BFF",
  blue: "#4F8CFF",
  green: "#2FD3A5",
};
// gradiente-assinatura: crepúsculo (âmbar → rosa → violeta)
export const DUSK = `linear-gradient(100deg, ${C.amber} 0%, ${C.pink} 50%, ${C.violet} 100%)`;

const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * t)).join(",")})`;
};
// cor sólida ao longo do gradiente DUSK (t de 0 a 1), para letras animadas individualmente
export const duskAt = (t: number) => (t < 0.5 ? mix(C.amber, C.pink, t * 2) : mix(C.pink, C.violet, (t - 0.5) * 2));
