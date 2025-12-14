"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus } from "lucide-react";
import { LessonEditForm } from "./lesson-edit-form";
import { LessonExerciseList } from "./lesson-exercise-list";
import { AddExerciseModal } from "./add-exercise-modal";

interface Lesson {
  id: number;
  title: string;
  description: string;
  skillType: string;
  estimatedDuration: number;
  videoUrl: string | null;
  unitId: number;
  unit: {
    id: number;
    title: string;
    courseId: number;
    course: {
      id: number;
      title: string;
    };
  };
}

interface LessonDetailViewProps {
  lessonId: number;
  initialLesson: Lesson | null;
}

export function LessonDetailView({ lessonId, initialLesson }: LessonDetailViewProps) {
  const router = useRouter();
  const [lesson, setLesson] = useState<Lesson | null>(initialLesson);
  const [saving, setSaving] = useState(false);
  const [showAddExerciseModal, setShowAddExerciseModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  if (!lesson || !lesson.unit || !lesson.unit.course) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">Lesson not found or you don't have access</p>
        <Link
          href="/teacher/lessons"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Lessons
        </Link>
      </div>
    );
  }

  const handleSaveLesson = async (updatedData: any) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/teacher/lessons/${lessonId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const result = await response.json();
        setLesson(result.data);
        alert("Lesson updated successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update lesson");
      }
    } catch (error) {
      console.error("Error updating lesson:", error);
      alert("Failed to update lesson");
    } finally {
      setSaving(false);
    }
  };

  const handleExerciseAdded = () => {
    setShowAddExerciseModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/teacher/courses" className="hover:text-blue-600">
          Courses
        </Link>
        <span>/</span>
        <Link href={`/teacher/courses/${lesson.unit.courseId}`} className="hover:text-blue-600">
          {lesson.unit.course.title}
        </Link>
        <span>/</span>
        <Link href={`/teacher/units/${lesson.unitId}`} className="hover:text-blue-600">
          {lesson.unit.title}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{lesson.title}</span>
      </div>

      {/* Lesson Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Lesson Information</h3>
        <LessonEditForm lesson={lesson} onSave={handleSaveLesson} saving={saving} />
      </div>

      {/* Exercises Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Exercises (Bài tập)</h3>
          <button
            onClick={() => setShowAddExerciseModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Exercise
          </button>
        </div>
        <LessonExerciseList lessonId={lessonId} refreshKey={refreshKey} />
      </div>

      {/* Add Exercise Modal */}
      {showAddExerciseModal && (
        <AddExerciseModal
          lessonId={lessonId}
          onClose={() => setShowAddExerciseModal(false)}
          onSuccess={handleExerciseAdded}
        />
      )}
    </div>
  );
}

