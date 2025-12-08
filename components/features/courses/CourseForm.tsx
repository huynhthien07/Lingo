"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";

interface CourseFormProps {
  mode: "create" | "edit";
  courseId?: number;
}

interface FormData {
  title: string;
  imageSrc: string;
  description: string;
}

/**
 * CourseForm - Form for creating/editing courses
 */
export function CourseForm({ mode, courseId }: CourseFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    imageSrc: "",
    description: "",
  });

  // Fetch course data if editing
  useEffect(() => {
    if (mode === "edit" && courseId) {
      async function fetchCourse() {
        try {
          const response = await fetch(`/api/courses/${courseId}`);
          if (response.ok) {
            const data = await response.json();
            setFormData({
              title: data.title || "",
              imageSrc: data.imageSrc || "",
              description: data.description || "",
            });
          }
        } catch (error) {
          console.error("Error fetching course:", error);
        }
      }
      fetchCourse();
    }
  }, [mode, courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = mode === "create" 
        ? "/api/courses" 
        : `/api/courses/${courseId}`;
      
      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        router.push(`/courses/${data.id || courseId}`);
      } else {
        alert("Failed to save course");
      }
    } catch (error) {
      console.error("Error saving course:", error);
      alert("Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Back Button */}
      <Link
        href={mode === "edit" ? `/courses/${courseId}` : "/courses"}
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </Link>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Course Title *
          </label>
          <input
            type="text"
            id="title"
            required
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18AA26] focus:border-transparent"
            placeholder="e.g., IELTS Speaking 7.0"
          />
        </div>

        {/* Image URL */}
        <div>
          <label htmlFor="imageSrc" className="block text-sm font-medium text-gray-700 mb-2">
            Image URL
          </label>
          <input
            type="url"
            id="imageSrc"
            value={formData.imageSrc}
            onChange={(e) => setFormData({ ...formData, imageSrc: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18AA26] focus:border-transparent"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18AA26] focus:border-transparent"
            placeholder="Describe what students will learn..."
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-[#18AA26] text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                {mode === "create" ? "Create Course" : "Save Changes"}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

