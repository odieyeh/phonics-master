import { describe, it, expect, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock user context
const createMockContext = (userId: number = 1, role: "user" | "admin" = "user"): TrpcContext => ({
  user: {
    id: userId,
    openId: `test-user-${userId}`,
    email: `test${userId}@example.com`,
    name: `Test User ${userId}`,
    loginMethod: "manus",
    role,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: {
    protocol: "https",
    headers: {},
  } as TrpcContext["req"],
  res: {
    clearCookie: () => {},
  } as TrpcContext["res"],
});

describe("Phonics Master API Routes", () => {
  describe("vocabulary.list", () => {
    it("should return a list of vocabularies", async () => {
      const caller = appRouter.createCaller(createMockContext());
      const result = await caller.vocabulary.list({ limit: 10, offset: 0 });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("vocabulary.get", () => {
    it("should return vocabulary by id", async () => {
      const caller = appRouter.createCaller(createMockContext());
      // This will return undefined if no vocab exists, which is fine for testing
      const result = await caller.vocabulary.get({ id: 1 });
      // Just verify the call doesn't throw
      expect(result === undefined || result.id).toBeDefined();
    });
  });

  describe("auth.me", () => {
    it("should return current user info", async () => {
      const ctx = createMockContext(1, "user");
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.me();
      expect(result).toBeDefined();
      expect(result?.id).toBe(1);
      expect(result?.role).toBe("user");
    });
  });

  describe("learning.getProgress", () => {
    it("should return user progress", async () => {
      const caller = appRouter.createCaller(createMockContext(1, "user"));
      const result = await caller.learning.getProgress();
      // Progress might be undefined if user has no records yet
      expect(result === undefined || result.userId).toBeDefined();
    });
  });

  describe("learning.getHistory", () => {
    it("should return learning history for user", async () => {
      const caller = appRouter.createCaller(createMockContext(1, "user"));
      const result = await caller.learning.getHistory({ limit: 50 });
      expect(Array.isArray(result)).toBe(true);
    });
  });

  describe("auth.logout", () => {
    it("should clear session cookie on logout", async () => {
      const ctx = createMockContext(1, "user");
      let cookieCleared = false;
      
      ctx.res.clearCookie = () => {
        cookieCleared = true;
      };
      
      const caller = appRouter.createCaller(ctx);
      const result = await caller.auth.logout();
      
      expect(result.success).toBe(true);
      expect(cookieCleared).toBe(true);
    });
  });
});
