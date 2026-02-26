import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Upload, Loader2, X, Play } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface AudioUploadFieldProps {
  label: string;
  type: "word" | "sentence";
  currentUrl?: string;
  onUrlChange: (url: string) => void;
}

export default function AudioUploadField({
  label,
  type,
  currentUrl,
  onUrlChange,
}: AudioUploadFieldProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const uploadMutation = trpc.audio.upload.useMutation({
    onSuccess: (result) => {
      onUrlChange(result.url);
      toast.success(`${label} audio uploaded successfully!`);
      setIsUploading(false);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to upload audio");
      setIsUploading(false);
    },
  });

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds 10MB limit");
      return;
    }

    // Validate file type
    const allowedTypes = [
      "audio/mpeg",
      "audio/wav",
      "audio/mp4",
      "audio/ogg",
      "audio/webm",
      "audio/aac",
    ];
    if (!allowedTypes.includes(file.type)) {
      toast.error(
        `Unsupported audio format: ${file.type}. Supported: MP3, WAV, M4A, OGG, WebM, AAC`
      );
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(",")[1]; // Remove data:audio/mpeg;base64, prefix

      setIsUploading(true);
      uploadMutation.mutate({
        audioBase64: base64Data,
        fileName: file.name,
        type,
      });
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleRemove = () => {
    onUrlChange("");
    toast.success("Audio removed");
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      
      {currentUrl ? (
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 p-3">
          <audio
            ref={audioRef}
            src={currentUrl}
            onEnded={() => setIsPlaying(false)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handlePlay}
            className="gap-2"
          >
            <Play className="h-4 w-4" />
            {isPlaying ? "Playing..." : "Play"}
          </Button>
          <span className="flex-1 truncate text-sm text-muted-foreground">
            Audio uploaded
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemove}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Choose Audio File
              </>
            )}
          </Button>
          <p className="text-xs text-muted-foreground">
            MP3, WAV, M4A, OGG, WebM, AAC (Max 10MB)
          </p>
        </div>
      )}
    </div>
  );
}
