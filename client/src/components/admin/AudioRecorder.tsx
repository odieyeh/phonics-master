import React, { useState, useRef, useCallback } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Upload, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type RecordingState = "idle" | "recording" | "recorded" | "uploading" | "done";

interface AudioRecorderProps {
  label: string;
  existingUrl?: string | null;
  onUploadComplete: (url: string) => void;
  className?: string;
}

export default function AudioRecorder({
  label,
  existingUrl,
  onUploadComplete,
  className,
}: AudioRecorderProps) {
  const [state, setState] = useState<RecordingState>(existingUrl ? "done" : "idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(existingUrl ?? null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : "audio/webm",
      });

      audioChunksRef.current = [];
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setState("recorded");
        stream.getTracks().forEach((t) => t.stop());
      };

      mediaRecorder.start(100);
      setState("recording");
      setElapsed(0);
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      toast.error("Microphone access denied. Please allow microphone access.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    mediaRecorderRef.current?.stop();
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const resetRecording = useCallback(() => {
    if (audioElementRef.current) {
      audioElementRef.current.pause();
      audioElementRef.current = null;
    }
    setAudioUrl(existingUrl ?? null);
    setState(existingUrl ? "done" : "idle");
    setIsPlaying(false);
    setElapsed(0);
    audioBlobRef.current = null;
  }, [existingUrl]);

  const togglePlayback = useCallback(() => {
    if (!audioUrl) return;

    if (!audioElementRef.current) {
      const audio = new Audio(audioUrl);
      audioElementRef.current = audio;
      audio.onloadedmetadata = () => setDuration(Math.round(audio.duration));
      audio.onended = () => {
        setIsPlaying(false);
        audioElementRef.current = null;
      };
    }

    if (isPlaying) {
      audioElementRef.current.pause();
      setIsPlaying(false);
    } else {
      audioElementRef.current.play();
      setIsPlaying(true);
    }
  }, [audioUrl, isPlaying]);

  const uploadRecording = useCallback(async () => {
    if (!audioBlobRef.current) return;

    setState("uploading");
    try {
      const formData = new FormData();
      formData.append("file", audioBlobRef.current, `recording-${Date.now()}.webm`);

      const response = await fetch("/api/audio/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) throw new Error("Upload failed");

      const data = await response.json();
      onUploadComplete(data.url);
      setAudioUrl(data.url);
      setState("done");
      toast.success(`${label} audio uploaded successfully!`);
    } catch {
      toast.error("Upload failed. Please try again.");
      setState("recorded");
    }
  }, [label, onUploadComplete]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className={cn("rounded-xl border border-border bg-muted/30 p-4 space-y-3", className)}>
      {/* Label */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{label}</span>
        {state === "done" && (
          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Saved
          </span>
        )}
      </div>

      {/* Waveform / Status area */}
      <div className={cn(
        "flex items-center justify-center rounded-lg h-14 transition-all duration-300",
        state === "recording" ? "bg-red-50 border border-red-200" : "bg-background border border-border"
      )}>
        {state === "idle" && (
          <p className="text-xs text-muted-foreground">Click the mic to start recording</p>
        )}
        {state === "recording" && (
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
            </span>
            <span className="text-sm font-mono font-bold text-red-600">{formatTime(elapsed)}</span>
            <span className="text-xs text-red-500">Recording...</span>
          </div>
        )}
        {(state === "recorded" || state === "uploading" || state === "done") && audioUrl && (
          <div className="flex items-center gap-3 w-full px-3">
            <button
              type="button"
              onClick={togglePlayback}
              className="flex-shrink-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5 ml-0.5" />}
            </button>
            <div className="flex-1">
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full w-1/3 transition-all" />
              </div>
            </div>
            {duration > 0 && (
              <span className="text-xs text-muted-foreground font-mono flex-shrink-0">{formatTime(duration)}</span>
            )}
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {state === "idle" && (
          <Button
            type="button"
            size="sm"
            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            onClick={startRecording}
          >
            <Mic className="h-4 w-4" />
            Start Recording
          </Button>
        )}

        {state === "recording" && (
          <Button
            type="button"
            size="sm"
            variant="destructive"
            className="flex-1 gap-2"
            onClick={stopRecording}
          >
            <Square className="h-3.5 w-3.5 fill-current" />
            Stop Recording
          </Button>
        )}

        {state === "recorded" && (
          <>
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="gap-2"
              onClick={resetRecording}
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Re-record
            </Button>
            <Button
              type="button"
              size="sm"
              className="flex-1 gap-2 bg-green-600 hover:bg-green-700 text-white"
              onClick={uploadRecording}
            >
              <Upload className="h-3.5 w-3.5" />
              Save Audio
            </Button>
          </>
        )}

        {state === "uploading" && (
          <Button type="button" size="sm" disabled className="flex-1 gap-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Uploading...
          </Button>
        )}

        {state === "done" && (
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="gap-2"
            onClick={resetRecording}
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Re-record
          </Button>
        )}
      </div>
    </div>
  );
}
