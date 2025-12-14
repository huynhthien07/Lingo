"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { CourseEditForm } from "./course-edit-form";
import { CourseUnitList } from "./course-unit-list";
import { AddUnitModal } from "./add-unit-modal";

interface Course {
  id: number;
  title: string;
  imageSrc: string;
  description: string | null;
  examType: string;
  level: string;
  price: number;
  currency: string;
  isFree: boolean;
}

interface CourseDetailViewProps {
  courseId: number;
  initialCourse: Course;
}

export function CourseDetailView({ courseId, initialCourse }: CourseDetailViewProps) {
  const [course, setCourse] = useState<Course | null>(initialCourse);
  const [saving, setSaving] = useState(false);
  const [showAddUnitModal, setShowAddUnitModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  // If no initial course, show error
  if (!course) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Course not found or you don't have access</p>
        <Link href="/teacher/courses" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to Courses
        </Link>
      </div>
    );
  }

  const handleSaveCourse = async (data: Partial<Course>) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/teacher/courses/${courseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setCourse(result.data);
        alert("Course updated successfully!");
      } else {
        alert("Failed to update course");
      }
    } catch (error) {
      console.error("Error updating course:", error);
      alert("Failed to update course");
    } finally {
      setSaving(false);
    }
  };

  const handleUnitAdded = () => {
    setShowAddUnitModal(false);
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/teacher/courses"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-3xl font-bold text-gray-900">{course.title}</h2>
            <p className="text-gray-600 mt-1">Course Details & Management</p>
          </div>
        </div>
      </div>

      {/* Course Edit Form */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Course Information</h3>
        <CourseEditForm course={course} onSave={handleSaveCourse} saving={saving} />
      </div>

      {/* Units Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Units (Chủ đề)</h3>
          <button
            onClick={() => setShowAddUnitModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Unit
          </button>
        </div>
        <CourseUnitList courseId={courseId} refreshKey={refreshKey} />
      </div>

      {/* Add Unit Modal */}
      {showAddUnitModal && (
        <AddUnitModal
          courseId={courseId}
          onClose={() => setShowAddUnitModal(false)}
          onSuccess={handleUnitAdded}
        />
      )}
    </div>
  );
}

