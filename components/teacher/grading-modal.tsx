"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Mic, FileText, Play, Pause, Volume2 } from "lucide-react";
import { AudioPlayer } from "@/components/ui/audio-player";

interface Submission {
  id: number;
  skillType: "SPEAKING" | "WRITING";
  audioUrl: string | null;
  textAnswer: string | null;
  questionText: string | null;
  studentName: string | null;
  studentEmail: string | null;
  testTitle: string | null;
  maxScore: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  submission: Submission;
  onSubmit: (score: number, feedback: string) => void;
}

const GradingModal = ({ open, onClose, submission, onSubmit }: Props) => {
  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    const scoreNum = parseFloat(score);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > submission.maxScore) {
      alert(`Score must be between 0 and ${submission.maxScore}`);
      return;
    }

    setSubmitting(true);
    await onSubmit(scoreNum, feedback);
    setSubmitting(false);
    
    // Reset form
    setScore("");
    setFeedback("");
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            {submission.skillType === "SPEAKING" ? (
              <Mic className="w-6 h-6 text-blue-600" />
            ) : (
              <FileText className="w-6 h-6 text-green-600" />
            )}
            Grade {submission.skillType} Submission
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Student Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Student</p>
                <p className="font-semibold">
                  {submission.studentName || submission.studentEmail}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Test</p>
                <p className="font-semibold">{submission.testTitle || "Untitled"}</p>
              </div>
            </div>
          </div>

          {/* Question */}
          {submission.questionText && (
            <div>
              <Label className="text-base font-semibold mb-2 block">Question</Label>
              <p className="text-gray-700 bg-blue-50 p-4 rounded-lg border border-blue-200">
                {submission.questionText}
              </p>
            </div>
          )}

          {/* Student Answer */}
          <div>
            <Label className="text-base font-semibold mb-2 block">Student Answer</Label>
            {submission.skillType === "SPEAKING" && submission.audioUrl ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <AudioPlayer src={submission.audioUrl} />
              </div>
            ) : submission.skillType === "WRITING" && submission.textAnswer ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-64 overflow-y-auto">
                <p className="text-gray-700 whitespace-pre-wrap">{submission.textAnswer}</p>
              </div>
            ) : (
              <p className="text-gray-500 italic">No answer provided</p>
            )}
          </div>

          {/* Score Input */}
          <div>
            <Label htmlFor="score" className="text-base font-semibold mb-2 block">
              Score (0-{submission.maxScore})
            </Label>
            <Input
              id="score"
              type="number"
              min="0"
              max={submission.maxScore}
              step="0.5"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder={`Enter score (0-${submission.maxScore})`}
              className="text-lg"
            />
          </div>

          {/* Feedback */}
          <div>
            <Label htmlFor="feedback" className="text-base font-semibold mb-2 block">
              Feedback (Optional)
            </Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback to the student..."
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GradingModal;

