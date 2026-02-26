import { drizzle } from "drizzle-orm/mysql2";
import { vocabularies } from "./drizzle/schema.ts";

const db = drizzle(process.env.DATABASE_URL);

const childVocabularies = [
  {
    word: "apple",
    ipa: "ˈæpəl",
    exampleSentence: "I eat a red apple every day.",
    difficulty: "beginner",
    wordAudioUrl: null,
    sentenceAudioUrl: null,
  },
  {
    word: "cat",
    ipa: "kæt",
    exampleSentence: "The cat is sleeping on the mat.",
    difficulty: "beginner",
    wordAudioUrl: null,
    sentenceAudioUrl: null,
  },
  {
    word: "dog",
    ipa: "dɔːɡ",
    exampleSentence: "My dog loves to play in the park.",
    difficulty: "beginner",
    wordAudioUrl: null,
    sentenceAudioUrl: null,
  },
  {
    word: "happy",
    ipa: "ˈhæpi",
    exampleSentence: "She is very happy today.",
    difficulty: "beginner",
    wordAudioUrl: null,
    sentenceAudioUrl: null,
  },
  {
    word: "water",
    ipa: "ˈwɔːtər",
    exampleSentence: "Please drink some water.",
    difficulty: "beginner",
    wordAudioUrl: null,
    sentenceAudioUrl: null,
  },
];

async function seed() {
  try {
    console.log("Seeding vocabularies...");
    await db.insert(vocabularies).values(childVocabularies);
    console.log("✅ Successfully seeded 5 vocabularies!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding vocabularies:", error);
    process.exit(1);
  }
}

seed();
