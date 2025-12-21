"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Award, Crown, Zap } from "lucide-react";
import { toast } from "sonner";

interface LeaderboardEntry {
  rank: number;
  userId: string;
  userName: string;
  userImageSrc: string | null;
  points: number;
  isCurrentUser: boolean;
}

interface LeaderboardData {
  period: string;
  courseId: number | null;
  courseTitle: string | null;
  leaderboard: LeaderboardEntry[];
  currentUserPosition: number | null;
  totalUsers: number;
}

interface LeaderboardClientProps {
  courses: { id: number; title: string }[];
}

export default function LeaderboardClient({ courses }: LeaderboardClientProps) {
  const [period, setPeriod] = useState<string>("ALL_TIME");
  const [courseId, setCourseId] = useState<string>("all");
  const [data, setData] = useState<LeaderboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, [period, courseId]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ period });
      if (courseId !== "all") {
        params.append("courseId", courseId);
      }

      const response = await fetch(`/api/student/leaderboard?${params}`);
      if (!response.ok) throw new Error("Failed to fetch leaderboard");

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      toast.error("Không thể tải bảng xếp hạng");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="h-6 w-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />;
    if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />;
    return null;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-yellow-500 text-white";
    if (rank === 2) return "bg-gray-400 text-white";
    if (rank === 3) return "bg-orange-600 text-white";
    return "bg-gray-200 text-gray-700";
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <CardTitle>Bảng xếp hạng</CardTitle>
          </div>
          <Button onClick={fetchLeaderboard} variant="outline" size="sm" disabled={loading}>
            {loading ? "Đang tải..." : "Làm mới"}
          </Button>
        </div>
        <CardDescription>Xem vị trí của bạn so với các học viên khác</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Thời gian</label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAILY">Hôm nay</SelectItem>
                <SelectItem value="WEEKLY">Tuần này</SelectItem>
                <SelectItem value="MONTHLY">Tháng này</SelectItem>
                <SelectItem value="ALL_TIME">Tất cả</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <label className="text-sm font-medium mb-2 block">Khóa học</label>
            <Select value={courseId} onValueChange={setCourseId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả khóa học</SelectItem>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Current User Position */}
        {data?.currentUserPosition && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900">Vị trí của bạn</span>
              <Badge className="bg-blue-600">#{data.currentUserPosition}</Badge>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải...</p>
          </div>
        ) : data && data.leaderboard.length > 0 ? (
          <div className="space-y-2">
            {data.leaderboard.slice(0, 50).map((entry) => (
              <div
                key={entry.userId}
                className={`flex items-center gap-4 p-3 rounded-lg border ${
                  entry.isCurrentUser
                    ? "bg-blue-50 border-blue-300"
                    : "bg-white border-gray-200"
                }`}
              >
                {/* Rank */}
                <div className="flex items-center justify-center w-12">
                  {getRankIcon(entry.rank) || (
                    <Badge className={getRankBadgeColor(entry.rank)}>
                      {entry.rank}
                    </Badge>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 truncate">
                      {entry.userName}
                      {entry.isCurrentUser && (
                        <span className="ml-2 text-xs text-blue-600">(Bạn)</span>
                      )}
                    </p>
                  </div>
                </div>

                {/* Points */}
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-600" />
                  <span className="font-bold text-yellow-600">{entry.points}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">Chưa có dữ liệu xếp hạng</p>
          </div>
        )}

        {/* Total Users */}
        {data && data.totalUsers > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Tổng số {data.totalUsers} học viên
          </div>
        )}
      </CardContent>
    </Card>
  );
}


