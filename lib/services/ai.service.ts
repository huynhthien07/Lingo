/**
 * AI Service
 * 
 * Handles all interactions with OpenAI API for chatbot functionality
 * This service encapsulates OpenAI API calls and provides a clean interface
 * for AI-powered features.
 */

import OpenAI from "openai";

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Message interface for chat
 */
export interface ChatMessage {
    role: 'user' | 'assistant' | 'system';
    text: string;
}

/**
 * Get OpenAI client instance
 * @returns OpenAI client
 */
export const getOpenAIClient = () => {
    return openai;
};

/**
 * Send chat message to OpenAI and get response
 * @param messages - Array of chat messages
 * @param model - OpenAI model to use (default: gpt-3.5-turbo)
 * @returns AI response text
 */
export const getChatResponse = async (
    messages: ChatMessage[],
    model: string = "gpt-3.5-turbo"
): Promise<string> => {
    if (!messages || messages.length === 0) {
        throw new Error("No messages provided");
    }

    try {
        const chatResponse = await openai.chat.completions.create({
            model,
            messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.text,
            })),
        });

        return chatResponse.choices[0].message.content || "No response from AI";
    } catch (error) {
        console.error("OpenAI API error:", error);
        throw new Error("Failed to get response from OpenAI");
    }
};

/**
 * Get English learning assistance
 * Specialized function for English learning chatbot
 * @param userMessage - User's message
 * @param conversationHistory - Previous conversation messages
 * @returns AI response
 */
export const getEnglishLearningAssistance = async (
    userMessage: string,
    conversationHistory: ChatMessage[] = []
): Promise<string> => {
    const systemMessage: ChatMessage = {
        role: 'system',
        text: `You are an English learning assistant for an IELTS preparation platform. 
Your role is to:
- Help students improve their English skills
- Answer questions about grammar, vocabulary, and IELTS exam strategies
- Provide explanations in a clear and encouraging manner
- Give examples when explaining concepts
- Be patient and supportive

Keep responses concise and educational.`
    };

    const messages: ChatMessage[] = [
        systemMessage,
        ...conversationHistory,
        { role: 'user', text: userMessage }
    ];

    return await getChatResponse(messages);
};

/**
 * Generate vocabulary explanation
 * @param word - Word to explain
 * @param context - Optional context sentence
 * @returns Explanation of the word
 */
export const explainVocabulary = async (
    word: string,
    context?: string
): Promise<string> => {
    const prompt = context
        ? `Explain the word "${word}" as used in this context: "${context}". Include definition, pronunciation guide, and an example sentence.`
        : `Explain the word "${word}". Include definition, pronunciation guide, part of speech, and 2 example sentences.`;

    const messages: ChatMessage[] = [
        {
            role: 'system',
            text: 'You are an English vocabulary teacher. Provide clear, concise explanations suitable for IELTS learners.'
        },
        {
            role: 'user',
            text: prompt
        }
    ];

    return await getChatResponse(messages);
};

/**
 * Check grammar and provide corrections
 * @param sentence - Sentence to check
 * @returns Grammar feedback
 */
export const checkGrammar = async (sentence: string): Promise<string> => {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            text: 'You are an English grammar checker. Identify errors and provide corrections with explanations.'
        },
        {
            role: 'user',
            text: `Please check this sentence for grammar errors and provide corrections: "${sentence}"`
        }
    ];

    return await getChatResponse(messages);
};

/**
 * Generate practice questions
 * @param topic - Topic for practice questions
 * @param difficulty - Difficulty level (beginner, intermediate, advanced)
 * @param count - Number of questions to generate
 * @returns Generated practice questions
 */
export const generatePracticeQuestions = async (
    topic: string,
    difficulty: 'beginner' | 'intermediate' | 'advanced' = 'intermediate',
    count: number = 5
): Promise<string> => {
    const messages: ChatMessage[] = [
        {
            role: 'system',
            text: 'You are an IELTS exam question generator. Create practice questions that match IELTS format and difficulty.'
        },
        {
            role: 'user',
            text: `Generate ${count} ${difficulty} level practice questions about "${topic}" suitable for IELTS preparation.`
        }
    ];

    return await getChatResponse(messages, "gpt-4");
};

export { openai };

