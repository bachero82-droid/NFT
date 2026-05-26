import { Router } from "express";
import { db, marketplaceTable, cardsTable, usersTable, transactionsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { formatCard } from "./cards";

const router = Router();

async function buildListing(listing: typeof marketplaceTable.$inferSelect) {
  const [card] = await db.select().from(cardsTable).where(eq(cardsTable.id, listing.cardId)).limit(1);
  if (!card) return null;
  const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, listing.sellerId)).limit(1);
  if (!seller) return null;
  const [owner] = await db.select().from(usersTable).where(eq(usersTable.id, card.ownerId)).limit(1);
  if (!owner) return null;
  return {
    id: listing.id,
    card: formatCard(card, owner.username),
    sellerId: listing.sellerId,
    sellerUsername: seller.username,
    price: parseFloat(listing.price as string),
    status: listing.status,
    createdAt: listing.createdAt.toISOString(),
  };
}

router.get("/marketplace", async (req, res) => {
  try {
    const { rarity } = req.query;
    let listings = await db.select().from(marketplaceTable)
      .where(eq(marketplaceTable.status, "active"))
      .orderBy(desc(marketplaceTable.createdAt));

    if (rarity && typeof rarity === "string") {
      const cardIds = (await db.select().from(cardsTable).where(eq(cardsTable.rarity, rarity))).map(c => c.id);
      listings = listings.filter(l => cardIds.includes(l.cardId));
    }

    const built = await Promise.all(listings.map(buildListing));
    res.json(built.filter(Boolean));
  } catch (err) {
    req.log.error({ err }, "GetMarket error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.get("/marketplace/trending", async (req, res) => {
  try {
    const listings = await db.select().from(marketplaceTable)
      .where(eq(marketplaceTable.status, "active"))
      .orderBy(desc(marketplaceTable.price))
      .limit(10);
    const built = await Promise.all(listings.map(buildListing));
    res.json(built.filter(Boolean));
  } catch (err) {
    req.log.error({ err }, "Trending error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/marketplace/listings", requireAuth, async (req: AuthRequest, res) => {
  const { cardId, price } = req.body;
  if (!cardId || !price || price <= 0) {
    res.status(400).json({ error: "Некорректные данные" });
    return;
  }
  try {
    const [card] = await db.select().from(cardsTable)
      .where(and(eq(cardsTable.id, cardId), eq(cardsTable.ownerId, req.userId!)))
      .limit(1);
    if (!card) { res.status(404).json({ error: "Карта не найдена" }); return; }
    // Check not already listed
    const existing = await db.select().from(marketplaceTable)
      .where(and(eq(marketplaceTable.cardId, cardId), eq(marketplaceTable.status, "active")))
      .limit(1);
    if (existing.length > 0) { res.status(400).json({ error: "Карта уже выставлена на продажу" }); return; }

    const [listing] = await db.insert(marketplaceTable).values({
      cardId,
      sellerId: req.userId!,
      price: String(price),
      status: "active",
    }).returning();
    res.status(201).json(await buildListing(listing));
  } catch (err) {
    req.log.error({ err }, "CreateListing error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.delete("/marketplace/listings/:id", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  try {
    const [listing] = await db.select().from(marketplaceTable)
      .where(and(eq(marketplaceTable.id, id), eq(marketplaceTable.sellerId, req.userId!)))
      .limit(1);
    if (!listing) { res.status(404).json({ error: "Объявление не найдено" }); return; }
    await db.update(marketplaceTable).set({ status: "cancelled" }).where(eq(marketplaceTable.id, id));
    res.json({ message: "Объявление снято" });
  } catch (err) {
    req.log.error({ err }, "DeleteListing error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/marketplace/listings/:id/buy", requireAuth, async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  try {
    const [listing] = await db.select().from(marketplaceTable)
      .where(and(eq(marketplaceTable.id, id), eq(marketplaceTable.status, "active")))
      .limit(1);
    if (!listing) { res.status(404).json({ error: "Объявление не найдено" }); return; }
    if (listing.sellerId === req.userId) { res.status(400).json({ error: "Нельзя купить собственную карту" }); return; }

    const price = parseFloat(listing.price as string);
    const [buyer] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (parseFloat(buyer.balance as string) < price) { res.status(400).json({ error: "Недостаточно средств" }); return; }

    const [seller] = await db.select().from(usersTable).where(eq(usersTable.id, listing.sellerId)).limit(1);

    // Transfer coins
    await db.update(usersTable).set({ balance: String(parseFloat(buyer.balance as string) - price) }).where(eq(usersTable.id, req.userId!));
    await db.update(usersTable).set({ balance: String(parseFloat(seller.balance as string) + price) }).where(eq(usersTable.id, listing.sellerId));

    // Transfer card
    const [card] = await db.update(cardsTable).set({ ownerId: req.userId!, isPrimary: false }).where(eq(cardsTable.id, listing.cardId)).returning();

    // Close listing
    await db.update(marketplaceTable).set({ status: "sold" }).where(eq(marketplaceTable.id, id));

    // Transactions
    await db.insert(transactionsTable).values({
      senderId: req.userId!,
      receiverId: listing.sellerId,
      amount: String(price),
      type: "card_purchase",
      description: `Покупка карты ${card.nftId}`,
    });
    await db.insert(transactionsTable).values({
      senderId: req.userId!,
      receiverId: listing.sellerId,
      amount: String(price),
      type: "card_sale",
      description: `Продажа карты ${card.nftId}`,
    });

    const [newOwner] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    res.json(formatCard(card, newOwner.username));
  } catch (err) {
    req.log.error({ err }, "BuyListing error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export default router;
