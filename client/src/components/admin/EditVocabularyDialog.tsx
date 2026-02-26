import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import AudioUploadField from "./AudioUploadField";
import type { Vocabulary } from "@shared/types";

interface EditVocabularyDialogProps {
  vocabulary: Vocabulary | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditVocabularyDialog({
  vocabulary,
  onClose,
  onSuccess,
}: EditVocabularyDialogProps) {
  const [formData, setFormData] = useState({
    word: "",
    ipa: "",
    exampleSentence: "",
    difficulty: "beginner" as "beginner" | "intermediate" | "advanced",
    wordAudioUrl: "",
    sentenceAudioUrl: "",
  });

  useEffect(() => {
    if (vocabulary) {
      setFormData({
        word: vocabulary.word,
        ipa: vocabulary.ipa,
        exampleSentence: vocabulary.exampleSentence,
        difficulty: vocabulary.difficulty || "beginner",
        wordAudioUrl: vocabulary.wordAudioUrl || "",
        sentenceAudioUrl: vocabulary.sentenceAudioUrl || "",
      });
    }
  }, [vocabulary]);

  const createMutation = trpc.vocabulary.create.useMutation({
    onSuccess: () => {
      toast.success("Vocabulary created successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create vocabulary");
    },
  });

  const updateMutation = trpc.vocabulary.update.useMutation({
    onSuccess: () => {
      toast.success("Vocabulary updated successfully!");
      onSuccess();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update vocabulary");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.word || !formData.ipa || !formData.exampleSentence) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (vocabulary) {
      updateMutation.mutate({
        id: vocabulary.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {vocabulary ? "Edit Vocabulary" : "Add New Vocabulary"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Word */}
          <div className="space-y-2">
            <Label htmlFor="word">Word *</Label>
            <Input
              id="word"
              value={formData.word}
              onChange={(e) => setFormData({ ...formData, word: e.target.value })}
              placeholder="e.g., apple"
              disabled={isLoading}
            />
          </div>

          {/* IPA */}
          <div className="space-y-2">
            <Label htmlFor="ipa">IPA Phonetic *</Label>
            <Input
              id="ipa"
              value={formData.ipa}
              onChange={(e) => setFormData({ ...formData, ipa: e.target.value })}
              placeholder="e.g., ˈæpəl"
              disabled={isLoading}
            />
          </div>

          {/* Example Sentence */}
          <div className="space-y-2">
            <Label htmlFor="exampleSentence">Example Sentence *</Label>
            <Textarea
              id="exampleSentence"
              value={formData.exampleSentence}
              onChange={(e) => setFormData({ ...formData, exampleSentence: e.target.value })}
              placeholder="e.g., I eat a red apple every day."
              disabled={isLoading}
              rows={3}
            />
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label htmlFor="difficulty">Difficulty Level</Label>
            <Select
              value={formData.difficulty}
              onValueChange={(value: "beginner" | "intermediate" | "advanced") =>
                setFormData({ ...formData, difficulty: value })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="difficulty">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Audio Upload Fields */}
          <div className="grid gap-4 md:grid-cols-2">
            <AudioUploadField
              label="Word Audio"
              type="word"
              currentUrl={formData.wordAudioUrl}
              onUrlChange={(url) => setFormData({ ...formData, wordAudioUrl: url })}
            />
            <AudioUploadField
              label="Sentence Audio"
              type="sentence"
              currentUrl={formData.sentenceAudioUrl}
              onUrlChange={(url) => setFormData({ ...formData, sentenceAudioUrl: url })}
            />
          </div>
        </form>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading} className="gap-2">
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {vocabulary ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
