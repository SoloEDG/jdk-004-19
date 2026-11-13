import type { GameDoc, Enemy } from "../../../shared/types";
import { WIDTH, HEIGHT } from "../../../shared/types";
import { random } from "../../../shared/math";
import { ENEMY_CATALOG } from "../model/catalog";
export function spawnEnemy(doc: GameDoc): Enemy {
  const roll = random(doc);
  const kind: Enemy["kind"] =
    doc.wave >= 3 && roll < 0.08
      ? "elite"
      : doc.wave >= 2 && roll < 0.28
        ? "shooter"
        : "chaser";
  const data = ENEMY_CATALOG[kind],
    side = Math.floor(random(doc) * 4),
    along = random(doc);
  const x = side === 0 ? -28 : side === 1 ? WIDTH + 28 : along * WIDTH;
  const y = side === 2 ? -28 : side === 3 ? HEIGHT + 28 : along * HEIGHT;
  const hp = Math.round(data.hp * (1 + (doc.wave - 1) * 0.22));
  return {
    id: doc.nextId++,
    kind,
    x,
    y,
    hp,
    maxHp: hp,
    radius: data.radius,
    cooldown: 1 + random(doc),
  };
}
