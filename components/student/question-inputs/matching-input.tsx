"use client";

import { useState, useEffect } from "react";
import type { MatchingMetadata, MatchingAnswer, MatchingMetadataLegacy } from "@/shared/types/questionMetadata";

interface MatchingInputProps {
  metadata: MatchingMetadata;
  value?: MatchingAnswer;
  onAnswerChange: (answer: MatchingAnswer) => void;
  disabled?: boolean;
}

export function MatchingInput({
  metadata,
  value,
  onAnswerChange,
  disabled = false,
}: MatchingInputProps) {
  // Check if metadata is legacy version
  const isLegacy = (metadata as any).leftItems !== undefined;
  const legacyMetadata = isLegacy ? (metadata as MatchingMetadataLegacy) : null;

  const [pairs, setPairs] = useState<Map<number, number>>(
    new Map(value?.pairs.map(p => [p.leftId, p.rightId]) || [])
  );

  useEffect(() => {
    if (value) {
      setPairs(new Map(value.pairs.map(p => [p.leftId, p.rightId])));
    }
  }, [value]);

  const handleMatch = (leftId: number, rightId: number) => {
    if (disabled) return;

    const newPairs = new Map(pairs);
    newPairs.set(leftId, rightId);
    setPairs(newPairs);

    onAnswerChange({
      pairs: Array.from(newPairs.entries()).map(([leftId, rightId]) => ({
        leftId,
        rightId,
      })),
    });
  };

  if (!isLegacy || !legacyMetadata) {
    return <div className="text-gray-500">Matching question format not supported</div>;
  }

  const completedCount = Array.from(pairs.values()).filter(v => v !== undefined).length;
  const totalCount = legacyMetadata.leftItems.length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm font-medium text-gray-700">
          Chọn đáp án phù hợp cho mỗi mục:
        </p>
        <span className="text-sm text-gray-600">
          Đã ghép: {completedCount}/{totalCount}
        </span>
      </div>

      {legacyMetadata.leftItems
        .sort((a, b) => a.order - b.order)
        .map((leftItem) => {
          const selectedRightId = pairs.get(leftItem.id);

          return (
            <div
              key={leftItem.id}
              className={`
                border-2 rounded-lg p-4 transition-all
                ${selectedRightId ? "bg-blue-50 border-blue-300" : "bg-white border-gray-300"}
              `}
            >
              <div className="font-medium mb-3 text-gray-800">
                {leftItem.text}
              </div>

              <select
                value={selectedRightId || ""}
                onChange={(e) => handleMatch(leftItem.id, Number(e.target.value))}
                disabled={disabled}
                className={`
                  w-full p-2.5 border-2 rounded-md transition-all
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                  ${selectedRightId ? "border-blue-400 bg-white" : "border-gray-300"}
                  ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <option value="">-- Chọn đáp án --</option>
                {legacyMetadata.rightItems
                  .sort((a, b) => a.order - b.order)
                  .map((rightItem) => (
                    <option key={rightItem.id} value={rightItem.id}>
                      {rightItem.text}
                    </option>
                  ))}
              </select>
            </div>
          );
        })}
    </div>
  );
}

