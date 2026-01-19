"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical, ArrowUp, ArrowDown } from "lucide-react";
import type { OrderingMetadata, OrderingMetadataLegacy } from "@/shared/types/questionMetadata";

interface OrderingEditorProps {
  value: OrderingMetadata;
  onChange: (value: OrderingMetadata) => void;
  disabled?: boolean;
}

export function OrderingEditor({
  value,
  onChange,
  disabled = false,
}: OrderingEditorProps) {
  // Check if metadata is legacy version
  const isLegacy = (value as any).items !== undefined;
  const legacyValue = isLegacy ? (value as OrderingMetadataLegacy) : null;

  if (!isLegacy || !legacyValue) {
    return <div className="text-gray-500">Ordering metadata format not supported</div>;
  }

  const addItem = () => {
    const newId = Math.max(0, ...legacyValue.items.map((i: any) => i.id)) + 1;
    const newItem = { id: newId, text: "" };

    onChange({
      ...legacyValue,
      items: [...legacyValue.items, newItem],
      correctOrder: [...legacyValue.correctOrder, newId],
    });
  };

  const removeItem = (id: number) => {
    onChange({
      ...legacyValue,
      items: legacyValue.items.filter((i: any) => i.id !== id),
      correctOrder: legacyValue.correctOrder.filter(itemId => itemId !== id),
    });
  };

  const updateItem = (id: number, text: string) => {
    onChange({
      ...legacyValue,
      items: legacyValue.items.map((i: any) => i.id === id ? { ...i, text } : i),
    });
  };

  const moveItemInCorrectOrder = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === legacyValue.correctOrder.length - 1) return;

    const newOrder = [...legacyValue.correctOrder];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
    
    onChange({
      ...value,
      correctOrder: newOrder,
    });
  };

  return (
    <div className="space-y-6">
      {/* Items */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Items to Order
          </label>
          <button
            type="button"
            onClick={addItem}
            disabled={disabled}
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </button>
        </div>
        
        <p className="text-xs text-gray-500">
          Add all items that students will need to arrange in order
        </p>
        
        {legacyValue.items.map((item: any, index: number) => (
          <div key={item.id} className="flex gap-2">
            <div className="flex items-center gap-2 flex-1 px-3 py-2 border rounded-lg bg-gray-50">
              <GripVertical className="w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={item.text}
                onChange={(e) => updateItem(item.id, e.target.value)}
                placeholder={`Item ${index + 1} (e.g., Step description)`}
                disabled={disabled}
                className="flex-1 bg-transparent border-none focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() => removeItem(item.id)}
              disabled={disabled || legacyValue.items.length <= 2}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}

        {legacyValue.items.length < 2 && (
          <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
            ⚠️ Add at least 2 items for ordering questions
          </p>
        )}
      </div>

      {/* Correct Order */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Correct Order
        </label>

        <p className="text-xs text-gray-500 mb-3">
          Arrange the items in the correct order (this is the answer key)
        </p>

        <div className="space-y-2">
          {legacyValue.correctOrder.map((itemId: number, index: number) => {
            const item = legacyValue.items.find((i: any) => i.id === itemId);
            if (!item) return null;
            
            return (
              <div
                key={itemId}
                className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg"
              >
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm">
                  {index + 1}
                </span>
                
                <div className="flex-1 text-gray-800">
                  {item.text || `Item ${item.id}`}
                </div>
                
                <div className="flex gap-1">
                  <button
                    type="button"
                    onClick={() => moveItemInCorrectOrder(index, "up")}
                    disabled={disabled || index === 0}
                    className="p-1.5 text-gray-600 hover:bg-blue-100 rounded disabled:opacity-30"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveItemInCorrectOrder(index, "down")}
                    disabled={disabled || index === value.correctOrder.length - 1}
                    className="p-1.5 text-gray-600 hover:bg-blue-100 rounded disabled:opacity-30"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

