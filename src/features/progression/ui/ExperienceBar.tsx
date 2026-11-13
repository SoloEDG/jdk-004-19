import type { GameDoc } from "../../../shared/types";
import { xpRequired } from "../lib/experience";
export function ExperienceBar({ doc }: { doc: GameDoc }) {
  return (
    <div className="experience">
      <div className="xp-level mono">
        LV. {doc.level.toString().padStart(2, "0")}
      </div>
      <div className="xp-track">
        <i
          style={{
            width: `${Math.min(100, (doc.xp / xpRequired(doc.level)) * 100)}%`,
          }}
        />
      </div>
      <span className="mono">
        {doc.xp} / {xpRequired(doc.level)} XP
      </span>
    </div>
  );
}
