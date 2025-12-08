"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface RoleGuardProps {
  allowedRoles: ("ADMIN" | "TEACHER" | "STUDENT")[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
  redirectTo?: string;
}

/**
 * RoleGuard - Client component to check if user has required role
 * Usage: <RoleGuard allowedRoles={["ADMIN", "TEACHER"]}><Content /></RoleGuard>
 */
export function RoleGuard({ 
  allowedRoles, 
  children, 
  fallback = null,
  redirectTo 
}: RoleGuardProps) {
  const { userId } = useAuth();
  const router = useRouter();
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkRole() {
      if (!userId) {
        setHasAccess(false);
        setLoading(false);
        if (redirectTo) {
          router.push(redirectTo);
        }
        return;
      }

      try {
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        const userRole = data.role;

        const hasRole = allowedRoles.includes(userRole);
        setHasAccess(hasRole);

        if (!hasRole && redirectTo) {
          router.push(redirectTo);
        }
      } catch (error) {
        console.error("Error checking role:", error);
        setHasAccess(false);
        if (redirectTo) {
          router.push(redirectTo);
        }
      } finally {
        setLoading(false);
      }
    }

    checkRole();
  }, [userId, allowedRoles, redirectTo, router]);

  if (loading) {
    return null; // Or loading spinner
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

