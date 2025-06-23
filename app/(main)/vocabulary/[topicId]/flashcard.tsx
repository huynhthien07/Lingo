"use client";

import { cn } from "@/lib/utils";
import { Volume2, RotateCcw, ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useState } from "react";
import { useAudio } from "react-use";

type WordWithDefinition = {
  id: number;
  word: string;
  phonetic?: string;
  audio?: string | null;
  meaning?: string;
  example?: string;
  vietnameseMeaning?: string | null;
  loading: boolean;
};

type Props = {
  words: WordWithDefinition[];
  currentIndex: number;
  onNext: () => void;
  onPrevious: () => void;
};

export const Flashcard = ({ words, currentIndex, onNext, onPrevious }: Props) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const currentWord = words[currentIndex];

  const [audioElement, _, controls] = useAudio({
    src: currentWord?.audio && currentWord.audio.length > 0 ? currentWord.audio : undefined
  });

  const handlePlayAudio = useCallback(() => {
    if (currentWord?.audio && currentWord.audio.length > 0) {
      controls.play();
    }
  }, [currentWord?.audio, controls]);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleNext = () => {
    setIsFlipped(false);
    onNext();
  };

  const handlePrevious = () => {
    setIsFlipped(false);
    onPrevious();
  };

  if (!currentWord) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No words available</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      {/* Always render the audio element */}
      {audioElement}

      {/* Progress indicator */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gray-500">
            {currentIndex + 1} of {words.length}
          </span>
          <span className="text-sm text-gray-500">
            {Math.round(((currentIndex + 1) / words.length) * 100)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / words.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Flashcard */}
      <div
        className={cn(
          "relative w-full h-80 cursor-pointer transition-transform duration-500 preserve-3d",
          isFlipped && "rotate-y-180"
        )}
        onClick={handleFlip}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front of card (word) */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden",
            "border-2 rounded-xl border-b-4 p-6",
            "bg-gradient-to-br from-blue-50 to-indigo-100",
            "border-blue-200 border-b-blue-300",
            "flex flex-col items-center justify-center text-center"
          )}
        >
          <div className="flex items-center gap-x-2 mb-4">
            <h2 className="text-2xl lg:text-3xl font-bold text-blue-700">
              {currentWord.word}
            </h2>
            {currentWord.audio && currentWord.audio.length > 0 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayAudio();
                }}
                className="p-2 rounded-full hover:bg-blue-200 transition"
                title="Play pronunciation"
              >
                <Volume2 className="h-5 w-5 text-blue-600" />
              </button>
            )}
          </div>

          {currentWord.phonetic && (
            <span className="text-blue-600 text-lg mb-4">
              {currentWord.phonetic}
            </span>
          )}

          <p className="text-blue-600 text-sm">
            Click to reveal meaning
          </p>
        </div>

        {/* Back of card (meaning) */}
        <div
          className={cn(
            "absolute inset-0 w-full h-full backface-hidden rotate-y-180",
            "border-2 rounded-xl border-b-4 p-6",
            "bg-gradient-to-br from-green-50 to-emerald-100",
            "border-green-200 border-b-green-300",
            "flex flex-col justify-center"
          )}
        >
          {currentWord.loading ? (
            <div className="animate-pulse text-center">
              <div className="h-4 bg-green-200 rounded w-3/4 mb-2 mx-auto"></div>
              <div className="h-4 bg-green-200 rounded w-1/2 mx-auto"></div>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold text-green-700 mb-2">
                  {currentWord.word}
                </h3>
              </div>

              {currentWord.vietnameseMeaning && (
                <p className="text-green-700 mb-3 text-center font-medium">
                  <span className="font-semibold">Tiếng Việt:</span><br />
                  {currentWord.vietnameseMeaning}
                </p>
              )}

              {currentWord.meaning && (
                <p className="text-green-600 mb-3 text-center">
                  <span className="font-semibold">Meaning:</span><br />
                  {currentWord.meaning}
                </p>
              )}

              {currentWord.example && (
                <p className="text-green-500 italic text-center text-sm">
                  <span className="font-semibold not-italic">Example:</span><br />
                  "{currentWord.example}"
                </p>
              )}

              {!currentWord.meaning && !currentWord.vietnameseMeaning && !currentWord.example && (
                <p className="text-green-600 text-center">
                  No definition available
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={cn(
            "flex items-center gap-x-2 px-4 py-2 rounded-lg transition",
            currentIndex === 0
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </button>

        <button
          onClick={() => setIsFlipped(!isFlipped)}
          className="flex items-center gap-x-2 px-4 py-2 rounded-lg bg-purple-500 text-white hover:bg-purple-600 transition"
        >
          <RotateCcw className="h-4 w-4" />
          Flip
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === words.length - 1}
          className={cn(
            "flex items-center gap-x-2 px-4 py-2 rounded-lg transition",
            currentIndex === words.length - 1
              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          )}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
