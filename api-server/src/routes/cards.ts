import { Router } from "express";
import { db, cardsTable, usersTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { generateCardNumber, generateCvv, generateNftId, determineRarity } from "./auth";

const router = Router();

function formatCard(card: typeof cardsTable.$inferSelect, ownerUsername: string, includeMedia = true) {
  return {
    id: card.id,
    ownerId: card.ownerId,
    ownerUsername,
    cardNumber: card.cardNumber,
    cvv: card.cvv,
    rarity: card.rarity,
    nftId: card.nftId,
    mediaUrl: includeMedia ? card.mediaUrl : (card.mediaUrl ? card.mediaUrl.slice(0, 200) : null),
    mediaType: card.mediaType,
    cardTheme: card.cardTheme,
    isPrimary: card.isPrimary,
    hasMedia: !!card.mediaUrl,
    createdAt: card.createdAt.toISOString(),
  };
}

router.get("/cards", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    const cards = await db.select().from(cardsTable).where(eq(cardsTable.ownerId, req.userId!));
    // Strip video mediaUrls from list to keep response fast; images stay (they're compressed)
    res.json(cards.map(c => {
      const isVideo = c.mediaType === "video";
      return formatCard({ ...c, mediaUrl: isVideo ? null : c.mediaUrl }, user.username, true);
    }));
  } catch (err) {
    req.log.error({ err }, "GetCards error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/cards", requireAuth, async (req: AuthRequest, res) => {
  const { cardTheme, mediaUrl, mediaType } = req.body;
  if (mediaUrl && mediaUrl.length > 20_000_000) {
    res.status(400).json({ error: "Файл слишком большой. Максимум 15MB" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    const cardNumber = generateCardNumber();
    const cvv = generateCvv();
    const rarity = determineRarity(cardNumber, cvv);
    const [card] = await db.insert(cardsTable).values({
      ownerId: req.userId!,
      cardNumber,
      cvv,
      rarity,
      nftId: generateNftId(),
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
      cardTheme: cardTheme || "default",
      isPrimary: false,
    }).returning();
    res.status(201).json(formatCard(card, user.username));
  } catch (err) {
    req.log.error({ err }, "CreateCard error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/cards/:id", requireAuth, async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const [card] = await db.select().from(cardsTable).where(eq(cardsTable.id, id)).limit(1);
    if (!card) { res.status(404).json({ error: "Карта не найдена" }); return; }
    const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, card.ownerId)).limit(1);
    res.json(formatCard(card, owner.username));
  } catch (err) {
    req.log.error({ err }, "GetCard error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.patch("/cards/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const { cardTheme, mediaUrl, mediaType } = req.body;
  try {
    const [existing] = await db.select().from(cardsTable).where(and(eq(cardsTable.id, id), eq(cardsTable.ownerId, req.userId!))).limit(1);
    if (!existing) { res.status(404).json({ error: "Карта не найдена" }); return; }
    const updates: Record<string, unknown> = {};
    if (cardTheme !== undefined) updates.cardTheme = cardTheme;
    if (mediaUrl !== undefined) updates.mediaUrl = mediaUrl;
    if (mediaType !== undefined) updates.mediaType = mediaType;
    const [card] = await db.update(cardsTable).set(updates).where(eq(cardsTable.id, id)).returning();
    const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, card.ownerId)).limit(1);
    res.json(formatCard(card, owner.username));
  } catch (err) {
    req.log.error({ err }, "UpdateCard error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.delete("/cards/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  try {
    const [existing] = await db.select().from(cardsTable).where(and(eq(cardsTable.id, id), eq(cardsTable.ownerId, req.userId!))).limit(1);
    if (!existing) { res.status(404).json({ error: "Карта не найдена" }); return; }
    await db.delete(cardsTable).where(eq(cardsTable.id, id));
    // Remove primary if deleted
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (user.primaryCardId === id) {
      const remaining = await db.select().from(cardsTable).where(eq(cardsTable.ownerId, req.userId!)).limit(1);
      await db.update(usersTable).set({ primaryCardId: remaining[0]?.id || null }).where(eq(usersTable.id, req.userId!));
    }
    res.json({ message: "Карта удалена" });
  } catch (err) {
    req.log.error({ err }, "DeleteCard error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/cards/:id/set-primary", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  try {
    const [existing] = await db.select().from(cardsTable).where(and(eq(cardsTable.id, id), eq(cardsTable.ownerId, req.userId!))).limit(1);
    if (!existing) { res.status(404).json({ error: "Карта не найдена" }); return; }
    // Unset all primary
    await db.update(cardsTable).set({ isPrimary: false }).where(eq(cardsTable.ownerId, req.userId!));
    // Set new primary
    const [card] = await db.update(cardsTable).set({ isPrimary: true }).where(eq(cardsTable.id, id)).returning();
    await db.update(usersTable).set({ primaryCardId: id }).where(eq(usersTable.id, req.userId!));
    const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, card.ownerId)).limit(1);
    res.json(formatCard(card, owner.username));
  } catch (err) {
    req.log.error({ err }, "SetPrimary error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export { formatCard };
export default router;
