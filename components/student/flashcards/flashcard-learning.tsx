"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Volume2,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Check,
  X,
  Sparkles,
  BookOpen,
  VolumeX,
} from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

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
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Hide sidebar on mount, show on unmount
  useEffect(() => {
    const sidebar = document.querySelector('[data-student-sidebar]') as HTMLElement;
    if (sidebar) {
      sidebar.style.display = 'none';
    }

    return () => {
      if (sidebar) {
        sidebar.style.display = '';
      }
    };
  }, []);

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
      if (audioRef.current) {
        audioRef.current.pause();
      }
      audioRef.current = new Audio(flashcard.audioUrl);
      audioRef.current.play();
      setIsPlaying(true);
      audioRef.current.onended = () => setIsPlaying(false);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  // Cleanup audio on unmount or card change
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentIndex]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading flashcards...</p>
        </div>
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="flex flex-col items-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No flashcards yet
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              This category doesn't have any flashcards yet
            </p>
            <button
              onClick={() => router.push("/student/flashcards")}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Categories
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progressPercentage = ((currentIndex + 1) / flashcards.length) * 100;
  const reviewedCount = flashcards.filter(f => f.progressId !== null).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Top Bar - Fixed */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => router.push("/student/flashcards")}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Categories</span>
            </button>

            <div className="flex items-center gap-4">
              {/* Status Badge */}
              {currentCard.status && (
                <Badge
                  variant="secondary"
                  className={
                    currentCard.status === "MASTERED"
                      ? "bg-green-100 text-green-700 border-green-200"
                      : currentCard.status === "LEARNING"
                      ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                      : "bg-gray-100 text-gray-700 border-gray-200"
                  }
                >
                  <Sparkles className="w-3 h-3 mr-1" />
                  {currentCard.status}
                </Badge>
              )}

              {/* Stats */}
              {currentCard.correctCount !== null && (
                <div className="flex items-center gap-3 text-sm">
                  <span className="flex items-center gap-1 text-green-600 font-medium">
                    <Check className="w-4 h-4" />
                    {currentCard.correctCount}
                  </span>
                  <span className="flex items-center gap-1 text-red-600 font-medium">
                    <X className="w-4 h-4" />
                    {currentCard.incorrectCount}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-900">
                Card {currentIndex + 1} of {flashcards.length}
              </span>
              <span className="text-gray-600">
                {reviewedCount} reviewed • {Math.round(progressPercentage)}% complete
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Flashcard */}
        <div className="mb-6">
          <div
            className="relative w-full h-[calc(100vh-280px)] min-h-[400px] max-h-[600px] cursor-pointer"
            style={{ perspective: "1000px" }}
            onClick={handleFlip}
          >
            <div
              className="relative w-full h-full"
              style={{
                transformStyle: "preserve-3d",
                transition: "transform 0.6s",
                transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
              }}
            >
              {/* Front Side - Word */}
              <Card
                className="absolute w-full h-full border-2 border-gray-200 shadow-2xl bg-gradient-to-br from-white to-blue-50"
                style={{ backfaceVisibility: "hidden" }}
              >
                <CardContent className="flex flex-col items-center justify-center h-full p-8 relative">
                  {/* Word */}
                  <div className="text-center flex-1 flex flex-col items-center justify-center">
                    <div className="mb-4">
                      <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-3">
                        {currentCard.word}
                      </h2>
                      {currentCard.pronunciation && (
                        <p className="text-xl md:text-2xl text-gray-600 mb-2">
                          {currentCard.pronunciation}
                        </p>
                      )}
                      {currentCard.partOfSpeech && (
                        <Badge variant="outline" className="text-sm md:text-base px-3 py-1">
                          {currentCard.partOfSpeech}
                        </Badge>
                      )}
                    </div>

                    {/* Audio Player */}
                    {currentCard.audioUrl && (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isPlaying) {
                              stopAudio();
                            } else {
                              playAudio();
                            }
                          }}
                          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                            isPlaying
                              ? "bg-red-100 text-red-700 hover:bg-red-200"
                              : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                          }`}
                        >
                          {isPlaying ? (
                            <>
                              <VolumeX className="w-6 h-6" />
                              Stop Audio
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-6 h-6" />
                              Play Pronunciation
                            </>
                          )}
                        </button>
                      </div>
                    )}

                    {/* Image if available */}
                    {currentCard.imageUrl && (
                      <div className="mt-6">
                        <img
                          src={currentCard.imageUrl}
                          alt={currentCard.word}
                          className="max-w-xs max-h-48 rounded-lg shadow-md"
                        />
                      </div>
                    )}
                  </div>

                  {/* Flip Hint */}
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Click card to see definition
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Back Side - Definition */}
              <Card
                className="absolute w-full h-full border-2 border-gray-200 shadow-2xl bg-gradient-to-br from-white to-green-50"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                <CardContent className="flex flex-col items-center justify-center h-full p-6 md:p-8 relative overflow-y-auto">
                  <div className="text-center max-w-2xl w-full">
                    {/* Definition */}
                    <div className="mb-6">
                      <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3 flex items-center justify-center gap-2">
                        <BookOpen className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
                        Definition
                      </h3>
                      <p className="text-lg md:text-xl lg:text-2xl text-gray-700 leading-relaxed">
                        {currentCard.definition}
                      </p>
                    </div>

                    {/* Example */}
                    {currentCard.example && (
                      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <h4 className="text-xs md:text-sm font-semibold text-blue-900 mb-1 uppercase tracking-wide">
                          Example
                        </h4>
                        <p className="text-sm md:text-base lg:text-lg text-gray-700 italic">
                          "{currentCard.example}"
                        </p>
                      </div>
                    )}

                    {/* Synonyms & Antonyms */}
                    <div className="space-y-2">
                      {currentCard.synonyms && (
                        <div className="p-2 md:p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-xs md:text-sm font-semibold text-green-900 uppercase tracking-wide">
                            Synonyms:
                          </span>{" "}
                          <span className="text-sm md:text-base text-gray-700">
                            {currentCard.synonyms}
                          </span>
                        </div>
                      )}

                      {currentCard.antonyms && (
                        <div className="p-2 md:p-3 bg-red-50 rounded-lg border border-red-200">
                          <span className="text-xs md:text-sm font-semibold text-red-900 uppercase tracking-wide">
                            Antonyms:
                          </span>{" "}
                          <span className="text-sm md:text-base text-gray-700">
                            {currentCard.antonyms}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Flip Hint */}
                  <div className="absolute bottom-6 left-0 right-0 text-center">
                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Click card to see word
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 md:gap-4">
          {/* Previous Button */}
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold shadow-sm"
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="hidden md:inline">Previous</span>
            <span className="md:hidden">Prev</span>
          </button>

          {/* Center Actions */}
          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
            {/* Hard Button */}
            <button
              onClick={() => handleProgress(false)}
              className="flex-1 md:flex-none flex flex-col items-center gap-1 px-4 md:px-8 py-3 md:py-4 bg-gradient-to-br from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <X className="w-6 h-6" />
              <span>Hard</span>
            </button>

            {/* Flip Button */}
            <button
              onClick={() => setIsFlipped(!isFlipped)}
              className="flex-1 md:flex-none flex flex-col items-center gap-1 px-4 md:px-8 py-3 md:py-4 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <RotateCcw className="w-6 h-6" />
              <span>Flip</span>
            </button>

            {/* Easy Button */}
            <button
              onClick={() => handleProgress(true)}
              className="flex-1 md:flex-none flex flex-col items-center gap-1 px-4 md:px-8 py-3 md:py-4 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition-all font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <Check className="w-6 h-6" />
              <span>Easy</span>
            </button>
          </div>

          {/* Next Button */}
          <button
            onClick={handleNext}
            disabled={currentIndex === flashcards.length - 1}
            className="w-full md:w-auto flex items-center justify-center gap-2 px-4 md:px-6 py-2.5 md:py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 hover:border-gray-400 disabled:opacity-40 disabled:cursor-not-allowed transition-all font-semibold shadow-sm"
          >
            <span className="hidden md:inline">Next</span>
            <span className="md:hidden">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlashcardLearning;

