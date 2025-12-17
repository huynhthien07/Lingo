"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FolderOpen, CreditCard, ArrowRight, BookOpen, Sparkles } from "lucide-react";
import toast from "react-hot-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Category {
  id: number;
  name: string;
  description: string | null;
  flashcardCount: number;
}

const FlashcardCategoriesList = () => {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/student/flashcard-categories");
      const result = await response.json();

      if (result.success) {
        setCategories(result.data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div>
      {categories.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
              <FolderOpen className="w-10 h-10 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No flashcard categories available yet
            </h3>
            <p className="text-sm text-gray-500 text-center max-w-sm">
              Check back later for new vocabulary sets to enhance your learning
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-blue-400 overflow-hidden"
              onClick={() => router.push(`/student/flashcards/${category.id}`)}
            >
              {/* Gradient Header */}
              <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                    <CreditCard className="w-3 h-3 mr-1" />
                    {category.flashcardCount}
                  </Badge>
                </div>

                <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2">
                  {category.name}
                </CardTitle>
              </CardHeader>

              <CardContent>
                {category.description && (
                  <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                    {category.description}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Ready to learn</span>
                  </div>

                  <div className="flex items-center gap-1 text-blue-600 font-semibold text-sm group-hover:gap-2 transition-all">
                    <span>Start</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardCategoriesList;

