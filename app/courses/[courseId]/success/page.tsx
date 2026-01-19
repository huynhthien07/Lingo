/**
 * Course Payment Success Page
 * Shown after successful Stripe payment
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, BookOpen, ArrowRight } from "lucide-react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { courses } from "@/db/schema";
import { eq } from "drizzle-orm";

interface PaymentSuccessPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function PaymentSuccessPage({ params }: PaymentSuccessPageProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const { courseId } = await params;
  const courseIdNum = parseInt(courseId);

  if (isNaN(courseIdNum)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Invalid course ID</h1>
        </div>
      </div>
    );
  }

  // Get course details
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseIdNum),
  });

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Course not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-2 border-green-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Thanh toán thành công!</CardTitle>
          <CardDescription className="text-base">
            Bạn đã đăng ký khóa học thành công
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Course Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <BookOpen className="w-5 h-5 text-green-600 flex-shrink-0 mt-1" />
              <div>
                <p className="font-semibold text-gray-900">{course.title}</p>
                <p className="text-sm text-gray-600 mt-1">
                  Bạn có thể bắt đầu học ngay bây giờ
                </p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-800">
              ✓ Thanh toán đã được xác nhận
            </p>
            <p className="text-sm text-green-800 mt-2">
              ✓ Bạn đã được thêm vào khóa học
            </p>
            <p className="text-sm text-green-800 mt-2">
              ✓ Bạn có thể truy cập tất cả nội dung
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button asChild className="w-full" size="lg">
              <Link href="/student">
                <BookOpen className="w-4 h-4 mr-2" />
                Vào học ngay
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full" size="lg">
              <Link href="/courses-public">
                Xem khóa học khác
              </Link>
            </Button>
          </div>

          {/* Info */}
          <div className="text-center text-sm text-gray-600">
            <p>Hóa đơn đã được gửi đến email của bạn</p>
            <p className="mt-2">Nếu có vấn đề, vui lòng liên hệ support</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

