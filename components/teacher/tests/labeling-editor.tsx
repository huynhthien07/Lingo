"use client";

import { useState } from "react";
import { Plus, Trash2, MapPin } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import type { LabelingMetadata, LabelingMetadataLegacy } from "@/shared/types/questionMetadata";

interface LabelingEditorProps {
  value: LabelingMetadata;
  onChange: (value: LabelingMetadata) => void;
  disabled?: boolean;
}

export function LabelingEditor({
  value,
  onChange,
  disabled = false,
}: LabelingEditorProps) {
  // Check if metadata is legacy version
  const isLegacy = (value as any).positions !== undefined;
  const legacyValue = isLegacy ? (value as LabelingMetadataLegacy) : null;

  if (!isLegacy || !legacyValue) {
    return <div className="text-gray-500">Labeling metadata format not supported</div>;
  }

  const addPosition = () => {
    const newId = Math.max(0, ...legacyValue.positions.map(p => p.id)) + 1;
    onChange({
      ...legacyValue,
      positions: [
        ...legacyValue.positions,
        { id: newId, name: "", order: legacyValue.positions.length + 1 }
      ],
    });
  };

  const addLabel = () => {
    const newId = Math.max(0, ...legacyValue.availableLabels.map((l: any) => l.id)) + 1;
    onChange({
      ...legacyValue,
      availableLabels: [
        ...legacyValue.availableLabels,
        { id: newId, text: "", order: legacyValue.availableLabels.length + 1 }
      ],
    });
  };

  const removePosition = (id: number) => {
    onChange({
      ...legacyValue,
      positions: legacyValue.positions.filter((p: any) => p.id !== id),
      correctLabels: legacyValue.correctLabels.filter((cl: any) => cl.positionId !== id),
    });
  };

  const removeLabel = (id: number) => {
    onChange({
      ...legacyValue,
      availableLabels: legacyValue.availableLabels.filter((l: any) => l.id !== id),
      correctLabels: legacyValue.correctLabels.filter((cl: any) => cl.labelId !== id),
    });
  };

  const updatePosition = (id: number, name: string) => {
    onChange({
      ...legacyValue,
      positions: legacyValue.positions.map((p: any) => p.id === id ? { ...p, name } : p),
    });
  };

  const updateLabel = (id: number, text: string) => {
    onChange({
      ...legacyValue,
      availableLabels: legacyValue.availableLabels.map((l: any) => l.id === id ? { ...l, text } : l),
    });
  };

  const updateCorrectLabel = (positionId: number, labelId: number) => {
    const existingIndex = legacyValue.correctLabels.findIndex((cl: any) => cl.positionId === positionId);
    let newCorrectLabels = [...legacyValue.correctLabels];
    
    if (existingIndex >= 0) {
      newCorrectLabels[existingIndex] = { positionId, labelId };
    } else {
      newCorrectLabels.push({ positionId, labelId });
    }

    onChange({
      ...legacyValue,
      correctLabels: newCorrectLabels,
    });
  };

  return (
    <div className="space-y-6">
      {/* Image Upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Diagram/Map Image *
        </label>
        <ImageUpload
          value={legacyValue.imageUrl}
          onChange={(url) => onChange({ ...value, imageUrl: url })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Upload the diagram, map, or plan that students will label
        </p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Positions */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Positions to Label
            </label>
            <button
              type="button"
              onClick={addPosition}
              disabled={disabled}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>
          
          {legacyValue.positions.map((position: any, index: number) => (
            <div key={position.id} className="flex gap-2">
              <input
                type="text"
                value={position.name || ""}
                onChange={(e) => updatePosition(position.id, e.target.value)}
                placeholder={`Position ${index + 1} (e.g., Building A, Point 1)`}
                disabled={disabled}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removePosition(position.id)}
                disabled={disabled || legacyValue.positions.length <= 1}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Available Labels */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700">
              Available Labels
            </label>
            <button
              type="button"
              onClick={addLabel}
              disabled={disabled}
              className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="w-4 h-4" />
              Add
            </button>
          </div>

          {legacyValue.availableLabels.map((label: any, index: number) => (
            <div key={label.id} className="flex gap-2">
              <input
                type="text"
                value={label.text}
                onChange={(e) => updateLabel(label.id, e.target.value)}
                placeholder={`Label ${index + 1} (e.g., Library, Cafeteria)`}
                disabled={disabled}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() => removeLabel(label.id)}
                disabled={disabled || legacyValue.availableLabels.length <= 1}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Correct Label Mapping */}
      <div className="border-t pt-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          <MapPin className="w-4 h-4 inline mr-2" />
          Correct Labels (Assign labels to positions)
        </label>

        <div className="space-y-3">
          {legacyValue.positions.map((position: any) => {
            const currentLabel = legacyValue.correctLabels.find((cl: any) => cl.positionId === position.id);

            return (
              <div key={position.id} className="flex items-center gap-3">
                <div className="flex-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                  {position.name || `Position ${position.order}`}
                </div>

                <div className="text-gray-400">→</div>

                <select
                  value={currentLabel?.labelId || ""}
                  onChange={(e) => updateCorrectLabel(position.id, Number(e.target.value))}
                  disabled={disabled}
                  className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select correct label --</option>
                  {legacyValue.availableLabels.map((label: any) => (
                    <option key={label.id} value={label.id}>
                      {label.text || `Label ${label.id}`}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>

        {legacyValue.positions.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            Add positions and labels first, then assign correct labels to each position
          </p>
        )}
      </div>
    </div>
  );
}


