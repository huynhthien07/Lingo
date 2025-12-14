"use client";

import { useState, useEffect } from "react";

interface PriceInputProps {
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

export function PriceInput({
  value,
  onChange,
  currency = "USD",
  disabled = false,
  required = false,
  className = "",
}: PriceInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  // Format number with thousand separators
  const formatNumber = (num: number): string => {
    if (isNaN(num)) return "";
    if (num === 0) return "0";
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  // Parse formatted string to number
  const parseNumber = (str: string): number => {
    const cleaned = str.replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  };

  // Update display value when prop value changes
  useEffect(() => {
    setDisplayValue(formatNumber(value));
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;

    // Allow empty input
    if (input === "") {
      setDisplayValue("");
      onChange(0);
      return;
    }

    // Remove all non-numeric characters except decimal point
    const cleaned = input.replace(/[^0-9.]/g, "");

    // Prevent multiple decimal points
    const parts = cleaned.split(".");
    let validInput = parts[0];
    if (parts.length > 1) {
      validInput += "." + parts.slice(1).join("");
    }

    // Parse to number
    const numValue = parseFloat(validInput);
    if (!isNaN(numValue)) {
      onChange(numValue);
      // Format for display
      setDisplayValue(validInput);
    }
  };

  const handleBlur = () => {
    // Format on blur
    setDisplayValue(formatNumber(value));
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Show raw number on focus for easier editing
    if (value === 0) {
      setDisplayValue("");
    } else {
      setDisplayValue(value.toString());
    }
    e.target.select();
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onFocus={handleFocus}
        disabled={disabled}
        required={required}
        placeholder="0"
        className={`w-full px-3 py-2 pr-16 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${className}`}
      />
      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm font-medium pointer-events-none">
        {currency}
      </div>
    </div>
  );
}

