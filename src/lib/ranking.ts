export function calculateScore(likes: number, dislikes: number, createdAt: Date): number {
  const hoursSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const recencyBoost = Math.max(0, 10 - hoursSince);
  return likes - dislikes + recencyBoost;
}
