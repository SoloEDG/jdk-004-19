import type { GameDoc } from "../../../shared/types";
export function hurtPlayer(doc: GameDoc, damage: number): number {
  if (doc.player.invincible > 0 || doc.player.hp <= 0) return 0;
  const armor = doc.upgrades.armor || 0;
  const taken = Math.min(
    doc.player.hp,
    Math.max(1, damage * (1 - armor * 0.12)),
  );
  doc.player.hp -= taken;
  doc.player.invincible = 0.65;
  return taken;
}
