"use client";

import { useState, useEffect } from "react";
import { Loader2, GripVertical, ArrowUp, ArrowDown, Edit, Trash2, Eye } from "lucide-react";
import Link from "next/link";

interface Unit {
  id: number;
  title: string;
  description: string;
  order: number;
  lessonCount: number;
}

interface CourseUnitListProps {
  courseId: number;
  refreshKey: number;
}

export function CourseUnitList({ courseId, refreshKey }: CourseUnitListProps) {
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUnits();
  }, [courseId, refreshKey]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/teacher/units?courseId=${courseId}&limit=100`);
      const data = await response.json();

      if (data.success) {
        setUnits(data.data);
      }
    } catch (error) {
      console.error("Error fetching units:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMoveUp = async (unit: Unit, index: number) => {
    if (index === 0) return;

    const newUnits = [...units];
    const temp = newUnits[index - 1];
    newUnits[index - 1] = newUnits[index];
    newUnits[index] = temp;

    // Update order in UI immediately
    setUnits(newUnits);

    // Update order in backend
    try {
      await Promise.all([
        fetch(`/api/teacher/units/${newUnits[index - 1].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index }),
        }),
        fetch(`/api/teacher/units/${newUnits[index].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index + 1 }),
        }),
      ]);
    } catch (error) {
      console.error("Error updating order:", error);
      fetchUnits(); // Reload on error
    }
  };

  const handleMoveDown = async (unit: Unit, index: number) => {
    if (index === units.length - 1) return;

    const newUnits = [...units];
    const temp = newUnits[index + 1];
    newUnits[index + 1] = newUnits[index];
    newUnits[index] = temp;

    // Update order in UI immediately
    setUnits(newUnits);

    // Update order in backend
    try {
      await Promise.all([
        fetch(`/api/teacher/units/${newUnits[index].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index + 1 }),
        }),
        fetch(`/api/teacher/units/${newUnits[index + 1].id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: index + 2 }),
        }),
      ]);
    } catch (error) {
      console.error("Error updating order:", error);
      fetchUnits(); // Reload on error
    }
  };

  const handleDelete = async (unit: Unit) => {
    if (!confirm(`Are you sure you want to delete "${unit.title}"?`)) {
      return;
    }

    try {
      const response = await fetch(`/api/teacher/units/${unit.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUnits();
      } else {
        alert("Failed to delete unit");
      }
    } catch (error) {
      console.error("Error deleting unit:", error);
      alert("Failed to delete unit");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (units.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No units yet. Click "Add Unit" to create one.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {units.map((unit, index) => (
        <div
          key={unit.id}
          className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                  #{unit.order}
                </span>
                <h4 className="font-semibold text-gray-900 line-clamp-1">{unit.title}</h4>
              </div>
              <p className="text-sm text-gray-600 line-clamp-2">{unit.description}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="text-sm text-gray-600 mb-3">
            {unit.lessonCount} lesson{unit.lessonCount !== 1 ? "s" : ""}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Link
              href={`/teacher/units/${unit.id}`}
              className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-sm"
            >
              <Eye className="w-4 h-4" />
              View
            </Link>
            <button
              onClick={() => handleMoveUp(unit, index)}
              disabled={index === 0}
              className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-30"
              title="Move up"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleMoveDown(unit, index)}
              disabled={index === units.length - 1}
              className="p-1.5 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors disabled:opacity-30"
              title="Move down"
            >
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDelete(unit)}
              className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

