"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Play, BookOpen, Clock, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface LessonViewClientProps {
  lesson: any;
  courseId: number;
  isCompleted: boolean;
  completedChallenges: number;
  totalChallenges: number;
}

export function LessonViewClient({
  lesson,
  courseId,
  isCompleted,
  completedChallenges,
  totalChallenges,
}: LessonViewClientProps) {
  const progressPercentage = totalChallenges > 0 ? (completedChallenges / totalChallenges) * 100 : 0;

  // Hide student sidebar on mount
  useEffect(() => {
    const sidebar = document.querySelector('[data-student-sidebar]');
    if (sidebar) {
      (sidebar as HTMLElement).style.display = 'none';
    }

    return () => {
      const sidebar = document.querySelector('[data-student-sidebar]');
      if (sidebar) {
        (sidebar as HTMLElement).style.display = '';
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Compact Header - Only Back Button */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="max-w-[1600px] mx-auto px-4 py-2">
          <Link href={`/student/courses/${courseId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Quay lại khóa học
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="max-w-[1600px] mx-auto px-4 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Sidebar - Progress & Exercises */}
          <div className="lg:col-span-1 space-y-3">
            {/* Progress Card */}
            <div className="bg-white rounded-lg border p-4 sticky top-16">
              <h3 className="font-semibold text-base mb-3">Nội dung bài học</h3>

              {/* Lesson Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-gray-700">Tiến độ</span>
                  <span className="text-sm font-semibold text-blue-600">
                    {completedChallenges}/{totalChallenges}
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2.5" />
                <p className="text-xs text-gray-500 mt-1">
                  {isCompleted ? "✓ Đã hoàn thành" : `${Math.round(progressPercentage)}% hoàn thành`}
                </p>
              </div>

              {/* Exercise List */}
              <div className="space-y-1.5">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Bài tập ({totalChallenges})</h4>
                {lesson.challenges.map((challenge: any, index: number) => {
                  const isCompleted = completedChallenges > index;
                  return (
                    <Link
                      key={challenge.id}
                      href={`/student/courses/${courseId}/lessons/${lesson.id}/practice/${challenge.id}`}
                      className="block"
                    >
                      <div className={`flex items-center gap-2.5 p-2.5 rounded-lg transition-all border ${
                        isCompleted
                          ? 'bg-green-50 border-green-200 hover:bg-green-100'
                          : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                      }`}>
                        <div className="flex-shrink-0">
                          {isCompleted ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            {challenge.type || `Bài tập ${index + 1}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            {challenge.questions.length} câu hỏi
                          </p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Start Practice Button */}
              {totalChallenges > 0 && (
                <Link
                  href={`/student/courses/${courseId}/lessons/${lesson.id}/practice/${lesson.challenges[0].id}`}
                  className="block mt-4"
                >
                  <Button className="w-full" size="lg">
                    <Play className="h-5 w-5 mr-2" />
                    {completedChallenges > 0 ? "Tiếp tục luyện tập" : "Bắt đầu luyện tập"}
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Right Content - Video & Description */}
          <div className="lg:col-span-3 space-y-3">
            {/* Lesson Header */}
            <div className="bg-white rounded-lg border p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="text-xs">{lesson.skillType}</Badge>
                <Badge variant="outline" className="text-xs">{lesson.unit.course.examType}</Badge>
                {isCompleted && <Badge className="bg-green-500 text-xs">✓ Hoàn thành</Badge>}
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4" />
                  <span>{lesson.unit.title}</span>
                </div>
                {lesson.estimatedDuration && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{lesson.estimatedDuration} phút</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Volume2 className="h-4 w-4" />
                  <span>{totalChallenges} bài tập</span>
                </div>
              </div>
            </div>

            {/* Video Player */}
            {lesson.videoUrl && (
              <div className="bg-white rounded-lg border overflow-hidden">
                <video
                  src={lesson.videoUrl}
                  controls
                  className="w-full aspect-video bg-black"
                  controlsList="nodownload"
                  preload="metadata"
                />
              </div>
            )}

            {/* Lesson Description/Content */}
            <div className="bg-white rounded-lg border p-4">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Nội dung bài học</h2>
              <div className="prose prose-sm max-w-none">
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed text-base">
                  {lesson.description || "Chưa có mô tả cho bài học này."}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

