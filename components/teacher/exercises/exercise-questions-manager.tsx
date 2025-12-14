"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Save, X } from "lucide-react";
import { RichTextEditor } from "./rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import { AudioUpload } from "@/components/ui/audio-upload";
import { OptionsManager } from "./question-options-manager";

interface Question {
  id: number;
  text: string;
  order: number;
  options: Option[];
}

interface Option {
  id: number;
  questionId: number;
  text: string;
  correct: boolean;
  imageSrc?: string;
  audioSrc?: string;
  order: number;
}

interface ExerciseQuestionsManagerProps {
  exerciseId: number;
  exerciseType: string;
  questions: Question[];
  onUpdate: () => void;
}

export function ExerciseQuestionsManager({
  exerciseId,
  exerciseType,
  questions: initialQuestions,
  onUpdate,
}: ExerciseQuestionsManagerProps) {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  // Determine exercise format
  const isMultipleChoice = exerciseType.includes("MULTIPLE_CHOICE");
  const isFillInBlank = exerciseType.includes("COMPLETION") || exerciseType.includes("SHORT_ANSWER") || exerciseType.includes("FORM_COMPLETION");
  const isTrueFalse = exerciseType.includes("TRUE_FALSE");
  const isMatching = exerciseType.includes("MATCHING");
  const isListening = exerciseType.includes("LISTENING");

  const canHaveImages = isMultipleChoice;
  const canHaveAudio = isListening || isMultipleChoice;

  useEffect(() => {
    setQuestions(initialQuestions);
  }, [initialQuestions]);

  const handleAddQuestion = () => {
    setShowAddQuestion(true);
  };

  const handleSaveQuestion = async (questionData: any) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/exercises/${exerciseId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });

      if (response.ok) {
        setShowAddQuestion(false);
        onUpdate();
      } else {
        alert("Failed to add question");
      }
    } catch (error) {
      console.error("Error adding question:", error);
      alert("Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    if (!confirm("Are you sure you want to delete this question?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/exercises/${exerciseId}/questions/${questionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert("Failed to delete question");
      }
    } catch (error) {
      console.error("Error deleting question:", error);
      alert("Failed to delete question");
    } finally {
      setLoading(false);
    }
  };

  const handleMoveQuestion = async (questionId: number, direction: "up" | "down") => {
    const currentIndex = questions.findIndex((q) => q.id === questionId);
    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === questions.length - 1) return;

    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const currentQuestion = questions[currentIndex];
    const targetQuestion = questions[targetIndex];

    setLoading(true);
    try {
      await fetch(`/api/teacher/exercises/${exerciseId}/questions/${currentQuestion.id}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOrder: targetQuestion.order }),
      });

      await fetch(`/api/teacher/exercises/${exerciseId}/questions/${targetQuestion.id}/reorder`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newOrder: currentQuestion.order }),
      });

      onUpdate();
    } catch (error) {
      console.error("Error reordering questions:", error);
      alert("Failed to reorder questions");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold">
          Questions ({questions.length})
        </h4>
        <button
          onClick={handleAddQuestion}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Question
        </button>
      </div>

      {/* Questions List */}
      {questions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No questions yet. Click "Add Question" to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              totalQuestions={questions.length}
              exerciseType={exerciseType}
              canHaveImages={canHaveImages}
              canHaveAudio={canHaveAudio}
              onDelete={() => handleDeleteQuestion(question.id)}
              onMoveUp={() => handleMoveQuestion(question.id, "up")}
              onMoveDown={() => handleMoveQuestion(question.id, "down")}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}

      {/* Add Question Form */}
      {showAddQuestion && (
        <AddQuestionForm
          exerciseId={exerciseId}
          exerciseType={exerciseType}
          canHaveImages={canHaveImages}
          onSave={handleSaveQuestion}
          onCancel={() => setShowAddQuestion(false)}
          loading={loading}
        />
      )}
    </div>
  );
}

// Question Card Component
interface QuestionCardProps {
  question: Question;
  index: number;
  totalQuestions: number;
  exerciseType: string;
  canHaveImages: boolean;
  canHaveAudio: boolean;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdate: () => void;
}

function QuestionCard({
  question,
  index,
  totalQuestions,
  exerciseType,
  canHaveImages,
  canHaveAudio,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUpdate,
}: QuestionCardProps) {
  const [showOptions, setShowOptions] = useState(true);

  const isMultipleChoice = exerciseType.includes("MULTIPLE_CHOICE");
  const isFillInBlank = exerciseType.includes("COMPLETION") || exerciseType.includes("SHORT_ANSWER");

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
              Q{index + 1}
            </span>
            <span className="text-sm text-gray-600">
              {question.options.length} {isMultipleChoice ? "options" : "answers"}
            </span>
          </div>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: question.text }}
          />
        </div>

        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={onMoveUp}
            disabled={index === 0}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === totalQuestions - 1}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Options/Answers */}
      <div className="mt-3 pt-3 border-t border-gray-300">
        <button
          onClick={() => setShowOptions(!showOptions)}
          className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-2"
        >
          {showOptions ? "Hide" : "Show"} {isMultipleChoice ? "Options" : "Answers"} ({question.options.length})
        </button>

        {showOptions && (
          <OptionsManager
            questionId={question.id}
            options={question.options}
            exerciseType={exerciseType}
            canHaveImages={canHaveImages}
            canHaveAudio={canHaveAudio}
            onUpdate={onUpdate}
          />
        )}
      </div>
    </div>
  );
}

// Add Question Form Component
interface AddQuestionFormProps {
  exerciseId: number;
  exerciseType: string;
  canHaveImages: boolean;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

function AddQuestionForm({
  exerciseId,
  exerciseType,
  canHaveImages,
  onSave,
  onCancel,
  loading,
}: AddQuestionFormProps) {
  const [formData, setFormData] = useState({
    text: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) {
      alert("Please enter question text");
      return;
    }
    await onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">Add Question</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <RichTextEditor
              value={formData.text}
              onChange={(value) => setFormData({ ...formData, text: value })}
            />
            <p className="text-xs text-gray-500 mt-1">
              {exerciseType.includes("COMPLETION") || exerciseType.includes("SHORT_ANSWER")
                ? "Use ___ (three underscores) to mark blanks"
                : "Enter the question text"}
            </p>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save Question"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

