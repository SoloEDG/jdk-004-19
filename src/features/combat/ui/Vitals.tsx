import type { GameDoc } from "../../../shared/types";
export function Vitals({ doc }: { doc: GameDoc }) {
  return (
    <div className="vitals">
      <div className="section-caption">
        <span>机体完整度</span>
        <span className="mono">
          {Math.ceil(doc.player.hp)} <small>/ {doc.player.maxHp}</small>
        </span>
      </div>
      <div className="bar health">
        <i style={{ width: `${(doc.player.hp / doc.player.maxHp) * 100}%` }} />
      </div>
      <div className="vitals-foot">
        <span className="status-dot" />{" "}
        {doc.player.hp > 30 ? "生命信号稳定" : "警告 · 装甲受损"}
        <span>MK.01</span>
      </div>
    </div>
  );
}
