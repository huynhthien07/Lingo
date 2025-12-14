"use client";

import { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface Flashcard {
  id: number;
  word: string;
  definition: string;
  pronunciation: string | null;
  example: string | null;
  synonyms: string | null;
  antonyms: string | null;
  partOfSpeech: string | null;
  audioUrl: string | null;
  imageUrl: string | null;
  difficulty: string | null;
  source: string;
}

interface Props {
  categoryId: number;
  flashcard: Flashcard | null;
  onClose: (refresh: boolean) => void;
}

const FlashcardFormModal = ({ categoryId, flashcard, onClose }: Props) => {
  const [formData, setFormData] = useState({
    word: "",
    definition: "",
    pronunciation: "",
    example: "",
    synonyms: "",
    antonyms: "",
    partOfSpeech: "",
    audioUrl: "",
    imageUrl: "",
    difficulty: "",
    source: "MANUAL",
  });

  const [searchWord, setSearchWord] = useState("");
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (flashcard) {
      setFormData({
        word: flashcard.word,
        definition: flashcard.definition,
        pronunciation: flashcard.pronunciation || "",
        example: flashcard.example || "",
        synonyms: flashcard.synonyms || "",
        antonyms: flashcard.antonyms || "",
        partOfSpeech: flashcard.partOfSpeech || "",
        audioUrl: flashcard.audioUrl || "",
        imageUrl: flashcard.imageUrl || "",
        difficulty: flashcard.difficulty || "",
        source: flashcard.source,
      });
    }
  }, [flashcard]);

  const handleSearchDictionary = async () => {
    if (!searchWord.trim()) {
      toast.error("Please enter a word to search");
      return;
    }

    setSearching(true);

    try {
      const response = await fetch(`/api/dictionary/${encodeURIComponent(searchWord)}`);
      const result = await response.json();

      if (result.success) {
        const data = result.data;
        setFormData({
          word: data.word,
          definition: data.definition,
          pronunciation: data.pronunciation,
          example: data.example,
          synonyms: data.synonyms,
          antonyms: data.antonyms,
          partOfSpeech: data.partOfSpeech,
          audioUrl: data.audioUrl,
          imageUrl: "",
          difficulty: "",
          source: "API",
        });
        toast.success("Word definition loaded from dictionary!");
      } else {
        toast.error(result.error || "Word not found in dictionary");
      }
    } catch (error) {
      console.error("Error searching dictionary:", error);
      toast.error("Failed to search dictionary");
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = flashcard
        ? `/api/teacher/flashcards/${flashcard.id}`
        : `/api/teacher/flashcard-categories/${categoryId}/flashcards`;

      const method = flashcard ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(
          flashcard
            ? "Flashcard updated successfully"
            : "Flashcard created successfully"
        );
        onClose(true);
      } else {
        toast.error(result.error || "Failed to save flashcard");
      }
    } catch (error) {
      console.error("Error saving flashcard:", error);
      toast.error("Failed to save flashcard");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div className="bg-white rounded-lg p-6 w-full max-w-3xl my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">
            {flashcard ? "Edit Flashcard" : "New Flashcard"}
          </h3>
          <button
            onClick={() => onClose(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dictionary Search */}
        {!flashcard && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Dictionary (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchWord}
                onChange={(e) => setSearchWord(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearchDictionary()}
                placeholder="Enter a word to search..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSearchDictionary}
                disabled={searching}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {searching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Search
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-2">
              Search for a word in the Free Dictionary API to auto-fill the form
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            {/* Word */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Word *
              </label>
              <input
                type="text"
                value={formData.word}
                onChange={(e) =>
                  setFormData({ ...formData, word: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            {/* Definition */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Definition *
              </label>
              <textarea
                value={formData.definition}
                onChange={(e) =>
                  setFormData({ ...formData, definition: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                required
              />
            </div>

            {/* Pronunciation */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Pronunciation
              </label>
              <input
                type="text"
                value={formData.pronunciation}
                onChange={(e) =>
                  setFormData({ ...formData, pronunciation: e.target.value })
                }
                placeholder="/həˈloʊ/"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Part of Speech */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Part of Speech
              </label>
              <input
                type="text"
                value={formData.partOfSpeech}
                onChange={(e) =>
                  setFormData({ ...formData, partOfSpeech: e.target.value })
                }
                placeholder="noun, verb, adjective..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Example */}
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Example Sentence
              </label>
              <textarea
                value={formData.example}
                onChange={(e) =>
                  setFormData({ ...formData, example: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={2}
              />
            </div>

            {/* Synonyms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Synonyms
              </label>
              <input
                type="text"
                value={formData.synonyms}
                onChange={(e) =>
                  setFormData({ ...formData, synonyms: e.target.value })
                }
                placeholder="Comma-separated"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Antonyms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Antonyms
              </label>
              <input
                type="text"
                value={formData.antonyms}
                onChange={(e) =>
                  setFormData({ ...formData, antonyms: e.target.value })
                }
                placeholder="Comma-separated"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Audio URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Audio URL
              </label>
              <input
                type="text"
                value={formData.audioUrl}
                onChange={(e) =>
                  setFormData({ ...formData, audioUrl: e.target.value })
                }
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Difficulty
              </label>
              <select
                value={formData.difficulty}
                onChange={(e) =>
                  setFormData({ ...formData, difficulty: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select difficulty</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end mt-6">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {flashcard ? "Update" : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlashcardFormModal;

