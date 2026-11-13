import type { WeaponId } from "../../../shared/types";
export const WEAPON_CATALOG: Record<
  WeaponId,
  { name: string; description: string; color: string; interval: number }
> = {
  pulse: {
    name: "脉冲步枪",
    description: "自动锁定最近目标，精准连续打击",
    color: "#67e8f9",
    interval: 0.48,
  },
  orbit: {
    name: "环轨飞刃",
    description: "向四周释放穿透飞刃",
    color: "#c084fc",
    interval: 1.7,
  },
  nova: {
    name: "新星爆发",
    description: "周期性向周围发射能量星环",
    color: "#fbbf24",
    interval: 3.2,
  },
};
