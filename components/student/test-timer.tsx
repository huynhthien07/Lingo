"use client";

import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface TestTimerProps {
  duration: number; // Duration in minutes
  startTime: Date;
  onTimeUp: () => void;
  isStarted: boolean;
}

export function TestTimer({ duration, startTime, onTimeUp, isStarted }: TestTimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert to seconds
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!isStarted) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const start = new Date(startTime).getTime();
      const elapsed = Math.floor((now - start) / 1000); // seconds
      const remaining = duration * 60 - elapsed;

      if (remaining <= 0) {
        setTimeLeft(0);
        clearInterval(interval);
        onTimeUp();
      } else {
        setTimeLeft(remaining);
        // Warning when 5 minutes left
        setIsWarning(remaining <= 300);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [duration, startTime, onTimeUp, isStarted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Card className={isWarning ? "border-red-500 bg-red-50" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className={`h-5 w-5 ${isWarning ? "text-red-600" : ""}`} />
          Thời gian còn lại
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`text-4xl font-bold text-center ${
            isWarning ? "text-red-600" : "text-blue-600"
          }`}
        >
          {isStarted ? formatTime(timeLeft) : formatTime(duration * 60)}
        </div>
        {isWarning && isStarted && (
          <div className="mt-4 flex items-start gap-2 text-sm text-red-600">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>Thời gian sắp hết! Hãy hoàn thành bài test của bạn.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

