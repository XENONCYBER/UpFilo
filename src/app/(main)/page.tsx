import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ArrowRight,
  CloudDownloadIcon,
  Download,
  LinkIcon,
  Shield,
  Upload,
} from "lucide-react";
import Link from "next/link";

const MainPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 px-4 py-6">
      <div className="mx-auto max-w-6xl text-center">
        <p className="mb-6 inline-block rounded-2xl bg-[#409bff]/70 px-4 py-2 text-sm font-medium uppercase tracking-wider text-white">
          OUR PRODUCTS
        </p>

        <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          Share files easily with people{" "}
          <span className="whitespace-nowrap">
            <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              UpFilo
            </span>
            <span className="align-super text-sm text-gray-800">™</span>
          </span>
          .
        </h1>

        <p className="mx-auto mb-12 max-w-3xl text-lg text-gray-600 sm:text-xl">
          Collaborate, manage projects, and reach new productivity peaks. From
          high rises to the home office, the way your team works is unique -
          accomplish it all with UpFilo.
        </p>

        <button className="mb-20 rounded-full bg-blue-600 px-8 py-4 text-lg font-medium text-white transition-colors hover:bg-blue-700">
          → Start sharing
        </button>
      </div>
    </div>
  );
};

export default MainPage;
