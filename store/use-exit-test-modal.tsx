import { create } from "zustand";

type ExitTestModalStore = {
    isOpen: boolean;
    testId: number | null;
    open: (testId: number) => void;
    close: () => void;
};

export const useExitTestModal = create<ExitTestModalStore>((set) => ({
    isOpen: false,
    testId: null,
    open: (testId) => set({ isOpen: true, testId }),
    close: () => set({ isOpen: false, testId: null }),
}));