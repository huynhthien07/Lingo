"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, BookOpen, Calendar, FileText } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "./exercises/rich-text-editor";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface TestWritingSubmission {
  id: number;
  attemptId: number;
  userId: string;
  testId: number;
  questionId: number | null;
  textAnswer: string | null;
  taskAchievementScore: number | null;
  coherenceCohesionScore: number | null;
  lexicalResourceScore: number | null;
  grammaticalRangeScore: number | null;
  overallBandScore: number | null;
  feedback: string | null;
  status: string;
  gradedBy: string | null;
  gradedAt: Date | null;
  createdAt: Date;
  student: {
    name: string | null;
    email: string;
  };
  test: {
    title: string;
    type: string;
  };
  question: {
    questionText: string;
  } | null;
}

export function TestWritingGradingView({ submissionId }: { submissionId: number }) {
  const router = useRouter();
  const [submission, setSubmission] = useState<TestWritingSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    taskAchievementScore: "" as any,
    coherenceCohesionScore: "" as any,
    lexicalResourceScore: "" as any,
    grammaticalRangeScore: "" as any,
    feedback: "",
  });

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(`/api/teacher/test-submissions/submission/${submissionId}`);
      if (!response.ok) throw new Error("Failed to fetch submission");
      const data = await response.json();
      setSubmission(data);

      // Pre-fill form if already graded
      if (data.taskAchievementScore !== null) {
        setFormData({
          taskAchievementScore: data.taskAchievementScore,
          coherenceCohesionScore: data.coherenceCohesionScore,
          lexicalResourceScore: data.lexicalResourceScore,
          grammaticalRangeScore: data.grammaticalRangeScore,
          feedback: data.feedback || "",
        });
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
      toast.error("Failed to load submission");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Validate scores
      const scores = [
        formData.taskAchievementScore,
        formData.coherenceCohesionScore,
        formData.lexicalResourceScore,
        formData.grammaticalRangeScore,
      ];

      if (scores.some((s) => s === "" || s < 0 || s > 9)) {
        toast.error("All scores must be between 0 and 9");
        setSaving(false);
        return;
      }

      // Calculate overall band score
      const overallBandScore =
        scores.reduce((sum, score) => sum + Number(score), 0) / scores.length;

      const response = await fetch(`/api/teacher/test-submissions/submission/${submissionId}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          overallBandScore,
          status: "GRADED",
        }),
      });

      if (!response.ok) throw new Error("Failed to save grade");

      toast.success("Grade saved successfully!");
      router.push("/teacher/submissions");
    } catch (error) {
      console.error("Error saving grade:", error);
      toast.error("Failed to save grade");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Submission not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/teacher/submissions"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Test Writing Submission Review
            </h1>
            <p className="text-gray-600 mt-1">
              Review and provide feedback for student writing
            </p>
          </div>
        </div>
        <Badge variant={submission.status === "GRADED" ? "default" : "outline"}>
          {submission.status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Student Work */}
        <div className="lg:col-span-2 space-y-6">
          {/* Student Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Student Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span className="font-medium">{submission.student.name || "Unknown"}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{submission.test.title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(submission.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question */}
          {submission.question && (
            <Card>
              <CardHeader>
                <CardTitle>Question</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700">{submission.question.questionText}</p>
              </CardContent>
            </Card>
          )}

          {/* Student Answer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Student Answer
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap text-gray-700">
                  {submission.textAnswer || "No answer provided"}
                </p>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                Word count: {submission.textAnswer?.split(/\s+/).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Grading Form */}
        <div className="space-y-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>IELTS Band Scores</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="taskAchievement">Task Achievement (0-9)</Label>
                  <Input
                    id="taskAchievement"
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={formData.taskAchievementScore}
                    onChange={(e) =>
                      setFormData({ ...formData, taskAchievementScore: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="coherenceCohesion">Coherence & Cohesion (0-9)</Label>
                  <Input
                    id="coherenceCohesion"
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={formData.coherenceCohesionScore}
                    onChange={(e) =>
                      setFormData({ ...formData, coherenceCohesionScore: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="lexicalResource">Lexical Resource (0-9)</Label>
                  <Input
                    id="lexicalResource"
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={formData.lexicalResourceScore}
                    onChange={(e) =>
                      setFormData({ ...formData, lexicalResourceScore: e.target.value })
                    }
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="grammaticalRange">Grammatical Range & Accuracy (0-9)</Label>
                  <Input
                    id="grammaticalRange"
                    type="number"
                    min="0"
                    max="9"
                    step="0.5"
                    value={formData.grammaticalRangeScore}
                    onChange={(e) =>
                      setFormData({ ...formData, grammaticalRangeScore: e.target.value })
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Feedback</CardTitle>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={formData.feedback}
                  onChange={(value) => setFormData({ ...formData, feedback: value })}
                  placeholder="Provide detailed feedback for the student..."
                />
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save Grade"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

