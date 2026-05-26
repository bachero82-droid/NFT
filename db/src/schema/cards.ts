import { pgTable, serial, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const cardsTable = pgTable("cards", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id").notNull(),
  cardNumber: text("card_number").notNull(),
  cvv: text("cvv").notNull(),
  rarity: text("rarity").notNull().default("common"),
  nftId: text("nft_id").notNull(),
  mediaUrl: text("media_url"),
  mediaType: text("media_type"),
  cardTheme: text("card_theme").notNull().default("default"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCardSchema = createInsertSchema(cardsTable).omit({ id: true, createdAt: true });
export type InsertCard = z.infer<typeof insertCardSchema>;
export type Card = typeof cardsTable.$inferSelect;
