import type { GameDoc } from "../../../shared/types";
import { UPGRADE_CATALOG } from "../model/catalog";
export function UpgradeDialog({
  doc,
  choose,
}: {
  doc: GameDoc;
  choose: (id: string) => void;
}) {
  return (
    <div className="overlay">
      <div className="upgrade-dialog">
        <div className="eyebrow">EVOLUTION AVAILABLE</div>
        <h2>适应，然后生存。</h2>
        <p>等级 {doc.level} · 选择一项升级，战场时间已冻结</p>
        <div className="upgrade-options">
          {doc.choices.map((id) => {
            const u = UPGRADE_CATALOG.find((u) => u.id === id);
            if (!u) return null;
            return (
              <button key={id} onClick={() => choose(id)}>
                <span className="upgrade-symbol">✧</span>
                <small>{u.category}</small>
                <h3>{u.name}</h3>
                <p>{u.description}</p>
                <span className="choose-label">选择升级 ↗</span>
              </button>
            );
          })}
        </div>
        <small className="muted">
          武器与被动升级可叠加 · 同时获得多个等级会依次选择
        </small>
      </div>
    </div>
  );
}
