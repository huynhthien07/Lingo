// import { getCourses, getUserProgress } from "@/db/queries";
// import { List } from "./list";

// const CoursesPage = async () => {
//     const coursesData =  getCourses();
//     const userProgressData =  getUserProgress();

//     const [
//         courses,
//         userProgress,
//     ] = await Promise.all([
//         coursesData,
//         userProgressData,
//     ]);

//     return(
//         <div className="h-full max-w-[912px] px-3 mx-auto">
//             <h1 className="text-2xl font-bold text-neutral-700">
//                 Languages Courses
//             </h1>
//             <List
//                 courses = {courses}
//                 activeCourseId = {userProgress?.activeCourseId}
//             />
//         </div>

//     );
// }
// export default CoursesPage;

"use client";

import React, { useState, useEffect } from 'react';

const PracticePage = () => {
    const initialTime = 90 * 60; // 90 phút
    const [timeLeft, setTimeLeft] = useState(initialTime);
    const [isRunning, setIsRunning] = useState(false);
    const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

    // Định dạng thời gian
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    // Bắt đầu hoặc tiếp tục đếm ngược
    const startTimer = () => {
        if (isRunning) return;
        setIsRunning(true);
        const id = setInterval(() => {
            setTimeLeft((prevTime) => {
                if (prevTime <= 0) {
                    clearInterval(id);
                    setIsRunning(false);
                    return 0;
                }
                return prevTime - 1;
            });
        }, 1000);
        setIntervalId(id);
    };

    // Dừng đếm ngược
    const stopTimer = () => {
        if (intervalId) {
            clearInterval(intervalId);
            setIsRunning(false);
        }
    };

    // Làm mới bộ đếm ngược
    const resetTimer = () => {
        stopTimer();
        setTimeLeft(initialTime);
    };

    useEffect(() => {
        return () => {
            if (intervalId) clearInterval(intervalId);
        };
    }, [intervalId]);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="grid grid-cols-4 gap-6 max-w-6xl mx-auto">
                {/* Cột trái: Câu hỏi và đáp án */}
                <div className="col-span-3 bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-semibold mb-4">Câu hỏi 1:</h2>
                    <p className="mb-6">What is React?</p>
                    <div className="space-y-3">
                        {['A UI library', 'A programming language', 'A database', 'A web browser'].map((option) => (
                            <button
                                key={option}
                                className="w-full text-left px-4 py-2 rounded border bg-gray-100 hover:bg-gray-200"
                            >
                                {option}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Cột phải: Đồng hồ đếm ngược */}
                <div className="col-span-1 bg-white p-6 rounded-lg shadow flex flex-col items-center justify-center">
                    <h3 className="text-lg font-semibold mb-2">Thời gian còn lại</h3>
                    <div className="text-4xl font-bold text-red-600">{formatTime(timeLeft)}</div>
                    <div className="flex flex-row mt-4 space-x-4">
                        <button
                            onClick={startTimer}
                            className="flex text-nowrap px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            {isRunning ? 'Đang chạy...' : 'Bắt đầu'}
                        </button>
                        <button
                            onClick={resetTimer}
                            className="flex text-nowrap px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                            Làm mới
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PracticePage;

