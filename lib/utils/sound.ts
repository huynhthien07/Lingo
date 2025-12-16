/**
 * Sound utility functions for playing audio feedback
 */

export const playSound = (soundFile: string) => {
  try {
    const audio = new Audio(soundFile);
    audio.volume = 0.5; // Set volume to 50%
    audio.play().catch((err) => {
      console.log("Audio play failed:", err);
    });
  } catch (error) {
    console.log("Error creating audio:", error);
  }
};

export const sounds = {
  correct: "/sound/correct.wav",
  incorrect: "/sound/incorrect.wav",
  finish: "/sound/finish.mp3",
} as const;

export const playCorrectSound = () => playSound(sounds.correct);
export const playIncorrectSound = () => playSound(sounds.incorrect);
export const playFinishSound = () => playSound(sounds.finish);

