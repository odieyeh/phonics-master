import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar, json } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Units (chapters/modules) table: organizes vocabularies into learning units
 */
export const units = mysqlTable("units", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  description: text("description"),
  order: int("order").default(0), // display order
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Unit = typeof units.$inferSelect;
export type InsertUnit = typeof units.$inferInsert;

/**
 * Vocabulary table: stores English words with phonetic transcription and example sentences
 */
export const vocabularies = mysqlTable("vocabularies", {
  id: int("id").autoincrement().primaryKey(),
  unitId: int("unitId"), // reference to unit (optional, for organizing vocabularies)
  word: varchar("word", { length: 100 }).notNull().unique(),
  ipa: varchar("ipa", { length: 100 }).notNull(), // IPA phonetic transcription
  exampleSentence: text("exampleSentence").notNull(),
  wordAudioUrl: varchar("wordAudioUrl", { length: 500 }), // TTS audio URL for the word
  sentenceAudioUrl: varchar("sentenceAudioUrl", { length: 500 }), // TTS audio URL for the sentence
  difficulty: mysqlEnum("difficulty", ["beginner", "intermediate", "advanced"]).default("beginner"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Vocabulary = typeof vocabularies.$inferSelect;
export type InsertVocabulary = typeof vocabularies.$inferInsert;

/**
 * Learning records: tracks user's pronunciation practice and scores
 */
export const learningRecords = mysqlTable("learningRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  vocabularyId: int("vocabularyId").notNull(),
  recordType: mysqlEnum("recordType", ["word", "sentence"]).notNull(), // whether recording is for word or sentence
  studentAudioUrl: varchar("studentAudioUrl", { length: 500 }).notNull(), // URL to student's recording
  score: int("score").notNull(), // 0-100 pronunciation score
  performanceLevel: mysqlEnum("performanceLevel", ["excellent", "good", "keep_practicing"]).notNull(),
  feedback: text("feedback").notNull(), // child-friendly feedback from Gemini
  aiAnalysis: json("aiAnalysis"), // detailed analysis from Gemini (optional)
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type LearningRecord = typeof learningRecords.$inferSelect;
export type InsertLearningRecord = typeof learningRecords.$inferInsert;

/**
 * User progress summary: aggregate statistics for each user
 */
export const userProgress = mysqlTable("userProgress", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  totalPracticeCount: int("totalPracticeCount").default(0),
  averageScore: decimal("averageScore", { precision: 5, scale: 2 }).default("0"),
  excellentCount: int("excellentCount").default(0),
  goodCount: int("goodCount").default(0),
  keepPracticingCount: int("keepPracticingCount").default(0),
  lastPracticeDate: timestamp("lastPracticeDate"),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;

/**
 * Pronunciation score result from Gemini AI
 */
export interface PronunciationScore {
  score: number; // 0-100
  performanceLevel: "excellent" | "good" | "keep_practicing";
  feedback: string; // child-friendly feedback
  analysis?: {
    strengths: string[];
    areasToImprove: string[];
    tips: string[];
  };
}