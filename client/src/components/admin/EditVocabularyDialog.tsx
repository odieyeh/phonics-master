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
import AudioRecorder from "./AudioRecorder";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, Upload } from "lucide-react";
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
    unitId: null as number | null,
  });
  
  // Fetch units for dropdown
  const { data: units = [] } = trpc.unit.list.useQuery({});

  useEffect(() => {
    if (vocabulary) {
      setFormData({
        word: vocabulary.word,
        ipa: vocabulary.ipa,
        exampleSentence: vocabulary.exampleSentence,
        difficulty: vocabulary.difficulty || "beginner",
        wordAudioUrl: vocabulary.wordAudioUrl || "",
        sentenceAudioUrl: vocabulary.sentenceAudioUrl || "",
        unitId: vocabulary.unitId || null,
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
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {vocabulary ? "Edit Vocabulary" : "Add New Vocabulary"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-1">
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

          {/* Unit Selection */}
          <div className="space-y-2">
            <Label htmlFor="unit">Unit (Optional)</Label>
            <Select
              value={formData.unitId?.toString() || "0"}
              onValueChange={(value) =>
                setFormData({ ...formData, unitId: value === "0" ? null : parseInt(value) })
              }
              disabled={isLoading}
            >
              <SelectTrigger id="unit">
                <SelectValue placeholder="Select a unit..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No Unit</SelectItem>
                {units.map((unit) => (
                  <SelectItem key={unit.id} value={unit.id.toString()}>
                    {unit.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Audio Section */}
          <div className="space-y-3">
            <Label className="text-sm font-semibold">Audio Pronunciation</Label>
            <div className="grid gap-4 md:grid-cols-2">
              {/* Word Audio */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Word Audio</p>
                <Tabs defaultValue="record">
                  <TabsList className="w-full h-8">
                    <TabsTrigger value="record" className="flex-1 text-xs gap-1">
                      <Mic className="h-3 w-3" /> Record
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1 text-xs gap-1">
                      <Upload className="h-3 w-3" /> Upload
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="record" className="mt-2">
                    <AudioRecorder
                      label="Word Pronunciation"
                      existingUrl={formData.wordAudioUrl || null}
                      onUploadComplete={(url) => setFormData({ ...formData, wordAudioUrl: url })}
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-2">
                    <AudioUploadField
                      label="Word Audio"
                      type="word"
                      currentUrl={formData.wordAudioUrl}
                      onUrlChange={(url) => setFormData({ ...formData, wordAudioUrl: url })}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              {/* Sentence Audio */}
              <div className="space-y-2">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Sentence Audio</p>
                <Tabs defaultValue="record">
                  <TabsList className="w-full h-8">
                    <TabsTrigger value="record" className="flex-1 text-xs gap-1">
                      <Mic className="h-3 w-3" /> Record
                    </TabsTrigger>
                    <TabsTrigger value="upload" className="flex-1 text-xs gap-1">
                      <Upload className="h-3 w-3" /> Upload
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="record" className="mt-2">
                    <AudioRecorder
                      label="Sentence Pronunciation"
                      existingUrl={formData.sentenceAudioUrl || null}
                      onUploadComplete={(url) => setFormData({ ...formData, sentenceAudioUrl: url })}
                    />
                  </TabsContent>
                  <TabsContent value="upload" className="mt-2">
                    <AudioUploadField
                      label="Sentence Audio"
                      type="sentence"
                      currentUrl={formData.sentenceAudioUrl}
                      onUrlChange={(url) => setFormData({ ...formData, sentenceAudioUrl: url })}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </form>

        <DialogFooter className="flex-shrink-0 border-t pt-4">
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
