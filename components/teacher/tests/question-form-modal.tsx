"use client";

import { useState } from "react";
import { X, Plus, Trash2, Check, List } from "lucide-react";
import { AudioUpload } from "@/components/ui/audio-upload";
import { ImageUpload } from "@/components/ui/image-upload";
import { RichTextEditor } from "../exercises/rich-text-editor";

interface TestQuestion {
  id: number;
  sectionId: number;
  questionText: string;
  passage: string | null;
  audioSrc: string | null;
  imageSrc: string | null;
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
  });

  const [options, setOptions] = useState<Array<{ text: string; isCorrect: boolean }>>(
    question.options?.map((opt) => ({ text: opt.optionText, isCorrect: opt.isCorrect })) || []
  );

  const [saving, setSaving] = useState(false);
  const [hasSubQuestions, setHasSubQuestions] = useState(
    question.options && question.options.length > 0
  );

  const handleAddOption = () => {
    setOptions([...options, { text: "", isCorrect: false }]);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length <= 2) {
      alert("A question must have at least 2 options");
      return;
    }
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleOptionChange = (index: number, field: "text" | "isCorrect", value: string | boolean) => {
    const newOptions = [...options];
    if (field === "isCorrect" && value === true) {
      // Uncheck all other options
      newOptions.forEach((opt, i) => {
        opt.isCorrect = i === index;
      });
    } else {
      newOptions[index] = { ...newOptions[index], [field]: value };
    }
    setOptions(newOptions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.questionText.trim()) {
      alert("Question text is required");
      return;
    }

    if (hasSubQuestions) {
      if (options.length === 0) {
        alert("Please add at least one answer option");
        return;
      }

      if (options.some((opt) => !opt.text.trim())) {
        alert("All options must have text");
        return;
      }

      if (!options.some((opt) => opt.isCorrect)) {
        alert("Please mark at least one option as correct");
        return;
      }
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
          options: hasSubQuestions ? options : undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        alert("Failed to save question");
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

          {/* Passage (for Reading) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Passage (Optional - for Reading questions)
            </label>
            <RichTextEditor
              value={formData.passage}
              onChange={(value) =>
                setFormData({ ...formData, passage: value })
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

          {/* Question Type Toggle */}
          <div className="border-t border-gray-200 pt-4">
            <div className="flex items-center gap-4 mb-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hasSubQuestions}
                  onChange={(e) => {
                    setHasSubQuestions(e.target.checked);
                    if (e.target.checked && options.length === 0) {
                      setOptions([
                        { text: "", isCorrect: false },
                        { text: "", isCorrect: false },
                        { text: "", isCorrect: false },
                        { text: "", isCorrect: false },
                      ]);
                    }
                  }}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <List className="w-4 h-4" />
                  This question has multiple choice options
                </span>
              </label>
            </div>

            {hasSubQuestions && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Answer Options *
                  </label>
                  <button
                    type="button"
                    onClick={handleAddOption}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                  >
                    <Plus className="w-4 h-4" />
                    Add Option
                  </button>
                </div>

                <div className="space-y-3">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <button
                        type="button"
                        onClick={() => handleOptionChange(index, "isCorrect", !option.isCorrect)}
                        className={`mt-2 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 ${
                          option.isCorrect
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300 hover:border-green-400"
                        }`}
                      >
                        {option.isCorrect && <Check className="w-4 h-4 text-white" />}
                      </button>
                      <input
                        type="text"
                        value={option.text}
                        onChange={(e) => handleOptionChange(index, "text", e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index)}
                          className="mt-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Click the checkbox to mark the correct answer
                </p>
              </div>
            )}
          </div>

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

