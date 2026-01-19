/**
 * Public Course Detail Page
 * Display course details and allow enrollment
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import db from "@/db/drizzle";
import { courses, courseEnrollments, units } from "@/db/schema";
import { SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { BookOpen, Clock, Users, DollarSign, ArrowLeft, CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { CourseEnrollButton } from "@/components/course-enroll-button";

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

// Format price with currency
function formatPrice(price: number, currency: string): string {
  const amount = price / 100; // Convert from cents
  const currencySymbols: { [key: string]: string } = {
    USD: "$",
    VND: "₫",
    EUR: "€",
  };
  const symbol = currencySymbols[currency] || currency;

  if (currency === "VND") {
    return `${amount.toLocaleString("vi-VN")} ${symbol}`;
  }
  return `${symbol}${amount.toFixed(2)}`;
}

export default async function CourseDetailPage({ params }: CourseDetailPageProps) {
  const { userId } = await auth();
  const { courseId } = await params;
  const courseIdNum = parseInt(courseId);

  if (isNaN(courseIdNum)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Khóa học không tồn tại</h1>
        </div>
      </div>
    );
  }

  // Get course details
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseIdNum),
    with: {
      units: {
        orderBy: (units, { asc }) => [asc(units.order)],
      },
    },
  });

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Khóa học không tồn tại</h1>
        </div>
      </div>
    );
  }

  // Check if user is enrolled
  let isEnrolled = false;
  if (userId) {
    const enrollment = await db.query.courseEnrollments.findFirst({
      where: (enrollments, { and, eq }) =>
        and(
          eq(enrollments.userId, userId),
          eq(enrollments.courseId, courseIdNum)
        ),
    });
    isEnrolled = !!enrollment;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/courses-public" className="inline-flex items-center gap-2 text-green-600 hover:text-green-700 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Quay lại danh sách khóa học
        </Link>

        {/* Course Header */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* Course Image */}
          <div className="md:col-span-1">
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gradient-to-br from-green-400 to-blue-500 sticky top-4">
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
          </div>

          {/* Course Info */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{course.title}</h1>
            <p className="text-xl text-gray-600 mb-6">
              {course.description || "Khóa học IELTS chất lượng cao"}
            </p>

            {/* Course Stats */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Học viên</p>
                  <p className="text-lg font-semibold">{course.enrollmentCount}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">Bài học</p>
                  <p className="text-lg font-semibold">{course.units.length}</p>
                </div>
              </div>
            </div>

            {/* Price and Enroll */}
            <Card className="border-2 border-green-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Học phí</p>
                    <p className="text-3xl font-bold text-green-600">
                      {course.isFree ? "Miễn phí" : formatPrice(course.price, course.currency)}
                    </p>
                  </div>
                </div>

                {userId ? (
                  <CourseEnrollButton
                    courseId={course.id}
                    isFree={course.isFree}
                    price={course.price}
                    isEnrolled={isEnrolled}
                  />
                ) : (
                  <SignUpButton mode="modal">
                    <Button className="w-full" size="lg">
                      Đăng ký để học
                    </Button>
                  </SignUpButton>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Course Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Nội dung khóa học</CardTitle>
                <CardDescription>
                  {course.units.length} bài học
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {course.units.map((unit, index) => (
                    <div key={unit.id} className="flex gap-4 p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-green-600">{index + 1}</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{unit.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{unit.description}</p>
                      </div>
                      <CheckCircle className="w-5 h-5 text-gray-300 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="md:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Thông tin khóa học</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Loại khóa học</p>
                  <p className="font-semibold">{course.examType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Trình độ</p>
                  <p className="font-semibold">{course.level}</p>
                </div>
                {course.bandFrom && course.bandTo && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Phạm vi điểm</p>
                    <p className="font-semibold">{course.bandFrom} - {course.bandTo}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Mục tiêu</p>
                  <p className="font-semibold">{course.courseGoal || "IELTS"}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

