"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Play, Pause, RotateCcw, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

interface AudioRecorderProps {
  onRecordingComplete?: (blob: Blob, duration: number) => void;
  existingAudioUrl?: string | null;
  className?: string;
}

export function AudioRecorder({
  onRecordingComplete,
  existingAudioUrl,
  className = "",
}: AudioRecorderProps) {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(existingAudioUrl || null);
  const [duration, setDuration] = useState(0);
  const [playing, setPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioRef.current) {
        audioRef.current.pause();
      }
      if (audioUrl && !existingAudioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl, existingAudioUrl]);

  const startRecording = async () => {
    try {
      // Clear previous recording
      if (audioUrl && !existingAudioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
      setAudioUrl(null);
      setAudioBlob(null);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());

        if (onRecordingComplete) {
          onRecordingComplete(blob, duration);
        }
      };

      mediaRecorder.start();
      setRecording(true);
      setDuration(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);

      toast.success("Bắt đầu ghi âm!");
    } catch (error) {
      toast.error("Không thể truy cập microphone!");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      toast.success("Đã dừng ghi âm!");
    }
  };

  const togglePlayback = () => {
    if (!audioUrl) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioUrl);
      audioRef.current.onended = () => setPlaying(false);
    }

    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
    } else {
      audioRef.current.play();
      setPlaying(true);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className={`p-6 bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 ${className}`}>
      <div className="space-y-4">
        {/* Timer */}
        <div className="flex items-center justify-center gap-2 text-2xl font-bold text-gray-900">
          <Clock className="w-6 h-6 text-orange-600" />
          <span>{formatTime(duration)}</span>
        </div>

        {/* Recording Controls */}
        <div className="flex items-center justify-center gap-3">
          {!recording && !audioUrl && (
            <Button
              onClick={startRecording}
              size="lg"
              className="bg-gradient-to-br from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 h-16 px-8"
            >
              <Mic className="w-6 h-6 mr-2" />
              Bắt đầu ghi âm
            </Button>
          )}

          {recording && (
            <Button
              onClick={stopRecording}
              size="lg"
              variant="destructive"
              className="h-16 px-8 animate-pulse"
            >
              <Square className="w-6 h-6 mr-2" fill="white" />
              Dừng ghi âm
            </Button>
          )}

          {!recording && audioUrl && (
            <>
              <Button onClick={togglePlayback} size="lg" variant="secondary" className="h-14 px-6">
                {playing ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Tạm dừng
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Nghe lại
                  </>
                )}
              </Button>
              <Button onClick={startRecording} size="lg" variant="outline" className="h-14 px-6">
                <RotateCcw className="w-5 h-5 mr-2" />
                Ghi lại
              </Button>
            </>
          )}
        </div>

        {/* Status */}
        {recording && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <span className="font-medium">Đang ghi âm...</span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

