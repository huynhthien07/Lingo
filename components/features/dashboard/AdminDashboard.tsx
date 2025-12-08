"use client";

import { useEffect, useState } from "react";
import { Users, BookOpen, FileText, TrendingUp } from "lucide-react";
import Link from "next/link";

interface Stats {
  totalUsers: number;
  totalCourses: number;
  totalLessons: number;
  activeStudents: number;
}

/**
 * AdminDashboard - Dashboard content for ADMIN role
 */
export function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/admin/analytics/users");
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "bg-blue-500",
      href: "/users",
    },
    {
      title: "Total Courses",
      value: stats?.totalCourses || 0,
      icon: BookOpen,
      color: "bg-green-500",
      href: "/courses",
    },
    {
      title: "Total Lessons",
      value: stats?.totalLessons || 0,
      icon: FileText,
      color: "bg-purple-500",
      href: "/lessons",
    },
    {
      title: "Active Students",
      value: stats?.activeStudents || 0,
      icon: TrendingUp,
      color: "bg-orange-500",
      href: "/users?role=STUDENT",
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

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/users/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#18AA26] hover:bg-green-50 transition-colors text-center"
          >
            <Users className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="font-medium text-gray-900">Create User</p>
          </Link>
          <Link
            href="/courses/new"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#18AA26] hover:bg-green-50 transition-colors text-center"
          >
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="font-medium text-gray-900">Create Course</p>
          </Link>
          <Link
            href="/admin"
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#18AA26] hover:bg-green-50 transition-colors text-center"
          >
            <FileText className="w-8 h-8 mx-auto mb-2 text-gray-600" />
            <p className="font-medium text-gray-900">Admin Panel</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

