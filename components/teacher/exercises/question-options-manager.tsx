"use client";

import { useState } from "react";
import { Trash2 } from "lucide-react";

interface Option {
  id: number;
  questionId: number;
  text: string;
  correct: boolean;
  imageSrc?: string | null;
  audioSrc?: string | null;
  order: number;
}

interface OptionsManagerProps {
  questionId: number;
  options: Option[];
  exerciseType: string;
  canHaveImages: boolean;
  canHaveAudio?: boolean;
  onUpdate: () => void;
}

export function OptionsManager({
  questionId,
  options,
  exerciseType,
  canHaveImages,
  canHaveAudio = false,
  onUpdate,
}: OptionsManagerProps) {
  const [loading, setLoading] = useState(false);

  const isMultipleChoice = exerciseType.includes("MULTIPLE_CHOICE");
  const isFillInBlank = exerciseType.includes("COMPLETION") || exerciseType.includes("SHORT_ANSWER");

  const handleDeleteOption = async (optionId: number) => {
    if (!confirm("Are you sure you want to delete this option?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/questions/${questionId}/options/${optionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert("Failed to delete option");
      }
    } catch (error) {
      console.error("Error deleting option:", error);
      alert("Failed to delete option");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Options List - Read Only */}
      {options.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No options yet. Use the question editor to add options.</p>
      ) : (
        <div className="space-y-2">
          {options.map((option, idx) => (
            <div
              key={option.id}
              className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg"
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                {idx + 1}
              </span>
              <div className="flex-1">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: option.text }}
                />
                {option.imageSrc && (
                  <img src={option.imageSrc} alt="Option" className="mt-2 max-w-xs rounded" />
                )}
                {option.audioSrc && (
                  <audio src={option.audioSrc} controls className="mt-2 w-full max-w-xs" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    option.correct
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {option.correct ? "Correct" : "Incorrect"}
                </span>
                <button
                  onClick={() => handleDeleteOption(option.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Delete option"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info message */}
      <p className="text-xs text-gray-500 mt-2">
        💡 To add or edit options, use the "Edit Question" button above.
      </p>
    </div>
  );
}
