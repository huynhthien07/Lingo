import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";

// Mock data - same as in route.ts
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
        id: "4",
        category: "User Management",
        key: "allow_registration",
        label: "Allow User Registration",
        description: "Enable or disable new user registration",
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
];

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ settingId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const settingId = (await params).settingId;
        const setting = MOCK_SETTINGS.find(s => s.id === settingId);

        if (!setting) {
            return new NextResponse("Setting not found", { status: 404 });
        }

        return NextResponse.json(setting);
    } catch (error) {
        console.error("Error fetching setting:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ settingId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const settingId = (await params).settingId;
        const body = await req.json();

        const settingIndex = MOCK_SETTINGS.findIndex(s => s.id === settingId);

        if (settingIndex === -1) {
            return new NextResponse("Setting not found", { status: 404 });
        }

        // Update setting value
        let newValue = body.value;

        // Convert value based on type
        if (MOCK_SETTINGS[settingIndex].type === 'boolean') {
            newValue = Boolean(newValue);
        } else if (MOCK_SETTINGS[settingIndex].type === 'number') {
            newValue = Number(newValue);
        }

        MOCK_SETTINGS[settingIndex] = {
            ...MOCK_SETTINGS[settingIndex],
            value: newValue,
        };

        return NextResponse.json(MOCK_SETTINGS[settingIndex]);
    } catch (error) {
        console.error("Error updating setting:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

