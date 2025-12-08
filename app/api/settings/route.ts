import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";

// Mock data for system settings
const MOCK_SETTINGS = [
    {
        id: "1",
        category: "General",
        key: "site_name",
        label: "Site Name",
        description: "The name of the IELTS learning platform",
        value: "IELTS Learning Platform",
        type: "text",
    },
    {
        id: "2",
        category: "General",
        key: "site_description",
        label: "Site Description",
        description: "Brief description of the platform",
        value: "Comprehensive IELTS preparation platform with AI-powered learning",
        type: "text",
    },
    {
        id: "3",
        category: "General",
        key: "default_language",
        label: "Default Language",
        description: "Default language for new users",
        value: "en",
        type: "select",
        options: [
            { id: "en", name: "English" },
            { id: "vi", name: "Vietnamese" },
        ],
    },
    {
        id: "4",
        category: "User Management",
        key: "allow_registration",
        label: "Allow User Registration",
        description: "Enable or disable new user registration",
        value: true,
        type: "boolean",
    },
    {
        id: "5",
        category: "User Management",
        key: "require_email_verification",
        label: "Require Email Verification",
        description: "Require users to verify their email before accessing the platform",
        value: true,
        type: "boolean",
    },
    {
        id: "6",
        category: "User Management",
        key: "max_login_attempts",
        label: "Max Login Attempts",
        description: "Maximum number of failed login attempts before account lockout",
        value: 5,
        type: "number",
    },
    {
        id: "7",
        category: "Course Settings",
        key: "default_course_duration",
        label: "Default Course Duration (days)",
        description: "Default duration for course access after enrollment",
        value: 90,
        type: "number",
    },
    {
        id: "8",
        category: "Course Settings",
        key: "enable_course_reviews",
        label: "Enable Course Reviews",
        description: "Allow students to review and rate courses",
        value: true,
        type: "boolean",
    },
    {
        id: "9",
        category: "Grading",
        key: "auto_grade_multiple_choice",
        label: "Auto-grade Multiple Choice",
        description: "Automatically grade multiple choice questions",
        value: true,
        type: "boolean",
    },
    {
        id: "10",
        category: "Grading",
        key: "grading_turnaround_days",
        label: "Grading Turnaround (days)",
        description: "Expected number of days for teachers to grade submissions",
        value: 3,
        type: "number",
    },
    {
        id: "11",
        category: "Notifications",
        key: "enable_email_notifications",
        label: "Enable Email Notifications",
        description: "Send email notifications to users",
        value: true,
        type: "boolean",
    },
    {
        id: "12",
        category: "Notifications",
        key: "enable_push_notifications",
        label: "Enable Push Notifications",
        description: "Send push notifications to users",
        value: false,
        type: "boolean",
    },
];

export const GET = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('_page') || '1', 10);
        const limit = parseInt(searchParams.get('_limit') || '25', 10);
        const offset = (page - 1) * limit;

        // Filter by search query
        const searchQuery = searchParams.get('q');
        let filteredSettings = MOCK_SETTINGS;

        if (searchQuery) {
            filteredSettings = MOCK_SETTINGS.filter(setting =>
                setting.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
                setting.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
                setting.category.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        const total = filteredSettings.length;
        const paginatedSettings = filteredSettings.slice(offset, offset + limit);

        const response = NextResponse.json(paginatedSettings);
        response.headers.set('x-total-count', total.toString());
        return response;
    } catch (error) {
        console.error("Error fetching settings:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

