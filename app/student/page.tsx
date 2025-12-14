import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { courseEnrollments, courses, userProgress, lessons } from "@/db/schema";
import { eq, and, count, sql } from "drizzle-orm";
import Link from "next/link";
import { BookOpen, Trophy, Clock, TrendingUp } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export default async function StudentDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get enrolled courses
  const enrolledCourses = await db
    .select({
      id: courses.id,
      title: courses.title,
      imageSrc: courses.imageSrc,
      description: courses.description,
      enrolledAt: courseEnrollments.enrolledAt,
      progress: courseEnrollments.progress,
      status: courseEnrollments.status,
    })
    .from(courseEnrollments)
    .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
    .where(eq(courseEnrollments.userId, userId));

  // Get user progress stats
  const userProgressData = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  // Calculate total lessons completed
  const completedLessons = userProgressData?.hearts || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Trang chủ học viên</h1>
        <p className="text-gray-600 mt-2">Chào mừng bạn quay trở lại! Tiếp tục hành trình học tập của bạn.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Khóa học đã đăng ký</CardTitle>
            <BookOpen className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enrolledCourses.length}</div>
            <p className="text-xs text-muted-foreground">Khóa học đang học</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm tích lũy</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userProgressData?.points || 0}</div>
            <p className="text-xs text-muted-foreground">Tổng điểm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài học hoàn thành</CardTitle>
            <Clock className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedLessons}</div>
            <p className="text-xs text-muted-foreground">Bài đã hoàn thành</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chuỗi ngày học</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Ngày liên tiếp</p>
          </CardContent>
        </Card>
      </div>

      {/* My Courses */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Khóa học của tôi</h2>
          <Link href="/student/courses">
            <Button variant="outline">Xem tất cả</Button>
          </Link>
        </div>

        {enrolledCourses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có khóa học nào</h3>
              <p className="text-gray-600 mb-4">Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học của chúng tôi!</p>
              <Link href="/courses-public">
                <Button>Khám phá khóa học</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledCourses.map((course) => (
              <Card key={course.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="aspect-video relative mb-4 rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={course.imageSrc}
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600">Tiến độ</span>
                        <span className="font-semibold">{course.progress}%</span>
                      </div>
                      <Progress value={course.progress} className="h-2" />
                    </div>
                    <Link href={`/student/courses/${course.id}`}>
                      <Button className="w-full">
                        {course.progress === 0 ? "Bắt đầu học" : "Tiếp tục học"}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/student/flashcards">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Flashcards</CardTitle>
              <CardDescription>Ôn tập từ vựng với flashcards</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/student/admission-test">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Admission Test</CardTitle>
              <CardDescription>Làm bài kiểm tra đầu vào</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/student/history">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardHeader>
              <CardTitle>Lịch sử học tập</CardTitle>
              <CardDescription>Xem các bài đã chấm</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  );
}

