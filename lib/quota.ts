import { prisma } from "./prisma";

export const DAILY_FREE_QUOTA = 20;
/** Each 5 seconds of requested video costs 1 generation credit. */
export const SECONDS_PER_GEN = 5;

export function costForDuration(durationSec: number): number {
  return Math.max(1, Math.ceil(durationSec / SECONDS_PER_GEN));
}

function startOfUtcDay(d = new Date()): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

export async function ensureQuotaWindow(userId: string) {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  const today = startOfUtcDay();
  const resetAt = new Date(user.gensResetAt);

  if (resetAt < today) {
    return prisma.user.update({
      where: { id: userId },
      data: { gensUsedToday: 0, gensResetAt: today },
    });
  }
  return user;
}

export async function getQuota(userId: string) {
  const user = await ensureQuotaWindow(userId);
  const remaining = Math.max(0, DAILY_FREE_QUOTA - user.gensUsedToday);
  return {
    limit: DAILY_FREE_QUOTA,
    used: user.gensUsedToday,
    remaining,
    resetAt: user.gensResetAt.toISOString(),
  };
}

export async function consumeQuota(userId: string, cost: number) {
  const user = await ensureQuotaWindow(userId);
  if (user.gensUsedToday + cost > DAILY_FREE_QUOTA) {
    const err = new Error("Daily free generation quota exceeded");
    (err as Error & { code?: string }).code = "QUOTA_EXCEEDED";
    throw err;
  }
  return prisma.user.update({
    where: { id: userId },
    data: { gensUsedToday: { increment: cost } },
  });
}

export async function refundQuota(userId: string, cost: number) {
  const user = await ensureQuotaWindow(userId);
  const next = Math.max(0, user.gensUsedToday - cost);
  return prisma.user.update({
    where: { id: userId },
    data: { gensUsedToday: next },
  });
}
