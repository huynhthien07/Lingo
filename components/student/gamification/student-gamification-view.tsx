"use client";

import { Trophy, Award, Target, TrendingUp, Star, Zap } from "lucide-react";

export function StudentGamificationView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Gamification</h1>
        <p className="text-gray-600 mt-2">Track your achievements and progress</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Total Points</p>
              <p className="text-4xl font-bold mt-2">0</p>
            </div>
            <Star className="w-12 h-12 text-yellow-100" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm">Badges Earned</p>
              <p className="text-4xl font-bold mt-2">0</p>
            </div>
            <Award className="w-12 h-12 text-purple-100" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Current Level</p>
              <p className="text-4xl font-bold mt-2">1</p>
            </div>
            <TrendingUp className="w-12 h-12 text-green-100" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button className="pb-4 border-b-2 border-green-600 text-green-600 font-semibold">
            Points
          </button>
          <button className="pb-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
            Badges
          </button>
          <button className="pb-4 border-b-2 border-transparent text-gray-600 hover:text-gray-900">
            Levels
          </button>
        </nav>
      </div>

      {/* Points Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Points Breakdown */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            Points Breakdown
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Lessons Completed</span>
              <span className="font-semibold text-green-600">0 pts</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Tests Passed</span>
              <span className="font-semibold text-green-600">0 pts</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">Daily Streak</span>
              <span className="font-semibold text-green-600">0 pts</span>
            </div>
          </div>
        </div>

        {/* Level Progress */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Level Progress
          </h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Level 1</span>
                <span className="text-sm font-semibold">0 / 100 XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-green-600 h-3 rounded-full" style={{ width: "0%" }}></div>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Complete lessons and tests to earn XP and level up!
            </p>
          </div>
        </div>
      </div>

      {/* Badges - Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <Trophy className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium">No badges earned yet</p>
          <p className="text-sm mt-2">Complete challenges to unlock badges</p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Coming Soon:</strong> Full gamification system with points, badges, levels, and leaderboards.
        </p>
      </div>
    </div>
  );
}

