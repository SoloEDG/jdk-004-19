import { useState } from "react";
import {
  Activity,
  ArrowUpRight,
  Crosshair,
  Pause,
  Play,
  RotateCcw,
  Radio,
  History,
  Volume2,
  VolumeX,
} from "lucide-react";
import { useGame } from "./useGame";
import { Battlefield, Vitals } from "../features/combat";
import { WavePanel } from "../features/waves";
import { ArsenalPanel } from "../features/arsenal";
import { UpgradeDialog, ExperienceBar } from "../features/progression";
import { StatsPanel, ResultDialog, HistoryPanel } from "../features/results";
import { formatTime } from "../shared/math";
import { useAudio } from "./useAudio";
export function App() {
  const { game, input, start, toggle, choose, restart } = useGame();
  const d = game.current;
  const [history, setHistory] = useState(false);
  const [help, setHelp] = useState(false);
  const { muted, setMuted } = useAudio(d);
  const openHistory = () => {
    if (d.phase === "playing") d.phase = "paused";
    setHistory(true);
  };
  return (
    <div className="app-shell">
      <header>
        <a className="brand" href="#">
          <span className="brand-mark">
            <Radio size={23} />
          </span>
          <div>
            VOID SIGNAL<small>虚 空 信 号</small>
          </div>
        </a>
        <nav>
          <span className="nav-active">
            <Crosshair size={15} /> 生存行动
          </span>
          <button onClick={openHistory}>
            <History size={15} /> 行动档案
          </button>
        </nav>
        <div className="header-right">
          <span className="status-dot" /> SYSTEM ONLINE{" "}
          <span className="version">v.1.0</span>
        </div>
      </header>
      <main>
        <div className="page-heading">
          <div>
            <div className="eyebrow">OPERATIONS / SECTOR 07</div>
            <h1>
              最后一道信号<span> / THE LAST TRANSMISSION</span>
            </h1>
            <p>在无尽的敌潮中，找到属于你的生存频率。</p>
          </div>
          <button
            className="outline"
            onClick={() => {
              if (d.phase === "playing") d.phase = "paused";
              setHelp(true);
            }}
          >
            操作指南 <ArrowUpRight size={15} />
          </button>
        </div>
        <div className="workspace">
          <aside className="left-sidebar">
            <div className="pilot-card">
              <div className="pilot-icon">⌘</div>
              <div>
                <span className="eyebrow">YOUR OPERATOR</span>
                <h3>
                  先驱者 <span>01</span>
                </h3>
                <small>均衡型 / 自动索敌</small>
              </div>
            </div>
            <Vitals doc={d} />
            <WavePanel doc={d} />
            <div className="mission-note">
              <Radio size={18} />
              <span>
                目标：存活 04:00
                <br />
                <small>穿越敌潮，等待撤离窗口。</small>
              </span>
            </div>
          </aside>
          <section className="battle-panel">
            <div className="battle-toolbar">
              <span>
                <span
                  className={`status-dot ${d.phase === "playing" ? "" : "idle"}`}
                />
                {d.phase === "playing"
                  ? "行动进行中"
                  : d.phase === "ready"
                    ? "等待部署"
                    : d.phase === "upgrade"
                      ? "进化选择中"
                      : d.phase === "ended"
                        ? "行动已结束"
                        : "战场已暂停"}
              </span>
              <div className="timer">
                <Activity size={14} />
                <b className="mono">{formatTime(d.time)}</b>
              </div>
              <div className="battle-actions">
                <button
                  aria-label={muted ? "开启声音" : "关闭声音"}
                  onClick={() => setMuted(!muted)}
                >
                  {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                </button>
                <button
                  aria-label="暂停或继续"
                  disabled={
                    d.phase === "ready" ||
                    d.phase === "upgrade" ||
                    d.phase === "ended"
                  }
                  onClick={toggle}
                >
                  {d.phase === "paused" ? (
                    <Play size={16} />
                  ) : (
                    <Pause size={16} />
                  )}
                </button>
                <button
                  aria-label="重新开始"
                  onClick={() => {
                    if (d.phase === "playing") d.phase = "paused";
                    setHelp(false);
                    restart();
                  }}
                >
                  <RotateCcw size={15} />
                </button>
              </div>
            </div>
            <div className="canvas-wrap">
              <Battlefield doc={d} input={input} />
              <div className="sector-tag">
                SECTOR 07<span>∞ DEEP SPACE</span>
              </div>
              {d.phase === "ready" && (
                <div className="overlay start-overlay">
                  <div className="start-card">
                    <div className="signal-orbit">
                      <Crosshair size={44} />
                    </div>
                    <div className="eyebrow">CONNECTION ESTABLISHED</div>
                    <h2>准备好迎接敌潮了吗？</h2>
                    <p>
                      移动，躲避，进化。
                      <br />
                      武器将自动开火，你只需要活下去。
                    </p>
                    <button className="primary" onClick={start}>
                      开始行动 <ArrowUpRight size={17} />
                    </button>
                    <small>W A S D 移动 · ESC 暂停</small>
                  </div>
                </div>
              )}
              {d.phase === "paused" && !history && !help && (
                <div className="overlay">
                  <div className="pause-card">
                    <Pause size={32} />
                    <h2>信号已挂起</h2>
                    <p>战场已冻结。准备好后继续行动。</p>
                    <button className="primary" onClick={toggle}>
                      继续行动 <Play size={16} />
                    </button>
                  </div>
                </div>
              )}
              {d.phase === "upgrade" && (
                <UpgradeDialog doc={d} choose={choose} />
              )}{" "}
              {d.phase === "ended" && (
                <ResultDialog doc={d} restart={restart} />
              )}
            </div>
            <ExperienceBar doc={d} />
            <div className="battle-footer">
              <span>
                <kbd>W</kbd>
                <kbd>A</kbd>
                <kbd>S</kbd>
                <kbd>D</kbd> 移动
              </span>
              <span>
                <kbd>ESC</kbd> 暂停
              </span>
              <span className="auto-fire">
                <span className="status-dot" /> 自动攻击已启用
              </span>
            </div>
          </section>
          <aside className="right-sidebar">
            <ArsenalPanel doc={d} />
            <StatsPanel doc={d} />
            <div className="tip">
              <span>生存提示 / 01</span>
              <p>保持移动。拾取绿色能量晶体升级，组合武器与被动能力。</p>
              <div className="drop-legend">
                <i /> 能量 <i /> 治疗 <i /> 磁铁
              </div>
            </div>
          </aside>
        </div>
        <footer>
          <span>
            VOID SIGNAL <i /> 独立生存协议
          </span>
          <span>
            保持移动，保持信号。 <span className="mono">JDK—004</span>
          </span>
        </footer>
      </main>
      {history && (
        <HistoryPanel records={d.records} close={() => setHistory(false)} />
      )}{" "}
      {help && (
        <div className="overlay help-overlay">
          <div className="history-dialog">
            <button className="close" onClick={() => setHelp(false)}>
              关闭 ✕
            </button>
            <div className="eyebrow">FIELD MANUAL</div>
            <h2>生存协议</h2>
            <p>
              WASD /
              方向键移动，武器自动瞄准最近的敌人。按住鼠标可改为指向射击。
            </p>
            <p>
              击败敌人会掉落绿色经验晶体。靠近自动拾取；粉色修复机体，蓝色磁铁吸取全场晶体。
            </p>
            <p>
              升级时选择一种武器或强化。脉冲、轨道刃、新星可以同时装备，被动强化对所有武器生效。
            </p>
            <p>
              ESC / P
              暂停。切换窗口自动暂停。八波共四分钟，完成后自动记录本局统计。
            </p>
            <button className="primary" onClick={() => setHelp(false)}>
              已了解
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
