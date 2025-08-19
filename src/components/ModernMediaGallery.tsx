"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Upload, Filter, Grid3x3, List } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ModernMediaGalleryProps {
  className?: string;
}

const mockMedia = [
  {
    id: 1,
    type: "image",
    name: "Project Screenshot",
    url: "/api/placeholder/200/150",
    size: "2.4 MB",
    uploadedBy: "Alice Cooper",
    uploadedAt: "2 hours ago",
  },
  {
    id: 2,
    type: "video",
    name: "Demo Video",
    url: "/api/placeholder/200/150",
    size: "15.2 MB",
    uploadedBy: "Bob Wilson",
    uploadedAt: "1 day ago",
  },
  {
    id: 3,
    type: "document",
    name: "Requirements.pdf",
    url: "/api/placeholder/200/150",
    size: "1.8 MB",
    uploadedBy: "Charlie Brown",
    uploadedAt: "3 days ago",
  },
  {
    id: 4,
    type: "image",
    name: "Design Mockup",
    url: "/api/placeholder/200/150",
    size: "3.1 MB",
    uploadedBy: "Diana Prince",
    uploadedAt: "1 week ago",
  },
];

export function ModernMediaGallery({ className }: ModernMediaGalleryProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [filter, setFilter] = useState("all");

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
          <h2 className="text-xl font-semibold text-neomorphic-text">
            Media Gallery
          </h2>
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
            <button className="btn-primary px-3 py-1.5 text-sm">
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neomorphic-text-secondary" />
            <input
              placeholder="Search media..."
              className="w-full pl-10 pr-4 py-2 bg-neomorphic-surface border border-neomorphic-border rounded-neomorphic text-neomorphic-text placeholder:text-neomorphic-text-secondary focus:border-electric-blue focus:outline-none transition-colors"
            />
          </div>
          <button className="btn-neomorphic px-3 py-2 text-sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1">
        <div className="h-full">
          <div className="flex space-x-1 mb-4 p-1 bg-neomorphic-surface rounded-neomorphic border border-neomorphic-border">
            <button className="btn-primary px-3 py-1.5 text-sm rounded-lg">
              All Media
            </button>
            <button className="btn-neomorphic px-3 py-1.5 text-sm rounded-lg">
              Images
            </button>
            <button className="btn-neomorphic px-3 py-1.5 text-sm rounded-lg">
              Videos
            </button>
            <button className="btn-neomorphic px-3 py-1.5 text-sm rounded-lg">
              Documents
            </button>
          </div>

          <div className="h-full overflow-y-auto custom-scrollbar">
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {mockMedia.map((item) => (
                  <div
                    key={item.id}
                    className="card-neomorphic p-3 hover:shadow-neomorphic-pressed transition-all duration-200 cursor-pointer"
                  >
                    <div className="aspect-video bg-neomorphic-surface rounded-neomorphic mb-3 flex items-center justify-center border border-neomorphic-border">
                      <span className="text-neomorphic-text-secondary text-sm font-medium">
                        {item.type.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-medium text-neomorphic-text mb-1 truncate text-sm">
                      {item.name}
                    </h3>
                    <p className="text-xs text-neomorphic-text-secondary">
                      {item.size} • {item.uploadedBy}
                    </p>
                    <p className="text-xs text-neomorphic-text-secondary opacity-70">
                      {item.uploadedAt}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {mockMedia.map((item) => (
                  <div
                    key={item.id}
                    className="card-neomorphic flex items-center space-x-3 p-3 hover:shadow-neomorphic-pressed cursor-pointer transition-all duration-200"
                  >
                    <div className="w-10 h-10 bg-neomorphic-surface rounded-neomorphic flex items-center justify-center flex-shrink-0 border border-neomorphic-border">
                      <span className="text-xs text-neomorphic-text-secondary font-medium">
                        {item.type.substring(0, 3).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-neomorphic-text truncate text-sm">
                        {item.name}
                      </h3>
                      <p className="text-xs text-neomorphic-text-secondary">
                        {item.size} • {item.uploadedBy} • {item.uploadedAt}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
