export const MAX_LEVEL = 40;

export function getDifficulty(i) {
  if (i < 5) return "Tutorial";
  if (i < 10) return "Beginner";
  if (i < 20) return "Easy";
  if (i < 30) return "Medium";
  if (i < 35) return "Hard";
  return "Expert";
}

export function getLevelConfig(id) {
  const i = id - 1;
  const shots = 32 - Math.floor(i / 4);
  return {
    id,
    difficulty: getDifficulty(i),
    shots,
    targetScore: 200 + i * 20,
    starThresholds: {
      three: Math.ceil(shots * 0.5),
      two: Math.ceil(shots * 0.8),
    },
  };
}

export function calcStars(shotsUsed, shots) {
  if (shotsUsed <= Math.ceil(shots * 0.5)) return 3;
  if (shotsUsed <= Math.ceil(shots * 0.8)) return 2;
  return 1;
}