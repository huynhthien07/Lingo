"use client";

import { useState } from "react";
import { Plus, Trash2, Check } from "lucide-react";
import { RichTextEditor } from "../exercises/rich-text-editor";

interface QuestionOption {
  id: number;
  optionText: string;
  isCorrect: boolean;
  order: number;
}

interface MultipleChoiceEditorProps {
  options: QuestionOption[];
  onChange: (options: QuestionOption[]) => void;
  disabled?: boolean;
  maxSelections?: number;
  onMaxSelectionsChange?: (max: number | undefined) => void;
}

export function MultipleChoiceEditor({
  options,
  onChange,
  disabled = false,
  maxSelections,
  onMaxSelectionsChange,
}: MultipleChoiceEditorProps) {
  const addOption = () => {
    const newId = Math.max(0, ...options.map(o => o.id)) + 1;
    const newOrder = options.length + 1;
    
    onChange([
      ...options,
      { id: newId, optionText: "", isCorrect: false, order: newOrder }
    ]);
  };

  const removeOption = (id: number) => {
    if (options.length <= 2) {
      alert("A question must have at least 2 options");
      return;
    }
    onChange(options.filter(o => o.id !== id));
  };

  const updateOptionText = (id: number, text: string) => {
    onChange(
      options.map(o => o.id === id ? { ...o, optionText: text } : o)
    );
  };

  const toggleCorrectOption = (id: number) => {
    onChange(
      options.map(o => o.id === id ? { ...o, isCorrect: !o.isCorrect } : o)
    );
  };

  const moveOption = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === options.length - 1) return;
    
    const newOptions = [...options];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newOptions[index], newOptions[targetIndex]] = [newOptions[targetIndex], newOptions[index]];
    
    // Update order
    newOptions.forEach((opt, idx) => {
      opt.order = idx + 1;
    });
    
    onChange(newOptions);
  };

  const correctCount = options.filter(o => o.isCorrect).length;
  const hasCorrectAnswers = correctCount > 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          Answer Options *
        </label>
        <button
          type="button"
          onClick={addOption}
          disabled={disabled}
          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
        >
          <Plus className="w-4 h-4" />
          Add Option
        </button>
      </div>

      {/* Max Selections Setting */}
      {onMaxSelectionsChange && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Maximum Selections (Optional)
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min="1"
              max={options.length}
              value={maxSelections || ""}
              onChange={(e) => onMaxSelectionsChange(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="No limit"
              className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-600">
              {maxSelections 
                ? `Students can select up to ${maxSelections} answer${maxSelections > 1 ? 's' : ''}`
                : "Students can select any number of answers"
              }
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Common IELTS formats: "Choose TWO answers" (set to 2), "Choose THREE answers" (set to 3)
          </p>
        </div>
      )}

      {!hasCorrectAnswers && options.length > 0 && (
        <div className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
          ⚠️ Please mark at least one option as correct
        </div>
      )}

      {correctCount > 0 && (
        <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg p-3">
          ✓ {correctCount} correct answer{correctCount > 1 ? 's' : ''} marked
        </div>
      )}

      <div className="space-y-3">
        {options
          .sort((a, b) => a.order - b.order)
          .map((option, index) => (
            <div key={option.id} className="space-y-2">
              <div className="flex items-start gap-2">
                {/* Correct Answer Checkbox */}
                <button
                  type="button"
                  onClick={() => toggleCorrectOption(option.id)}
                  disabled={disabled}
                  className={`
                    mt-2 w-6 h-6 rounded border-2 flex items-center justify-center flex-shrink-0 transition-all
                    ${option.isCorrect
                      ? "border-green-500 bg-green-500"
                      : "border-gray-300 hover:border-green-400"
                    }
                  `}
                  title="Mark as correct answer"
                >
                  {option.isCorrect && <Check className="w-4 h-4 text-white" />}
                </button>

                {/* Option Text */}
                <div className="flex-1">
                  <RichTextEditor
                    value={option.optionText}
                    onChange={(text) => updateOptionText(option.id, text)}
                  />
                </div>

                {/* Move Up/Down */}
                <div className="flex flex-col gap-1 mt-2">
                  <button
                    type="button"
                    onClick={() => moveOption(index, "up")}
                    disabled={disabled || index === 0}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="Move up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveOption(index, "down")}
                    disabled={disabled || index === options.length - 1}
                    className="p-1 text-gray-600 hover:bg-gray-100 rounded disabled:opacity-30"
                    title="Move down"
                  >
                    ↓
                  </button>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => removeOption(option.id)}
                  disabled={disabled || options.length <= 2}
                  className="mt-2 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                  title="Delete option"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
      </div>

      {options.length < 2 && (
        <p className="text-sm text-gray-500 text-center py-4">
          Click "Add Option" to create answer choices
        </p>
      )}

      <p className="text-xs text-gray-500">
        💡 Click the checkboxes to mark correct answers. Students can select multiple answers.
      </p>
    </div>
  );
}

