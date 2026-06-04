import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin } from "lucide-react";
import ThemeToggle from "@/components/ui/ThemeToggle";

const NAV_LINKS = [
  { href: "#servicios",     label: "Servicios"      },
  { href: "#como-funciona", label: "Cómo Funciona"  },
  { href: "#proveedores",   label: "Características" },
  { href: "#contacto",      label: "Contacto"       },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border/60">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <a href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-8 h-8 rounded-xl btn-gradient flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
            <MapPin className="size-4 text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            Local<span className="text-primary">Service</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="px-3.5 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-150"
            >
              {label}
            </a>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden md:flex items-center gap-2">
          <ThemeToggle />
          <div className="w-px h-5 bg-border/70 mx-1" />
          <a href="/login">
            <Button variant="ghost" size="sm" className="rounded-xl text-sm px-4">
              Iniciar Sesión
            </Button>
          </a>
          <a href="/registro">
            <Button size="sm" className="rounded-xl text-sm px-4 shadow-sm glow-sm">
              Registrarse
            </Button>
          </a>
        </div>

        {/* Mobile */}
        <div className="flex md:hidden items-center gap-1">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-xl text-foreground hover:bg-muted active:scale-95 transition-all duration-150"
            aria-label="Abrir menú"
          >
            {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl animate-fade-up">
          <div className="container mx-auto px-6 py-4 flex flex-col gap-1">
            {NAV_LINKS.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                className="py-2.5 px-3 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/70 transition-all duration-150"
                onClick={() => setIsOpen(false)}
              >
                {label}
              </a>
            ))}
            <div className="flex gap-2 pt-3 mt-1 border-t border-border/50">
              <a href="/login" className="flex-1">
                <Button variant="outline" size="sm" className="w-full rounded-xl">Iniciar Sesión</Button>
              </a>
              <a href="/registro" className="flex-1">
                <Button size="sm" className="w-full rounded-xl">Registrarse</Button>
              </a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
