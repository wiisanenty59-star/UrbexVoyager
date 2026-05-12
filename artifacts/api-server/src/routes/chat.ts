import { Router, type IRouter } from "express";
import {
  db,
  chatRoomsTable,
  roomMessagesTable,
  roomMessageLikesTable,
  roomBansTable,
  statesTable,
  usersTable,
  crewsTable,
  locationsTable,
} from "@workspace/db";
import { and, asc, desc, eq, gt, ilike, isNull, ne, or, sql, lt } from "drizzle-orm";
import {
  CreateChatRoomBody,
  ListRoomMessagesParams,
  SendRoomMessageParams,
  SendRoomMessageBody,
} from "@workspace/api-zod";
import {
  type AuthedRequest,
  requireAuth,
  requireAdmin,
} from "../lib/auth";

const router: IRouter = Router();

// ─── List public rooms ────────────────────────────────────────────────────────

router.get(
  "/chat/rooms",
  requireAuth,
  async (req, res): Promise<void> => {
    const user = (req as AuthedRequest).user;

    const crewRoomIds = await db
      .select({ id: crewsTable.roomId })
      .from(crewsTable);
    const excluded = new Set(crewRoomIds.map((r) => r.id));

    const rows = await db
      .select({
        id: chatRoomsTable.id,
        slug: chatRoomsTable.slug,
        name: chatRoomsTable.name,
        description: chatRoomsTable.description,
        kind: chatRoomsTable.kind,
        stateId: chatRoomsTable.stateId,
        stateSlug: statesTable.slug,
        minTrustLevel: chatRoomsTable.minTrustLevel,
        isArchived: chatRoomsTable.isArchived,
        memberCount: sql<number>`(
          SELECT COUNT(DISTINCT author_id)::int FROM room_messages
          WHERE room_messages.room_id = ${chatRoomsTable.id}
        )`,
        lastMessageAt: sql<Date | null>`(
          SELECT MAX(created_at) FROM room_messages
          WHERE room_messages.room_id = ${chatRoomsTable.id}
        )`,
      })
      .from(chatRoomsTable)
      .leftJoin(statesTable, eq(statesTable.id, chatRoomsTable.stateId))
      .where(eq(chatRoomsTable.isArchived, false))
      .orderBy(asc(chatRoomsTable.name));

    const visible = rows.filter(
      (r) =>
        !excluded.has(r.id) && (user.trustLevel ?? 0) >= r.minTrustLevel,
    );
    res.json(visible);
  },
);

// ─── Create room (admin) ──────────────────────────────────────────────────────

router.post(
  "/chat/rooms",
  requireAdmin,
  async (req, res): Promise<void> => {
    const parsed = CreateChatRoomBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }

    const [created] = await db
      .insert(chatRoomsTable)
      .values({
        slug: parsed.data.slug,
        name: parsed.data.name,
        description: parsed.data.description,
        kind: parsed.data.kind,
        stateId: parsed.data.stateId ?? null,
        minTrustLevel: parsed.data.minTrustLevel ?? 0,
      })
      .returning();

    if (!created) {
      res.status(500).json({ error: "Could not create room" });
      return;
    }

    res.status(201).json({
      id: created.id,
      slug: created.slug,
      name: created.name,
      description: created.description,
      kind: created.kind,
      stateId: created.stateId,
      stateSlug: null,
      minTrustLevel: created.minTrustLevel,
      isArchived: created.isArchived,
      memberCount: 0,
      lastMessageAt: null,
    });
  },
);

// ─── Edit room (admin) ────────────────────────────────────────────────────────

router.patch(
  "/chat/rooms/:slug",
  requireAdmin,
  async (req, res): Promise<void> => {
    const { slug } = req.params;
    const [room] = await db
      .select()
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.slug, slug));
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    const { name, description, minTrustLevel, isArchived, kind } = req.body as {
      name?: string;
      description?: string;
      minTrustLevel?: number;
      isArchived?: boolean;
      kind?: string;
    };

    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (minTrustLevel !== undefined) updates.minTrustLevel = minTrustLevel;
    if (isArchived !== undefined) updates.isArchived = isArchived;
    if (kind !== undefined) updates.kind = kind;

    const [updated] = await db
      .update(chatRoomsTable)
      .set(updates)
      .where(eq(chatRoomsTable.id, room.id))
      .returning();

    res.json(updated);
  },
);

// ─── List all rooms for admin ─────────────────────────────────────────────────

router.get(
  "/admin/chat/rooms",
  requireAdmin,
  async (_req, res): Promise<void> => {
    const crewRoomIds = await db
      .select({ id: crewsTable.roomId })
      .from(crewsTable);
    const excluded = new Set(crewRoomIds.map((r) => r.id));

    const rows = await db
      .select({
        id: chatRoomsTable.id,
        slug: chatRoomsTable.slug,
        name: chatRoomsTable.name,
        description: chatRoomsTable.description,
        kind: chatRoomsTable.kind,
        minTrustLevel: chatRoomsTable.minTrustLevel,
        isArchived: chatRoomsTable.isArchived,
        createdAt: chatRoomsTable.createdAt,
        memberCount: sql<number>`(
          SELECT COUNT(DISTINCT author_id)::int FROM room_messages
          WHERE room_messages.room_id = ${chatRoomsTable.id}
        )`,
        messageCount: sql<number>`(
          SELECT COUNT(*)::int FROM room_messages
          WHERE room_messages.room_id = ${chatRoomsTable.id}
        )`,
      })
      .from(chatRoomsTable)
      .orderBy(asc(chatRoomsTable.name));

    res.json(rows.filter((r) => !excluded.has(r.id)));
  },
);

// ─── List active bans for admin ───────────────────────────────────────────────

router.get(
  "/admin/chat/bans",
  requireAdmin,
  async (_req, res): Promise<void> => {
    const now = new Date();
    const rows = await db
      .select({
        id: roomBansTable.id,
        roomSlug: chatRoomsTable.slug,
        roomName: chatRoomsTable.name,
        userId: roomBansTable.userId,
        username: usersTable.username,
        bannedUntil: roomBansTable.bannedUntil,
        reason: roomBansTable.reason,
        createdAt: roomBansTable.createdAt,
      })
      .from(roomBansTable)
      .leftJoin(chatRoomsTable, eq(chatRoomsTable.id, roomBansTable.roomId))
      .leftJoin(usersTable, eq(usersTable.id, roomBansTable.userId))
      .where(
        or(
          isNull(roomBansTable.bannedUntil),
          gt(roomBansTable.bannedUntil, now),
        ),
      )
      .orderBy(desc(roomBansTable.createdAt));

    res.json(rows);
  },
);

// ─── Unban user (admin) ───────────────────────────────────────────────────────

router.delete(
  "/admin/chat/bans/:id",
  requireAdmin,
  async (req, res): Promise<void> => {
    const id = Number.parseInt(req.params.id, 10);
    await db.delete(roomBansTable).where(eq(roomBansTable.id, id));
    res.json({ ok: true });
  },
);

// ─── Location search for chat tagging ────────────────────────────────────────

router.get(
  "/chat/location-search",
  requireAuth,
  async (req, res): Promise<void> => {
    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (!q) {
      res.json([]);
      return;
    }

    const rows = await db
      .select({
        id: locationsTable.id,
        name: locationsTable.name,
        city: locationsTable.city,
        stateSlug: statesTable.slug,
        stateName: statesTable.name,
      })
      .from(locationsTable)
      .leftJoin(statesTable, eq(statesTable.id, locationsTable.stateId))
      .where(ilike(locationsTable.name, `%${q}%`))
      .orderBy(asc(locationsTable.name))
      .limit(10);

    res.json(rows);
  },
);

// ─── Get messages ─────────────────────────────────────────────────────────────

router.get(
  "/chat/rooms/:slug/messages",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = ListRoomMessagesParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const user = (req as AuthedRequest).user;

    const [room] = await db
      .select()
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.slug, params.data.slug));
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if ((user.trustLevel ?? 0) < room.minTrustLevel) {
      res.status(403).json({ error: "Trust level too low" });
      return;
    }

    const sinceParam = req.query.sinceId;
    const sinceId =
      typeof sinceParam === "string"
        ? Number.parseInt(sinceParam, 10)
        : undefined;

    const filters = [eq(roomMessagesTable.roomId, room.id)];
    if (sinceId && Number.isFinite(sinceId)) {
      filters.push(gt(roomMessagesTable.id, sinceId));
    }

    const rows = await db
      .select({
        id: roomMessagesTable.id,
        body: roomMessagesTable.body,
        authorId: roomMessagesTable.authorId,
        authorUsername: usersTable.username,
        authorTrustLevel: usersTable.trustLevel,
        createdAt: roomMessagesTable.createdAt,
        likeCount: sql<number>`(
          SELECT COUNT(*)::int FROM room_message_likes
          WHERE room_message_likes.message_id = ${roomMessagesTable.id}
        )`,
        likedByMe: sql<boolean>`EXISTS(
          SELECT 1 FROM room_message_likes
          WHERE room_message_likes.message_id = ${roomMessagesTable.id}
            AND room_message_likes.user_id = ${user.id}
        )`,
      })
      .from(roomMessagesTable)
      .leftJoin(usersTable, eq(usersTable.id, roomMessagesTable.authorId))
      .where(and(...filters))
      .orderBy(desc(roomMessagesTable.id))
      .limit(sinceId ? 200 : 100);

    res.json({ messages: rows.reverse() });
  },
);

// ─── Send message ─────────────────────────────────────────────────────────────

router.post(
  "/chat/rooms/:slug/messages",
  requireAuth,
  async (req, res): Promise<void> => {
    const params = SendRoomMessageParams.safeParse(req.params);
    if (!params.success) {
      res.status(400).json({ error: params.error.message });
      return;
    }
    const parsed = SendRoomMessageBody.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.message });
      return;
    }
    if (!parsed.data.body.trim()) {
      res.status(400).json({ error: "Message cannot be empty" });
      return;
    }
    const user = (req as AuthedRequest).user;

    const [room] = await db
      .select()
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.slug, params.data.slug));
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }
    if ((user.trustLevel ?? 0) < room.minTrustLevel) {
      res.status(403).json({ error: "Trust level too low" });
      return;
    }

    // Check for active ban
    const now = new Date();
    const [ban] = await db
      .select()
      .from(roomBansTable)
      .where(
        and(
          eq(roomBansTable.roomId, room.id),
          eq(roomBansTable.userId, user.id),
          or(
            isNull(roomBansTable.bannedUntil),
            gt(roomBansTable.bannedUntil, now),
          ),
        ),
      );
    if (ban) {
      const until = ban.bannedUntil
        ? `until ${ban.bannedUntil.toISOString()}`
        : "permanently";
      res.status(403).json({ error: `You are banned from this room ${until}` });
      return;
    }

    const [created] = await db
      .insert(roomMessagesTable)
      .values({
        roomId: room.id,
        authorId: user.id,
        body: parsed.data.body,
      })
      .returning();

    if (!created) {
      res.status(500).json({ error: "Could not send" });
      return;
    }

    res.status(201).json({
      id: created.id,
      body: created.body,
      authorId: created.authorId,
      authorUsername: user.username,
      authorTrustLevel: user.trustLevel ?? 0,
      createdAt: created.createdAt,
      likeCount: 0,
      likedByMe: false,
    });
  },
);

// ─── Toggle like on a message ─────────────────────────────────────────────────

router.post(
  "/chat/rooms/:slug/messages/:id/like",
  requireAuth,
  async (req, res): Promise<void> => {
    const user = (req as AuthedRequest).user;
    const msgId = Number.parseInt(req.params.id, 10);
    if (!Number.isFinite(msgId)) {
      res.status(400).json({ error: "Invalid message id" });
      return;
    }

    const [existing] = await db
      .select()
      .from(roomMessageLikesTable)
      .where(
        and(
          eq(roomMessageLikesTable.messageId, msgId),
          eq(roomMessageLikesTable.userId, user.id),
        ),
      );

    let liked: boolean;
    if (existing) {
      await db
        .delete(roomMessageLikesTable)
        .where(eq(roomMessageLikesTable.id, existing.id));
      liked = false;
    } else {
      await db
        .insert(roomMessageLikesTable)
        .values({ messageId: msgId, userId: user.id });
      liked = true;
    }

    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(roomMessageLikesTable)
      .where(eq(roomMessageLikesTable.messageId, msgId));

    res.json({ liked, count });
  },
);

// ─── Kick user from room (admin/mod) ──────────────────────────────────────────

router.post(
  "/chat/rooms/:slug/kick",
  requireAuth,
  async (req, res): Promise<void> => {
    const user = (req as AuthedRequest).user;
    if (user.role !== "admin" && user.role !== "moderator") {
      res.status(403).json({ error: "Insufficient permissions" });
      return;
    }

    const { userId, minutes, reason } = req.body as {
      userId: number;
      minutes?: number;
      reason?: string;
    };

    if (!userId) {
      res.status(400).json({ error: "userId required" });
      return;
    }

    const { slug } = req.params;
    const [room] = await db
      .select()
      .from(chatRoomsTable)
      .where(eq(chatRoomsTable.slug, slug));
    if (!room) {
      res.status(404).json({ error: "Room not found" });
      return;
    }

    const bannedUntil =
      minutes && minutes > 0
        ? new Date(Date.now() + minutes * 60 * 1000)
        : null;

    await db
      .insert(roomBansTable)
      .values({
        roomId: room.id,
        userId,
        bannedUntil,
        bannedBy: user.id,
        reason: reason ?? "",
      })
      .onConflictDoUpdate({
        target: [roomBansTable.roomId, roomBansTable.userId],
        set: {
          bannedUntil,
          bannedBy: user.id,
          reason: reason ?? "",
          createdAt: new Date(),
        },
      });

    res.json({ ok: true, bannedUntil });
  },
);

export default router;

void isNull;
void ne;
void lt;
