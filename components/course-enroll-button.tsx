"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CourseEnrollButtonProps {
  courseId: number;
  isFree: boolean;
  price: number;
  isEnrolled?: boolean;
}

export function CourseEnrollButton({
  courseId,
  isFree,
  price,
  isEnrolled = false,
}: CourseEnrollButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleEnroll = async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/courses/${courseId}/checkout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to enroll");
      }

      if (data.isFree) {
        // Free course - enrolled directly
        toast.success("Đăng ký thành công!");
        router.push("/student");
        router.refresh();
      } else if (data.url) {
        // Paid course - redirect to Stripe checkout
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Enrollment error:", error);
      toast.error(
        error instanceof Error ? error.message : "Không thể đăng ký khóa học"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isEnrolled) {
    return (
      <Button
        className="w-full"
        size="lg"
        onClick={() => router.push("/student")}
      >
        Vào học
      </Button>
    );
  }

  return (
    <Button
      className="w-full"
      size="lg"
      onClick={handleEnroll}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Đang xử lý...
        </>
      ) : (
        <>
          {isFree ? "Đăng ký miễn phí" : `Đăng ký - $${price}`}
        </>
      )}
    </Button>
  );
}

