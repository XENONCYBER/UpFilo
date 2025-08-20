"use client";

import {
  Search,
  Grid3x3,
  List,
  FileText,
  Image,
  Video,
  Music,
  File,
  ExternalLink,
} from "lucide-react";
import { useState, useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  useGetWorkspaceMedia,
  useGetWorkspaceMediaStats,
} from "@/features/messages/api/use-get-workspace-media";
import { useConvexWorkspaceId } from "@/hooks/use-convex-workspace-id";
import { formatFileSize } from "@/lib/upload";

interface ModernMediaGalleryProps {
  className?: string;
}

export function ModernMediaGallery({ className }: ModernMediaGalleryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState<
    "all" | "images" | "videos" | "audio" | "documents"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");

  const workspaceId = useConvexWorkspaceId();

  // Fetch media data
  const mediaFiles =
    useGetWorkspaceMedia({
      workspaceId: workspaceId || null,
      mediaType: filter,
      limit: 100,
    }) || [];

  const mediaStats = useGetWorkspaceMediaStats({
    workspaceId: workspaceId || null,
  });

  const isLoadingMedia = !mediaFiles;

  // Filter media files based on search query
  const filteredMedia = useMemo(() => {
    if (!searchQuery.trim()) return mediaFiles;

    return mediaFiles.filter(
      (item: any) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [mediaFiles, searchQuery]);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)} hours ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getFileIcon = (type: string, category: string) => {
    switch (category) {
      case "images":
        return <Image className="h-4 w-4 text-blue-500" />;
      case "videos":
        return <Video className="h-4 w-4 text-green-500" />;
      case "audio":
        return <Music className="h-4 w-4 text-purple-500" />;
      case "documents":
        if (type === "application/pdf") {
          return <FileText className="h-4 w-4 text-red-500" />;
        }
        return <File className="h-4 w-4 text-gray-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const openFile = (url: string) => {
    window.open(url, "_blank");
  };

  if (isLoadingMedia) {
    return (
      <div
        className={cn(
          "flex flex-col h-full bg-neomorphic-surface text-neomorphic-text p-4",
          className
        )}
      >
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-2 border-neomorphic-text-secondary border-t-electric-blue rounded-full mx-auto mb-4"></div>
            <p className="text-neomorphic-text-secondary">
              Loading media files...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-neomorphic-surface text-neomorphic-text p-4",
        className
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-neomorphic-text">
              Media Gallery
            </h2>
            {mediaStats && (
              <p className="text-sm text-neomorphic-text-secondary mt-1">
                {mediaStats.total} files •{" "}
                {formatFileSize(mediaStats.totalSize)}
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("grid")}
              className={cn(
                "btn-neomorphic p-2",
                viewMode === "grid" && "btn-primary"
              )}
            >
              <Grid3x3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "btn-neomorphic p-2",
                viewMode === "list" && "btn-primary"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neomorphic-text-secondary" />
            <input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neomorphic-surface border border-neomorphic-border rounded-neomorphic text-neomorphic-text placeholder:text-neomorphic-text-secondary focus:border-electric-blue focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 p-1 bg-neomorphic-surface rounded-neomorphic border border-neomorphic-border">
          <button
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-all",
              filter === "all" ? "btn-primary" : "btn-neomorphic"
            )}
          >
            All Media {mediaStats && `(${mediaStats.total})`}
          </button>
          <button
            onClick={() => setFilter("images")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-all",
              filter === "images" ? "btn-primary" : "btn-neomorphic"
            )}
          >
            Images {mediaStats && `(${mediaStats.images})`}
          </button>
          <button
            onClick={() => setFilter("videos")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-all",
              filter === "videos" ? "btn-primary" : "btn-neomorphic"
            )}
          >
            Videos {mediaStats && `(${mediaStats.videos})`}
          </button>
          <button
            onClick={() => setFilter("audio")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-all",
              filter === "audio" ? "btn-primary" : "btn-neomorphic"
            )}
          >
            Audio {mediaStats && `(${mediaStats.audio})`}
          </button>
          <button
            onClick={() => setFilter("documents")}
            className={cn(
              "px-3 py-1.5 text-sm rounded-lg transition-all",
              filter === "documents" ? "btn-primary" : "btn-neomorphic"
            )}
          >
            Documents {mediaStats && `(${mediaStats.documents})`}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filteredMedia.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="neomorphic-raised w-16 h-16 rounded-neomorphic flex items-center justify-center mx-auto mb-4">
              <File className="h-8 w-8 text-neomorphic-text-secondary" />
            </div>
            <h3 className="text-lg font-semibold text-neomorphic-text mb-2">
              No media files found
            </h3>
            <p className="text-neomorphic-text-secondary max-w-md">
              {searchQuery
                ? "No files match your search criteria."
                : "Start uploading images, videos, audio, or documents in your channels to see them here."}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pb-4">
            {filteredMedia.map((item: any) => (
              <div
                key={item.id}
                className="card-neomorphic p-3 hover:shadow-neomorphic-pressed transition-all duration-200 cursor-pointer"
                onClick={() => openFile(item.url)}
              >
                <div className="aspect-video bg-neomorphic-surface rounded-neomorphic mb-3 flex items-center justify-center border border-neomorphic-border relative overflow-hidden">
                  {item.category === "images" ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      {getFileIcon(item.type, item.category)}
                      <span className="text-neomorphic-text-secondary text-xs font-medium text-center">
                        {item.category.toUpperCase()}
                      </span>
                    </div>
                  )}
                  <div className="hidden flex-col items-center space-y-2">
                    {getFileIcon(item.type, item.category)}
                    <span className="text-neomorphic-text-secondary text-xs font-medium">
                      {item.category.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2">
                    <ExternalLink className="h-3 w-3 text-neomorphic-text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <h3 className="font-medium text-neomorphic-text mb-1 truncate text-sm">
                  {item.name}
                </h3>
                <p className="text-xs text-neomorphic-text-secondary">
                  {formatFileSize(item.size || 0)} • {item.uploadedBy}
                </p>
                <p className="text-xs text-neomorphic-text-secondary opacity-70">
                  {formatDate(item.uploadedAt)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 pb-4">
            {filteredMedia.map((item: any) => (
              <div
                key={item.id}
                className="card-neomorphic flex items-center space-x-3 p-3 hover:shadow-neomorphic-pressed cursor-pointer transition-all duration-200 group"
                onClick={() => openFile(item.url)}
              >
                <div className="w-12 h-12 bg-neomorphic-surface rounded-neomorphic flex items-center justify-center flex-shrink-0 border border-neomorphic-border overflow-hidden">
                  {item.category === "images" ? (
                    <img
                      src={item.url}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : (
                    getFileIcon(item.type, item.category)
                  )}
                  <div className="hidden">
                    {getFileIcon(item.type, item.category)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-neomorphic-text truncate text-sm">
                    {item.name}
                  </h3>
                  <p className="text-xs text-neomorphic-text-secondary">
                    {formatFileSize(item.size || 0)} • {item.uploadedBy} •{" "}
                    {formatDate(item.uploadedAt)}
                  </p>
                </div>
                <ExternalLink className="h-4 w-4 text-neomorphic-text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
