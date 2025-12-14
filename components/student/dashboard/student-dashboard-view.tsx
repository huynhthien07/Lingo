"use client";

import { BookOpen, Trophy, Clock, TrendingUp, Target, Award } from "lucide-react";
import Link from "next/link";

export function StudentDashboardView() {
  const statCards = [
    {
      title: "Enrolled Courses",
      value: "0",
      icon: BookOpen,
      color: "bg-blue-500",
      href: "/student/courses",
    },
    {
      title: "Completed Lessons",
      value: "0",
      icon: Trophy,
      color: "bg-green-500",
      href: "/student/analytics",
    },
    {
      title: "Study Time",
      value: "0h",
      icon: Clock,
      color: "bg-purple-500",
      href: "/student/analytics",
    },
    {
      title: "Current Streak",
      value: "0 days",
      icon: TrendingUp,
      color: "bg-orange-500",
      href: "/student/gamification",
    },
    {
      title: "Total Points",
      value: "0",
      icon: Target,
      color: "bg-pink-500",
      href: "/student/gamification",
    },
    {
      title: "Badges Earned",
      value: "0",
      icon: Award,
      color: "bg-indigo-500",
      href: "/student/gamification",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Welcome to Lingo IELTS! 🎓</h2>
        <p className="text-green-50">
          Start your learning journey today. Practice, improve, and achieve your IELTS goals!
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.href}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/student/courses"
            className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
          >
            <BookOpen className="w-5 h-5 text-blue-600" />
            <span className="font-medium text-blue-900">Browse Courses</span>
          </Link>
          <Link
            href="/student/admission-test"
            className="flex items-center gap-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
          >
            <Target className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-900">Take Test</span>
          </Link>
          <Link
            href="/student/flashcards"
            className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
          >
            <Award className="w-5 h-5 text-purple-600" />
            <span className="font-medium text-purple-900">Practice Flashcards</span>
          </Link>
          <Link
            href="/student/chatbot"
            className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
          >
            <Trophy className="w-5 h-5 text-orange-600" />
            <span className="font-medium text-orange-900">Ask AI Tutor</span>
          </Link>
        </div>
      </div>

      {/* Recent Activity Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="text-center py-8 text-gray-500">
          <p>No recent activity yet. Start learning to see your progress here!</p>
        </div>
      </div>
    </div>
  );
}

