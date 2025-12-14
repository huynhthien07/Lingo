import { MessageSquare } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function StudentChatbotPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">AI Chatbot</h1>
        <p className="text-gray-600 mt-2">Trò chuyện với AI để luyện tập tiếng Anh</p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <MessageSquare className="h-20 w-20 text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Tính năng đang phát triển</h3>
          <p className="text-gray-600 text-center max-w-md">
            Tính năng AI Chatbot đang được phát triển. Bạn sẽ có thể trò chuyện với AI để luyện tập tiếng Anh trong thời gian tới.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

