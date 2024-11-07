import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ArrowRight, Download, LinkIcon, Shield, Upload } from "lucide-react";
import Link from "next/link";

const MainPage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 mt-12">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-white dark:bg-gray-800">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-6 text-center">
              <div className="space-y-5">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl text-gray-900 dark:text-white">
                  Share Files Easily and Securely
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                  Upload your files and share them instantly with anyone,
                  anywhere. No account required.
                </p>
              </div>
              <div className="space-x-4">
                <Button asChild>
                  <Link href="/upload">Start Sharing</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="#how-it-works">Learn More</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
        <section
          id="features"
          className="w-full py-12 md:py-24 lg:py-32 bg-gray-100 dark:bg-gray-800"
        >
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-gray-900 dark:text-white">
              Key Features
            </h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <Card className="hover:scale-105 transform transition-transform ease-in-out">
                <CardHeader className="flex flex-col items-center">
                  <Upload className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="text-xl font-bold">Easy Upload</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    Simply drag and drop your files or select them from your
                    device. No account creation required.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:scale-105 transform transition-transform ease-in-out">
                <CardHeader className="flex flex-col items-center">
                  <LinkIcon className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="text-xl font-bold">Instant Sharing</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    Get a unique link for your uploaded file instantly. Share it
                    with anyone, anywhere.
                  </p>
                </CardContent>
              </Card>
              <Card className="hover:scale-105 transform transition-transform ease-in-out">
                <CardHeader className="flex flex-col items-center">
                  <Shield className="h-8 w-8 mb-2 text-primary" />
                  <h3 className="text-xl font-bold">Secure Transfer</h3>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300">
                    Your files are encrypted during transfer and storage,
                    ensuring maximum security.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
        <section
          id="how-it-works"
          className="w-full py-12 md:py-24 lg:py-32 bg-white dark:bg-gray-900"
        >
          <div className="container mx-auto px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-center mb-8 text-gray-900 dark:text-white">
              How It Works
            </h2>
            <div className="grid gap-6 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col items-center text-center">
                <Upload className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  1. Upload Your File
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Select a file from your device or drag and drop it into the
                  upload area.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <LinkIcon className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  2. Get a Unique Link
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Once your file is uploaded, you'll receive a unique link to
                  share.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <Download className="h-12 w-12 mb-4 text-primary" />
                <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">
                  3. Share and Download
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Share the link with others. They can easily download the file
                  using the link.
                </p>
              </div>
            </div>
          </div>
        </section>
        <section
          id="get-started"
          className="w-full py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground"
        >
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Ready to Start Sharing?
                </h2>
                <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
                  Experience the easiest way to share your files securely. No
                  sign-up required!
                </p>
              </div>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/upload">
                  Start Sharing Now <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-100 dark:bg-gray-800">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          © 2024 UpFilo. All rights reserved.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-xs hover:underline underline-offset-4 text-gray-900 dark:text-white"
            href="/terms"
          >
            Terms of Service
          </Link>
          <Link
            className="text-xs hover:underline underline-offset-4 text-gray-900 dark:text-white"
            href="/privacy"
          >
            Privacy Policy
          </Link>
          <Link
            className="text-xs hover:underline underline-offset-4 text-gray-900 dark:text-white"
            href="/contact"
          >
            Contact
          </Link>
        </nav>
      </footer>
    </div>
  );
};

export default MainPage;
