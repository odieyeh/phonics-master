import React, { useState } from "react";
import { Loader2, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import type { Vocabulary } from "@shared/types";

interface VocabularyTableProps {
  onEdit?: (vocab: Vocabulary) => void;
}

export default function VocabularyTable({ onEdit }: VocabularyTableProps) {
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: vocabularies, isLoading, refetch } = trpc.vocabulary.listAll.useQuery({
    limit: pageSize,
    offset: page * pageSize,
  });

  const deleteMutation = trpc.vocabulary.delete.useMutation({
    onSuccess: () => {
      toast.success("Vocabulary deleted successfully!");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete vocabulary");
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this vocabulary?")) {
      deleteMutation.mutate({ id });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="card-elegant overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-4 py-3 text-left font-semibold">Word</th>
              <th className="px-4 py-3 text-left font-semibold">IPA</th>
              <th className="px-4 py-3 text-left font-semibold">Example Sentence</th>
              <th className="px-4 py-3 text-left font-semibold">Difficulty</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vocabularies && vocabularies.length > 0 ? (
              vocabularies.map((vocab: Vocabulary) => (
                <tr key={vocab.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{vocab.word}</td>
                  <td className="px-4 py-3 text-muted-foreground">{vocab.ipa}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                    {vocab.exampleSentence}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                      {vocab.difficulty}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit?.(vocab)}
                        className="gap-1"
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(vocab.id)}
                        disabled={deleteMutation.isPending}
                        className="gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                  No vocabularies found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="border-t border-border px-4 py-4 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Page {page + 1}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(page + 1)}
            disabled={!vocabularies || vocabularies.length < pageSize}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
