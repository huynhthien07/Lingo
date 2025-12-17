"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { RichTextEditor } from "./rich-text-editor";
import { AudioUpload } from "@/components/ui/audio-upload";
import { ImageUpload } from "@/components/ui/image-upload";

interface Exercise {
  id: number;
  question: string;
  type: string;
  difficulty: string;
  points: number;
  passage: string | null;
  audioSrc: string | null;
  imageSrc: string | null;
  explanation: string | null;
}

interface ExerciseInfoFormProps {
  exercise: Exercise;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}

// IELTS Challenge Types grouped by skill
const CHALLENGE_TYPES = {
  LISTENING: [
    { value: "LISTENING_MULTIPLE_CHOICE", label: "Multiple Choice" },
    { value: "LISTENING_FORM_COMPLETION", label: "Form Completion" },
    { value: "LISTENING_MAP_LABELLING", label: "Map Labelling" },
    { value: "LISTENING_SHORT_ANSWER", label: "Short Answer" },
  ],
  READING: [
    { value: "READING_MULTIPLE_CHOICE", label: "Multiple Choice" },
    { value: "READING_TRUE_FALSE_NOT_GIVEN", label: "True/False/Not Given" },
    { value: "READING_MATCHING_HEADINGS", label: "Matching Headings" },
    { value: "READING_SENTENCE_COMPLETION", label: "Sentence Completion" },
    { value: "READING_SUMMARY_COMPLETION", label: "Summary Completion" },
  ],
  WRITING: [
    { value: "WRITING_TASK_1", label: "Task 1 (Describe Visual)" },
    { value: "WRITING_TASK_2", label: "Task 2 (Essay)" },
    { value: "WRITING_PRACTICE", label: "Practice" },
  ],
  SPEAKING: [
    { value: "SPEAKING_PART_1", label: "Part 1 (Interview)" },
    { value: "SPEAKING_PART_2", label: "Part 2 (Long Turn)" },
    { value: "SPEAKING_PART_3", label: "Part 3 (Discussion)" },
  ],
};

export function ExerciseInfoForm({ exercise, onSave, saving }: ExerciseInfoFormProps) {
  const [formData, setFormData] = useState({
    question: exercise.question,
    type: exercise.type,
    difficulty: exercise.difficulty,
    points: exercise.points,
    passage: exercise.passage || "",
    audioSrc: exercise.audioSrc || "",
    imageSrc: exercise.imageSrc || "",
    explanation: exercise.explanation || "",
  });

  // Determine skill category from type
  const getSkillCategory = (type: string): string => {
    if (type.startsWith("LISTENING_")) return "LISTENING";
    if (type.startsWith("READING_")) return "READING";
    if (type.startsWith("WRITING_")) return "WRITING";
    if (type.startsWith("SPEAKING_")) return "SPEAKING";
    return "LISTENING";
  };

  const [skillCategory, setSkillCategory] = useState(getSkillCategory(formData.type));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  const handleSkillCategoryChange = (category: string) => {
    setSkillCategory(category);
    // Set first type of the category
    const firstType = CHALLENGE_TYPES[category as keyof typeof CHALLENGE_TYPES][0].value;
    setFormData({ ...formData, type: firstType });
  };

  const needsPassage = formData.type.startsWith("READING_");
  const needsAudio = formData.type.startsWith("LISTENING_");
  const needsImage = formData.type === "LISTENING_MAP_LABELLING" || formData.type === "WRITING_TASK_1";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Question with Rich Text Editor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Question *
        </label>
        <RichTextEditor
          value={formData.question}
          onChange={(value) => setFormData({ ...formData, question: value })}
        />
      </div>

      {/* Type Selection */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skill Category *
          </label>
          <select
            value={skillCategory}
            onChange={(e) => handleSkillCategoryChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="LISTENING">Listening</option>
            <option value="READING">Reading</option>
            <option value="WRITING">Writing</option>
            <option value="SPEAKING">Speaking</option>
            <option value="VOCABULARY">Vocabulary</option>
            <option value="GRAMMAR">Grammar</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exercise Type *
          </label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            {CHALLENGE_TYPES[skillCategory as keyof typeof CHALLENGE_TYPES].map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Difficulty and Points */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Difficulty *
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="EASY">Easy</option>
            <option value="MEDIUM">Medium</option>
            <option value="HARD">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Points *
          </label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) || 0 })}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      </div>

      {/* Reading Passage (for Reading exercises) */}
      {needsPassage && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Reading Passage *
          </label>
          <RichTextEditor
            value={formData.passage}
            onChange={(value) => setFormData({ ...formData, passage: value })}
          />
          <p className="text-xs text-gray-500 mt-1">
            The text that students will read for this exercise
          </p>
        </div>
      )}

      {/* Audio (for Listening exercises) */}
      {needsAudio && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Audio File *
          </label>
          <AudioUpload
            value={formData.audioSrc}
            onChange={(url) => setFormData({ ...formData, audioSrc: url })}
          />
        </div>
      )}

      {/* Image (for Map Labelling or Writing Task 1) */}
      {needsImage && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Image {formData.type === "LISTENING_MAP_LABELLING" ? "(Map)" : "(Chart/Graph/Diagram)"}
          </label>
          <ImageUpload
            value={formData.imageSrc}
            onChange={(url) => setFormData({ ...formData, imageSrc: url })}
          />
        </div>
      )}

      {/* Explanation */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Explanation (Optional)
        </label>
        <RichTextEditor
          value={formData.explanation}
          onChange={(value) => setFormData({ ...formData, explanation: value })}
        />
        <p className="text-xs text-gray-500 mt-1">
          Explanation shown to students after they answer
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  );
}
