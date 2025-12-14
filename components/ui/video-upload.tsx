"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, X, Video as VideoIcon, Play } from "lucide-react";

interface VideoUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function VideoUpload({ value, onChange, disabled }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(value);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 100MB for videos)
    if (file.size > 100 * 1024 * 1024) {
      alert("Video file size must be less than 100MB");
      return;
    }

    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "video");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setPreview(data.url);
        onChange(data.url);
      } else {
        const error = await response.json();
        alert(error.error || "Failed to upload video");
      }
    } catch (error) {
      console.error("Error uploading video:", error);
      alert("Failed to upload video");
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview("");
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-3">
      {/* Preview */}
      {preview ? (
        <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden border border-gray-300">
          <video
            src={preview}
            controls
            className="w-full h-64 object-contain bg-black"
            onError={() => {
              setPreview("");
            }}
          />
          {!disabled && (
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ) : (
        <div className="w-full h-64 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
          <div className="text-center">
            <VideoIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No video selected</p>
          </div>
        </div>
      )}

      {/* Upload Button */}
      <div className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          accept="video/mp4,video/webm,video/ogg"
          onChange={handleFileChange}
          disabled={disabled || uploading}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload Video
            </>
          )}
        </button>
        <span className="text-sm text-gray-500">
          or enter URL manually below
        </span>
      </div>

      {/* Manual URL Input */}
      <div>
        <input
          type="text"
          value={preview}
          onChange={(e) => {
            setPreview(e.target.value);
            onChange(e.target.value);
          }}
          placeholder="Or paste video URL here..."
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
      </div>

      <p className="text-xs text-gray-500">
        Supported formats: MP4, WebM, OGG. Max size: 100MB
      </p>
    </div>
  );
}

