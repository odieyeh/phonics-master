import { invokeLLM } from "./_core/llm";

export interface PronunciationScoreResult {
  score: number; // 0-100
  performanceLevel: "excellent" | "good" | "keep_practicing";
  feedback: string; // child-friendly feedback
  analysis?: {
    strengths: string[];
    areasToImprove: string[];
    tips: string[];
  };
}

/**
 * Use Gemini to evaluate pronunciation by comparing student audio with target pronunciation
 * @param studentAudioUrl - URL to the student's recorded audio
 * @param targetWord - The target word/sentence to pronounce
 * @param targetIPA - IPA transcription of the target (for reference)
 * @param recordType - whether this is for "word" or "sentence"
 */
export async function scorePronunciation(
  studentAudioUrl: string,
  targetWord: string,
  targetIPA: string,
  recordType: "word" | "sentence"
): Promise<PronunciationScoreResult> {
  try {
    // Use Gemini to analyze the audio
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are an expert English pronunciation coach for children. Your task is to evaluate a student's pronunciation of English ${recordType}s.

When evaluating, consider:
1. Accuracy of individual sounds (phonemes)
2. Stress and intonation (for sentences)
3. Clarity and articulation
4. Overall intelligibility

Respond with a JSON object containing:
- score: number from 0-100 (0=completely unintelligible, 50=acceptable, 100=native-like)
- performanceLevel: "excellent" (80-100), "good" (60-79), or "keep_practicing" (0-59)
- feedback: A short, encouraging message for a child (2-3 sentences max, positive tone)
- strengths: Array of 1-2 things the student did well
- areasToImprove: Array of 1-2 specific areas to work on
- tips: Array of 1-2 practical tips to improve

Keep the feedback simple, encouraging, and age-appropriate for children.`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Please evaluate this student's pronunciation of the ${recordType}: "${targetWord}" (IPA: ${targetIPA})`,
            },
            {
              type: "file_url",
              file_url: {
                url: studentAudioUrl,
                mime_type: "audio/mpeg",
              },
            },
          ],
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "pronunciation_score",
          strict: true,
          schema: {
            type: "object",
            properties: {
              score: {
                type: "integer",
                description: "Pronunciation score from 0 to 100",
              },
              performanceLevel: {
                type: "string",
                enum: ["excellent", "good", "keep_practicing"],
                description: "Performance level based on score",
              },
              feedback: {
                type: "string",
                description: "Child-friendly encouraging feedback",
              },
              strengths: {
                type: "array",
                items: { type: "string" },
                description: "Things the student did well",
              },
              areasToImprove: {
                type: "array",
                items: { type: "string" },
                description: "Areas to improve",
              },
              tips: {
                type: "array",
                items: { type: "string" },
                description: "Practical tips for improvement",
              },
            },
            required: ["score", "performanceLevel", "feedback", "strengths", "areasToImprove", "tips"],
            additionalProperties: false,
          },
        },
      },
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("Invalid response from Gemini");
    }

    const parsed = JSON.parse(content);

    return {
      score: Math.max(0, Math.min(100, parsed.score)),
      performanceLevel: parsed.performanceLevel,
      feedback: parsed.feedback,
      analysis: {
        strengths: parsed.strengths || [],
        areasToImprove: parsed.areasToImprove || [],
        tips: parsed.tips || [],
      },
    };
  } catch (error) {
    console.error("Error scoring pronunciation:", error);
    // Return a default response if Gemini fails
    return {
      score: 50,
      performanceLevel: "keep_practicing",
      feedback: "Great effort! Keep practicing to improve your pronunciation.",
      analysis: {
        strengths: ["You gave it a try!"],
        areasToImprove: ["Practice more to improve"],
        tips: ["Listen to native speakers and repeat"],
      },
    };
  }
}
