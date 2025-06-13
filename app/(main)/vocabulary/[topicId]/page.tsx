import { getVocabularyTopic, getVocabularyWords } from "@/db/queries";
import { redirect } from "next/navigation";
import { WordsList } from "./words-list";

type Props = {
  params: Promise<{
    topicId: string;
  }>;
};

const VocabularyTopicPage = async ({ params }: Props) => {
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

  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <h1 className="text-2xl font-bold text-neutral-700">
        {topic.title}
      </h1>
      <p className="text-muted-foreground">
        {topic.description || "Vocabulary flashcards"}
      </p>
      <WordsList words={words} />
    </div>
  );
};

export default VocabularyTopicPage;