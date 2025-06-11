"use client";

import { useEffect, useState } from "react";

const ClauseAI = () => {
  const [messages, setMessages] = useState([
    {
      from: "ai",
      text: "Hello! I'm ClauseAI. How can I help you today?",
      role: "assistant",  // Thêm role cho tin nhắn đầu tiên
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Hàm lưu lịch sử chat vào localStorage
  const saveChatHistory = (messages: any[]) => {
    localStorage.setItem("chatHistory", JSON.stringify(messages)); // Lưu vào localStorage
  };

  // Hàm gửi tin nhắn tới API ChatGPT
  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { from: "user", text: input, role: "user" };

    // Cập nhật lịch sử tin nhắn và lưu vào localStorage
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages); // Lưu lịch sử vào localStorage

    setInput(""); // Xóa input sau khi gửi
    setLoading(true); // Bắt đầu loading

    try {
      // Gửi yêu cầu tới API ChatGPT, sử dụng messages đã được cập nhật
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: updatedMessages,  // Dùng messages đã được cập nhật
        }),
      });

      if (!res.ok) {
        throw new Error(`Error: ${res.statusText}`);
      }

      const data = await res.json();
      if (data.reply) {
        // Cập nhật tin nhắn trả lời từ AI với role là "assistant"
        const responseMessage = { from: "ai", text: data.reply, role: "assistant" };
        const finalMessages = [...updatedMessages, responseMessage];
        setMessages(finalMessages);
        saveChatHistory(finalMessages); // Lưu lịch sử chat
      } else {
        throw new Error("No reply from AI");
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      const errorMessage = { from: "ai", text: "Sorry, something went wrong. Please try again.", role: "assistant" };
      const finalMessages = [...updatedMessages, errorMessage];
      setMessages(finalMessages);
      saveChatHistory(finalMessages); // Lưu lịch sử chat khi có lỗi
    } finally {
      setLoading(false); // Kết thúc loading
    }
  };

  // Load lịch sử chat khi component được mount
  useEffect(() => {
    const storedMessages = localStorage.getItem("chatHistory");
    if (storedMessages) {
      setMessages(JSON.parse(storedMessages));
    }
  }, []);

  return (
    <div className="w-full h-screen flex flex-col bg-white shadow-lg rounded-xl overflow-hidden">
      {/* Header Chatbot */}
      <div className="p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-center">
        <h2 className="text-2xl font-semibold">AI Assistant</h2>
        <p className="text-sm">Your English learning assistant</p>
      </div>

      {/* Hiển thị lịch sử trò chuyện */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        <div className="flex flex-col gap-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`px-4 py-3 rounded-lg max-w-[80%] text-sm ${
                msg.role === "assistant"
                  ? "bg-blue-100 self-start"
                  : "bg-green-100 self-end"
              } shadow-sm transition-transform transform hover:scale-105`}
            >
              {msg.text}
            </div>
          ))}
        </div>
      </div>

      {/* Input và nút gửi */}
      <div className="p-4 bg-white border-t border-gray-200 flex gap-2 items-center">
        <input
          className="flex-1 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button
          onClick={handleSend}
          disabled={loading}
          className="px-6 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? "Loading..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default ClauseAI;
