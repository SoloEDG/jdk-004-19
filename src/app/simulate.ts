import type { GameDoc, Input } from "../shared/types";
import { stepCombat } from "../features/combat";
import { stepWaves } from "../features/waves";
import { stepArsenal } from "../features/arsenal";
import { stepProgression } from "../features/progression";
import { stepResults } from "../features/results";
export function simulate(doc: GameDoc, input: Input, dt: number) {
  if (doc.phase !== "playing") return;
  doc.time += dt;
  stepWaves(doc, dt);
  const shots = stepArsenal(doc, input, dt);
  const events = stepCombat(doc, input, dt);
  events.shots += shots;
  stepProgression(doc, events, dt);
  stepResults(doc, events);
}
