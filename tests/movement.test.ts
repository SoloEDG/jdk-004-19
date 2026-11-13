import { test } from "node:test";
import assert from "node:assert/strict";
import { createRun } from "../src/shared/createRun";
import { stepCombat } from "../src/features/combat";
import { simulate } from "../src/app/simulate";
import {
  stepMovement,
  setMovementMode,
  DASH_DURATION,
  DASH_SPEED,
  DASH_COOLDOWN,
} from "../src/features/combat/model/movement";
import { segmentToSegmentDistance } from "../src/features/combat/lib/collision";
import { WIDTH, HEIGHT } from "../src/shared/types";
import type { Input, Bullet } from "../src/shared/types";

const moveInput = (over: Partial<Input> = {}): Input => ({
  x: 0,
  y: 0,
  aim: { x: 0, y: 0 },
  firing: false,
  dash: false,
  ...over,
});

const enemyBullet = (x: number, y: number, vx: number, vy: number): Bullet => ({
  id: 999,
  x,
  y,
  vx,
  vy,
  radius: 5,
  damage: 10,
  life: 5,
  owner: "enemy",
  weapon: "enemy",
  pierce: 0,
  hit: [],
  dodged: false,
});

/** 跑完一次完整冲刺（以固定 60fps 步长），返回累计位移。 */
function runDash(frames: number, dt = 1 / 60) {
  const d = createRun();
  d.phase = "playing";
  let x = d.player.x;
  for (let i = 0; i < frames; i++) {
    stepMovement(d, moveInput({ x: 1, y: 0, dash: i === 0 }), dt);
  }
  return d.player.x - x;
}

test("dash covers a fixed distance regardless of frame rate", () => {
  const frames60 = Math.ceil(DASH_DURATION / (1 / 60));
  const distance60 = runDash(frames60, 1 / 60);
  const frames30 = Math.ceil(DASH_DURATION / (1 / 30));
  const distance30 = runDash(frames30, 1 / 30);
  const expected = DASH_SPEED * DASH_DURATION;
  assert.ok(Math.abs(distance60 - expected) < 1, `60fps distance ${distance60}`);
  assert.ok(Math.abs(distance30 - expected) < 1, `30fps distance ${distance30}`);
  assert.ok(Math.abs(distance60 - distance30) < 1);
});

test("diagonal input does not produce a longer dash", () => {
  const horizontal = runDash(Math.ceil(DASH_DURATION / (1 / 60)));
  const d = createRun();
  d.phase = "playing";
  const start = { x: d.player.x, y: d.player.y };
  const frames = Math.ceil(DASH_DURATION / (1 / 60));
  for (let i = 0; i < frames; i++) {
    stepMovement(d, moveInput({ x: 1, y: 1, dash: i === 0 }), 1 / 60);
  }
  const diagonal = Math.hypot(d.player.x - start.x, d.player.y - start.y);
  assert.ok(Math.abs(diagonal - horizontal) < 1);
  // 对角分量各为水平冲刺的约 1/√2。
  assert.ok(Math.abs(d.player.x - start.x - horizontal / Math.SQRT2) < 1);
});

test("inertia mode accelerates toward target speed and friction stops it", () => {
  const d = createRun();
  d.phase = "playing";
  for (let i = 0; i < 10; i++) stepMovement(d, moveInput({ x: 1 }), 1 / 60);
  assert.ok(d.player.vx > 0);
  assert.ok(d.player.vx <= d.player.speed);
  // 松开按键后摩擦逐步把速度降到零。
  for (let i = 0; i < 60; i++) stepMovement(d, moveInput(), 1 / 60);
  assert.equal(d.player.vx, 0);
  assert.equal(d.player.vy, 0);
});

test("classic mode matches the old fixed-speed movement and has no inertia", () => {
  const d = createRun();
  d.phase = "playing";
  setMovementMode(d, "classic");
  const startX = d.player.x;
  stepMovement(d, moveInput({ x: 1 }), 1 / 60);
  assert.ok(Math.abs(d.player.x - (startX + d.player.speed / 60)) < 1e-9);
  assert.equal(d.player.vx, 0);
  assert.equal(d.player.vy, 0);
});

test("switching movement mode keeps position but clears inertia", () => {
  const d = createRun();
  d.phase = "playing";
  for (let i = 0; i < 8; i++) stepMovement(d, moveInput({ x: 1 }), 1 / 60);
  assert.ok(d.player.vx > 0);
  const pos = { x: d.player.x, y: d.player.y };
  setMovementMode(d, "classic");
  assert.equal(d.player.x, pos.x);
  assert.equal(d.player.y, pos.y);
  assert.equal(d.player.vx, 0);
  assert.equal(d.player.vy, 0);
  // 切回惯性也保持位置且无残留速度。
  setMovementMode(d, "inertia");
  assert.equal(d.player.x, pos.x);
  assert.equal(d.player.vx, 0);
});

test("hitting the boundary truncates the dash and refunds cooldown for the leftover time", () => {
  const d = createRun();
  d.phase = "playing";
  d.player.x = WIDTH - d.player.radius - 5;
  stepMovement(d, moveInput({ x: 1, dash: true }), 1 / 60);
  assert.equal(d.player.x, WIDTH - d.player.radius);
  assert.equal(d.player.dashTime, 0);
  // 冲刺在第一帧就被截断，大量剩余时间被返还，冷却明显小于完整值。
  assert.ok(d.player.dashCooldown < DASH_COOLDOWN);
  assert.ok(d.player.dashCooldown < DASH_COOLDOWN - DASH_DURATION / 2);
});

test("cooldown and speed freeze while an upgrade choice is open", () => {
  const d = createRun();
  d.phase = "playing";
  stepMovement(d, moveInput({ x: 1, dash: true }), 1 / 60);
  const cooldown = d.player.dashCooldown;
  const x = d.player.x;
  d.phase = "upgrade";
  for (let i = 0; i < 30; i++) stepMovement(d, moveInput({ x: 1 }), 1 / 60);
  assert.equal(d.player.dashCooldown, cooldown);
  assert.equal(d.player.x, x);
  assert.equal(d.player.y, 325);
});

test("agility upgrade raises acceleration and cooldown recovery rate", () => {
  const base = createRun();
  base.phase = "playing";
  const boosted = createRun();
  boosted.phase = "playing";
  boosted.upgrades.agility = 2;
  for (let i = 0; i < 4; i++) {
    stepMovement(base, moveInput({ x: 1 }), 1 / 60);
    stepMovement(boosted, moveInput({ x: 1 }), 1 / 60);
  }
  assert.ok(boosted.player.vx > base.player.vx);
  // 触发冲刺后比较冷却恢复。
  stepMovement(base, moveInput({ x: 1, dash: true }), 1 / 60);
  stepMovement(boosted, moveInput({ x: 1, dash: true }), 1 / 60);
  const c0 = base.player.dashCooldown;
  for (let i = 0; i < 20; i++) {
    stepMovement(base, moveInput(), 1 / 60);
    stepMovement(boosted, moveInput(), 1 / 60);
  }
  assert.ok(boosted.player.dashCooldown < base.player.dashCooldown);
  assert.ok(base.player.dashCooldown < c0);
});

test("continuous trajectory collision catches a bullet that tunnels through frame-end positions", () => {
  // 玩家与高速弹幕在帧内交叉，但帧末都不在彼此半径内。
  const a0 = { x: 0, y: 0 },
    a1 = { x: 100, y: 0 };
  const b0 = { x: 50, y: -60 },
    b1 = { x: 50, y: 60 };
  assert.equal(segmentToSegmentDistance(a0, a1, b0, b1), 0);
});

test("dashing away counts a dodged effective attack instead of damage", () => {
  const d = createRun();
  d.phase = "playing";
  const hpBefore = d.player.hp;
  // 弹幕从侧面向玩家初始高度飞来；玩家第一帧向上冲刺脱离。
  // 弹幕稍后抵达时，真实轨迹已避开，而“不冲刺的虚拟位置”仍会被命中。
  d.bullets = [enemyBullet(d.player.x - 90, d.player.y, 360, 0)];
  let dodged = 0,
    taken = 0;
  for (let i = 0; i < 16; i++) {
    // 仅冲刺帧给出方向，之后松开按键：虚拟位置停在原地，真实机体靠惯性继续脱离。
    const e = stepCombat(d, moveInput(i === 0 ? { y: -1, dash: true } : {}), 1 / 60);
    dodged += e.dodged;
    taken += e.taken;
  }
  assert.equal(taken, 0);
  assert.ok(dodged >= 1);
  assert.equal(d.player.hp, hpBefore);
});

test("a bullet actually crossing the dash path still deals damage", () => {
  const d = createRun();
  d.phase = "playing";
  d.player.invincible = 0;
  // 弹幕缓慢下移，其整段轨迹与横向冲刺路径相交，连续扫掠必须命中而不是漏判。
  d.bullets = [enemyBullet(d.player.x, d.player.y - 20, 0, 240)];
  const events = stepCombat(d, moveInput({ x: 1, dash: true }), 1 / 60);
  assert.ok(events.taken > 0);
  assert.equal(events.dodged, 0);
});

test("dash cannot trigger again while cooldown is active", () => {
  const d = createRun();
  d.phase = "playing";
  const first = stepMovement(d, moveInput({ x: 1, dash: true }), 1 / 60);
  assert.equal(first.dashStarted, 1);
  const second = stepMovement(d, moveInput({ x: 1, dash: true }), 1 / 60);
  assert.equal(second.dashStarted, 0);
});

test("full simulation aggregates dash and dodge stats into run totals", () => {
  const d = createRun();
  d.phase = "playing";
  d.bullets = [enemyBullet(d.player.x - 90, d.player.y, 360, 0)];
  for (let i = 0; i < 16; i++)
    simulate(d, moveInput(i === 0 ? { y: -1, dash: true } : {}), 1 / 60);
  assert.equal(d.stats.dashes, 1);
  assert.ok(d.stats.dodged >= 1);
});

test("simulation stays inside the arena while dashing from any direction", () => {
  const d = createRun();
  d.phase = "playing";
  d.player.x = d.player.radius;
  d.player.y = HEIGHT - d.player.radius;
  for (let i = 0; i < 20; i++)
    stepMovement(d, moveInput({ x: -1, y: 1, dash: i === 0 }), 1 / 60);
  assert.ok(d.player.x >= d.player.radius);
  assert.ok(d.player.y <= HEIGHT - d.player.radius);
});
