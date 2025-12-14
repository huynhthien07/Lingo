"use client";

import { useState } from "react";
import { ArrowLeft, Save, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { UnitEditForm } from "./unit-edit-form";
import { UnitLessonList } from "./unit-lesson-list";
import { AddLessonModal } from "./add-lesson-modal";

interface Unit {
  id: number;
  title: string;
  description: string;
  courseId: number;
  order: number;
  course: {
    id: number;
    title: string;
  };
}

interface UnitDetailViewProps {
  unitId: number;
  initialUnit: Unit;
}

export function UnitDetailView({ unitId, initialUnit }: UnitDetailViewProps) {
  const [unit, setUnit] = useState<Unit | null>(initialUnit);
  const [saving, setSaving] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // If no initial unit, show error
  if (!unit) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Unit not found or you don't have access</p>
        <Link href="/teacher/units" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Units
        </Link>
      </div>
    );
  }

  const handleSaveUnit = async (data: Partial<Unit>) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/teacher/units/${unitId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setUnit({ ...unit, ...result.data });
        alert("Unit updated successfully!");
      } else {
        alert("Failed to update unit");
      }
    } catch (error) {
      console.error("Error updating unit:", error);
      alert("Failed to update unit");
    } finally {
      setSaving(false);
    }
  };

  const handleLessonAdded = () => {
    setShowAddLessonModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/teacher/courses/${unit.courseId}`}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{unit.title}</h2>
            <p className="text-gray-600 mt-1">
              {unit.course.title} → Unit #{unit.order}
            </p>
          </div>
        </div>
      </div>

      {/* Unit Edit Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Unit Information</h3>
        <UnitEditForm unit={unit} onSave={handleSaveUnit} saving={saving} />
      </div>

      {/* Lessons Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Lessons (Bài học)</h3>
          <button
            onClick={() => setShowAddLessonModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Lesson
          </button>
        </div>
        <UnitLessonList unitId={unitId} refreshKey={refreshKey} />
      </div>

      {/* Add Lesson Modal */}
      {showAddLessonModal && (
        <AddLessonModal
          unitId={unitId}
          onClose={() => setShowAddLessonModal(false)}
          onSuccess={handleLessonAdded}
        />
      )}
    </div>
  );
}

