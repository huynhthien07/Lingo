"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Edit, BookOpen, Loader2 } from "lucide-react";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

interface Course {
  id: number;
  title: string;
  imageSrc: string | null;
  description: string | null;
}

interface CourseDetailProps {
  courseId: number;
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

/**
 * CourseDetail - Display course details and units
 */
export function CourseDetail({ courseId, role }: CourseDetailProps) {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await fetch(`/api/courses/${courseId}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch course");
        }

        const data = await response.json();
        setCourse(data);
      } catch (err) {
        console.error("Error fetching course:", err);
        setError(err instanceof Error ? err.message : "Failed to load course");
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#18AA26]" />
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error || "Course not found"}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link
        href="/courses"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      {/* Course Header */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Course Image */}
        <div className="relative h-64 bg-gray-200">
          {course.imageSrc ? (
            <Image
              src={course.imageSrc}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="w-24 h-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* Course Info */}
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {course.title}
              </h1>
              {course.description && (
                <p className="text-gray-600 mt-2">{course.description}</p>
              )}
            </div>

            {/* Edit Button - Only for ADMIN and TEACHER */}
            <PermissionGuard permission="COURSE_EDIT">
              <Link
                href={`/courses/${courseId}/edit`}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Course
              </Link>
            </PermissionGuard>
          </div>
        </div>
      </div>

      {/* Units Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Units</h2>
        <div className="text-center py-8 text-gray-500">
          <p>No units yet</p>
          <PermissionGuard permission="UNIT_CREATE">
            <Link
              href={`/courses/${courseId}/units/new`}
              className="inline-block mt-4 px-6 py-2 bg-[#18AA26] text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              Create First Unit
            </Link>
          </PermissionGuard>
        </div>
      </div>
    </div>
  );
}

