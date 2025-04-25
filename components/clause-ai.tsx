"use client";

import { useState } from "react";

const ClauseAI = () => {
    const [messages, setMessages] = useState([
        { from: "ai", text: "Hello! I'm ClauseAI. How can I help you today?" },
    ]);
    const [input, setInput] = useState("");

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages((prev) => [...prev, { from: "user", text: input }]);
        setInput("");
    };

    return (
        <div className="w-full h-[550] flex flex-col bg-white gap-4 border-sky-500">
            <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">AI Assistant</h2>
            </div>
            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
                <div className="flex flex-col gap-2">
                    {messages.map((msg, idx) => (
                        <div
                            key={idx}
                            className={`px-3 py-2 rounded-xl max-w-xs text-sm ${msg.from === "ai"
                                ? "bg-blue-100 self-start"
                                : "bg-green-100 self-end"
                                }`}
                        >
                            {msg.text}
                        </div>
                    ))}
                </div>
            </div>
            <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                    <input
                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-400"
                        placeholder="Type your message..."
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                        onClick={handleSend}
                        className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ClauseAI;

