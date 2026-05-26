import { Router } from "express";
import { db, transactionsTable, usersTable } from "@workspace/db";
import { eq, or, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

function formatTransaction(tx: typeof transactionsTable.$inferSelect, senderUsername?: string | null, receiverUsername?: string | null) {
  return {
    id: tx.id,
    senderId: tx.senderId,
    receiverId: tx.receiverId,
    senderUsername: senderUsername || null,
    receiverUsername: receiverUsername || null,
    amount: parseFloat(tx.amount as string),
    type: tx.type,
    description: tx.description,
    createdAt: tx.createdAt.toISOString(),
  };
}

router.get("/transactions", requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.userId!;
    const txs = await db.select().from(transactionsTable)
      .where(or(eq(transactionsTable.senderId, userId), eq(transactionsTable.receiverId, userId)))
      .orderBy(desc(transactionsTable.createdAt))
      .limit(100);

    const userIds = new Set<number>();
    txs.forEach(tx => {
      if (tx.senderId) userIds.add(tx.senderId);
      if (tx.receiverId) userIds.add(tx.receiverId);
    });

    const users = await db.select({ id: usersTable.id, username: usersTable.username })
      .from(usersTable)
      .where(or(...Array.from(userIds).map(id => eq(usersTable.id, id))));

    const userMap = new Map(users.map(u => [u.id, u.username]));

    res.json(txs.map(tx => formatTransaction(
      tx,
      tx.senderId ? userMap.get(tx.senderId) : null,
      tx.receiverId ? userMap.get(tx.receiverId) : null,
    )));
  } catch (err) {
    req.log.error({ err }, "GetTransactions error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/transactions/transfer", requireAuth, async (req: AuthRequest, res) => {
  const { toUsername, amount } = req.body;
  if (!toUsername || !amount || amount <= 0) {
    res.status(400).json({ error: "Некорректные данные перевода" });
    return;
  }
  try {
    const [sender] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    const [receiver] = await db.select().from(usersTable).where(eq(usersTable.username, toUsername)).limit(1);
    if (!receiver) { res.status(404).json({ error: "Пользователь не найден" }); return; }
    if (receiver.id === req.userId) { res.status(400).json({ error: "Нельзя отправить себе" }); return; }
    if (parseFloat(sender.balance as string) < amount) {
      res.status(400).json({ error: "Недостаточно средств" });
      return;
    }
    await db.update(usersTable).set({ balance: String(parseFloat(sender.balance as string) - amount) }).where(eq(usersTable.id, req.userId!));
    await db.update(usersTable).set({ balance: String(parseFloat(receiver.balance as string) + amount) }).where(eq(usersTable.id, receiver.id));
    const [tx] = await db.insert(transactionsTable).values({
      senderId: req.userId!,
      receiverId: receiver.id,
      amount: String(amount),
      type: "transfer",
      description: `Перевод пользователю @${toUsername}`,
    }).returning();
    res.json(formatTransaction(tx, sender.username, receiver.username));
  } catch (err) {
    req.log.error({ err }, "Transfer error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export { formatTransaction };
export default router;
