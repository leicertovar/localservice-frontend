import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, MapPin } from "lucide-react";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 font-body font-bold text-lg text-foreground">
          <MapPin className="h-6 w-6 text-primary" />
          <span>LocalService</span>
        </a>

        <div className="hidden md:flex items-center gap-8">
          <a href="#servicios" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Servicios</a>
          <a href="#como-funciona" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Cómo Funciona</a>
          <a href="#proveedores" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Proveedores</a>
          <a href="#contacto" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">Contacto</a>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm">Iniciar Sesión</Button>
          <Button variant="default" size="sm">Registrarse</Button>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-foreground active:scale-95 transition-transform"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden border-t border-border bg-background animate-fade-up">
          <div className="px-6 py-4 flex flex-col gap-3">
            <a href="#servicios" className="font-body py-2 text-muted-foreground" onClick={() => setIsOpen(false)}>Servicios</a>
            <a href="#como-funciona" className="font-body py-2 text-muted-foreground" onClick={() => setIsOpen(false)}>Cómo Funciona</a>
            <a href="#proveedores" className="font-body py-2 text-muted-foreground" onClick={() => setIsOpen(false)}>Proveedores</a>
            <a href="#contacto" className="font-body py-2 text-muted-foreground" onClick={() => setIsOpen(false)}>Contacto</a>
            <div className="flex gap-3 pt-2">
              <Button variant="ghost" size="sm" className="flex-1">Iniciar Sesión</Button>
              <Button variant="default" size="sm" className="flex-1">Registrarse</Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
