"use client";

import { useState } from "react";
import { Info } from "lucide-react";

interface TextInputEditorProps {
  correctAnswer: string;
  onChange: (answer: string) => void;
  disabled?: boolean;
  multiline?: boolean;
  onMultilineChange?: (multiline: boolean) => void;
  maxLength?: number;
  onMaxLengthChange?: (maxLength: number | undefined) => void;
  caseSensitive?: boolean;
  onCaseSensitiveChange?: (caseSensitive: boolean) => void;
  acceptableAnswers?: string[];
  onAcceptableAnswersChange?: (answers: string[]) => void;
}

export function TextInputEditor({
  correctAnswer,
  onChange,
  disabled = false,
  multiline = false,
  onMultilineChange,
  maxLength,
  onMaxLengthChange,
  caseSensitive = false,
  onCaseSensitiveChange,
  acceptableAnswers = [],
  onAcceptableAnswersChange,
}: TextInputEditorProps) {
  const [newAcceptableAnswer, setNewAcceptableAnswer] = useState("");

  const addAcceptableAnswer = () => {
    if (!newAcceptableAnswer.trim()) return;
    if (acceptableAnswers.includes(newAcceptableAnswer.trim())) {
      alert("This answer is already in the list");
      return;
    }
    
    if (onAcceptableAnswersChange) {
      onAcceptableAnswersChange([...acceptableAnswers, newAcceptableAnswer.trim()]);
      setNewAcceptableAnswer("");
    }
  };

  const removeAcceptableAnswer = (answer: string) => {
    if (onAcceptableAnswersChange) {
      onAcceptableAnswersChange(acceptableAnswers.filter(a => a !== answer));
    }
  };

  return (
    <div className="space-y-6">
      {/* Correct Answer */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Correct Answer *
        </label>
        <input
          type="text"
          value={correctAnswer}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          placeholder="Enter the correct answer"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <p className="text-xs text-gray-500 mt-1">
          This is the primary correct answer that will be used for grading
        </p>
      </div>

      {/* Settings */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
        <h4 className="text-sm font-medium text-gray-700">Answer Settings</h4>

        {/* Multiline Toggle */}
        {onMultilineChange && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={multiline}
              onChange={(e) => onMultilineChange(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Multiline Input</span>
              <p className="text-xs text-gray-500">Allow students to enter multiple lines of text</p>
            </div>
          </label>
        )}

        {/* Max Length */}
        {onMaxLengthChange && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Length (Optional)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                min="1"
                value={maxLength || ""}
                onChange={(e) => onMaxLengthChange(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="No limit"
                disabled={disabled}
                className="w-32 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">
                {maxLength ? `${maxLength} characters max` : "No character limit"}
              </span>
            </div>
          </div>
        )}

        {/* Case Sensitive */}
        {onCaseSensitiveChange && (
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={caseSensitive}
              onChange={(e) => onCaseSensitiveChange(e.target.checked)}
              disabled={disabled}
              className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
            />
            <div>
              <span className="text-sm font-medium text-gray-700">Case Sensitive</span>
              <p className="text-xs text-gray-500">
                {caseSensitive 
                  ? "Answer must match exact capitalization (e.g., 'London' ≠ 'london')"
                  : "Answer is case-insensitive (e.g., 'London' = 'london')"
                }
              </p>
            </div>
          </label>
        )}
      </div>

      {/* Acceptable Alternative Answers */}
      {onAcceptableAnswersChange && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-700">Alternative Acceptable Answers</h4>
              <p className="text-xs text-gray-500 mt-1">
                Add other correct answers that should also be accepted (e.g., synonyms, abbreviations)
              </p>
            </div>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newAcceptableAnswer}
              onChange={(e) => setNewAcceptableAnswer(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addAcceptableAnswer())}
              placeholder="Enter alternative answer"
              disabled={disabled}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addAcceptableAnswer}
              disabled={disabled || !newAcceptableAnswer.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>

          {acceptableAnswers.length > 0 && (
            <div className="space-y-2">
              {acceptableAnswers.map((answer, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-lg"
                >
                  <span className="text-sm text-gray-800">{answer}</span>
                  <button
                    type="button"
                    onClick={() => removeAcceptableAnswer(answer)}
                    disabled={disabled}
                    className="text-sm text-red-600 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}

          {acceptableAnswers.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-3">
              No alternative answers added
            </p>
          )}
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-gray-600">
          💡 <strong>IELTS Tip:</strong> For questions like "Form Completion" or "Short Answer", 
          consider adding common variations (e.g., "UK" and "United Kingdom") as acceptable answers.
        </p>
      </div>
    </div>
  );
}

