"use client";

import { cn } from "@/lib/utils";
import { Volume2 } from "lucide-react";
import { useCallback } from "react";
import { useAudio } from "react-use";

type Props = {
  word: string;
  phonetic?: string;
  audio?: string;
  meaning?: string;
  example?: string;
  vietnameseMeaning?: string;
  loading: boolean;
};

export const WordCard = ({
  word,
  phonetic,
  audio,
  meaning,
  example,
  vietnameseMeaning,
  loading,
}: Props) => {
  // Create a consistent hook order by always using the same hooks in the same order
  // First hook: useAudio (or its fallback)
  const [audioElement, _, controls] = useAudio({
    src: audio && audio.length > 0 ? audio : ""
  });

  // Second hook: useCallback
  const handlePlayAudio = useCallback(() => {
    if (audio && audio.length > 0) {
      controls.play();
    }
  }, [audio, controls]);

  return (
    <div className="border-2 rounded-xl border-b-4 p-4 lg:p-6">
      {/* Always render the audio element */}
      {audioElement}
      <div className="flex items-center gap-x-2 mb-4">
        <h2 className="text-xl lg:text-2xl font-bold text-neutral-700">
          {word}
        </h2>
        {phonetic && (
          <span className="text-neutral-500 text-sm lg:text-base">
            {phonetic}
          </span>
        )}
        {audio && audio.length > 0 && (
          <button
            onClick={handlePlayAudio}
            className="ml-auto p-2 rounded-full hover:bg-sky-100 transition"
          >
            <Volume2 className="h-5 w-5 text-sky-500" />
          </button>
        )}
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          {vietnameseMeaning && (
            <p className="text-neutral-600 mb-2 text-base font-medium">
              <span className="font-semibold text-green-600">Tiếng Việt:</span> {vietnameseMeaning}
            </p>
          )}
          {meaning && (
            <p className="text-neutral-600 mb-2">
              <span className="font-semibold">Meaning:</span> {meaning}
            </p>
          )}
          {example && (
            <p className="text-neutral-500 italic">
              <span className="font-semibold not-italic">Example:</span> "{example}"
            </p>
          )}
        </>
      )}
    </div>
  );
};




