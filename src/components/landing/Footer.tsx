import { Mail, ExternalLink } from "lucide-react";
import { Logo } from "@/components/brand/Logo";

const Footer = () => {
  return (
    <footer id="contacto" className="border-t border-border/50 bg-card">
      <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 lg:col-span-1">
            <a href="/" className="inline-flex items-center mb-5 hover:opacity-85 transition-opacity duration-200">
              <Logo className="h-8" />
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs mb-5">
              Plataforma que conecta usuarios con proveedores de servicios locales verificados, de forma rápida y segura.
            </p>
            <a
              href="mailto:admin@localservice.com"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <Mail className="size-4" />
              admin@localservice.com
            </a>
          </div>

          {/* Platform */}
          <div>
            <h4 className="font-bold text-foreground mb-5 text-sm tracking-tight">Plataforma</h4>
            <ul className="space-y-3">
              {[
                "Buscar Servicios",
                "Registrarse como Proveedor",
                "Categorías de Servicios",
                "Preguntas Frecuentes",
              ].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-1.5 group">
                    {item}
                    <ExternalLink className="size-3 opacity-0 group-hover:opacity-60 transition-opacity duration-200" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-bold text-foreground mb-5 text-sm tracking-tight">Empresa</h4>
            <ul className="space-y-3">
              {["Sobre Nosotros", "Blog", "Términos de Uso", "Política de Privacidad"].map(item => (
                <li key={item}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-foreground mb-5 text-sm tracking-tight">Contacto</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>admin@localservice.com</li>
              <li className="font-medium text-foreground">Universidad del Valle</li>
              <li>Seccional Pacífico</li>
              <li className="pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/8 border border-primary/15 text-primary text-xs font-semibold">
                  Proyecto Académico
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © 2026 LocalService. Todos los derechos reservados.
          </p>
          <p className="text-xs text-muted-foreground">
            Proyecto académico — Universidad del Valle, Seccional Pacífico
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
