"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Mic, Clock, Award } from "lucide-react";
import Link from "next/link";

interface TestSubmissionDetailProps {
  submission: any;
}

export default function TestSubmissionDetail({ submission }: TestSubmissionDetailProps) {
  const isSpeaking = submission.skillType === "SPEAKING";
  const isGraded = submission.status === "GRADED";

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <Link href="/student/learning-history">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại lịch sử học tập
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Chi tiết bài test</h1>
        </div>

        {/* Test Info */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 ${isSpeaking ? "bg-blue-100" : "bg-green-100"} rounded-lg flex items-center justify-center`}>
                  {isSpeaking ? (
                    <Mic className="h-6 w-6 text-blue-600" />
                  ) : (
                    <FileText className="h-6 w-6 text-green-600" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-xl">{submission.testTitle || "Test"}</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    {submission.questionText || (isSpeaking ? "Speaking Test" : "Writing Test")}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>{new Date(submission.createdAt).toLocaleDateString("vi-VN")}</span>
                    </div>
                    <Badge variant={isSpeaking ? "default" : "secondary"}>
                      {isSpeaking ? "Speaking" : "Writing"}
                    </Badge>
                  </div>
                </div>
              </div>
              <Badge variant={isGraded ? "default" : "secondary"}>
                {isGraded ? "Đã chấm" : "Chờ chấm"}
              </Badge>
            </div>
          </CardHeader>
        </Card>

        {/* Submission Content */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Bài làm của bạn</CardTitle>
          </CardHeader>
          <CardContent>
            {isSpeaking ? (
              submission.audioUrl ? (
                <div>
                  <audio controls className="w-full">
                    <source src={submission.audioUrl} type="audio/webm" />
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ) : (
                <p className="text-gray-500">Không có file audio</p>
              )
            ) : (
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{submission.textAnswer || "Không có nội dung"}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Grading Results */}
        {isGraded && (
          <>
            {/* Overall Score */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Điểm tổng quan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-5xl font-bold text-blue-600 mb-2">
                    {submission.overallBandScore?.toFixed(1) || "N/A"}
                  </div>
                  <p className="text-gray-600">IELTS Band Score</p>
                </div>
              </CardContent>
            </Card>

            {/* Criteria Scores */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Điểm chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {isSpeaking ? (
                    <>
                      {submission.fluencyCoherenceScore !== null && (
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium text-gray-700">Fluency & Coherence</span>
                          <span className="text-xl font-bold text-blue-600">{submission.fluencyCoherenceScore}</span>
                        </div>
                      )}
                      {submission.pronunciationScore !== null && (
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium text-gray-700">Pronunciation</span>
                          <span className="text-xl font-bold text-blue-600">{submission.pronunciationScore}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {submission.taskAchievementScore !== null && (
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium text-gray-700">Task Achievement</span>
                          <span className="text-xl font-bold text-green-600">{submission.taskAchievementScore}</span>
                        </div>
                      )}
                      {submission.coherenceCohesionScore !== null && (
                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <span className="font-medium text-gray-700">Coherence & Cohesion</span>
                          <span className="text-xl font-bold text-green-600">{submission.coherenceCohesionScore}</span>
                        </div>
                      )}
                    </>
                  )}
                  {submission.lexicalResourceScore !== null && (
                    <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                      <span className="font-medium text-gray-700">Lexical Resource</span>
                      <span className="text-xl font-bold text-purple-600">{submission.lexicalResourceScore}</span>
                    </div>
                  )}
                  {submission.grammaticalRangeScore !== null && (
                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <span className="font-medium text-gray-700">Grammatical Range & Accuracy</span>
                      <span className="text-xl font-bold text-orange-600">{submission.grammaticalRangeScore}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Teacher Feedback */}
            {submission.feedback && (
              <Card>
                <CardHeader>
                  <CardTitle>Nhận xét của giáo viên</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-gray-700">{submission.feedback}</p>
                  </div>
                  {submission.gradedAt && (
                    <p className="text-sm text-gray-500 mt-4">
                      Chấm ngày: {new Date(submission.gradedAt).toLocaleDateString("vi-VN")}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}

        {/* Pending Message */}
        {!isGraded && (
          <Card>
            <CardContent className="py-12 text-center">
              <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium text-gray-700">Bài làm đang chờ giáo viên chấm</p>
              <p className="text-sm text-gray-500 mt-2">Bạn sẽ nhận được kết quả sau khi giáo viên hoàn tất chấm bài</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

