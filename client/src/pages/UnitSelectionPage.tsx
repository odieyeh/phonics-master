import React from "react";
import { useLocation } from "wouter";
import { Loader2, ChevronRight, ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import type { Unit } from "@shared/types";

export default function UnitSelectionPage() {
  const [, setLocation] = useLocation();

  const { data: units, isLoading } = trpc.unit.list.useQuery({
    limit: 100,
    offset: 0,
  });

  const handleSelectUnit = (unit: Unit) => {
    setLocation(`/practice?unitId=${unit.id}`);
  };

  // Unit emoji mapping for cute design
  const unitEmojis = ["📚", "🌟", "🎨", "🎭", "🎪", "🎯", "🎲", "🎸"];
  const getUnitEmoji = (index: number) => unitEmojis[index % unitEmojis.length];

  return (
    <div className="min-h-screen bg-gradient-cute">
      {/* Header */}
      <div className="border-b-2 border-primary/20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-4xl animate-bounce-gentle">📖</div>
              <div>
                <h1 className="text-3xl font-[700] text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Choose Your Unit! 🎉
                </h1>
                <p className="text-sm text-foreground/70 mt-1">
                  Pick a unit and start your learning adventure! 🚀
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                className="btn-cute-secondary gap-2"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                className="btn-cute-primary gap-2"
                onClick={() => setLocation("/")}
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
              <p className="text-lg text-foreground/70">Loading units... 🔄</p>
            </div>
          </div>
        ) : !units || units.length === 0 ? (
          <div className="mx-auto max-w-md card-cute text-center">
            <div className="text-5xl mb-4">😅</div>
            <p className="mb-4 text-lg text-foreground/70">
              No units available yet. Please check back later!
            </p>
            <Button
              className="btn-cute-primary"
              onClick={() => setLocation("/")}
            >
              Back to Home 🏠
            </Button>
          </div>
        ) : (
          <div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {units.map((unit, index) => (
                <div
                  key={unit.id}
                  onClick={() => handleSelectUnit(unit)}
                  className="card-cute group relative cursor-pointer overflow-hidden text-left transition-all duration-300 hover:shadow-xl transform hover:-translate-y-2 hover:scale-105"
                >
                  {/* Background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Content */}
                  <div className="relative space-y-4">
                    {/* Emoji and Title */}
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-4xl">{getUnitEmoji(index)}</span>
                          <h3 className="text-2xl font-[700] text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                            {unit.name}
                          </h3>
                        </div>
                        {unit.description && (
                          <p className="text-foreground/70 line-clamp-2">
                            {unit.description}
                          </p>
                        )}
                      </div>
                      <ChevronRight className="h-6 w-6 text-primary transition-transform duration-300 group-hover:translate-x-2" />
                    </div>

                    {/* CTA Button */}
                    <div className="pt-2">
                      <div className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-secondary px-4 py-3 text-sm font-[700] text-white hover:shadow-lg transition-all">
                        Start Learning! 🎊
                        <ChevronRight className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
