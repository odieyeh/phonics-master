import React, { useState, useEffect } from "react";
import { Loader2, ChevronLeft, ChevronRight, ArrowLeft, Home } from "lucide-react";
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
    }
  };

  const handleNext = () => {
    if (currentIndex < vocabularies.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const playAudio = (audioUrl: string | null | undefined) => {
    if (!audioUrl) {
      alert("No audio available for this item.");
      return;
    }

    const audio = new Audio(audioUrl);
    audio.crossOrigin = "anonymous";
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
      alert("Failed to play audio. Please try again.");
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <Loader2 className="w-8 h-8 animate-spin text-slate-600" />
      </div>
    );
  }

  if (!currentVocab) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">
            No Vocabularies Found
          </h1>
          <p className="text-slate-600 mb-8">
            Please select a unit with vocabularies to practice.
          </p>
          <Button onClick={() => setLocation("/units")} variant="default">
            Back to Units
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => window.history.back()}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-slate-900">Practice</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setLocation("/")}
            className="text-slate-600 hover:text-slate-900"
          >
            <Home className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-600">
              Progress
            </span>
            <span className="text-sm font-medium text-slate-600">
              {currentIndex + 1} / {vocabularies.length}
            </span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${((currentIndex + 1) / vocabularies.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Flashcard */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-200">
          <div className="text-center space-y-6">
            {/* Word */}
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">Word</p>
              <h2 className="text-5xl font-bold text-slate-900 mb-4">
                {currentVocab.word}
              </h2>
              <Button
                onClick={() => playAudio(currentVocab.wordAudioUrl)}
                variant="default"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                🔊 Play Word
              </Button>
            </div>

            {/* IPA */}
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">
                Pronunciation
              </p>
              <p className="text-2xl text-slate-700 font-mono">
                {currentVocab.ipa}
              </p>
            </div>

            {/* Example Sentence */}
            <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
              <p className="text-sm font-medium text-slate-500 mb-2">
                Example Sentence
              </p>
              <p className="text-lg text-slate-700 mb-4">
                {currentVocab.exampleSentence}
              </p>
              <Button
                onClick={() => playAudio(currentVocab.sentenceAudioUrl)}
                variant="outline"
                className="border-slate-300 text-slate-700 hover:bg-slate-100"
              >
                🔊 Play Sentence
              </Button>
            </div>

            {/* Difficulty */}
            <div>
              <p className="text-sm font-medium text-slate-500 mb-2">
                Difficulty
              </p>
              <span
                className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
                  currentVocab.difficulty === "beginner"
                    ? "bg-green-100 text-green-700"
                    : currentVocab.difficulty === "intermediate"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-red-100 text-red-700"
                }`}
              >
                {currentVocab.difficulty
                  ? currentVocab.difficulty.charAt(0).toUpperCase() +
                    currentVocab.difficulty.slice(1)
                  : "N/A"}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <span className="text-sm font-medium text-slate-600">
            {currentIndex + 1} of {vocabularies.length}
          </span>

          <Button
            onClick={handleNext}
            disabled={currentIndex === vocabularies.length - 1}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
