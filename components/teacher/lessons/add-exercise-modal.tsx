"use client";

import { useState } from "react";
import { X, Plus, Loader2 } from "lucide-react";

interface AddExerciseModalProps {
  lessonId: number;
  onClose: () => void;
  onSuccess: () => void;
}

// IELTS Challenge Types grouped by skill
const CHALLENGE_TYPES = {
  LISTENING: [
    { value: "LISTENING_MULTIPLE_CHOICE", label: "Multiple Choice" },
    { value: "LISTENING_FORM_COMPLETION", label: "Form Completion" },
    { value: "LISTENING_MAP_LABELLING", label: "Map Labelling" },
    { value: "LISTENING_SHORT_ANSWER", label: "Short Answer" },
  ],
  READING: [
    { value: "READING_MULTIPLE_CHOICE", label: "Multiple Choice" },
    { value: "READING_TRUE_FALSE_NOT_GIVEN", label: "True/False/Not Given" },
    { value: "READING_MATCHING_HEADINGS", label: "Matching Headings" },
    { value: "READING_SENTENCE_COMPLETION", label: "Sentence Completion" },
    { value: "READING_SUMMARY_COMPLETION", label: "Summary Completion" },
  ],
  WRITING: [
    { value: "WRITING_TASK_1", label: "Task 1 (Describe Visual)" },
    { value: "WRITING_TASK_2", label: "Task 2 (Essay)" },
    { value: "WRITING_PRACTICE", label: "Practice" },
  ],
  SPEAKING: [
    { value: "SPEAKING_PART_1", label: "Part 1 (Interview)" },
    { value: "SPEAKING_PART_2", label: "Part 2 (Long Turn)" },
    { value: "SPEAKING_PART_3", label: "Part 3 (Discussion)" },
  ],
};

export function AddExerciseModal({ lessonId, onClose, onSuccess }: AddExerciseModalProps) {
  const [creating, setCreating] = useState(false);
  const [skillCategory, setSkillCategory] = useState("LISTENING");
  const [formData, setFormData] = useState({
    question: "",
    type: "LISTENING_MULTIPLE_CHOICE",
    difficulty: "MEDIUM",
    points: 10,
  });

  const handleSkillCategoryChange = (category: string) => {
    setSkillCategory(category);
    // Set first type of the category
    const firstType = CHALLENGE_TYPES[category as keyof typeof CHALLENGE_TYPES][0].value;
    setFormData({ ...formData, type: firstType });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const response = await fetch("/api/teacher/exercises", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          lessonId,
        }),
      });

      if (response.ok) {
        alert("Exercise created successfully!");
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to create exercise");
      }
    } catch (error) {
      console.error("Error creating exercise:", error);
      alert("Failed to create exercise");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">Create New Exercise</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleCreate} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question *
            </label>
            <textarea
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the exercise question..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Skill Category *
              </label>
              <select
                value={skillCategory}
                onChange={(e) => handleSkillCategoryChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="LISTENING">Listening</option>
                <option value="READING">Reading</option>
                <option value="WRITING">Writing</option>
                <option value="SPEAKING">Speaking</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exercise Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {CHALLENGE_TYPES[skillCategory as keyof typeof CHALLENGE_TYPES].map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty *
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Points *
              </label>
              <input
                type="number"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {creating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  Create Exercise
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

