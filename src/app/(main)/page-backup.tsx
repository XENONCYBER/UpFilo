"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCreateWorkspace } from "@/features/workspaces/api/use-create-workspaces";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowRight,
  Sparkles,
  Globe,
  Users,
  Zap,
  Moon,
  Sun,
  MessageSquare,
  Shield,
  Layers,
  Play,
  ChevronRight,
  Star,
} from "lucide-react";

const MainPage = () => {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();
  const [workspaceName, setWorkspaceName] = useState("");
  const [joinWorkspaceId, setJoinWorkspaceId] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Generate URL-friendly custom ID from name
  const generateCustomId = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleJoinWorkspace = () => {
    if (!joinWorkspaceId.trim()) {
      toast.error("Please enter a workspace ID or name");
      return;
    }
    const customId = generateCustomId(joinWorkspaceId);
    router.push(`/${customId}`);
  };

  const handleCreateWorkspace = () => {
    if (!workspaceName.trim()) {
      toast.error("Please enter a workspace name");
      return;
    }

    const customId = generateCustomId(workspaceName);
    
    createWorkspace(
      { name: workspaceName, customId },
      {
        onSuccess: () => {
          toast.success("Workspace created successfully!");
          router.push(`/${customId}`);
        },
        onError: () => {
          toast.error("Failed to create workspace");
        },
      }
    );
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Real-time Collaboration",
      description: "Instant messaging with seamless file sharing and media gallery",
      gradient: "from-blue-500 to-purple-600"
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description: "End-to-end encryption with advanced permission controls",
      gradient: "from-purple-500 to-pink-600"
    },
    {
      icon: Layers,
      title: "Organized Workspaces",
      description: "Channel groups and smart organization for maximum productivity",
      gradient: "from-green-500 to-blue-600"
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Optimized performance with modern technology stack",
      gradient: "from-orange-500 to-red-600"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime" },
    { value: "< 50ms", label: "Response Time" },
    { value: "256-bit", label: "Encryption" },
    { value: "24/7", label: "Support" }
  ];

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-void text-text-high overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue/5 to-purple/5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 p-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue to-purple rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gradient">UpFilo</span>
          </div>
          
          <div className="flex items-center gap-4">
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="btn-ghost p-3 rounded-xl hover-lift"
            >
              {theme === "dark" ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 pt-12 pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {/* Hero Content */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 glass-subtle px-4 py-2 rounded-full mb-8 hover-lift">
              <Star className="w-4 h-4 text-blue" />
              <span className="text-sm font-medium">Modern collaboration platform</span>
              <ChevronRight className="w-4 h-4 text-text-secondary" />
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="text-gradient">Collaborate</span>
              <br />
              <span className="text-text-high">Without Limits</span>
            </h1>
            
            <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
              Experience the future of team communication with our glassmorphic design, 
              real-time collaboration, and intelligent workspace organization.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {stats.map((stat, index) => (
                <div key={index} className="glass-subtle p-4 rounded-xl hover-lift">
                  <div className="text-2xl font-bold text-blue mb-1">{stat.value}</div>
                  <div className="text-sm text-text-secondary">{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Action Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-16">
              {/* Create Workspace */}
              <div className="glass p-8 rounded-2xl hover-lift group">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue to-purple rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Create Workspace</h3>
                  <p className="text-text-secondary text-sm">Start fresh with a new collaborative space</p>
                </div>
                
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter workspace name..."
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    className="input w-full"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCreateWorkspace();
                      }
                    }}
                  />
                  <button
                    onClick={handleCreateWorkspace}
                    disabled={isPending || !workspaceName.trim()}
                    className="btn-primary w-full ripple disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Creating...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        Create Workspace
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {/* Join Workspace */}
              <div className="glass p-8 rounded-2xl hover-lift group">
                <div className="mb-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Join Workspace</h3>
                  <p className="text-text-secondary text-sm">Connect to an existing collaborative space</p>
                </div>
                
                <div className="space-y-4">
                  <Input
                    type="text"
                    placeholder="Enter workspace ID or name..."
                    value={joinWorkspaceId}
                    onChange={(e) => setJoinWorkspaceId(e.target.value)}
                    className="input w-full"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleJoinWorkspace();
                      }
                    }}
                  />
                  <button
                    onClick={handleJoinWorkspace}
                    disabled={!joinWorkspaceId.trim()}
                    className="btn-secondary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4" />
                      Join Workspace
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-center mb-12">
              Built for <span className="text-gradient">Modern Teams</span>
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass-subtle p-6 rounded-xl hover-lift group transition-all duration-300"
                >
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-text-secondary text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Demo Section */}
          <div className="text-center">
            <div className="glass-elevated p-8 rounded-2xl max-w-2xl mx-auto hover-lift">
              <div className="w-16 h-16 bg-gradient-to-br from-blue to-purple rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Play className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-4">See UpFilo in Action</h3>
              <p className="text-text-secondary mb-6">
                Experience the seamless workflow and beautiful design that makes collaboration effortless.
              </p>
              <button className="btn-secondary">
                <div className="flex items-center gap-2">
                  <Play className="w-4 h-4" />
                  Watch Demo
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-glass-border-2 bg-glass-1 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue to-purple rounded-lg flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-semibold">UpFilo</span>
            </div>
            <div className="text-sm text-text-secondary">
              © 2025 UpFilo. Built with modern design principles.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainPage;
      return;
    }

    createWorkspace(
      { name: workspaceName },
      {
        onSuccess: (data) => {
          if (data) {
            toast.success(`Workspace "${workspaceName}" created!`);
            router.push(`/${data.customId}`);
          }
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create workspace");
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-200/30 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute top-3/4 right-1/4 w-96 h-96 bg-purple-200/30 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        ></div>
        <div
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-200/20 dark:bg-indigo-500/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-grid-slate-100/[0.02] dark:bg-grid-slate-100/[0.02] bg-[size:75px_75px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Navigation */}
        <nav className="glass-surface flex items-center justify-between p-6 max-w-7xl mx-auto w-full backdrop-blur-xl bg-white/30 dark:bg-black/20 rounded-2xl border border-white/20 dark:border-white/10 shadow-glass m-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 liquid-gradient from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-glass">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold liquid-gradient from-blue-600 to-purple-600 bg-clip-text text-transparent">
              UpFilo
            </span>
          </div>

          <div className="flex items-center space-x-6">
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium"
              >
                Home
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#"
                className="text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors font-medium"
              >
                Pricing
              </a>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="glass-button w-10 h-10 rounded-full"
            >
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button
              variant="outline"
              className="border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700"
            >
              Get Started
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex-1 flex items-center justify-center px-6 py-20">
          <div className="max-w-5xl mx-auto text-center">
            {/* Badge */}
            <div className="glass-surface inline-flex items-center px-4 py-2 bg-white/60 dark:bg-black/30 backdrop-blur-xl rounded-full border border-white/20 dark:border-white/10 mb-8 shadow-glass">
              <Zap className="w-4 h-4 mr-2 text-yellow-500" />
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">
                Lightning-fast collaboration
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="text-slate-900 dark:text-white">
                One-click for
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Team Unity
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Dive into seamless collaboration, where innovative communication
              technology meets team productivity
            </p>

            {/* Action Cards */}
            <div className="flex flex-col lg:flex-row gap-8 max-w-4xl mx-auto mb-16">
              {/* Create Workspace */}
              <div className="flex-1 group">
                <div className="glass-card bg-white/60 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 shadow-glass hover:shadow-glass-hover transition-all duration-300 group-hover:scale-105 liquid-hover">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 liquid-gradient from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-4 shadow-glass">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Create Workspace
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter workspace name"
                      value={workspaceName}
                      onChange={(e) => setWorkspaceName(e.target.value)}
                      className="glass-input h-12"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleCreateWorkspace()
                      }
                    />
                    <Button
                      onClick={handleCreateWorkspace}
                      disabled={isPending || !workspaceName.trim()}
                      className="glass-button w-full liquid-gradient from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-12 font-medium shadow-glass hover:shadow-glass-hover"
                    >
                      {isPending ? "Creating..." : "Create & Join"}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Join Workspace */}
              <div className="flex-1 group">
                <div className="glass-card bg-white/60 dark:bg-black/30 backdrop-blur-xl border border-white/20 dark:border-white/10 rounded-2xl p-8 shadow-glass hover:shadow-glass-hover transition-all duration-300 group-hover:scale-105 liquid-hover">
                  <div className="flex items-center mb-6">
                    <div className="w-12 h-12 liquid-gradient from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-glass">
                      <Globe className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                      Join Workspace
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter workspace ID or name"
                      value={joinWorkspaceId}
                      onChange={(e) => setJoinWorkspaceId(e.target.value)}
                      className="glass-input h-12"
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleJoinWorkspace()
                      }
                    />
                    <Button
                      onClick={handleJoinWorkspace}
                      disabled={!joinWorkspaceId.trim()}
                      variant="outline"
                      className="w-full h-12 font-medium"
                    >
                      Join Workspace
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="group cursor-pointer">
                <div className="glass-card text-center p-8 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 hover:shadow-glass transition-all duration-300 group-hover:scale-105 liquid-hover">
                  <div className="w-16 h-16 liquid-gradient from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glass">
                    <MessageSquare className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                    Real-time Chat
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    Instant messaging with your team members for seamless
                    communication
                  </p>
                </div>
              </div>

              <div className="group cursor-pointer">
                <div className="glass-card text-center p-8 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 hover:shadow-glass transition-all duration-300 group-hover:scale-105 liquid-hover">
                  <div className="w-16 h-16 liquid-gradient from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glass">
                    <Layers className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                    Organized Channels
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    Structured conversations for better collaboration and
                    project management
                  </p>
                </div>
              </div>

              <div className="group cursor-pointer">
                <div className="glass-card text-center p-8 bg-white/50 dark:bg-black/20 backdrop-blur-xl rounded-2xl border border-white/20 dark:border-white/10 hover:shadow-glass transition-all duration-300 group-hover:scale-105 liquid-hover">
                  <div className="w-16 h-16 liquid-gradient from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glass">
                    <Shield className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold mb-3 text-slate-900 dark:text-white">
                    Secure Access
                  </h3>
                  <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                    Access your workspace securely from anywhere with
                    enterprise-grade protection
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;
