"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface ForceUpdateProgressButtonProps {
  lessonId: number;
}

export function ForceUpdateProgressButton({ lessonId }: ForceUpdateProgressButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleForceUpdate = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/student/force-update-progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lessonId }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || "Progress updated!");
        console.log("✅ Force update result:", data);
        // Reload page to see changes
        window.location.reload();
      } else {
        toast.error(data.error || "Failed to update progress");
      }
    } catch (error) {
      console.error("Error force updating progress:", error);
      toast.error("Failed to update progress");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleForceUpdate}
      disabled={loading}
      variant="outline"
      size="sm"
      className="gap-2"
    >
      <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
      {loading ? "Đang cập nhật..." : "Cập nhật tiến độ"}
    </Button>
  );
}

