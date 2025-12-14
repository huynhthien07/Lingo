import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { 
  courseEnrollments, 
  userProgress, 
  writingSubmissions, 
  speakingSubmissions,
  testAttempts 
} from "@/db/schema";
import { eq, count, sql } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  FileText, 
  Mic, 
  Award,
  Target,
  Calendar
} from "lucide-react";

export default async function StudentAnalyticsPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user progress
  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  // Get enrolled courses
  const enrolledCourses = await db
    .select({
      total: count(),
      avgProgress: sql<number>`AVG(${courseEnrollments.progress})`,
    })
    .from(courseEnrollments)
    .where(eq(courseEnrollments.userId, userId));

  // Get writing submissions stats
  const writingStats = await db
    .select({
      total: count(),
      graded: sql<number>`COUNT(CASE WHEN ${writingSubmissions.status} = 'GRADED' THEN 1 END)`,
      avgScore: sql<number>`AVG(${writingSubmissions.overallBandScore})`,
    })
    .from(writingSubmissions)
    .where(eq(writingSubmissions.userId, userId));

  // Get speaking submissions stats
  const speakingStats = await db
    .select({
      total: count(),
      graded: sql<number>`COUNT(CASE WHEN ${speakingSubmissions.status} = 'GRADED' THEN 1 END)`,
      avgScore: sql<number>`AVG(${speakingSubmissions.overallBandScore})`,
    })
    .from(speakingSubmissions)
    .where(eq(speakingSubmissions.userId, userId));

  // Get test attempts stats
  const testStats = await db
    .select({
      total: count(),
      completed: sql<number>`COUNT(CASE WHEN ${testAttempts.status} = 'COMPLETED' THEN 1 END)`,
      avgBand: sql<number>`AVG(${testAttempts.bandScore})`,
    })
    .from(testAttempts)
    .where(eq(testAttempts.userId, userId));

  const courseData = enrolledCourses[0] || { total: 0, avgProgress: 0 };
  const writingData = writingStats[0] || { total: 0, graded: 0, avgScore: 0 };
  const speakingData = speakingStats[0] || { total: 0, graded: 0, avgScore: 0 };
  const testData = testStats[0] || { total: 0, completed: 0, avgBand: 0 };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Phân tích & Tiến độ</h1>
        <p className="text-gray-600 mt-2">Theo dõi chi tiết tiến độ học tập của bạn</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng điểm</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.points || 0}</div>
            <p className="text-xs text-muted-foreground">Điểm tích lũy</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khóa học</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{courseData.total}</div>
            <p className="text-xs text-muted-foreground">
              Tiến độ TB: {Math.round(Number(courseData.avgProgress) || 0)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài nộp</CardTitle>
            <FileText className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(writingData.total) + Number(speakingData.total)}</div>
            <p className="text-xs text-muted-foreground">
              Đã chấm: {Number(writingData.graded) + Number(speakingData.graded)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài kiểm tra</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Number(testData.completed)}</div>
            <p className="text-xs text-muted-foreground">
              Hoàn thành
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Writing Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <CardTitle>Writing Performance</CardTitle>
            </div>
            <CardDescription>Thống kê bài viết của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tổng bài nộp</span>
              <span className="text-2xl font-bold">{Number(writingData.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Đã chấm</span>
              <span className="text-2xl font-bold text-green-600">{Number(writingData.graded)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Band điểm TB</span>
              <span className="text-2xl font-bold text-blue-600">
                {writingData.avgScore ? Number(writingData.avgScore).toFixed(1) : "-"}
              </span>
            </div>
            {Number(writingData.total) > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Tỷ lệ hoàn thành</span>
                  <span className="font-semibold">
                    {Math.round((Number(writingData.graded) / Number(writingData.total)) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(Number(writingData.graded) / Number(writingData.total)) * 100} 
                  className="h-2" 
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Speaking Stats */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-purple-600" />
              <CardTitle>Speaking Performance</CardTitle>
            </div>
            <CardDescription>Thống kê bài nói của bạn</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tổng bài nộp</span>
              <span className="text-2xl font-bold">{Number(speakingData.total)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Đã chấm</span>
              <span className="text-2xl font-bold text-green-600">{Number(speakingData.graded)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Band điểm TB</span>
              <span className="text-2xl font-bold text-purple-600">
                {speakingData.avgScore ? Number(speakingData.avgScore).toFixed(1) : "-"}
              </span>
            </div>
            {Number(speakingData.total) > 0 && (
              <div>
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Tỷ lệ hoàn thành</span>
                  <span className="font-semibold">
                    {Math.round((Number(speakingData.graded) / Number(speakingData.total)) * 100)}%
                  </span>
                </div>
                <Progress 
                  value={(Number(speakingData.graded) / Number(speakingData.total)) * 100} 
                  className="h-2" 
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Test Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-600" />
            <CardTitle>Test Performance</CardTitle>
          </div>
          <CardDescription>Kết quả các bài kiểm tra</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-900 mb-2">Tổng bài kiểm tra</div>
              <div className="text-3xl font-bold text-blue-600">{Number(testData.total)}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-900 mb-2">Đã hoàn thành</div>
              <div className="text-3xl font-bold text-green-600">{Number(testData.completed)}</div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="text-sm text-yellow-900 mb-2">Band điểm TB</div>
              <div className="text-3xl font-bold text-yellow-600">
                {testData.avgBand ? Number(testData.avgBand).toFixed(1) : "-"}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

