"use client";

import { useState } from "react";
import { Plus, Trash2, Save, X } from "lucide-react";
import { RichTextEditor } from "./rich-text-editor";
import { ImageUpload } from "@/components/ui/image-upload";
import { AudioUpload } from "@/components/ui/audio-upload";

interface Option {
  id: number;
  questionId: number;
  text: string;
  correct: boolean;
  imageSrc?: string;
  audioSrc?: string;
  order: number;
}

interface OptionsManagerProps {
  questionId: number;
  options: Option[];
  exerciseType: string;
  canHaveImages: boolean;
  canHaveAudio?: boolean;
  onUpdate: () => void;
}

export function OptionsManager({
  questionId,
  options,
  exerciseType,
  canHaveImages,
  canHaveAudio = false,
  onUpdate,
}: OptionsManagerProps) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingOption, setEditingOption] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    text: "",
    correct: false,
    imageSrc: "",
    audioSrc: "",
  });

  const isMultipleChoice = exerciseType.includes("MULTIPLE_CHOICE");
  const isFillInBlank = exerciseType.includes("COMPLETION") || exerciseType.includes("SHORT_ANSWER");

  const handleAddOption = () => {
    setFormData({ text: "", correct: false, imageSrc: "", audioSrc: "" });
    setShowAddForm(true);
  };

  const handleSaveOption = async () => {
    if (!formData.text.trim()) {
      alert("Please enter option text");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/questions/${questionId}/options`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          order: options.length + 1,
        }),
      });

      if (response.ok) {
        setShowAddForm(false);
        setFormData({ text: "", correct: false, imageSrc: "", audioSrc: "" });
        onUpdate();
      } else {
        alert("Failed to add option");
      }
    } catch (error) {
      console.error("Error adding option:", error);
      alert("Failed to add option");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOption = async (optionId: number) => {
    if (!confirm("Are you sure you want to delete this option?")) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/questions/${questionId}/options/${optionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert("Failed to delete option");
      }
    } catch (error) {
      console.error("Error deleting option:", error);
      alert("Failed to delete option");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Options List */}
      {options.length === 0 ? (
        <p className="text-sm text-gray-500 italic">No options yet</p>
      ) : (
        <div className="space-y-2">
          {options.map((option, idx) => (
            <div
              key={option.id}
              className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg"
            >
              <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-gray-200 text-gray-700 text-xs font-semibold rounded-full">
                {idx + 1}
              </span>
              <div className="flex-1">
                <div
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: option.text }}
                />
                {option.imageSrc && (
                  <img src={option.imageSrc} alt="Option" className="mt-2 max-w-xs rounded" />
                )}
                {option.audioSrc && (
                  <audio src={option.audioSrc} controls className="mt-2 w-full max-w-xs" />
                )}
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded ${
                    option.correct
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {option.correct ? "Correct" : "Incorrect"}
                </span>
                <button
                  onClick={() => handleDeleteOption(option.id)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Option Button */}
      {!showAddForm && (
        <button
          onClick={handleAddOption}
          className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add {isMultipleChoice ? "Option" : "Answer"}
        </button>
      )}

      {/* Add Option Form */}
      {showAddForm && (
        <div className="p-4 bg-white border-2 border-blue-300 rounded-lg space-y-3">
          <div className="flex items-center justify-between mb-2">
            <h5 className="font-semibold text-sm">
              Add {isMultipleChoice ? "Option" : "Answer"}
            </h5>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1 text-gray-500 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {isMultipleChoice ? "Option Text" : "Answer Text"}
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

          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={handleSaveOption}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              {loading ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
