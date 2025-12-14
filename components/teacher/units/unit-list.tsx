"use client";

import { useState, useEffect } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import { UnitCard } from "./unit-card";
import Link from "next/link";

interface Unit {
  id: number;
  title: string;
  description: string;
  courseId: number;
  courseTitle: string;
  order: number;
  lessonCount: number;
}

export function UnitList() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchUnits();
  }, [search, page]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "12",
        search: search,
      });

      const response = await fetch(`/api/teacher/units?${params}`);
      const data = await response.json();

      if (data.success) {
        setUnits(data.data);
        setTotalPages(data.pagination.totalPages);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search and Add */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search units..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Link
          href="/teacher/units/new"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Unit
        </Link>
      </div>

      {/* Unit Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      ) : units.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No units found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {units.map((unit) => (
            <UnitCard key={unit.id} unit={unit} onUpdate={fetchUnits} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

