/**
 * Public Admission Test Page
 * Information about admission test and redirect to test
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { BookOpen, CheckCircle, Clock, FileText } from "lucide-react";
import Link from "next/link";

export default async function AdmissionTestPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Bài kiểm tra đầu vào
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Đánh giá trình độ tiếng Anh của bạn để chọn khóa học phù hợp
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Info Card */}
          <Card className="border-none shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl">Về bài kiểm tra</CardTitle>
              <CardDescription className="text-base">
                Bài kiểm tra đầu vào giúp chúng tôi hiểu rõ trình độ hiện tại của bạn
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Thời gian: 60 phút</h3>
                  <p className="text-sm text-gray-600">
                    Bài kiểm tra bao gồm 4 kỹ năng: Listening, Reading, Writing, Speaking
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <FileText className="w-5 h-5 text-blue-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Cấu trúc bài thi</h3>
                  <p className="text-sm text-gray-600">
                    Bài thi được thiết kế theo chuẩn IELTS với các dạng câu hỏi đa dạng
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Kết quả ngay lập tức</h3>
                  <p className="text-sm text-gray-600">
                    Nhận kết quả và đề xuất khóa học phù hợp ngay sau khi hoàn thành
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <BookOpen className="w-5 h-5 text-yellow-600 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold mb-1">Miễn phí 100%</h3>
                  <p className="text-sm text-gray-600">
                    Bài kiểm tra hoàn toàn miễn phí cho tất cả học viên
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits Card */}
          <Card className="border-none shadow-lg bg-gradient-to-br from-green-600 to-blue-600 text-white">
            <CardHeader>
              <CardTitle className="text-2xl">Lợi ích khi làm bài kiểm tra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                <p>Xác định chính xác trình độ hiện tại của bạn</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                <p>Nhận đề xuất khóa học phù hợp nhất</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                <p>Hiểu rõ điểm mạnh và điểm cần cải thiện</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                <p>Lộ trình học tập được cá nhân hóa</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 mt-1 flex-shrink-0" />
                <p>Tiết kiệm thời gian với khóa học đúng trình độ</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="border-none shadow-lg max-w-2xl mx-auto">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Sẵn sàng bắt đầu?
              </h2>
              <p className="text-gray-600 mb-6">
                {userId
                  ? "Bắt đầu bài kiểm tra đầu vào để tìm khóa học phù hợp với bạn"
                  : "Đăng ký tài khoản để bắt đầu làm bài kiểm tra đầu vào"}
              </p>
              {userId ? (
                <Button asChild size="lg" className="text-lg px-8">
                  <Link href="/test-dashboard">
                    Bắt đầu kiểm tra
                  </Link>
                </Button>
              ) : (
                <div className="flex gap-4 justify-center">
                  <SignUpButton mode="modal">
                    <Button size="lg" className="text-lg px-8">
                      Đăng ký ngay
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button size="lg" variant="outline" className="text-lg px-8">
                      Đăng nhập
                    </Button>
                  </SignInButton>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Câu hỏi thường gặp
          </h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bài kiểm tra có khó không?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Bài kiểm tra được thiết kế để đánh giá đúng trình độ của bạn, từ cơ bản đến nâng cao.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Tôi có thể làm lại không?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  Có, bạn có thể làm lại bài kiểm tra sau 30 ngày để đánh giá lại trình độ.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

