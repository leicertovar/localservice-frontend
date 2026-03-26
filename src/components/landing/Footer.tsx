import { MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer id="contacto" className="border-t border-border bg-card">
      <div className="container mx-auto px-6 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
          <div className="sm:col-span-2 lg:col-span-1">
            <a href="/" className="flex items-center gap-2 font-body font-bold text-lg text-foreground mb-4">
              <MapPin className="h-5 w-5 text-primary" />
              LocalService
            </a>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-xs">
              Plataforma que conecta usuarios con proveedores de servicios locales verificados, de forma rápida y segura.
            </p>
          </div>

          <div>
            <h4 className="font-body font-semibold text-foreground mb-4 text-sm">Plataforma</h4>
            <ul className="space-y-3">
              {["Buscar Servicios", "Registrarse como Proveedor", "Categorías", "Preguntas Frecuentes"].map((item) => (
                <li key={item}>
                  <a href="#" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body font-semibold text-foreground mb-4 text-sm">Empresa</h4>
            <ul className="space-y-3">
              {["Sobre Nosotros", "Blog", "Términos de Uso", "Política de Privacidad"].map((item) => (
                <li key={item}>
                  <a href="#" className="font-body text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-body font-semibold text-foreground mb-4 text-sm">Contacto</h4>
            <ul className="space-y-3 font-body text-sm text-muted-foreground">
              <li>soporte@localservice.co</li>
              <li>Universidad del Valle</li>
              <li>Seccional Pacífico</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-body text-xs text-muted-foreground">
            © 2026 LocalService. Todos los derechos reservados.
          </p>
          <p className="font-body text-xs text-muted-foreground">
            Proyecto académico — Universidad del Valle, Seccional Pacífico
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
