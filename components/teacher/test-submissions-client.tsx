"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mic, FileText, Clock, CheckCircle, User, Calendar } from "lucide-react";
import { toast } from "sonner";
import GradingModal from "./grading-modal";

interface Submission {
  id: number;
  attemptId: number;
  userId: string;
  testId: number;
  questionId: number | null;
  skillType: "SPEAKING" | "WRITING";
  audioUrl: string | null;
  textAnswer: string | null;
  score: number | null;
  maxScore: number;
  feedback: string | null;
  status: "PENDING" | "GRADING" | "GRADED" | "RETURNED";
  gradedBy: string | null;
  gradedAt: Date | null;
  createdAt: Date;
  testTitle: string | null;
  testType: string | null;
  questionText: string | null;
  studentName: string | null;
  studentEmail: string | null;
  attemptStartedAt: Date | null;
  attemptCompletedAt: Date | null;
}

interface GroupedAttempt {
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
  totalSubmissions: number;
  gradedSubmissions: number;
}

const TestSubmissionsClient = () => {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [groupedAttempts, setGroupedAttempts] = useState<GroupedAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"PENDING" | "GRADED">("PENDING");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [gradingModalOpen, setGradingModalOpen] = useState(false);

  const groupSubmissionsByAttempt = (submissions: Submission[]): GroupedAttempt[] => {
    const grouped = new Map<number, GroupedAttempt>();

    submissions.forEach((submission) => {
      if (!grouped.has(submission.attemptId)) {
        grouped.set(submission.attemptId, {
          attemptId: submission.attemptId,
          userId: submission.userId,
          testId: submission.testId,
          testTitle: submission.testTitle,
          testType: submission.testType,
          studentName: submission.studentName,
          studentEmail: submission.studentEmail,
          attemptStartedAt: submission.attemptStartedAt,
          attemptCompletedAt: submission.attemptCompletedAt,
          submissions: [],
          totalSubmissions: 0,
          gradedSubmissions: 0,
        });
      }

      const attempt = grouped.get(submission.attemptId)!;
      attempt.submissions.push(submission);
      attempt.totalSubmissions++;
      if (submission.status === "GRADED") {
        attempt.gradedSubmissions++;
      }
    });

    return Array.from(grouped.values());
  };

  const fetchSubmissions = async (status: "PENDING" | "GRADED") => {
    try {
      setLoading(true);
      const response = await fetch(`/api/teacher/test-submissions?status=${status}`);
      if (!response.ok) throw new Error("Failed to fetch submissions");
      const data = await response.json();
      setSubmissions(data);

      // Group submissions by attemptId
      const grouped = groupSubmissionsByAttempt(data);
      setGroupedAttempts(grouped);
    } catch (error) {
      console.error("Error fetching submissions:", error);
      toast.error("Failed to load submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions(activeTab);
  }, [activeTab]);

  const handleGrade = (submission: Submission) => {
    setSelectedSubmission(submission);
    setGradingModalOpen(true);
  };

  const handleGradeSubmit = async (score: number, feedback: string) => {
    if (!selectedSubmission) return;

    try {
      const response = await fetch(
        `/api/teacher/test-submissions/${selectedSubmission.id}/grade`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ score, feedback }),
        }
      );

      if (!response.ok) throw new Error("Failed to grade submission");

      toast.success("Submission graded successfully!");
      setGradingModalOpen(false);
      setSelectedSubmission(null);
      fetchSubmissions(activeTab);
    } catch (error) {
      console.error("Error grading submission:", error);
      toast.error("Failed to grade submission");
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Test Submissions</h1>
        <p className="text-gray-600 mt-2">
          Grade speaking and writing test submissions from students
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="mb-6">
          <TabsTrigger value="PENDING" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Pending
          </TabsTrigger>
          <TabsTrigger value="GRADED" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            Graded
          </TabsTrigger>
        </TabsList>

        <TabsContent value="PENDING">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading submissions...</p>
            </div>
          ) : groupedAttempts.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No pending submissions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {groupedAttempts.map((attempt) => (
                <Card key={attempt.attemptId} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <FileText className="w-5 h-5 text-blue-600" />
                          <h3 className="font-semibold text-lg">
                            {attempt.testTitle || "Untitled Test"}
                          </h3>
                          <Badge variant="outline">
                            {attempt.testType || "TEST"}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{attempt.studentName || attempt.studentEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Completed: {formatDate(attempt.attemptCompletedAt)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-sm">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {attempt.totalSubmissions} questions
                          </Badge>
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            <Clock className="w-3 h-3 mr-1" />
                            {attempt.totalSubmissions - attempt.gradedSubmissions} pending
                          </Badge>
                        </div>
                      </div>

                      <Button onClick={() => router.push(`/teacher/test-submissions/${attempt.attemptId}`)}>
                        Grade Test
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="GRADED">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading submissions...</p>
            </div>
          ) : submissions.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">No graded submissions</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {submissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          {submission.skillType === "SPEAKING" ? (
                            <Mic className="w-5 h-5 text-blue-600" />
                          ) : (
                            <FileText className="w-5 h-5 text-green-600" />
                          )}
                          <Badge variant={submission.skillType === "SPEAKING" ? "default" : "secondary"}>
                            {submission.skillType}
                          </Badge>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Score: {submission.score}/{submission.maxScore}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{submission.studentName || submission.studentEmail}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Graded: {formatDate(submission.gradedAt)}</span>
                          </div>
                        </div>

                        {submission.feedback && (
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-sm text-gray-700">
                              <strong>Feedback:</strong> {submission.feedback}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedSubmission && (
        <GradingModal
          open={gradingModalOpen}
          onClose={() => setGradingModalOpen(false)}
          submission={selectedSubmission}
          onSubmit={handleGradeSubmit}
        />
      )}
    </div>
  );
};

export default TestSubmissionsClient;

