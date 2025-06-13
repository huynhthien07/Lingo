import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { SidebarItem } from "./sidebar-item";
import {
    ClerkLoading,
    ClerkLoaded,
    UserButton,
} from "@clerk/nextjs";

import { Loader } from "lucide-react";

type Props = {
    className?: string;
}

export const Sidebar = ({ className }: Props) => {
    return (
        <div className={cn(
            "flex  h-full lg:w-[256px] lg:fixed left-0 top-0  flex-col",
            className,
        )}>
            <Link href="/learn">
                <div className="pt-8 pl-4 pb-7 flex items-center gap-x-3">
                    <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
                    <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
                        Lingo
                    </h1>
                </div>
            </Link>

            <div className="flex flex-col gap-y-2 flex-1">
                <SidebarItem
                    label="learn"
                    href="/learn"
                    inconSrc="/learn.svg" />
                <SidebarItem
                    label="leaderboard"
                    href="/leaderboard"
                    inconSrc="/leaderboard.svg" />
                <SidebarItem
                    label="quests"
                    href="/quests"
                    inconSrc="/quests.svg" />
                <SidebarItem
                    label="shop"
                    href="/shop"
                    inconSrc="/shop.svg" />
                <SidebarItem
                    label="Q&A"
                    href="/chatbot"
                    inconSrc="/chatbot.svg" />
                <SidebarItem
                    label="practise"
                    href="/practises"
                    inconSrc="/practise.svg" />
                <SidebarItem
                    label="vocabulary"
                    href="/vocabulary"
                    inconSrc="/dictionary.svg" />

            </div>
            <div className="p-4">
                <ClerkLoading>
                    <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
                </ClerkLoading>
                <ClerkLoaded>
                    <UserButton afterSignOutUrl="/" />
                </ClerkLoaded>
            </div>



        </div >
    )
}

export default Sidebar;
