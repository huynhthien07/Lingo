"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";

interface PermissionGuardProps {
  permission: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * PermissionGuard - Client component to check if user has permission
 * Usage: <PermissionGuard permission="COURSE_CREATE"><Button /></PermissionGuard>
 */
export function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const { userId } = useAuth();
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkPermission() {
      if (!userId) {
        setHasPermission(false);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/auth/check-permission?permission=${permission}`);
        const data = await response.json();
        setHasPermission(data.hasPermission);
      } catch (error) {
        console.error("Error checking permission:", error);
        setHasPermission(false);
      } finally {
        setLoading(false);
      }
    }

    checkPermission();
  }, [userId, permission]);

  if (loading) {
    return null; // Or loading spinner
  }

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

