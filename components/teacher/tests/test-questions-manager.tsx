"use client";

import { useState } from "react";
import { Plus, Trash2, Edit, FileText, Database } from "lucide-react";
import { QuestionType } from "@/lib/utils/question-type-mapper";
import type { QuestionMetadata } from "@/shared/types/questionMetadata";

interface TestSection {
  id: number;
  testId: number;
  title: string;
  skillType: string;
  order: number;
  duration: number | null;
  passage: string | null;
  imageSrc: string | null;
  audioSrc: string | null;
  questions: TestQuestion[];
}

interface TestQuestion {
  id: number;
  sectionId: number;
  questionText: string;
  questionType?: QuestionType | null;
  metadata?: QuestionMetadata | null;
  passage: string | null;
  imageSrc: string | null;
  audioSrc: string | null;
  correctAnswer?: string | null;
  explanation?: string | null;
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
  const [showCreateModal, setShowCreateModal] = useState(false);
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
                    questionType: null,
                    metadata: null,
                    passage: null,
                    imageSrc: null,
                    audioSrc: null,
                    correctAnswer: null,
                    explanation: null,
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
          {section.questions.map((question, index) => {
            const getQuestionTypeLabel = () => {
              if (question.questionType === "SINGLE_CHOICE") return "Single Choice";
              if (question.questionType === "MULTIPLE_CHOICE") return "Multiple Choice";
              if (question.questionType === "TEXT_INPUT") return "Text Input";
              if (question.questionType === "MATCHING") return "Matching";
              if (question.questionType === "LABELING") return "Labeling";
              if (question.questionType === "ORDERING") return "Ordering";
              return "Standard";
            };

            return (
              <div
                key={question.id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
                        Q{index + 1}
                      </span>
                      {question.questionType && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                          {getQuestionTypeLabel()}
                        </span>
                      )}
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded">
                        {question.points} {question.points === 1 ? "point" : "points"}
                      </span>
                    </div>
                    <div
                      className="prose prose-sm max-w-none text-gray-900"
                      dangerouslySetInnerHTML={{ __html: question.questionText }}
                    />

                    {/* Correct Answer for TEXT_INPUT */}
                    {question.correctAnswer && (
                      <div className="mt-2 text-sm">
                        <span className="font-medium text-green-700">Correct Answer: </span>
                        <span className="text-gray-700">{question.correctAnswer}</span>
                      </div>
                    )}

                    {/* Options for SINGLE_CHOICE/MULTIPLE_CHOICE */}
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

                    {/* Metadata Info */}
                    {question.metadata && (
                      <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                        <p className="text-sm font-medium text-purple-800">
                          ✓ {getQuestionTypeLabel()} Question
                        </p>
                        <p className="text-xs text-purple-700">
                          This question has custom configuration.
                        </p>
                      </div>
                    )}

                    {/* Explanation */}
                    {question.explanation && (
                      <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                        <p className="text-xs font-medium text-gray-700 mb-1">Explanation:</p>
                        <p className="text-sm text-gray-600">{question.explanation}</p>
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
            );
          })}
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

