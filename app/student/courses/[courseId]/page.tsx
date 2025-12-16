import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { notFound } from "next/navigation";
import db from "@/db/drizzle";
import { courseEnrollments, courses, units, lessons, lessonProgress } from "@/db/schema";
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

  // Get all lesson progress for this user
  const allLessonProgress = await db.query.lessonProgress.findMany({
    where: eq(lessonProgress.userId, userId),
  });

  // Calculate total lessons and completed lessons
  const totalLessons = course.units.reduce((acc, unit) => acc + unit.lessons.length, 0);
  const allLessonsInCourse = course.units.flatMap(unit => unit.lessons);
  const completedLessonsCount = allLessonsInCourse.filter(lesson =>
    allLessonProgress.some(lp => lp.lessonId === lesson.id && lp.completed)
  ).length;
  const actualProgress = totalLessons > 0 ? Math.round((completedLessonsCount / totalLessons) * 100) : 0;

  // Helper function to check if a lesson is unlocked
  const isLessonUnlocked = (unitIndex: number, lessonIndex: number, lessonId: number) => {
    // First lesson is always unlocked
    if (unitIndex === 0 && lessonIndex === 0) {
      return true;
    }

    // Check if lesson is already completed
    const isCompleted = allLessonProgress.some(lp => lp.lessonId === lessonId && lp.completed);
    if (isCompleted) {
      return true;
    }

    // Find previous lesson
    let previousLesson = null;
    if (lessonIndex > 0) {
      // Previous lesson in same unit
      previousLesson = course.units[unitIndex].lessons[lessonIndex - 1];
    } else if (unitIndex > 0) {
      // Last lesson of previous unit
      const previousUnit = course.units[unitIndex - 1];
      previousLesson = previousUnit.lessons[previousUnit.lessons.length - 1];
    }

    // If there's a previous lesson, check if it's completed
    if (previousLesson) {
      return allLessonProgress.some(lp => lp.lessonId === previousLesson.id && lp.completed);
    }

    return false;
  };

  // Helper function to check if a lesson is completed
  const isLessonCompleted = (lessonId: number) => {
    return allLessonProgress.some(lp => lp.lessonId === lessonId && lp.completed);
  };

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
                  <span className="font-semibold text-blue-600">
                    {completedLessonsCount}/{totalLessons} bài học ({actualProgress}%)
                  </span>
                </div>
                <Progress value={actualProgress} className="h-2" />
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
                    const isUnlocked = isLessonUnlocked(unitIndex, lessonIndex, lesson.id);
                    const isCompleted = isLessonCompleted(lesson.id);

                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                          isCompleted
                            ? "bg-green-50 border-green-200"
                            : isUnlocked
                            ? "bg-white hover:shadow-md border-gray-200"
                            : "bg-gray-50 border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-4 flex-1">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isCompleted
                              ? "bg-green-500"
                              : isUnlocked
                              ? "bg-blue-100"
                              : "bg-gray-200"
                          }`}>
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-white" />
                            ) : isUnlocked ? (
                              <BookOpen className="h-5 w-5 text-blue-600" />
                            ) : (
                              <Lock className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className={`font-semibold ${
                                isCompleted
                                  ? "text-green-900"
                                  : isUnlocked
                                  ? "text-gray-900"
                                  : "text-gray-400"
                              }`}>
                                Lesson {lesson.order}: {lesson.title}
                              </h4>
                              {isCompleted && (
                                <Badge className="bg-green-500 text-white text-xs">Hoàn thành</Badge>
                              )}
                            </div>
                            {lesson.description && (
                              <p className={`text-sm mt-1 ${
                                isCompleted ? "text-green-700" : "text-gray-500"
                              }`}>
                                {lesson.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">{lesson.skillType}</Badge>
                              {lesson.estimatedDuration && (
                                <span className="text-xs text-gray-500">{lesson.estimatedDuration} phút</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {isUnlocked ? (
                          <Link href={`/student/courses/${courseId}/lessons/${lesson.id}`}>
                            <Button variant={isCompleted ? "secondaryOutline" : "default"}>
                              {isCompleted ? "Xem lại" : "Bắt đầu"}
                            </Button>
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

