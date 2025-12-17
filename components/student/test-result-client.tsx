"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  XCircle,
  Award,
  Clock,
  FileText,
  Home,
  RotateCcw,
} from "lucide-react";

interface TestResultClientProps {
  testId: number;
  attemptId: number;
}

export function TestResultClient({ testId, attemptId }: TestResultClientProps) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttempt();
  }, [attemptId]);

  const fetchAttempt = async () => {
    try {
      const response = await fetch(`/api/student/tests/attempts/${attemptId}`);
      const data = await response.json();
      setAttempt(data);
    } catch (error) {
      console.error("Error fetching attempt:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải kết quả...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return <div>Không tìm thấy kết quả</div>;
  }

  // Check if there are speaking/writing submissions pending
  const speakingWritingAnswers = attempt.answers.filter(
    (a: any) =>
      a.question?.section?.skillType === "SPEAKING" ||
      a.question?.section?.skillType === "WRITING"
  );
  const hasPendingSubmissions = speakingWritingAnswers.length > 0;

  // Calculate percentage only for gradable questions
  const percentage = attempt.totalPoints > 0
    ? Math.round((attempt.score / attempt.totalPoints) * 100)
    : 0;

  const correctAnswers = attempt.answers.filter((a: any) => a.isCorrect).length;
  const totalQuestions = attempt.test.sections.reduce(
    (sum: number, s: any) => sum + s.questions.length,
    0
  );

  const getBandScoreColor = (score: number) => {
    if (score >= 7.0) return "text-green-600";
    if (score >= 5.5) return "text-blue-600";
    return "text-orange-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Award className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hoàn thành bài test!
          </h1>
          <p className="text-gray-600">{attempt.test.title}</p>
        </div>

        {/* Pending Submissions Notice */}
        {hasPendingSubmissions && (
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <Clock className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-orange-900 mb-1">
                    Bài làm đang chờ giáo viên chấm
                  </h3>
                  <p className="text-sm text-orange-700">
                    Bạn có <strong>{speakingWritingAnswers.length} câu trả lời</strong> (Speaking/Writing)
                    đang chờ giáo viên chấm điểm. Kết quả sẽ được cập nhật trong phần{" "}
                    <strong>Lịch sử học tập</strong> sau khi giáo viên hoàn thành chấm bài.
                  </p>
                  <p className="text-sm text-orange-600 mt-2">
                    💡 Điểm hiển thị bên dưới chỉ tính cho các câu hỏi trắc nghiệm (Listening/Reading).
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Score Summary - Only show if there are gradable questions */}
        {attempt.totalPoints > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>
                Kết quả tổng quan
                {hasPendingSubmissions && (
                  <span className="text-sm font-normal text-gray-500 ml-2">
                    (Listening/Reading)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">
                    {percentage}%
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Tỷ lệ đúng</p>
                </div>
                <div className="text-center">
                  <div
                    className={`text-3xl font-bold ${getBandScoreColor(
                      attempt.bandScore
                    )}`}
                  >
                    {attempt.bandScore}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Band Score</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    {correctAnswers}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Câu đúng</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-600">
                    {attempt.score}/{attempt.totalPoints}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">Điểm số</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Only Speaking/Writing Test Notice */}
        {attempt.totalPoints === 0 && hasPendingSubmissions && (
          <Card>
            <CardHeader>
              <CardTitle>Bài test đã được gửi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <p className="text-lg text-gray-700 mb-2">
                  Bài làm của bạn đã được gửi thành công!
                </p>
                <p className="text-gray-600">
                  Giáo viên sẽ chấm điểm và gửi phản hồi sớm nhất có thể.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Section Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Chi tiết theo phần</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {attempt.test.sections.map((section: any) => {
              const isSpeakingWriting =
                section.skillType === "SPEAKING" ||
                section.skillType === "WRITING";

              const sectionAnswers = attempt.answers.filter((a: any) =>
                section.questions.some((q: any) => q.id === a.questionId)
              );
              const sectionCorrect = sectionAnswers.filter(
                (a: any) => a.isCorrect
              ).length;
              const sectionTotal = section.questions.length;
              const sectionPercentage = Math.round(
                (sectionCorrect / sectionTotal) * 100
              );

              return (
                <div
                  key={section.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">
                      {section.title}
                    </h4>
                    {isSpeakingWriting ? (
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                          <Clock className="h-3 w-3 mr-1" />
                          Chờ giáo viên chấm
                        </Badge>
                        <p className="text-sm text-gray-600">
                          {sectionTotal} câu hỏi
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">
                        {sectionCorrect} / {sectionTotal} câu đúng
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    {isSpeakingWriting ? (
                      <div className="text-sm text-orange-600 font-medium">
                        Đang chấm
                      </div>
                    ) : (
                      <div className="text-2xl font-bold text-blue-600">
                        {sectionPercentage}%
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            onClick={() => router.push("/student/tests")}
            variant="outline"
            className="flex-1"
          >
            <Home className="h-4 w-4 mr-2" />
            Về trang chủ
          </Button>
          <Button
            onClick={() => router.push(`/student/tests/${testId}`)}
            className="flex-1"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Làm lại
          </Button>
        </div>
      </div>
    </div>
  );
}

