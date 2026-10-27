import 'server-only';

import { createHash } from 'node:crypto';
import { getPrismaClient } from '@/lib/db/prisma';

export const LOGIN_ATTEMPT_LIMIT = 5;
export const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000;

function throttleKey(email: string) {
  return createHash('sha256')
    .update(`login:${email}`)
    .digest('hex');
}

export async function consumeLoginAttempt(email: string) {
  const prisma = getPrismaClient();
  if (!prisma) return false;

  const now = new Date();
  const windowStartedAt = new Date(now.getTime() - LOGIN_ATTEMPT_WINDOW_MS);
  const [record] = await prisma.$queryRaw<
    Array<{ attempts: number }>
  >`
    INSERT INTO "LoginThrottle" ("key", "windowStartedAt", "attempts", "updatedAt")
    VALUES (${throttleKey(email)}, ${now}, 1, ${now})
    ON CONFLICT ("key") DO UPDATE
    SET
      "attempts" = CASE
        WHEN "LoginThrottle"."windowStartedAt" <= ${windowStartedAt}
        THEN 1
        ELSE "LoginThrottle"."attempts" + 1
      END,
      "windowStartedAt" = CASE
        WHEN "LoginThrottle"."windowStartedAt" <= ${windowStartedAt}
        THEN ${now}
        ELSE "LoginThrottle"."windowStartedAt"
      END,
      "updatedAt" = ${now}
    RETURNING "attempts"
  `;

  return (record?.attempts ?? LOGIN_ATTEMPT_LIMIT + 1) <= LOGIN_ATTEMPT_LIMIT;
}

export async function clearLoginAttempts(email: string) {
  const prisma = getPrismaClient();
  if (!prisma) return;

  await prisma.loginThrottle.deleteMany({
    where: { key: throttleKey(email) },
  });
}
