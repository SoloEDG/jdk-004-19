import type { GameDoc } from "../../../shared/types";
import { WIDTH, HEIGHT } from "../../../shared/types";
export function renderScene(ctx: CanvasRenderingContext2D, d: GameDoc) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);
  ctx.fillStyle = "#0a1019";
  ctx.fillRect(0, 0, WIDTH, HEIGHT);
  ctx.strokeStyle = "#172431";
  ctx.lineWidth = 0.6;
  for (let x = 0; x < WIDTH; x += 40) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, HEIGHT);
    ctx.stroke();
  }
  for (let y = 0; y < HEIGHT; y += 40) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(WIDTH, y);
    ctx.stroke();
  }
  ctx.strokeStyle = "#2d424d";
  ctx.setLineDash([6, 8]);
  ctx.strokeRect(28, 28, WIDTH - 56, HEIGHT - 56);
  ctx.setLineDash([]);
  ctx.strokeStyle = "#152c35";
  for (const r of [110, 220, 330]) {
    ctx.beginPath();
    ctx.arc(500, 325, r, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const drop of d.drops) {
    ctx.fillStyle =
      drop.kind === "xp"
        ? "#9eeaa6"
        : drop.kind === "heal"
          ? "#fc91aa"
          : "#8ac6ff";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 10;
    ctx.save();
    ctx.translate(drop.x, drop.y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-4, -4, 8, 8);
    ctx.restore();
  }
  ctx.shadowBlur = 0;
  for (const e of d.enemies) {
    const color =
      e.kind === "shooter"
        ? "#bb9eff"
        : e.kind === "elite"
          ? "#ffae70"
          : "#ed697b";
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    if (e.kind === "chaser") {
      ctx.moveTo(e.x, e.y - 12);
      ctx.lineTo(e.x + 11, e.y + 9);
      ctx.lineTo(e.x - 11, e.y + 9);
      ctx.closePath();
    } else {
      ctx.arc(e.x, e.y, e.radius, 0, Math.PI * 2);
    }
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#10121d";
    ctx.beginPath();
    ctx.arc(e.x, e.y, 4, 0, Math.PI * 2);
    ctx.fill();
    if (e.hp < e.maxHp) {
      ctx.fillStyle = "#ef7287";
      ctx.fillRect(e.x - 14, e.y - 22, (28 * e.hp) / e.maxHp, 2);
    }
  }
  for (const b of d.bullets) {
    ctx.fillStyle =
      b.owner === "enemy"
        ? "#ff827d"
        : b.weapon === "nova"
          ? "#ba9fff"
          : b.weapon === "orbit"
            ? "#f7cd79"
            : "#a7ffe1";
    ctx.shadowColor = ctx.fillStyle;
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  const p = d.player;
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.strokeStyle = "#9eeeb3";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = p.invincible > 0 ? 0.45 : 1;
  ctx.shadowColor = "#a9ffd7";
  ctx.shadowBlur = 24;
  ctx.fillStyle = "#cdfedc";
  ctx.beginPath();
  ctx.moveTo(0, -17);
  ctx.lineTo(12, 11);
  ctx.lineTo(0, 7);
  ctx.lineTo(-12, 11);
  ctx.closePath();
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#193b3b";
  ctx.fillRect(-3, -3, 6, 6);
  ctx.restore();
  ctx.fillStyle = "#526571";
  ctx.font = "10px monospace";
  ctx.fillText("SECTOR 07 / SIGNAL ACTIVE", 48, HEIGHT - 42);
  ctx.fillText(
    `${d.enemies.length.toString().padStart(3, "0")} HOSTILES`,
    WIDTH - 145,
    HEIGHT - 42,
  );
}
