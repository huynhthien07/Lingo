/**
 * Flashcard Learning Layout
 * Fullscreen layout without sidebar for immersive learning experience
 * This layout overrides the parent student layout to hide the sidebar
 */

import { ClerkProvider } from "@clerk/nextjs";

type Props = {
  children: React.ReactNode;
};

const FlashcardLearningLayout = ({ children }: Props) => {
  // Return children directly without the student sidebar
  // This overrides the parent layout
  return <>{children}</>;
};

export default FlashcardLearningLayout;

