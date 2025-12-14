import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton
} from "@clerk/nextjs";
import { Award, BookOpen, Loader, Target, Users, Zap } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="flex-1 space-y-6">
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Chinh phục IELTS cùng{" "}
              <span className="text-green-600">Lingo</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-xl">
              Nền tảng học IELTS trực tuyến với phương pháp học tập hiệu quả,
              giúp bạn đạt điểm số mong muốn nhanh chóng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <ClerkLoading>
                <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
              </ClerkLoading>
              <ClerkLoaded>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="text-lg px-8">
                      Bắt đầu học ngay
                    </Button>
                  </SignUpButton>
                  <SignInButton mode="modal">
                    <Button size="lg" variant="outline" className="text-lg px-8">
                      Đăng nhập
                    </Button>
                  </SignInButton>
                </SignedOut>
                <SignedIn>
                  <Button size="lg" className="text-lg px-8" asChild>
                    <Link href="/dashboard">
                      Vào Dashboard
                    </Link>
                  </Button>
                </SignedIn>
              </ClerkLoaded>
            </div>
          </div>
          <div className="flex-1 relative w-full max-w-lg h-[400px]">
            <Image src="/hero.svg" fill alt="Hero" className="object-contain" />
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Tại sao chọn Lingo?
            </h2>
            <p className="text-xl text-gray-600">
              Phương pháp học tập hiện đại và hiệu quả
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Nội dung chất lượng</h3>
                <p className="text-gray-600">
                  Khóa học được thiết kế bởi các chuyên gia IELTS hàng đầu
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Lộ trình cá nhân hóa</h3>
                <p className="text-gray-600">
                  Học theo lộ trình phù hợp với trình độ và mục tiêu
                </p>
              </CardContent>
            </Card>

            <Card className="text-center border-none shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-2">Học tập hiệu quả</h3>
                <p className="text-gray-600">
                  Phương pháp tương tác giúp bạn tiến bộ nhanh chóng
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-2xl p-12 text-white">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-5xl font-bold mb-2">10,000+</div>
                <div className="text-lg opacity-90">Học viên</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">50+</div>
                <div className="text-lg opacity-90">Khóa học</div>
              </div>
              <div>
                <div className="text-5xl font-bold mb-2">95%</div>
                <div className="text-lg opacity-90">Hài lòng</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Sẵn sàng bắt đầu hành trình của bạn?
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
