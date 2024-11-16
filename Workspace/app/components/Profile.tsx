import React, { useState } from "react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Label } from "./ui/label";
import {
  Camera,
  Briefcase,
  Link,
  Twitter,
  Github,
  Linkedin,
  MapPin,
  Calendar,
  Mail,
  Phone,
} from "lucide-react";

export default function Profile() {
  const [activeTab, setActiveTab] = useState("personal");

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-800 to-slate-900 p-4 sm:p-6 md:p-8 rounded-3xl">
      <div className="max-w-4xl mx-auto backdrop-blur-xl bg-white/10 rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
        {/* Profile Header with Animated Gradient */}
        <div className="relative h-48 bg-gradient-to-r from-blue-600 via-blue-400 to-blue-800 animate-gradient-x">
          <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl bg-gradient-to-r from-blue-400 to-blue-600 p-1 shadow-xl">
                <img
                  src="my-app\app\assets\imgs\meow.jpg"
                  alt="Profile"
                  className="w-full h-full rounded-2xl object-cover"
                />
                <button className="absolute bottom-2 right-2 bg-blue-500 p-2 rounded-full hover:bg-blue-600 transition-all">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>
            <div className="pb-4">
              <h1 className="text-3xl font-bold text-white">John Doe</h1>
              <p className="text-blue-200">Full Stack Developer</p>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mt-20 px-8">
          <div className="flex space-x-6 border-b border-white/10">
            {["personal", "professional", "social"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 px-2 capitalize ${
                  activeTab === tab
                    ? "text-blue-400 border-b-2 border-blue-400"
                    : "text-gray-400 hover:text-blue-300"
                }`}
              >
                {tab} Info
              </button>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          {activeTab === "personal" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="username" className="text-blue-100">
                  Username
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="username"
                    defaultValue="johndoe"
                    className="w-full bg-white/5 border-white/10 text-blue-50 focus:bg-white/10 focus:border-blue-400"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email" className="text-blue-100">
                  Email
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="email"
                    type="email"
                    defaultValue="john@example.com"
                    className="w-full bg-white/5 border-white/10 text-blue-50 focus:bg-white/10 focus:border-blue-400"
                  />
                  <Mail className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="phone" className="text-blue-100">
                  Phone
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="phone"
                    type="tel"
                    defaultValue="+1 (555) 000-0000"
                    className="w-full bg-white/5 border-white/10 text-blue-50 focus:bg-white/10 focus:border-blue-400"
                  />
                  <Phone className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="dob" className="text-blue-100">
                  Date of Birth
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="dob"
                    type="date"
                    className="w-full bg-white/5 border-white/10 text-blue-50 focus:bg-white/10 focus:border-blue-400"
                  />
                  <Calendar className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="md:col-span-2">
                <Label htmlFor="bio" className="text-blue-100">
                  Bio
                </Label>
                <textarea
                  id="bio"
                  rows={4}
                  className="mt-2 w-full bg-white/5 border border-white/10 rounded-lg p-3 text-blue-50 focus:bg-white/10 focus:border-blue-400 focus:outline-none"
                  defaultValue="A passionate developer with a love for creating beautiful and functional web applications."
                />
              </div>
            </div>
          )}

          {activeTab === "professional" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="company" className="text-blue-100">
                  Company
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="company"
                    defaultValue="Tech Solutions Inc."
                    className="w-full bg-white/5 border-white/10 text-blue-50 focus:bg-white/10 focus:border-blue-400"
                  />
                  <Briefcase className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="location" className="text-blue-100">
                  Location
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="location"
                    defaultValue="San Francisco, CA"
                    className="w-full bg-white/5 border-white/10 text-blue-50 focus:bg-white/10 focus:border-blue-400"
                  />
                  <MapPin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="website" className="text-blue-100">
                  Website
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="website"
                    defaultValue="https://johndoe.dev"
                    className="w-full bg-white/5 border-white/10 text-blue-50 focus:bg-white/10 focus:border-blue-400"
                  />
                  <Link className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="skills" className="text-blue-100">
                  Skills
                </Label>
                <div className="mt-2">
                  <Input
                    id="skills"
                    defaultValue="React, Node.js, TypeScript"
                    className="w-full bg-white/5 border-white/10 text-blue-50 focus:bg-white/10 focus:border-blue-400"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "social" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="twitter" className="text-blue-100">
                  Twitter
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="twitter"
                    defaultValue="@johndoe"
                    className="w-full bg-white/5 border-white/10 text-blue-50 focus:bg-white/10 focus:border-blue-400"
                  />
                  <Twitter className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="github" className="text-blue-100">
                  GitHub
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="github"
                    defaultValue="github.com/johndoe"
                    className="w-full bg-white/5 border-white/10 text-blue-50 focus:bg-white/10 focus:border-blue-400"
                  />
                  <Github className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <Label htmlFor="linkedin" className="text-blue-100">
                  LinkedIn
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="linkedin"
                    defaultValue="linkedin.com/in/johndoe"
                    className="w-full bg-white/5 border-white/10 text-blue-50 focus:bg-white/10 focus:border-blue-400"
                  />
                  <Linkedin className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          )}

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-8 py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg">
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
