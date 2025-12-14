"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, FileText, Database } from "lucide-react";

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

interface TestQuestionsManagerProps {
  testId: number;
  section: TestSection;
  onUpdate: () => void;
}

export function TestQuestionsManager({
  testId,
  section,
  onUpdate,
}: TestQuestionsManagerProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showExerciseBankModal, setShowExerciseBankModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<TestQuestion | null>(null);

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this question?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/teacher/tests/${testId}/sections/${section.id}/questions/${questionId}`,
        { method: "DELETE" }
      );

      if (response.ok) {
        onUpdate();
      } else {
        alert("Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Questions</h3>
        <div className="relative">
          <button
            onClick={() => setShowAddMenu(!showAddMenu)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Question
          </button>

          {/* Dropdown Menu */}
          {showAddMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
              <button
                onClick={() => {
                  setShowExerciseBankModal(true);
                  setShowAddMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
              >
                <Database className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="font-medium text-gray-900">From Exercise Bank</div>
                  <div className="text-xs text-gray-500">Select existing exercises</div>
                </div>
              </button>
              <button
                onClick={() => {
                  setEditingQuestion({
                    id: 0,
                    sectionId: section.id,
                    questionText: "",
                    passage: null,
                    audioSrc: null,
                    order: (section.questions?.length || 0) + 1,
                    points: 1,
                    options: [],
                  });
                  setShowAddMenu(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left border-t border-gray-200"
              >
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <div className="font-medium text-gray-900">Create New Question</div>
                  <div className="text-xs text-gray-500">Build from scratch</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Questions List */}
      {!section.questions || section.questions.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">No questions added yet</p>
          <p className="text-gray-400 text-xs mt-1">
            Add questions from exercise bank or create new ones
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {section.questions.map((question, index) => (
            <div
              key={question.id}
              className="bg-white rounded-lg border border-gray-200 p-4"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-gray-500">
                      Q{index + 1}
                    </span>
                    <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                      {question.points} {question.points === 1 ? "point" : "points"}
                    </span>
                  </div>
                  <p className="text-gray-900">{question.questionText}</p>
                  {question.options && question.options.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {question.options.map((option) => (
                        <div
                          key={option.id}
                          className={`text-sm px-3 py-2 rounded ${
                            option.isCorrect
                              ? "bg-green-50 text-green-700 font-medium"
                              : "bg-gray-50 text-gray-600"
                          }`}
                        >
                          {option.optionText}
                          {option.isCorrect && " ✓"}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => setEditingQuestion(question)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteQuestion(question.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Exercise Bank Modal */}
      {showExerciseBankModal && (
        <ExerciseBankModal
          testId={testId}
          sectionId={section.id}
          skillType={section.skillType}
          onClose={() => setShowExerciseBankModal(false)}
          onSuccess={() => {
            setShowExerciseBankModal(false);
            onUpdate();
          }}
        />
      )}

      {/* Question Form Modal */}
      {editingQuestion && (
        <QuestionFormModal
          testId={testId}
          sectionId={section.id}
          question={editingQuestion}
          onClose={() => setEditingQuestion(null)}
          onSuccess={() => {
            setEditingQuestion(null);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}

// Import modals (will be created next)
import { ExerciseBankModal } from "./exercise-bank-modal";
import { QuestionFormModal } from "./question-form-modal";

