"use client";

import { useState } from "react";
import {
  Plus,
  Trash2,
  Edit,
  Clock,
  BookOpen,
  FileText,
  ChevronDown,
  ChevronUp,
  Headphones,
  MessageSquare,
  PenTool,
  BookMarked,
  Languages,
} from "lucide-react";
import { TestQuestionsManager } from "./test-questions-manager";
import { RichTextEditor } from "../exercises/rich-text-editor";
import { AudioUpload } from "@/components/ui/audio-upload";
import { ImageUpload } from "@/components/ui/image-upload";

interface TestSection {
  id: number;
  testId: number;
  title: string;
  skillType: string;
  order: number;
  duration: number | null;
  passage: string | null;
  imageSrc: string | null;
  audioSrc: string | null;
  questions: any[];
}

interface TestSectionsManagerProps {
  testId: number;
  sections: TestSection[];
  onUpdate: () => void;
}

export function TestSectionsManager({
  testId,
  sections,
  onUpdate,
}: TestSectionsManagerProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSection, setEditingSection] = useState<TestSection | null>(null);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set());

  const getSkillIcon = (skillType: string) => {
    switch (skillType) {
      case "LISTENING":
        return <Headphones className="w-5 h-5" />;
      case "READING":
        return <BookOpen className="w-5 h-5" />;
      case "WRITING":
        return <PenTool className="w-5 h-5" />;
      case "SPEAKING":
        return <MessageSquare className="w-5 h-5" />;
      case "VOCABULARY":
        return <Languages className="w-5 h-5" />;
      case "GRAMMAR":
        return <BookMarked className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const isManualScoring = (skillType: string) => {
    return skillType === "SPEAKING" || skillType === "WRITING";
  };

  const toggleSection = (sectionId: number) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const handleDeleteSection = async (sectionId: number) => {
    if (!confirm("Are you sure you want to delete this section? All questions will be deleted.")) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/tests/${testId}/sections/${sectionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      } else {
        alert("Failed to delete section");
      }
    } catch (error) {
      console.error("Error deleting section:", error);
      alert("Failed to delete section");
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Test Sections</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Section
        </button>
      </div>

      {/* Sections List */}
      {sections.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No sections added yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Add sections to organize your test questions
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Section Header */}
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-1 hover:bg-gray-100 rounded"
                      >
                        {expandedSections.has(section.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-600" />
                        )}
                      </button>
                      <div className="flex items-center gap-2">
                        {getSkillIcon(section.skillType)}
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {section.order}. {section.title}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className={`text-xs px-2 py-1 rounded-full ${
                                isManualScoring(section.skillType)
                                  ? "bg-orange-100 text-orange-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {section.skillType}
                            </span>
                            {section.duration && (
                              <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {section.duration} min
                              </span>
                            )}
                            <span className="text-xs text-gray-500">
                              {section.questions?.length || 0} questions
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingSection(section)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSection(section.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Questions Manager (Expanded) */}
              {expandedSections.has(section.id) && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  {/* Display Passage if exists */}
                  {section.passage && (
                    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        Reading Passage
                      </h4>
                      <div
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: section.passage }}
                      />
                    </div>
                  )}

                  {/* Display Image if exists */}
                  {section.imageSrc && (
                    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Section Image
                      </h4>
                      <img
                        src={section.imageSrc}
                        alt="Section context"
                        className="max-w-full h-auto rounded-lg border"
                      />
                    </div>
                  )}

                  {/* Display Audio if exists */}
                  {section.audioSrc && (
                    <div className="mb-4 p-4 bg-white rounded-lg border border-gray-200">
                      <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                        <Headphones className="w-4 h-4" />
                        Audio File
                      </h4>
                      <audio controls className="w-full">
                        <source src={section.audioSrc} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  )}

                  <TestQuestionsManager
                    testId={testId}
                    section={section}
                    onUpdate={onUpdate}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Section Modal */}
      {(showAddModal || editingSection) && (
        <SectionFormModal
          testId={testId}
          section={editingSection}
          onClose={() => {
            setShowAddModal(false);
            setEditingSection(null);
          }}
          onSuccess={() => {
            setShowAddModal(false);
            setEditingSection(null);
            onUpdate();
          }}
        />
      )}
    </div>
  );
}

// Section Form Modal Component
function SectionFormModal({
  testId,
  section,
  onClose,
  onSuccess,
}: {
  testId: number;
  section: TestSection | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: section?.title || "",
    skillType: section?.skillType || "LISTENING",
    duration: section?.duration || "",
    passage: section?.passage || "",
    imageSrc: section?.imageSrc || "",
    audioSrc: section?.audioSrc || "",
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = section
        ? `/api/teacher/tests/${testId}/sections/${section.id}`
        : `/api/teacher/tests/${testId}/sections`;

      // Prepare data with proper types
      const submitData = {
        title: formData.title,
        skillType: formData.skillType,
        duration: formData.duration ? parseInt(formData.duration as string) : null,
        passage: formData.passage || null,
        imageSrc: formData.imageSrc || null,
        audioSrc: formData.audioSrc || null,
      };

      console.log("Submitting section data:", submitData);

      const response = await fetch(url, {
        method: section ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const errorData = await response.json();
        console.error("Failed to save section:", errorData);
        alert(`Failed to save section: ${errorData.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving section:", error);
      alert(`Failed to save section: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg w-full max-w-4xl my-8 max-h-[90vh] flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold">
            {section ? "Edit Section" : "Add Section"}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Skill Type
            </label>
            <select
              value={formData.skillType}
              onChange={(e) => setFormData({ ...formData, skillType: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <optgroup label="Auto Scoring">
                <option value="LISTENING">Listening</option>
                <option value="READING">Reading</option>
                <option value="GRAMMAR">Grammar</option>
                <option value="VOCABULARY">Vocabulary</option>
              </optgroup>
              <optgroup label="Manual Scoring (Teacher Review)">
                <option value="SPEAKING">Speaking</option>
                <option value="WRITING">Writing</option>
              </optgroup>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duration (minutes) - Optional
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="1"
            />
          </div>

          {/* Passage field for Reading sections */}
          {(formData.skillType === "READING" || formData.skillType === "GRAMMAR" || formData.skillType === "VOCABULARY") && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passage / Reading Text (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                This passage will be shared across all questions in this section
              </p>
              <RichTextEditor
                value={formData.passage}
                onChange={(value) => setFormData({ ...formData, passage: value })}
                placeholder="Enter the reading passage here..."
              />
            </div>
          )}

          {/* Image field for all sections */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Section Image (Optional)
            </label>
            <p className="text-xs text-gray-500 mb-2">
              Add an image for context, diagram, chart, or illustration for this section
            </p>
            <ImageUpload
              value={formData.imageSrc}
              onChange={(value) => setFormData({ ...formData, imageSrc: value })}
            />
          </div>

          {/* Audio field for Listening sections */}
          {formData.skillType === "LISTENING" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audio File (Optional)
              </label>
              <p className="text-xs text-gray-500 mb-2">
                This audio will be shared across all questions in this section
              </p>
              <AudioUpload
                value={formData.audioSrc}
                onChange={(value) => setFormData({ ...formData, audioSrc: value })}
              />
            </div>
          )}
          </div>

          {/* Footer Buttons - Fixed at bottom */}
          <div className="border-t border-gray-200 p-6">
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? "Saving..." : section ? "Update Section" : "Add Section"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

