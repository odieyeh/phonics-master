import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export interface AudioUploadResult {
  url: string;
  key: string;
}

/**
 * Upload audio file to S3 storage
 * @param audioBuffer - Audio file buffer (from base64 or blob)
 * @param fileName - Original file name
 * @param type - "word" or "sentence"
 * @returns URL and key for the uploaded audio
 */
export async function uploadAudio(
  audioBuffer: Buffer | Uint8Array | string,
  fileName: string,
  type: "word" | "sentence"
): Promise<AudioUploadResult> {
  // Generate unique file key
  const fileId = nanoid(8);
  const ext = getFileExtension(fileName);
  const relKey = `audio/${type}/${fileId}${ext}`;

  // Determine content type
  const contentType = getContentType(fileName);

  try {
    const result = await storagePut(relKey, audioBuffer, contentType);
    return {
      url: result.url,
      key: result.key,
    };
  } catch (error) {
    console.error("[Audio Service] Upload failed:", error);
    throw new Error(`Failed to upload audio: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
}

/**
 * Upload multiple audio files (word and sentence)
 */
export async function uploadAudioPair(
  wordAudio: { buffer: Buffer | Uint8Array | string; fileName: string } | null,
  sentenceAudio: { buffer: Buffer | Uint8Array | string; fileName: string } | null
): Promise<{ wordAudioUrl?: string; sentenceAudioUrl?: string }> {
  const results: { wordAudioUrl?: string; sentenceAudioUrl?: string } = {};

  if (wordAudio) {
    const uploaded = await uploadAudio(wordAudio.buffer, wordAudio.fileName, "word");
    results.wordAudioUrl = uploaded.url;
  }

  if (sentenceAudio) {
    const uploaded = await uploadAudio(sentenceAudio.buffer, sentenceAudio.fileName, "sentence");
    results.sentenceAudioUrl = uploaded.url;
  }

  return results;
}

/**
 * Get file extension from filename
 */
function getFileExtension(fileName: string): string {
  const match = fileName.match(/\.[^.]*$/);
  return match ? match[0] : ".mp3";
}

/**
 * Get content type from filename
 */
function getContentType(fileName: string): string {
  const ext = fileName.toLowerCase().split(".").pop();
  const mimeTypes: Record<string, string> = {
    mp3: "audio/mpeg",
    wav: "audio/wav",
    m4a: "audio/mp4",
    ogg: "audio/ogg",
    webm: "audio/webm",
    aac: "audio/aac",
  };
  return mimeTypes[ext || ""] || "audio/mpeg";
}

/**
 * Validate audio file
 */
export function validateAudioFile(
  file: File | { size: number; type: string }
): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    "audio/mpeg",
    "audio/wav",
    "audio/mp4",
    "audio/ogg",
    "audio/webm",
    "audio/aac",
  ];

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File size exceeds 10MB limit (${(file.size / 1024 / 1024).toFixed(2)}MB)`,
    };
  }

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Unsupported audio format: ${file.type}. Supported: MP3, WAV, M4A, OGG, WebM, AAC`,
    };
  }

  return { valid: true };
}
