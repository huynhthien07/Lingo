"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  BookOpen,
  CheckCircle,
  Circle,
  Calendar,
  TrendingUp,
  Award,
  Headphones,
  FileText,
  PenTool,
  Mic,
  BookMarked,
  Languages,
  Clock,
  Activity,
} from "lucide-react";

interface StudentDetailViewProps {
  studentId: string;
  courseId: number;
}

interface LessonProgress {
  id: number;
  lessonId: number;
  completed: boolean;
  completedAt: string | null;
  startedAt: string;
}

interface SkillProgress {
  LISTENING: { completed: number; total: number };
  READING: { completed: number; total: number };
  WRITING: { completed: number; total: number };
  SPEAKING: { completed: number; total: number };
  VOCABULARY: { completed: number; total: number };
  GRAMMAR: { completed: number; total: number };
}

interface Enrollment {
  id: number;
  userId: string;
  courseId: number;
  enrollmentType: string;
  status: string;
  progress: number;
  enrolledAt: string;
  completedAt: string | null;
  user: {
    userId: string;
    userName: string;
    email: string;
    userImageSrc: string | null;
  };
  course: {
    id: number;
    title: string;
    imageSrc: string;
    description: string;
    units: Array<{
      id: number;
      title: string;
      description: string;
      order: number;
      lessons: Array<{
        id: number;
        title: string;
        description: string;
        order: number;
        skillType: string;
        estimatedDuration: number;
      }>;
    }>;
  };
}

export function StudentDetailView({ studentId, courseId }: StudentDetailViewProps) {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [lessonProgress, setLessonProgress] = useState<LessonProgress[]>([]);
  const [skillProgress, setSkillProgress] = useState<SkillProgress | null>(null);
  const [recentActivity, setRecentActivity] = useState<LessonProgress[]>([]);
  const [totalTimeSpent, setTotalTimeSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentDetail();
  }, [studentId, courseId]);

  const fetchStudentDetail = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/teacher/students/${studentId}?courseId=${courseId}`
      );
      const data = await response.json();

      if (data.error) {
        console.error("Error:", data.error);
        return;
      }

      setEnrollment(data.enrollment);
      setLessonProgress(data.lessonProgress || []);
      setSkillProgress(data.skillProgress || null);
      setRecentActivity(data.recentActivity || []);
      setTotalTimeSpent(data.totalTimeSpent || 0);
    } catch (error) {
      console.error("Error fetching student detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const isLessonCompleted = (lessonId: number) => {
    return lessonProgress.some(
      (lp) => lp.lessonId === lessonId && lp.completed
    );
  };

  const getUnitProgress = (unitLessons: any[]) => {
    const completedLessons = unitLessons.filter((lesson) =>
      isLessonCompleted(lesson.id)
    ).length;
    return unitLessons.length > 0
      ? Math.round((completedLessons / unitLessons.length) * 100)
      : 0;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      ACTIVE: "bg-green-100 text-green-800",
      COMPLETED: "bg-blue-100 text-blue-800",
      DROPPED: "bg-red-100 text-red-800",
      SUSPENDED: "bg-yellow-100 text-yellow-800",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getSkillIcon = (skillType: string) => {
    const icons = {
      LISTENING: Headphones,
      READING: FileText,
      WRITING: PenTool,
      SPEAKING: Mic,
      VOCABULARY: BookMarked,
      GRAMMAR: Languages,
    };
    return icons[skillType as keyof typeof icons] || BookOpen;
  };

  const getSkillColor = (skillType: string) => {
    const colors = {
      LISTENING: "bg-purple-50 text-purple-600 border-purple-200",
      READING: "bg-blue-50 text-blue-600 border-blue-200",
      WRITING: "bg-green-50 text-green-600 border-green-200",
      SPEAKING: "bg-orange-50 text-orange-600 border-orange-200",
      VOCABULARY: "bg-pink-50 text-pink-600 border-pink-200",
      GRAMMAR: "bg-indigo-50 text-indigo-600 border-indigo-200",
    };
    return colors[skillType as keyof typeof colors] || "bg-gray-50 text-gray-600 border-gray-200";
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">Loading student details...</p>
        </div>
      </div>
    );
  }

  if (!enrollment) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-red-600 text-lg mb-4">Student not found</p>
          <Link
            href="/teacher/students"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Students
          </Link>
        </div>
      </div>
    );
  }

  const totalLessons = enrollment.course.units.reduce(
    (sum, unit) => sum + unit.lessons.length,
    0
  );
  const completedLessons = lessonProgress.filter((lp) => lp.completed).length;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/teacher/students" className="hover:text-blue-600">
          Students
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{enrollment.user.userName}</span>
      </div>

      {/* Student Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <img
              src={enrollment.user.userImageSrc || "/mascot.svg"}
              alt={enrollment.user.userName}
              className="w-20 h-20 rounded-full"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {enrollment.user.userName}
              </h1>
              <p className="text-gray-600">{enrollment.user.email}</p>
              <div className="flex items-center gap-4 mt-2">
                <span
                  className={`px-3 py-1 text-sm font-semibold rounded-full ${getStatusBadge(
                    enrollment.status
                  )}`}
                >
                  {enrollment.status}
                </span>
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Info */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Course: {enrollment.course.title}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className="text-3xl font-bold text-blue-600">{enrollment.progress}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Completed Lessons</p>
                <p className="text-3xl font-bold text-green-600">
                  {completedLessons}/{totalLessons}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Units</p>
                <p className="text-3xl font-bold text-purple-600">
                  {enrollment.course.units.length}
                </p>
              </div>
              <Award className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Time Spent</p>
                <p className="text-3xl font-bold text-orange-600">
                  {Math.floor(totalTimeSpent / 60)}h {totalTimeSpent % 60}m
                </p>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Skill Progress */}
      {skillProgress && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Progress by Skill
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(skillProgress).map(([skillType, progress]) => {
              const Icon = getSkillIcon(skillType);
              const percentage = progress.total > 0
                ? Math.round((progress.completed / progress.total) * 100)
                : 0;

              return (
                <div
                  key={skillType}
                  className={`border rounded-lg p-4 ${getSkillColor(skillType)}`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <h3 className="font-semibold">{skillType}</h3>
                    </div>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <div className="w-full bg-white bg-opacity-50 rounded-full h-2 mb-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: 'currentColor',
                        opacity: 0.8
                      }}
                    ></div>
                  </div>
                  <p className="text-xs">
                    {progress.completed} / {progress.total} lessons completed
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Units & Lessons Progress */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-4">Learning Progress by Unit</h2>
        <div className="space-y-6">
          {enrollment.course.units.map((unit) => {
            const unitProgress = getUnitProgress(unit.lessons);
            return (
              <div key={unit.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{unit.title}</h3>
                  <span className="text-sm text-gray-600">{unitProgress}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${unitProgress}%` }}
                  ></div>
                </div>
                <div className="space-y-2">
                  {unit.lessons.map((lesson) => {
                    const completed = isLessonCompleted(lesson.id);
                    return (
                      <div
                        key={lesson.id}
                        className={`flex items-center gap-3 p-3 rounded-lg ${
                          completed ? "bg-green-50" : "bg-gray-50"
                        }`}
                      >
                        {completed ? (
                          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{lesson.title}</p>
                          <p className="text-sm text-gray-600">
                            {lesson.skillType} • {lesson.estimatedDuration} min
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.map((activity) => {
              const lesson = enrollment?.course.units
                .flatMap((u) => u.lessons)
                .find((l) => l.id === activity.lessonId);

              if (!lesson) return null;

              return (
                <div
                  key={activity.id}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
                >
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{lesson.title}</p>
                    <p className="text-sm text-gray-600">
                      {lesson.skillType} • Completed{" "}
                      {activity.completedAt
                        ? new Date(activity.completedAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "recently"}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {lesson.estimatedDuration} min
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

