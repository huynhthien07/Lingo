"use client";

import { useState } from "react";
import { Plus, Trash2, Link2 } from "lucide-react";
import type { MatchingMetadata, MatchingMetadataLegacy } from "@/shared/types/questionMetadata";

interface MatchingEditorProps {
  value: MatchingMetadata;
  onChange: (value: MatchingMetadata) => void;
  disabled?: boolean;
}

export function MatchingEditor({
  value,
  onChange,
  disabled = false,
}: MatchingEditorProps) {
  // Check if metadata is legacy version
  const isLegacy = (value as any).leftItems !== undefined;
  const legacyValue = isLegacy ? (value as MatchingMetadataLegacy) : null;

  if (!isLegacy || !legacyValue) {
    return <div className="text-gray-500">Matching metadata format not supported</div>;
  }

  const addLeftItem = () => {
    const newId = Math.max(0, ...legacyValue.leftItems.map((i: any) => i.id)) + 1;
    onChange({
      ...legacyValue,
      leftItems: [
        ...legacyValue.leftItems,
        { id: newId, text: "", order: legacyValue.leftItems.length + 1 }
      ],
    });
  };

  const addRightItem = () => {
    const newId = Math.max(0, ...legacyValue.rightItems.map((i: any) => i.id)) + 1;
    onChange({
      ...legacyValue,
      rightItems: [
        ...legacyValue.rightItems,
        { id: newId, text: "", order: legacyValue.rightItems.length + 1 }
      ],
    });
  };

  const removeLeftItem = (id: number) => {
    onChange({
      ...legacyValue,
      leftItems: legacyValue.leftItems.filter((i: any) => i.id !== id),
      correctPairs: legacyValue.correctPairs.filter((p: any) => p.leftId !== id),
    });
  };

  const removeRightItem = (id: number) => {
    onChange({
      ...legacyValue,
      rightItems: legacyValue.rightItems.filter((i: any) => i.id !== id),
      correctPairs: legacyValue.correctPairs.filter((p: any) => p.rightId !== id),
    });
  };

  const updateLeftItem = (id: number, text: string) => {
    onChange({
      ...legacyValue,
      leftItems: legacyValue.leftItems.map((i: any) => i.id === id ? { ...i, text } : i),
    });
  };

  const updateRightItem = (id: number, text: string) => {
    onChange({
      ...legacyValue,
      rightItems: legacyValue.rightItems.map((i: any) => i.id === id ? { ...i, text } : i),
    });
  };

  const updateCorrectPair = (leftId: number, rightId: number) => {
    const existingPairIndex = legacyValue.correctPairs.findIndex((p: any) => p.leftId === leftId);
    let newPairs = [...legacyValue.correctPairs];

    if (existingPairIndex >= 0) {
      newPairs[existingPairIndex] = { leftId, rightId };
    } else {
      newPairs.push({ leftId, rightId });
    }

    onChange({
      ...legacyValue,
      correctPairs: newPairs,
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        {/* Left Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Left Items (Questions/Paragraphs)
            </label>
            <button
              type="button"
              onClick={addLeftItem}
              disabled={disabled}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          
          {legacyValue.leftItems.map((item: any, index: number) => (
            <div key={item.id} className="flex gap-2">
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateLeftItem(item.id, e.target.value)}
                placeholder={`Item ${index + 1} (e.g., Paragraph A)`}
                disabled={disabled}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeLeftItem(item.id)}
                disabled={disabled || legacyValue.leftItems.length <= 1}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Right Items */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Right Items (Answers/Headings)
            </label>
            <button
              type="button"
              onClick={addRightItem}
              disabled={disabled}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {legacyValue.rightItems.map((item: any, index: number) => (
            <div key={item.id} className="flex gap-2">
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateRightItem(item.id, e.target.value)}
                placeholder={`Item ${index + 1} (e.g., Heading i)`}
                disabled={disabled}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeRightItem(item.id)}
                disabled={disabled || legacyValue.rightItems.length <= 1}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Correct Pairs Mapping */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <Link2 className="w-4 h-4 inline mr-2" />
          Correct Pairs (Match left items with right items)
        </label>

        <div className="space-y-3">
          {legacyValue.leftItems.map((leftItem: any) => {
            const currentPair = legacyValue.correctPairs.find((p: any) => p.leftId === leftItem.id);

            return (
              <div key={leftItem.id} className="flex items-center gap-3">
                <div className="flex-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  {leftItem.text || `Left Item ${leftItem.id}`}
                </div>

                <div className="text-gray-400">→</div>

                <select
                  value={currentPair?.rightId || ""}
                  onChange={(e) => updateCorrectPair(leftItem.id, Number(e.target.value))}
                  disabled={disabled}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select correct match --</option>
                  {legacyValue.rightItems.map((rightItem: any) => (
                    <option key={rightItem.id} value={rightItem.id}>
                      {rightItem.text || `Right Item ${rightItem.id}`}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {legacyValue.leftItems.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Add left and right items first, then map the correct pairs
          </p>
        )}
      </div>
    </div>
  );
}


