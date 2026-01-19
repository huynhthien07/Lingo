"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

interface Label {
  id: number;
  text: string;
  imageSrc?: string | null;
  audioSrc?: string | null;
}

interface Target {
  id: number;
  imageSrc: string;
  x: number;
  y: number;
}

interface Mapping {
  id: string; // Temporary ID for UI
  targetId: number;
  labelId: number;
  questionText: string;
  points: number;
}

interface BulkLabelingCreatorProps {
  challengeId: number;
  lessonId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BulkLabelingCreator({
  challengeId,
  lessonId,
  onSuccess,
  onCancel,
}: BulkLabelingCreatorProps) {
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [availableTargets, setAvailableTargets] = useState<Target[]>([]);
  const [mappings, setMappings] = useState<Mapping[]>([
    { id: "1", targetId: 0, labelId: 0, questionText: "", points: 1 },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch pool data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [labelsRes, targetsRes] = await Promise.all([
          fetch(`/api/teacher/question-pool/labels?lessonId=${lessonId}`),
          fetch(`/api/teacher/question-pool/targets?lessonId=${lessonId}`),
        ]);

        if (!labelsRes.ok || !targetsRes.ok) {
          throw new Error("Failed to fetch pool data");
        }

        const labelsData = await labelsRes.json();
        const targetsData = await targetsRes.json();

        setAvailableLabels(labelsData.labels || []);
        setAvailableTargets(targetsData.targets || []);
      } catch (error) {
        console.error("Error fetching pool data:", error);
        toast.error("Failed to load labels/targets");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  const addMapping = () => {
    setMappings([
      ...mappings,
      {
        id: Date.now().toString(),
        targetId: 0,
        labelId: 0,
        questionText: "",
        points: 1,
      },
    ]);
  };

  const removeMapping = (id: string) => {
    if (mappings.length <= 1) {
      toast.error("At least one mapping is required");
      return;
    }
    setMappings(mappings.filter((m) => m.id !== id));
  };

  const updateMapping = (id: string, updates: Partial<Mapping>) => {
    setMappings(mappings.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleSave = async () => {
    // Validation
    for (const mapping of mappings) {
      if (!mapping.targetId || !mapping.labelId) {
        toast.error("All mappings must have both target and label selected");
        return;
      }
      if (!mapping.questionText.trim()) {
        toast.error("All questions must have text");
        return;
      }
    }

    try {
      setSaving(true);

      // Create questions one by one
      for (let i = 0; i < mappings.length; i++) {
        const mapping = mappings[i];
        const res = await fetch("/api/teacher/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            challengeId,
            text: mapping.questionText,
            questionType: "LABELING",
            metadata: {
              version: 2,
              correctMappings: [
                { targetId: mapping.targetId, labelId: mapping.labelId },
              ],
            },
            points: mapping.points,
            order: i + 1,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to create question ${i + 1}`);
        }
      }

      toast.success(`Created ${mappings.length} labeling questions successfully`);
      onSuccess();
    } catch (error) {
      console.error("Error creating questions:", error);
      toast.error("Failed to create questions");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Bulk Create Labeling Questions</h3>
        <p className="text-sm text-gray-600">
          Each mapping will be created as a separate question (1 point each)
        </p>
      </div>

      {/* Mappings List */}
      <div className="space-y-4">
        {mappings.map((mapping, index) => (
          <div key={mapping.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Question {index + 1}</span>
              <button
                type="button"
                onClick={() => removeMapping(mapping.id)}
                disabled={mappings.length <= 1}
                className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Question Text */}
            <input
              type="text"
              value={mapping.questionText}
              onChange={(e) => updateMapping(mapping.id, { questionText: e.target.value })}
              placeholder="Question text (e.g., 'Label the position on the diagram')"
              className="w-full px-3 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
            />

            <div className="grid grid-cols-2 gap-3">
              {/* Target Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Position
                </label>
                <select
                  value={mapping.targetId}
                  onChange={(e) => updateMapping(mapping.id, { targetId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>-- Select Target --</option>
                  {availableTargets.map((target) => (
                    <option key={target.id} value={target.id}>
                      Target {target.id} ({target.x}%, {target.y}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* Label Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Correct Label
                </label>
                <select
                  value={mapping.labelId}
                  onChange={(e) => updateMapping(mapping.id, { labelId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>-- Select Label --</option>
                  {availableLabels.map((label) => (
                    <option key={label.id} value={label.id}>
                      {label.text}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Mapping Button */}
      <button
        type="button"
        onClick={addMapping}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
      >
        <Plus className="w-4 h-4" />
        Add Another Mapping
      </button>

      {/* Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" />
              Create {mappings.length} Question{mappings.length > 1 ? "s" : ""}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

