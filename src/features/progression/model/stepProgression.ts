import type { GameDoc, FrameEvents } from "../../../shared/types";
import { generateDrops, collectDrops } from "../lib/drops";
import { rollChoices } from "./choices";
export function stepProgression(
  doc: GameDoc,
  events: FrameEvents,
  dt: number,
): void {
  generateDrops(doc, events);
  collectDrops(doc, events, dt);
  if (
    doc.pendingLevels > 0 &&
    doc.phase === "playing" &&
    doc.player.hp > 0 &&
    !doc.victory
  )
    rollChoices(doc);
}
