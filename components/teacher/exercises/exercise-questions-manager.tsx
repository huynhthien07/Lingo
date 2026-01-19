"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, ArrowUp, ArrowDown, Save, X, Edit } from "lucide-react";
import { RichTextEditor } from "./rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import { AudioUpload } from "@/components/ui/audio-upload";
import { OptionsManager } from "./question-options-manager";
import { QuestionTypeSelector } from "../tests/question-type-selector";
import { QuestionEditor } from "../tests/question-editor";
import type { QuestionType } from "@/lib/utils/question-type-mapper";
import type { QuestionMetadata } from "@/shared/types/questionMetadata";
import { getDefaultMetadata } from "@/lib/utils/question-type-mapper";

interface Question {
  id: number;
  text: string;
  questionType?: string | null;
  metadata?: any | null;
  correctAnswer?: string | null;
  explanation?: string | null;
  imageSrc?: string | null;
  order: number;
  options: Option[];
}

interface Option {
  id: number;
  questionId: number;
  text: string;
  correct: boolean;
  imageSrc?: string | null;
  audioSrc?: string | null;
  order: number;
}

interface ExerciseQuestionsManagerProps {
  exerciseId: number;
  lessonId: number;
  exerciseType: string;
  questions: Question[];
  onUpdate: () => void;
}

export function ExerciseQuestionsManager({
  exerciseId,
  lessonId,
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
      // Create question
      const response = await fetch(`/api/teacher/exercises/${exerciseId}/questions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        alert("Failed to add question");
        return;
      }

      const result = await response.json();
      const newQuestion = result.data;

      // If question has options (SINGLE_CHOICE or MULTIPLE_CHOICE), create them
      if (questionData.options && questionData.options.length > 0) {
        for (const option of questionData.options) {
          await fetch(`/api/teacher/questions/${newQuestion.id}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: option.optionText,
              correct: option.isCorrect,
              order: option.order,
            }),
          });
        }
      }

      setShowAddQuestion(false);
      onUpdate();
    } catch (error) {
      console.error("Error adding question:", error);
      alert("Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async (questionId: number, questionData: any) => {
    setLoading(true);
    try {
      // Update question
      const response = await fetch(`/api/teacher/exercises/${exerciseId}/questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionData),
      });

      if (!response.ok) {
        alert("Failed to update question");
        return;
      }

      // If question has options, we need to delete old ones and create new ones
      // (simpler than trying to match and update each one)
      if (questionData.options && questionData.options.length > 0) {
        // Get existing options
        const existingQuestion = questions.find(q => q.id === questionId);
        if (existingQuestion && existingQuestion.options) {
          // Delete old options
          for (const option of existingQuestion.options) {
            await fetch(`/api/teacher/questions/${questionId}/options/${option.id}`, {
              method: "DELETE",
            });
          }
        }

        // Create new options
        for (const option of questionData.options) {
          await fetch(`/api/teacher/questions/${questionId}/options`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: option.optionText,
              correct: option.isCorrect,
              order: option.order,
            }),
          });
        }
      }

      setEditingQuestion(null);
      onUpdate();
    } catch (error) {
      console.error("Error updating question:", error);
      alert("Failed to update question");
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
              exerciseId={exerciseId}
              lessonId={lessonId}
              canHaveImages={canHaveImages}
              canHaveAudio={canHaveAudio}
              isEditing={editingQuestion === question.id}
              onEdit={() => setEditingQuestion(question.id)}
              onCancelEdit={() => setEditingQuestion(null)}
              onSaveEdit={(data) => handleUpdateQuestion(question.id, data)}
              onDelete={() => handleDeleteQuestion(question.id)}
              onMoveUp={() => handleMoveQuestion(question.id, "up")}
              onMoveDown={() => handleMoveQuestion(question.id, "down")}
              onUpdate={onUpdate}
              loading={loading}
            />
          ))}
        </div>
      )}

      {/* Add Question Form */}
      {showAddQuestion && (
        <AddQuestionForm
          exerciseId={exerciseId}
          lessonId={lessonId}
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
  exerciseId: number;
  lessonId: number;
  canHaveImages: boolean;
  canHaveAudio: boolean;
  isEditing: boolean;
  onEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (data: any) => Promise<void>;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpdate: () => void;
  loading: boolean;
}

function QuestionCard({
  question,
  index,
  totalQuestions,
  exerciseType,
  exerciseId,
  lessonId,
  canHaveImages,
  canHaveAudio,
  isEditing,
  onEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUpdate,
  loading,
}: QuestionCardProps) {
  const [showOptions, setShowOptions] = useState(true);

  // ✅ NEW: Use questionType if available, fallback to exerciseType
  const questionType = question.questionType;

  const isMultipleChoice = questionType === "MULTIPLE_CHOICE" || exerciseType.includes("MULTIPLE_CHOICE");
  const isSingleChoice = questionType === "SINGLE_CHOICE";
  const isTextInput = questionType === "TEXT_INPUT" || exerciseType.includes("COMPLETION") || exerciseType.includes("SHORT_ANSWER");
  const isMatching = questionType === "MATCHING";
  const isLabeling = questionType === "LABELING";
  const isOrdering = questionType === "ORDERING";

  // Determine if this question needs options
  const needsOptions = isSingleChoice || isMultipleChoice;
  const needsMetadata = isMatching || isLabeling || isOrdering;

  // Get question type label
  const getQuestionTypeLabel = () => {
    if (questionType === "SINGLE_CHOICE") return "Single Choice";
    if (questionType === "MULTIPLE_CHOICE") return "Multiple Choice";
    if (questionType === "TEXT_INPUT") return "Text Input";
    if (questionType === "MATCHING") return "Matching";
    if (questionType === "LABELING") return "Labeling";
    if (questionType === "ORDERING") return "Ordering";
    return "Legacy";
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded">
              Q{index + 1}
            </span>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
              {getQuestionTypeLabel()}
            </span>
            {needsOptions && (
              <span className="text-sm text-gray-600">
                {question.options.length} options
              </span>
            )}
          </div>
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: question.text }}
          />
          {question.correctAnswer && (
            <div className="mt-2 text-sm">
              <span className="font-medium text-green-700">Correct Answer: </span>
              <span className="text-gray-700">{question.correctAnswer}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 ml-4">
          <button
            onClick={onEdit}
            disabled={isEditing}
            className="p-1.5 text-blue-600 hover:bg-blue-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveUp}
            disabled={index === 0 || isEditing}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Up"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={index === totalQuestions - 1 || isEditing}
            className="p-1.5 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Move Down"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            disabled={isEditing}
            className="p-1.5 text-red-600 hover:bg-red-100 rounded disabled:opacity-30 disabled:cursor-not-allowed"
            title="Delete"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Options/Answers - Only show for option-based types */}
      {needsOptions && (
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
      )}

      {/* Text Input Info - Show for text input types */}
      {isTextInput && question.correctAnswer && (
        <div className="mt-3 pt-3 border-t border-gray-300">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-800 mb-1">
              ✓ Text Input Question
            </p>
            <p className="text-xs text-green-700">
              Students will type their answer. The system will compare it with: <strong>{question.correctAnswer}</strong>
            </p>
          </div>
        </div>
      )}

      {/* Metadata Info - Show for metadata-based types */}
      {needsMetadata && question.metadata && (
        <div className="mt-3 pt-3 border-t border-gray-300">
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <p className="text-sm font-medium text-purple-800 mb-1">
              ✓ {getQuestionTypeLabel()} Question
            </p>
            <p className="text-xs text-purple-700">
              This question has custom configuration stored in metadata.
            </p>
          </div>
        </div>
      )}

      {/* Edit Question Form */}
      {isEditing && (
        <EditQuestionForm
          question={question}
          exerciseId={exerciseId}
          lessonId={lessonId}
          exerciseType={exerciseType}
          canHaveImages={canHaveImages}
          onSave={onSaveEdit}
          onCancel={onCancelEdit}
          loading={loading}
        />
      )}
    </div>
  );
}

// Add Question Form Component
interface AddQuestionFormProps {
  exerciseId: number;
  lessonId: number;
  exerciseType: string;
  canHaveImages: boolean;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

function AddQuestionForm({
  exerciseId,
  lessonId,
  exerciseType,
  canHaveImages,
  onSave,
  onCancel,
  loading,
}: AddQuestionFormProps) {
  const [formData, setFormData] = useState({
    text: "",
    imageSrc: "",
    correctAnswer: "",
    explanation: "",
  });

  // ✅ NEW: Support all question types
  const [questionType, setQuestionType] = useState<QuestionType | null>(null);
  const [metadata, setMetadata] = useState<QuestionMetadata | null>(null);
  const [options, setOptions] = useState<Array<{ id: number; optionText: string; isCorrect: boolean; order: number }>>([]);

  // Determine what inputs are needed based on questionType
  const needsOptions =
    questionType === "SINGLE_CHOICE" ||
    questionType === "MULTIPLE_CHOICE";

  const needsTextAnswer = questionType === "TEXT_INPUT";

  const needsMetadata =
    questionType === "MATCHING" ||
    questionType === "LABELING" ||
    questionType === "ORDERING";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.text.trim()) {
      alert("Please enter question text");
      return;
    }

    if (!questionType) {
      alert("Please select a question type");
      return;
    }

    // Validate based on question type
    if (needsOptions && options.length === 0) {
      alert("Please add at least one answer option");
      return;
    }

    if (needsOptions && options.some((opt) => !opt.optionText.trim())) {
      alert("All options must have text");
      return;
    }

    if (needsOptions && !options.some((opt) => opt.isCorrect)) {
      alert("At least one option must be marked as correct");
      return;
    }

    if (needsTextAnswer && !formData.correctAnswer.trim()) {
      alert("Please enter the correct answer");
      return;
    }

    if (needsMetadata && !metadata) {
      alert("Please configure the question settings");
      return;
    }

    // Prepare data to send
    const dataToSend: any = {
      text: formData.text,
      imageSrc: formData.imageSrc || null,
      explanation: formData.explanation || null,
      questionType,
      metadata: needsMetadata ? metadata : null,
      correctAnswer: needsTextAnswer ? formData.correctAnswer : null,
      options: needsOptions ? options.map((opt, idx) => ({
        optionText: opt.optionText,
        isCorrect: opt.isCorrect,
        order: idx + 1,
      })) : undefined,
    };

    await onSave(dataToSend);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-xl font-semibold">Add Question</h3>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Question Type Selector */}
          <QuestionTypeSelector
            selectedType={questionType}
            onSelect={(type) => {
              setQuestionType(type);

              // Initialize metadata for metadata-based question types
              if (type === "MATCHING" || type === "LABELING" || type === "ORDERING") {
                setMetadata(getDefaultMetadata(type));
              } else {
                setMetadata(null);
              }

              // Auto-create 2 default options for choice-based questions
              if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
                setOptions([
                  { id: 1, optionText: "", isCorrect: false, order: 1 },
                  { id: 2, optionText: "", isCorrect: false, order: 2 },
                ]);
              } else {
                setOptions([]);
              }
            }}
          />

          {/* Question Text */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Text *
            </label>
            <RichTextEditor
              value={formData.text}
              onChange={(value) => setFormData({ ...formData, text: value })}
            />
          </div>

          {/* Image Upload */}
          {canHaveImages && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question Image (Optional)
              </label>
              <ImageUpload
                value={formData.imageSrc}
                onChange={(url) => setFormData({ ...formData, imageSrc: url })}
              />
            </div>
          )}

          {/* Question Editor - Shows different UI based on question type */}
          {questionType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer Configuration *
              </label>
              <QuestionEditor
                questionType={questionType}
                options={options}
                onOptionsChange={setOptions}
                correctAnswer={formData.correctAnswer}
                onCorrectAnswerChange={(answer) =>
                  setFormData({ ...formData, correctAnswer: answer })
                }
                metadata={metadata}
                onMetadataChange={setMetadata}
                challengeId={exerciseId}
              />
            </div>
          )}

          {/* Explanation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Explanation (Optional)
            </label>
            <textarea
              value={formData.explanation}
              onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Explain why this is the correct answer"
            />
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

// Edit Question Form Component
interface EditQuestionFormProps {
  question: Question;
  exerciseId: number;
  lessonId: number;
  exerciseType: string;
  canHaveImages: boolean;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}

function EditQuestionForm({
  question,
  exerciseId,
  lessonId,
  exerciseType,
  canHaveImages,
  onSave,
  onCancel,
  loading,
}: EditQuestionFormProps) {
  const [formData, setFormData] = useState({
    text: question.text,
    imageSrc: question.imageSrc || "",
    correctAnswer: question.correctAnswer || "",
    explanation: question.explanation || "",
  });

  const [questionType, setQuestionType] = useState<QuestionType | null>(
    question.questionType as QuestionType | null
  );
  const [metadata, setMetadata] = useState<QuestionMetadata | null>(
    question.metadata as QuestionMetadata | null
  );
  const [options, setOptions] = useState<Array<{ id: number; optionText: string; isCorrect: boolean; order: number }>>(
    question.options.map((opt, idx) => ({
      id: opt.id,
      optionText: opt.text,
      isCorrect: opt.correct,
      order: opt.order || idx + 1,
    }))
  );

  const needsOptions = questionType === "SINGLE_CHOICE" || questionType === "MULTIPLE_CHOICE";
  const needsTextAnswer = questionType === "TEXT_INPUT";
  const needsMetadata = questionType === "MATCHING" || questionType === "LABELING" || questionType === "ORDERING";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!questionType) {
      alert("Please select a question type");
      return;
    }

    if (needsOptions && options.length === 0) {
      alert("Please add at least one answer option");
      return;
    }

    if (needsMetadata && !metadata) {
      alert("Please configure the question settings");
      return;
    }

    if (needsTextAnswer && !formData.correctAnswer.trim()) {
      alert("Please enter the correct answer");
      return;
    }

    const dataToSend: any = {
      text: formData.text,
      questionType,
      metadata: needsMetadata ? metadata : null,
      correctAnswer: needsTextAnswer ? formData.correctAnswer : null,
      imageSrc: formData.imageSrc || null,
      explanation: formData.explanation || null,
      options: needsOptions
        ? options.map((opt, idx) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            order: idx + 1,
          }))
        : undefined,
    };

    await onSave(dataToSend);
  };

  return (
    <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-blue-900">Edit Question</h4>
        <button
          onClick={onCancel}
          className="p-1 text-gray-600 hover:bg-gray-200 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Question Type Selector */}
        <QuestionTypeSelector
          selectedType={questionType}
          onSelect={(type) => {
            setQuestionType(type);

            // Initialize metadata for metadata-based question types
            if (type === "MATCHING" || type === "LABELING" || type === "ORDERING") {
              setMetadata(getDefaultMetadata(type));
            } else {
              setMetadata(null);
            }

            // Auto-create 2 default options for choice-based questions
            if (type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE") {
              setOptions([
                { id: 1, optionText: "", isCorrect: false, order: 1 },
                { id: 2, optionText: "", isCorrect: false, order: 2 },
              ]);
            } else {
              setOptions([]);
            }
          }}
        />

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Question Text *
          </label>
          <RichTextEditor
            value={formData.text}
            onChange={(value) => setFormData({ ...formData, text: value })}
          />
        </div>

        {/* Question Editor (Options/Text Answer/Metadata) */}
        {questionType && (
          <QuestionEditor
            questionType={questionType}
            options={options}
            onOptionsChange={setOptions}
            correctAnswer={formData.correctAnswer}
            onCorrectAnswerChange={(answer) =>
              setFormData({ ...formData, correctAnswer: answer })
            }
            metadata={metadata}
            onMetadataChange={setMetadata}
            challengeId={exerciseId}
          />
        )}

        {/* Image Upload */}
        {canHaveImages && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Question Image (Optional)
            </label>
            <ImageUpload
              value={formData.imageSrc}
              onChange={(url) => setFormData({ ...formData, imageSrc: url })}
            />
          </div>
        )}

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Explanation (Optional)
          </label>
          <textarea
            value={formData.explanation}
            onChange={(e) => setFormData({ ...formData, explanation: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            placeholder="Explain why this is the correct answer"
          />
        </div>

        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Updating..." : "Update Question"}
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
  );
}

