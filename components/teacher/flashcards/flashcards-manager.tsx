"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  ArrowLeft,
  Edit,
  Trash2,
  BookOpen,
  Volume2,
} from "lucide-react";
import toast from "react-hot-toast";
import FlashcardFormModal from "./flashcard-form-modal";

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
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
  description: string | null;
}

interface Props {
  categoryId: number;
}

const FlashcardsManager = ({ categoryId }: Props) => {
  const router = useRouter();
  const [category, setCategory] = useState<Category | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingFlashcard, setEditingFlashcard] = useState<Flashcard | null>(null);

  useEffect(() => {
    fetchCategory();
    fetchFlashcards();
  }, [categoryId]);

  const fetchCategory = async () => {
    try {
      const response = await fetch(`/api/teacher/flashcard-categories/${categoryId}`);
      const result = await response.json();

      if (result.success) {
        setCategory(result.data);
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      toast.error("Failed to load category");
    }
  };

  const fetchFlashcards = async () => {
    try {
      const response = await fetch(
        `/api/teacher/flashcard-categories/${categoryId}/flashcards?search=${searchQuery}`
      );
      const result = await response.json();

      if (result.success) {
        setFlashcards(result.data);
      }
    } catch (error) {
      console.error("Error fetching flashcards:", error);
      toast.error("Failed to load flashcards");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchFlashcards();
  };

  const handleEdit = (flashcard: Flashcard) => {
    setEditingFlashcard(flashcard);
    setShowModal(true);
  };

  const handleDelete = async (flashcardId: number) => {
    if (!confirm("Are you sure you want to delete this flashcard?")) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/flashcards/${flashcardId}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        toast.success("Flashcard deleted successfully");
        fetchFlashcards();
      } else {
        toast.error(result.error || "Failed to delete flashcard");
      }
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      toast.error("Failed to delete flashcard");
    }
  };

  const openCreateModal = () => {
    setEditingFlashcard(null);
    setShowModal(true);
  };

  const handleModalClose = (refresh: boolean) => {
    setShowModal(false);
    setEditingFlashcard(null);
    if (refresh) {
      fetchFlashcards();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/teacher/flashcards")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {category?.name || "Flashcards"}
            </h1>
            {category?.description && (
              <p className="text-gray-600 mt-1">{category.description}</p>
            )}
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Flashcard
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search flashcards..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            Search
          </button>
        </div>
      </div>

      {/* Flashcards List */}
      {flashcards.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No flashcards yet</p>
          <p className="text-sm text-gray-500 mt-1">
            Add your first flashcard manually or fetch from dictionary
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map((flashcard) => (
            <FlashcardCard
              key={flashcard.id}
              flashcard={flashcard}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <FlashcardFormModal
          categoryId={categoryId}
          flashcard={editingFlashcard}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

// Flashcard Card Component
const FlashcardCard = ({
  flashcard,
  onEdit,
  onDelete,
}: {
  flashcard: Flashcard;
  onEdit: (flashcard: Flashcard) => void;
  onDelete: (id: number) => void;
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-lg">{flashcard.word}</h3>
            {flashcard.pronunciation && (
              <span className="text-sm text-gray-500">
                {flashcard.pronunciation}
              </span>
            )}
            {flashcard.audioUrl && (
              <button
                onClick={() => {
                  const audio = new Audio(flashcard.audioUrl!);
                  audio.play();
                }}
                className="text-blue-600 hover:text-blue-700"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            )}
          </div>
          {flashcard.partOfSpeech && (
            <span className="text-xs text-gray-500 italic">
              {flashcard.partOfSpeech}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit(flashcard)}
            className="p-1 text-gray-600 hover:text-blue-600"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(flashcard.id)}
            className="p-1 text-gray-600 hover:text-red-600"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <p className="text-sm text-gray-700 mb-2">{flashcard.definition}</p>

      {flashcard.example && (
        <p className="text-xs text-gray-600 italic mb-2">
          Example: {flashcard.example}
        </p>
      )}

      <div className="flex items-center gap-2 text-xs">
        {flashcard.source === "API" && (
          <span className="px-2 py-1 bg-green-100 text-green-700 rounded">
            From Dictionary
          </span>
        )}
        {flashcard.difficulty && (
          <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded">
            {flashcard.difficulty}
          </span>
        )}
      </div>
    </div>
  );
};

export default FlashcardsManager;

