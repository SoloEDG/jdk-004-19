import type { GameDoc } from "../../../shared/types";
export const xpRequired = (level: number): number => 12 + (level - 1) * 7;
export function grantExperience(doc: GameDoc, value: number): void {
  doc.xp += value;
  while (doc.xp >= xpRequired(doc.level)) {
    doc.xp -= xpRequired(doc.level);
    doc.level++;
    doc.pendingLevels++;
  }
}
