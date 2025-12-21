"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { usePracticeModal } from "@/store/use-practice-modal";

export const PracticeModal = () => {
    const router = useRouter();
    const [isCilent, setIsClient] = useState(false);
    const { isOpen, close } = usePracticeModal();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isCilent) {
        return null
    };

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center w-full justify-center mb-5">
                        <Image
                            src={"/heart.svg"}
                            alt="Heart mascot"
                            height={100}
                            width={100}
                        />
                    </div>
                    <DialogTitle className="text-center font-bold">
                        Practice lesson
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Use practice lessons to improve your skills and earn points.
                        Practice as much as you want!
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mb-4">
                    <div className="flex flex-col gap-4 w-full">
                        <Button
                            variant="primary"
                            className="w-full"
                            size="lg"
                            onClick={close}
                        >
                            I understand
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );

};