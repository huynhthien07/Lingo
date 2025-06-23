"use client";

import { getWordDefinition } from "@/lib/dictionary-api";
import { vocabularyWords } from "@/db/schema";
import { useEffect, useState } from "react";
import { Flashcard } from "../flashcard";
import { Shuffle, RotateCcw, Home } from "lucide-react";

type Props = {
  words: typeof vocabularyWords.$inferSelect[];
};

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

export const FlashcardMode = ({ words }: Props) => {
  const [wordsWithDefinitions, setWordsWithDefinitions] = useState<WordWithDefinition[]>(
    words.map(word => ({
      id: word.id!,
      word: word.word,
      vietnameseMeaning: word.vietnameseMeaning,
      loading: true
    }))
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShuffled, setIsShuffled] = useState(false);

  // Shuffle function
  const shuffleArray = <T,>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleShuffle = () => {
    const shuffled = shuffleArray(wordsWithDefinitions);
    setWordsWithDefinitions(shuffled);
    setCurrentIndex(0);
    setIsShuffled(true);
  };

  const handleReset = () => {
    // Reset to original order
    const originalOrder = words.map(word => {
      const existingWord = wordsWithDefinitions.find(w => w.id === word.id);
      return existingWord || {
        id: word.id!,
        word: word.word,
        vietnameseMeaning: word.vietnameseMeaning,
        loading: true
      };
    });
    setWordsWithDefinitions(originalOrder);
    setCurrentIndex(0);
    setIsShuffled(false);
  };

  const handleNext = () => {
    if (currentIndex < wordsWithDefinitions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  useEffect(() => {
    const fetchDefinitions = async () => {
      const updatedWords = await Promise.all(
        words.map(async (word) => {
          const definition = await getWordDefinition(word.word);

          if (!definition || definition.length === 0) {
            return {
              id: word.id!,
              word: word.word,
              vietnameseMeaning: word.vietnameseMeaning,
              loading: false
            };
          }

          const firstEntry = definition[0];
          const phonetic = firstEntry.phonetic || firstEntry.phonetics.find(p => p.text)?.text;

          // Find the first non-empty audio URL
          const audioPhonetic = firstEntry.phonetics.find(p => p.audio && p.audio.length > 0);
          const audio = audioPhonetic ? audioPhonetic.audio : null;

          const firstMeaning = firstEntry.meanings[0];
          const meaning = firstMeaning?.definitions[0]?.definition;
          const example = firstMeaning?.definitions[0]?.example;

          return {
            id: word.id!,
            word: word.word,
            phonetic,
            audio,
            meaning,
            example,
            vietnameseMeaning: word.vietnameseMeaning,
            loading: false
          };
        })
      );

      setWordsWithDefinitions(updatedWords);
    };

    fetchDefinitions();
  }, [words]);

  if (wordsWithDefinitions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No words available for flashcard practice</p>
      </div>
    );
  }

  return (
    <div className="py-6">
      {/* Controls */}
      <div className="flex justify-center gap-4 mb-8">
        <button
          onClick={handleShuffle}
          className="flex items-center gap-x-2 px-4 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 transition"
        >
          <Shuffle className="h-4 w-4" />
          Shuffle
        </button>
        
        <button
          onClick={handleReset}
          disabled={!isShuffled}
          className={`flex items-center gap-x-2 px-4 py-2 rounded-lg transition ${
            isShuffled 
              ? "bg-gray-500 text-white hover:bg-gray-600" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <RotateCcw className="h-4 w-4" />
          Reset Order
        </button>

        <a
          href="/vocabulary"
          className="flex items-center gap-x-2 px-4 py-2 rounded-lg bg-green-500 text-white hover:bg-green-600 transition"
        >
          <Home className="h-4 w-4" />
          All Topics
        </a>
      </div>

      {/* Flashcard */}
      <Flashcard
        words={wordsWithDefinitions}
        currentIndex={currentIndex}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />

      {/* Completion message */}
      {currentIndex === wordsWithDefinitions.length - 1 && (
        <div className="text-center mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
          <h3 className="text-lg font-semibold text-green-700 mb-2">
            🎉 Great job!
          </h3>
          <p className="text-green-600 mb-4">
            You've completed all {wordsWithDefinitions.length} flashcards in this topic.
          </p>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setCurrentIndex(0)}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
            >
              Start Over
            </button>
            <button
              onClick={handleShuffle}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
            >
              Shuffle & Restart
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
