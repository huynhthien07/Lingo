"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, Target } from "lucide-react";

interface AdmissionTest {
  id: number;
  title: string;
  description: string | null;
  imageSrc: string | null;
  duration: number;
  sections: Array<{
    id: number;
    title: string;
    skillType: string;
    questions: Array<{
      id: number;
    }>;
  }>;
}

export function AdmissionTestsList() {
  const router = useRouter();
  const [tests, setTests] = useState<AdmissionTest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdmissionTests();
  }, []);

  const fetchAdmissionTests = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admission-tests");
      const data = await response.json();
      setTests(data.tests || []);
    } catch (error) {
      console.error("Error fetching admission tests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartTest = async (testId: number) => {
    try {
      // Redirect to test page - the test page will handle starting the test
      router.push(`/admission-test/${testId}`);
    } catch (error) {
      console.error("Error starting test:", error);
      alert("Failed to start test. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (tests.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">No admission tests available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tests.map((test) => {
        const totalQuestions = test.sections.reduce(
          (sum, section) => sum + section.questions.length,
          0
        );

        const readingSections = test.sections.filter((s) => s.skillType === "READING");
        const listeningSections = test.sections.filter((s) => s.skillType === "LISTENING");

        return (
          <Card key={test.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="text-xl">{test.title}</CardTitle>
              <CardDescription>{test.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{test.duration} mins</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" />
                  <span>{totalQuestions} questions</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="w-4 h-4 text-blue-600" />
                  <span className="font-medium">Skills tested:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {readingSections.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      Reading ({readingSections.reduce((sum, s) => sum + s.questions.length, 0)} questions)
                    </span>
                  )}
                  {listeningSections.length > 0 && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Listening ({listeningSections.reduce((sum, s) => sum + s.questions.length, 0)} questions)
                    </span>
                  )}
                </div>
              </div>

              <Button
                onClick={() => handleStartTest(test.id)}
                className="w-full"
                size="lg"
              >
                Start Test
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Get personalized course recommendations based on your results
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

