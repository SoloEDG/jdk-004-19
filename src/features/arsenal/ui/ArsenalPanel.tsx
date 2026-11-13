import type { GameDoc, WeaponId } from "../../../shared/types";
const names: Record<WeaponId, [string, string, string]> = {
  pulse: ["脉冲射线", "PULSE RIFLE", "⌁"],
  orbit: ["轨道刃", "ORBITAL BLADE", "◎"],
  nova: ["新星爆发", "NOVA BURST", "✳"],
};
export function ArsenalPanel({ doc }: { doc: GameDoc }) {
  return (
    <section className="panel">
      <div className="section-caption">
        <span>武器系统</span>
        <span className="mono muted">{doc.weapons.length} / 3</span>
      </div>
      <div className="weapons">
        {(["pulse", "orbit", "nova"] as WeaponId[]).map((id) => {
          const w = doc.weapons.find((w) => w.id === id);
          return (
            <div className={`weapon ${w ? "" : "locked"}`} key={id}>
              <div className={`weapon-icon ${id}`}>{names[id][2]}</div>
              <div>
                <strong>{names[id][0]}</strong>
                <small>{names[id][1]}</small>
              </div>
              <span className="weapon-level">
                {w ? `Lv.${w.level}` : "未装配"}
              </span>
              {w && (
                <div className="level-pips">
                  {Array.from({ length: 5 }, (_, i) => (
                    <i key={i} className={i < w.level ? "active" : ""} />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="hint">
        ↗ 自动锁定最近目标
        <br />
        <span>升级时选择新武器，构筑你的火力组合。</span>
      </div>
    </section>
  );
}
