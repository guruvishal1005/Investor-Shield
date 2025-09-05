import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
});

export const advisors = pgTable("advisors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  regNumber: text("reg_number"),
  isRegistered: boolean("is_registered").notNull().default(false),
  complaintsCount: integer("complaints_count").notNull().default(0),
  trustScore: integer("trust_score").notNull().default(0),
  yearsExperience: integer("years_experience").notNull().default(0),
  specialization: text("specialization"),
});

export const apps = pgTable("apps", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  appName: text("app_name").notNull(),
  url: text("url"),
  developer: text("developer"),
  isLegit: boolean("is_legit").notNull().default(false),
  riskFactors: text("risk_factors").array(),
  recommendation: text("recommendation"),
});

export const reviews = pgTable("reviews", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  advisorId: varchar("advisor_id").notNull(),
  userId: varchar("user_id").notNull(),
  rating: integer("rating").notNull(),
  comment: text("comment").notNull(),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
  isVerified: boolean("is_verified").notNull().default(false),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
});

export const insertAdvisorSchema = createInsertSchema(advisors).omit({
  id: true,
});

export const insertAppSchema = createInsertSchema(apps).omit({
  id: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  timestamp: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const verifyAdvisorSchema = z.object({
  name: z.string().min(1),
  regNumber: z.string().optional(),
});

export const checkAppSchema = z.object({
  appName: z.string().min(1),
  url: z.string().url().optional(),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertAdvisor = z.infer<typeof insertAdvisorSchema>;
export type InsertApp = z.infer<typeof insertAppSchema>;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type User = typeof users.$inferSelect;
export type Advisor = typeof advisors.$inferSelect;
export type App = typeof apps.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type LoginData = z.infer<typeof loginSchema>;
export type VerifyAdvisorData = z.infer<typeof verifyAdvisorSchema>;
export type CheckAppData = z.infer<typeof checkAppSchema>;
