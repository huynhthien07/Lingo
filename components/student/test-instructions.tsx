"use client";

import { useState } from "react";
import { AlertCircle, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function TestInstructions() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="h-4 w-4" />
            Lưu ý
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-3 text-sm pt-0">
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-gray-700">
            Đọc kỹ đề bài trước khi trả lời
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-gray-700">
            Bạn có thể quay lại các câu hỏi đã làm để kiểm tra
          </p>
        </div>
        <div className="flex items-start gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-gray-700">
            Câu trả lời được tự động lưu khi bạn chọn
          </p>
        </div>
        <div className="flex items-start gap-2">
          <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <p className="text-gray-700">
            Khi hết thời gian, bài test sẽ tự động nộp
          </p>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-gray-700">
            Không được sử dụng tài liệu tham khảo
          </p>
        </div>
        <div className="flex items-start gap-2">
          <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-gray-700">
            Không được thoát khỏi trang trong khi làm bài
          </p>
        </div>
        </CardContent>
      )}
    </Card>
  );
}

