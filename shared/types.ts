/**
 * Unified type exports
 * Import shared types from this single entry point.
 */

export type * from "../drizzle/schema";
export * from "./_core/errors";

// Re-export types for client-side usage
export type { Vocabulary, LearningRecord, UserProgress, PronunciationScore, Unit } from "../drizzle/schema";
