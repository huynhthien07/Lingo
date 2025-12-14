"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Loader2, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface Exercise {
  id: number;
  question: string;
  type: string;
  lessonTitle: string;
  unitTitle: string;
  courseTitle: string;
  difficulty: string;
  points: number;
  optionCount: number;
}

export function ExerciseList() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState("");

  useEffect(() => {
    fetchExercises();
  }, [search, page, filterType, filterDifficulty]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
        search: search,
      });

      if (filterType) params.append("type", filterType);
      if (filterDifficulty) params.append("difficulty", filterDifficulty);

      const response = await fetch(`/api/teacher/exercises?${params}`);
      const data = await response.json();

      if (data.success) {
        setExercises(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number, question: string) => {
    if (!confirm(`Are you sure you want to delete this exercise?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/exercises/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchExercises();
      } else {
        alert("Failed to delete exercise");
      }
    } catch (error) {
      console.error("Error deleting exercise:", error);
      alert("Failed to delete exercise");
    }
  };

  const difficultyColors: Record<string, string> = {
    EASY: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HARD: "bg-red-100 text-red-800",
  };

  const typeColors: Record<string, string> = {
    MULTIPLE_CHOICE: "bg-blue-100 text-blue-800",
    TRUE_FALSE: "bg-purple-100 text-purple-800",
    FILL_BLANK: "bg-pink-100 text-pink-800",
    SHORT_ANSWER: "bg-indigo-100 text-indigo-800",
    MATCHING: "bg-cyan-100 text-cyan-800",
  };

  return (
    <div className="space-y-6">
      {/* Filters and Add */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => {
            setFilterType(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Types</option>
          <option value="MULTIPLE_CHOICE">Multiple Choice</option>
          <option value="TRUE_FALSE">True/False</option>
          <option value="FILL_BLANK">Fill in Blank</option>
          <option value="SHORT_ANSWER">Short Answer</option>
          <option value="MATCHING">Matching</option>
        </select>
        <select
          value={filterDifficulty}
          onChange={(e) => {
            setFilterDifficulty(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Levels</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <Link
          href="/teacher/exercises/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
        >
          <Plus className="w-5 h-5" />
          Add Exercise
        </Link>
      </div>

      {/* Exercise Table */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No exercises found</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Question</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Level</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lesson</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Options</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {exercises.map((exercise) => (
                <tr key={exercise.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900 line-clamp-2 max-w-md">
                      {exercise.question}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeColors[exercise.type] || "bg-gray-100 text-gray-800"}`}>
                      {exercise.type.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[exercise.difficulty] || "bg-gray-100 text-gray-800"}`}>
                      {exercise.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{exercise.lessonTitle}</div>
                    <div className="text-xs text-gray-500">{exercise.courseTitle}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{exercise.points}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{exercise.optionCount}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/teacher/exercises/${exercise.id}`}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(exercise.id, exercise.question)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

