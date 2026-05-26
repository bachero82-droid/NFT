import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable, cardsTable, transactionsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { signToken, requireAuth, type AuthRequest } from "../middlewares/auth";

const router = Router();

function generateCardNumber(): string {
  const rare = ["7777", "1111", "8888", "9999", "0000"];
  const groups: string[] = [];
  for (let i = 0; i < 4; i++) {
    if (i === 0 && Math.random() < 0.05) {
      groups.push(rare[Math.floor(Math.random() * rare.length)]);
    } else {
      groups.push(String(Math.floor(1000 + Math.random() * 9000)));
    }
  }
  return groups.join(" ");
}

function generateCvv(): string {
  const rares = ["000", "111", "777", "999"];
  if (Math.random() < 0.05) return rares[Math.floor(Math.random() * rares.length)];
  return String(Math.floor(100 + Math.random() * 900));
}

function generateNftId(): string {
  return "VEX-" + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function determineRarity(cardNumber: string, cvv: string): string {
  const digits = cardNumber.replace(/\s/g, "");
  const allSame = /^(\d)\1+$/.test(digits);
  const sequential = digits === "12345678" || digits === "87654321";
  if (allSame && cvv === "777") return "mythic";
  if (allSame) return "legendary";
  if (sequential) return "epic";
  if (["000", "111", "777", "999"].includes(cvv)) return "rare";
  return "common";
}

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    avatarUrl: user.avatarUrl,
    balance: parseFloat(user.balance),
    primaryCardId: user.primaryCardId,
    createdAt: user.createdAt.toISOString(),
  };
}

router.post("/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ error: "Все поля обязательны" });
    return;
  }
  try {
    const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (existing.length > 0) {
      res.status(400).json({ error: "Email уже используется" });
      return;
    }
    const existingUser = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1);
    if (existingUser.length > 0) {
      res.status(400).json({ error: "Имя пользователя уже занято" });
      return;
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const [user] = await db.insert(usersTable).values({ username, email, passwordHash, balance: "5000" }).returning();

    // Create initial card
    const cardNumber = generateCardNumber();
    const cvv = generateCvv();
    const rarity = determineRarity(cardNumber, cvv);
    const [card] = await db.insert(cardsTable).values({
      ownerId: user.id,
      cardNumber,
      cvv,
      rarity,
      nftId: generateNftId(),
      cardTheme: "default",
      isPrimary: true,
    }).returning();

    // Set primaryCardId and record initial balance transaction
    await db.update(usersTable).set({ primaryCardId: card.id }).where(eq(usersTable.id, user.id));
    await db.insert(transactionsTable).values({
      receiverId: user.id,
      amount: "5000",
      type: "initial_balance",
      description: "Стартовый баланс VEX",
    });

    const updatedUser = await db.select().from(usersTable).where(eq(usersTable.id, user.id)).limit(1);
    const token = signToken(user.id);
    res.status(201).json({ user: formatUser(updatedUser[0]), token });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "Email и пароль обязательны" });
    return;
  }
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
    if (!user) {
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      res.status(401).json({ error: "Неверный email или пароль" });
      return;
    }
    const token = signToken(user.id);
    res.json({ user: formatUser(user), token });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

router.post("/auth/logout", (_req, res) => {
  res.json({ message: "Выход выполнен" });
});

router.get("/auth/me", requireAuth, async (req: AuthRequest, res) => {
  try {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.userId!)).limit(1);
    if (!user) { res.status(401).json({ error: "Пользователь не найден" }); return; }
    res.json(formatUser(user));
  } catch (err) {
    req.log.error({ err }, "GetMe error");
    res.status(500).json({ error: "Ошибка сервера" });
  }
});

export { formatUser, generateCardNumber, generateCvv, generateNftId, determineRarity };
export default router;
