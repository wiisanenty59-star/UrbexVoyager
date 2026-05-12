import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, invitesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  LoginBody,
  LoginResponse,
  RedeemInviteBody,
  GetCurrentUserResponse,
  GetInviteInfoParams,
  GetInviteInfoResponse,
} from "@workspace/api-zod";
import { type AuthedRequest, serializeUser } from "../lib/auth";
import { logger } from "../lib/logger";

const router: IRouter = Router();

/**
 * =========================
 * LOGIN
 * POST /api/auth/login
 * =========================
 */
router.post("/auth/login", async (req, res): Promise<void> => {
  logger.info({ path: "/auth/login" }, "LOGIN REQUEST");

  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { username, password } = parsed.data;

  const [user] = await db
    .select()
    .from(usersTable)
    .where(sql`lower(${usersTable.username}) = lower(${username})`);

  if (!user) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  if (user.isBanned) {
    res.status(403).json({ error: "Account suspended" });
    return;
  }

  const passwordOk = await bcrypt.compare(password, user.passwordHash);

  if (!passwordOk) {
    res.status(401).json({ error: "Invalid username or password" });
    return;
  }

  if (!req.session) {
    res.status(500).json({ error: "Session not initialized" });
    return;
  }

  req.session.regenerate((err) => {
    if (err) {
      res.status(500).json({ error: "Session error" });
      return;
    }

    req.session.userId = user.id;

    logger.info({ userId: user.id }, "LOGIN SUCCESS");

    res.json(LoginResponse.parse(serializeUser(user)));
  });
});

/**
 * =========================
 * LOGOUT
 * POST /api/auth/logout
 * =========================
 */
router.post("/auth/logout", async (req, res): Promise<void> => {
  logger.info({ userId: req.session?.userId }, "LOGOUT REQUEST");

  const clearCookies = () => {
    res.clearCookie("connect.sid");
    res.clearCookie("hf.sid");
  };

  if (!req.session) {
    clearCookies();
    res.sendStatus(204);
    return;
  }

  req.session.destroy((err) => {
    clearCookies();

    if (err) {
      logger.error({ err }, "LOGOUT ERROR (ignored)");
    }

    res.sendStatus(204);
  });
});

/**
 * =========================
 * CURRENT USER
 * GET /api/auth/me
 * =========================
 */
router.get("/auth/me", async (req, res): Promise<void> => {
  const user = (req as AuthedRequest).user;

  if (!req.session?.userId || !user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json(GetCurrentUserResponse.parse(serializeUser(user)));
});

/**
 * =========================
 * INVITE INFO
 * GET /api/auth/invite-info/:code
 * =========================
 */
router.get("/auth/invite-info/:code", async (req, res): Promise<void> => {
  const parsed = GetInviteInfoParams.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { code } = parsed.data;

  const [invite] = await db
    .select({
      code: invitesTable.code,
      note: invitesTable.note,
      usedAt: invitesTable.usedAt,
      invitedBy: usersTable.username,
    })
    .from(invitesTable)
    .leftJoin(usersTable, eq(usersTable.id, invitesTable.createdById))
    .where(eq(invitesTable.code, code));

  if (!invite || invite.usedAt) {
    res.status(404).json({ error: "Invite not found or already used" });
    return;
  }

  res.json(
    GetInviteInfoResponse.parse({
      code: invite.code,
      note: invite.note,
      invitedBy: invite.invitedBy,
    })
  );
});

/**
 * =========================
 * REDEEM INVITE
 * POST /api/auth/redeem-invite
 * =========================
 */
router.post("/auth/redeem-invite", async (req, res): Promise<void> => {
  const parsed = RedeemInviteBody.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { code, username, password } = parsed.data;

  const [invite] = await db
    .select()
    .from(invitesTable)
    .where(eq(invitesTable.code, code));

  if (!invite || invite.usedAt) {
    res.status(400).json({ error: "Invite not found or already used" });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [user] = await db
    .insert(usersTable)
    .values({
      username,
      passwordHash,
      role: "member",
    })
    .returning();

  if (!user) {
    res.status(500).json({ error: "Could not create account" });
    return;
  }

  await db
    .update(invitesTable)
    .set({ usedById: user.id, usedAt: new Date() })
    .where(eq(invitesTable.id, invite.id));

  if (!req.session) {
    res.status(500).json({ error: "Session not initialized" });
    return;
  }

  req.session.regenerate((err) => {
    if (err) {
      res.status(500).json({ error: "Session error" });
      return;
    }

    req.session.userId = user.id;

    res.status(201).json(GetCurrentUserResponse.parse(serializeUser(user)));
  });
});

export default router;