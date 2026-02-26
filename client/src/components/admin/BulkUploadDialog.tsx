import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import Papa from "papaparse";

interface BulkUploadDialogProps {
  onClose: () => void;
  onSuccess: () => void;
}

interface CSVRow {
  word?: string;
  ipa?: string;
  exampleSentence?: string;
  difficulty?: string;
  wordAudioUrl?: string;
  sentenceAudioUrl?: string;
}

export default function BulkUploadDialog({
  onClose,
  onSuccess,
}: BulkUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CSVRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const bulkCreateMutation = trpc.vocabulary.bulkCreate.useMutation({
    onSuccess: (result) => {
      toast.success(`Successfully uploaded ${result.count} vocabularies!`);
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload vocabularies");
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setErrors([]);
    setPreview([]);

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const rows = results.data as CSVRow[];
        const validationErrors: string[] = [];
        const validRows: CSVRow[] = [];

        rows.forEach((row, index) => {
          if (!row.word || !row.ipa || !row.exampleSentence) {
            validationErrors.push(
              `Row ${index + 2}: Missing required fields (word, ipa, exampleSentence)`
            );
          } else {
            validRows.push({
              word: row.word.trim(),
              ipa: row.ipa.trim(),
              exampleSentence: row.exampleSentence.trim(),
              difficulty: (row.difficulty?.trim() || "beginner") as "beginner" | "intermediate" | "advanced",
              wordAudioUrl: row.wordAudioUrl?.trim(),
              sentenceAudioUrl: row.sentenceAudioUrl?.trim(),
            });
          }
        });

        setErrors(validationErrors);
        setPreview(validRows);
      },
      error: (error: any) => {
        setErrors([`CSV parsing error: ${error.message}`]);
      },
    });
  };

  const handleSubmit = async () => {
    if (preview.length === 0) {
      toast.error("No valid vocabularies to upload");
      return;
    }

    const vocabularies = preview.map((row) => ({
      word: row.word || "",
      ipa: row.ipa || "",
      exampleSentence: row.exampleSentence || "",
      difficulty: (row.difficulty || "beginner") as "beginner" | "intermediate" | "advanced",
      wordAudioUrl: row.wordAudioUrl,
      sentenceAudioUrl: row.sentenceAudioUrl,
    }));

    bulkCreateMutation.mutate({ vocabularies });
  };

  const isLoading = bulkCreateMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Vocabularies</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Input */}
          <div className="space-y-2">
            <Label htmlFor="csvFile">CSV File</Label>
            <Input
              id="csvFile"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Required columns: word, ipa, exampleSentence. Optional: difficulty, wordAudioUrl, sentenceAudioUrl
            </p>
          </div>

          {/* Errors */}
          {errors.length > 0 && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="flex gap-2 mb-2">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <h4 className="font-semibold text-destructive">Validation Errors</h4>
              </div>
              <ul className="space-y-1 text-sm text-destructive/90">
                {errors.map((error, idx) => (
                  <li key={idx}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview */}
          {preview.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Preview ({preview.length} vocabularies)</h4>
              <div className="max-h-64 overflow-y-auto rounded-lg border border-border">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted">
                    <tr>
                      <th className="px-3 py-2 text-left">Word</th>
                      <th className="px-3 py-2 text-left">IPA</th>
                      <th className="px-3 py-2 text-left">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((row, idx) => (
                      <tr key={idx} className="border-t border-border hover:bg-muted/50">
                        <td className="px-3 py-2">{row.word}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.ipa}</td>
                        <td className="px-3 py-2">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                            {row.difficulty || "beginner"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {preview.length > 10 && (
                  <div className="px-3 py-2 text-center text-xs text-muted-foreground border-t border-border">
                    ... and {preview.length - 10} more
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || preview.length === 0}
            className="gap-2"
          >
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            Upload {preview.length} Vocabularies
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
