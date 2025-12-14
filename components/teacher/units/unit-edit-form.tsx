"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";

interface Unit {
  id: number;
  title: string;
  description: string;
  courseId: number;
  order: number;
}

interface UnitEditFormProps {
  unit: Unit;
  onSave: (data: Partial<Unit>) => Promise<void>;
  saving: boolean;
}

export function UnitEditForm({ unit, onSave, saving }: UnitEditFormProps) {
  const [formData, setFormData] = useState({
    title: unit.title,
    description: unit.description,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Unit Title *
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
          Description *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
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

