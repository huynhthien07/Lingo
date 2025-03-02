"use client";

import { Button } from "@/components/ui/button";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

type Props = {
    label: string;
    inconSrc: string;
    href: string;
};

export const SidebarItem = ({
    label,
    inconSrc,
    href
}: Props) => {

    const pathname = usePathname();
    const active = pathname === href;

    return (
        <Button
            variant={active ? "sidebarOutline" : "sidebar"}
            className="justify-start h-[52px]"
            asChild
        >
            <Link href={href}>
                <Image
                    src={inconSrc}
                    height={32}
                    width={32}
                    alt={label}
                    className="mr-5"
                />
                {label}
            </Link>
        </Button>
    );
};