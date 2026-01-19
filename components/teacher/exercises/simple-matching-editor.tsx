"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Label {
  id: number;
  text: string;
}

interface Item {
  id: number;
  text: string;
}

interface SimpleMatchingEditorProps {
  challengeId: number; // Exercise ID - scope labels/items to this exercise
  value: {
    version: 2;
    correctPairs: Array<{ labelId: number; itemId: number }>;
  };
  onChange: (value: any) => void;
  disabled?: boolean;
}

/**
 * Simple Matching Editor - For creating ONE pair per question
 * Each question = 1 pair = 1 point
 * Labels/Items are scoped to the challenge (exercise)
 */
export function SimpleMatchingEditor({
  challengeId,
  value,
  onChange,
  disabled = false,
}: SimpleMatchingEditorProps) {
  const [availableLabels, setAvailableLabels] = useState<Label[]>([]);
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [selectedLabelId, setSelectedLabelId] = useState<number>(0);
  const [selectedItemId, setSelectedItemId] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // New label/item inline creation
  const [newLabelText, setNewLabelText] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [creating, setCreating] = useState(false);

  // Load existing selection
  useEffect(() => {
    if (value?.correctPairs?.[0]) {
      setSelectedLabelId(value.correctPairs[0].labelId);
      setSelectedItemId(value.correctPairs[0].itemId);
    }
  }, [value]);

  // Fetch pool data
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [labelsRes, itemsRes] = await Promise.all([
          fetch(`/api/teacher/question-pool/labels?challengeId=${challengeId}`),
          fetch(`/api/teacher/question-pool/items?challengeId=${challengeId}`),
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
  }, [challengeId]);

  // Update parent when selection changes
  useEffect(() => {
    if (selectedLabelId && selectedItemId) {
      onChange({
        version: 2,
        correctPairs: [{ labelId: selectedLabelId, itemId: selectedItemId }],
      });
    }
  }, [selectedLabelId, selectedItemId, onChange]);

  // Create new label inline
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
          challengeId,
          text: newLabelText.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create label");

      const data = await res.json();
      setAvailableLabels([...availableLabels, data.label]);
      setSelectedLabelId(data.label.id); // Auto-select new label
      setNewLabelText("");
      toast.success("Label created");
    } catch (error) {
      console.error("Error creating label:", error);
      toast.error("Failed to create label");
    } finally {
      setCreating(false);
    }
  };

  // Create new item inline
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
          challengeId,
          text: newItemText.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create item");

      const data = await res.json();
      setAvailableItems([...availableItems, data.item]);
      setSelectedItemId(data.item.id); // Auto-select new item
      setNewItemText("");
      toast.success("Item created");
    } catch (error) {
      console.error("Error creating item:", error);
      toast.error("Failed to create item");
    } finally {
      setCreating(false);
    }
  };

  // Delete label
  const handleDeleteLabel = async (labelId: number) => {
    if (!confirm("Are you sure you want to delete this label?")) {
      return;
    }

    try {
      const res = await fetch(`/api/teacher/question-pool/labels/${labelId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete label");
      }

      setAvailableLabels(availableLabels.filter((l) => l.id !== labelId));
      if (selectedLabelId === labelId) {
        setSelectedLabelId(0);
      }
      toast.success("Label deleted");
    } catch (error) {
      console.error("Error deleting label:", error);
      toast.error("Failed to delete label");
    }
  };

  // Delete item
  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("Are you sure you want to delete this item?")) {
      return;
    }

    try {
      const res = await fetch(`/api/teacher/question-pool/items/${itemId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete item");
      }

      setAvailableItems(availableItems.filter((i) => i.id !== itemId));
      if (selectedItemId === itemId) {
        setSelectedItemId(0);
      }
      toast.success("Item deleted");
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("Failed to delete item");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const selectedLabel = availableLabels.find((l) => l.id === selectedLabelId);
  const selectedItem = availableItems.find((i) => i.id === selectedItemId);

  return (
    <div className="space-y-6 border rounded-lg p-4 bg-gray-50">
      <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-3">
        💡 <strong>Tip:</strong> This question will have ONE pair only. Each pair = 1 point.
        Create multiple questions for multiple pairs.
      </div>

      {/* Create New Label/Item Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Create Label */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Create New Label
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newLabelText}
              onChange={(e) => setNewLabelText(e.target.value)}
              placeholder="Enter label text..."
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
            </button>
          </div>
        </div>

        {/* Create Item */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Create New Item
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Enter item text..."
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
            </button>
          </div>
        </div>
      </div>

      {/* Matching Interface */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-[1fr_auto_auto] gap-4 items-start">
          {/* Left: All Labels */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-3">Labels (Select one)</div>
            {availableLabels.length === 0 ? (
              <div className="text-sm text-gray-400 italic">No labels yet. Create one above.</div>
            ) : (
              availableLabels.map((label) => (
                <div key={label.id} className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedLabelId(label.id)}
                    disabled={disabled}
                    className={`flex-1 text-left px-4 py-3 border-2 rounded-lg transition-all ${
                      selectedLabelId === label.id
                        ? "border-blue-500 bg-blue-50 font-medium"
                        : "border-gray-300 bg-white hover:border-blue-300"
                    }`}
                  >
                    {label.text}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteLabel(label.id)}
                    disabled={disabled}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 border-2 border-red-300 rounded-lg transition-all"
                    title="Delete label"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Middle: Connection Line */}
          <div className="flex items-center justify-center pt-10">
            {selectedLabelId > 0 && selectedItemId > 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-green-500"></div>
                <div className="text-green-500 font-bold">→</div>
                <div className="w-8 h-0.5 bg-green-500"></div>
              </div>
            ) : (
              <div className="text-gray-300 text-2xl">···</div>
            )}
          </div>

          {/* Right: Items with Delete */}
          <div className="space-y-2 min-w-[250px]">
            <div className="text-sm font-medium text-gray-700 mb-3">Correct Answer (Select one)</div>
            {availableItems.length === 0 ? (
              <div className="text-sm text-gray-400 italic">No items yet. Create one above.</div>
            ) : (
              availableItems.map((item) => (
                <div key={item.id} className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedItemId(item.id)}
                    disabled={disabled}
                    className={`flex-1 text-left px-4 py-3 border-2 rounded-lg transition-all ${
                      selectedItemId === item.id
                        ? "border-green-500 bg-green-50 font-medium"
                        : "border-gray-300 bg-white hover:border-green-300"
                    }`}
                  >
                    {item.text}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    disabled={disabled}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 border-2 border-red-300 rounded-lg transition-all"
                    title="Delete item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Summary */}
      {selectedLabel && selectedItem && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm font-medium text-green-800 mb-1">✓ Pair Configured:</div>
          <div className="text-sm text-green-700">
            <strong>{selectedLabel.text}</strong> → <strong>{selectedItem.text}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

