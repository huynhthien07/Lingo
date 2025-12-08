"use client";

import { useEffect, useState } from "react";
import { CourseCard } from "./CourseCard";
import { Loader2 } from "lucide-react";

interface Course {
  id: number;
  title: string;
  imageSrc: string | null;
  description: string | null;
}

interface CourseListProps {
  role: "ADMIN" | "TEACHER" | "STUDENT";
}

/**
 * CourseList - Display list of courses based on user role
 */
export function CourseList({ role }: CourseListProps) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch("/api/courses");
        
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        setCourses(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError(err instanceof Error ? err.message : "Failed to load courses");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#18AA26]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <p className="text-gray-500 text-lg">No courses found</p>
        {role !== "STUDENT" && (
          <p className="text-gray-400 mt-2">
            Create your first course to get started
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard key={course.id} course={course} role={role} />
      ))}
    </div>
  );
}

