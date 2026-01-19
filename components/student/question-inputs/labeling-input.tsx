"use client";

import { useState, useEffect } from "react";
import type { LabelingMetadata, LabelingAnswer, LabelingMetadataLegacy } from "@/shared/types/questionMetadata";

interface LabelingInputProps {
  metadata: LabelingMetadata;
  value?: LabelingAnswer;
  onAnswerChange: (answer: LabelingAnswer) => void;
  disabled?: boolean;
}

export function LabelingInput({
  metadata,
  value,
  onAnswerChange,
  disabled = false,
}: LabelingInputProps) {
  // Check if metadata is legacy version
  const isLegacy = (metadata as any).imageUrl !== undefined;
  const legacyMetadata = isLegacy ? (metadata as LabelingMetadataLegacy) : null;

  const [labels, setLabels] = useState<Map<number, number>>(
    new Map(value?.labels.map(l => [l.positionId, l.labelId]) || [])
  );

  useEffect(() => {
    if (value) {
      setLabels(new Map(value.labels.map(l => [l.positionId, l.labelId])));
    }
  }, [value]);

  const handleLabelSelect = (positionId: number, labelId: number) => {
    if (disabled) return;

    const newLabels = new Map(labels);
    newLabels.set(positionId, labelId);
    setLabels(newLabels);

    onAnswerChange({
      labels: Array.from(newLabels.entries()).map(([positionId, labelId]) => ({
        positionId,
        labelId,
      })),
    });
  };

  // Only render if legacy metadata (V2 doesn't have image/positions in metadata)
  if (!isLegacy || !legacyMetadata) {
    return <div className="text-gray-500">Labeling question format not supported</div>;
  }

  return (
    <div className="space-y-6">
      {/* Image/Diagram */}
      {legacyMetadata.imageUrl && (
        <div className="relative border rounded-lg p-4 bg-gray-50">
          <img
            src={legacyMetadata.imageUrl}
            alt="Diagram to label"
            className="max-w-full mx-auto rounded-lg"
          />
        </div>
      )}

      {/* Label Selection */}
      <div className="space-y-4">
        <p className="text-sm font-medium text-gray-700">
          Chọn nhãn cho mỗi vị trí:
        </p>

        {legacyMetadata.positions
          .sort((a, b) => a.order - b.order)
          .map((position) => {
            const selectedLabelId = labels.get(position.id);

            return (
              <div key={position.id} className="border rounded-lg p-4 bg-white">
                <div className="font-medium mb-3 text-gray-800">
                  {position.name || `Vị trí ${position.order}`}
                </div>

                <select
                  value={selectedLabelId || ""}
                  onChange={(e) => handleLabelSelect(position.id, Number(e.target.value))}
                  disabled={disabled}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">-- Chọn nhãn --</option>
                  {legacyMetadata.availableLabels
                    .sort((a, b) => a.order - b.order)
                    .map((label) => (
                      <option key={label.id} value={label.id}>
                        {label.text}
                      </option>
                    ))}
                </select>
              </div>
            );
          })}
      </div>
    </div>
  );
}

