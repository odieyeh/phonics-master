import { storagePut } from "./storage";
import { nanoid } from "nanoid";
import ffmpeg from "fluent-ffmpeg";
import { writeFileSync, unlinkSync, readFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

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
  
  // Convert WebM to MP3 if needed
  let finalBuffer = audioBuffer;
  let finalExt = getFileExtension(fileName);
  
  if (fileName.toLowerCase().endsWith(".webm")) {
    try {
      finalBuffer = await convertWebmToMp3(audioBuffer);
      finalExt = ".mp3";
    } catch (error) {
      console.warn("[Audio Service] WebM conversion failed, uploading as-is:", error);
    }
  }
  
  const relKey = `audio/${type}/${fileId}${finalExt}`;
  const contentType = getContentType(finalExt);

  try {
    const result = await storagePut(relKey, finalBuffer, contentType);
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
 * Convert WebM audio to MP3 format
 */
async function convertWebmToMp3(audioBuffer: Buffer | Uint8Array | string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const inputPath = join(tmpdir(), `audio-${nanoid(8)}.webm`);
    const outputPath = join(tmpdir(), `audio-${nanoid(8)}.mp3`);
    
    try {
      // Write buffer to temporary file
      const buffer = Buffer.isBuffer(audioBuffer) ? audioBuffer : Buffer.from(audioBuffer);
      writeFileSync(inputPath, buffer);
      
      // Convert using ffmpeg
      ffmpeg(inputPath)
        .toFormat("mp3")
        .on("error", (err: Error) => {
          unlinkSync(inputPath);
          reject(new Error(`FFmpeg conversion error: ${err.message}`));
        })
        .on("end", () => {
          try {
            const mp3Buffer = readFileSync(outputPath);
            unlinkSync(inputPath);
            unlinkSync(outputPath);
            resolve(mp3Buffer);
          } catch (error) {
            reject(error);
          }
        })
        .save(outputPath);
    } catch (error) {
      try {
        unlinkSync(inputPath);
      } catch {}
      reject(error);
    }
  });
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
  // Always return .mp3 for audio files since we convert WebM to MP3
  return ".mp3";
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
