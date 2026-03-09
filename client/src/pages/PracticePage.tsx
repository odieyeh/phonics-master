import React, { useState, useEffect } from "react";
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
      alert("No audio available for this item. 😅");
      return;
    }

    setIsPlaying(type);
    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audio.onended = () => setIsPlaying(null);
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
      setIsPlaying(null);
      alert("Failed to play audio. Please try again. 😢");
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-cute">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-foreground/70">Loading your words... 📚</p>
      </div>
    );
  }

  if (!currentVocab) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-cute p-4">
        <div className="card-cute text-center max-w-md">
          <div className="text-5xl mb-4">😅</div>
          <h1 className="text-3xl font-[700] text-primary mb-4">
            No Words Found
          </h1>
          <p className="text-lg text-foreground/70 mb-8">
            Please select a unit with words to practice!
          </p>
          <Button 
            className="btn-cute-primary"
            onClick={() => setLocation("/units")}
          >
            Back to Units 📖
          </Button>
        </div>
      </div>
    );
  }

  // Difficulty colors
  const difficultyConfig = {
    beginner: { emoji: "🟢", color: "from-green-400 to-emerald-400" },
    intermediate: { emoji: "🟡", color: "from-yellow-400 to-orange-400" },
    advanced: { emoji: "🔴", color: "from-red-400 to-pink-400" },
  };

  const difficulty = (currentVocab.difficulty || "beginner") as keyof typeof difficultyConfig;
  const diffConfig = difficultyConfig[difficulty] || difficultyConfig.beginner;

  return (
    <div className="min-h-screen bg-gradient-cute">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b-2 border-primary/20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              className="btn-cute-secondary gap-2"
              size="sm"
              onClick={() => window.history.back()}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </Button>
            <h1 className="text-2xl font-[700] text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Let's Practice! 🎵
            </h1>
          </div>
          <Button
            className="btn-cute-primary gap-2"
            size="sm"
            onClick={() => setLocation("/")}
          >
            <Home className="w-4 h-4" />
            Home
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        {/* Progress Indicator */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-[700] text-primary">
              Progress: {currentIndex + 1} / {vocabularies.length}
            </span>
            <span className="text-sm font-[700] text-secondary">
              {Math.round(((currentIndex + 1) / vocabularies.length) * 100)}% Complete! 🎯
            </span>
          </div>
          <div className="w-full bg-white rounded-full h-3 shadow-md overflow-hidden border-2 border-primary/20">
            <div
              className="bg-gradient-to-r from-primary via-secondary to-accent h-3 rounded-full transition-all duration-500"
              style={{
                width: `${((currentIndex + 1) / vocabularies.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="max-w-2xl mx-auto card-cute shadow-2xl border-2 border-primary/10">
          <div className="text-center space-y-8">
            {/* Word */}
            <div className="space-y-4">
              <p className="text-sm font-[700] text-primary/70 uppercase tracking-wider">
                📝 Word
              </p>
              <h2 className="text-6xl md:text-7xl font-[700] text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                {currentVocab.word}
              </h2>
              <Button
                onClick={() => playAudio(currentVocab.wordAudioUrl, "word")}
                disabled={isPlaying === "word"}
                className="btn-cute-primary gap-2 text-lg mx-auto"
              >
                <Volume2 className={`w-5 h-5 ${isPlaying === "word" ? "animate-pulse" : ""}`} />
                {isPlaying === "word" ? "Playing... 🔊" : "Play Word 🎧"}
              </Button>
            </div>

            {/* Divider */}
            <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full" />

            {/* IPA */}
            <div className="space-y-2">
              <p className="text-sm font-[700] text-secondary/70 uppercase tracking-wider">
                🔤 Pronunciation
              </p>
              <p className="text-4xl md:text-5xl text-foreground font-mono font-[700] bg-white/50 rounded-2xl py-4 px-6 border-2 border-secondary/20">
                {currentVocab.ipa}
              </p>
            </div>

            {/* Divider */}
            <div className="h-1 bg-gradient-to-r from-transparent via-secondary to-transparent rounded-full" />

            {/* Example Sentence */}
            <div className="space-y-4 bg-gradient-to-br from-accent/10 to-primary/10 rounded-2xl p-6 border-2 border-accent/20">
              <p className="text-sm font-[700] text-accent/70 uppercase tracking-wider">
                💬 Example Sentence
              </p>
              <p className="text-xl md:text-2xl text-foreground leading-relaxed">
                {currentVocab.exampleSentence}
              </p>
              <Button
                onClick={() => playAudio(currentVocab.sentenceAudioUrl, "sentence")}
                disabled={isPlaying === "sentence"}
                className="btn-cute-secondary gap-2 text-lg mx-auto"
              >
                <Volume2 className={`w-5 h-5 ${isPlaying === "sentence" ? "animate-pulse" : ""}`} />
                {isPlaying === "sentence" ? "Playing... 🔊" : "Play Sentence 🎧"}
              </Button>
            </div>

            {/* Difficulty Badge */}
            <div className="space-y-2">
              <p className="text-sm font-[700] text-foreground/70 uppercase tracking-wider">
                📊 Difficulty
              </p>
              <div className={`inline-block px-6 py-3 rounded-full text-lg font-[700] text-white bg-gradient-to-r ${diffConfig.color} shadow-lg`}>
                {diffConfig.emoji} {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="max-w-2xl mx-auto mt-12 flex items-center justify-between gap-4">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="btn-cute-secondary gap-2 flex-1"
          >
            <ChevronLeft className="w-5 h-5" />
            Previous
          </Button>

          <div className="text-center px-4">
            <p className="text-sm font-[700] text-foreground/70">
              {currentIndex + 1} of {vocabularies.length}
            </p>
          </div>

          <Button
            onClick={handleNext}
            disabled={currentIndex === vocabularies.length - 1}
            className="btn-cute-primary gap-2 flex-1"
          >
            Next
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>

        {/* Completion Message */}
        {currentIndex === vocabularies.length - 1 && (
          <div className="max-w-2xl mx-auto mt-8 card-cute bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/30 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <p className="text-xl font-[700] text-primary mb-2">
              You're on the last word!
            </p>
            <p className="text-foreground/70">
              Great job practicing! Keep it up! 💪
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
