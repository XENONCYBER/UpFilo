"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCreateWorkspace } from "@/features/workspaces/api/use-create-workspaces";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageSquare,
  Users,
  Zap,
  Shield,
  Sparkles,
  ArrowRight,
  Play,
  Star,
  Globe,
  Heart,
  Layers,
  Mic,
  Video,
  FileText,
  Moon,
  Sun,
} from "lucide-react";
import { useTheme } from "next-themes";

export default function ModernLandingPage() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { mutate: createWorkspace, isPending } = useCreateWorkspace();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [workspaceName, setWorkspaceName] = useState("");
  const [joinWorkspaceId, setJoinWorkspaceId] = useState("");

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
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
      {
        name: workspaceName,
      },
      {
        onSuccess: (workspaceId) => {
          toast.success("Workspace created successfully!");
          router.push(`/${customId}`);
        },
        onError: (error) => {
          console.error("Error creating workspace:", error);
          toast.error("Failed to create workspace. Please try again.");
        },
      }
    );
  };

  const features = [
    {
      icon: MessageSquare,
      title: "Real-time Communication",
      description:
        "Connect instantly with your team through channels, direct messages, and voice calls.",
      color: "electric-blue",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description:
        "Organize your workspace with teams, roles, and permissions that scale with you.",
      color: "electric-purple",
    },
    {
      icon: Zap,
      title: "Lightning Fast",
      description:
        "Experience instant loading and real-time updates across all your devices.",
      color: "soft-green",
    },
    {
      icon: Shield,
      title: "Enterprise Security",
      description:
        "Bank-grade encryption and compliance with SOC 2, GDPR, and HIPAA standards.",
      color: "warm-orange",
    },
  ];

  const stats = [
    { number: "10M+", label: "Active Users", icon: Users },
    { number: "500K+", label: "Workspaces", icon: Globe },
    { number: "99.9%", label: "Uptime", icon: Zap },
    { number: "4.9/5", label: "User Rating", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-neomorphic-bg overflow-x-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div
          className="absolute w-96 h-96 rounded-full opacity-20 animate-float"
          style={{
            background:
              "radial-gradient(circle, var(--electric-blue) 0%, transparent 70%)",
            left: `${mousePosition.x * 0.02}px`,
            top: `${mousePosition.y * 0.02}px`,
          }}
        />
        <div
          className="absolute w-80 h-80 rounded-full opacity-15 animate-float"
          style={{
            background:
              "radial-gradient(circle, var(--electric-purple) 0%, transparent 70%)",
            right: `${mousePosition.x * -0.01}px`,
            bottom: `${mousePosition.y * -0.01}px`,
            animationDelay: "2s",
          }}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="neomorphic-raised p-3 rounded-neomorphic">
              <Layers className="w-8 h-8 text-electric-blue" />
            </div>
            <span className="text-2xl font-bold text-neomorphic-text">
              UpFilo
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            <a
              href="#features"
              className="text-neomorphic-text-secondary hover:text-electric-blue transition-colors"
            >
              Features
            </a>
            <a
              href="#demo"
              className="text-neomorphic-text-secondary hover:text-electric-blue transition-colors"
            >
              Demo
            </a>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="btn-glass interactive-lift p-2"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center gap-2 bg-electric-blue/10 border border-electric-blue/20 rounded-full px-4 py-2 mb-6">
              <Sparkles className="w-4 h-4 text-electric-blue" />
              <span className="text-sm font-medium text-electric-blue">
                New: Neumorphic Design System
              </span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-neomorphic-text mb-6 leading-tight">
              Work Better
              <span className="block gradient-primary bg-clip-text text-transparent">
                Together
              </span>
            </h1>

            <p className="text-xl text-neomorphic-text-secondary max-w-2xl mx-auto mb-8 leading-relaxed">
              The modern workspace that brings your team together. Chat,
              collaborate, and create in a beautiful environment designed for
              productivity.
            </p>
          </div>

          {/* Workspace Creation Cards */}
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto mb-12">
            {/* Create Workspace */}
            <div className="card-glass p-6 morph-hover">
              <h3 className="text-lg font-semibold text-neomorphic-text mb-4">
                Create New Workspace
              </h3>
              <div className="space-y-4">
                <Input
                  placeholder="Enter workspace name..."
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="input-neomorphic"
                  disabled={isPending}
                />
                <Button
                  onClick={handleCreateWorkspace}
                  disabled={isPending || !workspaceName.trim()}
                  className="w-full btn-primary interactive-lift"
                >
                  {isPending ? (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 animate-spin" />
                      Creating...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Create Workspace
                    </div>
                  )}
                </Button>
              </div>
            </div>

            {/* Join Workspace */}
            <div className="card-glass p-6 morph-hover">
              <h3 className="text-lg font-semibold text-neomorphic-text mb-4">
                Join Existing Workspace
              </h3>
              <div className="space-y-4">
                <Input
                  placeholder="Enter workspace ID..."
                  value={joinWorkspaceId}
                  onChange={(e) => setJoinWorkspaceId(e.target.value)}
                  className="input-neomorphic"
                />
                <Button
                  onClick={handleJoinWorkspace}
                  disabled={!joinWorkspaceId.trim()}
                  className="w-full btn-neomorphic interactive-lift"
                >
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-4 h-4" />
                    Join Workspace
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 py-16">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="card-neomorphic text-center morph-hover"
                >
                  <Icon className="w-8 h-8 text-electric-blue mx-auto mb-3" />
                  <div className="text-3xl font-bold text-neomorphic-text mb-1">
                    {stat.number}
                  </div>
                  <div className="text-sm text-neomorphic-text-secondary">
                    {stat.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neomorphic-text mb-4">
              Everything you need to collaborate
            </h2>
            <p className="text-xl text-neomorphic-text-secondary max-w-2xl mx-auto">
              Powerful features designed to help your team stay connected,
              productive, and engaged.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="card-glass glass-hover p-6 group">
                  <div className="neomorphic-raised w-14 h-14 rounded-neomorphic flex items-center justify-center mb-4 group-hover:shadow-neomorphic-pressed transition-all duration-300">
                    <Icon className={`w-6 h-6 text-${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-neomorphic-text mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-neomorphic-text-secondary text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section id="demo" className="relative z-10 px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <div className="card-glass p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold text-neomorphic-text mb-4">
              See UpFilo in Action
            </h2>
            <p className="text-neomorphic-text-secondary mb-8 max-w-2xl mx-auto">
              Experience the future of team collaboration with our interactive
              demo. No signup required.
            </p>

            {/* Mock Interface */}
            <div className="card-neomorphic p-6 max-w-3xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <div className="neomorphic-pressed w-12 h-12 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-electric-blue" />
                </div>
                <div>
                  <div className="text-left">
                    <div className="font-semibold text-neomorphic-text">
                      Design Team
                    </div>
                    <div className="text-sm text-neomorphic-text-secondary">
                      12 members online
                    </div>
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <button className="btn-neomorphic p-2">
                    <Mic className="w-4 h-4" />
                  </button>
                  <button className="btn-neomorphic p-2">
                    <Video className="w-4 h-4" />
                  </button>
                  <button className="btn-neomorphic p-2">
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="message-bubble-neomorphic text-left">
                  <div className="font-medium text-neomorphic-text mb-1">
                    Sarah Chen
                  </div>
                  <div className="text-neomorphic-text-secondary">
                    The new design mockups look amazing! 🎨
                  </div>
                </div>
                <div className="message-bubble-neomorphic text-left">
                  <div className="font-medium text-neomorphic-text mb-1">
                    Alex Rivera
                  </div>
                  <div className="text-neomorphic-text-secondary">
                    Thanks! Ready for the client presentation tomorrow?
                  </div>
                </div>
                <div className="input-neomorphic">
                  <span className="text-neomorphic-text-secondary">
                    Type your message...
                  </span>
                </div>
              </div>
            </div>

            <button className="btn-primary mt-8 interactive-lift px-8 py-4">
              Try Demo Now
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-16 border-t border-neomorphic-border">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center gap-3 mb-6 md:mb-0">
              <div className="neomorphic-raised p-2 rounded-neomorphic">
                <Layers className="w-6 h-6 text-electric-blue" />
              </div>
              <span className="text-xl font-bold text-neomorphic-text">
                UpFilo
              </span>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-neomorphic-text-secondary">Made with</span>
              <Heart className="w-4 h-4 text-coral-red" />
              <span className="text-neomorphic-text-secondary">
                for modern teams
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
