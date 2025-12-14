'use client'
import { Button } from "@/components/ui/button";
import { ClerkLoaded, ClerkLoading, SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Loader } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export const Header = () => {
    return (
        <header className="h-20 w-full border-b-2 border-slate-200 px-4">
            <div className="max-w-screen-xl mx-auto flex items-center justify-between h-full">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-x-3">
                    <Image src="/mascot.svg" height={40} width={40} alt="Mascot" />
                    <h1 className="text-2xl font-extrabold text-green-600 tracking-wide">
                        Lingo
                    </h1>
                </Link>

                {/* Navigation Menu */}
                <nav className="hidden md:flex items-center gap-x-6">
                    <Link href="/" className="text-slate-700 hover:text-green-600 font-medium transition">
                        Trang chủ
                    </Link>
                    <Link href="/courses-public" className="text-slate-700 hover:text-green-600 font-medium transition">
                        Khóa học
                    </Link>
                    <Link href="/admission-test" className="text-slate-700 hover:text-green-600 font-medium transition">
                        Test Admission
                    </Link>
                    <Link href="/about" className="text-slate-700 hover:text-green-600 font-medium transition">
                        About Us
                    </Link>
                    <Link href="/contact" className="text-slate-700 hover:text-green-600 font-medium transition">
                        Contact
                    </Link>
                </nav>

                {/* Auth Buttons */}
                <div className="flex items-center gap-x-3">
                    <ClerkLoading>
                        <Loader className="h-5 w-5 text-muted-foreground animate-spin" />
                    </ClerkLoading>
                    <ClerkLoaded>
                        <SignedIn>
                            <Button asChild variant="ghost" size="sm">
                                <Link href="/dashboard">Dashboard</Link>
                            </Button>
                            <UserButton afterSignOutUrl="/" />
                        </SignedIn>
                        <SignedOut>
                            <SignInButton
                                mode="modal"
                                afterSignInUrl="/dashboard"
                                afterSignUpUrl="/dashboard"
                            >
                                <Button variant="ghost" size="sm">
                                    Đăng nhập
                                </Button>
                            </SignInButton>
                            <SignInButton
                                mode="modal"
                                afterSignInUrl="/dashboard"
                                afterSignUpUrl="/dashboard"
                            >
                                <Button size="sm">
                                    Đăng ký
                                </Button>
                            </SignInButton>
                        </SignedOut>
                    </ClerkLoaded>
                </div>
            </div>
        </header>
    );
};