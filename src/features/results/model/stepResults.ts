import type { GameDoc, FrameEvents } from "../../../shared/types";
import { applyEvents, makeRecord } from "./ledger";
import { saveRecords } from "../lib/storage";
export function stepResults(doc: GameDoc, events: FrameEvents): void {
  if (doc.phase === "ended") return;
  applyEvents(doc, events);
  if (doc.player.hp > 0 && !doc.victory) return;
  // End the run before persistence, making repeated animation frames idempotent.
  doc.phase = "ended";
  doc.choices = [];
  doc.notice = doc.victory ? "撤离成功 · 信号保全" : "信号中断 · 再次连接";
  doc.records = [makeRecord(doc), ...doc.records].slice(0, 20);
  saveRecords(doc.records);
}
