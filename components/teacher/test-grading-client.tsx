"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  FileText,
  Mic,
  CheckCircle,
  ArrowLeft,
} from "lucide-react";
import { AudioPlayer } from "@/components/ui/audio-player";
import { toast } from "sonner";

interface TestGradingClientProps {
  attemptId: number;
}

interface Submission {
  id: number;
  questionId: number | null;
  skillType: "SPEAKING" | "WRITING";
  audioUrl: string | null;
  textAnswer: string | null;
  score: number | null;
  maxScore: number;
  feedback: string | null;
  status: string;
  questionText: string | null;
  // Criteria scores
  fluencyCoherenceScore: number | null;
  pronunciationScore: number | null;
  taskAchievementScore: number | null;
  coherenceCohesionScore: number | null;
  lexicalResourceScore: number | null;
  grammaticalRangeScore: number | null;
  overallBandScore: number | null;
}

interface AttemptData {
  attemptId: number;
  userId: string;
  testId: number;
  testTitle: string | null;
  testType: string | null;
  studentName: string | null;
  studentEmail: string | null;
  attemptStartedAt: Date | null;
  attemptCompletedAt: Date | null;
  submissions: Submission[];
}

export function TestGradingClient({ attemptId }: TestGradingClientProps) {
  const router = useRouter();
  const [attemptData, setAttemptData] = useState<AttemptData | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAttemptData();
  }, [attemptId]);

  const fetchAttemptData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/test-submissions/attempt/${attemptId}`);
      if (!response.ok) throw new Error("Failed to fetch attempt data");
      const data = await response.json();
      setAttemptData(data);
    } catch (error) {
      console.error("Error fetching attempt data:", error);
      toast.error("Failed to load grading data");
    } finally {
      setLoading(false);
    }
  };

  const handleViewSubmission = (submissionId: number) => {
    router.push(`/teacher/test-submissions/${attemptId}/submission/${submissionId}`);
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

  if (!attemptData || attemptData.submissions.length === 0) {
    return (
      <div className="p-6">
        <p className="text-gray-600">No submissions found</p>
      </div>
    );
  }

  const currentSubmission = attemptData.submissions[currentIndex];
  const gradedCount = attemptData.submissions.filter((s) => s.status === "GRADED").length;
  const totalCount = attemptData.submissions.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/teacher/test-submissions")}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Submissions
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {attemptData.testTitle || "Test Grading"}
                </h1>
                <p className="text-sm text-gray-600">
                  Student: {attemptData.studentName || attemptData.studentEmail}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-sm">
                Progress: {gradedCount}/{totalCount}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-12 gap-6">
          {/* Left - Question Display */}
          <div className="col-span-8">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {currentSubmission.skillType === "SPEAKING" ? (
                      <Mic className="h-5 w-5 text-blue-600" />
                    ) : (
                      <FileText className="h-5 w-5 text-green-600" />
                    )}
                    Question {currentIndex + 1} of {totalCount}
                  </CardTitle>
                  <Badge
                    variant={currentSubmission.status === "GRADED" ? "default" : "outline"}
                    className={
                      currentSubmission.status === "GRADED"
                        ? "bg-green-100 text-green-700 border-green-200"
                        : ""
                    }
                  >
                    {currentSubmission.status === "GRADED" ? (
                      <>
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Graded
                      </>
                    ) : (
                      "Pending"
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Question Text */}
                {currentSubmission.questionText && (
                  <div>
                    <Label className="text-base font-semibold mb-2 block">Question</Label>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <p className="text-gray-700">{currentSubmission.questionText}</p>
                    </div>
                  </div>
                )}

                {/* Student Answer */}
                <div>
                  <Label className="text-base font-semibold mb-2 block">Student Answer</Label>
                  {currentSubmission.skillType === "SPEAKING" && currentSubmission.audioUrl ? (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <AudioPlayer src={currentSubmission.audioUrl} />
                    </div>
                  ) : currentSubmission.skillType === "WRITING" && currentSubmission.textAnswer ? (
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 max-h-96 overflow-y-auto">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {currentSubmission.textAnswer}
                      </p>
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">No answer provided</p>
                  )}
                </div>

                {/* Grading Status/Preview */}
                <div className="border-t pt-6 space-y-4">
                  {currentSubmission.status === "GRADED" && currentSubmission.overallBandScore ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold text-green-900">Graded</h4>
                        <Badge className="bg-green-600">
                          Band {currentSubmission.overallBandScore.toFixed(1)}
                        </Badge>
                      </div>

                      {/* Criteria Scores Preview */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        {currentSubmission.skillType === "SPEAKING" ? (
                          <>
                            {currentSubmission.fluencyCoherenceScore && (
                              <div className="flex justify-between">
                                <span className="text-gray-700">Fluency & Coherence:</span>
                                <span className="font-semibold">{currentSubmission.fluencyCoherenceScore}</span>
                              </div>
                            )}
                            {currentSubmission.pronunciationScore && (
                              <div className="flex justify-between">
                                <span className="text-gray-700">Pronunciation:</span>
                                <span className="font-semibold">{currentSubmission.pronunciationScore}</span>
                              </div>
                            )}
                          </>
                        ) : (
                          <>
                            {currentSubmission.taskAchievementScore && (
                              <div className="flex justify-between">
                                <span className="text-gray-700">Task Achievement:</span>
                                <span className="font-semibold">{currentSubmission.taskAchievementScore}</span>
                              </div>
                            )}
                            {currentSubmission.coherenceCohesionScore && (
                              <div className="flex justify-between">
                                <span className="text-gray-700">Coherence & Cohesion:</span>
                                <span className="font-semibold">{currentSubmission.coherenceCohesionScore}</span>
                              </div>
                            )}
                          </>
                        )}
                        {currentSubmission.lexicalResourceScore && (
                          <div className="flex justify-between">
                            <span className="text-gray-700">Lexical Resource:</span>
                            <span className="font-semibold">{currentSubmission.lexicalResourceScore}</span>
                          </div>
                        )}
                        {currentSubmission.grammaticalRangeScore && (
                          <div className="flex justify-between">
                            <span className="text-gray-700">Grammar:</span>
                            <span className="font-semibold">{currentSubmission.grammaticalRangeScore}</span>
                          </div>
                        )}
                      </div>

                      {currentSubmission.feedback && (
                        <div className="mt-4 pt-4 border-t border-green-200">
                          <p className="text-sm text-gray-700 font-medium mb-1">Feedback:</p>
                          <p className="text-sm text-gray-600">{currentSubmission.feedback}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                      <p className="text-orange-800 font-medium mb-2">Not graded yet</p>
                      <p className="text-sm text-orange-600">Click "Grade Submission" to provide detailed feedback</p>
                    </div>
                  )}

                  <Button
                    onClick={() => handleViewSubmission(currentSubmission.id)}
                    className="w-full"
                    variant={currentSubmission.status === "GRADED" ? "outline" : "default"}
                  >
                    {currentSubmission.status === "GRADED" ? "View/Edit Grading" : "Grade Submission"}
                  </Button>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between border-t pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                  >
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentIndex((prev) => Math.min(totalCount - 1, prev + 1))
                    }
                    disabled={currentIndex === totalCount - 1}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right - Question Navigation */}
          <div className="col-span-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">All Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-5 gap-2">
                  {attemptData.submissions.map((submission, index) => (
                    <button
                      key={submission.id}
                      onClick={() => setCurrentIndex(index)}
                      className={`
                        aspect-square rounded-lg border-2 flex items-center justify-center
                        text-sm font-semibold transition-all
                        ${
                          index === currentIndex
                            ? "border-blue-600 bg-blue-600 text-white"
                            : submission.status === "GRADED"
                            ? "border-green-500 bg-green-50 text-green-700 hover:bg-green-100"
                            : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                        }
                      `}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

