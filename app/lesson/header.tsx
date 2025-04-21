import { InfinityIcon, X } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import { useExitModal } from "@/store/use-exit-modal";


type Props = {
    hearts: number;
    percentage: number;
    hasActiveSubcription: boolean;
};

export const Header = ({
    hearts,
    percentage,
    hasActiveSubcription,
}: Props) => {
    const { open } = useExitModal();

    return (
        <header className="lg:pt-[50px] pt-[20px] px-10 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full">
            <X
                onClick={open} //TODO: Add onClick exit lesson
                className="text-slate-500 hover:opacity-70 transition cursor-pointer"
            />

            <Progress value={percentage} />
            <div className="text-rose-500 flex items-center font-bold">
                <Image
                    src="/heart.svg"
                    height={28}
                    width={28}
                    alt="Heart"
                    className="mr-2"
                />
                {hasActiveSubcription
                    ? <InfinityIcon className="h-6 w-6 stroke-[3]" />
                    : hearts
                }

            </div>




        </header>
    )

}
