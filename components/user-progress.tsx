import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { courses } from "@/db/schema";
import { InfinityIcon } from "lucide-react";

type Props = {
    activeCourse: typeof courses.$inferInsert; //todo: define type by database
    hearts: number;
    points: number;
    hasActiveSubscription: boolean;
};

export const UserProgress = ({ activeCourse, points, hearts, hasActiveSubscription }: Props) => {
    return (
        <div className="flex items-center justify-between gap-x-2">
            <Link href="/courses">
                <Button variant="ghost">
                    <Image
                        src={activeCourse.imageSrc}
                        alt={activeCourse.title}
                        className="rounded-md border"
                        height={32}
                        width={32}
                    >

                    </Image>
                </Button>
            </Link>

            <Link href="/shop">
                <Button variant="ghost" className="text-orange-500">
                    <Image src="/points.svg" height={28} width={28}
                        alt="Points" className="mr-2" />
                    {points}

                </Button>
            </Link>

            <Link href="/shop">
                <Button variant="ghost" className="text-rose-500">
                    <Image src="/heart.svg" height={28} width={28}
                        alt="Hearts" className="mr-2" />
                    {hasActiveSubscription
                        ? <InfinityIcon className="h-4 w-4 stock-[3]" />
                        : hearts}

                </Button>
            </Link>
        </div>
    );
};