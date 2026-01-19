"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

interface QuestionOption {
  id: number;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

interface MultipleChoiceInputProps {
  options: QuestionOption[];
  selectedOptionIds?: number[];
  onAnswerChange: (optionIds: number[]) => void;
  disabled?: boolean;
  maxSelections?: number; // Optional: limit number of selections (e.g., "Choose TWO answers")
}

export function MultipleChoiceInput({
  options,
  selectedOptionIds = [],
  onAnswerChange,
  disabled = false,
  maxSelections,
}: MultipleChoiceInputProps) {
  const [selected, setSelected] = useState<Set<number>>(new Set(selectedOptionIds));

  useEffect(() => {
    setSelected(new Set(selectedOptionIds));
  }, [selectedOptionIds]);

  const handleToggle = (optionId: number) => {
    if (disabled) return;

    const newSelected = new Set(selected);
    if (newSelected.has(optionId)) {
      newSelected.delete(optionId);
    } else {
      // Check if max selections reached
      if (maxSelections && newSelected.size >= maxSelections) {
        return; // Don't allow more selections
      }
      newSelected.add(optionId);
    }

    setSelected(newSelected);
    onAnswerChange(Array.from(newSelected));
  };

  return (
    <div className="space-y-3">
      {/* Selection counter */}
      {maxSelections && (
        <div className="text-sm font-medium text-gray-700 mb-2">
          Đã chọn: {selected.size}/{maxSelections}
          {selected.size >= maxSelections && (
            <span className="ml-2 text-blue-600">✓ Đủ số lượng</span>
          )}
        </div>
      )}

      {options
        .sort((a, b) => a.order - b.order)
        .map((option) => {
          const isSelected = selected.has(option.id);
          const canSelect = !maxSelections || selected.size < maxSelections || isSelected;

          return (
            <button
              key={option.id}
              onClick={() => handleToggle(option.id)}
              disabled={disabled || (!canSelect && !isSelected)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all
                ${
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-300 bg-white hover:border-blue-400"
                }
                ${disabled || (!canSelect && !isSelected) ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`
                    mt-0.5 h-5 w-5 rounded border-2 flex items-center justify-center flex-shrink-0
                    ${
                      isSelected
                        ? "border-blue-600 bg-blue-600"
                        : "border-gray-300"
                    }
                  `}
                >
                  {isSelected && (
                    <Check className="h-3 w-3 text-white" />
                  )}
                </div>
                <div
                  className="flex-1"
                  dangerouslySetInnerHTML={{ __html: option.optionText }}
                />
              </div>
            </button>
          );
        })}
    </div>
  );
}

