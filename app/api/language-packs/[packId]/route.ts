import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";

// Mock data - same as in route.ts
const MOCK_LANGUAGE_PACKS = [
    {
        id: "1",
        code: "en",
        name: "English",
        nativeName: "English",
        status: "active",
        translationProgress: 100,
        totalKeys: 250,
        translations: {
            "common.welcome": "Welcome",
            "common.login": "Login",
            "common.logout": "Logout",
            "dashboard.title": "Dashboard",
            "user.profile": "User Profile",
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-12-01"),
    },
    {
        id: "2",
        code: "vi",
        name: "Vietnamese",
        nativeName: "Tiếng Việt",
        status: "active",
        translationProgress: 95,
        totalKeys: 250,
        translations: {
            "common.welcome": "Chào mừng",
            "common.login": "Đăng nhập",
            "common.logout": "Đăng xuất",
            "dashboard.title": "Bảng điều khiển",
            "user.profile": "Hồ sơ người dùng",
        },
        createdAt: new Date("2024-01-01"),
        updatedAt: new Date("2024-12-05"),
    },
];

export const GET = async (
    req: Request,
    { params }: { params: Promise<{ packId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const packId = (await params).packId;
        const pack = MOCK_LANGUAGE_PACKS.find(p => p.id === packId);

        if (!pack) {
            return new NextResponse("Language pack not found", { status: 404 });
        }

        return NextResponse.json(pack);
    } catch (error) {
        console.error("Error fetching language pack:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const PUT = async (
    req: Request,
    { params }: { params: Promise<{ packId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const packId = (await params).packId;
        const body = await req.json();

        const packIndex = MOCK_LANGUAGE_PACKS.findIndex(p => p.id === packId);

        if (packIndex === -1) {
            return new NextResponse("Language pack not found", { status: 404 });
        }

        // Parse translations if it's a string
        let translations = MOCK_LANGUAGE_PACKS[packIndex].translations;
        if (body.translations) {
            try {
                translations = typeof body.translations === 'string' 
                    ? JSON.parse(body.translations) 
                    : body.translations;
            } catch (e) {
                console.error("Error parsing translations:", e);
            }
        }

        // Calculate progress
        const totalKeys = Object.keys(translations).length;
        const filledKeys = Object.values(translations).filter(v => v && String(v).trim() !== '').length;
        const progress = totalKeys > 0 ? Math.round((filledKeys / totalKeys) * 100) : 0;

        // Update pack
        MOCK_LANGUAGE_PACKS[packIndex] = {
            ...MOCK_LANGUAGE_PACKS[packIndex],
            name: body.name || MOCK_LANGUAGE_PACKS[packIndex].name,
            nativeName: body.nativeName || MOCK_LANGUAGE_PACKS[packIndex].nativeName,
            status: body.status || MOCK_LANGUAGE_PACKS[packIndex].status,
            translations,
            totalKeys,
            translationProgress: progress,
            updatedAt: new Date(),
        };

        return NextResponse.json(MOCK_LANGUAGE_PACKS[packIndex]);
    } catch (error) {
        console.error("Error updating language pack:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const DELETE = async (
    req: Request,
    { params }: { params: Promise<{ packId: string }> },
) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const packId = (await params).packId;

        // Prevent deletion of default language packs
        if (["1", "2"].includes(packId)) {
            return new NextResponse("Cannot delete default language packs", { status: 403 });
        }

        const packIndex = MOCK_LANGUAGE_PACKS.findIndex(p => p.id === packId);

        if (packIndex === -1) {
            return new NextResponse("Language pack not found", { status: 404 });
        }

        const deletedPack = MOCK_LANGUAGE_PACKS.splice(packIndex, 1)[0];

        return NextResponse.json(deletedPack);
    } catch (error) {
        console.error("Error deleting language pack:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

