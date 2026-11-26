import { createContext, useContext } from "react";
import { DAYS, OFFSET } from "./theme";

// Toda a geometria do projeto, para o formato horizontal (1920×1080) e o vertical (1080×1920).
// Os tempos são os mesmos nos dois formatos (timing.ts).

const ROWS = Math.ceil((OFFSET + DAYS) / 7);

type Base = {
  W: number;
  H: number;
  vertical: boolean;
  btn: { cx: number; cy: number; size: number };
  handScale: number;
  title: { stacked: boolean; size: number; y0: number; y1: number; scale1: number };
  grid: { cellW: number; cellH: number; gap: number; x0: number; y0: number; dayFont: number; headerFont: number; centerScale: number; centerY: number };
  slab: { size: number; spacing: number };
  list: { x: number; w: number; rowH: number; gap: number; y0: number; nameSize: number; wdSize: number; textTop: number; badgeFont: number };
  dial: { cx: number; cy: number; R: number; recede: number };
  footer: { logoW: number; logoY: number };
  blobs: { x: number; y: number; r: number; color: string }[];
};

const make = (b: Base) => {
  const { cellW, cellH, gap, x0, y0 } = b.grid;
  const gridW = 7 * cellW + 6 * gap;
  const gridH = ROWS * cellH + (ROWS - 1) * gap;
  const gridCX = x0 + gridW / 2;
  const gridCY = y0 + gridH / 2;
  return {
    ...b,
    CX: b.W / 2,
    gridW,
    gridH,
    gridCX,
    gridCY,
    centerDX: b.W / 2 - gridCX,
    centerDY: b.grid.centerY - gridCY,
    cellRect: (day: number) => {
      const idx = OFFSET + day - 1;
      return { x: x0 + (idx % 7) * (cellW + gap), y: y0 + Math.floor(idx / 7) * (cellH + gap) };
    },
    rowY: (i: number) => b.list.y0 + i * (b.list.rowH + b.list.gap),
  };
};

export const HORIZONTAL = make({
  W: 1920,
  H: 1080,
  vertical: false,
  btn: { cx: 960, cy: 470, size: 230 },
  handScale: 0.62,
  title: { stacked: false, size: 196, y0: 540, y1: 132, scale1: 0.56 },
  grid: { cellW: 100, cellH: 88, gap: 12, x0: 150, y0: 298, dayFont: 30, headerFont: 19, centerScale: 1.18, centerY: 612 },
  slab: { size: 230, spacing: 40 },
  list: { x: 1010, w: 770, rowH: 104, gap: 22, y0: 292, nameSize: 44, wdSize: 17, textTop: 15, badgeFont: 46 },
  dial: { cx: 960, cy: 540, R: 430, recede: 1.12 },
  footer: { logoW: 500, logoY: 852 },
  blobs: [
    { x: 300, y: 200, r: 520, color: "rgba(150,130,255,0.35)" },
    { x: 1650, y: 880, r: 600, color: "rgba(60,200,190,0.25)" },
    { x: 1500, y: 140, r: 380, color: "rgba(224,82,156,0.16)" },
  ],
});

export const VERTICAL = make({
  W: 1080,
  H: 1920,
  vertical: true,
  btn: { cx: 540, cy: 820, size: 260 },
  handScale: 0.72,
  title: { stacked: true, size: 205, y0: 900, y1: 362, scale1: 0.49 },
  grid: { cellW: 118, cellH: 98, gap: 10, x0: 97, y0: 560, dayFont: 32, headerFont: 21, centerScale: 1, centerY: 1000 },
  slab: { size: 190, spacing: 28 },
  list: { x: 97, w: 886, rowH: 88, gap: 12, y0: 1146, nameSize: 40, wdSize: 15, textTop: 12, badgeFont: 42 },
  dial: { cx: 540, cy: 960, R: 400, recede: 1 },
  footer: { logoW: 440, logoY: 1590 },
  blobs: [
    { x: 160, y: 320, r: 520, color: "rgba(150,130,255,0.35)" },
    { x: 940, y: 1640, r: 620, color: "rgba(60,200,190,0.25)" },
    { x: 900, y: 180, r: 380, color: "rgba(224,82,156,0.16)" },
  ],
});

export type Layout = typeof HORIZONTAL;
export const LayoutCtx = createContext<Layout>(HORIZONTAL);
export const useLayout = () => useContext(LayoutCtx);
