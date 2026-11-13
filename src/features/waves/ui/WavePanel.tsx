import type { GameDoc } from "../../../shared/types";
export function WavePanel({ doc }: { doc: GameDoc }) {
  return (
    <section className="panel">
      <div className="section-caption">
        <span>波次进程</span>
        <span className="badge">8 WAVES</span>
      </div>
      <div className="wave-num mono">
        {Math.max(1, doc.wave).toString().padStart(2, "0")}
        <span>/ 08</span>
      </div>
      <div className="wave-steps">
        {Array.from({ length: 8 }, (_, i) => (
          <i key={i} className={i < Math.max(1, doc.wave) ? "active" : ""} />
        ))}
      </div>
      <div className="section-caption muted">
        <span>
          {doc.wave < 3
            ? "外围侦察群"
            : doc.wave < 6
              ? "重装突击群"
              : "深空精英群"}
        </span>
        <span className="mono">
          {Math.max(0, 30 - doc.waveTime).toFixed(0)}s
        </span>
      </div>
      <div className="bar">
        <i style={{ width: `${(doc.waveTime / 30) * 100}%` }} />
      </div>
      <p className="tiny">每 30 秒进入新波次。撑过第八波，完成撤离。</p>
    </section>
  );
}
