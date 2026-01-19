"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { AudioUpload } from "@/components/ui/audio-upload";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "../exercises/rich-text-editor";
import { QuestionTypeSelector } from "./question-type-selector";
import { QuestionEditor } from "./question-editor";
import { QuestionType, getDefaultMetadata } from "@/lib/utils/question-type-mapper";
import type { QuestionMetadata } from "@/shared/types/questionMetadata";

interface TestQuestion {
  id: number;
  sectionId: number;
  questionText: string;
  questionType?: QuestionType | null;
  metadata?: QuestionMetadata | null;
  passage: string | null;
  audioSrc: string | null;
  imageSrc: string | null;
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

interface QuestionFormModalProps {
  testId: number;
  sectionId: number;
  question: TestQuestion;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuestionFormModal({
  testId,
  sectionId,
  question,
  onClose,
  onSuccess,
}: QuestionFormModalProps) {
  const isNew = question.id === 0;

  const [formData, setFormData] = useState({
    questionText: question.questionText,
    passage: question.passage || "",
    audioSrc: question.audioSrc || "",
    imageSrc: question.imageSrc || "",
    points: question.points,
    explanation: question.explanation || "",
  });

  const [questionType, setQuestionType] = useState<QuestionType | null>(
    question.questionType || null
  );

  const [metadata, setMetadata] = useState<QuestionMetadata | null>(
    question.metadata || null
  );

  const [correctAnswer, setCorrectAnswer] = useState<string>("");

  const [options, setOptions] = useState<TestQuestionOption[]>(
    question.options?.map((opt, idx) => ({
      id: opt.id || idx,
      questionId: question.id,
      optionText: opt.optionText,
      isCorrect: opt.isCorrect,
      order: opt.order || idx + 1,
    })) || []
  );

  const [saving, setSaving] = useState(false);



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.questionText.trim()) {
      alert("Question text is required");
      return;
    }

    if (!questionType) {
      alert("Please select a question type");
      return;
    }

    // Validate based on question type
    const needsOptions =
      questionType === "SINGLE_CHOICE" ||
      questionType === "MULTIPLE_CHOICE";

    if (needsOptions && options.length === 0) {
      alert("Please add at least one answer option");
      return;
    }

    if (needsOptions && options.some((opt) => !opt.optionText.trim())) {
      alert("All options must have text");
      return;
    }

    if (needsOptions && !options.some((opt) => opt.isCorrect)) {
      alert("Please mark at least one option as correct");
      return;
    }

    const needsTextAnswer = questionType === "TEXT_INPUT";

    if (needsTextAnswer && !correctAnswer.trim()) {
      alert("Please provide a correct answer");
      return;
    }

    const needsMetadata =
      questionType === "MATCHING" ||
      questionType === "LABELING" ||
      questionType === "ORDERING";

    if (needsMetadata && !metadata) {
      alert("Please configure the question metadata");
      return;
    }

    setSaving(true);

    try {
      const url = isNew
        ? `/api/teacher/tests/${testId}/sections/${sectionId}/questions`
        : `/api/teacher/tests/${testId}/sections/${sectionId}/questions/${question.id}`;

      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          questionType,
          metadata,
          correctAnswer: needsTextAnswer ? correctAnswer : undefined,
          options: needsOptions ? options.map((opt, idx) => ({
            optionText: opt.optionText,
            isCorrect: opt.isCorrect,
            order: idx + 1,
          })) : undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        alert(`Failed to save question: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving question:", error);
      alert("Failed to save question");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {isNew ? "Create New Question" : "Edit Question"}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Question Type Selector */}
          {!questionType && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Question Type *
              </label>
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
                      { id: 1, questionId: question.id, optionText: "", isCorrect: false, order: 1 },
                      { id: 2, questionId: question.id, optionText: "", isCorrect: false, order: 2 },
                    ]);
                  } else {
                    setOptions([]);
                  }
                }}
              />
            </div>
          )}

          {questionType && (
            <>
              {/* Selected Type Badge */}
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="text-sm font-medium text-blue-900">
                  Question Type: <strong>{questionType.replace(/_/g, " ")}</strong>
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm("Are you sure you want to change the question type? This will reset all answers.")) {
                      setQuestionType(null);
                      setOptions([]);
                      setMetadata(null);
                      setCorrectAnswer("");
                    }
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Change Type
                </button>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Question Text *
                </label>
                <RichTextEditor
                  value={formData.questionText}
                  onChange={(value) =>
                    setFormData({ ...formData, questionText: value })
                  }
                />
              </div>

              {/* Audio (for Listening) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audio (Optional - for Listening questions)
                </label>
                <AudioUpload
                  value={formData.audioSrc}
                  onChange={(url) => setFormData({ ...formData, audioSrc: url })}
                />
              </div>

              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image (Optional - for questions with diagrams, charts, etc.)
                </label>
                <ImageUpload
                  value={formData.imageSrc}
                  onChange={(url) => setFormData({ ...formData, imageSrc: url })}
                />
              </div>

              {/* Points */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Points *
                </label>
                <input
                  type="number"
                  value={formData.points}
                  onChange={(e) =>
                    setFormData({ ...formData, points: parseInt(e.target.value) })
                  }
                  min="1"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Question Editor */}
              <div className="border-t border-gray-200 pt-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Answer Configuration *
                </label>
                <QuestionEditor
                  questionType={questionType}
                  options={options}
                  onOptionsChange={(newOptions) => {
                    setOptions(newOptions.map((opt, idx) => ({
                      ...opt,
                      questionId: question.id,
                      order: opt.order || idx + 1,
                    })));
                  }}
                  metadata={metadata}
                  onMetadataChange={setMetadata}
                  correctAnswer={correctAnswer}
                  onCorrectAnswerChange={setCorrectAnswer}
                  testId={testId}
                />
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Explanation (Optional)
                </label>
                <textarea
                  value={formData.explanation}
                  onChange={(e) =>
                    setFormData({ ...formData, explanation: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Explain why this is the correct answer"
                />
              </div>
            </>
          )}



          {/* Actions */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
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
              {saving ? "Saving..." : isNew ? "Create Question" : "Update Question"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

