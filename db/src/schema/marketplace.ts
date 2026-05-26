import { pgTable, serial, integer, numeric, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const marketplaceTable = pgTable("marketplace", {
  id: serial("id").primaryKey(),
  cardId: integer("card_id").notNull(),
  sellerId: integer("seller_id").notNull(),
  price: numeric("price", { precision: 18, scale: 2 }).notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertListingSchema = createInsertSchema(marketplaceTable).omit({ id: true, createdAt: true });
export type InsertListing = z.infer<typeof insertListingSchema>;
export type Listing = typeof marketplaceTable.$inferSelect;
