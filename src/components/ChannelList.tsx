"use client";

import { useState } from "react";
import {
  Hash,
  Volume2,
  Plus,
  ChevronDown,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface Channel {
  id: number;
  name: string;
  type: "text" | "voice";
}

export default function ChannelList({
  onChannelSelect,
  collapsed,
  setCollapsed,
}: {
  onChannelSelect: (channelId: number) => void;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}) {
  const [channels, setChannels] = useState<Channel[]>([
    { id: 1, name: "general", type: "text" },
    { id: 2, name: "random", type: "text" },
    { id: 3, name: "Voice Chat", type: "voice" },
  ]);
  const [newChannelName, setNewChannelName] = useState("");
  const [newChannelType, setNewChannelType] = useState<"text" | "voice">(
    "text"
  );

  const addChannel = () => {
    if (newChannelName.trim()) {
      const newChannel: Channel = {
        id: Date.now(), // Unique ID
        name: newChannelName.trim(),
        type: newChannelType,
      };
      setChannels((prev) => [...prev, newChannel]);
      setNewChannelName("");
    }
  };

  const deleteChannel = (id: number) => {
    setChannels((prev) => prev.filter((channel) => channel.id !== id));
  };

  return (
    <div
      className={`discord-channel-list transition-all duration-300 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${collapsed ? "hidden" : ""}`}>
            Groups
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight /> : <ChevronDown />}
          </Button>
        </div>
        {!collapsed && (
          <>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full mb-4">
                  <Plus className="mr-2 h-4 w-4" /> Join Group
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enter Group Code to join</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newChannelName}
                      onChange={(e) => setNewChannelName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <div className="flex items-center space-x-2 col-span-3">
                      <Switch
                        id="type"
                        checked={newChannelType === "voice"}
                        onCheckedChange={(checked: boolean) =>
                          setNewChannelType(checked ? "voice" : "text")
                        }
                      />
                      <Label htmlFor="type">
                        {newChannelType === "voice" ? "Voice" : "Text"}
                      </Label>
                    </div>
                  </div>
                </div>
                <Button onClick={addChannel}>Submit</Button>
              </DialogContent>
            </Dialog>
            <ul className="space-y-2">
              {channels.map((channel) => (
                <li
                  key={channel.id}
                  className="flex items-center justify-between"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-start transition-colors duration-200 hover:bg-accent-foreground/10 discord-button"
                    onClick={() => {
                      console.log(`Selected channel ID: ${channel.id}`);
                      onChannelSelect(channel.id);
                    }}
                  >
                    {channel.type === "text" ? (
                      <Hash className="mr-2 h-4 w-4" />
                    ) : (
                      <Volume2 className="mr-2 h-4 w-4" />
                    )}
                    {channel.name}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteChannel(channel.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
