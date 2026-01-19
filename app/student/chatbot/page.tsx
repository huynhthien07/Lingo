import { ChatbotInterface } from "@/components/student/chatbot/chatbot-interface";

export default function StudentChatbotPage() {
  return (
    <div className="p-6 max-w-7xl mx-auto h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">AI Tutor Chatbot</h1>
        <p className="text-gray-600 mt-2">Trò chuyện với AI để luyện tập tiếng Anh và cải thiện kỹ năng IELTS của bạn</p>
      </div>

      {/* Chatbot Interface */}
      <div className="flex-1 min-h-0">
        <ChatbotInterface />
      </div>
    </div>
  );
}

