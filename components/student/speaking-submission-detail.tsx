"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Mic, Clock, CheckCircle2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SpeakingSubmissionDetailProps {
  submission: any;
}

export default function SpeakingSubmissionDetail({ submission }: SpeakingSubmissionDetailProps) {
  const router = useRouter();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const isGraded = submission.status === "GRADED";

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {submission.challenge.question}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  Nộp lúc: {formatDate(submission.submittedAt)}
                </span>
                <span>Thời lượng: {formatTime(submission.duration)}</span>
              </div>
            </div>
            <Badge className={isGraded ? "bg-green-500" : "bg-gray-500"}>
              {isGraded ? "Đã chấm" : "Chờ chấm"}
            </Badge>
          </div>
        </div>

        {/* Course Info */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="font-semibold">Khóa học:</span>
              <span>{submission.challenge.lesson.unit.course.title}</span>
              <span>•</span>
              <span>{submission.challenge.lesson.title}</span>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        {submission.challenge.questions && submission.challenge.questions.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>📋 Đề bài</CardTitle>
            </CardHeader>
            <CardContent>
              {submission.challenge.questions.map((q: any) => (
                <div key={q.id} className="mb-3 last:mb-0">
                  <div dangerouslySetInnerHTML={{ __html: q.text }} />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Audio Recording */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mic className="h-5 w-5" />
              Bài nói của bạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <audio controls className="w-full">
              <source src={submission.audioUrl} type="audio/webm" />
              Trình duyệt của bạn không hỗ trợ phát audio.
            </audio>
          </CardContent>
        </Card>

        {/* Grading Results */}
        {isGraded && (
          <>
            {/* Band Scores */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  Điểm IELTS Band Scores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {submission.fluencyCoherenceScore?.toFixed(1) || "N/A"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Fluency & Coherence</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {submission.lexicalResourceScore?.toFixed(1) || "N/A"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Lexical Resource</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {submission.grammaticalRangeScore?.toFixed(1) || "N/A"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Grammatical Range</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">
                      {submission.pronunciationScore?.toFixed(1) || "N/A"}
                    </p>
                    <p className="text-xs text-gray-600 mt-1">Pronunciation</p>
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg text-white">
                  <p className="text-sm mb-1">Overall Band Score</p>
                  <p className="text-5xl font-bold">{submission.overallBandScore?.toFixed(1) || "N/A"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Teacher Feedback */}
            {submission.teacherFeedback && (
              <Card>
                <CardHeader>
                  <CardTitle>💬 Nhận xét của giáo viên</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-yellow-50 rounded-lg p-4 whitespace-pre-wrap text-gray-800">
                    {submission.teacherFeedback}
                  </div>
                  {submission.gradedAt && (
                    <p className="text-sm text-gray-500 mt-3">
                      Chấm lúc: {formatDate(submission.gradedAt)}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

