"use client";

import Link from "next/link";
import { Edit, Eye } from "lucide-react";

interface User {
  id: number;
  userId: string;
  userName: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  status: string;
}

interface UserCardProps {
  user: User;
}

const roleColors = {
  ADMIN: "bg-red-100 text-red-800",
  TEACHER: "bg-blue-100 text-blue-800",
  STUDENT: "bg-green-100 text-green-800",
};

const statusColors = {
  active: "bg-green-100 text-green-800",
  blocked: "bg-red-100 text-red-800",
};

/**
 * UserCard - Display individual user row in table
 */
export function UserCard({ user }: UserCardProps) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm font-medium text-gray-900">{user.userName}</div>
        <div className="text-sm text-gray-500">{user.userId}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="text-sm text-gray-900">{user.email}</div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            roleColors[user.role]
          }`}
        >
          {user.role}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            statusColors[user.status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
          }`}
        >
          {user.status}
        </span>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end gap-2">
          <Link
            href={`/users/${user.id}`}
            className="text-blue-600 hover:text-blue-900"
            title="View"
          >
            <Eye className="w-4 h-4" />
          </Link>
          <Link
            href={`/users/${user.id}/edit`}
            className="text-green-600 hover:text-green-900"
            title="Edit"
          >
            <Edit className="w-4 h-4" />
          </Link>
        </div>
      </td>
    </tr>
  );
}

