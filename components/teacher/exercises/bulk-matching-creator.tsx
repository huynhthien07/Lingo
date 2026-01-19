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

interface Item {
  id: number;
  text: string;
  imageSrc?: string | null;
  audioSrc?: string | null;
}

interface Pair {
  id: string; // Temporary ID for UI
  labelId: number;
  itemId: number;
  questionText: string;
  points: number;
}

interface BulkMatchingCreatorProps {
  challengeId: number;
  lessonId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function BulkMatchingCreator({
  challengeId,
  lessonId,
  onSuccess,
  onCancel,
}: BulkMatchingCreatorProps) {
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [pairs, setPairs] = useState<Pair[]>([
    { id: "1", labelId: 0, itemId: 0, questionText: "", points: 1 },
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch pool data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [labelsRes, itemsRes] = await Promise.all([
          fetch(`/api/teacher/question-pool/labels?lessonId=${lessonId}`),
          fetch(`/api/teacher/question-pool/items?lessonId=${lessonId}`),
        ]);

        if (!labelsRes.ok || !itemsRes.ok) {
          throw new Error("Failed to fetch pool data");
        }

        const labelsData = await labelsRes.json();
        const itemsData = await itemsRes.json();

        setAvailableLabels(labelsData.labels || []);
        setAvailableItems(itemsData.items || []);
      } catch (error) {
        console.error("Error fetching pool data:", error);
        toast.error("Failed to load labels/items");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [lessonId]);

  const addPair = () => {
    setPairs([
      ...pairs,
      {
        id: Date.now().toString(),
        labelId: 0,
        itemId: 0,
        questionText: "",
        points: 1,
      },
    ]);
  };

  const removePair = (id: string) => {
    if (pairs.length <= 1) {
      toast.error("At least one pair is required");
      return;
    }
    setPairs(pairs.filter((p) => p.id !== id));
  };

  const updatePair = (id: string, updates: Partial<Pair>) => {
    setPairs(pairs.map((p) => (p.id === id ? { ...p, ...updates } : p)));
  };

  const handleSave = async () => {
    // Validation
    for (const pair of pairs) {
      if (!pair.labelId || !pair.itemId) {
        toast.error("All pairs must have both label and item selected");
        return;
      }
      if (!pair.questionText.trim()) {
        toast.error("All questions must have text");
        return;
      }
    }

    try {
      setSaving(true);

      // Create questions one by one
      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i];
        const res = await fetch("/api/teacher/questions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            challengeId,
            text: pair.questionText,
            questionType: "MATCHING",
            metadata: {
              version: 2,
              correctPairs: [{ labelId: pair.labelId, itemId: pair.itemId }],
            },
            points: pair.points,
            order: i + 1,
          }),
        });

        if (!res.ok) {
          throw new Error(`Failed to create question ${i + 1}`);
        }
      }

      toast.success(`Created ${pairs.length} matching questions successfully`);
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
        <h3 className="text-lg font-semibold">Bulk Create Matching Questions</h3>
        <p className="text-sm text-gray-600">
          Each pair will be created as a separate question (1 point each)
        </p>
      </div>

      {/* Pairs List */}
      <div className="space-y-4">
        {pairs.map((pair, index) => (
          <div key={pair.id} className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <span className="font-medium text-gray-700">Question {index + 1}</span>
              <button
                type="button"
                onClick={() => removePair(pair.id)}
                disabled={pairs.length <= 1}
                className="p-1 text-red-600 hover:bg-red-50 rounded disabled:opacity-30"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Question Text */}
            <input
              type="text"
              value={pair.questionText}
              onChange={(e) => updatePair(pair.id, { questionText: e.target.value })}
              placeholder="Question text (e.g., 'Match the tense with the example')"
              className="w-full px-3 py-2 border rounded-lg mb-3 focus:ring-2 focus:ring-blue-500"
            />

            <div className="grid grid-cols-2 gap-3">
              {/* Label Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Label (Left)
                </label>
                <select
                  value={pair.labelId}
                  onChange={(e) => updatePair(pair.id, { labelId: Number(e.target.value) })}
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

              {/* Item Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Item (Right)
                </label>
                <select
                  value={pair.itemId}
                  onChange={(e) => updatePair(pair.id, { itemId: Number(e.target.value) })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>-- Select Item --</option>
                  {availableItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.text}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Pair Button */}
      <button
        type="button"
        onClick={addPair}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600"
      >
        <Plus className="w-4 h-4" />
        Add Another Pair
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
              Create {pairs.length} Question{pairs.length > 1 ? "s" : ""}
            </>
          )}
        </button>
      </div>
    </div>
  );
}

