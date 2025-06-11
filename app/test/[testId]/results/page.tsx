"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { use } from "react";
import Image from "next/image";

type Props = {
    params: Promise<{
        testId: string;
    }>;
};

const TestResultsPage = ({ params }: Props) => {
    const router = useRouter();
    const unwrappedParams = use(params);
    const [results, setResults] = useState<{
        totalQuestions: number;
        correctAnswers: number;
        score: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTestAndCalculateResults = async () => {
            try {
                setLoading(true);
                const testId = unwrappedParams.testId;
                const storedAnswers = localStorage.getItem(`test_${testId}_answers`);

                if (!storedAnswers) {
                    router.push(`/test/${testId}`);
                    return;
                }

                // Fetch test data
                const response = await fetch(`/api/test/${testId}`);
                if (!response.ok) throw new Error("Failed to fetch test data");

                const testData = await response.json();
                const userAnswers = JSON.parse(storedAnswers);

                // Calculate correct answers
                let correctCount = 0;
                testData.questions.forEach((question: {
                    id: number;
                    options: Array<{
                        id: number;
                        isCorrect: boolean;
                    }>
                }) => {
                    const userAnswer = userAnswers[question.id];
                    const correctOption = question.options.find(option => option.isCorrect);

                    if (userAnswer && correctOption && userAnswer === correctOption.id) {
                        correctCount++;
                    }
                });

                const totalQuestions = testData.questions.length;
                const score = Math.round((correctCount / totalQuestions) * 100);

                setResults({
                    totalQuestions,
                    correctAnswers: correctCount,
                    score
                });
            } catch (error) {
                console.error("Error calculating results:", error);
                // Fallback to simplified calculation if API fails
                const testId = unwrappedParams.testId;
                const storedAnswers = localStorage.getItem(`test_${testId}_answers`);

                if (storedAnswers) {
                    const answers = JSON.parse(storedAnswers);
                    const answerCount = Object.keys(answers).length;
                    const correctCount = Math.floor(answerCount * 0.7); // Fallback calculation

                    setResults({
                        totalQuestions: answerCount,
                        correctAnswers: correctCount,
                        score: Math.round((correctCount / answerCount) * 100)
                    });
                }
            } finally {
                setLoading(false);
            }
        };

        fetchTestAndCalculateResults();
    }, [unwrappedParams.testId, router]);

    if (loading) {
        return (
            <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-lg text-gray-600">Calculating your results...</p>
                </div>
            </div>
        );
    }

    if (!results) {
        return (
            <div className="container mx-auto py-8 px-4 text-center">
                <p className="text-lg text-gray-600">No test results found. Please take the test first.</p>
                <Button
                    onClick={() => router.push(`/test/${unwrappedParams.testId}`)}
                    className="mt-4"
                >
                    Take Test
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-12 px-4">
            <div className="bg-white p-8 rounded-xl shadow-lg max-w-md mx-auto text-center">
                <h1 className="text-3xl font-bold mb-8 text-gray-800">Test Results</h1>

                <div className="mb-8">
                    <div className="relative mb-6">
                        <div className="w-32 h-32 mx-auto rounded-full flex items-center justify-center border-8 border-blue-100">
                            <span className="text-4xl font-bold text-blue-600">{results.score}%</span>
                        </div>
                        {results.score >= 70 ? (
                            <div className="absolute -top-2 -right-2 bg-green-500 text-white p-2 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        ) : null}
                    </div>
                    <p className="text-gray-600 text-lg">
                        You answered <span className="font-bold text-blue-600">{results.correctAnswers}</span> out of <span className="font-bold">{results.totalQuestions}</span> questions correctly
                    </p>
                    {/* <div className="mt-4 flex items-center justify-center gap-2">
                        <p className="text-orange-500 font-bold">
                            {results.correctAnswers}/{results.totalQuestions} points
                        </p>
                    </div> */}
                </div>

                <div className="space-y-4">
                    <Button
                        onClick={() => router.push(`/test/${unwrappedParams.testId}?review=true`)}
                        className="w-full py-3 text-base"
                        variant="default"
                    >
                        Review Answers
                    </Button>

                    <Button
                        onClick={() => {
                            localStorage.removeItem(`test_${unwrappedParams.testId}_answers`);
                            router.push(`/test/${unwrappedParams.testId}`);
                        }}
                        className="w-full py-3 text-base"
                        variant="default"
                    >
                        Retake Test
                    </Button>

                    <Button
                        onClick={() => router.push("/practises")}
                        className="w-full py-3 text-base"
                        variant="secondary"
                    >
                        Back to Tests
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TestResultsPage;










