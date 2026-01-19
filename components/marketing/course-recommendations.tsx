"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, TrendingUp, Users, DollarSign } from "lucide-react";

interface CourseRecommendation {
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

interface Props {
  attemptId: number;
  userGoal?: string;
  readingBand: number;
  listeningBand: number;
  overallBand: number;
}

export function CourseRecommendations({
  attemptId,
  userGoal,
  readingBand,
  listeningBand,
  overallBand,
}: Props) {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<CourseRecommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [attemptId]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        attemptId: attemptId.toString(),
      });
      if (userGoal) {
        params.append("userGoal", userGoal);
      }

      const response = await fetch(`/api/recommendations?${params.toString()}`);
      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (courseId: number) => {
    router.push(`/courses/${courseId}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">
          No course recommendations available. Please try taking an admission test first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Test Results Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-2xl">Your Test Results</CardTitle>
          <CardDescription>Based on your admission test performance</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{readingBand}</div>
              <p className="text-sm text-gray-600 mt-1">Reading Band</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-green-600">{listeningBand}</div>
              <p className="text-sm text-gray-600 mt-1">Listening Band</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow-sm">
              <div className="text-3xl font-bold text-purple-600">{overallBand}</div>
              <p className="text-sm text-gray-600 mt-1">Overall Band</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Courses */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Recommended Courses for You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <Card key={rec.course.id} className="hover:shadow-lg transition-shadow relative">
              {rec.rank === 1 && (
                <div className="absolute top-4 right-4">
                  <Badge className="bg-yellow-500 text-white">
                    <Trophy className="w-3 h-3 mr-1" />
                    Best Match
                  </Badge>
                </div>
              )}

              <CardHeader>
                <CardTitle className="text-xl">{rec.course.title}</CardTitle>
                <CardDescription>{rec.course.description}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Band Range */}
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">
                    Band {rec.course.bandFrom} → {rec.course.bandTo}
                  </span>
                </div>

                {/* Enrollment Count */}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4" />
                  <span>{rec.course.enrollmentCount} students enrolled</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2 text-sm">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="font-medium">
                    {rec.course.isFree ? "Free" : `$${(rec.course.price / 100).toFixed(2)}`}
                  </span>
                </div>

                {/* Reason */}
                <p className="text-sm text-gray-600 italic">{rec.reason}</p>

                {/* Match Score */}
                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>Match Score</span>
                    <span className="font-bold text-blue-600">
                      {(rec.score * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>

                <Button
                  onClick={() => handleEnroll(rec.course.id)}
                  className="w-full"
                  variant={rec.rank === 1 ? "default" : "outline"}
                >
                  View Course
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

