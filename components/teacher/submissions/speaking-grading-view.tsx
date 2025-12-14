"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, User, BookOpen, Calendar, Mic } from "lucide-react";
import Link from "next/link";
import { RichTextEditor } from "../exercises/rich-text-editor";

interface SpeakingSubmission {
  id: number;
  userId: string;
  challengeId: number;
  audioUrl: string;
  duration: number | null;
  submittedAt: string;
  status: string;
  fluencyCoherenceScore: number | null;
  lexicalResourceScore: number | null;
  grammaticalRangeScore: number | null;
  pronunciationScore: number | null;
  overallBandScore: number | null;
  teacherFeedback: string | null;
  user: {
    userName: string | null;
    email: string;
  };
  challenge: {
    question: string;
    type: string;
    lesson: {
      title: string;
      unit: {
        title: string;
        course: {
          title: string;
        };
      };
    };
  };
}

export function SpeakingGradingView({ submissionId }: { submissionId: number }) {
  const router = useRouter();
  const [submission, setSubmission] = useState<SpeakingSubmission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    fluencyCoherenceScore: "" as any,
    lexicalResourceScore: "" as any,
    grammaticalRangeScore: "" as any,
    pronunciationScore: "" as any,
    teacherFeedback: "",
  });

  useEffect(() => {
    fetchSubmission();
  }, [submissionId]);

  const fetchSubmission = async () => {
    try {
      const response = await fetch(
        `/api/teacher/submissions/speaking/${submissionId}`
      );
      const data = await response.json();
      setSubmission(data);

      // Pre-fill form if already graded
      if (data.fluencyCoherenceScore) {
        setFormData({
          fluencyCoherenceScore: data.fluencyCoherenceScore,
          lexicalResourceScore: data.lexicalResourceScore,
          grammaticalRangeScore: data.grammaticalRangeScore,
          pronunciationScore: data.pronunciationScore,
          teacherFeedback: data.teacherFeedback || "",
        });
      }
    } catch (error) {
      console.error("Error fetching submission:", error);
    } finally {
      setLoading(false);
    }
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate feedback length (min 20 characters without HTML)
    const feedbackText = stripHtml(formData.teacherFeedback);
    if (feedbackText.length < 20) {
      alert("Teacher feedback must be at least 20 characters long");
      return;
    }

    setSaving(true);

    try {
      const response = await fetch(
        `/api/teacher/submissions/speaking/${submissionId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fluencyCoherenceScore: parseFloat(formData.fluencyCoherenceScore),
            lexicalResourceScore: parseFloat(formData.lexicalResourceScore),
            grammaticalRangeScore: parseFloat(formData.grammaticalRangeScore),
            pronunciationScore: parseFloat(formData.pronunciationScore),
            teacherFeedback: formData.teacherFeedback,
          }),
        }
      );

      if (response.ok) {
        alert("Grading saved successfully!");
        router.push("/teacher/submissions");
      } else {
        alert("Failed to save grading");
      }
    } catch (error) {
      console.error("Error saving grading:", error);
      alert("Failed to save grading");
    } finally {
      setSaving(false);
    }
  };

  const calculateOverallScore = () => {
    const scores = [
      parseFloat(formData.fluencyCoherenceScore) || 0,
      parseFloat(formData.lexicalResourceScore) || 0,
      parseFloat(formData.grammaticalRangeScore) || 0,
      parseFloat(formData.pronunciationScore) || 0,
    ];
    const avg = scores.reduce((a, b) => a + b, 0) / 4;
    return avg.toFixed(1);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Unknown";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Loading submission...</p>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-gray-500">Submission not found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/teacher/submissions"
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Speaking Submission Review
            </h1>
            <p className="text-gray-600 mt-1">
              Listen and provide feedback for student speaking
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Submission Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-2 flex items-center gap-2">
              <Mic className="w-5 h-5 text-blue-600" />
              Question
            </h3>
            <p className="text-gray-700">{submission.challenge.question}</p>
            <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                {submission.challenge.type}
              </span>
              <span>Duration: {formatDuration(submission.duration)}</span>
            </div>
          </div>

          {/* Audio Player */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Student's Speaking</h3>
            <div className="bg-gray-50 rounded-lg p-6">
              <audio controls className="w-full">
                <source src={submission.audioUrl} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </div>
        </div>

        {/* Right Column - Grading Form */}
        <div className="space-y-6">
          {/* Student Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">Student Information</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                  {(submission.user.userName || submission.user.email)
                    .charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {submission.user.userName || "Student"}
                  </p>
                  <p className="text-sm text-gray-500">{submission.user.email}</p>
                </div>
              </div>
              <div className="pt-3 border-t border-gray-200 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <BookOpen className="w-4 h-4" />
                  <span>{submission.challenge.lesson.unit.course.title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mic className="w-4 h-4" />
                  <span>{submission.challenge.lesson.title}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(submission.submittedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grading Form */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold mb-4">IELTS Band Scores</h3>

            <div className="space-y-4">
              {/* Fluency & Coherence */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fluency & Coherence (0-9)
                </label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.fluencyCoherenceScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      fluencyCoherenceScore: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Lexical Resource */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lexical Resource (0-9)
                </label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.lexicalResourceScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      lexicalResourceScore: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Grammatical Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Grammatical Range & Accuracy (0-9)
                </label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.grammaticalRangeScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      grammaticalRangeScore: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Pronunciation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pronunciation (0-9)
                </label>
                <input
                  type="number"
                  min="0"
                  max="9"
                  step="0.5"
                  value={formData.pronunciationScore}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      pronunciationScore: e.target.value,
                    })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Overall Score Display */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Overall Band Score
                  </span>
                  <span className="text-2xl font-bold text-blue-600">
                    {calculateOverallScore()}
                  </span>
                </div>
              </div>

              {/* Teacher Feedback */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teacher Feedback (min 20 characters)
                </label>
                <RichTextEditor
                  value={formData.teacherFeedback}
                  onChange={(value) =>
                    setFormData({ ...formData, teacherFeedback: value })
                  }
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use formatting tools to highlight key points and provide structured feedback
                </p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-5 h-5" />
                {saving ? "Saving..." : "Save Grading"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

