"use client";

import { useState } from "react";
import { Plus, Trash2, Check, X, ArrowUp, ArrowDown, Loader2 } from "lucide-react";
import { RichTextEditor } from "./rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import { AudioUpload } from "@/components/ui/audio-upload";

interface Option {
  id: number;
  text: string;
  correct: boolean;
  imageSrc: string | null;
  audioSrc: string | null;
  order: number;
}

interface ExerciseOptionsManagerProps {
  exerciseId: number;
  exerciseType: string;
  options: Option[];
  onUpdate: () => void;
}

export function ExerciseOptionsManager({
  exerciseId,
  exerciseType,
  options,
  onUpdate,
}: ExerciseOptionsManagerProps) {
  const [editingOption, setEditingOption] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: "",
    correct: false,
    imageSrc: "",
    audioSrc: "",
  });

  // Determine exercise format
  const isMultipleChoice = exerciseType.includes("MULTIPLE_CHOICE");
  const isFillInBlank = exerciseType.includes("COMPLETION") || exerciseType.includes("SHORT_ANSWER") || exerciseType.includes("FORM_COMPLETION");
  const isTrueFalse = exerciseType.includes("TRUE_FALSE");
  const isMatching = exerciseType.includes("MATCHING");

  // Determine if this exercise type needs options
  const needsOptions = !exerciseType.startsWith("WRITING_") && !exerciseType.startsWith("SPEAKING_");

  // Determine if options can have images/audio
  const canHaveImages = isMultipleChoice;
  const canHaveAudio = exerciseType.startsWith("LISTENING_");

  if (!needsOptions) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>This exercise type does not require answer options.</p>
        <p className="text-sm mt-2">
          {exerciseType.startsWith("WRITING_") && "Writing exercises are evaluated manually by teachers."}
          {exerciseType.startsWith("SPEAKING_") && "Speaking exercises are evaluated manually by teachers."}
        </p>
      </div>
    );
  }

  const handleAddOption = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/teacher/exercises/${exerciseId}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          order: options.length,
        }),
      });

      if (response.ok) {
        setFormData({ text: "", correct: false, imageSrc: "", audioSrc: "" });
        setShowAddForm(false);
        onUpdate();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to add option");
      }
    } catch (error) {
      console.error("Error adding option:", error);
      alert("Failed to add option");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOption = async (optionId: number, updates: Partial<Option>) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/teacher/exercises/${exerciseId}/options/${optionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        setEditingOption(null);
        onUpdate();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update option");
      }
    } catch (error) {
      console.error("Error updating option:", error);
      alert("Failed to update option");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    if (!confirm("Are you sure you want to delete this option?")) return;

    setLoading(true);

    try {
      const response = await fetch(`/api/teacher/exercises/${exerciseId}/options/${optionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      } else {
        const error = await response.json();
        alert(error.error || "Failed to delete option");
      }
    } catch (error) {
      console.error("Error deleting option:", error);
      alert("Failed to delete option");
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async (optionId: number, direction: "up" | "down") => {
    const currentIndex = options.findIndex((o) => o.id === optionId);
    if (currentIndex === -1) return;
    if (direction === "up" && currentIndex === 0) return;
    if (direction === "down" && currentIndex === options.length - 1) return;

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const swapOption = options[newIndex];

    setLoading(true);

    try {
      // Swap orders
      await Promise.all([
        fetch(`/api/teacher/exercises/${exerciseId}/options/${optionId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: swapOption.order }),
        }),
        fetch(`/api/teacher/exercises/${exerciseId}/options/${swapOption.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: options[currentIndex].order }),
        }),
      ]);

      onUpdate();
    } catch (error) {
      console.error("Error reordering options:", error);
      alert("Failed to reorder options");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Options List */}
      {options.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No answer options yet. Click "Add Option" to create one.
        </div>
      ) : (
        <div className="space-y-3">
          {options
            .sort((a, b) => a.order - b.order)
            .map((option, index) => (
              <div
                key={option.id}
                className={`border rounded-lg p-4 ${
                  option.correct ? "border-green-500 bg-green-50" : "border-gray-300"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Order Badge */}
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                    {index + 1}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div
                      className="prose prose-sm max-w-none mb-2"
                      dangerouslySetInnerHTML={{ __html: option.text }}
                    />
                    {option.imageSrc && (
                      <img
                        src={option.imageSrc}
                        alt="Option"
                        className="max-w-xs rounded border border-gray-300 mb-2"
                      />
                    )}
                    {option.audioSrc && (
                      <audio src={option.audioSrc} controls className="mb-2" />
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      {option.correct ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                          <Check className="w-3 h-3" />
                          Correct Answer
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                          <X className="w-3 h-3" />
                          Incorrect
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex-shrink-0 flex flex-col gap-1">
                    <button
                      onClick={() => handleReorder(option.id, "up")}
                      disabled={index === 0 || loading}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                      title="Move Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleReorder(option.id, "down")}
                      disabled={index === options.length - 1 || loading}
                      className="p-1 hover:bg-gray-100 rounded disabled:opacity-30"
                      title="Move Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteOption(option.id)}
                      disabled={loading}
                      className="p-1 hover:bg-red-100 text-red-600 rounded disabled:opacity-30"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add Option Button/Form */}
      {!showAddForm ? (
        <button
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Option
        </button>
      ) : (
        <form onSubmit={handleAddOption} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
          <h4 className="font-semibold mb-3">Add New Option</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Option Text *
              </label>
              <RichTextEditor
                value={formData.text}
                onChange={(value) => setFormData({ ...formData, text: value })}
              />
            </div>

            {canHaveImages && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image (Optional)
                </label>
                <ImageUpload
                  value={formData.imageSrc}
                  onChange={(url) => setFormData({ ...formData, imageSrc: url })}
                />
              </div>
            )}

            {canHaveAudio && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Audio (Optional)
                </label>
                <AudioUpload
                  value={formData.audioSrc}
                  onChange={(url) => setFormData({ ...formData, audioSrc: url })}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="correct"
                checked={formData.correct}
                onChange={(e) => setFormData({ ...formData, correct: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="correct" className="text-sm font-medium text-gray-700">
                This is the correct answer
              </label>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <button
                type="submit"
                disabled={loading || !formData.text.trim()}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="w-5 h-5" />
                    Add Option
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAddForm(false);
                  setFormData({ text: "", correct: false, imageSrc: "", audioSrc: "" });
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
