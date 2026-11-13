import type { Vec, GameDoc } from "./types";
export const clamp = (v: number, min: number, max: number) =>
  Math.max(min, Math.min(max, v));
export const distance = (a: Vec, b: Vec) => Math.hypot(a.x - b.x, a.y - b.y);
export function random(doc: GameDoc) {
  doc.seed = (Math.imul(doc.seed, 1664525) + 1013904223) >>> 0;
  return doc.seed / 4294967296;
}
export const normalize = (x: number, y: number): Vec => {
  const n = Math.hypot(x, y) || 1;
  return { x: x / n, y: y / n };
};
export function formatTime(t: number) {
  return `${Math.floor(t / 60)
    .toString()
    .padStart(2, "0")}:${Math.floor(t % 60)
    .toString()
    .padStart(2, "0")}`;
}
