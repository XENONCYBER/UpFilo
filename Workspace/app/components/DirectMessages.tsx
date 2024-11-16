import React, { useState } from 'react';
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { ScrollArea } from "./ui/ScrollArea";
import { Smile, Paperclip, Image, Send, Search, MoreVertical, Phone, Video, User, Check, Clock } from 'lucide-react';

interface Message {
  id: number;
  sender: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  isMine: boolean;
}

interface ChatContact {
  id: number;
  name: string;
  avatar: string;
  status: 'online' | 'offline';
  lastSeen?: string;
  unreadCount?: number;
  lastMessage: string;
}

export default function DirectMessages() {
  const [contacts] = useState<ChatContact[]>([
    { 
      id: 1, 
      name: "Alice Cooper", 
      avatar: "/api/placeholder/40/40",
      status: 'online',
      lastMessage: "Hey, how are you?",
      unreadCount: 3
    },
    { 
      id: 2, 
      name: "Bob Wilson", 
      avatar: "/api/placeholder/40/40",
      status: 'offline',
      lastSeen: '2h ago',
      lastMessage: "Did you see the latest update?"
    },
    { 
      id: 3, 
      name: "Charlie Brown", 
      avatar: "/api/placeholder/40/40",
      status: 'online',
      lastMessage: "Let's catch up soon!"
    },
  ]);

  const [messages] = useState<Message[]>([
    {
      id: 1,
      sender: "Alice Cooper",
      content: "Hey, how are you?",
      timestamp: "10:30 AM",
      status: 'read',
      isMine: false
    },
    {
      id: 2,
      sender: "Me",
      content: "I'm good! Just working on some new features.",
      timestamp: "10:32 AM",
      status: 'read',
      isMine: true
    },
    {
      id: 3,
      sender: "Alice Cooper",
      content: "That sounds interesting! Can you share some details?",
      timestamp: "10:33 AM",
      status: 'read',
      isMine: false
    },
  ]);

  const [selectedContact, setSelectedContact] = useState<ChatContact>(contacts[0]);
  const [newMessage, setNewMessage] = useState('');

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 max-h-[90%] rounded-3xl" >
      {/* Contacts Sidebar */}
      <div className="w-80 border-r border-white/10 backdrop-blur-md bg-white/5 rounded-3xl">
        <div className="p-4">
          <div className="relative ">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-blue-300" />
            <Input 
              placeholder="Search messages..." 
              className="pl-10 bg-white/5 border-white/10 text-blue-100 placeholder:text-blue-300/50 focus:bg-white/10 focus:border-blue-400"
            />
          </div>
        </div>
        
        <ScrollArea className="h-[calc(100vh-5rem)]">
          <div className="space-y-2 p-2">
            {contacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => setSelectedContact(contact)}
                className={`w-full p-3 rounded-lg transition-all duration-200 ${
                  selectedContact.id === contact.id 
                    ? 'bg-white/10 backdrop-blur-lg' 
                    : 'hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <img
                      src={contact.avatar}
                      alt={contact.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <span 
                      className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-950 ${
                        contact.status === 'online' ? 'bg-green-500' : 'bg-gray-500'
                      }`}
                    />
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-blue-100">{contact.name}</span>
                      <span className="text-xs text-blue-300">
                        {contact.lastSeen || 'Now'}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-blue-300 truncate">
                        {contact.lastMessage}
                      </span>
                      {contact.unreadCount && (
                        <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                          {contact.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col backdrop-blur-md bg-white/5">
        {/* Chat Header */}
        <div className="p-4 border-b border-white/10 backdrop-blur-md bg-white/5">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <img
                src={selectedContact.avatar}
                alt={selectedContact.name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <h2 className="font-semibold text-blue-100">{selectedContact.name}</h2>
                <span className="text-sm text-blue-300">
                  {selectedContact.status === 'online' ? 'Online' : selectedContact.lastSeen}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="icon" className="text-blue-300 hover:text-blue-100 hover:bg-white/10">
                <Phone className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-blue-300 hover:text-blue-100 hover:bg-white/10">
                <Video className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-blue-300 hover:text-blue-100 hover:bg-white/10">
                <User className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-blue-300 hover:text-blue-100 hover:bg-white/10">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-2xl p-4 ${
                    message.isMine
                      ? 'bg-blue-600 text-white'
                      : 'bg-white/10 text-blue-100'
                  }`}
                >
                  <p>{message.content}</p>
                  <div className={`flex items-center space-x-2 mt-1 text-xs ${
                    message.isMine ? 'text-blue-200' : 'text-blue-300'
                  }`}>
                    <span>{message.timestamp}</span>
                    {message.isMine && (
                      message.status === 'read' 
                        ? <Check className="h-4 w-4" /> 
                        : <Clock className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-white/10 backdrop-blur-md bg-white/5">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="text-blue-300 hover:text-blue-100 hover:bg-white/10">
              <Paperclip className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="text-blue-300 hover:text-blue-100 hover:bg-white/10">
              <Image className="h-5 w-5" />
            </Button>
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white/5 border-white/10 text-blue-100 placeholder:text-blue-300/50 focus:bg-white/10 focus:border-blue-400"
            />
            <Button variant="ghost" size="icon" className="text-blue-300 hover:text-blue-100 hover:bg-white/10">
              <Smile className="h-5 w-5" />
            </Button>
            <Button 
              className="bg-blue-600 text-white hover:bg-blue-700"
              size="icon"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}