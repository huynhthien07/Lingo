"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Label {
  id: number;
  text: string;
}

interface Position {
  id: number;
  text: string;
}

interface SimpleLabelingEditorProps {
  challengeId: number; // Exercise ID - scope labels/items to this exercise
  value: {
    version: 2;
    correctMappings: Array<{ positionId: number; targetId: number }>;
  };
  onChange: (value: any) => void;
  disabled?: boolean;
}

/**
 * Simple Labeling Editor - For creating ONE mapping per question
 * Each question = 1 mapping = 1 point
 * Position (left) → Target (right)
 * Labels/Items are scoped to the challenge (exercise)
 */
export function SimpleLabelingEditor({
  challengeId,
  value,
  onChange,
  disabled = false,
}: SimpleLabelingEditorProps) {
  const [availablePositions, setAvailablePositions] = useState<Position[]>([]);
  const [availableTargets, setAvailableTargets] = useState<Label[]>([]);
  const [selectedPositionId, setSelectedPositionId] = useState<number>(0);
  const [selectedTargetId, setSelectedTargetId] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  // New position/target inline creation
  const [newPositionText, setNewPositionText] = useState("");
  const [newTargetText, setNewTargetText] = useState("");
  const [creating, setCreating] = useState(false);

  // Load existing selection
  useEffect(() => {
    if (value?.correctMappings?.[0]) {
      setSelectedPositionId(value.correctMappings[0].positionId);
      setSelectedTargetId(value.correctMappings[0].targetId);
    }
  }, [value]);

  // Fetch pool data (positions and targets)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch positions from labels API (scoped to challenge)
        // Fetch targets from items API (scoped to challenge)
        const [positionsRes, targetsRes] = await Promise.all([
          fetch(`/api/teacher/question-pool/labels?challengeId=${challengeId}`),
          fetch(`/api/teacher/question-pool/items?challengeId=${challengeId}`),
        ]);

        if (!positionsRes.ok || !targetsRes.ok) {
          throw new Error("Failed to fetch pool data");
        }

        const positionsData = await positionsRes.json();
        const targetsData = await targetsRes.json();

        setAvailablePositions(positionsData.labels || []);
        setAvailableTargets(targetsData.items || []);
      } catch (error) {
        console.error("Error fetching pool data:", error);
        toast.error("Failed to load positions/targets");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [challengeId]);

  // Update parent when selection changes
  useEffect(() => {
    if (selectedPositionId && selectedTargetId) {
      onChange({
        version: 2,
        correctMappings: [{ positionId: selectedPositionId, targetId: selectedTargetId }],
      });
    }
  }, [selectedPositionId, selectedTargetId, onChange]);

  // Create new position inline
  const handleCreatePosition = async () => {
    if (!newPositionText.trim()) {
      toast.error("Position text is required");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/teacher/question-pool/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId,
          text: newPositionText.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create position");

      const data = await res.json();
      setAvailablePositions([...availablePositions, data.label]);
      setSelectedPositionId(data.label.id);
      setNewPositionText("");
      toast.success("Position created");
    } catch (error) {
      console.error("Error creating position:", error);
      toast.error("Failed to create position");
    } finally {
      setCreating(false);
    }
  };

  // Create new target inline
  const handleCreateTarget = async () => {
    if (!newTargetText.trim()) {
      toast.error("Target text is required");
      return;
    }

    try {
      setCreating(true);
      const res = await fetch("/api/teacher/question-pool/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          challengeId,
          text: newTargetText.trim(),
        }),
      });

      if (!res.ok) throw new Error("Failed to create target");

      const data = await res.json();
      setAvailableTargets([...availableTargets, data.item]);
      setSelectedTargetId(data.item.id);
      setNewTargetText("");
      toast.success("Target created");
    } catch (error) {
      console.error("Error creating target:", error);
      toast.error("Failed to create target");
    } finally {
      setCreating(false);
    }
  };

  // Delete position
  const handleDeletePosition = async (positionId: number) => {
    if (!confirm("Are you sure you want to delete this position?")) {
      return;
    }

    try {
      const res = await fetch(`/api/teacher/question-pool/labels/${positionId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete position");
      }

      setAvailablePositions(availablePositions.filter((p) => p.id !== positionId));
      if (selectedPositionId === positionId) {
        setSelectedPositionId(0);
      }
      toast.success("Position deleted");
    } catch (error) {
      console.error("Error deleting position:", error);
      toast.error("Failed to delete position");
    }
  };

  // Delete target
  const handleDeleteTarget = async (targetId: number) => {
    if (!confirm("Are you sure you want to delete this target?")) {
      return;
    }

    try {
      const res = await fetch(`/api/teacher/question-pool/items/${targetId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete target");
      }

      setAvailableTargets(availableTargets.filter((t) => t.id !== targetId));
      if (selectedTargetId === targetId) {
        setSelectedTargetId(0);
      }
      toast.success("Target deleted");
    } catch (error) {
      console.error("Error deleting target:", error);
      toast.error("Failed to delete target");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    );
  }

  const selectedPosition = availablePositions.find((p) => p.id === selectedPositionId);
  const selectedTarget = availableTargets.find((t) => t.id === selectedTargetId);

  return (
    <div className="space-y-6 border rounded-lg p-4 bg-gray-50">
      <div className="text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded p-3">
        💡 <strong>Tip:</strong> This question will have ONE mapping only. Each mapping = 1 point.
        Create multiple questions for multiple mappings.
      </div>

      {/* Create New Position and Target Section */}
      <div className="grid grid-cols-2 gap-4">
        {/* Create Position */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Create New Position
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newPositionText}
              onChange={(e) => setNewPositionText(e.target.value)}
              placeholder="Enter position text..."
              disabled={disabled || creating}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreatePosition();
                }
              }}
            />
            <button
              type="button"
              onClick={handleCreatePosition}
              disabled={disabled || creating || !newPositionText.trim()}
              className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Create Target */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Create New Target
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTargetText}
              onChange={(e) => setNewTargetText(e.target.value)}
              placeholder="Enter target text..."
              disabled={disabled || creating}
              className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleCreateTarget();
                }
              }}
            />
            <button
              type="button"
              onClick={handleCreateTarget}
              disabled={disabled || creating || !newTargetText.trim()}
              className="flex items-center gap-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Labeling Interface */}
      <div className="bg-white border rounded-lg p-4">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* Left: Positions */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-3">Positions (Select one)</div>
            {availablePositions.length === 0 ? (
              <div className="text-sm text-gray-400 italic">No positions yet. Create one above.</div>
            ) : (
              availablePositions.map((position) => (
                <div key={position.id} className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPositionId(position.id)}
                    disabled={disabled}
                    className={`flex-1 text-left px-4 py-3 border-2 rounded-lg transition-all ${
                      selectedPositionId === position.id
                        ? "border-blue-500 bg-blue-50 font-medium"
                        : "border-gray-300 bg-white hover:border-blue-300"
                    }`}
                  >
                    {position.text}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePosition(position.id)}
                    disabled={disabled}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 border-2 border-red-300 rounded-lg transition-all"
                    title="Delete position"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Middle: Connection Line */}
          <div className="flex items-center justify-center pt-10">
            {selectedPositionId > 0 && selectedTargetId > 0 ? (
              <div className="flex items-center gap-2">
                <div className="w-8 h-0.5 bg-green-500"></div>
                <div className="text-green-500 font-bold">→</div>
                <div className="w-8 h-0.5 bg-green-500"></div>
              </div>
            ) : (
              <div className="text-gray-300 text-2xl">···</div>
            )}
          </div>

          {/* Right: Targets */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-700 mb-3">Targets (Select correct answer)</div>
            {availableTargets.length === 0 ? (
              <div className="text-sm text-gray-400 italic">No targets yet. Create one above.</div>
            ) : (
              availableTargets.map((target) => (
                <div key={target.id} className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTargetId(target.id)}
                    disabled={disabled}
                    className={`flex-1 text-left px-4 py-3 border-2 rounded-lg transition-all ${
                      selectedTargetId === target.id
                        ? "border-green-500 bg-green-50 font-medium"
                        : "border-gray-300 bg-white hover:border-green-300"
                    }`}
                  >
                    {target.text}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteTarget(target.id)}
                    disabled={disabled}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 border-2 border-red-300 rounded-lg transition-all"
                    title="Delete target"
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
      {selectedPosition && selectedTarget && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm font-medium text-green-800 mb-1">✓ Mapping Configured:</div>
          <div className="text-sm text-green-700">
            <strong>{selectedPosition.text}</strong> → <strong>{selectedTarget.text}</strong>
          </div>
        </div>
      )}
    </div>
  );
}

