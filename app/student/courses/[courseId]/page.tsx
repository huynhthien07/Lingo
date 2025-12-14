import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import db from "@/db/drizzle";
import { courseEnrollments, courses, units, lessons } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft, BookOpen, Clock, CheckCircle2, Lock } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface CourseDetailPageProps {
  params: Promise<{ courseId: string }>;
}

export default async function StudentCourseDetailPage({ params }: CourseDetailPageProps) {
  const { userId } = await auth();
  const { courseId } = await params;

  if (!userId) {
    redirect("/sign-in");
  }

  const courseIdNum = parseInt(courseId);

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

  // Get course with units and lessons
  const course = await db.query.courses.findFirst({
    where: eq(courses.id, courseIdNum),
    with: {
      units: {
        orderBy: [asc(units.order)],
        with: {
          lessons: {
            orderBy: [asc(lessons.order)],
          },
        },
      },
    },
  });

  if (!course) {
    notFound();
  }

  // Calculate total lessons
  const totalLessons = course.units.reduce((acc, unit) => acc + unit.lessons.length, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <Link href="/student/courses">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại danh sách khóa học
            </Button>
          </Link>

          <div className="flex items-start gap-6">
            <div className="w-48 h-32 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
              <img
                src={course.imageSrc}
                alt={course.title}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge>{course.examType}</Badge>
                <Badge variant="outline">{course.level}</Badge>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.title}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>

              <div className="flex items-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.units.length} Units</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{totalLessons} Lessons</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Tiến độ khóa học</span>
                  <span className="font-semibold text-blue-600">{enrollment.progress}%</span>
                </div>
                <Progress value={enrollment.progress} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Units and Lessons */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nội dung khóa học</h2>

        <div className="space-y-6">
          {course.units.map((unit, unitIndex) => (
            <Card key={unit.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      Unit {unit.order}: {unit.title}
                    </CardTitle>
                    <CardDescription className="mt-2">{unit.description}</CardDescription>
                  </div>
                  <Badge variant="secondary">{unit.lessons.length} bài học</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {unit.lessons.map((lesson, lessonIndex) => {
                    const isFirst = unitIndex === 0 && lessonIndex === 0;
                    const isLocked = !isFirst; // For now, lock all except first lesson

                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-4 rounded-lg border ${
                          isLocked ? "bg-gray-50" : "bg-white hover:shadow-md transition-shadow"
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isLocked ? "bg-gray-200" : "bg-blue-100"
                          }`}>
                            {isLocked ? (
                              <Lock className="h-5 w-5 text-gray-400" />
                            ) : (
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${isLocked ? "text-gray-400" : "text-gray-900"}`}>
                              Lesson {lesson.order}: {lesson.title}
                            </h4>
                            {lesson.description && (
                              <p className="text-sm text-gray-500 mt-1">{lesson.description}</p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">{lesson.skillType}</Badge>
                              {lesson.estimatedDuration && (
                                <span className="text-xs text-gray-500">{lesson.estimatedDuration} phút</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {!isLocked ? (
                          <Link href={`/student/courses/${courseId}/lessons/${lesson.id}`}>
                            <Button>Bắt đầu</Button>
                          </Link>
                        ) : (
                          <Button disabled variant="secondary">
                            <Lock className="h-4 w-4 mr-2" />
                            Đã khóa
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

