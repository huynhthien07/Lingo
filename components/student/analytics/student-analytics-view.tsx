"use client";

import { BarChart3, TrendingUp, Clock, Target, BookOpen, Award } from "lucide-react";

export function StudentAnalyticsView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics & Progress</h1>
        <p className="text-gray-600 mt-2">Track your learning progress and performance</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Study Time</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0h</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Lessons Completed</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <BookOpen className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Average Score</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">-</p>
            </div>
            <Target className="w-8 h-8 text-purple-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Current Streak</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
            </div>
            <Award className="w-8 h-8 text-orange-500" />
          </div>
        </div>
      </div>

      {/* Progress by Skill */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          Progress by Skill
        </h3>
        <div className="space-y-4">
          {["Listening", "Reading", "Writing", "Speaking", "Vocabulary", "Grammar"].map((skill) => (
            <div key={skill}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">{skill}</span>
                <span className="text-sm text-gray-600">0%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Study Time (Last 7 Days)</h3>
          <div className="flex items-center justify-center h-64 text-gray-400">
            <BarChart3 className="w-16 h-16" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
          <div className="flex items-center justify-center h-64 text-gray-400">
            <TrendingUp className="w-16 h-16" />
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Coming Soon:</strong> Detailed analytics with charts, performance tracking, and personalized insights.
        </p>
      </div>
    </div>
  );
}

