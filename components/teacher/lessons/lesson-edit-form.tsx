"use client";

import { useState } from "react";
import { Loader2, Save } from "lucide-react";
import { VideoUpload } from "@/components/ui/video-upload";

interface Lesson {
  id: number;
  title: string;
  description: string;
  skillType: string;
  estimatedDuration: number;
  videoUrl: string | null;
}

interface LessonEditFormProps {
  lesson: Lesson;
  onSave: (data: any) => Promise<void>;
  saving: boolean;
}

export function LessonEditForm({ lesson, onSave, saving }: LessonEditFormProps) {
  const [formData, setFormData] = useState({
    title: lesson.title,
    description: lesson.description || "",
    skillType: lesson.skillType,
    estimatedDuration: lesson.estimatedDuration || 30,
    videoUrl: lesson.videoUrl || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lesson Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe what students will learn in this lesson..."
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Skill Type *
          </label>
          <select
            value={formData.skillType}
            onChange={(e) => setFormData({ ...formData, skillType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
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
            Estimated Duration (minutes)
          </label>
          <input
            type="number"
            value={formData.estimatedDuration}
            onChange={(e) => setFormData({ ...formData, estimatedDuration: parseInt(e.target.value) || 0 })}
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lesson Video
        </label>
        <VideoUpload
          value={formData.videoUrl}
          onChange={(url) => setFormData({ ...formData, videoUrl: url })}
        />
      </div>

      <div className="flex items-center justify-end gap-3 pt-4">
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

