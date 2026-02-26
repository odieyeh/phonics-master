import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getVocabularies, getVocabularyById, createVocabulary, createLearningRecord, getUserLearningRecords, getUserProgress, upsertUserProgress } from "./db";
import { scorePronunciation } from "./pronunciation-scorer";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  vocabulary: router({
    list: publicProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
      }))
      .query(async ({ input }) => {
        return getVocabularies(input.limit, input.offset);
      }),
    
    get: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return getVocabularyById(input.id);
      }),
    
    create: protectedProcedure
      .input(z.object({
        word: z.string(),
        ipa: z.string(),
        exampleSentence: z.string(),
        wordAudioUrl: z.string().optional(),
        sentenceAudioUrl: z.string().optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can create vocabularies");
        }
        await createVocabulary(input);
        return { success: true };
      }),
  }),

  learning: router({
    recordPronunciationManual: protectedProcedure
      .input(z.object({
        vocabularyId: z.number(),
        recordType: z.enum(["word", "sentence"]),
        studentAudioUrl: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Get vocabulary details
        const vocab = await getVocabularyById(input.vocabularyId);
        if (!vocab) {
          throw new Error("Vocabulary not found");
        }

        // Get target text based on record type
        const targetText = input.recordType === "word" ? vocab.word : vocab.exampleSentence;
        const targetIPA = vocab.ipa;

        // Score pronunciation using Gemini
        const scoreResult = await scorePronunciation(
          input.studentAudioUrl,
          targetText,
          targetIPA,
          input.recordType
        );

        // Save learning record
        await createLearningRecord({
          userId: ctx.user!.id,
          vocabularyId: input.vocabularyId,
          recordType: input.recordType,
          studentAudioUrl: input.studentAudioUrl,
          score: scoreResult.score,
          performanceLevel: scoreResult.performanceLevel,
          feedback: scoreResult.feedback,
          aiAnalysis: scoreResult.analysis,
        });

        // Update user progress
        const progress = await getUserProgress(ctx.user!.id);
        const levelCounts = {
          excellent: (progress?.excellentCount || 0) + (scoreResult.performanceLevel === "excellent" ? 1 : 0),
          good: (progress?.goodCount || 0) + (scoreResult.performanceLevel === "good" ? 1 : 0),
          keep_practicing: (progress?.keepPracticingCount || 0) + (scoreResult.performanceLevel === "keep_practicing" ? 1 : 0),
        };

        const totalCount = (progress?.totalPracticeCount || 0) + 1;
        const newAverage = progress?.averageScore
          ? ((parseFloat(progress.averageScore.toString()) * (totalCount - 1)) + scoreResult.score) / totalCount
          : scoreResult.score;

        await upsertUserProgress(ctx.user!.id, {
          totalPracticeCount: totalCount,
          averageScore: newAverage.toString(),
          excellentCount: levelCounts.excellent,
          goodCount: levelCounts.good,
          keepPracticingCount: levelCounts.keep_practicing,
          lastPracticeDate: new Date(),
        });

        return scoreResult;
      }),
    
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input, ctx }) => {
        return getUserLearningRecords(ctx.user!.id, input.limit);
      }),
    
    getProgress: protectedProcedure
      .query(async ({ ctx }) => {
        return getUserProgress(ctx.user!.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
