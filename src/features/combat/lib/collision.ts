import type { Vec } from "../../../shared/types";
/** Swept circle test keeps fast projectiles from tunneling through enemies. */
export function segmentDistance(point: Vec, from: Vec, to: Vec): number {
  const dx = to.x - from.x,
    dy = to.y - from.y,
    length = dx * dx + dy * dy;
  const t = length
    ? Math.max(
        0,
        Math.min(
          1,
          ((point.x - from.x) * dx + (point.y - from.y) * dy) / length,
        ),
      )
    : 0;
  return Math.hypot(point.x - from.x - t * dx, point.y - from.y - t * dy);
}
