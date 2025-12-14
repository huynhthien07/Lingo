"use client";

import { BookOpen, Search, Filter } from "lucide-react";

export function StudentCoursesView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">My Courses</h1>
        <p className="text-gray-600 mt-2">Browse and manage your enrolled courses</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search courses..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button className="pb-4 border-b-2 border-green-600 text-green-600 font-semibold">
            Enrolled Courses
          </button>
          <button className="pb-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
            Available Courses
          </button>
        </nav>
      </div>

      {/* Courses Grid - Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <BookOpen className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium">No courses yet</p>
          <p className="text-sm mt-2">Enroll in courses to start your learning journey</p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Coming Soon:</strong> Course enrollment, course details, units, lessons, and practice exercises.
        </p>
      </div>
    </div>
  );
}

