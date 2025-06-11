"use client";

import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, XCircle, X, ArrowLeft, ArrowRight, Maximize, Minimize } from "lucide-react";
import { useExitTestModal } from "@/store/use-exit-test-modal";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export const TestContent = ({ test, isReview = false }: {
    test: {
        id: number;
        title: string;
        duration: number; // Duration in minutes
        questions: Array<{
            id: number;
            text: string;
            options: Array<{
                id: number;
                text: string;
                isCorrect: boolean;
            }>
        }>
    },
    isReview?: boolean
}) => {
    const router = useRouter();
    const { open: openExitModal } = useExitTestModal();
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
    const [progress, setProgress] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(test.duration * 60); // Convert minutes to seconds
    const [isTimeUp, setIsTimeUp] = useState(false);
    const [isFullScreen, setIsFullScreen] = useState(false);

    // Format time as MM:SS
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
    };

    // Load saved answers if in review mode
    useEffect(() => {
        if (isReview) {
            const storedAnswers = localStorage.getItem(`test_${test.id}_answers`);
            if (storedAnswers) {
                setSelectedAnswers(JSON.parse(storedAnswers));
            }
        }
    }, [test.id, isReview]);

    // Calculate progress
    useEffect(() => {
        const answeredCount = Object.keys(selectedAnswers).length;
        const progressPercentage = (answeredCount / test.questions.length) * 100;
        setProgress(progressPercentage);
    }, [selectedAnswers, test.questions.length]);

    // Countdown timer
    useEffect(() => {
        if (isReview || isTimeUp) return;

        const timer = setInterval(() => {
            setTimeRemaining(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setIsTimeUp(true);
                    // Store answers and redirect to results when time is up
                    localStorage.setItem(`test_${test.id}_answers`, JSON.stringify(selectedAnswers));
                    router.push(`/test/${test.id}/results`);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isReview, isTimeUp, test.id, selectedAnswers, router]);

    // Handle fullscreen toggle
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
            setIsFullScreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullScreen(false);
            }
        }
    };

    // Listen for fullscreen change events
    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullScreen(!!document.fullscreenElement);
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const handleSelectAnswer = (questionId: number, optionId: number) => {
        if (!isReview) {
            setSelectedAnswers(prev => ({
                ...prev,
                [questionId]: optionId
            }));
        }
    };

    const handleExit = () => {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
        openExitModal(test.id);
    };

    // Find correct option for current question
    const correctOption = test.questions[currentQuestion].options.find(option => option.isCorrect);
    const currentQuestionId = test.questions[currentQuestion].id;
    const selectedOptionId = selectedAnswers[currentQuestionId];
    const isCorrect = selectedOptionId === correctOption?.id;

    return (
        <div className={cn(
            "min-h-screen flex flex-col bg-gray-50",
            isFullScreen && "fixed inset-0 z-50"
        )}>
            {/* Header with exit button, progress bar */}
            <header className="bg-white shadow-sm">
                <div className="w-full">
                    <div className="pt-3 px-4 lg:px-6 flex items-center justify-between">
                        <button
                            onClick={handleExit}
                            className="p-2 rounded-full hover:bg-gray-100 transition"
                        >
                            <X className="h-5 w-5 text-gray-500" />
                        </button>
                        <div className="text-gray-700 font-medium">
                            {isReview ? "Review Mode" : `Question ${currentQuestion + 1} of ${test.questions.length}`}
                        </div>
                        <div className="flex items-center gap-2">
                            {!isReview && (
                                <div className={`flex items-center gap-1 font-mono text-base font-bold ${timeRemaining < 60 ? 'text-red-500 animate-pulse' : timeRemaining < 300 ? 'text-orange-500' : 'text-gray-700'}`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {formatTime(timeRemaining)}
                                </div>
                            )}
                            <button
                                onClick={toggleFullScreen}
                                className="p-2 rounded-full hover:bg-gray-100 transition"
                                title={isFullScreen ? "Exit full screen" : "Enter full screen"}
                            >
                                {isFullScreen ? (
                                    <Minimize className="h-4 w-4 text-gray-500" />
                                ) : (
                                    <Maximize className="h-4 w-4 text-gray-500" />
                                )}
                            </button>
                        </div>
                    </div>
                    <div className="px-4 lg:px-6 pt-2 pb-2">
                        <Progress value={progress} className="h-2" />
                    </div>
                </div>
            </header>

            {/* Main content with 3-column layout */}
            <div className="flex-1 flex h-full">
                <div className="flex flex-row w-full h-full">
                    {/* Left sidebar - Question navigation */}
                    <div className={cn(
                        "w-[260px] bg-white border-r border-gray-200 overflow-y-auto",
                        isFullScreen && !isReview && "hidden lg:block w-[220px]"
                    )}>
                        <div className="p-4 sticky top-0">
                            <h2 className="text-base font-semibold mb-3 text-gray-700">Questions</h2>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {test.questions.map((question, index) => {
                                    const questionHasAnswer = selectedAnswers[question.id] !== undefined;
                                    const questionCorrectOption = question.options.find(option => option.isCorrect);
                                    const questionIsCorrect = selectedAnswers[question.id] === questionCorrectOption?.id;

                                    return (
                                        <button
                                            key={question.id}
                                            onClick={() => setCurrentQuestion(index)}
                                            className={cn(
                                                "w-8 h-8 rounded-full flex items-center justify-center font-medium transition-all text-sm",
                                                currentQuestion === index
                                                    ? 'bg-blue-500 text-white shadow-md'
                                                    : isReview && questionHasAnswer
                                                        ? questionIsCorrect
                                                            ? 'bg-green-100 border border-green-500 text-green-700'
                                                            : 'bg-rose-100 border border-rose-500 text-rose-700'
                                                        : questionHasAnswer
                                                            ? 'bg-blue-100 border border-blue-300 text-blue-700'
                                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            )}
                                        >
                                            {index + 1}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Test summary */}
                            <div className="pt-3 border-t border-gray-100">
                                <h3 className="text-xs font-medium text-gray-700 mb-2">Test Summary</h3>
                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total questions:</span>
                                        <span className="font-medium">{test.questions.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Answered:</span>
                                        <span className="font-medium">{Object.keys(selectedAnswers).length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Remaining:</span>
                                        <span className="font-medium">{test.questions.length - Object.keys(selectedAnswers).length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle - Question content */}
                    <div className={cn(
                        "flex-1 overflow-y-auto",
                        isFullScreen && !isReview && "lg:flex-1"
                    )}>
                        <div className="p-4 lg:p-6 h-full">
                            <div className="bg-white p-4 lg:p-6 rounded-lg shadow-sm h-full">
                                <h2 className="text-lg font-semibold mb-1 text-gray-800">
                                    Question {currentQuestion + 1}
                                </h2>
                                <p className="text-gray-600 mb-1 text-xs">
                                    {isReview ? "Review your answer" : "Select the correct answer"}
                                </p>
                                <div className="h-px bg-gray-200 w-full my-3"></div>
                                <p className="mb-4 text-base">{test.questions[currentQuestion].text}</p>

                                <div className="space-y-2">
                                    {test.questions[currentQuestion].options.map((option) => {
                                        const isSelected = selectedAnswers[currentQuestionId] === option.id;
                                        const isCorrectOption = option.isCorrect;

                                        let className = cn(
                                            "w-full text-left px-4 py-2 rounded-lg border transition-all flex justify-between items-center",

                                            // Review mode styling
                                            isReview && isSelected && isCorrectOption && "bg-green-50 border-green-500 text-green-700",
                                            isReview && isSelected && !isCorrectOption && "bg-rose-50 border-rose-500 text-rose-700",
                                            isReview && !isSelected && isCorrectOption && "bg-green-50 border-green-300 text-green-700",
                                            isReview && !isSelected && !isCorrectOption && "bg-gray-50 border-gray-200 text-gray-500",

                                            // Normal mode styling
                                            !isReview && isSelected && "bg-blue-50 border-blue-500 text-blue-700",
                                            !isReview && !isSelected && "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100"
                                        );

                                        return (
                                            <button
                                                key={option.id}
                                                className={className}
                                                onClick={() => handleSelectAnswer(currentQuestionId, option.id)}
                                                disabled={isReview}
                                            >
                                                <span className="font-medium">{option.text}</span>
                                                {isReview && isSelected && (
                                                    isCorrectOption ? (
                                                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                    ) : (
                                                        <XCircle className="h-4 w-4 text-rose-500 flex-shrink-0" />
                                                    )
                                                )}
                                                {isReview && !isSelected && isCorrectOption && (
                                                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Navigation buttons */}
                                <div className="flex justify-between mt-6">
                                    <Button
                                        variant="default"
                                        disabled={currentQuestion === 0}
                                        onClick={() => setCurrentQuestion(prev => prev - 1)}
                                        className="flex items-center gap-1 h-9 px-3"
                                        size="sm"
                                    >
                                        <ArrowLeft className="h-3 w-3" />
                                        Previous
                                    </Button>

                                    {isReview ? (
                                        <Button
                                            variant="default"
                                            onClick={() => router.push(`/test/${test.id}/results`)}
                                            className="flex items-center gap-1 h-9 px-3"
                                            size="sm"
                                        >
                                            Back to Results
                                        </Button>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            onClick={() => {
                                                if (currentQuestion < test.questions.length - 1) {
                                                    setCurrentQuestion(prev => prev + 1);
                                                } else {
                                                    // Store answers in localStorage before navigating
                                                    localStorage.setItem(`test_${test.id}_answers`, JSON.stringify(selectedAnswers));
                                                    router.push(`/test/${test.id}/results`);
                                                }
                                            }}
                                            className="flex items-center gap-1 h-9 px-3"
                                            size="sm"
                                            disabled={!selectedAnswers[currentQuestionId]}
                                        >
                                            {currentQuestion < test.questions.length - 1 ? (
                                                <>
                                                    Next
                                                    <ArrowRight className="h-3 w-3" />
                                                </>
                                            ) : (
                                                "Finish Test"
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right sidebar - Timer */}
                    <div className={cn(
                        "w-[260px] bg-white border-l border-gray-200 overflow-y-auto",
                        isFullScreen && "hidden"
                    )}>
                        {!isReview && (
                            <div className="p-4 sticky top-0">
                                <h2 className="text-base font-semibold mb-3 text-gray-700">Time Remaining</h2>
                                <div className={`flex flex-col items-center justify-center p-3 rounded-lg ${timeRemaining < 60
                                        ? 'bg-red-50 text-red-600 animate-pulse'
                                        : timeRemaining < 300
                                            ? 'bg-orange-50 text-orange-600'
                                            : 'bg-blue-50 text-blue-600'
                                    }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span className="font-mono text-2xl font-bold">{formatTime(timeRemaining)}</span>
                                    <p className="text-xs mt-1 text-center">
                                        {timeRemaining < 60
                                            ? 'Hurry up!'
                                            : timeRemaining < 300
                                                ? 'Time is running out!'
                                                : 'You have plenty of time'}
                                    </p>
                                </div>

                                {/* Progress bar */}
                                <div className="mt-4">
                                    <h3 className="text-xs font-medium text-gray-700 mb-1">Your Progress</h3>
                                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                        <span>Answered</span>
                                        <span>{Object.keys(selectedAnswers).length} of {test.questions.length}</span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                </div>

                                {/* Tips section */}
                                <div className="mt-4 pt-3 border-t border-gray-100">
                                    <h3 className="text-xs font-medium text-gray-700 mb-2">Tips</h3>
                                    <ul className="text-xs text-gray-600 space-y-1 list-disc pl-4">
                                        <li>Read each question carefully</li>
                                        <li>Answer easier questions first</li>
                                        <li>Don't spend too much time on one question</li>
                                    </ul>
                                </div>
                            </div>
                        )}

                        {isReview && (
                            <div className="p-4 sticky top-0">
                                <h2 className="text-base font-semibold mb-3 text-gray-700">Review Mode</h2>
                                <div className="bg-blue-50 p-3 rounded-lg text-blue-700 mb-3">
                                    <p className="text-xs">
                                        You're currently reviewing your test answers. Green indicates correct answers,
                                        and red indicates incorrect ones.
                                    </p>
                                </div>

                                <div className="space-y-1 text-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Total questions:</span>
                                        <span className="font-medium">{test.questions.length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Answered:</span>
                                        <span className="font-medium">{Object.keys(selectedAnswers).length}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Skipped:</span>
                                        <span className="font-medium">{test.questions.length - Object.keys(selectedAnswers).length}</span>
                                    </div>
                                </div>

                                <Button
                                    variant="primary"
                                    className="w-full mt-4 h-8 text-xs"
                                    size="sm"
                                    onClick={() => router.push(`/test/${test.id}/results`)}
                                >
                                    Finish Review
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};











