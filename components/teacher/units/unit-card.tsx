"use client";

import Link from "next/link";
import { Edit, Trash2, BookOpen, FileText } from "lucide-react";
import { useState } from "react";

interface Unit {
  id: number;
  title: string;
  description: string;
  courseId: number;
  courseTitle: string;
  order: number;
  lessonCount: number;
}

interface UnitCardProps {
  unit: Unit;
  onUpdate: () => void;
}

export function UnitCard({ unit, onUpdate }: UnitCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${unit.title}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/teacher/units/${unit.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert("Failed to delete unit");
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
      alert("Failed to delete unit");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {unit.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
            <FileText className="w-4 h-4" />
            {unit.courseTitle}
          </p>
        </div>
        <div className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
          #{unit.order}
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {unit.description}
      </p>

      {/* Stats */}
      <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
        <div className="flex items-center gap-1 text-sm text-gray-600">
          <BookOpen className="w-4 h-4" />
          <span>{unit.lessonCount} lessons</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <Link
          href={`/teacher/units/${unit.id}`}
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

