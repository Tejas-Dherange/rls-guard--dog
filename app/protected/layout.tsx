import { AuthButton } from "@/components/auth-button";
import { ThemeSwitcher } from "@/components/theme-switcher";
import Link from "next/link";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link 
                href="/" 
                className="text-xl font-semibold text-foreground hover:text-foreground/80 transition-colors"
              >
                Guard Dog
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>
      
      <div className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
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
  );
}
