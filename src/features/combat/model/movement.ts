import type { GameDoc, Input, Vec } from "../../../shared/types";
import { WIDTH, HEIGHT } from "../../../shared/types";
import { clamp, normalize } from "../../../shared/math";

/** 惯性机动的基础参数。冲刺距离只由速度与持续时间决定，与帧率无关。 */
export const ACCELERATION = 1400;
export const FRICTION = 1200;
export const DASH_SPEED = 720;
export const DASH_DURATION = 0.18;
export const DASH_COOLDOWN = 1.4;
/** 冲刺结束后短暂保留“虚拟位置”，用于统计随后到达的弹幕是否本会命中。 */
export const DODGE_WINDOW = 0.6;
export const TRAIL_MAX = 7;

/** 机动强化「机动核心」：每层提升加速度与冲刺冷却恢复。 */
export function accelerationScale(doc: GameDoc): number {
  return 1 + (doc.upgrades.agility || 0) * 0.18;
}
export function recoveryScale(doc: GameDoc): number {
  return 1 + (doc.upgrades.agility || 0) * 0.15;
}

export interface MovementResult {
  /** 本帧冲刺触发次数（0 或 1）。 */
  dashStarted: number;
  /** 机动前位置，用于把整条冲刺轨迹交给弹幕碰撞。 */
  from: Vec;
  /**
   * 冲刺及其短暂判定窗口内，角色“若不冲刺”本应停留/到达的位置。
   * 用于识别冲刺真正避开的有效攻击；窗口外为 undefined。
   */
  ghost?: Vec;
}

/**
 * 切换移动方式时保留角色位置，同时清空惯性与冲刺状态，
 * 避免切到经典模式后因残留速度滑出安全区域。
 */
export function setMovementMode(doc: GameDoc, mode: GameDoc["player"]["movement"]): void {
  const player = doc.player;
  if (player.movement === mode) return;
  player.movement = mode;
  player.vx = 0;
  player.vy = 0;
  player.dashTime = 0;
  player.dodgeWindow = 0;
  player.trail = [];
  player.x = clamp(player.x, player.radius, WIDTH - player.radius);
  player.y = clamp(player.y, player.radius, HEIGHT - player.radius);
}

function startDash(player: GameDoc["player"], input: Input): boolean {
  if (player.dashCooldown > 0 || player.dashTime > 0) return false;
  const length = Math.hypot(input.x, input.y);
  const dir =
    length > 0
      ? normalize(input.x, input.y)
      : normalize(player.dashDirx, player.dashDiry);
  player.dashDirx = dir.x;
  player.dashDiry = dir.y;
  player.dashTime = DASH_DURATION;
  player.dashCooldown = DASH_COOLDOWN;
  player.dodgeWindow = DASH_DURATION + DODGE_WINDOW;
  // 虚拟轨迹从冲刺起点开始独立推进。
  player.ghostX = player.x;
  player.ghostY = player.y;
  player.vx = dir.x * DASH_SPEED;
  player.vy = dir.y * DASH_SPEED;
  return true;
}

/** 冲刺被边界截断时，按剩余冲刺时间等比返还冷却。 */
function truncateAgainstWall(player: GameDoc["player"], spent: number): void {
  const minX = player.radius,
    maxX = WIDTH - player.radius,
    minY = player.radius,
    maxY = HEIGHT - player.radius;
  const hitWall = player.x <= minX || player.x >= maxX || player.y <= minY || player.y >= maxY;
  if (!hitWall) return;
  player.x = clamp(player.x, minX, maxX);
  player.y = clamp(player.y, minY, maxY);
  const leftover = Math.max(0, player.dashTime - spent);
  if (leftover > 0) {
    // 剩余时间折算回冷却，恢复速率由机动强化决定，这里返还原始秒数。
    player.dashCooldown = Math.max(0, player.dashCooldown - leftover);
  }
  player.dashTime = 0;
  player.vx = 0;
  player.vy = 0;
}

export function stepMovement(
  doc: GameDoc,
  input: Input,
  dt: number,
): MovementResult {
  const player = doc.player;
  const from: Vec = { x: player.x, y: player.y };
  const result: MovementResult = { dashStarted: 0, from };

  // 升级（以及任何非 playing 状态）期间速度与冷却都冻结；dt 为 0 时也安全。
  const frozen = doc.phase !== "playing";
  if (!frozen && dt > 0) {
    if (input.dash && startDash(player, input)) {
      result.dashStarted = 1;
    } else if (player.dashCooldown > 0) {
      player.dashCooldown = Math.max(0, player.dashCooldown - dt * recoveryScale(doc));
    }
  }

  if (frozen) return result;

  // 冲刺及其结束后的判定窗口内，维护“若不冲刺角色本应在的位置”。
  if (player.dodgeWindow > 0) {
    player.dodgeWindow = Math.max(0, player.dodgeWindow - dt);
    const ghost = ghostPosition(doc, input, dt);
    player.ghostX = ghost.x;
    player.ghostY = ghost.y;
    result.ghost = { x: player.ghostX, y: player.ghostY };
  }

  if (player.dashTime > 0) {
    const spent = Math.min(dt, player.dashTime);
    player.dashTime = Math.max(0, player.dashTime - dt);
    player.x += player.dashDirx * DASH_SPEED * spent;
    player.y += player.dashDiry * DASH_SPEED * spent;
    truncateAgainstWall(player, spent);
    if (player.dashTime === 0) {
      // 自然结束冲刺时保留一个较小的冲量，交给惯性/摩擦收敛。
      player.vx = player.dashDirx * player.speed * 0.6;
      player.vy = player.dashDiry * player.speed * 0.6;
    }
    pushTrail(player, { x: player.x, y: player.y });
    return result;
  }

  if (player.movement === "classic") {
    // 经典模式即旧的固定速度移动，完全不使用惯性。
    const direction = normalize(input.x, input.y),
      strength = Math.min(1, Math.hypot(input.x, input.y));
    player.x = clamp(
      player.x + direction.x * strength * player.speed * dt,
      player.radius,
      WIDTH - player.radius,
    );
    player.y = clamp(
      player.y + direction.y * strength * player.speed * dt,
      player.radius,
      HEIGHT - player.radius,
    );
    player.vx = 0;
    player.vy = 0;
    pushTrail(player, { x: player.x, y: player.y });
    return result;
  }

  // 惯性模式：加速度推动速度，松键时摩擦衰减，撞墙后消除对应方向速度。
  const accel = ACCELERATION * accelerationScale(doc);
  const length = Math.hypot(input.x, input.y);
  if (length > 0) {
    const dir = normalize(input.x, input.y);
    player.vx += dir.x * accel * dt;
    player.vy += dir.y * accel * dt;
  } else {
    const speed = Math.hypot(player.vx, player.vy);
    const drop = FRICTION * dt;
    if (speed <= drop) {
      player.vx = 0;
      player.vy = 0;
    } else {
      const scale = (speed - drop) / speed;
      player.vx *= scale;
      player.vy *= scale;
    }
  }
  const speed = Math.hypot(player.vx, player.vy);
  if (speed > player.speed) {
    const scale = player.speed / speed;
    player.vx *= scale;
    player.vy *= scale;
  }
  const nextX = clamp(player.x + player.vx * dt, player.radius, WIDTH - player.radius);
  const nextY = clamp(player.y + player.vy * dt, player.radius, HEIGHT - player.radius);
  if (nextX === player.radius || nextX === WIDTH - player.radius) player.vx = 0;
  if (nextY === player.radius || nextY === HEIGHT - player.radius) player.vy = 0;
  player.x = nextX;
  player.y = nextY;
  pushTrail(player, { x: player.x, y: player.y });
  return result;
}

/** 模拟取消冲刺后的常规移动，从虚拟位置持续推进，得到本帧的“虚拟位置”。 */
function ghostPosition(doc: GameDoc, input: Input, dt: number): Vec {
  const player = doc.player;
  // 窗口刚开启的第一帧以真实位置为基准，之后沿虚拟轨迹独立推进。
  const baseX =
    player.dodgeWindow > 0 && Number.isFinite(player.ghostX)
      ? player.ghostX
      : player.x;
  const baseY =
    player.dodgeWindow > 0 && Number.isFinite(player.ghostY)
      ? player.ghostY
      : player.y;
  const direction = normalize(input.x, input.y),
    strength = Math.min(1, Math.hypot(input.x, input.y));
  return {
    x: clamp(
      baseX + direction.x * strength * player.speed * dt,
      player.radius,
      WIDTH - player.radius,
    ),
    y: clamp(
      baseY + direction.y * strength * player.speed * dt,
      player.radius,
      HEIGHT - player.radius,
    ),
  };
}

function pushTrail(player: GameDoc["player"], point: Vec): void {
  const last = player.trail[player.trail.length - 1];
  if (last && last.x === point.x && last.y === point.y) return;
  player.trail.push(point);
  if (player.trail.length > TRAIL_MAX) player.trail.shift();
}
