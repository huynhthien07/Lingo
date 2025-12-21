"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AudioPlayer } from "@/components/ui/audio-player";
import { ArrowLeft, Mic, FileText, User, Calendar, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface TestSubmissionGradingViewProps {
  attemptId: number;
  submissionId: number;
}

interface Submission {
  id: number;
  questionId: number | null;
  skillType: "SPEAKING" | "WRITING";
  audioUrl: string | null;
  textAnswer: string | null;
  questionText: string | null;
  status: string;
  // Criteria scores
  fluencyCoherenceScore: number | null;
  pronunciationScore: number | null;
  taskAchievementScore: number | null;
  coherenceCohesionScore: number | null;
  lexicalResourceScore: number | null;
  grammaticalRangeScore: number | null;
  overallBandScore: number | null;
  feedback: string | null;
  // Student & Test info
  studentName: string | null;
  studentEmail: string | null;
  testTitle: string | null;
  createdAt: string;
}

export function TestSubmissionGradingView({ attemptId, submissionId }: TestSubmissionGradingViewProps) {
  const router = useRouter();
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    // Speaking criteria
    fluencyCoherenceScore: "",
    pronunciationScore: "",
    // Writing criteria
    taskAchievementScore: "",
    coherenceCohesionScore: "",
    // Common criteria
    lexicalResourceScore: "",
    grammaticalRangeScore: "",
    feedback: "",
  });

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/test-submissions/${submissionId}`);
      if (!response.ok) throw new Error("Failed to fetch submission");
      const data = await response.json();
      setSubmission(data);

      // Initialize form with existing data
      setFormData({
        fluencyCoherenceScore: data.fluencyCoherenceScore?.toString() || "",
        pronunciationScore: data.pronunciationScore?.toString() || "",
        taskAchievementScore: data.taskAchievementScore?.toString() || "",
        coherenceCohesionScore: data.coherenceCohesionScore?.toString() || "",
        lexicalResourceScore: data.lexicalResourceScore?.toString() || "",
        grammaticalRangeScore: data.grammaticalRangeScore?.toString() || "",
        feedback: data.feedback || "",
      });
    } catch (error) {
      console.error("Error fetching submission:", error);
      toast.error("Failed to load submission");
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallScore = () => {
    const scores: number[] = [];
    
    if (submission?.skillType === "SPEAKING") {
      if (formData.fluencyCoherenceScore) scores.push(parseFloat(formData.fluencyCoherenceScore));
      if (formData.pronunciationScore) scores.push(parseFloat(formData.pronunciationScore));
    } else {
      if (formData.taskAchievementScore) scores.push(parseFloat(formData.taskAchievementScore));
      if (formData.coherenceCohesionScore) scores.push(parseFloat(formData.coherenceCohesionScore));
    }
    
    if (formData.lexicalResourceScore) scores.push(parseFloat(formData.lexicalResourceScore));
    if (formData.grammaticalRangeScore) scores.push(parseFloat(formData.grammaticalRangeScore));

    if (scores.length === 0) return "0.0";
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return avg.toFixed(1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all required scores are filled
    const requiredScores = submission?.skillType === "SPEAKING"
      ? [formData.fluencyCoherenceScore, formData.pronunciationScore]
      : [formData.taskAchievementScore, formData.coherenceCohesionScore];
    
    requiredScores.push(formData.lexicalResourceScore, formData.grammaticalRangeScore);

    if (requiredScores.some((score) => !score)) {
      toast.error("Please fill in all criteria scores");
      return;
    }

    if (!formData.feedback || formData.feedback.length < 20) {
      toast.error("Please provide feedback (minimum 20 characters)");
      return;
    }

    try {
      setSaving(true);
      const response = await fetch(`/api/teacher/test-submissions/${submissionId}/grade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fluencyCoherenceScore: formData.fluencyCoherenceScore ? parseFloat(formData.fluencyCoherenceScore) : null,
          pronunciationScore: formData.pronunciationScore ? parseFloat(formData.pronunciationScore) : null,
          taskAchievementScore: formData.taskAchievementScore ? parseFloat(formData.taskAchievementScore) : null,
          coherenceCohesionScore: formData.coherenceCohesionScore ? parseFloat(formData.coherenceCohesionScore) : null,
          lexicalResourceScore: parseFloat(formData.lexicalResourceScore),
          grammaticalRangeScore: parseFloat(formData.grammaticalRangeScore),
          feedback: formData.feedback,
        }),
      });

      if (!response.ok) throw new Error("Failed to save grading");

      toast.success("Grading saved successfully!");
      router.push(`/teacher/test-submissions/${attemptId}`);
    } catch (error) {
      console.error("Error saving grading:", error);
      toast.error("Failed to save grading");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="p-6">
        <p className="text-gray-600">Submission not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push(`/teacher/test-submissions/${attemptId}`)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Test
          </Button>
          <div className="h-6 w-px bg-gray-300" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {submission.skillType === "SPEAKING" ? "Speaking" : "Writing"} Submission Grading
            </h1>
            <p className="text-sm text-gray-600">{submission.testTitle}</p>
          </div>
        </div>

        {/* Student Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <User className="w-4 h-4" />
                <span>{submission.studentName || submission.studentEmail}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span>{new Date(submission.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <BookOpen className="w-4 h-4" />
                <Badge variant="outline">
                  {submission.status === "GRADED" ? "Graded" : "Pending"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Left - Question & Answer */}
          <div className="space-y-6">
            {/* Question */}
            {submission.questionText && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Question</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-gray-700">{submission.questionText}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Student Answer */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  {submission.skillType === "SPEAKING" ? (
                    <><Mic className="h-4 w-4" /> Speaking Response</>
                  ) : (
                    <><FileText className="h-4 w-4" /> Writing Response</>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {submission.skillType === "SPEAKING" && submission.audioUrl ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <AudioPlayer src={submission.audioUrl} />
                  </div>
                ) : submission.skillType === "WRITING" && submission.textAnswer ? (
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.textAnswer}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No answer provided</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right - Grading Form */}
          <div>
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">IELTS Band Scores</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Speaking Criteria */}
                  {submission.skillType === "SPEAKING" && (
                    <>
                      <div>
                        <Label htmlFor="fluency">Fluency & Coherence (0-9)</Label>
                        <Input
                          id="fluency"
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={formData.fluencyCoherenceScore}
                          onChange={(e) => setFormData({ ...formData, fluencyCoherenceScore: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="pronunciation">Pronunciation (0-9)</Label>
                        <Input
                          id="pronunciation"
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={formData.pronunciationScore}
                          onChange={(e) => setFormData({ ...formData, pronunciationScore: e.target.value })}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Writing Criteria */}
                  {submission.skillType === "WRITING" && (
                    <>
                      <div>
                        <Label htmlFor="task">Task Achievement (0-9)</Label>
                        <Input
                          id="task"
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={formData.taskAchievementScore}
                          onChange={(e) => setFormData({ ...formData, taskAchievementScore: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="coherence">Coherence & Cohesion (0-9)</Label>
                        <Input
                          id="coherence"
                          type="number"
                          min="0"
                          max="9"
                          step="0.5"
                          value={formData.coherenceCohesionScore}
                          onChange={(e) => setFormData({ ...formData, coherenceCohesionScore: e.target.value })}
                          required
                        />
                      </div>
                    </>
                  )}

                  {/* Common Criteria */}
                  <div>
                    <Label htmlFor="lexical">Lexical Resource (0-9)</Label>
                    <Input
                      id="lexical"
                      type="number"
                      min="0"
                      max="9"
                      step="0.5"
                      value={formData.lexicalResourceScore}
                      onChange={(e) => setFormData({ ...formData, lexicalResourceScore: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="grammar">Grammatical Range & Accuracy (0-9)</Label>
                    <Input
                      id="grammar"
                      type="number"
                      min="0"
                      max="9"
                      step="0.5"
                      value={formData.grammaticalRangeScore}
                      onChange={(e) => setFormData({ ...formData, grammaticalRangeScore: e.target.value })}
                      required
                    />
                  </div>

                  {/* Overall Score */}
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Overall Band Score</span>
                      <span className="text-2xl font-bold text-blue-600">{calculateOverallScore()}</span>
                    </div>
                  </div>

                  {/* Feedback */}
                  <div>
                    <Label htmlFor="feedback">Teacher Feedback (min 20 characters)</Label>
                    <Textarea
                      id="feedback"
                      rows={6}
                      value={formData.feedback}
                      onChange={(e) => setFormData({ ...formData, feedback: e.target.value })}
                      placeholder="Provide detailed feedback for the student..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.feedback.length} characters
                    </p>
                  </div>

                  {/* Submit Button */}
                  <Button type="submit" disabled={saving} className="w-full">
                    {saving ? "Saving..." : "Save Grading"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

