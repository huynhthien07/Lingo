"use client";

import { useCallback } from "react";
import { useUser } from "@clerk/nextjs";

interface ChatbotResponse {
  success: boolean;
  response: {
    id: string;
    mode: string;
    userInput: string;
    text: string;
    confidence: number;
    language: string;
    createdAt: string;
  };
  validation: {
    isValid: boolean;
    score: number;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  };
  evaluation: {
    quality: string;
    score: number;
    feedback: string;
  };
}

export function useChatbot() {
  const { user } = useUser();

  const sendMessage = useCallback(
    async (message: string, mode: string = "general"): Promise<string> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      if (!message.trim()) {
        throw new Error("Message cannot be empty");
      }

      try {
        const response = await fetch("/api/chatbot/response", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            request: {
              userInput: message,
              mode: mode,
              language: "en",
            },
            userId: user.id,
          }),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to get response");
        }

        const data: ChatbotResponse = await response.json();

        if (!data.success) {
          throw new Error("Failed to generate response");
        }

        return data.response.text;
      } catch (error) {
        console.error("Chatbot error:", error);
        throw error;
      }
    },
    [user?.id]
  );

  const sendFeedback = useCallback(
    async (responseId: string, feedback: string, rating: number): Promise<void> => {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      try {
        const response = await fetch("/api/chatbot/feedback", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            responseId,
            feedback,
            rating,
            userId: user.id,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to send feedback");
        }
      } catch (error) {
        console.error("Feedback error:", error);
        throw error;
      }
    },
    [user?.id]
  );

  return {
    sendMessage,
    sendFeedback,
  };
}

