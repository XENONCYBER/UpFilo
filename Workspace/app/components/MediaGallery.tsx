import { useState } from "react";
import Image from "next/image";
import { ScrollArea } from "./ui/ScrollArea";
import {
  Search,
  Calendar,
  Grid,
  List,
  PlayCircle,
  FileText,
  Image as ImageIcon,
  Music,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";

interface MediaItem {
  id: number;
  type: "image" | "video" | "audio" | "document";
  url: string;
  name: string;
  date: string;
  size: string;
  sender: string;
}

export default function MediaGallery() {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchTerm, setSearchTerm] = useState("");

  // Expanded sample data
  const [mediaItems] = useState<MediaItem[]>([
    {
      id: 1,
      type: "image",
      url: "/placeholder.svg?height=400&width=600",
      name: "Team Meeting Screenshot",
      date: "2024-03-15",
      size: "2.4 MB",
      sender: "Alice",
    },
    {
      id: 2,
      type: "video",
      url: "#",
      name: "Project Demo.mp4",
      date: "2024-03-14",
      size: "15.8 MB",
      sender: "Bob",
    },
    {
      id: 3,
      type: "audio",
      url: "#",
      name: "Voice Meeting Recording.mp3",
      date: "2024-03-13",
      size: "5.2 MB",
      sender: "Charlie",
    },
    {
      id: 4,
      type: "document",
      url: "#",
      name: "Q1 Report.pdf",
      date: "2024-03-12",
      size: "1.8 MB",
      sender: "David",
    },
    // Add more sample items as needed
  ]);

  const renderMediaItem = (item: MediaItem) => {
    switch (item.type) {
      case "image":
        return (
          <div className="group relative">
            <Image
              src={item.url}
              alt={item.name}
              width={300}
              height={200}
              className="w-full h-48 object-cover rounded-lg shadow-md transition-transform group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex flex-col justify-end p-4">
              <p className="text-white font-medium truncate">{item.name}</p>
              <p className="text-white/80 text-sm">Shared by {item.sender}</p>
            </div>
          </div>
        );
      case "video":
        return (
          <div className="relative group h-48 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg shadow-md overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <PlayCircle className="w-12 h-12 text-white/90 group-hover:scale-110 transition-transform" />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-black/60 p-4">
              <p className="text-white font-medium truncate">{item.name}</p>
              <p className="text-white/80 text-sm">{item.size}</p>
            </div>
          </div>
        );
      case "audio":
        return (
          <div className="h-48 bg-gradient-to-r from-green-400 to-teal-500 rounded-lg shadow-md p-4 flex flex-col justify-between group hover:shadow-lg transition-shadow">
            <Music className="w-8 h-8 text-white/90" />
            <div>
              <p className="text-white font-medium truncate">{item.name}</p>
              <p className="text-white/80 text-sm">{item.date}</p>
              <p className="text-white/80 text-sm">Duration: 45:32</p>
            </div>
          </div>
        );
      case "document":
        return (
          <div className="h-48 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg shadow-md p-4 flex flex-col justify-between group hover:shadow-lg transition-shadow">
            <FileText className="w-8 h-8 text-white/90" />
            <div>
              <p className="text-white font-medium truncate">{item.name}</p>
              <p className="text-white/80 text-sm">Size: {item.size}</p>
              <p className="text-white/80 text-sm">Shared by {item.sender}</p>
            </div>
          </div>
        );
    }
  };

  const tabs = [
    { value: "all", label: "All", icon: Grid },
    { value: "images", label: "Images", icon: ImageIcon },
    { value: "videos", label: "Videos", icon: PlayCircle },
    { value: "audio", label: "Audio", icon: Music },
    { value: "documents", label: "Documents", icon: FileText },
  ];

  const filteredItems = mediaItems
    .filter((item) =>
      activeTab === "all" ? true : item.type === activeTab.slice(0, -1)
    )
    .filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sender.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const sortedItems = [...filteredItems].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="w-full h-full flex flex-col bg-background rounded-3xl">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Media Gallery</h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("grid")}
              className={viewMode === "grid" ? "bg-accent" : ""}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setViewMode("list")}
              className={viewMode === "list" ? "bg-accent" : ""}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search files and media..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline" size="icon">
            <Calendar className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex space-x-1 border-b p-1">
        {tabs.map((tab) => (
          <Button
            key={tab.value}
            variant={activeTab === tab.value ? "secondary" : "ghost"}
            className="flex items-center gap-2"
            onClick={() => setActiveTab(tab.value)}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-grow">
        <div
          className={`p-4 ${
            viewMode === "grid"
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }`}
        >
          {sortedItems.length > 0 ? (
            sortedItems.map((item) => (
              <div
                key={item.id}
                className={
                  viewMode === "list"
                    ? "bg-card rounded-lg p-4 flex items-center gap-4"
                    : ""
                }
              >
                {viewMode === "list" ? (
                  <>
                    <div className="w-16 h-16 flex items-center justify-center rounded bg-accent">
                      {item.type === "image" && (
                        <ImageIcon className="h-8 w-8" />
                      )}
                      {item.type === "video" && (
                        <PlayCircle className="h-8 w-8" />
                      )}
                      {item.type === "audio" && <Music className="h-8 w-8" />}
                      {item.type === "document" && (
                        <FileText className="h-8 w-8" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.size} • {new Date(item.date).toLocaleDateString()}{" "}
                        • Shared by {item.sender}
                      </p>
                    </div>
                  </>
                ) : (
                  renderMediaItem(item)
                )}
              </div>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center text-muted-foreground p-8">
              <Search className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No media found</p>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
