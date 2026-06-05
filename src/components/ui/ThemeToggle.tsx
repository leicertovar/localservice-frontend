import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ThemeToggle = ({ className = "" }: { className?: string }) => {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return false;
    const stored = localStorage.getItem("theme");
    if (stored) return stored === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (dark) {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setDark(d => !d)}
      className={`h-9 w-9 rounded-xl hover:bg-muted transition-all duration-200 ease-in-out group ${className}`}
      aria-label="Cambiar tema"
    >
      {dark ? (
        <Sun className="size-4 text-slate-400 group-hover:text-primary transition-colors duration-200" />
      ) : (
        <Moon className="size-4 text-slate-400 group-hover:text-primary transition-colors duration-200" />
      )}
    </Button>
  );
};

export default ThemeToggle;
