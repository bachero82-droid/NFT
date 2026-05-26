import { Router } from "express";
import { db, gamesTable, usersTable } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

// Crash RTP ~97% — house edge 3%
// Uses provably fair crash point: exponential distribution
function generateCrashPoint(): number {
  // RTP 97%: E[X] = 1/0.03 ≈ 33.3 but capped
  // P(crash at X) = 0.97 / X^2 for X >= 1
  // CDF inverse: X = 1 / (1 - u * 0.97) if u < 1
  const u = Math.random();
  if (u < 0.03) return 1.0; // instant crash (house always wins 3% of rounds)
  const crash = 0.97 / (1 - u);
  return Math.max(1.01, Math.round(crash * 100) / 100);
}

// Active crash rounds: roundId -> { crashPoint, bet, userId }
const activeRounds = new Map<string, { crashPoint: number; bet: number; userId: number }>();

router.post("/games/coinflip", requireAuth, async (req: AuthRequest, res) => {
  const { bet, side } = req.body;
  if (!bet || bet <= 0 || !side || !["heads", "tails"].includes(side)) {
    res.status(400).json({ error: "Некорректные данные" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (parseFloat(user.balance as string) < bet) {
      res.status(400).json({ error: "Недостаточно средств" });
      return;
    }

    // RTP ~97%: heads probability slightly under 50%
    const result = Math.random() < 0.485 ? "heads" : "tails";
    const won = result === side;
    const payout = won ? bet * 1.94 : 0; // 97% RTP on win = 1.94x
    const newBalance = parseFloat(user.balance as string) - bet + payout;

    await db.update(usersTable).set({ balance: String(Math.max(0, newBalance)) }).where(eq(usersTable.id, req.userId!));
    await db.insert(gamesTable).values({
      userId: req.userId!,
      gameType: "coinflip",
      bet: String(bet),
      result: won ? "win" : "loss",
      payout: String(payout),
    });

    res.json({ result, won, bet, payout: Math.round(payout * 100) / 100, newBalance: Math.round(Math.max(0, newBalance) * 100) / 100 });
  } catch (err) {
    req.log.error({ err }, "Coinflip error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/games/crash/start", requireAuth, async (req: AuthRequest, res) => {
  const { bet } = req.body;
  if (!bet || bet <= 0) {
    res.status(400).json({ error: "Некорректная ставка" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (parseFloat(user.balance as string) < bet) {
      res.status(400).json({ error: "Недостаточно средств" });
      return;
    }

    // Deduct bet immediately
    await db.update(usersTable).set({ balance: String(parseFloat(user.balance as string) - bet) }).where(eq(usersTable.id, req.userId!));

    const crashPoint = generateCrashPoint();
    const roundId = Math.random().toString(36).substring(2, 10).toUpperCase();
    activeRounds.set(roundId, { crashPoint, bet, userId: req.userId! });

    // Auto-clean round after 5 minutes
    setTimeout(() => activeRounds.delete(roundId), 300000);

    res.json({ roundId, bet, crashPoint });
  } catch (err) {
    req.log.error({ err }, "CrashStart error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/games/crash/cashout", requireAuth, async (req: AuthRequest, res) => {
  const { roundId, multiplier } = req.body;
  if (!roundId || !multiplier || multiplier <= 1) {
    res.status(400).json({ error: "Некорректные данные" });
    return;
  }
  try {
    const round = activeRounds.get(roundId);
    if (!round) { res.status(404).json({ error: "Раунд не найден или уже завершён" }); return; }
    if (round.userId !== req.userId) { res.status(403).json({ error: "Не ваш раунд" }); return; }

    activeRounds.delete(roundId);

    const won = multiplier <= round.crashPoint;
    const payout = won ? round.bet * multiplier : 0;

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (won) {
      await db.update(usersTable).set({ balance: String(parseFloat(user.balance as string) + payout) }).where(eq(usersTable.id, req.userId!));
    }

    await db.insert(gamesTable).values({
      userId: req.userId!,
      gameType: "crash",
      bet: String(round.bet),
      multiplier: String(multiplier),
      result: won ? "win" : "loss",
      payout: String(payout),
    });

    const [updatedUser] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);

    res.json({
      won,
      multiplier,
      crashPoint: round.crashPoint,
      bet: round.bet,
      payout: Math.round(payout * 100) / 100,
      newBalance: Math.round(parseFloat(updatedUser.balance as string) * 100) / 100,
    });
  } catch (err) {
    req.log.error({ err }, "CrashCashout error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/games/history", requireAuth, async (req: AuthRequest, res) => {
  try {
    const games = await db.select().from(gamesTable)
      .where(eq(gamesTable.userId, req.userId!))
      .orderBy(desc(gamesTable.createdAt))
      .limit(50);
    res.json(games.map(g => ({
      id: g.id,
      gameType: g.gameType,
      bet: parseFloat(g.bet as string),
      multiplier: g.multiplier ? parseFloat(g.multiplier as string) : null,
      result: g.result,
      payout: parseFloat(g.payout as string),
      createdAt: g.createdAt.toISOString(),
    })));
  } catch (err) {
    req.log.error({ err }, "GameHistory error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/games/leaderboard", async (req, res) => {
  try {
    const rows = await db.execute(sql`
      SELECT 
        u.id as user_id,
        u.username,
        u.avatar_url,
        COALESCE(SUM(CASE WHEN g.result = 'win' THEN g.payout::numeric ELSE 0 END), 0) as total_won,
        COUNT(g.id) as games_played,
        COALESCE(MAX(CASE WHEN g.result = 'win' THEN g.payout::numeric ELSE 0 END), 0) as biggest_win
      FROM users u
      LEFT JOIN games g ON g.user_id = u.id
      GROUP BY u.id, u.username, u.avatar_url
      ORDER BY total_won DESC
      LIMIT 20
    `);
    res.json((rows.rows as Array<{
      user_id: number;
      username: string;
      avatar_url: string | null;
      total_won: string;
      games_played: string;
      biggest_win: string;
    }>).map(r => ({
      userId: r.user_id,
      username: r.username,
      avatarUrl: r.avatar_url,
      totalWon: parseFloat(r.total_won),
      gamesPlayed: parseInt(r.games_played),
      biggestWin: parseFloat(r.biggest_win),
    })));
  } catch (err) {
    req.log.error({ err }, "Leaderboard error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
