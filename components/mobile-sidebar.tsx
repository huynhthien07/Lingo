import {
    Sheet,
    SheetContent,
    SheetTrigger
} from "@/components/ui/sheet";

import { Sidebar } from "@/components/sidebar";
import { Menu } from "lucide-react";

export const MobileSideBar = () => {
    return (
        <Sheet>
            <SheetTrigger>
                <Menu className="text-white" />
            </SheetTrigger>
            <SheetContent side="left" >
                <Sidebar className="h-full" />
            </SheetContent>
        </Sheet>
    )
};