"use client";

import Link from "next/link";
import Image from "next/image";
import { BookOpen, Edit, Trash2 } from "lucide-react";
import { PermissionGuard } from "@/components/guards/PermissionGuard";

interface Course {
  id: number;
  title: string;
  imageSrc: string | null;
  description: string | null;
}

interface CourseCardProps {
  course: Course;
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

/**
 * CourseCard - Display individual course card
 */
export function CourseCard({ course, role }: CourseCardProps) {
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${course.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/courses/${course.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        window.location.reload();
      } else {
        alert("Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    }
  };

  return (
    <div className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden">
      {/* Course Image */}
      <Link href={`/courses/${course.id}`}>
        <div className="relative h-48 bg-gray-200">
          {course.imageSrc ? (
            <Image
              src={course.imageSrc}
              alt={course.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <BookOpen className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>
      </Link>

      {/* Course Info */}
      <div className="p-4">
        <Link href={`/courses/${course.id}`}>
          <h3 className="text-lg font-bold text-gray-900 hover:text-[#18AA26] transition-colors">
            {course.title}
          </h3>
        </Link>
        
        {course.description && (
          <p className="text-gray-600 text-sm mt-2 line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Actions - Only for ADMIN and TEACHER */}
        <PermissionGuard permission="COURSE_EDIT">
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
            <Link
              href={`/courses/${course.id}/edit`}
              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </Link>
            
            <PermissionGuard permission="COURSE_DELETE">
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </PermissionGuard>
          </div>
        </PermissionGuard>
      </div>
    </div>
  );
}

