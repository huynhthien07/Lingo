import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { courseEnrollments, courses } from "@/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default async function StudentCoursesPage() {
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
      examType: courses.examType,
      level: courses.level,
      enrolledAt: courseEnrollments.enrolledAt,
      progress: courseEnrollments.progress,
      status: courseEnrollments.status,
      enrollmentType: courseEnrollments.enrollmentType,
    })
    .from(courseEnrollments)
    .innerJoin(courses, eq(courseEnrollments.courseId, courses.id))
    .where(eq(courseEnrollments.userId, userId));

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Khóa học của tôi</h1>
        <p className="text-gray-600 mt-2">Quản lý và theo dõi tiến độ các khóa học bạn đã đăng ký</p>
      </div>

      {enrolledCourses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-20 w-20 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Chưa có khóa học nào</h3>
            <p className="text-gray-600 mb-6 text-center max-w-md">
              Bạn chưa đăng ký khóa học nào. Hãy khám phá các khóa học của chúng tôi và bắt đầu hành trình học tập!
            </p>
            <Link href="/courses-public">
              <Button size="lg">Khám phá khóa học</Button>
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
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant={course.enrollmentType === "FREE" ? "secondary" : "default"}>
                    {course.enrollmentType === "FREE" ? "Miễn phí" : "Đã thanh toán"}
                  </Badge>
                  <Badge variant="outline">{course.examType}</Badge>
                  <Badge variant="outline">{course.level}</Badge>
                </div>
                <CardTitle className="line-clamp-2">{course.title}</CardTitle>
                <CardDescription className="line-clamp-2">{course.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-gray-600">Tiến độ học tập</span>
                      <span className="font-semibold text-blue-600">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                  
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Ngày đăng ký:</span>
                    <span>{new Date(course.enrolledAt).toLocaleDateString("vi-VN")}</span>
                  </div>

                  <Link href={`/student/courses/${course.id}`}>
                    <Button className="w-full" size="lg">
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
  );
}

