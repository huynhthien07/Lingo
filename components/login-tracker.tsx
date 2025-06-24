"use client";

import { useLoginTracker } from "@/hooks/use-login-tracker";

/**
 * Component that tracks user login and saves information to the users table
 * This component is included in the root layout to ensure it runs on every page load
 */
export const LoginTracker = () => {
    // Use the login tracker hook to handle the login tracking logic
    useLoginTracker();

    // This component doesn't render anything visible
    return null;
};
