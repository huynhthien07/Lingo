"use client";

import { tests } from "@/db/schema";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Card } from "./card";

type Props = {
    tests: typeof tests.$inferInsert[];
};

export const List = ({ tests }: Props) => {
    const router = useRouter();
    const [pending, startTransition] = useTransition();

    const onClick = (id: number) => {
        if (pending) return;
        router.push(`/test/${id}`);
    };

    return (
        <div className="pt-6 grid grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(210px,1fr))] gap-4">
            {tests.map((test) => (
                <Card
                    key={test.id}
                    id={test.id!}
                    title={test.title}
                    imageSrc={test.imageSrc}
                    onClick={onClick}
                    disabled={pending}
                />
            ))}
        </div>
    );
}
