"use client";

import { useState, useEffect } from "react";

interface QuestionOption {
  id: number;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

interface SingleChoiceInputProps {
  options: QuestionOption[];
  selectedOptionId?: number | null;
  onAnswerChange: (optionId: number) => void;
  disabled?: boolean;
}

export function SingleChoiceInput({
  options,
  selectedOptionId,
  onAnswerChange,
  disabled = false,
}: SingleChoiceInputProps) {
  const [selected, setSelected] = useState<number | null>(selectedOptionId || null);

  useEffect(() => {
    setSelected(selectedOptionId || null);
  }, [selectedOptionId]);

  const handleSelect = (optionId: number) => {
    if (disabled) return;
    setSelected(optionId);
    onAnswerChange(optionId);
  };

  return (
    <div className="space-y-3">
      {options
        .sort((a, b) => a.order - b.order)
        .map((option) => (
          <button
            key={option.id}
            onClick={() => handleSelect(option.id)}
            disabled={disabled}
            className={`
              w-full text-left p-4 rounded-lg border-2 transition-all
              ${
                selected === option.id
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-300 bg-white hover:border-blue-400"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            <div className="flex items-start gap-3">
              <div
                className={`
                  mt-0.5 h-5 w-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                  ${
                    selected === option.id
                      ? "border-blue-600 bg-blue-600"
                      : "border-gray-300"
                  }
                `}
              >
                {selected === option.id && (
                  <div className="h-2 w-2 rounded-full bg-white"></div>
                )}
              </div>
              <div
                className="flex-1"
                dangerouslySetInnerHTML={{ __html: option.optionText }}
              />
            </div>
          </button>
        ))}
    </div>
  );
}

