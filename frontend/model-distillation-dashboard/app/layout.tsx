import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { AppHeader } from "@/components/layout/app-header";
import { Toaster } from "@/components/ui/use-toast";
import { Sidebar } from "lucide-react";
import { ThemeProvider } from "@/components/layout/theme-provider"; 
import { SidebarProvider } from "@/components/ui/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ACL Distill Studio - Adaptive Curriculum Learning Research",
  description: "Research-grade curriculum-centric distillation and adaptive curriculum learning platform.",
  keywords: ["ACL", "CCM", "curriculum learning", "distillation", "TensorBoard", "research"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="h-screen flex flex-col bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 overflow-hidden">
        <ThemeProvider>
          <SidebarProvider>
            <div className="flex h-screen w-full overflow-hidden">
              <AppSidebar />
              <div className="flex flex-col flex-1 w-full overflow-hidden">
                <AppHeader />
                <main className="flex-1 overflow-y-auto overflow-x-hidden">
                  <div className="w-full max-w-7xl mx-auto">
                    {children}
                  </div>
                </main>
              </div>
            </div>
          </SidebarProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
