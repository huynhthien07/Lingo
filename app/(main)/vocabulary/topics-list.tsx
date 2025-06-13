"use client";

import { vocabularyTopics } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { TopicCard } from "./topic-card";

type Props = {
  topics: typeof vocabularyTopics.$inferSelect[];
};

export const TopicsList = ({ topics }: Props) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const onClick = (id: number) => {
    if (pending) return;
    router.push(`/vocabulary/${id}`);
  };

  return (
    <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
      {topics.map((topic) => (
        <TopicCard
          key={topic.id}
          id={topic.id!}
          title={topic.title}
          imageSrc={topic.imageSrc}
          onClick={onClick}
          disabled={pending}
        />
      ))}
    </div>
  );
};