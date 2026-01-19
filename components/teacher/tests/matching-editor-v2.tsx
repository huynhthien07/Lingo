"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Link2, Loader2 } from "lucide-react";
import type { MatchingMetadataV2 } from "@/shared/types/questionMetadata";
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

interface MatchingEditorV2Props {
  lessonId?: number;
  testId?: number;
  value: MatchingMetadataV2;
  onChange: (value: MatchingMetadataV2) => void;
  disabled?: boolean;
}

export function MatchingEditorV2({
  lessonId,
  testId,
  value,
  onChange,
  disabled = false,
}: MatchingEditorV2Props) {
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [selectedLabels, setSelectedLabels] = useState<number[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  // New label/item form states
  const [newLabelText, setNewLabelText] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch available labels and items
  useEffect(() => {
    const fetchData = async () => {
      if (!lessonId && !testId) {
        toast.error("Either lessonId or testId is required");
        return;
      }

      try {
        setLoading(true);
        const queryParam = lessonId ? `lessonId=${lessonId}` : `testId=${testId}`;
        const [labelsRes, itemsRes] = await Promise.all([
          fetch(`/api/teacher/question-pool/labels?${queryParam}`),
          fetch(`/api/teacher/question-pool/items?${queryParam}`),
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
  }, [lessonId, testId]);

  // Create new label
  const handleCreateLabel = async () => {
    if (!newLabelText.trim()) {
      toast.error("Label text is required");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/teacher/question-pool/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          testId,
          text: newLabelText.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create label");

      const data = await res.json();
      setAvailableLabels([...availableLabels, data.label]);
      setNewLabelText("");
      toast.success("Label created successfully");
    } catch (error) {
      console.error("Error creating label:", error);
      toast.error("Failed to create label");
    } finally {
      setCreating(false);
    }
  };

  // Create new item
  const handleCreateItem = async () => {
    if (!newItemText.trim()) {
      toast.error("Item text is required");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/teacher/question-pool/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId,
          testId,
          text: newItemText.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create item");

      const data = await res.json();
      setAvailableItems([...availableItems, data.item]);
      setNewItemText("");
      toast.success("Item created successfully");
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item");
    } finally {
      setCreating(false);
    }
  };

  // Toggle label selection
  const toggleLabel = (labelId: number) => {
    const newSelected = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];
    
    setSelectedLabels(newSelected);
    
    // Remove pairs with this label if deselected
    if (!newSelected.includes(labelId)) {
      onChange({
        ...value,
        correctPairs: value.correctPairs.filter(p => p.labelId !== labelId),
      });
    }
  };

  // Toggle item selection
  const toggleItem = (itemId: number) => {
    const newSelected = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId];

    setSelectedItems(newSelected);

    // Remove pairs with this item if deselected
    if (!newSelected.includes(itemId)) {
      onChange({
        ...value,
        correctPairs: value.correctPairs.filter(p => p.itemId !== itemId),
      });
    }
  };

  // Update correct pair
  const updateCorrectPair = (labelId: number, itemId: number) => {
    const existingPairIndex = value.correctPairs.findIndex(p => p.labelId === labelId);

    if (existingPairIndex >= 0) {
      // Update existing pair
      const newPairs = [...value.correctPairs];
      newPairs[existingPairIndex] = { labelId, itemId };
      onChange({ ...value, correctPairs: newPairs });
    } else {
      // Add new pair
      onChange({
        ...value,
        correctPairs: [...value.correctPairs, { labelId, itemId }],
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading labels and items...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Labels Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Labels (Select from pool or create new)
          </label>
        </div>

        {/* Create New Label */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newLabelText}
            onChange={(e) => setNewLabelText(e.target.value)}
            placeholder="Enter new label text..."
            disabled={disabled || creating}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateLabel();
              }
            }}
          />
          <button
            type="button"
            onClick={handleCreateLabel}
            disabled={disabled || creating || !newLabelText.trim()}
            className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create
          </button>
        </div>

        {/* Available Labels */}
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
          {availableLabels.length === 0 ? (
            <p className="col-span-2 text-sm text-gray-500 text-center py-4">
              No labels available. Create one above.
            </p>
          ) : (
            availableLabels.map((label) => (
              <label
                key={label.id}
                className={`
                  flex items-center gap-2 p-2 border rounded cursor-pointer transition-all
                  ${selectedLabels.includes(label.id) ? "bg-blue-50 border-blue-300" : "bg-white border-gray-300"}
                  ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-blue-400"}
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedLabels.includes(label.id)}
                  onChange={() => toggleLabel(label.id)}
                  disabled={disabled}
                  className="rounded text-blue-600"
                />
                <span className="text-sm">{label.text}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Items Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-gray-700">
            Items (Select from pool or create new)
          </label>
        </div>

        {/* Create New Item */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Enter new item text..."
            disabled={disabled || creating}
            className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleCreateItem();
              }
            }}
          />
          <button
            type="button"
            onClick={handleCreateItem}
            disabled={disabled || creating || !newItemText.trim()}
            className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Create
          </button>
        </div>

        {/* Available Items */}
        <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
          {availableItems.length === 0 ? (
            <p className="col-span-2 text-sm text-gray-500 text-center py-4">
              No items available. Create one above.
            </p>
          ) : (
            availableItems.map((item) => (
              <label
                key={item.id}
                className={`
                  flex items-center gap-2 p-2 border rounded cursor-pointer transition-all
                  ${selectedItems.includes(item.id) ? "bg-green-50 border-green-300" : "bg-white border-gray-300"}
                  ${disabled ? "opacity-50 cursor-not-allowed" : "hover:border-green-400"}
                `}
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => toggleItem(item.id)}
                  disabled={disabled}
                  className="rounded text-green-600"
                />
                <span className="text-sm">{item.text}</span>
              </label>
            ))
          )}
        </div>
      </div>

      {/* Correct Pairs Mapping */}
      {selectedLabels.length > 0 && selectedItems.length > 0 && (
        <div className="border-t pt-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            <Link2 className="w-4 h-4 inline mr-2" />
            Correct Pairs (Match labels with items)
          </label>

          <div className="space-y-3">
            {selectedLabels.map((labelId) => {
              const label = availableLabels.find(l => l.id === labelId);
              const currentPair = value.correctPairs.find(p => p.labelId === labelId);

              return (
                <div key={labelId} className="flex items-center gap-3">
                  <div className="flex-1 px-3 py-2 bg-blue-50 border border-blue-200 rounded-lg">
                    {label?.text || `Label ${labelId}`}
                  </div>

                  <div className="text-gray-400">→</div>

                  <select
                    value={currentPair?.itemId || ""}
                    onChange={(e) => updateCorrectPair(labelId, Number(e.target.value))}
                    disabled={disabled}
                    className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Select correct match --</option>
                    {selectedItems.map((itemId) => {
                      const item = availableItems.find(i => i.id === itemId);
                      return (
                        <option key={itemId} value={itemId}>
                          {item?.text || `Item ${itemId}`}
                        </option>
                      );
                    })}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}


