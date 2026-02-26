import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAdminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Admin User",
    loginMethod: "manus",
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

function createUserContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "regular-user",
    email: "user@example.com",
    name: "Regular User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };

  return ctx;
}

describe("unit management", () => {
  it("should list units", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.unit.list({ limit: 10, offset: 0 });
    expect(Array.isArray(result)).toBe(true);
  });

  it("should create a unit as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.unit.create({
      name: "Test Unit 1",
      description: "This is a test unit",
      order: 1,
    });

    expect(result.success).toBe(true);
  });

  it("should not allow regular users to create units", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.unit.create({
        name: "Unauthorized Unit",
        description: "Should fail",
        order: 1,
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Only admins can create units");
    }
  });

  it("should update a unit as admin", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    // Create a unit first
    await caller.unit.create({
      name: "Original Unit",
      description: "Original description",
      order: 1,
    });

    // Update it
    const result = await caller.unit.update({
      id: 1,
      name: "Updated Unit",
      description: "Updated description",
    });

    expect(result.success).toBe(true);
  });

  it("should not allow regular users to update units", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.unit.update({
        id: 1,
        name: "Unauthorized Update",
      });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Only admins can update units");
    }
  });

  it("should not allow regular users to delete units", async () => {
    const ctx = createUserContext();
    const caller = appRouter.createCaller(ctx);

    try {
      await caller.unit.delete({ id: 1 });
      expect.fail("Should have thrown an error");
    } catch (error: any) {
      expect(error.message).toContain("Only admins can delete units");
    }
  });

  it("should get vocabularies by unit", async () => {
    const ctx = createAdminContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.unit.getVocabularies({
      unitId: 1,
      limit: 10,
      offset: 0,
    });

    expect(Array.isArray(result)).toBe(true);
  });
});
