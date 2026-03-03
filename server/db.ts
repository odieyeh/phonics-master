import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, vocabularies, learningRecords, userProgress, InsertVocabulary, InsertLearningRecord, InsertUserProgress, units, Unit, InsertUnit } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Vocabulary queries
 */
export async function getVocabularies(limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vocabularies).limit(limit).offset(offset);
}

export async function getVocabularyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(vocabularies).where(eq(vocabularies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createVocabulary(vocab: InsertVocabulary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(vocabularies).values(vocab);
}

/**
 * Learning record queries
 */
export async function createLearningRecord(record: InsertLearningRecord) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(learningRecords).values(record);
}

export async function getUserLearningRecords(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(learningRecords).where(eq(learningRecords.userId, userId)).limit(limit);
}

/**
 * User progress queries
 */
export async function getUserProgress(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(userProgress).where(eq(userProgress.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertUserProgress(userId: number, data: Partial<InsertUserProgress>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getUserProgress(userId);
  if (existing) {
    await db.update(userProgress).set(data).where(eq(userProgress.userId, userId));
  } else {
    await db.insert(userProgress).values({ userId, ...data });
  }
}

/**
 * Vocabulary management functions
 */
export async function updateVocabulary(id: number, vocab: Partial<InsertVocabulary>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(vocabularies).set(vocab).where(eq(vocabularies.id, id));
}

export async function deleteVocabulary(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(vocabularies).where(eq(vocabularies.id, id));
}

export async function getAllVocabularies(limit: number = 1000, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vocabularies).limit(limit).offset(offset);
}

export async function bulkCreateVocabularies(vocabs: InsertVocabulary[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  if (vocabs.length === 0) return;
  await db.insert(vocabularies).values(vocabs);
}

// ============ Unit Management ============

export async function getUnits(limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(units).orderBy(units.order).limit(limit).offset(offset);
}

export async function getUnitById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(units).where(eq(units.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUnit(unit: InsertUnit) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(units).values(unit);
  return result;
}

export async function updateUnit(id: number, unit: Partial<InsertUnit>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(units).set(unit).where(eq(units.id, id));
}

export async function deleteUnit(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Also update vocabularies to remove unitId reference
  await db.update(vocabularies).set({ unitId: null }).where(eq(vocabularies.unitId, id));
  await db.delete(units).where(eq(units.id, id));
}

export async function getVocabulariesByUnit(unitId: number, limit: number = 100, offset: number = 0) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vocabularies).where(eq(vocabularies.unitId, unitId)).limit(limit).offset(offset);
}

/**
 * Learning statistics queries
 */
export async function getUserLearningStats(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const records = await db.select().from(learningRecords).where(eq(learningRecords.userId, userId));
  
  if (records.length === 0) {
    return {
      totalPractices: 0,
      averageScore: 0,
      lastPracticeTime: null,
      recordCount: 0,
      excellentCount: 0,
      goodCount: 0,
      keepPracticingCount: 0,
    };
  }
  
  const totalScore = records.reduce((sum, r) => sum + r.score, 0);
  const averageScore = Math.round(totalScore / records.length);
  const lastPracticeTime = records[records.length - 1]?.createdAt;
  
  const excellentCount = records.filter(r => r.performanceLevel === 'excellent').length;
  const goodCount = records.filter(r => r.performanceLevel === 'good').length;
  const keepPracticingCount = records.filter(r => r.performanceLevel === 'keep_practicing').length;
  
  return {
    totalPractices: records.length,
    averageScore,
    lastPracticeTime,
    recordCount: records.length,
    excellentCount,
    goodCount,
    keepPracticingCount,
  };
}

export async function getAllUsersLearningStats() {
  const db = await getDb();
  if (!db) return [];
  
  const allUsers = await db.select().from(users);
  const stats: any[] = [];
  
  for (const user of allUsers) {
    const userStats = await getUserLearningStats(user.id);
    if (userStats && userStats.totalPractices > 0) {
      stats.push({
        userId: user.id,
        userName: user.name || user.email || 'Unknown',
        email: user.email,
        ...userStats,
      });
    }
  }
  
  return stats;
}
