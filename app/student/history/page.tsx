import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import db from "@/db/drizzle";
import { writingSubmissions, speakingSubmissions } from "@/db/schema";
import { eq, desc, or } from "drizzle-orm";
import Link from "next/link";
import { FileText, Mic, Calendar, Award, Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function StudentHistoryPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Get writing submissions
  const writingSubmissionsData = await db.query.writingSubmissions.findMany({
    where: eq(writingSubmissions.userId, userId),
    with: {
      challenge: {
        with: {
          lesson: {
            with: {
              unit: {
                with: {
                  course: true,
                },
              },
            },
          },
        },
      },
      teacher: true,
    },
    orderBy: [desc(writingSubmissions.submittedAt)],
  });

  // Get speaking submissions
  const speakingSubmissionsData = await db.query.speakingSubmissions.findMany({
    where: eq(speakingSubmissions.userId, userId),
    with: {
      challenge: {
        with: {
          lesson: {
            with: {
              unit: {
                with: {
                  course: true,
                },
              },
            },
          },
        },
      },
      teacher: true,
    },
    orderBy: [desc(speakingSubmissions.submittedAt)],
  });

  const gradedWriting = writingSubmissionsData.filter((s) => s.status === "GRADED" || s.status === "RETURNED");
  const gradedSpeaking = speakingSubmissionsData.filter((s) => s.status === "GRADED" || s.status === "RETURNED");

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Lịch sử học tập</h1>
        <p className="text-gray-600 mt-2">Xem các bài đã nộp và nhận xét từ giáo viên</p>
      </div>

      <Tabs defaultValue="writing" className="space-y-6">
        <TabsList>
          <TabsTrigger value="writing" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Writing ({gradedWriting.length})
          </TabsTrigger>
          <TabsTrigger value="speaking" className="flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Speaking ({gradedSpeaking.length})
          </TabsTrigger>
        </TabsList>

        {/* Writing Submissions */}
        <TabsContent value="writing" className="space-y-4">
          {gradedWriting.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có bài chấm</h3>
                <p className="text-gray-600">Bạn chưa có bài Writing nào được chấm.</p>
              </CardContent>
            </Card>
          ) : (
            gradedWriting.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{submission.challenge.question}</CardTitle>
                      <CardDescription className="mt-2">
                        {submission.challenge.lesson.unit.course.title} - {submission.challenge.lesson.title}
                      </CardDescription>
                    </div>
                    <Badge variant={submission.status === "GRADED" ? "default" : "secondary"}>
                      {submission.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-blue-900 mb-1">Task Achievement</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {submission.taskAchievementScore || "-"}
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-xs text-green-900 mb-1">Coherence</div>
                        <div className="text-2xl font-bold text-green-600">
                          {submission.coherenceCohesionScore || "-"}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-xs text-purple-900 mb-1">Lexical</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {submission.lexicalResourceScore || "-"}
                        </div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="text-xs text-orange-900 mb-1">Grammar</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {submission.grammaticalRangeScore || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-900">Overall Band Score</span>
                      </div>
                      <div className="text-3xl font-bold text-yellow-600">
                        {submission.overallBandScore || "-"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Nộp: {new Date(submission.submittedAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                      {submission.gradedAt && (
                        <span>Chấm: {new Date(submission.gradedAt).toLocaleDateString("vi-VN")}</span>
                      )}
                    </div>

                    <Link href={`/student/history/writing/${submission.id}`}>
                      <Button className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Speaking Submissions */}
        <TabsContent value="speaking" className="space-y-4">
          {gradedSpeaking.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Mic className="h-16 w-16 text-gray-400 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có bài chấm</h3>
                <p className="text-gray-600">Bạn chưa có bài Speaking nào được chấm.</p>
              </CardContent>
            </Card>
          ) : (
            gradedSpeaking.map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{submission.challenge.question}</CardTitle>
                      <CardDescription className="mt-2">
                        {submission.challenge.lesson.unit.course.title} - {submission.challenge.lesson.title}
                      </CardDescription>
                    </div>
                    <Badge variant={submission.status === "GRADED" ? "default" : "secondary"}>
                      {submission.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-xs text-blue-900 mb-1">Fluency</div>
                        <div className="text-2xl font-bold text-blue-600">
                          {submission.fluencyCoherenceScore || "-"}
                        </div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-xs text-purple-900 mb-1">Lexical</div>
                        <div className="text-2xl font-bold text-purple-600">
                          {submission.lexicalResourceScore || "-"}
                        </div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg">
                        <div className="text-xs text-orange-900 mb-1">Grammar</div>
                        <div className="text-2xl font-bold text-orange-600">
                          {submission.grammaticalRangeScore || "-"}
                        </div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-xs text-green-900 mb-1">Pronunciation</div>
                        <div className="text-2xl font-bold text-green-600">
                          {submission.pronunciationScore || "-"}
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Award className="h-5 w-5 text-yellow-600" />
                        <span className="font-semibold text-yellow-900">Overall Band Score</span>
                      </div>
                      <div className="text-3xl font-bold text-yellow-600">
                        {submission.overallBandScore || "-"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Nộp: {new Date(submission.submittedAt).toLocaleDateString("vi-VN")}</span>
                      </div>
                      {submission.gradedAt && (
                        <span>Chấm: {new Date(submission.gradedAt).toLocaleDateString("vi-VN")}</span>
                      )}
                    </div>

                    <Link href={`/student/history/speaking/${submission.id}`}>
                      <Button className="w-full">
                        <Eye className="h-4 w-4 mr-2" />
                        Xem chi tiết
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

