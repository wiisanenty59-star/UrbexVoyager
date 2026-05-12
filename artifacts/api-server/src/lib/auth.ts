import { type Request, type Response, type NextFunction } from "express";
import { db, usersTable, type User } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./logger";

declare module "express-session" {
  interface SessionData {
    userId?: number;
  }
}

export type AuthedRequest = Request & {
  user?: User;
};

/**
 * LOAD USER (STRICT + NO GHOST SESSIONS)
 */
export async function loadUser(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const userId = req.session?.userId;

  // no session → clean state
  if (typeof userId !== "number") {
    (req as AuthedRequest).user = undefined;
    return next();
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId));

  /**
   * ❌ INVALID USER → HARD RESET SESSION
   */
  if (!user) {
    logger.warn({ userId }, "Invalid session user → clearing session");

    req.session?.destroy(() => {});
    (req as AuthedRequest).user = undefined;

    return next();
  }

  /**
   * ❌ BANNED USER → HARD RESET SESSION
   */
  if (user.isBanned) {
    logger.warn({ userId }, "Banned user → clearing session");

    req.session?.destroy(() => {});
    (req as AuthedRequest).user = undefined;

    return next();
  }

  /**
   * ✅ VALID USER
   */
  (req as AuthedRequest).user = user;

  /**
   * fire-and-forget lastSeen update
   */
  db.update(usersTable)
    .set({ lastSeenAt: new Date() })
    .where(eq(usersTable.id, userId))
    .catch((err) => {
      logger.error({ err }, "Failed to update lastSeenAt");
    });

  return next();
}

/**
 * REQUIRE AUTH (STRICT)
 */
export function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = (req as AuthedRequest).user;

  if (!user || typeof user.id !== "number") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  return next();
}

/**
 * REQUIRE ADMIN
 */
export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const user = (req as AuthedRequest).user;

  if (!user || typeof user.id !== "number") {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  if (user.role !== "admin") {
    logger.warn({ userId: user.id }, "Admin access denied");
    res.status(403).json({ error: "Admin access required" });
    return;
  }

  return next();
}

/**
 * SERIALIZE USER (SAFE OUTPUT ONLY)
 */
export function serializeUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    trustLevel: user.trustLevel,
    avatarUrl: user.avatarUrl ?? null,
    createdAt: user.createdAt,
  };
}