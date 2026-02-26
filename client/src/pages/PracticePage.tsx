import React, { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight, ArrowLeft, Home } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Flashcard } from "@/components/Flashcard";
import { ScoreResult } from "@/components/ScoreResult";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { Vocabulary, PronunciationScore } from "@shared/types";

type PageState = "loading" | "flashcard" | "scoring" | "result";

export default function PracticePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [pageState, setPageState] = useState<PageState>("loading");
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scoreResult, setScoreResult] = useState<PronunciationScore | null>(
    null
  );
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Fetch vocabularies
  const { data: vocabData, isLoading: isVocabLoading } =
    trpc.vocabulary.list.useQuery({
      limit: 50,
      offset: 0,
    });

  // Evaluate pronunciation mutation
  const evaluateMutation = trpc.learning.recordPronunciationManual.useMutation();

  useEffect(() => {
    if (vocabData && vocabData.length > 0) {
      setVocabularies(vocabData);
      setPageState("flashcard");
    } else if (!isVocabLoading && (!vocabData || vocabData.length === 0)) {
      setPageState("loading");
    }
  }, [vocabData, isVocabLoading]);

  const currentVocab = vocabularies[currentIndex];

  const handleRecordWord = async (audioUrl: string) => {
    if (!currentVocab || !user) return;

    setIsEvaluating(true);
    setPageState("scoring");

    try {
      // Convert blob URL to file and upload
      const response = await fetch(audioUrl);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");

      // Upload to S3 (using your storage service)
      // For now, we'll use the blob URL directly
      const result = await evaluateMutation.mutateAsync({
        vocabularyId: currentVocab.id,
        recordType: "word",
        studentAudioUrl: audioUrl,
      });

      setScoreResult(result);
      setPageState("result");
    } catch (error) {
      console.error("Error evaluating pronunciation:", error);
      toast.error("Failed to evaluate pronunciation. Please try again.");
      setPageState("flashcard");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRecordSentence = async (audioUrl: string) => {
    if (!currentVocab || !user) return;

    setIsEvaluating(true);
    setPageState("scoring");

    try {
      const result = await evaluateMutation.mutateAsync({
        vocabularyId: currentVocab.id,
        recordType: "sentence",
        studentAudioUrl: audioUrl,
      });

      setScoreResult(result);
      setPageState("result");
    } catch (error) {
      console.error("Error evaluating pronunciation:", error);
      toast.error("Failed to evaluate pronunciation. Please try again.");
      setPageState("flashcard");
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setScoreResult(null);
      setPageState("flashcard");
    } else {
      toast.success("Great job! You've completed all words.");
      setCurrentIndex(0);
      setScoreResult(null);
      setPageState("flashcard");
    }
  };

  const handleRetry = () => {
    setScoreResult(null);
    setPageState("flashcard");
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setScoreResult(null);
      setPageState("flashcard");
    }
  };

  if (pageState === "loading" || isVocabLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <p className="text-lg text-muted-foreground">Loading vocabularies...</p>
        </div>
      </div>
    );
  }

  if (!currentVocab) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            No vocabularies available. Please check back later.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 px-4 py-8">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="gradient-text text-4xl font-bold">Phonics Master</h1>
            <p className="text-muted-foreground">
              Practice {currentIndex + 1} of {vocabularies.length}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => setLocation("/")}
            >
              <Home className="h-4 w-4" />
              Home
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-8 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
            style={{
              width: `${((currentIndex + 1) / vocabularies.length) * 100}%`,
            }}
          />
        </div>

        {/* Main content */}
        {pageState === "flashcard" && (
          <Flashcard
            vocabulary={currentVocab}
            onRecordWord={handleRecordWord}
            onRecordSentence={handleRecordSentence}
            isLoading={isEvaluating}
          />
        )}

        {pageState === "scoring" && (
          <div className="card-elegant mx-auto max-w-2xl text-center">
            <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
            <p className="text-lg text-muted-foreground">
              Evaluating your pronunciation...
            </p>
          </div>
        )}

        {pageState === "result" && scoreResult && (
          <ScoreResult
            score={scoreResult}
            onRetry={handleRetry}
            onNext={handleNext}
          />
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between gap-4">
          <Button
            variant="outline"
            size="lg"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="h-5 w-5" />
            Previous
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={handleNext}
            disabled={pageState !== "result"}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
