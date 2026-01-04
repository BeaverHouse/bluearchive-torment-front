import Link from "next/link";
import { Github, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* 링크들 */}
          <div className="flex items-center gap-4">
            <Link
              href="https://github.com/BeaverHouse/bluearchive-torment-front"
              target="_blank"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </Link>
            <Link
              href="mailto:haulrest@gmail.com"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Email"
            >
              <Mail className="h-5 w-5" />
            </Link>
          </div>

          {/* Copyright */}
          <div className="text-xs text-muted-foreground text-center sm:text-right">
            <p>Blue Archive copyrighted by NEXON GAMES & YOSTAR</p>
            <p>2023-2025, powered by Austin</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
