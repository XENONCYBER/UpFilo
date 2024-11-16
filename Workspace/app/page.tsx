"use client";

import { useState } from "react";
import Sidebar from "./components/Sidebar";
import ChannelList from "./components/ChannelList";
import MessageBox from "./components/MessageBox";
import ChatInput from "./components/ChatInput";
import DirectMessages from "./components/DirectMessages";
import MediaGallery from "./components/MediaGallery";
import Profile from "./components/Profile";
import { Menu, Sun, Moon } from "lucide-react";
import { Button } from "./components/ui/Button";
import { useTheme } from "next-themes";
import CountdownTimer from "./components/CountdownTimer";
interface Message {
  id: number;
  user: string;
  content: string;
  timestamp: string;
  file?: {
    type: string;
    url: string;
  };
}

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [channelListCollapsed, setChannelListCollapsed] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(1);
  const [messages, setMessages] = useState<{ [key: number]: Message[] }>({
    1: [
      {
        id: 1,
        user: "Alice",
        content: "Hey everyone!",
        timestamp: "2023-05-20T10:00:00Z",
      },
      {
        id: 2,
        user: "Bob",
        content: "Hi Alice, how are you?",
        timestamp: "2023-05-20T10:01:00Z",
      },
    ],
    2: [
      {
        id: 1,
        user: "Charlie",
        content: "Welcome to the random channel!",
        timestamp: "2023-05-20T10:02:00Z",
      },
    ],
    3: [],
  });
  const [activeSection, setActiveSection] = useState("channels");
  const { theme, setTheme } = useTheme();

  const handleSendMessage = (content: string, file?: File) => {
    const newMessage: Message = {
      id: messages[selectedChannel].length + 1,
      user: "You",
      content,
      timestamp: new Date().toISOString(),
    };

    if (file) {
      newMessage.file = {
        type: file.type,
        url: URL.createObjectURL(file),
      };
    }

    setMessages({
      ...messages,
      [selectedChannel]: [...messages[selectedChannel], newMessage],
    });
  };
 
  const groupExpiryTime = new Date(new Date().getTime() + 24 * 60 * 60 * 1000); // 24 hours from now

  const handleChannelSelect = (channelId: number) => {
    setSelectedChannel(channelId);
    setActiveSection("channels");
  };
  const friends = [
    { id: 1, name: "John", isOnline: true, avatarUrl: "./assets/imgs/meow.jpg" },
    { id: 2, name: "Mary", isOnline: false, avatarUrl: "./assets/imgs/meow.jpg" },
    { id: 3, name: "Mark", isOnline: true, avatarUrl: "./assets/imgs/meow.jpg" },
  ];
  

  const renderActiveSection = () => {
    switch (activeSection) {
      case "channels":
        return (
          <>
            <MessageBox messages={messages[selectedChannel]} />
            <ChatInput onSendMessage={handleSendMessage} />
          </>
        );
      case "directMessages":
        return <DirectMessages />;
      case "mediaGallery":
        return <MediaGallery />;
      case "profile":
        return <Profile />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      <Sidebar
        open={sidebarOpen}
        setOpen={setSidebarOpen}
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        handleChannelSelect={handleChannelSelect} // Pass the function
      />
      <div
        className={`flex flex-col transition-all duration-300 ${
          sidebarOpen
            ? "ml-[250px] w-[calc(100%-250px)]"
            : "ml-[50px] w-[calc(100%-50px)]"
        }`}
      >
        <header className="header-container flex items-center justify-between p-4 bg-secondary rounded-lg backdrop-blur-sm bg-opacity-75 w-[90%] mx-auto">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden mr-2"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-xl font-bold text-primary">UpFilo WorkSpace</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-6 w-6 text-primary" />
            ) : (
              <Moon className="h-6 w-6 text-primary" />
            )}
          </Button>
        </header>
        <div className="flex w-full h-full relative">
          {/* Left Vertical Column */}
          <div
  className={`bg-secondary text-primary p-6 rounded-lg mx-6 flex-shrink-0 absolute transition-all duration-300 ${
    sidebarOpen ? "transform -translate-x-[250px]" : "transform translate-x-0"
  }`}
  style={{
    width: "12%",
    marginLeft: "4.4%",
    marginBottom: "2%",
    marginTop: "2%",
    zIndex: 10, // Ensure it appears above other content when visible
  }}
>
  {/* Group Details Header */}
  <h2 className="text-lg font-semibold mb-4 flex items-center justify-between">
    <span>Group Details</span>
    <div className="text-xs font-medium text-primary opacity-70">Active Group</div>
  </h2>

  {/* Countdown Timer (Clean Design) */}
  <div className="flex items-center mb-6 space-x-3 p-4 bg-background rounded-lg shadow-md">
    <div className="text-sm font-semibold">Time Remaining</div>
    <div className="text-lg font-bold text-primary">
      <CountdownTimer expiryTime={groupExpiryTime} />
    </div>
  </div>

  {/* New Style for Friend Status (Responsive Avatars) */}
  <div className="mb-6">
    <h3 className="text-sm font-bold mb-3">Friend Status</h3>
    <div className="flex gap-4 flex-wrap">
      {friends.map((friend) => (
        <div
          key={friend.id}
          className="flex flex-col items-center justify-center text-center p-3 bg-background rounded-lg shadow-md w-[80px] h-[120px] space-y-2 hover:scale-105 transform transition-all duration-300"
        >
          <div
            className={`w-16 h-16 rounded-full bg-cover bg-center ${friend.isOnline ? "border-4 border-green-500" : "border-4 border-gray-400"}`}
            style={{ backgroundImage: `url(${friend.avatarUrl})` }}
          />
          <span className="text-sm">{friend.name}</span>
          <span className={`text-xs ${friend.isOnline ? "text-green-500" : "text-gray-500"}`}>
            {friend.isOnline ? "Online" : "Offline"}
          </span>
        </div>
      ))}
    </div>
  </div>
</div>

          {/* Main Chat Area */}
          <main
            className="flex flex-col flex-grow overflow-hidden mx-auto"
            style={{ width: "90%", maxWidth: "95%" }}
          >
            {renderActiveSection()}
          </main>
        </div>
      </div>
    </div>
  );
}
