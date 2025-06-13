"use client";

import { getWordDefinition } from "@/lib/dictionary-api";
import { vocabularyWords } from "@/db/schema";
import { useEffect, useState } from "react";
import { WordCard } from "./word-card";
import { Search } from "lucide-react";

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

export const WordsList = ({ words }: Props) => {
  const [wordsWithDefinitions, setWordsWithDefinitions] = useState<WordWithDefinition[]>(
    words.map(word => ({
      id: word.id!,
      word: word.word,
      loading: true
    }))
  );
  const [searchQuery, setSearchQuery] = useState("");

  // Filter words based on search query
  const filteredWords = wordsWithDefinitions.filter(word =>
    word.word.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div>
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
          <Search className="h-5 w-5 text-neutral-400" />
        </div>
        <input
          type="text"
          className="w-full p-3 pl-10 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          placeholder="Search flashcards..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="pt-6 grid grid-cols-1 gap-4">
        {filteredWords.map((word) => (
          <WordCard
            key={word.id}
            word={word.word}
            phonetic={word.phonetic}
            audio={word.audio || undefined}
            meaning={word.meaning}
            example={word.example}
            vietnameseMeaning={word.vietnameseMeaning || undefined}
            loading={word.loading}
          />
        ))}
      </div>
    </div>
  );
};










