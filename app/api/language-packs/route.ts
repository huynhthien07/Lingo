import { NextResponse } from "next/server";
import { getIsAdmin } from "@/lib/admin";

// Mock data for language packs
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
    {
        id: "3",
        code: "es",
        name: "Spanish",
        nativeName: "Español",
        status: "draft",
        translationProgress: 60,
        totalKeys: 250,
        translations: {
            "common.welcome": "Bienvenido",
            "common.login": "Iniciar sesión",
            "common.logout": "Cerrar sesión",
        },
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-11-20"),
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
        const statusFilter = searchParams.get('status');
        
        let filteredPacks = MOCK_LANGUAGE_PACKS;

        if (searchQuery) {
            filteredPacks = filteredPacks.filter(pack =>
                pack.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pack.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pack.nativeName.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (statusFilter) {
            filteredPacks = filteredPacks.filter(pack => pack.status === statusFilter);
        }

        const total = filteredPacks.length;
        const paginatedPacks = filteredPacks.slice(offset, offset + limit);

        const response = NextResponse.json(paginatedPacks);
        response.headers.set('x-total-count', total.toString());
        return response;
    } catch (error) {
        console.error("Error fetching language packs:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

export const POST = async (req: Request) => {
    if (!await getIsAdmin()) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const body = await req.json();

        const newPack = {
            id: String(MOCK_LANGUAGE_PACKS.length + 1),
            code: body.code,
            name: body.name,
            nativeName: body.nativeName,
            status: body.status || "draft",
            translationProgress: 0,
            totalKeys: 0,
            translations: {},
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        MOCK_LANGUAGE_PACKS.push(newPack);

        return NextResponse.json(newPack);
    } catch (error) {
        console.error("Error creating language pack:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
};

