"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Image,
  Video,
  Music,
  File,
  ExternalLink,
  Grid3x3,
} from "lucide-react";
import {
  useGetWorkspaceMedia,
  useGetWorkspaceMediaStats,
} from "@/features/messages/api/use-get-workspace-media";
import { useConvexWorkspaceId } from "@/hooks/use-convex-workspace-id";
import { formatFileSize } from "@/lib/upload";

interface RecentMediaWidgetProps {
  onViewAll?: () => void;
  className?: string;
}

export function RecentMediaWidget({
  onViewAll,
  className = "",
}: RecentMediaWidgetProps) {
  const workspaceId = useConvexWorkspaceId();

  // Fetch recent media (limit to 6 most recent)
  const recentMedia =
    useGetWorkspaceMedia({
      workspaceId: workspaceId || null,
      mediaType: "all",
      limit: 6,
    }) || [];

  const mediaStats = useGetWorkspaceMediaStats({
    workspaceId: workspaceId || null,
  });

  const getFileIcon = (type: string, category: string) => {
    switch (category) {
      case "images":
        return <Image className="h-3 w-3 text-blue-500 dark:text-[#58a6ff]" />;
      case "videos":
        return <Video className="h-3 w-3 text-green-500 dark:text-[#3fb950]" />;
      case "audio":
        return (
          <Music className="h-3 w-3 text-purple-500 dark:text-[#a371f7]" />
        );
      case "documents":
        if (type === "application/pdf") {
          return (
            <FileText className="h-3 w-3 text-red-500 dark:text-[#f85149]" />
          );
        }
        return <File className="h-3 w-3 text-slate-500 dark:text-[#8d96a0]" />;
      default:
        return <File className="h-3 w-3 text-slate-500 dark:text-[#8d96a0]" />;
    }
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);
    const diffInDays = diffInHours / 24;

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  };

  const openFile = (url: string) => {
    window.open(url, "_blank");
  };

  if (!recentMedia || recentMedia.length === 0) {
    return null; // Don't show widget if no media
  }

  return (
    <Card className={`card-neomorphic ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-neomorphic-text">
            Recent Media
          </CardTitle>
          {mediaStats && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onViewAll}
              className="h-6 px-2 text-xs text-neomorphic-text-secondary hover:text-neomorphic-text"
            >
              <Grid3x3 className="h-3 w-3 mr-1" />
              View All ({mediaStats.total})
            </Button>
          )}
        </div>
        {mediaStats && (
          <p className="text-xs text-neomorphic-text-secondary">
            {formatFileSize(mediaStats.totalSize)} across {mediaStats.total}{" "}
            files
          </p>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-2">
          {recentMedia.slice(0, 5).map((item: any) => (
            <div
              key={item.id}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-neomorphic-surface/50 cursor-pointer transition-colors group"
              onClick={() => openFile(item.url)}
            >
              <div className="w-8 h-8 bg-neomorphic-surface rounded-lg flex items-center justify-center flex-shrink-0 border border-neomorphic-border overflow-hidden">
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
                <p className="text-xs font-medium text-neomorphic-text truncate">
                  {item.name}
                </p>
                <p className="text-xs text-neomorphic-text-secondary">
                  {item.uploadedBy} • {formatDate(item.uploadedAt)}
                </p>
              </div>
              <ExternalLink className="h-3 w-3 text-neomorphic-text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          ))}
        </div>

        {recentMedia.length > 5 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onViewAll}
            className="w-full mt-3 h-8 text-xs text-neomorphic-text-secondary hover:text-neomorphic-text"
          >
            View {recentMedia.length - 5} more files
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
