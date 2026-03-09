import { useLocation } from "wouter";
import { Loader2, ArrowLeft, Home } from "lucide-react";
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

  const unitEmojis = ["📚", "🌟", "🎨", "🎭", "🎪", "🎯", "🎲", "🎸"];
  const getUnitEmoji = (index: number) => unitEmojis[index % unitEmojis.length];

  return (
    <div className="min-h-screen bg-gradient-cute">
      {/* Header */}
      <div className="border-b border-primary/10 bg-white/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-[700] text-primary">
              Choose a Unit
            </h1>
            <div className="flex items-center gap-2">
              <Button
                className="btn-cute-secondary gap-2 h-8 text-xs"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-3 w-3" />
                Back
              </Button>
              <Button
                className="btn-cute-primary gap-2 h-8 text-xs"
                onClick={() => setLocation("/")}
              >
                <Home className="h-3 w-3" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !units || units.length === 0 ? (
          <div className="mx-auto max-w-md card-cute text-center">
            <p className="text-foreground/70">No units available yet.</p>
            <Button
              className="btn-cute-primary mt-4"
              onClick={() => setLocation("/")}
            >
              Back to Home
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit, index) => (
              <button
                key={unit.id}
                onClick={() => handleSelectUnit(unit)}
                className="card-cute text-left hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getUnitEmoji(index)}</span>
                  <h3 className="text-lg font-[700] text-primary">
                    {unit.name}
                  </h3>
                </div>
                {unit.description && (
                  <p className="text-sm text-foreground/70 line-clamp-2">
                    {unit.description}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
