"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  Clock,
  BookOpen,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { ImageUpload } from "@/components/ui/image-upload";
import { TestSectionsManager } from "./test-sections-manager";

interface Test {
  id: number;
  title: string;
  description: string | null;
  imageSrc: string | null;
  testType: string;
  examType: string;
  duration: number;
  createdAt: string;
  sections: TestSection[];
}

interface TestSection {
  id: number;
  testId: number;
  title: string;
  skillType: string;
  order: number;
  duration: number | null;
  questions: TestQuestion[];
}

interface TestQuestion {
  id: number;
  sectionId: number;
  questionText: string;
  passage: string | null;
  audioSrc: string | null;
  order: number;
  points: number;
  options: TestQuestionOption[];
}

interface TestQuestionOption {
  id: number;
  questionId: number;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

export function TestDetailView({ testId }: { testId: number }) {
  const router = useRouter();
  const [test, setTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "sections">("info");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageSrc: "",
    testType: "ADMISSION_TEST",
    examType: "IELTS",
    duration: 60,
  });

  useEffect(() => {
    fetchTest();
  }, [testId]);

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/teacher/tests/${testId}`);
      const data = await response.json();
      setTest(data);

      setFormData({
        title: data.title,
        description: data.description || "",
        imageSrc: data.imageSrc || "",
        testType: data.testType,
        examType: data.examType,
        duration: data.duration,
      });
    } catch (error) {
      console.error("Error fetching test:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/teacher/tests/${testId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Test updated successfully!");
        fetchTest();
      } else {
        alert("Failed to update test");
      }
    } catch (error) {
      console.error("Error updating test:", error);
      alert("Failed to update test");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading test...</p>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Test not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/teacher/tests"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{test.title}</h1>
            <p className="text-gray-600 mt-1">Edit test details and manage sections</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          <button
            onClick={() => setActiveTab("info")}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "info"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Test Information
          </button>
          <button
            onClick={() => setActiveTab("sections")}
            className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
              activeTab === "sections"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            Sections & Questions ({test.sections?.length || 0})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "info" && (
        <form onSubmit={handleSaveInfo} className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-6">Test Information</h2>

          <div className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Test Image
              </label>
              <ImageUpload
                value={formData.imageSrc}
                onChange={(url) => setFormData({ ...formData, imageSrc: url })}
              />
            </div>

            {/* Test Type and Exam Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Test Type *
                </label>
                <select
                  value={formData.testType}
                  onChange={(e) =>
                    setFormData({ ...formData, testType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="PRACTICE">Practice</option>
                  <option value="MOCK_TEST">Mock Test</option>
                  <option value="FULL_TEST">Full Test (No Speaking/Writing)</option>
                  <option value="ADMISSION_TEST">Admission Test</option>
                  <option value="SPEAKING_TEST">Speaking Test</option>
                  <option value="WRITING_TEST">Writing Test</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Type *
                </label>
                <select
                  value={formData.examType}
                  onChange={(e) =>
                    setFormData({ ...formData, examType: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="IELTS">IELTS</option>
                  <option value="TOEFL">TOEFL</option>
                  <option value="TOEIC">TOEIC</option>
                  <option value="GENERAL">General</option>
                </select>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes) *
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: parseInt(e.target.value) })
                }
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Save Button */}
            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      )}

      {activeTab === "sections" && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <TestSectionsManager
            testId={testId}
            sections={test.sections || []}
            onUpdate={fetchTest}
          />
        </div>
      )}
    </div>
  );
}

