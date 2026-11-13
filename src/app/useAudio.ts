import { useEffect, useRef, useState } from "react";
import type { GameDoc } from "../shared/types";
export function useAudio(doc: GameDoc) {
  const [muted, setMuted] = useState(true);
  const audio = useRef<AudioContext | null>(null);
  const previous = useRef({ kills: 0, taken: 0, level: 1 });
  useEffect(() => {
    const p = previous.current;
    const changed =
      doc.stats.taken > p.taken
        ? "hurt"
        : doc.level > p.level
          ? "level"
          : doc.stats.kills > p.kills
            ? "kill"
            : null;
    previous.current = {
      kills: doc.stats.kills,
      taken: doc.stats.taken,
      level: doc.level,
    };
    if (!changed || muted) return;
    try {
      const ctx = audio.current ?? (audio.current = new AudioContext());
      void ctx.resume();
      const osc = ctx.createOscillator(),
        gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = changed === "hurt" ? "sawtooth" : "sine";
      osc.frequency.setValueAtTime(
        changed === "hurt" ? 100 : changed === "level" ? 660 : 330,
        ctx.currentTime,
      );
      osc.frequency.exponentialRampToValueAtTime(
        changed === "level" ? 1100 : 70,
        ctx.currentTime + 0.12,
      );
      gain.gain.setValueAtTime(0.035, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.14);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      /* Audio is optional on restricted browsers. */
    }
  }, [doc.stats.kills, doc.stats.taken, doc.level, muted]);
  useEffect(
    () => () => {
      void audio.current?.close();
    },
    [],
  );
  return { muted, setMuted };
}
