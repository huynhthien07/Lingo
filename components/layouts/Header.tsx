"use client";

import { UserButton } from "@clerk/nextjs";
import { Menu } from "lucide-react";

interface HeaderProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

/**
 * Header - Top navigation bar with menu toggle and user button
 */
export function Header({ onMenuClick, sidebarOpen }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-30 h-16">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Menu button and logo */}
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6 text-gray-600" />
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#18AA26] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">
              Lingo IELTS
            </h1>
          </div>
        </div>

        {/* Right side - User button */}
        <div className="flex items-center gap-4">
          <UserButton 
            afterSignOutUrl="/sign-in"
            appearance={{
              elements: {
                avatarBox: "w-10 h-10"
              }
            }}
          />
        </div>
      </div>
    </header>
  );
}

