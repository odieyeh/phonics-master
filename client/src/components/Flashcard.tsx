import React, { useState } from "react";
import { Volume2, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Vocabulary } from "@shared/types";

interface FlashcardProps {
  vocabulary: Vocabulary;
  onRecordWord: (audioUrl: string) => Promise<void>;
  onRecordSentence: (audioUrl: string) => Promise<void>;
  isLoading?: boolean;
}

export function Flashcard({
  vocabulary,
  onRecordWord,
  onRecordSentence,
  isLoading = false,
}: FlashcardProps) {
  const [isRecordingWord, setIsRecordingWord] = useState(false);
  const [isRecordingSentence, setIsRecordingSentence] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const startRecording = async (type: "word" | "sentence") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (type === "word") {
          setIsRecordingWord(false);
          await onRecordWord(audioUrl);
        } else {
          setIsRecordingSentence(false);
          await onRecordSentence(audioUrl);
        }

        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);

      if (type === "word") {
        setIsRecordingWord(true);
      } else {
        setIsRecordingSentence(true);
      }
    } catch (error) {
      console.error("Error accessing microphone:", error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  const playAudio = (audioUrl?: string) => {
    if (!audioUrl) {
      console.log("No audio URL provided");
      return;
    }
    try {
      const audio = new Audio(audioUrl);
      audio.crossOrigin = "anonymous";
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    } catch (error) {
      console.error("Error creating audio:", error);
    }
  };

  return (
    <div className="card-elegant mx-auto max-w-2xl">
      {/* Word Section */}
      <div className="mb-8 space-y-4">
        <div className="text-center">
          <h1 className="gradient-text mb-2 text-5xl font-[700]">
            {vocabulary.word}
          </h1>
          <p className="text-lg text-muted-foreground">{vocabulary.ipa}</p>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => playAudio(vocabulary.wordAudioUrl || undefined)}
            disabled={!vocabulary.wordAudioUrl || isLoading}
            className="gap-2"
          >
            <Volume2 className="h-5 w-5" />
            Play Word
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={() =>
              isRecordingWord ? stopRecording() : startRecording("word")
            }
            disabled={isLoading}
            className="gap-2"
          >
            {isRecordingWord ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Record Word
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Divider */}
      <div className="my-8 border-t border-border" />

      {/* Example Sentence Section */}
      <div className="space-y-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-muted-foreground">
            Example Sentence
          </p>
          <p className="text-lg leading-relaxed text-foreground">
            {vocabulary.exampleSentence}
          </p>
        </div>

        <div className="flex justify-center gap-3">
          <Button
            variant="outline"
            size="lg"
            onClick={() => playAudio(vocabulary.sentenceAudioUrl || undefined)}
            disabled={!vocabulary.sentenceAudioUrl || isLoading}
            className="gap-2"
          >
            <Volume2 className="h-5 w-5" />
            Play Sentence
          </Button>

          <Button
            variant="default"
            size="lg"
            onClick={() =>
              isRecordingSentence
                ? stopRecording()
                : startRecording("sentence")
            }
            disabled={isLoading}
            className="gap-2"
          >
            {isRecordingSentence ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Recording...
              </>
            ) : (
              <>
                <Mic className="h-5 w-5" />
                Record Sentence
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
