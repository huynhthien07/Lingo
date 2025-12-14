import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import db from "@/db/drizzle";
import { courseEnrollments, lessons, challenges, questions, challengeOptions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, Play } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface LessonDetailPageProps {
  params: Promise<{ courseId: string; lessonId: string }>;
}

export default async function StudentLessonDetailPage({ params }: LessonDetailPageProps) {
  const { userId } = await auth();
  const { courseId, lessonId } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  const courseIdNum = parseInt(courseId);
  const lessonIdNum = parseInt(lessonId);

  // Check enrollment
  const enrollment = await db.query.courseEnrollments.findFirst({
    where: and(
      eq(courseEnrollments.userId, userId),
      eq(courseEnrollments.courseId, courseIdNum)
    ),
  });

  if (!enrollment) {
    redirect("/courses-public");
  }

  // Get lesson with challenges
  const lesson = await db.query.lessons.findFirst({
    where: eq(lessons.id, lessonIdNum),
    with: {
      unit: {
        with: {
          course: true,
        },
      },
      challenges: {
        with: {
          questions: {
            with: {
              options: true,
            },
          },
        },
      },
    },
  });

  if (!lesson) {
    notFound();
  }

  // Verify lesson belongs to the course
  if (lesson.unit.courseId !== courseIdNum) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href={`/student/courses/${courseId}`}>
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại khóa học
            </Button>
          </Link>

          <div className="flex items-start gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{lesson.skillType}</Badge>
                <Badge variant="outline">{lesson.unit.course.examType}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
              <p className="text-gray-600 mb-4">{lesson.description}</p>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{lesson.unit.title}</span>
                </div>
                {lesson.estimatedDuration && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>{lesson.estimatedDuration} phút</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  <span>{lesson.challenges.length} bài tập</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Challenges/Exercises */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bài tập thực hành</h2>

        {lesson.challenges.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-16 w-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Chưa có bài tập</h3>
              <p className="text-gray-600">Bài học này chưa có bài tập thực hành.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {lesson.challenges.map((challenge, index) => (
              <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge>Exercise {index + 1}</Badge>
                        <Badge variant="outline">{challenge.type}</Badge>
                      </div>
                      <CardTitle className="text-xl">{challenge.question}</CardTitle>
                      {challenge.description && (
                        <CardDescription className="mt-2">{challenge.description}</CardDescription>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Display passage/audio if available */}
                    {challenge.passage && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Đoạn văn:</h4>
                        <p className="text-gray-800 whitespace-pre-wrap">{challenge.passage}</p>
                      </div>
                    )}

                    {challenge.audioSrc && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h4 className="font-semibold text-sm text-gray-700 mb-2">Audio:</h4>
                        <audio controls className="w-full">
                          <source src={challenge.audioSrc} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                      </div>
                    )}

                    {/* Display questions count */}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">
                        {challenge.questions.length} câu hỏi
                      </span>
                      <Link href={`/student/courses/${courseId}/lessons/${lessonId}/practice/${challenge.id}`}>
                        <Button>
                          <Play className="h-4 w-4 mr-2" />
                          Bắt đầu luyện tập
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

