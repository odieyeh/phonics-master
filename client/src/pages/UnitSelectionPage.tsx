import React from "react";
import { useLocation } from "wouter";
import { Loader2, BookOpen, ChevronRight, ArrowLeft, Home } from "lucide-react";
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <h1 className="gradient-text text-3xl font-bold">Choose Your Unit</h1>
                <p className="text-sm text-muted-foreground">
                  Select a unit to start practicing
                </p>
              </div>
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
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !units || units.length === 0 ? (
          <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center">
            <p className="mb-4 text-muted-foreground">
              No units available yet. Please check back later!
            </p>
            <button
              onClick={() => setLocation("/")}
              className="rounded-md border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-muted"
            >
              Back to Home
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {units.map((unit) => (
              <div
                key={unit.id}
                onClick={() => handleSelectUnit(unit)}
                className="card-elegant group relative cursor-pointer overflow-hidden text-left transition-all duration-300 hover:shadow-lg"
              >
                {/* Background gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                {/* Content */}
                <div className="relative space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="gradient-text text-xl font-bold">
                        {unit.name}
                      </h3>
                      {unit.description && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {unit.description}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground transition-transform duration-300 group-hover:translate-x-1" />
                  </div>

                  {/* CTA */}
                  <div className="pt-2">
                    <div className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
                      Start Practicing
                      <ChevronRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
