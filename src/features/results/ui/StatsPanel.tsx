import type { GameDoc } from "../../../shared/types";
export function StatsPanel({ doc }: { doc: GameDoc }) {
  return (
    <section className="panel stats">
      <div className="section-caption">
        <span>本局遥测</span>
        <span className="status-dot" />
      </div>
      <div className="stat-row">
        <span>击败敌人</span>
        <strong className="mono">
          {doc.stats.kills.toString().padStart(3, "0")}
        </strong>
      </div>
      <div className="stat-row">
        <span>累计伤害</span>
        <strong className="mono">
          {Math.round(doc.stats.damage).toLocaleString()}
        </strong>
      </div>
      <div className="stat-row">
        <span>拾取能量</span>
        <strong className="mono">{doc.stats.collected}</strong>
      </div>
      <div className="stat-row">
        <span>已受伤害</span>
        <strong className="mono">{Math.round(doc.stats.taken)}</strong>
      </div>
    </section>
  );
}
