"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Volume2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
} from "lucide-react";
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
  // Progress
  progressId: number | null;
  status: string | null;
  correctCount: number | null;
  incorrectCount: number | null;
  lastReviewedAt: string | null;
}

interface Props {
  categoryId: number;
}

const FlashcardLearning = ({ categoryId }: Props) => {
  const router = useRouter();
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    fetchFlashcards();
  }, [categoryId]);

  const fetchFlashcards = async () => {
    try {
      const response = await fetch(
        `/api/student/flashcard-categories/${categoryId}/flashcards`
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

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleProgress = async (isCorrect: boolean) => {
    const flashcard = flashcards[currentIndex];

    try {
      const response = await fetch(
        `/api/student/flashcards/${flashcard.id}/progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isCorrect }),
        }
      );

      const result = await response.json();

      if (result.success) {
        toast.success(isCorrect ? "Great job! ✓" : "Keep practicing!");
        
        // Update local flashcard progress
        const updatedFlashcards = [...flashcards];
        updatedFlashcards[currentIndex] = {
          ...updatedFlashcards[currentIndex],
          progressId: result.data.id,
          status: result.data.status,
          correctCount: result.data.correctCount,
          incorrectCount: result.data.incorrectCount,
        };
        setFlashcards(updatedFlashcards);

        // Auto advance to next card
        setTimeout(() => {
          handleNext();
        }, 500);
      }
    } catch (error) {
      console.error("Error updating progress:", error);
      toast.error("Failed to update progress");
    }
  };

  const playAudio = () => {
    const flashcard = flashcards[currentIndex];
    if (flashcard.audioUrl) {
      const audio = new Audio(flashcard.audioUrl);
      audio.play();
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  if (flashcards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600 mb-4">No flashcards in this category yet</p>
        <button
          onClick={() => router.push("/student/flashcards")}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Categories
        </button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/student/flashcards")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Flashcard {currentIndex + 1} of {flashcards.length}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              {currentCard.status && (
                <span className={`px-2 py-1 rounded ${
                  currentCard.status === "MASTERED"
                    ? "bg-green-100 text-green-700"
                    : currentCard.status === "LEARNING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700"
                }`}>
                  {currentCard.status}
                </span>
              )}
              {currentCard.correctCount !== null && (
                <span>
                  ✓ {currentCard.correctCount} | ✗ {currentCard.incorrectCount}
                </span>
              )}
            </div>
          </div>

          <div className="text-sm text-gray-600">
            Progress: {Math.round(((currentIndex + 1) / flashcards.length) * 100)}%
          </div>
        </div>
      </div>

      {/* Flashcard */}
      <div className="mb-6">
        <div
          className="relative w-full h-96 cursor-pointer perspective-1000"
          onClick={handleFlip}
        >
          <div
            className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
              isFlipped ? "rotate-y-180" : ""
            }`}
            style={{
              transformStyle: "preserve-3d",
              transition: "transform 0.6s",
              transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            }}
          >
            {/* Front Side */}
            <div
              className="absolute w-full h-full backface-hidden bg-white border-2 border-blue-500 rounded-xl shadow-lg flex flex-col items-center justify-center p-8"
              style={{ backfaceVisibility: "hidden" }}
            >
              <div className="text-center">
                <h2 className="text-5xl font-bold text-gray-900 mb-4">
                  {currentCard.word}
                </h2>
                {currentCard.pronunciation && (
                  <p className="text-xl text-gray-600 mb-4">
                    {currentCard.pronunciation}
                  </p>
                )}
                {currentCard.partOfSpeech && (
                  <p className="text-sm text-gray-500 italic mb-4">
                    {currentCard.partOfSpeech}
                  </p>
                )}
                {currentCard.audioUrl && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playAudio();
                    }}
                    className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                  >
                    <Volume2 className="w-5 h-5" />
                    Play Audio
                  </button>
                )}
              </div>
              <p className="absolute bottom-4 text-sm text-gray-400">
                Click to flip
              </p>
            </div>

            {/* Back Side */}
            <div
              className="absolute w-full h-full backface-hidden bg-white border-2 border-green-500 rounded-xl shadow-lg flex flex-col items-center justify-center p-8"
              style={{
                backfaceVisibility: "hidden",
                transform: "rotateY(180deg)",
              }}
            >
              <div className="text-center max-w-2xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Definition
                </h3>
                <p className="text-lg text-gray-700 mb-6">
                  {currentCard.definition}
                </p>

                {currentCard.example && (
                  <div className="mb-4">
                    <h4 className="text-sm font-semibold text-gray-600 mb-2">
                      Example:
                    </h4>
                    <p className="text-gray-700 italic">"{currentCard.example}"</p>
                  </div>
                )}

                {currentCard.synonyms && (
                  <div className="mb-2">
                    <span className="text-sm font-semibold text-gray-600">
                      Synonyms:
                    </span>{" "}
                    <span className="text-sm text-gray-700">
                      {currentCard.synonyms}
                    </span>
                  </div>
                )}

                {currentCard.antonyms && (
                  <div>
                    <span className="text-sm font-semibold text-gray-600">
                      Antonyms:
                    </span>{" "}
                    <span className="text-sm text-gray-700">
                      {currentCard.antonyms}
                    </span>
                  </div>
                )}
              </div>
              <p className="absolute bottom-4 text-sm text-gray-400">
                Click to flip back
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-5 h-5" />
          Previous
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleProgress(false)}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            <X className="w-5 h-5" />
            Hard
          </button>

          <button
            onClick={() => setIsFlipped(!isFlipped)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
          >
            <RotateCcw className="w-5 h-5" />
            Flip
          </button>

          <button
            onClick={() => handleProgress(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            <Check className="w-5 h-5" />
            Easy
          </button>
        </div>

        <button
          onClick={handleNext}
          disabled={currentIndex === flashcards.length - 1}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardLearning;

