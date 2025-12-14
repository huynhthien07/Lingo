"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { ExerciseInfoForm } from "./exercise-info-form";
import { ExerciseQuestionsManager } from "./exercise-questions-manager";

interface Exercise {
  id: number;
  question: string;
  type: string;
  difficulty: string;
  points: number;
  passage: string | null;
  audioSrc: string | null;
  imageSrc: string | null;
  explanation: string | null;
  lessonId: number;
  lesson: {
    id: number;
    title: string;
    unit: {
      id: number;
      title: string;
      course: {
        id: number;
        title: string;
      };
    };
  };
  challengeOptions: Array<{
    id: number;
    text: string;
    correct: boolean;
    imageSrc: string | null;
    audioSrc: string | null;
    order: number;
  }>;
  questions?: Array<{
    id: number;
    text: string;
    order: number;
    options: Array<{
      id: number;
      questionId: number;
      text: string;
      correct: boolean;
      imageSrc: string | null;
      audioSrc: string | null;
      order: number;
    }>;
  }>;
}

interface ExerciseDetailViewProps {
  exerciseId: number;
  initialExercise: Exercise | null;
}

export function ExerciseDetailView({ exerciseId, initialExercise }: ExerciseDetailViewProps) {
  const router = useRouter();
  const [exercise, setExercise] = useState<Exercise | null>(initialExercise);
  const [saving, setSaving] = useState(false);

  if (!exercise) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 text-lg mb-4">Exercise not found or you don't have access</p>
        <Link
          href="/teacher/exercises"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Exercises
        </Link>
      </div>
    );
  }

  const handleSaveExercise = async (updatedData: any) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/teacher/exercises/${exerciseId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh exercise data
        const refreshResponse = await fetch(`/api/teacher/exercises/${exerciseId}`);
        if (refreshResponse.ok) {
          const refreshData = await refreshResponse.json();
          setExercise(refreshData.data);
        }
        alert("Exercise updated successfully!");
      } else {
        const error = await response.json();
        alert(error.error || "Failed to update exercise");
      }
    } catch (error) {
      console.error("Error updating exercise:", error);
      alert("Failed to update exercise");
    } finally {
      setSaving(false);
    }
  };

  const handleOptionsUpdate = () => {
    // Refresh exercise data to get updated options
    fetch(`/api/teacher/exercises/${exerciseId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setExercise(data.data);
        }
      });
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/teacher/courses" className="hover:text-blue-600">
          Courses
        </Link>
        <span>/</span>
        <Link href={`/teacher/courses/${exercise.lesson.unit.course.id}`} className="hover:text-blue-600">
          {exercise.lesson.unit.course.title}
        </Link>
        <span>/</span>
        <Link href={`/teacher/units/${exercise.lesson.unit.id}`} className="hover:text-blue-600">
          {exercise.lesson.unit.title}
        </Link>
        <span>/</span>
        <Link href={`/teacher/lessons/${exercise.lessonId}`} className="hover:text-blue-600">
          {exercise.lesson.title}
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">Exercise #{exercise.id}</span>
      </div>

      {/* Exercise Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Exercise Information</h3>
        <ExerciseInfoForm exercise={exercise} onSave={handleSaveExercise} saving={saving} />
      </div>

      {/* Questions & Answers */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-xl font-semibold mb-4">Questions & Answers</h3>
        <ExerciseQuestionsManager
          exerciseId={exerciseId}
          exerciseType={exercise.type}
          questions={exercise.questions || []}
          onUpdate={handleOptionsUpdate}
        />
      </div>
    </div>
  );
}

