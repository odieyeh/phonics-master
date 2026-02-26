import React from "react";
import { CheckCircle2, Zap, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PronunciationScore } from "@shared/types";

interface ScoreResultProps {
  score: PronunciationScore;
  onNext?: () => void;
  onRetry?: () => void;
}

export function ScoreResult({
  score,
  onNext,
  onRetry,
}: ScoreResultProps) {
  const getPerformanceIcon = () => {
    switch (score.performanceLevel) {
      case "excellent":
        return <CheckCircle2 className="h-16 w-16 text-secondary" />;
      case "good":
        return <Zap className="h-16 w-16 text-primary" />;
      case "keep_practicing":
        return <Target className="h-16 w-16 text-accent" />;
    }
  };

  const getPerformanceColor = () => {
    switch (score.performanceLevel) {
      case "excellent":
        return "badge-excellent";
      case "good":
        return "badge-good";
      case "keep_practicing":
        return "badge-keep-practicing";
    }
  };

  const getPerformanceLabel = () => {
    switch (score.performanceLevel) {
      case "excellent":
        return "Excellent";
      case "good":
        return "Good";
      case "keep_practicing":
        return "Keep Practicing";
    }
  };

  return (
    <div className="card-elegant mx-auto max-w-2xl space-y-6">
      {/* Score Display */}
      <div className="flex flex-col items-center gap-4">
        {getPerformanceIcon()}
        <div className="score-display">
          <div className="score-display-inner">{score.score}</div>
        </div>
        <div className={`${getPerformanceColor()}`}>
          {getPerformanceLabel()}
        </div>
      </div>

      {/* Feedback */}
      <div className="rounded-lg bg-muted/50 p-4">
        <p className="text-center text-lg leading-relaxed text-foreground">
          {score.feedback}
        </p>
      </div>

      {/* Analysis */}
      {score.analysis && (
        <div className="space-y-4">
          {score.analysis.strengths.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold text-secondary">
                What You Did Well
              </h3>
              <ul className="space-y-1">
                {score.analysis.strengths.map((strength: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-secondary" />
                    <span>{strength}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {score.analysis.areasToImprove.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold text-primary">
                Areas to Improve
              </h3>
              <ul className="space-y-1">
                {score.analysis.areasToImprove.map((area: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Target className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {score.analysis.tips.length > 0 && (
            <div>
              <h3 className="mb-2 font-semibold text-accent">Tips</h3>
              <ul className="space-y-1">
                {score.analysis.tips.map((tip: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm">
                    <Zap className="mt-0.5 h-4 w-4 flex-shrink-0 text-accent" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {onRetry && (
          <Button
            variant="outline"
            size="lg"
            onClick={onRetry}
            className="flex-1"
          >
            Try Again
          </Button>
        )}
        {onNext && (
          <Button
            variant="default"
            size="lg"
            onClick={onNext}
            className="flex-1"
          >
            Next Word
          </Button>
        )}
      </div>
    </div>
  );
}
