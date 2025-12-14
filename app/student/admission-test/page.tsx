import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { tests, testAttempts } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import Link from "next/link";
import { FileCheck, Clock, Award, Play, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default async function StudentAdmissionTestPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get all admission tests
  const admissionTests = await db.query.tests.findMany({
    where: eq(tests.isPublished, true),
    orderBy: [desc(tests.createdAt)],
  });

  // Get user's test attempts
  const userAttempts = await db.query.testAttempts.findMany({
    where: eq(testAttempts.userId, userId),
    with: {
      test: true,
    },
    orderBy: [desc(testAttempts.startedAt)],
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admission Test</h1>
        <p className="text-gray-600 mt-2">Làm bài kiểm tra đầu vào để đánh giá trình độ của bạn</p>
      </div>

      {/* Available Tests */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài kiểm tra có sẵn</h2>

        {admissionTests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileCheck className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có bài kiểm tra</h3>
              <p className="text-gray-600">Hiện tại chưa có bài kiểm tra đầu vào nào.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {admissionTests.map((test) => {
              const userAttempt = userAttempts.find((a) => a.testId === test.id && a.status === "COMPLETED");

              return (
                <Card key={test.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge>{test.examType}</Badge>
                      <Badge variant="outline">{test.level}</Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{test.title}</CardTitle>
                    <CardDescription className="line-clamp-2">{test.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          <span>{test.duration} phút</span>
                        </div>
                        {test.passingScore && (
                          <div className="flex items-center gap-2">
                            <Award className="h-4 w-4" />
                            <span>Pass: {test.passingScore}%</span>
                          </div>
                        )}
                      </div>

                      {userAttempt ? (
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                            <span className="font-semibold text-green-900">Đã hoàn thành</span>
                          </div>
                          <div className="text-2xl font-bold text-green-600">
                            {userAttempt.bandScore ? `Band ${userAttempt.bandScore}` : `${userAttempt.score}/${userAttempt.totalPoints}`}
                          </div>
                          <Link href={`/student/admission-test/${test.id}/result/${userAttempt.id}`}>
                            <Button variant="outline" className="w-full mt-3">
                              Xem kết quả
                            </Button>
                          </Link>
                        </div>
                      ) : (
                        <Link href={`/student/admission-test/${test.id}`}>
                          <Button className="w-full">
                            <Play className="h-4 w-4 mr-2" />
                            Bắt đầu làm bài
                          </Button>
                        </Link>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Test History */}
      {userAttempts.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Lịch sử làm bài</h2>

          <div className="space-y-4">
            {userAttempts.map((attempt) => (
              <Card key={attempt.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{attempt.test.title}</CardTitle>
                      <CardDescription className="mt-2">
                        Làm bài: {new Date(attempt.startedAt).toLocaleDateString("vi-VN")} {new Date(attempt.startedAt).toLocaleTimeString("vi-VN")}
                      </CardDescription>
                    </div>
                    <Badge variant={attempt.status === "COMPLETED" ? "default" : "secondary"}>
                      {attempt.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      {attempt.bandScore ? (
                        <div className="text-2xl font-bold text-blue-600">Band {attempt.bandScore}</div>
                      ) : (
                        <div className="text-2xl font-bold text-blue-600">
                          {attempt.score}/{attempt.totalPoints}
                        </div>
                      )}
                      <p className="text-sm text-gray-600 mt-1">
                        {attempt.completedAt
                          ? `Hoàn thành: ${new Date(attempt.completedAt).toLocaleDateString("vi-VN")}`
                          : "Đang làm bài"}
                      </p>
                    </div>

                    {attempt.status === "COMPLETED" && (
                      <Link href={`/student/admission-test/${attempt.testId}/result/${attempt.id}`}>
                        <Button variant="outline">Xem chi tiết</Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

