"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Save, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Course {
  id: number;
  title: string;
}

export function CreateUnitForm() {
  const router = useRouter();
  const [creating, setCreating] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: "",
  });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await fetch("/api/teacher/courses?limit=100");
      const data = await response.json();
      if (data.success) {
        setCourses(data.data);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoadingCourses(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.courseId) {
      alert("Please select a course");
      return;
    }

    setCreating(true);

    try {
      const response = await fetch("/api/teacher/units", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          courseId: parseInt(formData.courseId),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Unit created successfully!");

        // Redirect to course detail
        router.push(`/teacher/courses/${formData.courseId}`);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create unit");
      }
    } catch (error) {
      console.error("Error creating unit:", error);
      alert("Failed to create unit");
    } finally {
      setCreating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unit Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., Introduction to IELTS Writing"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Describe what students will learn in this unit..."
              required
            />
          </div>

          {/* Course Selection (Required) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Course *
            </label>
            {loadingCourses ? (
              <div className="flex items-center gap-2 text-gray-500">
                <Loader2 className="w-4 h-4 animate-spin" />
                Loading courses...
              </div>
            ) : (
              <select
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">-- Select a Course --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.title}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Each unit must belong to a course
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/teacher/units"
          className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Units
        </Link>
        <button
          type="submit"
          disabled={creating}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {creating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Create Unit
            </>
          )}
        </button>
      </div>
    </form>
  );
}

