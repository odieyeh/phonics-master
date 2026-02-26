import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// Mock admin user context
const createAdminContext = (userId: number = 1): TrpcContext => ({
  user: {
    id: userId,
    openId: `admin-user-${userId}`,
    email: `admin${userId}@example.com`,
    name: `Admin User ${userId}`,
    loginMethod: "manus",
    role: "admin",
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

// Mock regular user context
const createUserContext = (userId: number = 2): TrpcContext => ({
  user: {
    id: userId,
    openId: `user-${userId}`,
    email: `user${userId}@example.com`,
    name: `User ${userId}`,
    loginMethod: "manus",
    role: "user",
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

describe("Admin Vocabulary Management", () => {
  describe("vocabulary.listAll", () => {
    it("should allow admin to list all vocabularies", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.vocabulary.listAll({ limit: 10, offset: 0 });
      expect(Array.isArray(result)).toBe(true);
    });

    it("should deny regular user from listing all vocabularies", async () => {
      const caller = appRouter.createCaller(createUserContext());
      try {
        await caller.vocabulary.listAll({ limit: 10, offset: 0 });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Only admins");
      }
    });
  });

  describe("vocabulary.create", () => {
    it("should allow admin to create vocabulary", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const ts = Date.now();
      const result = await caller.vocabulary.create({
        word: `test_${ts}`,
        ipa: "test",
        exampleSentence: "This is a test.",
        difficulty: "beginner",
      });
      expect(result.success).toBe(true);
    });

    it("should deny regular user from creating vocabulary", async () => {
      const caller = appRouter.createCaller(createUserContext());
      try {
        const ts = Date.now();
        await caller.vocabulary.create({
          word: `test_user_${ts}`,
          ipa: "test",
          exampleSentence: "This is a test.",
          difficulty: "beginner",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Only admins");
      }
    });
  });

  describe("vocabulary.update", () => {
    it("should allow admin to update vocabulary", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.vocabulary.update({
        id: 1,
        word: "updated",
      });
      expect(result.success).toBe(true);
    });

    it("should deny regular user from updating vocabulary", async () => {
      const caller = appRouter.createCaller(createUserContext());
      try {
        await caller.vocabulary.update({
          id: 1,
          word: "updated",
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Only admins");
      }
    });
  });

  describe("vocabulary.delete", () => {
    it("should allow admin to delete vocabulary", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const result = await caller.vocabulary.delete({ id: 999 });
      expect(result.success).toBe(true);
    });

    it("should deny regular user from deleting vocabulary", async () => {
      const caller = appRouter.createCaller(createUserContext());
      try {
        await caller.vocabulary.delete({ id: 1 });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Only admins");
      }
    });
  });

  describe("vocabulary.bulkCreate", () => {
    it("should allow admin to bulk create vocabularies", async () => {
      const caller = appRouter.createCaller(createAdminContext());
      const ts = Date.now();
      const result = await caller.vocabulary.bulkCreate({
        vocabularies: [
          {
            word: `bulk1_${ts}`,
            ipa: "bulk1",
            exampleSentence: "Bulk test 1.",
            difficulty: "beginner",
          },
          {
            word: `bulk2_${ts}`,
            ipa: "bulk2",
            exampleSentence: "Bulk test 2.",
            difficulty: "intermediate",
          },
        ],
      });
      expect(result.success).toBe(true);
      expect(result.count).toBe(2);
    });

    it("should deny regular user from bulk creating vocabularies", async () => {
      const caller = appRouter.createCaller(createUserContext());
      try {
        const ts = Date.now();
        await caller.vocabulary.bulkCreate({
          vocabularies: [
            {
              word: `bulk_user_${ts}`,
              ipa: "bulk1",
              exampleSentence: "Bulk test 1.",
              difficulty: "beginner",
            },
          ],
        });
        expect.fail("Should have thrown an error");
      } catch (error: any) {
        expect(error.message).toContain("Only admins");
      }
    });
  });
});
