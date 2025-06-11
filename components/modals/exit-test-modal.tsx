"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useExitTestModal } from "@/store/use-exit-test-modal";
import Image from "next/image";

export const ExitTestModal = () => {
    const router = useRouter();
    const { isOpen, close, testId } = useExitTestModal();

    const onExit = () => {
        close();
        router.push("/practises");
    };

    const onContinue = () => {
        close();
    };

    return (
        <Dialog open={isOpen} onOpenChange={close}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center w-full justify-center mb-5">
                        <Image
                            src={"/mascot_sad.svg"}
                            alt="Sad mascot"
                            height={80}
                            width={80}
                        />
                    </div>
                    <DialogTitle className="text-center font-bold">
                        Exit Test?
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Are you sure you want to exit? Your progress will not be saved.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mb-4">
                    <div className="flex flex-col gap-4 w-full">
                        <Button
                            variant="primary"
                            className="w-full"
                            size="lg"
                            onClick={onContinue}
                        >
                            Continue Test
                        </Button>
                        <Button
                            variant="dangerOutline"
                            className="w-full"
                            size="lg"
                            onClick={onExit}
                        >
                            Exit Test
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
