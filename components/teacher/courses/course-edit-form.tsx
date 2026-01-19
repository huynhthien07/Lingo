"use client";

import { useState } from "react";
import { Save, Loader2 } from "lucide-react";
import { ImageUpload } from "@/components/ui/image-upload";
import { PriceInput } from "@/components/ui/price-input";

interface Course {
  id: number;
  title: string;
  imageSrc: string;
  description: string | null;
  examType: string;
  level: string;
  price: number;
  currency: string;
  isFree: boolean;
  bandFrom: number | null;
  bandTo: number | null;
  courseGoal: string | null;
  enrollmentCount: number;
}

interface CourseEditFormProps {
  course: Course;
  onSave: (data: Partial<Course>) => Promise<void>;
  saving: boolean;
}

export function CourseEditForm({ course, onSave, saving }: CourseEditFormProps) {
  const [formData, setFormData] = useState({
    title: course.title,
    imageSrc: course.imageSrc,
    description: course.description || "",
    examType: course.examType,
    level: course.level,
    price: course.price,
    currency: course.currency,
    isFree: course.isFree,
    bandFrom: course.bandFrom || 5.0,
    bandTo: course.bandTo || 6.0,
    courseGoal: course.courseGoal || "IELTS",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Title *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        {/* Course Image */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Image *
          </label>
          <ImageUpload
            value={formData.imageSrc}
            onChange={(url) => setFormData({ ...formData, imageSrc: url })}
            disabled={saving}
          />
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Exam Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exam Type *
          </label>
          <select
            value={formData.examType}
            onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="IELTS">IELTS</option>
            <option value="TOEFL">TOEFL</option>
            <option value="TOEIC">TOEIC</option>
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Level *
          </label>
          <select
            value={formData.level}
            onChange={(e) => setFormData({ ...formData, level: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
        </div>

        {/* Is Free */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="isFree"
            checked={formData.isFree}
            onChange={(e) => setFormData({ ...formData, isFree: e.target.checked })}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="isFree" className="text-sm font-medium text-gray-700">
            Free Course
          </label>
        </div>

        {/* Price */}
        {!formData.isFree && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <PriceInput
                value={formData.price}
                onChange={(value) => setFormData({ ...formData, price: value })}
                currency={formData.currency}
                disabled={saving}
                required={!formData.isFree}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Currency *
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required={!formData.isFree}
              >
                <option value="USD">USD</option>
                <option value="VND">VND</option>
                <option value="EUR">EUR</option>
              </select>
            </div>
          </>
        )}

        {/* Band Range - For Course Recommendation */}
        <div className="md:col-span-2 border-t pt-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            Course Recommendation Settings
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Set the band score range for this course to enable personalized recommendations
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Band From (Minimum Entry Level)
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="9"
            value={formData.bandFrom}
            onChange={(e) => setFormData({ ...formData, bandFrom: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 5.0"
            disabled={saving}
          />
          <p className="text-xs text-gray-500 mt-1">
            Minimum band score required to enroll (0-9, step 0.5)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Band To (Target Level)
          </label>
          <input
            type="number"
            step="0.5"
            min="0"
            max="9"
            value={formData.bandTo}
            onChange={(e) => setFormData({ ...formData, bandTo: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 6.0"
            disabled={saving}
          />
          <p className="text-xs text-gray-500 mt-1">
            Target band score after completing the course (0-9, step 0.5)
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Course Goal
          </label>
          <select
            value={formData.courseGoal}
            onChange={(e) => setFormData({ ...formData, courseGoal: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={saving}
          >
            <option value="IELTS">IELTS Preparation</option>
            <option value="GENERAL_ENGLISH">General English</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Select the primary goal of this course for better recommendations
          </p>
        </div>

        <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Enrollment Count:</strong> {course.enrollmentCount} students
          </p>
          <p className="text-xs text-gray-500 mt-1">
            This metric is used for popularity ranking in recommendations
          </p>
        </div>
      </div>

      {/* Submit Button */}
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

