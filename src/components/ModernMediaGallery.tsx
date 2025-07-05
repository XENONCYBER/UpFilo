"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Upload, Filter, Grid3x3, List } from "lucide-react";
import { useState } from "react";

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

export function ModernMediaGallery() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const filteredMedia = mockMedia.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-foreground">
            Media Gallery
          </h2>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button>
              <Upload className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search media..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6">
        <Tabs defaultValue="all" className="h-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Media</TabsTrigger>
            <TabsTrigger value="images">Images</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="h-full">
            <ScrollArea className="h-full">
              {viewMode === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      className="bg-card rounded-lg border p-4 hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="aspect-video bg-muted rounded-lg mb-3 flex items-center justify-center">
                        <span className="text-muted-foreground text-sm">
                          {item.type.toUpperCase()}
                        </span>
                      </div>
                      <h3 className="font-medium text-foreground mb-1 truncate">
                        {item.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {item.size} • {item.uploadedBy}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.uploadedAt}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredMedia.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                    >
                      <div className="w-12 h-12 bg-muted rounded flex items-center justify-center flex-shrink-0">
                        <span className="text-xs text-muted-foreground">
                          {item.type.substring(0, 3).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {item.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {item.size} • Uploaded by {item.uploadedBy} •{" "}
                          {item.uploadedAt}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="images">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Images will be shown here</p>
            </div>
          </TabsContent>

          <TabsContent value="videos">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">Videos will be shown here</p>
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Documents will be shown here
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
