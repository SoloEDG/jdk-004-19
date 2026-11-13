import type { GameDoc, Input, FrameEvents } from "../../../shared/types";
import { WIDTH, HEIGHT } from "../../../shared/types";
import { distance } from "../../../shared/math";
import { segmentDistance, segmentToSegmentDistance } from "../lib/collision";
import { hurtPlayer } from "./health";
import { stepMovement } from "./movement";
export function stepCombat(
  doc: GameDoc,
  input: Input,
  dt: number,
): FrameEvents {
  const events: FrameEvents = {
    kills: [],
    damage: 0,
    taken: 0,
    shots: 0,
    collected: 0,
    dashes: 0,
    dodged: 0,
    weaponDamage: {},
  };
  const player = doc.player;
  player.invincible = Math.max(0, player.invincible - dt);

  // 机动（惯性 / 冲刺 / 经典移动）统一在这里结算，返回完整位移轨迹。
  const move = stepMovement(doc, input, dt);
  events.dashes = move.dashStarted;
  const playerFrom = move.from;
  const playerTo = { x: player.x, y: player.y };

  for (const bullet of doc.bullets) {
    const previous = { x: bullet.x, y: bullet.y };
    bullet.x += bullet.vx * dt;
    bullet.y += bullet.vy * dt;
    bullet.life -= dt;
    if (bullet.life < 0) continue;
    if (bullet.owner === "enemy") {
      // 连续轨迹碰撞：检查整条角色路径与整条弹幕路径，而非仅帧末位置。
      const hit =
        segmentToSegmentDistance(playerFrom, playerTo, previous, bullet) <
        player.radius + bullet.radius;
      if (hit) {
        events.taken += hurtPlayer(doc, bullet.damage);
        bullet.life = -1;
        continue;
      }
      // 冲刺及其判定窗口内，若“不冲刺的虚拟位置”本会被命中，则记为规避的有效攻击。
      if (
        move.ghost &&
        !bullet.dodged &&
        segmentDistance(move.ghost, previous, bullet) <
          player.radius + bullet.radius
      ) {
        bullet.dodged = true;
        events.dodged++;
      }
      continue;
    }
    for (const enemy of doc.enemies) {
      if (enemy.hp <= 0 || bullet.hit.includes(enemy.id)) continue;
      if (
        segmentDistance(enemy, previous, bullet) >
        enemy.radius + bullet.radius
      )
        continue;
      bullet.hit.push(enemy.id);
      const damage = Math.min(enemy.hp, bullet.damage);
      enemy.hp -= damage;
      events.damage += damage;
      if (bullet.weapon !== "enemy")
        events.weaponDamage![bullet.weapon] =
          (events.weaponDamage![bullet.weapon] || 0) + damage;
      if (enemy.hp <= 0)
        events.kills.push({
          enemy: { ...enemy },
          weapon: bullet.weapon === "enemy" ? "pulse" : bullet.weapon,
        });
      if (bullet.pierce <= 0) {
        bullet.life = -1;
        break;
      }
      bullet.pierce--;
    }
  }
  for (const enemy of doc.enemies) {
    if (enemy.hp > 0 && distance(enemy, player) < enemy.radius + player.radius)
      events.taken += hurtPlayer(doc, enemy.kind === "elite" ? 25 : 12);
  }
  doc.enemies = doc.enemies.filter((e) => e.hp > 0);
  doc.bullets = doc.bullets.filter(
    (b) =>
      b.life >= 0 &&
      b.x > -120 &&
      b.x < WIDTH + 120 &&
      b.y > -120 &&
      b.y < HEIGHT + 120,
  );
  return events;
}
