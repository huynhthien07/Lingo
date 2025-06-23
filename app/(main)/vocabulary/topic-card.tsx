import { cn } from "@/lib/utils";
import Image from "next/image";
import { BookOpen, Zap } from "lucide-react";

type Props = {
  title: string;
  id: number;
  imageSrc: string;
  onClick: (id: number) => void;
  disabled?: boolean;
};

export const TopicCard = ({
  title,
  id,
  imageSrc,
  disabled,
  onClick,
}: Props) => {
  const handleFlashcardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `/vocabulary/${id}/flashcards`;
  };

  return (
    <div
      className={cn(
        "h-full border-2 rounded-xl border-b-4 hover:bg-black/5 cursor-pointer active:border-b-2 flex flex-col items-center justify-between p-3 pb-6 min-h-[217px] min-w-[200px] relative group",
        disabled && "pointer-events-none opacity-50"
      )}
    >
      {/* Action buttons - shown on hover */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleFlashcardClick}
          className="p-1.5 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-xs"
          title="Flashcard Mode"
        >
          <Zap className="h-3 w-3" />
        </button>
        <button
          onClick={() => onClick(id)}
          className="p-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-xs"
          title="Word List"
        >
          <BookOpen className="h-3 w-3" />
        </button>
      </div>

      {/* Main card content - clickable */}
      <div
        onClick={() => onClick(id)}
        className="flex flex-col items-center justify-between h-full w-full"
      >
        <div className="min-[24px] w-full flex items-center justify-end"></div>
        <Image
          src={imageSrc}
          alt={title}
          height={70}
          width={93.33}
          className="rounded-lg drop-shadow-md border object-cover"
        />
        <p className="text-neutral-700 text-center font-bold mt-3">
          {title}
        </p>
      </div>
    </div>
  );
};