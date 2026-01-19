"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  BookOpen,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ArrowRight,
} from "lucide-react";

interface AdmissionTestResultClientProps {
  testId: number;
  attemptId: number;
}

interface Recommendation {
  course: {
    id: number;
    title: string;
    description: string | null;
    imageSrc: string;
    bandFrom: number | null;
    bandTo: number | null;
    enrollmentCount: number;
    courseGoal: string | null;
    price: number;
    isFree: boolean;
  };
  score: number;
  rank: number;
  reason: string;
}

export function AdmissionTestResultClient({
  testId,
  attemptId,
}: AdmissionTestResultClientProps) {
  const router = useRouter();
  const [attempt, setAttempt] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    fetchAttemptAndRecommendations();
  }, [attemptId]);

  const fetchAttemptAndRecommendations = async () => {
    try {
      setLoading(true);

      // Fetch test attempt (use admission test API - no auth required)
      const attemptResponse = await fetch(
        `/api/admission-tests/attempts/${attemptId}`
      );
      const attemptData = await attemptResponse.json();
      setAttempt(attemptData);

      // Fetch recommendations
      setLoadingRecommendations(true);
      const recResponse = await fetch(
        `/api/recommendations?attemptId=${attemptId}&userGoal=IELTS`
      );

      if (recResponse.ok) {
        const recData = await recResponse.json();
        setRecommendations(recData.recommendations || []);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
      setLoadingRecommendations(false);
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
    return <div className="p-6 text-center text-red-600">Không tìm thấy kết quả</div>;
  }

  const percentage = attempt.totalPoints > 0
    ? Math.round((attempt.score / attempt.totalPoints) * 100)
    : 0;

  const getBandScoreColor = (score: number) => {
    if (score >= 7.0) return "text-green-600";
    if (score >= 5.5) return "text-blue-600";
    return "text-orange-600";
  };

  const getLevelBadgeColor = (level: string) => {
    switch (level?.toUpperCase()) {
      case "BEGINNER":
        return "bg-red-100 text-red-700";
      case "ELEMENTARY":
        return "bg-orange-100 text-orange-700";
      case "INTERMEDIATE":
        return "bg-blue-100 text-blue-700";
      case "UPPER_INTERMEDIATE":
        return "bg-green-100 text-green-700";
      case "ADVANCED":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <Award className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Hoàn thành bài kiểm tra!
          </h1>
          <p className="text-xl text-gray-600">{attempt.test?.title}</p>
        </div>

        {/* Score Summary */}
        <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Kết quả của bạn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-600">
                  {percentage}%
                </div>
                <p className="text-sm text-gray-600 mt-2">Tỷ lệ đúng</p>
              </div>
              <div className="text-center">
                <div className={`text-4xl font-bold ${getBandScoreColor(attempt.bandScore)}`}>
                  {attempt.bandScore}
                </div>
                <p className="text-sm text-gray-600 mt-2">Band Score</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-green-600">
                  {attempt.score}
                </div>
                <p className="text-sm text-gray-600 mt-2">Điểm số</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-purple-600">
                  {attempt.totalPoints}
                </div>
                <p className="text-sm text-gray-600 mt-2">Tổng điểm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recommendations Section */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="h-6 w-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">
              Khóa học được đề xuất cho bạn
            </h2>
          </div>

          {loadingRecommendations ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec) => {
                const matchPercentage = Math.round(rec.score * 100);
                const levelRange = rec.course.bandFrom && rec.course.bandTo
                  ? `${rec.course.bandFrom} - ${rec.course.bandTo}`
                  : "N/A";

                return (
                  <Card key={rec.course.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <CardTitle className="text-lg">{rec.course.title}</CardTitle>
                          <Badge className={`mt-2 ${getLevelBadgeColor(rec.course.courseGoal || "")}`}>
                            Level: {levelRange}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {matchPercentage}%
                          </div>
                          <p className="text-xs text-gray-500">Match</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-gray-600">
                        {rec.course.description || "No description available"}
                      </p>

                      <div className="space-y-2">
                        <p className="text-sm font-semibold text-gray-700">
                          Tại sao phù hợp:
                        </p>
                        <p className="text-sm text-gray-600 flex gap-2">
                          <span className="text-green-600">✓</span>
                          {rec.reason}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-500 pt-2 border-t">
                        <BookOpen className="h-4 w-4" />
                        <span>{rec.course.enrollmentCount} học viên</span>
                      </div>

                      <Button
                        className="w-full"
                        size="sm"
                        onClick={() => router.push(`/courses-public/${rec.course.id}`)}
                      >
                        Xem chi tiết
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-600">
                  Không tìm thấy khóa học phù hợp. Vui lòng thử lại sau.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => router.push("/courses-public")}
            variant="outline"
            size="lg"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            Xem tất cả khóa học
          </Button>
          <Button
            onClick={() => router.push("/admission-tests")}
            size="lg"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Làm lại bài test
          </Button>
        </div>
      </div>
    </div>
  );
}

