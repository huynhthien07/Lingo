import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { users, userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Calendar, Award, Heart, Zap } from "lucide-react";

export default async function StudentProfilePage() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get user from database
  const dbUser = await db.query.users.findFirst({
    where: eq(users.userId, userId),
  });

  // Get user progress
  const progress = await db.query.userProgress.findFirst({
    where: eq(userProgress.userId, userId),
  });

  const initials = clerkUser?.firstName && clerkUser?.lastName
    ? `${clerkUser.firstName[0]}${clerkUser.lastName[0]}`
    : clerkUser?.emailAddresses[0]?.emailAddress[0].toUpperCase() || "U";

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Hồ sơ cá nhân</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={clerkUser?.imageUrl} alt={clerkUser?.firstName || "User"} />
                <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-xl">
              {clerkUser?.firstName} {clerkUser?.lastName}
            </CardTitle>
            <CardDescription>
              <Badge variant="secondary" className="mt-2">
                {dbUser?.role || "STUDENT"}
              </Badge>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">{clerkUser?.emailAddresses[0]?.emailAddress}</span>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700">
                Tham gia: {new Date(clerkUser?.createdAt || Date.now()).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê học tập</CardTitle>
              <CardDescription>Tổng quan về tiến độ học tập của bạn</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Điểm tích lũy</span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600">{progress?.points || 0}</div>
                </div>

                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Hearts</span>
                  </div>
                  <div className="text-3xl font-bold text-red-600">{progress?.hearts || 5}</div>
                </div>

                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Chuỗi ngày học</span>
                  </div>
                  <div className="text-3xl font-bold text-green-600">0</div>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="h-5 w-5 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">Huy hiệu</span>
                  </div>
                  <div className="text-3xl font-bold text-purple-600">0</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Thông tin tài khoản</CardTitle>
              <CardDescription>Quản lý thông tin cá nhân của bạn</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Họ</label>
                  <p className="mt-1 text-gray-900">{clerkUser?.firstName || "N/A"}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Tên</label>
                  <p className="mt-1 text-gray-900">{clerkUser?.lastName || "N/A"}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <p className="mt-1 text-gray-900">{clerkUser?.emailAddresses[0]?.emailAddress}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">User ID</label>
                <p className="mt-1 text-gray-900 font-mono text-sm">{userId}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Vai trò</label>
                <p className="mt-1">
                  <Badge>{dbUser?.role || "STUDENT"}</Badge>
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Trạng thái</label>
                <p className="mt-1">
                  <Badge variant={dbUser?.isBlocked ? "destructive" : "secondary"}>
                    {dbUser?.isBlocked ? "Đã khóa" : "Hoạt động"}
                  </Badge>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

