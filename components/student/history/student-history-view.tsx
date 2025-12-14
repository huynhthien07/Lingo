"use client";

import { History, Filter, Search } from "lucide-react";

export function StudentHistoryView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Learning History</h1>
        <p className="text-gray-600 mt-2">View your graded assignments and feedback from teachers</p>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search submissions..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
        <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
          <Filter className="w-5 h-5" />
          Filter
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Total Submissions</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Graded</p>
          <p className="text-3xl font-bold text-green-600 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Pending</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">0</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <p className="text-gray-600 text-sm">Average Score</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">-</p>
        </div>
      </div>

      {/* Submissions List - Placeholder */}
      <div className="bg-white rounded-lg border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center text-gray-500">
          <History className="w-16 h-16 mb-4 text-gray-400" />
          <p className="text-lg font-medium">No submissions yet</p>
          <p className="text-sm mt-2">Complete assignments to see your graded work here</p>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Coming Soon:</strong> View graded assignments, teacher feedback, and submission history.
        </p>
      </div>
    </div>
  );
}

