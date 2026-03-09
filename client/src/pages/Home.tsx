import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, Sparkles, Music } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

/**
 * Phonics Master - Home Page (Simplified & Clean Design)
 * Simple landing page focused on core functionality
 */
export default function Home() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-cute">
      {/* Navigation */}
      <nav className="border-b border-primary/10 bg-white/60 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-gradient-to-r from-primary to-secondary p-2">
              <Music className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-[700] text-primary">
              Phonics Master
            </h1>
          </div>
          <div className="flex items-center gap-3">
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : isAuthenticated && user ? (
              <>
                <span className="text-sm text-foreground">
                  👋 Hi, {user.name || "Student"}!
                </span>
                {user.role === "admin" && (
                  <Button
                    className="btn-cute-primary gap-2 h-8 text-xs"
                    onClick={() => setLocation("/admin")}
                  >
                    <Settings className="h-3 w-3" />
                    Admin
                  </Button>
                )}
                <Button
                  className="btn-cute-secondary gap-2 h-8 text-xs"
                  onClick={() => logout()}
                >
                  Logout
                </Button>
              </>
            ) : (
              <Button
                className="btn-cute-primary h-8 text-xs"
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
        <div className="mx-auto max-w-2xl space-y-6">
          {/* Icon */}
          <div className="text-5xl">🎵</div>
          
          <h2 className="text-4xl font-[700] text-primary">
            Learn English Pronunciation
          </h2>
          
          <p className="text-lg text-foreground/70">
            Practice pronunciation with fun lessons and get instant feedback!
          </p>

          {isAuthenticated ? (
            <Button
              className="btn-cute-primary gap-2 text-base mx-auto"
              onClick={() => setLocation("/units")}
            >
              <Sparkles className="h-4 w-4" />
              Start Learning
            </Button>
          ) : (
            <Button
              className="btn-cute-primary gap-2 text-base mx-auto"
              onClick={() => (window.location.href = getLoginUrl())}
            >
              <Sparkles className="h-4 w-4" />
              Get Started
            </Button>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-primary/10 bg-white/40 py-6 text-center text-foreground/50 text-sm">
        <p>💖 Phonics Master © 2026</p>
      </footer>
    </div>
  );
}
