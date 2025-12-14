import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Trophy, Award, Zap, Star, Target } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default async function StudentGamificationPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user progress
  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  const points = progress?.points || 0;
  const hearts = progress?.hearts || 5;

  // Calculate level based on points
  const level = Math.floor(points / 100) + 1;
  const pointsToNextLevel = (level * 100) - points;
  const levelProgress = ((points % 100) / 100) * 100;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gamification</h1>
        <p className="text-gray-600 mt-2">Theo dõi điểm số, huy hiệu và thành tích của bạn</p>
      </div>

      {/* Level & Points */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-600" />
              <CardTitle>Level & Points</CardTitle>
            </div>
            <CardDescription>Cấp độ và điểm tích lũy của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Cấp độ hiện tại</span>
              <Badge className="text-lg px-4 py-1">Level {level}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tổng điểm</span>
              <span className="text-2xl font-bold text-yellow-600">{points}</span>
            </div>
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-gray-600">Tiến độ lên cấp</span>
                <span className="font-semibold">{pointsToNextLevel} điểm nữa</span>
              </div>
              <Progress value={levelProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-red-600" />
              <CardTitle>Hearts & Streaks</CardTitle>
            </div>
            <CardDescription>Năng lượng và chuỗi ngày học</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Hearts</span>
              <span className="text-2xl font-bold text-red-600">{hearts}/5</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Chuỗi ngày học</span>
              <span className="text-2xl font-bold text-orange-600">0 ngày</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Kỷ lục chuỗi</span>
              <span className="text-2xl font-bold text-purple-600">0 ngày</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Achievements */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-600" />
            <CardTitle>Huy hiệu & Thành tích</CardTitle>
          </div>
          <CardDescription>Các huy hiệu bạn đã đạt được</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Placeholder badges */}
            {[
              { name: "Người mới", icon: Star, unlocked: true, color: "blue" },
              { name: "Học viên chăm chỉ", icon: Trophy, unlocked: false, color: "yellow" },
              { name: "Bậc thầy từ vựng", icon: Award, unlocked: false, color: "purple" },
              { name: "Chiến binh", icon: Target, unlocked: false, color: "red" },
              { name: "Siêu sao", icon: Star, unlocked: false, color: "orange" },
              { name: "Huyền thoại", icon: Trophy, unlocked: false, color: "green" },
            ].map((badge, index) => {
              const Icon = badge.icon;
              return (
                <div
                  key={index}
                  className={`flex flex-col items-center p-4 rounded-lg border-2 ${
                    badge.unlocked
                      ? `border-${badge.color}-500 bg-${badge.color}-50`
                      : "border-gray-200 bg-gray-50 opacity-50"
                  }`}
                >
                  <div
                    className={`w-16 h-16 rounded-full flex items-center justify-center mb-2 ${
                      badge.unlocked ? `bg-${badge.color}-100` : "bg-gray-200"
                    }`}
                  >
                    <Icon
                      className={`h-8 w-8 ${
                        badge.unlocked ? `text-${badge.color}-600` : "text-gray-400"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-medium text-center">{badge.name}</span>
                  {badge.unlocked && (
                    <Badge variant="secondary" className="mt-2 text-xs">
                      Đã mở khóa
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Leaderboard Preview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <CardTitle>Bảng xếp hạng</CardTitle>
          </div>
          <CardDescription>Xem vị trí của bạn so với các học viên khác</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-600">Tính năng bảng xếp hạng đang được phát triển</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

