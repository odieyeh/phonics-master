import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Zap, Target, Award, Settings } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

/**
 * Phonics Master - Home Page
 * Elegant landing page with practice entry point
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Navigation */}
      <nav className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <h1 className="gradient-text text-2xl font-bold">Phonics Master</h1>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isAuthenticated && user ? (
              <>
                <span className="text-sm text-muted-foreground">
                  Welcome, {user.name || "Student"}!
                </span>
                {user.role === "admin" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => setLocation("/admin")}
                  >
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="mx-auto max-w-3xl space-y-6">
          <h2 className="gradient-text text-5xl font-bold md:text-6xl">
            Master English Pronunciation
          </h2>
          <p className="text-xl text-muted-foreground">
            Learn to pronounce English words perfectly with AI-powered feedback.
            Practice, listen, record, and improve your pronunciation skills.
          </p>

          {isAuthenticated ? (
            <Button
              size="lg"
              className="gap-2 text-lg"
              onClick={() => setLocation("/units")}
            >
              <Zap className="h-5 w-5" />
              Start Practicing Now
            </Button>
          ) : (
            <Button
              size="lg"
              className="gap-2 text-lg"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              <Zap className="h-5 w-5" />
              Get Started
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold">
            How It Works
          </h3>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="card-elegant text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-primary" />
              <h4 className="mb-2 text-xl font-semibold">See the Word</h4>
              <p className="text-muted-foreground">
                View vocabulary with IPA phonetic transcription and example
                sentences to understand context.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-elegant text-center">
              <Zap className="mx-auto mb-4 h-12 w-12 text-secondary" />
              <h4 className="mb-2 text-xl font-semibold">Listen & Record</h4>
              <p className="text-muted-foreground">
                Play native pronunciation and record your own voice to compare
                with the target.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-elegant text-center">
              <Award className="mx-auto mb-4 h-12 w-12 text-accent" />
              <h4 className="mb-2 text-xl font-semibold">Get AI Feedback</h4>
              <p className="text-muted-foreground">
                Receive personalized feedback with pronunciation scores and
                tips to improve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h3 className="mb-12 text-center text-3xl font-bold">
            Why Phonics Master?
          </h3>

          <div className="grid gap-8 md:grid-cols-2">
            <div className="flex gap-4">
              <Target className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h4 className="mb-2 font-semibold">Accurate Scoring</h4>
                <p className="text-muted-foreground">
                  AI-powered pronunciation evaluation gives you precise scores
                  from 0-100.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Zap className="h-6 w-6 flex-shrink-0 text-secondary" />
              <div>
                <h4 className="mb-2 font-semibold">Interactive Learning</h4>
                <p className="text-muted-foreground">
                  Engage with flashcards, listen to native speakers, and
                  practice at your own pace.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <Award className="h-6 w-6 flex-shrink-0 text-accent" />
              <div>
                <h4 className="mb-2 font-semibold">Progress Tracking</h4>
                <p className="text-muted-foreground">
                  Monitor your improvement with detailed statistics and
                  performance history.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <BookOpen className="h-6 w-6 flex-shrink-0 text-primary" />
              <div>
                <h4 className="mb-2 font-semibold">Child-Friendly</h4>
                <p className="text-muted-foreground">
                  Encouraging feedback and positive reinforcement designed for
                  young learners.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary to-secondary py-20 text-center text-white">
        <div className="container mx-auto px-4">
          <h3 className="mb-4 text-3xl font-bold">Ready to Improve?</h3>
          <p className="mb-8 text-lg opacity-90">
            Start your pronunciation journey today with Phonics Master.
          </p>
          {isAuthenticated ? (
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
              onClick={() => setLocation("/units")}
            >
              <Zap className="h-5 w-5" />
              Begin Practice
            </Button>
          ) : (
            <Button
              size="lg"
              variant="secondary"
              className="gap-2"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              <Zap className="h-5 w-5" />
              Sign Up Now
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 text-center text-muted-foreground">
        <p>© 2026 Phonics Master. All rights reserved.</p>
      </footer>
    </div>
  );
}
