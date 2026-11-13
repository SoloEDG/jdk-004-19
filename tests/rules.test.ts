import { test } from "node:test";
import assert from "node:assert/strict";
import { createRun } from "../src/shared/createRun";
import { simulate } from "../src/app/simulate";
test("pause freezes all simulation including bullets, drops, waves and cooldowns", () => {
  const d = createRun();
  d.phase = "paused";
  const before = JSON.stringify(d);
  simulate(d, { x: 1, y: 0, aim: { x: 0, y: 0 }, firing: true }, 1 / 60);
  assert.equal(JSON.stringify(d), before);
});
test("playing advances battle time and wave", () => {
  const d = createRun();
  d.phase = "playing";
  simulate(d, { x: 0, y: 0, aim: { x: 0, y: 0 }, firing: false }, 1 / 60);
  assert.ok(d.time > 0);
  assert.equal(d.wave, 1);
});
