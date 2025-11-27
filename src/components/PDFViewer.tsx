"use client";

import { useState } from "react";
import { FileText, ExternalLink, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PDFViewerProps {
  url: string;
  fileName: string;
  className?: string;
}

export function PDFViewer({ url, fileName, className = "" }: PDFViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const handleIframeError = () => {
    setLoadError(true);
  };

  // Create a blob URL for better PDF handling
  const createPDFViewerUrl = (pdfUrl: string) => {
    // If it's a Backblaze B2 URL, use our streaming endpoint for better headers
    if (
      pdfUrl.includes("backblazeb2.com") ||
      pdfUrl.includes("b2-api.backblaze.com")
    ) {
      // Extract filename from the URL
      const urlParts = pdfUrl.split("/");
      const filename = urlParts[urlParts.length - 1];
      return `/api/stream/${encodeURIComponent(filename)}`;
    }

    // Try to append viewer parameters for inline viewing
    const viewerParams =
      "#view=FitH&toolbar=1&navpanes=1&scrollbar=1&page=1&zoom=100";

    // If it's a Convex file URL, ensure it has the right parameters
    if (pdfUrl.includes("convex")) {
      return `${pdfUrl}${viewerParams}`;
    }

    // For other URLs, add inline parameter if possible
    const separator = pdfUrl.includes("?") ? "&" : "?";
    return `${pdfUrl}${separator}inline=true${viewerParams}`;
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
      {/* PDF Header */}
      <div className="p-3 bg-slate-50 dark:bg-[#161b22] border-b border-slate-200/50 dark:border-[#30363d]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <FileText className="h-4 w-4 text-red-500 flex-shrink-0" />
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

      {/* PDF Preview */}
      {isExpanded && (
        <div className="relative">
          {!loadError ? (
            <iframe
              src={createPDFViewerUrl(url)}
              className="w-full h-64 md:h-80 lg:h-96 border-none"
              title={fileName}
              onError={handleIframeError}
              onLoad={(e) => {
                // Check if iframe loaded successfully
                try {
                  const iframe = e.target as HTMLIFrameElement;
                  // If the iframe redirects to download, show error state
                  if (iframe.contentWindow?.location.href !== iframe.src) {
                    setLoadError(true);
                  }
                } catch (err) {
                  // Cross-origin error means PDF might be loading properly
                  console.log("PDF preview loaded");
                }
              }}
              style={{
                minHeight: "400px",
                maxWidth: "100%",
              }}
              sandbox="allow-same-origin allow-scripts"
            />
          ) : (
            <div className="h-64 flex flex-col items-center justify-center bg-slate-100 dark:bg-[#21262d]">
              <FileText className="h-12 w-12 text-slate-400 dark:text-[#8d96a0] mb-4" />
              <p className="text-slate-600 dark:text-[#8d96a0] text-center mb-4">
                PDF preview not available in this browser
              </p>
              <p className="text-xs text-slate-500 dark:text-[#6e7681] text-center mb-4">
                The PDF cannot be previewed inline. You can open it in a new tab
                or download it.
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
          )}
        </div>
      )}

      {/* PDF Preview Thumbnail (when collapsed) */}
      {!isExpanded && (
        <div
          className="h-32 bg-slate-100 dark:bg-[#21262d] flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-[#30363d] transition-colors"
          onClick={() => setIsExpanded(true)}
        >
          <div className="text-center">
            <FileText className="h-8 w-8 text-red-500 mx-auto mb-2" />
            <p className="text-xs text-slate-600 dark:text-[#8d96a0]">
              Click to preview PDF
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
