"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

/**
 * Hook to track user login and save information to the users table
 * This runs once when the user is authenticated and ensures their data is saved
 */
export const useLoginTracker = () => {
    const { user, isLoaded } = useUser();
    const hasTracked = useRef(false);

    useEffect(() => {
        // Only track once per session and when user is loaded and authenticated
        if (isLoaded && user && !hasTracked.current) {
            trackUserLogin();
            hasTracked.current = true;
        }
    }, [isLoaded, user]);

    const trackUserLogin = async () => {
        try {
            console.log("🔄 Tracking user login...");
            
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log("✅ User login tracked successfully:", data.user);
            } else {
                console.error("❌ Failed to track user login:", response.statusText);
            }
        } catch (error) {
            console.error("❌ Error tracking user login:", error);
        }
    };

    return {
        isTracking: isLoaded && user && !hasTracked.current,
        hasTracked: hasTracked.current,
    };
};
