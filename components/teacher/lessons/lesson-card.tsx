"use client";

import Link from "next/link";
import { Edit, Trash2, Dumbbell, Clock, FileText } from "lucide-react";
import { useState } from "react";

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  unitId: number;
  unitTitle: string;
  courseTitle: string;
  order: number;
  skillType: string;
  estimatedDuration: number | null;
  exerciseCount: number;
}

interface LessonCardProps {
  lesson: Lesson;
  onUpdate: () => void;
}

export function LessonCard({ lesson, onUpdate }: LessonCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/teacher/lessons/${lesson.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert("Failed to delete lesson");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Failed to delete lesson");
    } finally {
      setDeleting(false);
    }
  };

  const skillColors: Record<string, string> = {
    LISTENING: "bg-purple-100 text-purple-800",
    READING: "bg-blue-100 text-blue-800",
    WRITING: "bg-green-100 text-green-800",
    SPEAKING: "bg-orange-100 text-orange-800",
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {lesson.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {lesson.courseTitle} → {lesson.unitTitle}
          </p>
        </div>
        <div className="flex flex-col gap-2 items-end">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${skillColors[lesson.skillType] || "bg-gray-100 text-gray-800"}`}>
            {lesson.skillType}
          </span>
          <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            #{lesson.order}
          </span>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {lesson.description || "No description"}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <Dumbbell className="w-4 h-4" />
          <span>{lesson.exerciseCount} exercises</span>
        </div>
        {lesson.estimatedDuration && (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{lesson.estimatedDuration} min</span>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/teacher/lessons/${lesson.id}`}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Edit className="w-4 h-4" />
          Edit
        </Link>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? "..." : "Delete"}
        </button>
      </div>
    </div>
  );
}

