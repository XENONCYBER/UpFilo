"use client";

import { useState, useEffect } from "react";
import { FileText, ExternalLink, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TextViewerProps {
  url: string;
  fileName: string;
  className?: string;
}

export function TextViewer({ url, fileName, className = "" }: TextViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [textContent, setTextContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(false);

  useEffect(() => {
    if (isExpanded && !textContent && !loadError) {
      fetchTextContent();
    }
  }, [isExpanded]);

  const fetchTextContent = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch text file");
      }
      const text = await response.text();
      setTextContent(text);
      setLoadError(false);
    } catch (error) {
      console.error("Error loading text file:", error);
      setLoadError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const openInNewTab = () => {
    window.open(url, "_blank");
  };

  const downloadFile = () => {
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div
      className={`border border-slate-200/50 dark:border-[#30363d] rounded-lg overflow-hidden bg-white dark:bg-[#0d1117] ${className}`}
    >
      {/* Text File Header */}
      <div className="p-3 bg-slate-50 dark:bg-[#161b22] border-b border-slate-200/50 dark:border-[#30363d]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <FileText className="h-4 w-4 text-blue-500 flex-shrink-0" />
            <span className="text-sm font-medium text-slate-800 dark:text-[#e6edf3] truncate">
              {fileName}
            </span>
          </div>
          <div className="flex items-center space-x-1 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 px-2 text-xs whitespace-nowrap"
            >
              {isExpanded ? (
                <>
                  <EyeOff className="h-3 w-3 mr-1" />
                  Collapse
                </>
              ) : (
                <>
                  <Eye className="h-3 w-3 mr-1" />
                  Preview
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openInNewTab}
              className="h-6 px-2 text-xs whitespace-nowrap"
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              Open
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={downloadFile}
              className="h-6 px-2 text-xs whitespace-nowrap"
            >
              <Download className="h-3 w-3 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Text Preview */}
      {isExpanded && (
        <div className="relative">
          {isLoading ? (
            <div className="h-64 flex items-center justify-center bg-slate-100 dark:bg-[#21262d]">
              <div className="text-center">
                <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-pulse" />
                <p className="text-sm text-slate-600 dark:text-[#8d96a0]">
                  Loading text file...
                </p>
              </div>
            </div>
          ) : loadError ? (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-100 dark:bg-[#21262d]">
              <FileText className="h-12 w-12 text-slate-400 dark:text-[#8d96a0] mb-4" />
              <p className="text-slate-600 dark:text-[#8d96a0] text-center mb-4">
                Unable to load text file
              </p>
              <p className="text-xs text-slate-500 dark:text-[#6e7681] text-center mb-4">
                The file cannot be previewed. You can open it in a new tab or
                download it.
              </p>
              <div className="flex space-x-2">
                <Button onClick={openInNewTab} size="sm">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open in New Tab
                </Button>
                <Button onClick={downloadFile} variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 dark:bg-[#0d1117] max-h-96 overflow-y-auto">
              <pre className="text-sm text-slate-800 dark:text-[#e6edf3] whitespace-pre-wrap break-words font-mono">
                {textContent}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Text Preview Thumbnail (when collapsed) */}
      {!isExpanded && (
        <div
          className="h-32 bg-slate-100 dark:bg-[#21262d] flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-[#30363d] transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          <div className="text-center">
            <FileText className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-xs text-slate-600 dark:text-[#8d96a0]">
              Click to preview text file
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
