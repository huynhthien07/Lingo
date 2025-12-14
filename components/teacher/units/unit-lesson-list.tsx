"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowUp, ArrowDown, Eye, Trash2, Clock, Dumbbell } from "lucide-react";
import Link from "next/link";

interface Lesson {
  id: number;
  title: string;
  description: string | null;
  order: number;
  skillType: string;
  estimatedDuration: number | null;
  exerciseCount: number;
}

interface UnitLessonListProps {
  unitId: number;
  refreshKey: number;
}

export function UnitLessonList({ unitId, refreshKey }: UnitLessonListProps) {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLessons();
  }, [unitId, refreshKey]);

  const fetchLessons = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/lessons?unitId=${unitId}&limit=100`);
      const data = await response.json();

      if (data.success) {
        setLessons(data.data);
      }
    } catch (error) {
      console.error("Error fetching lessons:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveUp = async (lesson: Lesson, index: number) => {
    if (index === 0) return;

    const newLessons = [...lessons];
    const temp = newLessons[index - 1];
    newLessons[index - 1] = newLessons[index];
    newLessons[index] = temp;

    setLessons(newLessons);

    try {
      await Promise.all([
        fetch(`/api/teacher/lessons/${newLessons[index - 1].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index }),
        }),
        fetch(`/api/teacher/lessons/${newLessons[index].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index + 1 }),
        }),
      ]);
    } catch (error) {
      console.error("Error updating order:", error);
      fetchLessons();
    }
  };

  const handleMoveDown = async (lesson: Lesson, index: number) => {
    if (index === lessons.length - 1) return;

    const newLessons = [...lessons];
    const temp = newLessons[index + 1];
    newLessons[index + 1] = newLessons[index];
    newLessons[index] = temp;

    setLessons(newLessons);

    try {
      await Promise.all([
        fetch(`/api/teacher/lessons/${newLessons[index].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index + 1 }),
        }),
        fetch(`/api/teacher/lessons/${newLessons[index + 1].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index + 2 }),
        }),
      ]);
    } catch (error) {
      console.error("Error updating order:", error);
      fetchLessons();
    }
  };

  const handleDelete = async (lesson: Lesson) => {
    if (!confirm(`Are you sure you want to delete "${lesson.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/lessons/${lesson.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchLessons();
      } else {
        alert("Failed to delete lesson");
      }
    } catch (error) {
      console.error("Error deleting lesson:", error);
      alert("Failed to delete lesson");
    }
  };

  const skillColors: Record<string, string> = {
    LISTENING: "bg-purple-100 text-purple-800",
    READING: "bg-blue-100 text-blue-800",
    WRITING: "bg-green-100 text-green-800",
    SPEAKING: "bg-orange-100 text-orange-800",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (lessons.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No lessons yet. Click "Add Lesson" to create one.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {lessons.map((lesson, index) => (
        <div
          key={lesson.id}
          className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  #{lesson.order}
                </span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${skillColors[lesson.skillType] || "bg-gray-100 text-gray-800"}`}>
                  {lesson.skillType}
                </span>
              </div>
              <h4 className="font-semibold text-gray-900 line-clamp-1">{lesson.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {lesson.description || "No description"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-1">
              <Dumbbell className="w-4 h-4" />
              <span>{lesson.exerciseCount}</span>
            </div>
            {lesson.estimatedDuration && (
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{lesson.estimatedDuration}m</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={`/teacher/lessons/${lesson.id}`}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              View
            </Link>
            <button
              onClick={() => handleMoveUp(lesson, index)}
              disabled={index === 0}
              className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-30"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleMoveDown(lesson, index)}
              disabled={index === lessons.length - 1}
              className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-30"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(lesson)}
              className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

