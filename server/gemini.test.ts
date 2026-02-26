import { describe, it, expect } from "vitest";
import { scorePronunciation } from "./pronunciation-scorer";

describe("Gemini API Integration", () => {
  it("should validate Gemini API key by calling scorePronunciation", async () => {
    // This test validates that the Gemini API key is properly configured
    // by attempting to score a simple pronunciation
    
    const result = await scorePronunciation(
      "https://example.com/test-audio.mp3", // Mock audio URL
      "hello", // Test word
      "həˈloʊ", // IPA
      "word"
    );

    // Check that we get a valid response structure
    expect(result).toBeDefined();
    expect(result.score).toBeDefined();
    expect(typeof result.score).toBe("number");
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
    
    expect(result.performanceLevel).toBeDefined();
    expect(["excellent", "good", "keep_practicing"]).toContain(
      result.performanceLevel
    );
    
    expect(result.feedback).toBeDefined();
    expect(typeof result.feedback).toBe("string");
    expect(result.feedback.length).toBeGreaterThan(0);
  }, { timeout: 30000 });
});
