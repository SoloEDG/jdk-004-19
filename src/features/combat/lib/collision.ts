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

function pointToSegmentDistance(point: Vec, from: Vec, to: Vec): number {
  return segmentDistance(point, from, to);
}

/**
 * 两条运动轨迹（线段）之间的最小距离。
 * 冲刺时角色与弹幕都在移动，用连续扫掠而非帧末点判定，
 * 避免高速穿过弹幕时随机漏判。
 */
export function segmentToSegmentDistance(a0: Vec, a1: Vec, b0: Vec, b1: Vec): number {
  const ux = a1.x - a0.x,
    uy = a1.y - a0.y;
  const vx = b1.x - b0.x,
    vy = b1.y - b0.y;
  const lenA = ux * ux + uy * uy;
  const lenB = vx * vx + vy * vy;
  // 退化为点的线段直接用点到线段距离，保证零位移帧也正确。
  if (lenA === 0) return pointToSegmentDistance(a0, b0, b1);
  if (lenB === 0) return pointToSegmentDistance(b0, a0, a1);
  const wx = a0.x - b0.x,
    wy = a0.y - b0.y;
  const a = lenA;
  const b = ux * vx + uy * vy;
  const c = lenB;
  const d = ux * wx + uy * wy;
  const e = vx * wx + vy * wy;
  const denom = a * c - b * b;
  let sN: number,
    sD = denom,
    tN: number,
    tD = denom;
  if (denom !== 0) {
    sN = b * e - c * d;
    tN = a * e - b * d;
    if (sN < 0) {
      sN = 0;
      tN = e;
      tD = c;
    } else if (sN > sD) {
      sN = sD;
      tN = e + b;
      tD = c;
    }
  } else {
    sN = 0;
    sD = 1;
    tN = e;
    tD = c;
  }
  if (tN < 0) {
    tN = 0;
    if (-d < 0) sN = 0;
    else if (-d > a) sN = sD;
    else {
      sN = -d;
      sD = a;
    }
  } else if (tN > tD) {
    tN = tD;
    const bp = -d + b;
    if (bp < 0) sN = 0;
    else if (bp > a) sN = sD;
    else {
      sN = bp;
      sD = a;
    }
  }
  const s = sN / sD;
  const t = tN / tD;
  const px = a0.x + s * ux - (b0.x + t * vx);
  const py = a0.y + s * uy - (b0.y + t * vy);
  return Math.hypot(px, py);
}

