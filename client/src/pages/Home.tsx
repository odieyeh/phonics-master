import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, BookOpen, Zap, Target, Award, Settings, Sparkles, Heart, Music } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

/**
 * Phonics Master - Home Page (Cute & Warm Design for Kids)
 * Friendly landing page with playful design elements
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-cute">
      {/* Navigation */}
      <nav className="border-b-2 border-primary/20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-gradient-to-r from-primary to-secondary p-2">
              <Music className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-[700] text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
              Phonics Master
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : isAuthenticated && user ? (
              <>
                <span className="text-sm font-medium text-foreground">
                  👋 Hi, {user.name || "Student"}!
                </span>
                {user.role === "admin" && (
                  <Button
                    className="btn-cute-primary gap-2"
                    onClick={() => setLocation("/admin")}
                  >
                    <Settings className="h-4 w-4" />
                    Admin
                  </Button>
                )}
                <Button
                  className="btn-cute-secondary gap-2"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className="btn-cute-primary"
                onClick={() => (window.location.href = getLoginUrl())}
              >
                Login
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 text-center">
        <div className="mx-auto max-w-3xl space-y-8">
          {/* Animated emoji */}
          <div className="text-6xl md:text-7xl animate-bounce-gentle">
            🎵
          </div>
          
          <h2 className="text-display text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent">
            Learn English Pronunciation! 🌟
          </h2>
          
          <p className="text-body text-foreground/80 max-w-2xl mx-auto">
            Welcome to Phonics Master! 🎉 A fun and friendly place to learn how to pronounce English words perfectly. Listen to native speakers, practice at your own pace, and have fun learning! 😊
          </p>

          {isAuthenticated ? (
            <Button
              className="btn-cute-primary gap-2 text-lg mx-auto"
              onClick={() => setLocation("/units")}
            >
              <Sparkles className="h-5 w-5" />
              Start Learning Now! 🚀
            </Button>
          ) : (
            <Button
              className="btn-cute-primary gap-2 text-lg mx-auto"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              <Sparkles className="h-5 w-5" />
              Get Started! 🎊
            </Button>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-white/50">
        <div className="container mx-auto px-4">
          <h3 className="text-heading text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
            How It Works ✨
          </h3>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="card-cute text-center hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="text-5xl mb-4">👀</div>
              <h4 className="mb-3 text-2xl font-[700] text-primary">See the Word</h4>
              <p className="text-foreground/70 text-lg">
                Look at cool English words with fun pronunciation guides and example sentences!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="card-cute text-center hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="text-5xl mb-4">🎧</div>
              <h4 className="mb-3 text-2xl font-[700] text-secondary">Listen & Learn</h4>
              <p className="text-foreground/70 text-lg">
                Hear how native speakers pronounce the words. Listen as many times as you want!
              </p>
            </div>

            {/* Feature 3 */}
            <div className="card-cute text-center hover:shadow-xl transition-all transform hover:-translate-y-2">
              <div className="text-5xl mb-4">⭐</div>
              <h4 className="mb-3 text-2xl font-[700] text-accent">Have Fun!</h4>
              <p className="text-foreground/70 text-lg">
                Learn at your own pace with a friendly, encouraging environment. You've got this! 💪
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <h3 className="text-heading text-center mb-12 text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
            Why Phonics Master? 💡
          </h3>

          <div className="grid gap-6 md:grid-cols-2 max-w-2xl mx-auto">
            <div className="card-cute flex gap-4 items-start">
              <div className="text-4xl flex-shrink-0">🎯</div>
              <div>
                <h4 className="mb-2 text-xl font-[700] text-primary">Clear & Easy</h4>
                <p className="text-foreground/70">
                  Simple lessons that are easy to understand and fun to practice!
                </p>
              </div>
            </div>

            <div className="card-cute flex gap-4 items-start">
              <div className="text-4xl flex-shrink-0">🌈</div>
              <div>
                <h4 className="mb-2 text-xl font-[700] text-secondary">Colorful Design</h4>
                <p className="text-foreground/70">
                  Bright, friendly colors that make learning exciting and enjoyable!
                </p>
              </div>
            </div>

            <div className="card-cute flex gap-4 items-start">
              <div className="text-4xl flex-shrink-0">💪</div>
              <div>
                <h4 className="mb-2 text-xl font-[700] text-accent">Build Confidence</h4>
                <p className="text-foreground/70">
                  Positive feedback and encouragement to help you improve every day!
                </p>
              </div>
            </div>

            <div className="card-cute flex gap-4 items-start">
              <div className="text-4xl flex-shrink-0">🎉</div>
              <div>
                <h4 className="mb-2 text-xl font-[700] text-primary">Have Fun!</h4>
                <p className="text-foreground/70">
                  Learning should be fun! We make pronunciation practice enjoyable!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-primary via-secondary to-accent py-16 md:py-24 text-center text-white rounded-3xl mx-4 md:mx-8 mb-8">
        <div className="container mx-auto px-4">
          <div className="text-5xl md:text-6xl mb-4">🚀</div>
          <h3 className="mb-4 text-3xl md:text-4xl font-[700]">Ready to Start Learning?</h3>
          <p className="mb-8 text-lg md:text-xl opacity-95">
            Join Phonics Master today and become a pronunciation expert! 🌟
          </p>
          {isAuthenticated ? (
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-[700] text-lg gap-2"
              onClick={() => setLocation("/units")}
            >
              <Sparkles className="h-5 w-5" />
              Begin Practice Now! 🎊
            </Button>
          ) : (
            <Button
              size="lg"
              className="bg-white text-primary hover:bg-white/90 font-[700] text-lg gap-2"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              <Sparkles className="h-5 w-5" />
              Sign Up & Start! 🎉
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-2 border-primary/20 bg-white/50 py-8 text-center text-foreground/60">
        <p className="text-lg">
          💖 Made with love for young learners | © 2026 Phonics Master
        </p>
      </footer>
    </div>
  );
}
