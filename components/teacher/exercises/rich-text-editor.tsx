"use client";

import { useRef, useEffect } from "react";
import { Bold, Italic, Underline, Highlighter, Type } from "lucide-react";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function RichTextEditor({ value, onChange }: RichTextEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    editorRef.current?.focus();
    handleInput();
  };

  const applyHighlight = () => {
    execCommand("backColor", "#fef08a"); // yellow-200
  };

  const applyTextColor = (color: string) => {
    execCommand("foreColor", color);
  };

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="bg-gray-50 border-b border-gray-300 p-2 flex items-center gap-1 flex-wrap">
        <button
          type="button"
          onClick={() => execCommand("bold")}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Bold (Ctrl+B)"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("italic")}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Italic (Ctrl+I)"
        >
          <Italic className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => execCommand("underline")}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Underline (Ctrl+U)"
        >
          <Underline className="w-4 h-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <button
          type="button"
          onClick={applyHighlight}
          className="p-2 hover:bg-gray-200 rounded transition-colors"
          title="Highlight"
        >
          <Highlighter className="w-4 h-4" />
        </button>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Text Color Picker */}
        <div className="flex items-center gap-1">
          <Type className="w-4 h-4 text-gray-600" />
          <button
            type="button"
            onClick={() => applyTextColor("#000000")}
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: "#000000" }}
            title="Black"
          />
          <button
            type="button"
            onClick={() => applyTextColor("#dc2626")}
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: "#dc2626" }}
            title="Red"
          />
          <button
            type="button"
            onClick={() => applyTextColor("#2563eb")}
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: "#2563eb" }}
            title="Blue"
          />
          <button
            type="button"
            onClick={() => applyTextColor("#16a34a")}
            className="w-6 h-6 rounded border border-gray-300"
            style={{ backgroundColor: "#16a34a" }}
            title="Green"
          />
        </div>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Font Size */}
        <select
          onChange={(e) => execCommand("fontSize", e.target.value)}
          className="px-2 py-1 text-sm border border-gray-300 rounded"
          defaultValue="3"
        >
          <option value="1">Small</option>
          <option value="3">Normal</option>
          <option value="5">Large</option>
          <option value="7">Huge</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <button
          type="button"
          onClick={() => execCommand("removeFormat")}
          className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded transition-colors"
          title="Clear Formatting"
        >
          Clear
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        onInput={handleInput}
        className="min-h-[150px] p-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
        style={{ whiteSpace: "pre-wrap" }}
      />
    </div>
  );
}

