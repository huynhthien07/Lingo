/**
 * Public Courses Page
 * Display all available courses for enrollment
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import db from "@/db/drizzle";
import { courses, courseEnrollments } from "@/db/schema";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { BookOpen, Clock, Users, DollarSign } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { asc, eq, and } from "drizzle-orm";
import { CourseEnrollButton } from "@/components/course-enroll-button";

export default async function CoursesPublicPage() {
  const { userId } = await auth();

  // Get all courses
  const allCourses = await db.select().from(courses).orderBy(asc(courses.id));

  // Get user enrollments if logged in
  let userEnrollments: number[] = [];
  if (userId) {
    const enrollments = await db
      .select({ courseId: courseEnrollments.courseId })
      .from(courseEnrollments)
      .where(eq(courseEnrollments.userId, userId));
    userEnrollments = enrollments.map((e) => e.courseId);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Khóa học IELTS
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Chọn khóa học phù hợp với trình độ của bạn và bắt đầu hành trình chinh phục IELTS
          </p>
        </div>

        {/* Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {allCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-gradient-to-br from-green-400 to-blue-500">
                  {course.imageSrc ? (
                    <Image
                      src={course.imageSrc}
                      alt={course.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <BookOpen className="w-20 h-20 text-white" />
                    </div>
                  )}
                </div>
                <CardTitle className="text-2xl">{course.title}</CardTitle>
                <CardDescription className="text-base">
                  {course.description || "Khóa học IELTS chất lượng cao"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Price */}
                  <div className="flex items-center justify-between py-2 border-b">
                    <span className="text-sm text-gray-600">Học phí:</span>
                    <span className="text-xl font-bold text-green-600">
                      {course.isFree ? "Miễn phí" : `$${course.price}`}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <BookOpen className="w-4 h-4" />
                    <span className="text-sm">Học theo lộ trình chuẩn</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">Học mọi lúc, mọi nơi</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">Hỗ trợ từ giáo viên</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                {userId ? (
                  <CourseEnrollButton
                    courseId={course.id}
                    isFree={course.isFree}
                    price={course.price}
                    isEnrolled={userEnrollments.includes(course.id)}
                  />
                ) : (
                  <SignUpButton mode="modal">
                    <Button className="w-full" size="lg">
                      Đăng ký ngay
                    </Button>
                  </SignUpButton>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {allCourses.length === 0 && (
          <div className="text-center py-16">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Chưa có khóa học nào
            </h3>
            <p className="text-gray-500">
              Các khóa học sẽ sớm được cập nhật
            </p>
          </div>
        )}

        {/* CTA Section */}
        {!userId && allCourses.length > 0 && (
          <div className="mt-16 bg-green-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">
              Sẵn sàng bắt đầu học?
            </h2>
            <p className="text-lg mb-6 opacity-90">
              Đăng ký ngay để truy cập tất cả khóa học và bắt đầu hành trình của bạn
            </p>
            <div className="flex gap-4 justify-center">
              <SignUpButton mode="modal">
                <Button size="lg" variant="secondary">
                  Đăng ký miễn phí
                </Button>
              </SignUpButton>
              <SignInButton mode="modal">
                <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white hover:text-green-600">
                  Đăng nhập
                </Button>
              </SignInButton>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

