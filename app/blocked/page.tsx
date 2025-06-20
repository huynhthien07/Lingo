import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function BlockedPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="max-w-md w-full bg-white rounded-lg shadow-md p-8 text-center">
                <div className="mb-6">
                    <Image
                        src="/mascot.svg"
                        alt="Lingo Mascot"
                        width={80}
                        height={80}
                        className="mx-auto mb-4"
                    />
                    <h1 className="text-2xl font-bold text-red-600 mb-2">
                        Account Blocked
                    </h1>
                    <p className="text-gray-600 mb-6">
                        Your account has been temporarily blocked by an administrator.
                        Please contact support if you believe this is an error.
                    </p>
                </div>

                <div className="space-y-4">
                    <SignOutButton>
                        <Button className="w-full" variant="primaryOutline">
                            Sign Out
                        </Button>
                    </SignOutButton>

                    <p className="text-sm text-gray-500">
                        If you need assistance, please contact our support team.
                    </p>
                </div>
            </div>
        </div>
    );
}
