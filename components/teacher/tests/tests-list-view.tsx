"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  FileText,
  Clock,
  BookOpen,
  Trash2,
  Edit,
  Eye,
} from "lucide-react";
import Link from "next/link";

interface Test {
  id: number;
  title: string;
  description: string | null;
  imageSrc: string | null;
  testType: string;
  examType: string;
  duration: number;
  createdAt: string;
  sections: any[];
}

export function TestsListView() {
  const router = useRouter();
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [testTypeFilter, setTestTypeFilter] = useState("");
  const [examTypeFilter, setExamTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    fetchTests();
  }, [page, testTypeFilter, examTypeFilter]);

  const fetchTests = async () => {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
      });

      if (search) params.append("search", search);
      if (testTypeFilter) params.append("testType", testTypeFilter);
      if (examTypeFilter) params.append("examType", examTypeFilter);

      const response = await fetch(`/api/teacher/tests?${params}`);
      const data = await response.json();

      setTests(data.tests);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchTests();
  };

  const handleDelete = async (testId: number) => {
    if (!confirm("Are you sure you want to delete this test?")) return;

    try {
      const response = await fetch(`/api/teacher/tests/${testId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchTests();
      } else {
        alert("Failed to delete test");
      }
    } catch (error) {
      console.error("Error deleting test:", error);
      alert("Failed to delete test");
    }
  };

  const getTestTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      PRACTICE: "bg-blue-100 text-blue-800",
      MOCK_TEST: "bg-purple-100 text-purple-800",
      FULL_TEST: "bg-red-100 text-red-800",
      ADMISSION_TEST: "bg-green-100 text-green-800",
      SPEAKING_TEST: "bg-pink-100 text-pink-800",
      WRITING_TEST: "bg-indigo-100 text-indigo-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getExamTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      IELTS: "bg-indigo-100 text-indigo-800",
      TOEFL: "bg-orange-100 text-orange-800",
      TOEIC: "bg-cyan-100 text-cyan-800",
      GENERAL: "bg-gray-100 text-gray-800",
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading tests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Tests Management</h1>
          <p className="text-gray-600 mt-1">
            Create and manage admission tests and mock exams
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Create Test
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search tests..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <select
            value={testTypeFilter}
            onChange={(e) => {
              setTestTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Test Types</option>
            <option value="PRACTICE">Practice</option>
            <option value="MOCK_TEST">Mock Test</option>
            <option value="FULL_TEST">Full Test (No Speaking/Writing)</option>
            <option value="ADMISSION_TEST">Admission Test</option>
            <option value="SPEAKING_TEST">Speaking Test</option>
            <option value="WRITING_TEST">Writing Test</option>
          </select>

          <select
            value={examTypeFilter}
            onChange={(e) => {
              setExamTypeFilter(e.target.value);
              setPage(1);
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Exam Types</option>
            <option value="IELTS">IELTS</option>
            <option value="TOEFL">TOEFL</option>
            <option value="TOEIC">TOEIC</option>
            <option value="GENERAL">General</option>
          </select>

          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
        </form>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tests.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No tests found</p>
            <p className="text-gray-400 text-sm mt-2">
              Create your first test to get started
            </p>
          </div>
        ) : (
          tests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              {/* Test Image */}
              <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {test.imageSrc ? (
                  <img
                    src={test.imageSrc}
                    alt={test.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <FileText className="w-16 h-16 text-white" />
                )}
              </div>

              {/* Test Info */}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {test.title}
                  </h3>
                </div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                  {test.description || "No description"}
                </p>

                {/* Badges */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getTestTypeBadge(
                      test.testType
                    )}`}
                  >
                    {test.testType.replace("_", " ")}
                  </span>
                  <span
                    className={`px-2 py-1 text-xs font-medium rounded ${getExamTypeBadge(
                      test.examType
                    )}`}
                  >
                    {test.examType}
                  </span>
                </div>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{test.duration} min</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{test.sections?.length || 0} sections</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <Link
                    href={`/teacher/tests/${test.id}`}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(test.id)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      {/* Create Test Modal */}
      {showCreateModal && (
        <CreateTestModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            fetchTests();
          }}
        />
      )}
    </div>
  );
}

// Create Test Modal Component
function CreateTestModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    testType: "ADMISSION_TEST",
    examType: "IELTS",
    duration: 60,
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/teacher/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newTest = await response.json();
        router.push(`/teacher/tests/${newTest.id}`);
      } else {
        alert("Failed to create test");
      }
    } catch (error) {
      console.error("Error creating test:", error);
      alert("Failed to create test");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-2xl font-bold mb-4">Create New Test</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Creating..." : "Create Test"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

