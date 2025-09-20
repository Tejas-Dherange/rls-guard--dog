import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import Navbar from "@/components/navbar/reactive-navbar";
import { ThemeSwitcher } from "@/components/theme-switcher";

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Guard Dog",
  description: "A school management system",
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main className="min-h-screen flex flex-col">
            <Navbar />
            <div className="flex-1">
              {children}
            </div>
            
            <footer className="border-t border-border bg-muted/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <p>
                    Powered by{" "}
                    <a
                      href="https://supabase.com"
                      target="_blank"
                      className="font-medium hover:text-foreground transition-colors"
                      rel="noopener noreferrer"
                    >
                      Supabase
                    </a>
                  </p>
                  <ThemeSwitcher />
                </div>
              </div>
            </footer>
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
