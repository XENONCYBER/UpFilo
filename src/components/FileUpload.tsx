"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Upload,
  X,
  File,
  Image,
  Video,
  Music,
  FileText,
  AlertCircle,
} from "lucide-react";
import {
  uploadFiles,
  UploadedFile,
  UploadProgress,
  formatFileSize,
  validateFileSize,
  validateFileType,
  isImageFile,
  isVideoFile,
  isAudioFile,
} from "@/lib/upload";
import { toast } from "sonner";

interface FileUploadProps {
  onFilesUploaded?: (files: UploadedFile[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  allowedTypes?: string[];
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFilesUploaded,
  maxFiles = 10,
  maxSizeMB = 100,
  allowedTypes,
  disabled = false,
  className = "",
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: File[]) => {
    // Validate file count
    if (files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    const errors: string[] = [];

    files.forEach((file) => {
      if (!validateFileSize(file, maxSizeMB)) {
        errors.push(`${file.name}: File too large (max ${maxSizeMB}MB)`);
        return;
      }

      if (!validateFileType(file, allowedTypes)) {
        errors.push(`${file.name}: File type not allowed`);
        return;
      }

      validFiles.push(file);
    });

    // Show errors if any
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
    }

    // Upload valid files
    if (validFiles.length > 0) {
      handleUpload(validFiles);
    }
  };

  const handleUpload = async (files: File[]) => {
    setIsUploading(true);

    try {
      const uploadedFiles = await uploadFiles(files, setUploadProgress);

      toast.success(`${uploadedFiles.length} file(s) uploaded successfully`);
      onFilesUploaded?.(uploadedFiles);

      // Clear progress after success
      setTimeout(() => {
        setUploadProgress([]);
      }, 2000);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload files");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    handleFileSelect(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      handleFileSelect(files);
    }
  };

  const getFileIcon = (file: File) => {
    if (isImageFile(file.type)) return <Image className="h-4 w-4" />;
    if (isVideoFile(file.type)) return <Video className="h-4 w-4" />;
    if (isAudioFile(file.type)) return <Music className="h-4 w-4" />;
    if (file.type.includes("pdf")) return <FileText className="h-4 w-4" />;
    return <File className="h-4 w-4" />;
  };

  const getStatusColor = (status: UploadProgress["status"]) => {
    switch (status) {
      case "completed":
        return "text-green-500 dark:text-[#3fb950]";
      case "error":
        return "text-red-500 dark:text-[#f85149]";
      case "uploading":
        return "text-blue-500 dark:text-[#58a6ff]";
      default:
        return "text-slate-500 dark:text-[#8d96a0]";
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card
        className={`relative border-2 border-dashed transition-colors ${
          isDragging
            ? "border-blue-400 bg-blue-50 dark:bg-[#58a6ff]/10"
            : "border-slate-300 dark:border-[#30363d]"
        } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !disabled && fileInputRef.current?.click()}
      >
        <CardContent className="flex flex-col items-center justify-center py-8 px-4">
          <Upload
            className={`h-8 w-8 mb-2 ${isDragging ? "text-blue-500 dark:text-[#58a6ff]" : "text-slate-400 dark:text-[#8d96a0]"}`}
          />
          <p className="text-sm text-center text-slate-600 dark:text-[#8d96a0]">
            <span className="font-medium">Click to upload</span> or drag and
            drop
          </p>
          <p className="text-xs text-slate-500 dark:text-[#6e7681] mt-1">
            Max {maxFiles} files, {maxSizeMB}MB each
          </p>
        </CardContent>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          disabled={disabled}
          onChange={handleFileInputChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept={allowedTypes?.join(",") || "*"}
        />
      </Card>

      {/* Upload Progress */}
      {uploadProgress.length > 0 && (
        <div className="space-y-2">
          {uploadProgress.map((progress, index) => (
            <div
              key={index}
              className="p-3 border rounded-lg bg-slate-50 dark:bg-[#161b22] border-slate-200 dark:border-[#30363d]"
            >
              <div className="flex items-center space-x-3">
                <div className={getStatusColor(progress.status)}>
                  {progress.status === "error" ? (
                    <AlertCircle className="h-4 w-4" />
                  ) : (
                    getFileIcon(progress.file)
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {progress.file.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-[#8d96a0]">
                    {formatFileSize(progress.file.size)}
                  </p>

                  {progress.status === "uploading" && (
                    <Progress value={progress.progress} className="mt-1" />
                  )}

                  {progress.status === "error" && progress.error && (
                    <p className="text-xs text-red-500 mt-1">
                      {progress.error}
                    </p>
                  )}
                </div>

                <div className={`text-xs ${getStatusColor(progress.status)}`}>
                  {progress.status === "completed" && "✓"}
                  {progress.status === "error" && "✗"}
                  {progress.status === "uploading" && `${progress.progress}%`}
                  {progress.status === "pending" && "..."}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
