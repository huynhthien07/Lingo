"use client";

import Image from "next/image";
import Link from "next/link";
import { Edit, Trash2, Users, BookOpen, DollarSign } from "lucide-react";
import { useState } from "react";

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
  studentCount: number;
  lessonCount: number;
}

interface CourseCardProps {
  course: Course;
  onUpdate: () => void;
}

export function CourseCard({ course, onUpdate }: CourseCardProps) {
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${course.title}"?`)) {
      return;
    }

    setDeleting(true);
    try {
      const response = await fetch(`/api/teacher/courses/${course.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert("Failed to delete course");
      }
    } catch (error) {
      console.error("Error deleting course:", error);
      alert("Failed to delete course");
    } finally {
      setDeleting(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(price);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={course.imageSrc}
          alt={course.title}
          fill
          className="object-cover"
        />
        {/* Badge for Exam Type and Level */}
        <div className="absolute top-2 right-2 flex gap-2">
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {course.examType}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            {course.level}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 line-clamp-1">
            {course.title}
          </h3>
          <p className="text-sm text-gray-500 line-clamp-2 mt-1">
            {course.description || "No description"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <DollarSign className="w-4 h-4" />
            <span>{course.isFree ? "Free" : formatPrice(course.price, course.currency)}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{course.studentCount}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <BookOpen className="w-4 h-4" />
            <span>{course.lessonCount}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <Link
            href={`/teacher/courses/${course.id}`}
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
    </div>
  );
}

