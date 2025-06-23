import { getVocabularyTopic, getVocabularyWords } from "@/db/queries";
import { redirect } from "next/navigation";
import { FlashcardMode } from "./flashcard-mode";

type Props = {
  params: Promise<{
    topicId: string;
  }>;
};

const FlashcardsPage = async ({ params }: Props) => {
  // Await the params object before accessing its properties
  const { topicId: topicIdString } = await params;
  const topicId = parseInt(topicIdString);

  if (isNaN(topicId)) {
    redirect("/vocabulary");
  }

  const topicData = getVocabularyTopic(topicId);
  const wordsData = getVocabularyWords(topicId);

  const [topic, words] = await Promise.all([topicData, wordsData]);

  if (!topic) {
    redirect("/vocabulary");
  }

  if (words.length === 0) {
    return (
      <div className="h-full max-w-[912px] px-3 mx-auto">
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-neutral-700 mb-4">
            {topic.title} - Flashcards
          </h1>
          <p className="text-muted-foreground mb-8">
            No words available for flashcard practice
          </p>
          <a 
            href={`/vocabulary/${topicId}`}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Back to Word List
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-neutral-700">
            {topic.title} - Flashcards
          </h1>
          <a 
            href={`/vocabulary/${topicId}`}
            className="text-blue-500 hover:text-blue-600 text-sm"
          >
            ← Back to Word List
          </a>
        </div>
        <p className="text-muted-foreground">
          Practice vocabulary with interactive flashcards
        </p>
      </div>
      
      <FlashcardMode words={words} />
    </div>
  );
};

export default FlashcardsPage;
