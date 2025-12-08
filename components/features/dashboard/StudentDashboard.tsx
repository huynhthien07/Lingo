"use client";

import { BookOpen, Trophy, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";

/**
 * StudentDashboard - Dashboard content for STUDENT role
 */
export function StudentDashboard() {
  const statCards = [
    {
      title: "Enrolled Courses",
      value: 0,
      icon: BookOpen,
      color: "bg-blue-500",
      href: "/courses",
    },
    {
      title: "Completed Lessons",
      value: 0,
      icon: Trophy,
      color: "bg-green-500",
      href: "/progress",
    },
    {
      title: "Study Time",
      value: "0h",
      icon: Clock,
      color: "bg-purple-500",
      href: "/progress",
    },
    {
      title: "Current Streak",
      value: 0,
      icon: TrendingUp,
      color: "bg-orange-500",
      href: "/progress",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Continue Learning */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Continue Learning
        </h2>
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p>No courses in progress</p>
          <Link
            href="/courses"
            className="inline-block mt-4 px-6 py-2 bg-[#18AA26] text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            Browse Courses
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/courses"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#18AA26] hover:bg-green-50 transition-colors text-center"
          >
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="font-medium text-gray-900">Browse Courses</p>
          </Link>
          <Link
            href="/flashcards"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#18AA26] hover:bg-green-50 transition-colors text-center"
          >
            <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="font-medium text-gray-900">Practice Flashcards</p>
          </Link>
          <Link
            href="/tests"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#18AA26] hover:bg-green-50 transition-colors text-center"
          >
            <Clock className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="font-medium text-gray-900">Take a Test</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

