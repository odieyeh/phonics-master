import { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight, ArrowLeft, Home, Volume2 } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import type { Vocabulary } from "@shared/types";

export default function PracticePage() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);

  // Get unitId from URL query params
  const searchParams = new URLSearchParams(window.location.search);
  const unitId = searchParams.get("unitId")
    ? parseInt(searchParams.get("unitId")!)
    : null;

  // Fetch vocabularies for the unit
  const { data: vocabData, isLoading: isVocabLoading } = unitId
    ? trpc.unit.getVocabularies.useQuery({ unitId })
    : trpc.vocabulary.list.useQuery({
        limit: 50,
        offset: 0,
      });

  useEffect(() => {
    if (vocabData && vocabData.length > 0) {
      setVocabularies(vocabData);
      setIsLoading(false);
    } else if (!isVocabLoading && (!vocabData || vocabData.length === 0)) {
      setIsLoading(false);
    }
  }, [vocabData, isVocabLoading]);

  const currentVocab = vocabularies[currentIndex];

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsPlaying(null);
    }
  };

  const handleNext = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsPlaying(null);
    }
  };

  const playAudio = (audioUrl: string | null | undefined, type: string) => {
    if (!audioUrl) {
      alert("No audio available for this item.");
      return;
    }

    setIsPlaying(type);
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audio.onended = () => setIsPlaying(null);
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
      setIsPlaying(null);
      alert("Failed to play audio. Please try again.");
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-cute">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!currentVocab) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-cute p-4">
        <div className="card-cute text-center max-w-md">
          <h1 className="text-2xl font-[700] text-primary mb-4">
            No Words Found
          </h1>
          <Button 
            className="btn-cute-primary"
            onClick={() => setLocation("/units")}
          >
            Back to Units
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-cute">
      {/* Header */}
      <div className="border-b border-primary/10 bg-white/60">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Button
            className="btn-cute-secondary gap-2 h-8 text-xs"
            size="sm"
            onClick={() => window.history.back()}
          >
            <ArrowLeft className="w-3 h-3" />
            Back
          </Button>
          <Button
            className="btn-cute-primary gap-2 h-8 text-xs"
            size="sm"
            onClick={() => setLocation("/")}
          >
            <Home className="w-3 h-3" />
            Home
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Progress */}
        <div className="mb-6 max-w-2xl mx-auto text-center text-sm text-foreground/70">
          {currentIndex + 1} / {vocabularies.length}
        </div>

        {/* Flashcard */}
        <div className="max-w-2xl mx-auto card-cute">
          <div className="text-center space-y-6">
            {/* Word */}
            <div>
              <h2 className="text-5xl font-[700] text-primary mb-3">
                {currentVocab.word}
              </h2>
              <Button
                onClick={() => playAudio(currentVocab.wordAudioUrl, "word")}
                disabled={isPlaying === "word"}
                className="btn-cute-primary gap-2 mx-auto"
              >
                <Volume2 className="w-4 h-4" />
                {isPlaying === "word" ? "Playing..." : "Play"}
              </Button>
            </div>

            {/* IPA */}
            <div>
              <p className="text-sm text-foreground/60 mb-2">Pronunciation</p>
              <p className="text-3xl font-mono text-foreground">
                {currentVocab.ipa}
              </p>
            </div>

            {/* Example Sentence */}
            <div>
              <p className="text-sm text-foreground/60 mb-2">Example</p>
              <p className="text-lg text-foreground mb-3">
                {currentVocab.exampleSentence}
              </p>
              <Button
                onClick={() => playAudio(currentVocab.sentenceAudioUrl, "sentence")}
                disabled={isPlaying === "sentence"}
                className="btn-cute-secondary gap-2 mx-auto"
              >
                <Volume2 className="w-4 h-4" />
                {isPlaying === "sentence" ? "Playing..." : "Play"}
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-2xl mx-auto mt-8 flex items-center justify-between gap-3">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="btn-cute-secondary gap-2 flex-1"
            size="sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentIndex === vocabularies.length - 1}
            className="btn-cute-primary gap-2 flex-1"
            size="sm"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
