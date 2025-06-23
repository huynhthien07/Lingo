"use client";

import { cn } from "@/lib/utils";
import { Volume2, Eye, EyeOff } from "lucide-react";
import { useCallback, useState } from "react";
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
  // First hook: useState for flashcard functionality
  const [showMeaning, setShowMeaning] = useState(false);

  // Second hook: useAudio (or its fallback)
  const [audioElement, _, controls] = useAudio({
    src: audio && audio.length > 0 ? audio : ""
  });

  // Third hook: useCallback
  const handlePlayAudio = useCallback(() => {
    if (audio && audio.length > 0) {
      controls.play();
    }
  }, [audio, controls]);

  const toggleMeaning = () => {
    setShowMeaning(!showMeaning);
  };

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
        <div className="ml-auto flex items-center gap-x-2">
          {!loading && (meaning || vietnameseMeaning) && (
            <button
              onClick={toggleMeaning}
              className="p-2 rounded-full hover:bg-purple-100 transition"
              title={showMeaning ? "Hide meaning" : "Show meaning"}
            >
              {showMeaning ? (
                <EyeOff className="h-5 w-5 text-purple-500" />
              ) : (
                <Eye className="h-5 w-5 text-purple-500" />
              )}
            </button>
          )}
          {audio && audio.length > 0 && (
            <button
              onClick={handlePlayAudio}
              className="p-2 rounded-full hover:bg-sky-100 transition"
              title="Play pronunciation"
            >
              <Volume2 className="h-5 w-5 text-sky-500" />
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ) : (
        <>
          {!showMeaning && (meaning || vietnameseMeaning) && (
            <div className="text-center py-8">
              <div className="text-gray-400 text-lg mb-2">
                <Eye className="h-8 w-8 mx-auto mb-2" />
              </div>
              <p className="text-gray-500 text-sm">
                Click the eye icon to reveal the meaning
              </p>
            </div>
          )}

          {(showMeaning || (!meaning && !vietnameseMeaning)) && (
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
              {!meaning && !vietnameseMeaning && !example && (
                <p className="text-gray-500 text-center py-4">
                  No definition available for this word
                </p>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
};




