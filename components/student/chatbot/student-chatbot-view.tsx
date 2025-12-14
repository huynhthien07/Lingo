"use client";

import { MessageSquare, Send } from "lucide-react";

export function StudentChatbotView() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">AI Tutor Chatbot</h1>
        <p className="text-gray-600 mt-2">Get instant help with your IELTS questions</p>
      </div>

      {/* Chat Interface */}
      <div className="bg-white rounded-lg border border-gray-200 flex flex-col" style={{ height: "calc(100vh - 250px)" }}>
        {/* Chat Messages */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-16 h-16 mb-4 text-gray-400" />
            <p className="text-lg font-medium">Start a conversation</p>
            <p className="text-sm mt-2">Ask me anything about IELTS preparation!</p>
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your question here..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </div>
      </div>

      {/* Coming Soon Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Coming Soon:</strong> AI-powered chatbot for IELTS learning assistance.
        </p>
      </div>
    </div>
  );
}

