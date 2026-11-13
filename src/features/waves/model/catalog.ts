export const WAVE_DURATION = 30;
export const TOTAL_WAVES = 8;
export const ENEMY_CATALOG = {
  chaser: { hp: 18, speed: 62, radius: 12, color: "#fb7185", label: "追猎者" },
  shooter: { hp: 28, speed: 40, radius: 14, color: "#fbbf24", label: "游击者" },
  elite: { hp: 100, speed: 45, radius: 22, color: "#c084fc", label: "精英体" },
} as const;
