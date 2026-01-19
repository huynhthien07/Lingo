"use client";

import { useState, useEffect } from "react";
import { GripVertical } from "lucide-react";
import type { OrderingMetadata, OrderingAnswer, OrderingMetadataLegacy } from "@/shared/types/questionMetadata";

interface OrderingInputProps {
  metadata: OrderingMetadata;
  value?: OrderingAnswer;
  onAnswerChange: (answer: OrderingAnswer) => void;
  disabled?: boolean;
}

export function OrderingInput({
  metadata,
  value,
  onAnswerChange,
  disabled = false,
}: OrderingInputProps) {
  // Check if metadata is legacy version
  const isLegacy = (metadata as any).items !== undefined;
  const legacyMetadata = isLegacy ? (metadata as OrderingMetadataLegacy) : null;

  const [order, setOrder] = useState<number[]>(
    value?.order || (legacyMetadata?.items.map(item => item.id) || [])
  );
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (value) {
      setOrder(value.order);
    }
  }, [value]);

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (disabled) return;

    const newOrder = [...order];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);

    setOrder(newOrder);
    onAnswerChange({ order: newOrder });
  };

  const handleDragStart = (index: number) => {
    if (disabled) return;
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (disabled) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (disabled || draggedIndex === null) return;

    moveItem(draggedIndex, dropIndex);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  if (!isLegacy || !legacyMetadata) {
    return <div className="text-gray-500">Ordering question format not supported</div>;
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 font-medium">
        Sắp xếp các mục theo thứ tự đúng (kéo thả hoặc dùng nút ↑↓):
      </p>

      {order.map((itemId, index) => {
        const item = legacyMetadata.items.find(i => i.id === itemId);
        if (!item) return null;

        const isDragging = draggedIndex === index;
        const isDragOver = dragOverIndex === index;

        return (
          <div
            key={itemId}
            draggable={!disabled}
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDrop={(e) => handleDrop(e, index)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center gap-3 p-4 bg-white border-2 rounded-lg transition-all
              ${isDragging ? "opacity-50 border-blue-400" : ""}
              ${isDragOver ? "border-blue-500 bg-blue-50" : "border-gray-300"}
              ${!disabled ? "cursor-move hover:border-blue-300" : "cursor-not-allowed opacity-60"}
            `}
          >
            <GripVertical
              className={`h-5 w-5 flex-shrink-0 ${!disabled ? "text-gray-400" : "text-gray-300"}`}
            />

            <div className="flex-1">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold text-sm mr-3">
                {index + 1}
              </span>
              <span className="text-gray-800">{item.text}</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => moveItem(index, index - 1)}
                disabled={disabled || index === 0}
                className="px-3 py-1.5 text-sm font-medium border-2 rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Di chuyển lên"
              >
                ↑
              </button>
              <button
                onClick={() => moveItem(index, index + 1)}
                disabled={disabled || index === order.length - 1}
                className="px-3 py-1.5 text-sm font-medium border-2 rounded-md hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                title="Di chuyển xuống"
              >
                ↓
              </button>
            </div>
          </div>
        );
      })}

      <p className="text-xs text-gray-500 mt-4">
        💡 Mẹo: Kéo thả các mục hoặc sử dụng nút ↑↓ để sắp xếp
      </p>
    </div>
  );
}

