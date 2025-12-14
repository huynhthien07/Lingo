"use client";

import { useState, useEffect } from "react";
import { Search, X, Check, Loader2 } from "lucide-react";

interface Challenge {
  id: number;
  type: string;
  question: string;
  difficulty: string;
  points: number;
  lessonTitle: string;
  courseTitle: string;
  hasQuestions: boolean;
  questionCount: number;
}

interface ExerciseBankModalProps {
  testId: number;
  sectionId: number;
  skillType: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function ExerciseBankModal({
  testId,
  sectionId,
  skillType,
  onClose,
  onSuccess,
}: ExerciseBankModalProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedChallenges, setSelectedChallenges] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    fetchChallenges();
  }, [skillType]);

  const fetchChallenges = async () => {
    try {
      const response = await fetch(
        `/api/teacher/challenges?skillType=${skillType}&limit=100`
      );
      const data = await response.json();
      setChallenges(data.challenges || []);
    } catch (error) {
      console.error("Error fetching challenges:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChallenge = (challengeId: number) => {
    const newSelected = new Set(selectedChallenges);
    if (newSelected.has(challengeId)) {
      newSelected.delete(challengeId);
    } else {
      newSelected.add(challengeId);
    }
    setSelectedChallenges(newSelected);
  };

  const handleAddSelected = async () => {
    if (selectedChallenges.size === 0) {
      alert("Please select at least one exercise");
      return;
    }

    setAdding(true);

    try {
      const response = await fetch(
        `/api/teacher/tests/${testId}/sections/${sectionId}/questions/from-challenges`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            challengeIds: Array.from(selectedChallenges),
          }),
        }
      );

      if (response.ok) {
        onSuccess();
      } else {
        alert("Failed to add exercises");
      }
    } catch (error) {
      console.error("Error adding exercises:", error);
      alert("Failed to add exercises");
    } finally {
      setAdding(false);
    }
  };

  const filteredChallenges = challenges.filter((challenge) =>
    challenge.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    challenge.lessonTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    challenge.courseTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-green-100 text-green-700";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700";
      case "HARD":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Select from Exercise Bank</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search exercises..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Showing exercises for: <strong>{skillType}</strong>
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : filteredChallenges.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No exercises found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredChallenges.map((challenge) => (
                <div
                  key={challenge.id}
                  onClick={() => toggleChallenge(challenge.id)}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    selectedChallenges.has(challenge.id)
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-300"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 w-5 h-5 rounded border-2 flex items-center justify-center ${
                        selectedChallenges.has(challenge.id)
                          ? "border-blue-500 bg-blue-500"
                          : "border-gray-300"
                      }`}
                    >
                      {selectedChallenges.has(challenge.id) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-2">
                        {challenge.question}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className={`px-2 py-1 rounded ${getDifficultyColor(challenge.difficulty)}`}>
                          {challenge.difficulty}
                        </span>
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">
                          {challenge.type.replace(/_/g, " ")}
                        </span>
                        <span className="text-gray-600">
                          {challenge.courseTitle} → {challenge.lessonTitle}
                        </span>
                        <span className="text-gray-600">
                          {challenge.points} points
                        </span>
                        {challenge.hasQuestions && (
                          <span className="text-gray-600">
                            {challenge.questionCount} sub-questions
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {selectedChallenges.size} exercise(s) selected
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSelected}
                disabled={selectedChallenges.size === 0 || adding}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {adding ? "Adding..." : `Add ${selectedChallenges.size} Exercise(s)`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

