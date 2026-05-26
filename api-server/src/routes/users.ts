import { Router } from "express";
import { db, usersTable, cardsTable, transactionsTable, gamesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { formatUser } from "./auth";

const router = Router();

router.get("/users/:username", async (req, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.username, req.params.username)).limit(1);
    if (!user) { res.status(404).json({ error: "Пользователь не найден" }); return; }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "GetUser error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.patch("/users/me/profile", requireAuth, async (req: AuthRequest, res) => {
  const { username, avatarUrl } = req.body;
  try {
    const updates: Record<string, unknown> = {};
    if (username) updates.username = username;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl;
    const [user] = await db.update(usersTable).set(updates).where(eq(usersTable.id, req.userId!)).returning();
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "UpdateProfile error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/users/me/stats", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const [totalCards] = await db.select({ count: sql<number>`count(*)` }).from(cardsTable).where(eq(cardsTable.ownerId, userId));
    const games = await db.select().from(gamesTable).where(eq(gamesTable.userId, userId));
    const wins = games.filter(g => g.result === "win");
    const losses = games.filter(g => g.result === "loss");
    const totalWon = wins.reduce((sum, g) => sum + parseFloat(g.payout as string), 0);
    const totalLost = losses.reduce((sum, g) => sum + parseFloat(g.bet as string), 0);
    const biggestWin = wins.length > 0 ? Math.max(...wins.map(g => parseFloat(g.payout as string))) : 0;

    const [cardsSoldRow] = await db.select({ count: sql<number>`count(*)` })
      .from(db.select().from(transactionsTable).where(eq(transactionsTable.senderId, userId)).as("t"))
      .where(sql`true`);

    const soldCount = await db.execute(sql`SELECT COUNT(*) as count FROM transactions WHERE sender_id = ${userId} AND type = 'card_sale'`);

    res.json({
      totalCards: Number(totalCards.count),
      totalGamesPlayed: games.length,
      totalWon,
      totalLost,
      netProfit: totalWon - totalLost,
      biggestWin,
      cardsSold: Number((soldCount.rows[0] as { count: string }).count),
    });
  } catch (err) {
    req.log.error({ err }, "GetStats error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
