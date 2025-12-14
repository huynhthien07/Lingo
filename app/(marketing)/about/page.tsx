/**
 * About Us Page
 */

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignUpButton } from "@clerk/nextjs";
import { Award, BookOpen, Globe, Target, Users, Zap } from "lucide-react";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-7xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Về Lingo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Nền tảng học IELTS trực tuyến hàng đầu, giúp hàng ngàn học viên đạt được mục tiêu của mình
          </p>
        </div>

        {/* Mission Section */}
        <div className="mb-16">
          <Card className="border-none shadow-lg">
            <CardContent className="p-8 md:p-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Sứ mệnh của chúng tôi
                  </h2>
                  <p className="text-lg text-gray-600 mb-4">
                    Lingo được tạo ra với sứ mệnh làm cho việc học IELTS trở nên dễ dàng, hiệu quả và thú vị hơn bao giờ hết.
                  </p>
                  <p className="text-lg text-gray-600">
                    Chúng tôi tin rằng mọi người đều có thể đạt được điểm số IELTS mong muốn với phương pháp học đúng đắn và sự hỗ trợ phù hợp.
                  </p>
                </div>
                <div className="relative h-64 md:h-80 rounded-lg overflow-hidden">
                  <Image
                    src="/hero.svg"
                    alt="Mission"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Tại sao chọn Lingo?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nội dung chất lượng</h3>
              <p className="text-gray-600">
                Khóa học được thiết kế bởi các chuyên gia IELTS với kinh nghiệm nhiều năm
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Lộ trình cá nhân hóa</h3>
              <p className="text-gray-600">
                Học theo lộ trình phù hợp với trình độ và mục tiêu của bạn
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Học tập hiệu quả</h3>
              <p className="text-gray-600">
                Phương pháp học tập tương tác giúp bạn tiến bộ nhanh chóng
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Cộng đồng học tập</h3>
              <p className="text-gray-600">
                Kết nối với hàng ngàn học viên khác trên toàn quốc
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Chứng chỉ uy tín</h3>
              <p className="text-gray-600">
                Nhận chứng chỉ hoàn thành khóa học được công nhận
              </p>
            </Card>

            <Card className="text-center p-6 hover:shadow-lg transition-shadow">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="w-8 h-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Học mọi lúc, mọi nơi</h3>
              <p className="text-gray-600">
                Truy cập khóa học trên mọi thiết bị, bất cứ khi nào bạn muốn
              </p>
            </Card>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16 bg-green-600 rounded-2xl p-8 md:p-12 text-white">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">10,000+</div>
              <div className="text-lg opacity-90">Học viên</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">50+</div>
              <div className="text-lg opacity-90">Khóa học</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold mb-2">95%</div>
              <div className="text-lg opacity-90">Hài lòng</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Sẵn sàng bắt đầu?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Tham gia cùng hàng ngàn học viên đang học tập trên Lingo
          </p>
          <SignUpButton mode="modal">
            <Button size="lg" className="text-lg px-8">
              Đăng ký miễn phí
            </Button>
          </SignUpButton>
        </div>
      </div>
    </div>
  );
}

