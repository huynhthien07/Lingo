import { getVocabularyTopics } from "@/db/queries";
import { TopicsList } from "./topics-list";

const VocabularyPage = async () => {
  const topics = await getVocabularyTopics();

  return (
    <div className="h-full max-w-[912px] px-3 mx-auto">
      <h1 className="text-2xl font-bold text-neutral-700">
        Vocabulary Flashcards
      </h1>
      <TopicsList topics={topics} />
    </div>
  );
};

export default VocabularyPage;