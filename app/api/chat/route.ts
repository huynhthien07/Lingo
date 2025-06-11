import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Khởi tạo OpenAI với API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,  // Đảm bảo rằng bạn đã thêm key vào .env.local
});

// Định nghĩa kiểu dữ liệu cho mỗi tin nhắn
interface Message {
  role: 'user' | 'assistant';  // Role có thể là 'user' hoặc 'assistant'
  text: string;  // Nội dung tin nhắn
}

export async function POST(req: NextRequest) {
  // Lấy dữ liệu từ yêu cầu
  const { messages }: { messages: Message[] } = await req.json();

  console.log("Received messages:", messages);  // Thêm log để kiểm tra dữ liệu gửi lên

  // Kiểm tra xem tin nhắn có hợp lệ không
  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: "No messages provided" }, { status: 400 });
  }

  try {
    // Gọi OpenAI API để lấy phản hồi từ ChatGPT
    const chatResponse = await openai.chat.completions.create({
      model: "gpt-3.5-turbo", // Hoặc "gpt-4" nếu cần
      messages: messages.map((msg) => ({
        role: msg.role,  // Đảm bảo mỗi tin nhắn có role đúng (user hoặc assistant)
        content: msg.text,
      })),
    });

    console.log("ChatGPT Response:", chatResponse);  // Thêm log để kiểm tra phản hồi từ API

    // Trả về kết quả từ OpenAI
    return NextResponse.json({
      reply: chatResponse.choices[0].message.content,  // Trả về nội dung phản hồi
    });
  } catch (error) {
    // In lỗi chi tiết ra console để debug
    console.error("OpenAI API error:", error);
    return NextResponse.json({ error: "Failed to get response from OpenAI" }, { status: 500 });
  }
}
