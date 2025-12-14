"use client";

import { FileCheck, Clock, Target, Award } from "lucide-react";

export function AdmissionTestView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admission Test</h1>
        <p className="text-gray-600 mt-2">Take the placement test to assess your IELTS level</p>
      </div>

      {/* Test Info Card */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">IELTS Placement Test</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6" />
            <div>
              <p className="text-sm text-blue-100">Duration</p>
              <p className="font-semibold">60 minutes</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Target className="w-6 h-6" />
            <div>
              <p className="text-sm text-blue-100">Questions</p>
              <p className="font-semibold">40 questions</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-6 h-6" />
            <div>
              <p className="text-sm text-blue-100">Band Score</p>
              <p className="font-semibold">1.0 - 9.0</p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-2">Listening</h3>
          <p className="text-gray-600 text-sm mb-4">10 questions • 15 minutes</p>
          <p className="text-gray-700">Test your listening comprehension skills</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-2">Reading</h3>
          <p className="text-gray-600 text-sm mb-4">10 questions • 20 minutes</p>
          <p className="text-gray-700">Assess your reading comprehension abilities</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-2">Writing</h3>
          <p className="text-gray-600 text-sm mb-4">2 tasks • 15 minutes</p>
          <p className="text-gray-700">Evaluate your writing skills</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-2">Speaking</h3>
          <p className="text-gray-600 text-sm mb-4">3 parts • 10 minutes</p>
          <p className="text-gray-700">Measure your speaking proficiency</p>
        </div>
      </div>

      {/* Start Test Button */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
        <button className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold">
          Start Admission Test
        </button>
        <p className="text-sm text-gray-600 mt-4">
          Make sure you have a stable internet connection and 60 minutes of uninterrupted time
        </p>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Coming Soon:</strong> Admission test functionality and result page.
        </p>
      </div>
    </div>
  );
}

