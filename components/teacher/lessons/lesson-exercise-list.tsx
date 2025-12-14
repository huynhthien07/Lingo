"use client";

import { useState, useEffect } from "react";
import { Loader2, ArrowUp, ArrowDown, Trash2, Edit } from "lucide-react";
import Link from "next/link";

interface Exercise {
  id: number;
  question: string;
  type: string;
  difficulty: string;
  points: number;
  order: number;
  optionCount: number;
}

interface LessonExerciseListProps {
  lessonId: number;
  refreshKey: number;
}

export function LessonExerciseList({ lessonId, refreshKey }: LessonExerciseListProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExercises();
  }, [lessonId, refreshKey]);

  const fetchExercises = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/exercises?lessonId=${lessonId}&limit=100`);
      const data = await response.json();
      if (data.success) {
        setExercises(data.data);
      }
    } catch (error) {
      console.error("Error fetching exercises:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveUp = async (exercise: Exercise, index: number) => {
    if (index === 0) return;

    const prevExercise = exercises[index - 1];
    await updateOrder(exercise.id, prevExercise.order);
    await updateOrder(prevExercise.id, exercise.order);
    fetchExercises();
  };

  const handleMoveDown = async (exercise: Exercise, index: number) => {
    if (index === exercises.length - 1) return;

    const nextExercise = exercises[index + 1];
    await updateOrder(exercise.id, nextExercise.order);
    await updateOrder(nextExercise.id, exercise.order);
    fetchExercises();
  };

  const updateOrder = async (exerciseId: number, newOrder: number) => {
    await fetch(`/api/teacher/exercises/${exerciseId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ order: newOrder }),
    });
  };

  const handleDelete = async (exercise: Exercise) => {
    if (!confirm(`Are you sure you want to delete "${exercise.question}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/exercises/${exercise.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchExercises();
      } else {
        alert("Failed to delete exercise");
      }
    } catch (error) {
      console.error("Error deleting exercise:", error);
      alert("Failed to delete exercise");
    }
  };

  const difficultyColors: Record<string, string> = {
    EASY: "bg-green-100 text-green-800",
    MEDIUM: "bg-yellow-100 text-yellow-800",
    HARD: "bg-red-100 text-red-800",
  };

  const typeLabels: Record<string, string> = {
    LISTENING_MULTIPLE_CHOICE: "Listening: Multiple Choice",
    LISTENING_FORM_COMPLETION: "Listening: Form Completion",
    LISTENING_MAP_LABELLING: "Listening: Map Labelling",
    LISTENING_SHORT_ANSWER: "Listening: Short Answer",
    READING_MULTIPLE_CHOICE: "Reading: Multiple Choice",
    READING_TRUE_FALSE_NOT_GIVEN: "Reading: True/False/Not Given",
    READING_MATCHING_HEADINGS: "Reading: Matching Headings",
    READING_SENTENCE_COMPLETION: "Reading: Sentence Completion",
    READING_SUMMARY_COMPLETION: "Reading: Summary Completion",
    WRITING_TASK_1: "Writing: Task 1",
    WRITING_TASK_2: "Writing: Task 2",
    WRITING_PRACTICE: "Writing: Practice",
    SPEAKING_PART_1: "Speaking: Part 1",
    SPEAKING_PART_2: "Speaking: Part 2",
    SPEAKING_PART_3: "Speaking: Part 3",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No exercises yet. Click "Add Exercise" to create one.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {exercises.map((exercise, index) => (
        <div
          key={exercise.id}
          className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
        >
          {/* Order Badge */}
          <div className="flex-shrink-0">
            <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              #{exercise.order}
            </span>
          </div>

          {/* Exercise Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-gray-900 truncate">{exercise.question}</h4>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className={`px-2 py-0.5 rounded text-xs ${difficultyColors[exercise.difficulty] || "bg-gray-100 text-gray-800"}`}>
                {exercise.difficulty}
              </span>
              <span className="text-gray-600">{typeLabels[exercise.type] || exercise.type}</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{exercise.points} points</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">{exercise.optionCount} options</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/teacher/exercises/${exercise.id}`}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit className="w-4 h-4" />
            </Link>
            <button
              onClick={() => handleMoveUp(exercise, index)}
              disabled={index === 0}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move Up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleMoveDown(exercise, index)}
              disabled={index === exercises.length - 1}
              className="p-2 text-gray-600 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="Move Down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(exercise)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

